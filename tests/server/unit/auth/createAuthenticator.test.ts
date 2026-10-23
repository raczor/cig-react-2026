// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { AllowlistAuthenticator } from "../../../../server/src/infrastructure/auth/AllowlistAuthenticator.js";
import { AnonymousAuthenticator } from "../../../../server/src/infrastructure/auth/AnonymousAuthenticator.js";
import { createAuthenticator } from "../../../../server/src/infrastructure/auth/createAuthenticator.js";
import { JwtAuthenticator } from "../../../../server/src/infrastructure/auth/JwtAuthenticator.js";
import { AUTH_BASE_URL, createTokenIssuer, type TokenIssuer } from "../../../support/tokens.js";

let tokens: TokenIssuer;
beforeAll(async () => {
    tokens = await createTokenIssuer();
});

describe("createAuthenticator", () => {
    it("is open in development when there is no base URL, so no Neon account is needed locally", async () => {
        const authenticator = createAuthenticator({ production: false });

        expect(authenticator).toBeInstanceOf(AnonymousAuthenticator);
        await expect(authenticator.authenticate(undefined)).resolves.toEqual({ id: "anonymous" });
    });

    it("refuses to start without a base URL in production instead of serving an open API", () => {
        expect(() => createAuthenticator({ production: true })).toThrow(/NEON_AUTH_BASE_URL/);
    });

    it("an empty base URL counts as missing", () => {
        expect(() => createAuthenticator({ baseUrl: "", production: true })).toThrow(/NEON_AUTH_BASE_URL/);
    });

    it("verifies JWTs when there is a base URL", () => {
        expect(createAuthenticator({ baseUrl: AUTH_BASE_URL, keys: tokens.keys, production: true })).toBeInstanceOf(JwtAuthenticator);
    });

    it("stacks the allowlist decorator on top when emails are configured", () => {
        const authenticator = createAuthenticator({ baseUrl: AUTH_BASE_URL, keys: tokens.keys, allowedEmails: ["ana@example.com"], production: true });
        expect(authenticator).toBeInstanceOf(AllowlistAuthenticator);
    });

    it("does not add the allowlist when none is configured", () => {
        expect(createAuthenticator({ baseUrl: AUTH_BASE_URL, keys: tokens.keys, allowedEmails: undefined, production: true })).not.toBeInstanceOf(AllowlistAuthenticator);
    });

    it("expects the origin of the base URL as issuer by default, and honors an override", async () => {
        const byDefault = createAuthenticator({ baseUrl: `${AUTH_BASE_URL}/`, keys: tokens.keys, production: true });
        const overridden = createAuthenticator({ baseUrl: AUTH_BASE_URL, issuer: "https://auth.example.com", keys: tokens.keys, production: true });

        const defaultToken = `Bearer ${await tokens.sign()}`;
        await expect(byDefault.authenticate(defaultToken)).resolves.toMatchObject({ id: "user-1" });
        await expect(overridden.authenticate(defaultToken)).rejects.toMatchObject({ statusCode: 401 });
        await expect(overridden.authenticate(`Bearer ${await tokens.sign({ issuer: "https://auth.example.com" })}`)).resolves.toMatchObject({ id: "user-1" });
    });
});
