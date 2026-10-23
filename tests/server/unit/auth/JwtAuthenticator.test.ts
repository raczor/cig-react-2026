// @vitest-environment node
import { SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import { AuthError } from "../../../../server/src/application/Authenticator.js";
import { JwtAuthenticator } from "../../../../server/src/infrastructure/auth/JwtAuthenticator.js";
import { ISSUER, bearer, createTokenIssuer, type TokenIssuer } from "../../../support/tokens.js";

let tokens: TokenIssuer;
let authenticator: JwtAuthenticator;

beforeAll(async () => {
    tokens = await createTokenIssuer();
    authenticator = new JwtAuthenticator({ issuer: ISSUER, keys: tokens.keys });
});

const header = (token: string) => bearer(token).authorization;

async function failureOf(promise: Promise<unknown>): Promise<AuthError> {
    const error = await promise.then(
        () => undefined,
        (e: unknown) => e
    );
    expect(error).toBeInstanceOf(AuthError);
    return error as AuthError;
}

describe("JwtAuthenticator", () => {
    it("identifies the user from a valid token, with the email lowercased", async () => {
        const user = await authenticator.authenticate(header(await tokens.sign({ sub: "u-9", email: "Ana@Example.COM" })));
        expect(user).toEqual({ id: "u-9", email: "ana@example.com" });
    });

    it("accepts a token without an email claim", async () => {
        const user = await authenticator.authenticate(header(await tokens.sign({ email: undefined })));
        expect(user.email).toBeUndefined();
    });

    it("rejects a signed token that names no user", async () => {
        const noSubject = await new SignJWT({ email: "ana@example.com" })
            .setProtectedHeader({ alg: "EdDSA", kid: "test-key" })
            .setIssuer(ISSUER)
            .setExpirationTime("15m")
            .sign(tokens.privateKeyForTests);

        const error = await failureOf(authenticator.authenticate(header(noSubject)));
        expect(error.statusCode).toBe(401);
        expect(error.detail).toMatch(/no subject/);
    });

    it("accepts the Bearer scheme in any case", async () => {
        const token = await tokens.sign();
        expect((await authenticator.authenticate(`bearer ${token}`)).id).toBe("user-1");
    });

    it("answers 401 and says why in the detail when there is no header", async () => {
        const error = await failureOf(authenticator.authenticate(undefined));
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Inicia sesión para continuar.");
        expect(error.detail).toMatch(/no bearer token/);
    });

    it.each([["another scheme", "Basic abc"], ["only the scheme", "Bearer"], ["empty", ""]])("answers 401 for %s", async (_name, value) => {
        expect((await failureOf(authenticator.authenticate(value))).statusCode).toBe(401);
    });

    it("keeps the reason out of the message the client sees", async () => {
        const error = await failureOf(authenticator.authenticate(header(await tokens.sign({ issuer: "https://evil.example.com" }))));

        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Tu sesión no es válida o expiró. Inicia sesión de nuevo.");
        expect(error.detail).toMatch(/iss/);
    });

    it.each([
        ["expired", () => tokens.sign({ expires: "-1m" })],
        ["signed with another key", () => tokens.signWithUnknownKey()],
    ] as const)("rejects a token that is %s", async (_name, make) => {
        expect((await failureOf(authenticator.authenticate(header(await make())))).statusCode).toBe(401);
    });
});
