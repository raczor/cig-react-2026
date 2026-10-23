// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { AppOptions } from "../../../server/src/app.js";
import { createAuthenticator } from "../../../server/src/infrastructure/auth/createAuthenticator.js";
import type { Database } from "../../../server/src/infrastructure/database/Database.js";
import { validInput } from "../../support/fixtures.js";
import { AUTH_BASE_URL, bearer, createTokenIssuer, type TokenIssuer } from "../../support/tokens.js";
import { buildTestApp, createTestApp, type TestApp } from "../../support/testApp.js";

let tokens: TokenIssuer;
let base: TestApp; // owns the database; its own app is open and unused here
let db: Database;
let app: FastifyInstance;

// An app over the shared database with real JWT verification (and optional extras) switched on.
async function appWithLogin(options: { allowedEmails?: string[]; issuer?: string; logger?: AppOptions["logger"] } = {}) {
    const { logger, ...auth } = options;
    return buildTestApp(db, {
        authenticator: createAuthenticator({ baseUrl: AUTH_BASE_URL, keys: tokens.keys, production: false, ...auth }),
        ...(logger === undefined ? {} : { logger }),
    });
}

beforeAll(async () => {
    tokens = await createTokenIssuer();
    base = await createTestApp();
    db = base.db;
});

beforeEach(async () => {
    await base.reset();
    await app?.close();
    app = await appWithLogin();
});

afterAll(async () => {
    await app.close();
    await base.close();
});

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

interface CallOptions {
    headers?: Record<string, string>;
    payload?: Record<string, unknown>;
}
const call = (method: Method, url: string, { headers, payload }: CallOptions = {}) =>
    app.inject({ method, url, headers, payload });

describe("with login on", () => {
    it("keeps /api/health public", async () => {
        expect((await call("GET", "/api/health")).statusCode).toBe(200);
    });

    it.each<[Method, string]>([
        ["GET", "/api/orders"],
        ["GET", "/api/orders/1"],
        ["POST", "/api/orders"],
        ["PUT", "/api/orders/1"],
        ["PATCH", "/api/orders/1"],
        ["DELETE", "/api/orders/1"],
    ])("%s %s answers 401 without a token", async (method, url) => {
        const payload = method === "POST" || method === "PUT" ? { ...validInput } : method === "PATCH" ? { status: "completed" } : undefined;
        const response = await call(method, url, payload ? { payload } : {});

        expect(response.statusCode).toBe(401);
        expect(response.json().message).toBe("Inicia sesión para continuar.");
    });

    it("does not change any data when the request is rejected", async () => {
        await call("DELETE", "/api/orders/1");
        await call("PATCH", "/api/orders/2", { payload: { status: "cancelled" } });
        await call("POST", "/api/orders", { payload: { ...validInput } });

        const orders = (await call("GET", "/api/orders", { headers: bearer(await tokens.sign()) })).json();
        expect(orders).toHaveLength(24);
        expect(orders.find((o: { id: number }) => o.id === 2).status).toBe("in_progress");
    });

    it("lets a valid token read and write", async () => {
        const headers = bearer(await tokens.sign());

        expect((await call("GET", "/api/orders", { headers })).statusCode).toBe(200);
        const created = await call("POST", "/api/orders", { headers, payload: { ...validInput } });
        expect(created.statusCode).toBe(201);
        expect((await call("DELETE", `/api/orders/${created.json().id}`, { headers })).statusCode).toBe(204);
    });

    it("still validates the body for an authenticated user", async () => {
        const response = await call("POST", "/api/orders", { headers: bearer(await tokens.sign()), payload: { ...validInput, client: "" } });
        expect(response.statusCode).toBe(400);
    });

    it("answers the browser preflight without a token (it never carries one)", async () => {
        const response = await call("OPTIONS", "/api/orders/1", {
            headers: {
                origin: "http://localhost:5173",
                "access-control-request-method": "DELETE",
                "access-control-request-headers": "authorization,content-type",
            },
        });
        expect(response.statusCode).toBe(204);
        expect(response.headers["access-control-allow-headers"]).toContain("authorization");
    });

    describe("rejects tokens that are not valid", () => {
        it.each<[string, () => Promise<string>]>([
            ["expired", () => tokens.sign({ expires: "-1m" })],
            ["from another issuer", () => tokens.sign({ issuer: "https://evil.example.com" })],
            ["signed with a different key", () => tokens.signWithUnknownKey()],
            ["garbage", async () => "not.a.jwt"],
        ])("%s", async (_name, makeToken) => {
            const response = await call("GET", "/api/orders", { headers: bearer(await makeToken()) });

            expect(response.statusCode).toBe(401);
            expect(response.json().message).toBe("Tu sesión no es válida o expiró. Inicia sesión de nuevo.");
        });

        it.each([["only the scheme", "Bearer"], ["another scheme", "Basic dXNlcjpwYXNz"], ["a bare token", "abc"]])(
            "an Authorization header with %s",
            async (_name, authorization) => {
                expect((await call("GET", "/api/orders", { headers: { authorization } })).statusCode).toBe(401);
            }
        );

        it("an unsigned token (alg none)", async () => {
            const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
            const body = Buffer.from(JSON.stringify({ sub: "x", iss: new URL(AUTH_BASE_URL).origin, exp: Math.floor(Date.now() / 1000) + 600 })).toString("base64url");
            expect((await call("GET", "/api/orders", { headers: bearer(`${header}.${body}.`) })).statusCode).toBe(401);
        });
    });
});

