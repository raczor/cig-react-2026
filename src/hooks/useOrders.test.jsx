import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ordersQuery, useChangeStatus, useCreateOrder, useDeleteOrder, useOrder } from "./useOrders.js";
import * as api from "../services/orders.js";
import { makeOrder } from "../test/fixtures.js";

vi.mock("../services/orders.js");

function setup(initialList) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    if (initialList) queryClient.setQueryData(ordersQuery.queryKey, initialList);
    const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    return { queryClient, wrapper };
}

const list = [makeOrder({ id: 1, code: "OS-2026-001" }), makeOrder({ id: 2, code: "OS-2026-002" })];
const cachedList = (queryClient) => queryClient.getQueryData(ordersQuery.queryKey);

beforeEach(() => {
    vi.resetAllMocks();
    api.getOrders.mockResolvedValue(list);
});

describe("useChangeStatus", () => {
    it("moves the order optimistically, before the server answers", async () => {
        let resolve;
        api.changeStatus.mockReturnValue(new Promise((r) => (resolve = r)));
        const { queryClient, wrapper } = setup(list);
        const { result } = renderHook(() => useChangeStatus(), { wrapper });

        act(() => result.current.changeStatus(1, "completed"));

        await waitFor(() => expect(cachedList(queryClient)[0].status).toBe("completed"));
        expect(cachedList(queryClient)[1].status).toBe("pending");

        await act(async () => resolve(makeOrder({ id: 1, status: "completed" })));
    });

    it("rolls back only that order and reports a notice when the PATCH fails", async () => {
        api.changeStatus.mockRejectedValue(new Error("boom"));
        const { queryClient, wrapper } = setup(list);
        const { result } = renderHook(() => useChangeStatus(), { wrapper });

        act(() => result.current.changeStatus(1, "completed"));

        await waitFor(() => expect(result.current.notice).toContain("OS-2026-001"));
        expect(result.current.notice).toContain("boom");
        expect(cachedList(queryClient).find((o) => o.id === 1).status).toBe("pending");
    });

    it("does not undo a concurrent successful move when another one fails", async () => {
        api.changeStatus.mockImplementation((id) =>
            id === 1 ? Promise.reject(new Error("boom")) : Promise.resolve(makeOrder({ id, status: "completed" }))
        );
        const { queryClient, wrapper } = setup(list);
        const { result } = renderHook(() => useChangeStatus(), { wrapper });

        act(() => {
            result.current.changeStatus(1, "completed");
            result.current.changeStatus(2, "completed");
        });

        await waitFor(() => expect(result.current.notice).not.toBeNull());
        await waitFor(() => expect(cachedList(queryClient).find((o) => o.id === 2).status).toBe("completed"));
        expect(cachedList(queryClient).find((o) => o.id === 1).status).toBe("pending");
    });

    it("sends the target status to the API", async () => {
        api.changeStatus.mockResolvedValue(makeOrder({ id: 2, status: "cancelled" }));
        const { wrapper } = setup(list);
        const { result } = renderHook(() => useChangeStatus(), { wrapper });

        act(() => result.current.changeStatus(2, "cancelled"));

        await waitFor(() => expect(api.changeStatus).toHaveBeenCalledWith(2, "cancelled"));
    });
});

describe("useCreateOrder", () => {
    it("appends the created order to a cached list", async () => {
        api.createOrder.mockResolvedValue(makeOrder({ id: 3, code: "OS-2026-003" }));
        const { queryClient, wrapper } = setup(list);
        const { result } = renderHook(() => useCreateOrder(), { wrapper });

        await act(() => result.current.mutateAsync({ client: "X" }));

        expect(cachedList(queryClient).map((o) => o.id)).toEqual([1, 2, 3]);
    });

    it("does not invent a one-order list when the list was never loaded", async () => {
        api.createOrder.mockResolvedValue(makeOrder({ id: 3 }));
        const { queryClient, wrapper } = setup();
        const { result } = renderHook(() => useCreateOrder(), { wrapper });

        await act(() => result.current.mutateAsync({ client: "X" }));

        expect(cachedList(queryClient)).toBeUndefined();
    });
});

describe("useDeleteOrder", () => {
    it("removes the order from the list and drops its detail cache (string id key)", async () => {
        api.deleteOrder.mockResolvedValue({});
        const { queryClient, wrapper } = setup(list);
        queryClient.setQueryData(["orders", "1"], list[0]);
        const { result } = renderHook(() => useDeleteOrder(), { wrapper });

        await act(() => result.current.mutateAsync(1));

        expect(cachedList(queryClient).map((o) => o.id)).toEqual([2]);
        expect(queryClient.getQueryData(["orders", "1"])).toBeUndefined();
    });
});

describe("useOrder", () => {
    it("fetches one order by id", async () => {
        api.getOrder.mockResolvedValue(list[1]);
        const { wrapper } = setup();
        const { result } = renderHook(() => useOrder("2"), { wrapper });

        await waitFor(() => expect(result.current.data).toEqual(list[1]));
        expect(api.getOrder).toHaveBeenCalledWith("2", expect.anything());
    });
});
