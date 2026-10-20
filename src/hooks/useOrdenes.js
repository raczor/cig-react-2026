import { useState } from "react";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { obtenerOrdenes, crearOrden, cambiarEstado } from "../services/ordenes.js";

// Hooks de datos con TanStack Query. Reemplazan a useFetch: el estado de
// carga, el error, la cancelacion y el reintento los maneja la libreria.

// queryOptions junta la clave y la funcion en un solo lugar. La clave
// identifica la lista en el cache; quien use esta consulta comparte los datos.
// obtenerOrdenes va directo: recibe { signal } y cancela si nadie espera la respuesta.
export const ordenesQuery = queryOptions({
  queryKey: ["ordenes"],
  queryFn: obtenerOrdenes,
});

// LECTURA
export const useOrdenes = () => useQuery(ordenesQuery);

// Aplica un cambio a la lista guardada en el cache, sin volver a pedirla.
function useCambiarLista() {
  const queryClient = useQueryClient();
  return (cambio) =>
    queryClient.setQueryData(ordenesQuery.queryKey, (anteriores = []) => cambio(anteriores));
}

// ALTA: cuando el servidor responde, la orden creada entra al cache.
export function useCrearOrden() {
  const cambiarLista = useCambiarLista();
  return useMutation({
    mutationFn: crearOrden,
    onSuccess: (creada) => cambiarLista((lista) => [...lista, creada]),
  });
}

// COMPLETAR, version optimista: la etiqueta cambia antes de que responda
// el servidor. Si el PATCH falla, se deshace solo esa orden y se le pide
// la lista al servidor para quedar con su version.
// Devuelve { completar, aviso }: aviso es el mensaje del ultimo fallo.
export function useCompletarOrden() {
  const queryClient = useQueryClient();
  // El estado de useMutation solo refleja la ULTIMA llamada: si se completan dos
  // ordenes y falla la primera, completar.isError queda en false. onError si
  // corre en cada llamada, por eso el aviso se guarda aqui.
  const [aviso, setAviso] = useState(null);
  const cambiarLista = useCambiarLista();
  const reemplazar = (orden) =>
    cambiarLista((lista) => lista.map((o) => (o.id === orden.id ? orden : o)));

  const mutation = useMutation({
    mutationFn: (id) => cambiarEstado(id, "completada"),

    // 1. Antes del PATCH: se cancela cualquier GET en curso (si llegara despues,
    //    borraria el cambio), se guarda ESA orden como estaba y se marca.
    //    Guardar solo esa orden evita deshacer otra que se completo al mismo tiempo.
    onMutate: async (id) => {
      setAviso(null);
      await queryClient.cancelQueries({ queryKey: ordenesQuery.queryKey });
      const anterior = queryClient.getQueryData(ordenesQuery.queryKey).find((o) => o.id === id);
      reemplazar({ ...anterior, estado: "completada" });
      return { anterior }; // llega a onError como tercer argumento
    },

    // 2a. Fallo, en dos pasos.
    onError: (error, _id, { anterior }) => {
      // Primero se deshace esa orden: al instante y sin depender de la red.
      reemplazar(anterior);
      setAviso(`No se pudo completar la orden ${anterior.codigo}: ${error.message}`);
      // Despues se pide la lista. Si el servidor responde, su version
      // reemplaza a la nuestra; si tambien falla, queda la del paso anterior.
      queryClient.invalidateQueries({ queryKey: ordenesQuery.queryKey });
    },

    // 2b. Exito: se guarda la orden tal como la devolvio el servidor.
    onSuccess: reemplazar,
  });

  return { completar: mutation.mutate, aviso };
}