describe("diagnosing rejected tokens", () => {
    async function loggedApp() {
        const lines: Array<Record<string, unknown>> = [];
        const stream = { write: (line: string) => void lines.push(JSON.parse(line) as Record<string, unknown>) };
        const logged = await appWithLogin({ logger: { level: "warn", stream } });
        return { logged, lines };
    }

    it("logs why a token was refused without telling the client", async () => {
        const { logged, lines } = await loggedApp();

        const response = await logged.inject({ method: "GET", url: "/api/orders", headers: bearer(await tokens.sign({ issuer: "https://other.example.com" })) });
        await logged.close();

        expect(response.statusCode).toBe(401);
        expect(response.body).not.toContain("iss");
        expect(lines.find((l) => l.msg === "token rejected")?.reason).toMatch(/ERR_JWT_CLAIM_VALIDATION_FAILED.*iss/);
    });

    it("also logs a request that carried no token at all", async () => {
        const { logged, lines } = await loggedApp();

        await logged.inject({ method: "GET", url: "/api/orders" });
        await logged.close();

        expect(lines.find((l) => l.msg === "token rejected")?.reason).toMatch(/no bearer token/);
    });

    it("accepts the issuer from configuration when it differs from the base URL's origin", async () => {
        await app.close();
        app = await appWithLogin({ issuer: "https://auth.example.com" });

        const ok = await call("GET", "/api/orders", { headers: bearer(await tokens.sign({ issuer: "https://auth.example.com" })) });
        const wrong = await call("GET", "/api/orders", { headers: bearer(await tokens.sign()) });

        expect(ok.statusCode).toBe(200);
        expect(wrong.statusCode).toBe(401);
    });
});

describe("email allowlist", () => {
    it("lets listed users in, ignoring case and spaces in the list", async () => {
        await app.close();
        app = await appWithLogin({ allowedEmails: [" Ana@Example.com ", "boss@example.com"] });

        const response = await call("GET", "/api/orders", { headers: bearer(await tokens.sign({ email: "ANA@example.com" })) });
        expect(response.statusCode).toBe(200);
    });

    it("answers 403 to a valid user who is not listed, and to a token without an email", async () => {
        await app.close();
        app = await appWithLogin({ allowedEmails: ["boss@example.com"] });

        const stranger = await call("GET", "/api/orders", { headers: bearer(await tokens.sign({ email: "stranger@example.com" })) });
        expect(stranger.statusCode).toBe(403);
        expect(stranger.json().message).toBe("Tu cuenta no tiene acceso a esta aplicación.");

        const noEmail = await call("GET", "/api/orders", { headers: bearer(await tokens.sign({ email: undefined })) });
        expect(noEmail.statusCode).toBe(403);
    });

    it("is not applied when no list is configured", async () => {
        const response = await call("GET", "/api/orders", { headers: bearer(await tokens.sign({ email: "anyone@example.com" })) });
        expect(response.statusCode).toBe(200);
    });
});
