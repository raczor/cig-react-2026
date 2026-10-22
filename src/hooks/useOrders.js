import { useState } from "react";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  changeStatus,
} from "../services/orders.js";

export const ordersQuery = queryOptions({
  queryKey: ["orders"],
  queryFn: getOrders,
});

// The id from the URL is a string, so every caller must use the string form
// for the cache key to match.
export const orderQuery = (id) =>
  queryOptions({
    queryKey: ["orders", id],
    queryFn: ({ signal }) => getOrder(id, { signal }),
  });

export const useOrders = () => useQuery(ordersQuery);
export const useOrder = (id) => useQuery(orderQuery(id));

// Applies a change to the cached list without refetching it.
function useUpdateList() {
  const queryClient = useQueryClient();
  return (change) =>
    queryClient.setQueryData(
      ordersQuery.queryKey,
      // Returning undefined leaves the cache untouched when the list was never
      // loaded (e.g. the app was opened on /orders/new), instead of inventing a partial one.
      (previous) => previous && change(previous)
    );
}

export function useCreateOrder() {
  const updateList = useUpdateList();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (created) => updateList((list) => [...list, created]),
  });
}

export function useUpdateOrder(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateOrder(id, data),
    onSuccess: (order) => {
      queryClient.setQueryData(orderQuery(id).queryKey, order);
      queryClient.setQueryData(ordersQuery.queryKey, (list) =>
        list?.map((o) => (String(o.id) === String(id) ? order : o))
      );
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: (_response, id) => {
      queryClient.removeQueries({ queryKey: orderQuery(String(id)).queryKey });
      queryClient.setQueryData(ordersQuery.queryKey, (list) => list?.filter((o) => o.id !== id));
    },
  });
}

// Optimistic: the order moves to the new status before the server answers.
// If the PATCH fails, only that order is rolled back (so a concurrent change
// to another order is not undone) and the list is refetched.
// Returns { changeStatus(id, status), notice }, where notice is the message of the latest failure.
export function useChangeStatus() {
  const queryClient = useQueryClient();
  // useMutation only reflects the LAST call, so the failure message is kept
  // here: onError runs for every call.
  const [notice, setNotice] = useState(null);
  const updateList = useUpdateList();
  const replace = (order) =>
    updateList((list) => list.map((o) => (o.id === order.id ? order : o)));

  const mutation = useMutation({
    mutationFn: ({ id, status }) => changeStatus(id, status),

    onMutate: async ({ id, status }) => {
      setNotice(null);
      // An in-flight GET that lands after the optimistic update would erase it.
      await queryClient.cancelQueries({ queryKey: ordersQuery.queryKey });
      const previous = queryClient.getQueryData(ordersQuery.queryKey).find((o) => o.id === id);
      replace({ ...previous, status });
      return { previous };
    },

    onError: (error, _variables, { previous }) => {
      replace(previous);
      setNotice(`No se pudo mover la orden ${previous.code}: ${error.message}`);
      queryClient.invalidateQueries({ queryKey: ordersQuery.queryKey });
    },

    onSuccess: replace,
  });

  return { changeStatus: (id, status) => mutation.mutate({ id, status }), notice };
}
