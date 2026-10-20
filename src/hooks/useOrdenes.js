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

// COMPLETAR: PATCH del estado; en el cache se reemplaza solo esa orden.
export function useCompletarOrden() {
  const cambiarLista = useCambiarLista();
  return useMutation({
    mutationFn: (id) => cambiarEstado(id, "completada"),
    onSuccess: (actualizada) =>
      cambiarLista((lista) => lista.map((o) => (o.id === actualizada.id ? actualizada : o))),
  });
}
