import { beforeEach, describe, expect, it, vi } from "vitest";

// The fake client has no token() or getJWTToken(): calling a method the real client lacks fails the test.
vi.mock("./client.js", () => ({ authClient: { getSession: vi.fn() } }));

const JWT = "eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiJ1MSJ9.signature";
const OPAQUE = "k3j2h4g5f6d7s8a9";
const sessionWith = (token) => ({ data: { user: { id: "u1" }, session: { token } } });

describe("access token", () => {
    let authClient, getAccessToken;

    beforeEach(async () => {
        vi.resetModules();
        ({ authClient } = await import("./client.js"));
        ({ getAccessToken } = await import("./token.js"));
        authClient.getSession.mockReset();
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("is the session's JWT", async () => {
        authClient.getSession.mockResolvedValue(sessionWith(JWT));

        expect(await getAccessToken()).toBe(JWT);
        expect(authClient.getSession).toHaveBeenCalledTimes(1);
    });

    it("is null when nobody is signed in", async () => {
        authClient.getSession.mockResolvedValue({ data: null });

        expect(await getAccessToken()).toBeNull();
    });

    it("asks the service again when the cached session still holds the opaque id", async () => {
        authClient.getSession.mockResolvedValueOnce(sessionWith(OPAQUE)).mockResolvedValueOnce(sessionWith(JWT));

        expect(await getAccessToken()).toBe(JWT);
        expect(authClient.getSession).toHaveBeenCalledTimes(2);
        expect(authClient.getSession.mock.calls[1][0].fetchOptions.headers["X-Force-Fetch"]).toBe("true");
    });

    it("never sends the opaque id as a bearer token, and says so in the console", async () => {
        authClient.getSession.mockResolvedValue(sessionWith(OPAQUE));

        expect(await getAccessToken()).toBeNull();
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("no JWT"));
    });

    it("explains in Spanish when the auth service cannot be reached", async () => {
        authClient.getSession.mockRejectedValue(new TypeError("Failed to fetch"));

        await expect(getAccessToken()).rejects.toThrow("No se pudo comprobar tu sesión");
    });
});
