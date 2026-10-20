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
// el servidor y, si el PATCH falla, la lista vuelve a como estaba.
export function useCompletarOrden() {
  const queryClient = useQueryClient();
  const cambiarLista = useCambiarLista();
  const reemplazar = (actualizada) =>
    cambiarLista((lista) => lista.map((o) => (o.id === actualizada.id ? actualizada : o)));

  return useMutation({
    mutationFn: (id) => cambiarEstado(id, "completada"),

    // 1. Antes del PATCH: se cancela cualquier GET en curso (si llegara despues,
    //    borraria el cambio), se guarda una foto y se marca la orden.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ordenesQuery.queryKey });
      const respaldo = queryClient.getQueryData(ordenesQuery.queryKey);
      cambiarLista((lista) =>
        lista.map((o) => (o.id === id ? { ...o, estado: "completada" } : o))
      );
      return { respaldo }; // llega a onError como tercer argumento
    },

    // 2a. Fallo: se restaura la foto. El mensaje queda en completar.error.
    onError: (_error, _id, { respaldo }) => {
      queryClient.setQueryData(ordenesQuery.queryKey, respaldo);
    },

    // 2b. Exito: se guarda la orden tal como la devolvio el servidor.
    onSuccess: reemplazar,
  });
}
