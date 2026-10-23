import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./client.js", () => ({ authClient: { token: vi.fn() } }));

// A JWT is header.payload.signature; only the payload's exp matters here.
function jwtExpiringIn(ms) {
    const payload = btoa(JSON.stringify({ exp: Math.floor((Date.now() + ms) / 1000) })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `header.${payload}.signature`;
}

describe("access token", () => {
    let authClient, getAccessToken, clearTokenCache;

    beforeEach(async () => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.resetModules();
        ({ authClient } = await import("./client.js"));
        ({ getAccessToken, clearTokenCache } = await import("./token.js"));
        authClient.token.mockReset();
    });

    afterEach(() => vi.useRealTimers());

    it("asks the JWT plugin for the token (authClient.token)", async () => {
        const jwt = jwtExpiringIn(15 * 60_000);
        authClient.token.mockResolvedValue({ data: { token: jwt } });

        expect(await getAccessToken()).toBe(jwt);
        expect(authClient.token).toHaveBeenCalledTimes(1);
    });

    it("reuses the token instead of calling the auth service for every request", async () => {
        authClient.token.mockResolvedValue({ data: { token: jwtExpiringIn(15 * 60_000) } });

        await getAccessToken();
        await getAccessToken();
        await getAccessToken();

        expect(authClient.token).toHaveBeenCalledTimes(1);
    });

    it("fetches a new one shortly before the old one expires", async () => {
        authClient.token
            .mockResolvedValueOnce({ data: { token: jwtExpiringIn(90_000) } })
            .mockResolvedValueOnce({ data: { token: jwtExpiringIn(15 * 60_000) } });

        const first = await getAccessToken();
        vi.setSystemTime(Date.now() + 45_000); // 45 s left: inside the 60 s refresh margin
        const second = await getAccessToken();

        expect(second).not.toBe(first);
        expect(authClient.token).toHaveBeenCalledTimes(2);
    });

    it("returns null when there is no session, and does not cache that", async () => {
        authClient.token.mockResolvedValue({ data: null, error: { status: 401 } });

        expect(await getAccessToken()).toBeNull();
        await getAccessToken();
        expect(authClient.token).toHaveBeenCalledTimes(2);
    });

    it("forgets the token when the user changes", async () => {
        authClient.token.mockResolvedValue({ data: { token: jwtExpiringIn(15 * 60_000) } });

        await getAccessToken();
        clearTokenCache();
        await getAccessToken();

        expect(authClient.token).toHaveBeenCalledTimes(2);
    });

    it("does not cache a token whose expiry cannot be read", async () => {
        authClient.token.mockResolvedValue({ data: { token: "opaque-session-id" } });

        await getAccessToken();
        await getAccessToken();

        expect(authClient.token).toHaveBeenCalledTimes(2);
    });

    it("explains in Spanish when the auth service cannot be reached", async () => {
        authClient.token.mockRejectedValue(new TypeError("Failed to fetch"));

        await expect(getAccessToken()).rejects.toThrow("No se pudo comprobar tu sesión");
    });
});
