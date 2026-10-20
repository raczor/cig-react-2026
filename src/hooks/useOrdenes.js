import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { obtenerOrdenes, crearOrden, cambiarEstado } from "../services/ordenes.js";

// Hooks de datos con TanStack Query. Reemplazan a useFetch: el estado de
// carga, el error, la cancelacion y el reintento los maneja la libreria.

// La clave identifica estos datos en el cache. Todo el que use la misma
// clave comparte la misma lista y la misma peticion.
const CLAVE_ORDENES = ["ordenes"];

// LECTURA: queryFn recibe signal; si el componente se desmonta, la peticion se cancela.
export function useOrdenes() {
  return useQuery({
    queryKey: CLAVE_ORDENES,
    queryFn: ({ signal }) => obtenerOrdenes({ signal }),
  });
}

// ALTA: cuando el servidor responde, la orden creada entra al cache.
// setQueryData evita volver a pedir la lista completa.
export function useCrearOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearOrden,
    onSuccess: (creada) => {
      queryClient.setQueryData(CLAVE_ORDENES, (anteriores = []) => [...anteriores, creada]);
    },
  });
}

// COMPLETAR: PATCH del estado; en el cache se reemplaza solo esa orden.
export function useCompletarOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cambiarEstado(id, "completada"),
    onSuccess: (actualizada) => {
      queryClient.setQueryData(CLAVE_ORDENES, (anteriores = []) =>
        anteriores.map((o) => (o.id === actualizada.id ? actualizada : o))
      );
    },
  });
}
