import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../server/src/config.js";

describe("loadConfig", () => {
    it("has sensible defaults for local development: in-process database, no auth, any origin", () => {
        expect(loadConfig({})).toEqual({
            database: { databaseUrl: undefined, pgliteDir: undefined },
            auth: { baseUrl: undefined, jwksUrl: undefined, issuer: undefined, allowedEmails: undefined, production: false },
            corsOrigin: true,
        });
    });

    it("reads the database and auth settings", () => {
        const config = loadConfig({
            DATABASE_URL: "postgres://db",
            PGLITE_DIR: ".data",
            NEON_AUTH_BASE_URL: "https://auth.example.com/db/auth",
            NEON_AUTH_JWKS_URL: "https://auth.example.com/keys",
            NEON_AUTH_ISSUER: "https://issuer.example.com",
        });

        expect(config.database).toEqual({ databaseUrl: "postgres://db", pgliteDir: ".data" });
        expect(config.auth).toMatchObject({
            baseUrl: "https://auth.example.com/db/auth",
            jwksUrl: "https://auth.example.com/keys",
            issuer: "https://issuer.example.com",
        });
    });

    it("treats blank variables as not set", () => {
        const config = loadConfig({ DATABASE_URL: "", NEON_AUTH_BASE_URL: "", AUTH_ALLOWED_EMAILS: "  ", CORS_ORIGIN: "" });

        expect(config.database.databaseUrl).toBeUndefined();
        expect(config.auth.baseUrl).toBeUndefined();
        expect(config.auth.allowedEmails).toBeUndefined();
        expect(config.corsOrigin).toBe(true);
    });

    it("splits comma separated lists and drops empty items", () => {
        const config = loadConfig({ AUTH_ALLOWED_EMAILS: "ana@example.com, boss@example.com,, ", CORS_ORIGIN: "https://a.example.com,https://b.example.com" });

        expect(config.auth.allowedEmails).toEqual(["ana@example.com", "boss@example.com"]);
        expect(config.corsOrigin).toEqual(["https://a.example.com", "https://b.example.com"]);
    });

    it.each([
        [{ VERCEL: "1" }, true],
        [{ NODE_ENV: "production" }, true],
        [{ NODE_ENV: "development" }, false],
        [{}, false],
    ])("production mode for %j is %s", (env, expected) => {
        expect(loadConfig(env).auth.production).toBe(expected);
    });
});
