import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../auth/token.js", () => ({ getAccessToken: vi.fn(), notifyUnauthorized: vi.fn() }));

function jsonResponse(body, status = 200) {
    return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
}

describe("orders service with a session", () => {
    let fetchMock, token, orders;

    beforeEach(async () => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        vi.stubEnv("VITE_API_URL", "http://api.test");
        vi.resetModules();
        token = await import("../auth/token.js");
        token.getAccessToken.mockReset();
        token.notifyUnauthorized.mockReset();
        orders = await import("./orders.js");
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it("sends the bearer token on reads", async () => {
        token.getAccessToken.mockResolvedValue("jwt-123");
        fetchMock.mockReturnValue(jsonResponse([]));

        await orders.getOrders();

        expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: "Bearer jwt-123" });
    });

    it("sends the token together with the JSON content type on writes", async () => {
        token.getAccessToken.mockResolvedValue("jwt-123");
        fetchMock.mockReturnValue(jsonResponse({ id: 1 }));

        await orders.createOrder({ client: "X" });

        expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: "Bearer jwt-123", "Content-Type": "application/json" });
    });

    it("sends no Authorization header when there is no session", async () => {
        token.getAccessToken.mockResolvedValue(null);
        fetchMock.mockReturnValue(jsonResponse([]));

        await orders.getOrders();

        expect(fetchMock.mock.calls[0][1].headers).toBeUndefined();
    });

    it("on 401 tells the auth layer and throws the API's Spanish message", async () => {
        token.getAccessToken.mockResolvedValue("old-jwt");
        fetchMock.mockReturnValue(jsonResponse({ message: "Tu sesión no es válida o expiró. Inicia sesión de nuevo." }, 401));

        await expect(orders.getOrders()).rejects.toThrow("Tu sesión no es válida o expiró. Inicia sesión de nuevo.");
        expect(token.notifyUnauthorized).toHaveBeenCalledTimes(1);
    });

    it("on 403 throws the API's message without signing the user out", async () => {
        token.getAccessToken.mockResolvedValue("jwt-123");
        fetchMock.mockReturnValue(jsonResponse({ message: "Tu cuenta no tiene acceso a esta aplicación." }, 403));

        await expect(orders.getOrders()).rejects.toThrow("Tu cuenta no tiene acceso a esta aplicación.");
        expect(token.notifyUnauthorized).not.toHaveBeenCalled();
    });

    it("keeps the generic message for other errors, ignoring any body", async () => {
        token.getAccessToken.mockResolvedValue("jwt-123");
        fetchMock.mockReturnValue(jsonResponse({ message: "internal detail" }, 500));

        await expect(orders.getOrders()).rejects.toThrow("El servidor respondió 500");
        expect(token.notifyUnauthorized).not.toHaveBeenCalled();
    });

    it("survives a 401 whose body is not JSON", async () => {
        token.getAccessToken.mockResolvedValue("jwt");
        fetchMock.mockReturnValue(Promise.resolve({ ok: false, status: 401, json: () => Promise.reject(new SyntaxError("x")) }));

        await expect(orders.getOrders()).rejects.toThrow("El servidor respondió 401");
        expect(token.notifyUnauthorized).toHaveBeenCalledTimes(1);
    });
});
