import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body, status = 200) {
    return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
}

describe("orders service", () => {
    let fetchMock;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it("getOrders uses VITE_API_URL and sends no body or headers on a GET", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        fetchMock.mockReturnValue(jsonResponse([]));
        const { getOrders } = await import("./orders.js");

        await getOrders();

        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("http://api.test/orders");
        expect(options.headers).toBeUndefined();
        expect(options.body).toBeUndefined();
    });

    it("createOrder is a single POST: the server assigns the code and the status", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        fetchMock.mockReturnValue(jsonResponse({ id: 25, code: "OS-2026-025", status: "pending" }));
        const { createOrder } = await import("./orders.js");

        const created = await createOrder({ client: "X" });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("http://api.test/orders");
        expect(options.method).toBe("POST");
        expect(options.headers["Content-Type"]).toBe("application/json");
        expect(JSON.parse(options.body)).toEqual({ client: "X" });
        expect(created.code).toBe("OS-2026-025");
    });

    it("deleteOrder accepts 204 No Content without trying to parse a body", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        const json = vi.fn(() => Promise.reject(new SyntaxError("Unexpected end of JSON input")));
        fetchMock.mockReturnValue(Promise.resolve({ ok: true, status: 204, json }));
        const { deleteOrder } = await import("./orders.js");

        await expect(deleteOrder(7)).resolves.toBeNull();
        expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/orders/7");
        expect(json).not.toHaveBeenCalled();
    });

    it("changeStatus PATCHes only the status", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        fetchMock.mockReturnValue(jsonResponse({ id: 3, status: "completed" }));
        const { changeStatus } = await import("./orders.js");

        await changeStatus(3, "completed");

        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("http://api.test/orders/3");
        expect(JSON.parse(options.body)).toEqual({ status: "completed" });
    });

    it("turns an HTTP error status into a thrown Error", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        fetchMock.mockReturnValue(jsonResponse({}, 404));
        const { getOrder } = await import("./orders.js");

        await expect(getOrder(99)).rejects.toThrow("El servidor respondió 404");
    });

    it("fails with a clear message when VITE_API_URL is empty", async () => {
        vi.stubEnv("VITE_API_URL", "");
        const { getOrders } = await import("./orders.js");

        await expect(getOrders()).rejects.toThrow("VITE_API_URL");
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
