import { describe, expect, it } from "vitest";
import { AuthError, type AuthUser, type Authenticator } from "../../../../server/src/application/Authenticator.js";
import { AllowlistAuthenticator } from "../../../../server/src/infrastructure/auth/AllowlistAuthenticator.js";

// The decorator is tested against a stub of what it decorates: it needs no real authentication.
const stub = (user: AuthUser): Authenticator => ({ authenticate: async () => user });
const failing: Authenticator = {
    authenticate: async () => {
        throw new AuthError(401, "no");
    },
};

describe("AllowlistAuthenticator", () => {
    it("passes a listed user through unchanged", async () => {
        const user = { id: "u1", email: "ana@example.com" };
        expect(await new AllowlistAuthenticator(stub(user), ["ana@example.com"]).authenticate("h")).toBe(user);
    });

    it("ignores case and surrounding spaces, in the list and in the token", async () => {
        const decorated = new AllowlistAuthenticator(stub({ id: "u1", email: "ANA@Example.com" }), ["  ana@EXAMPLE.com "]);
        await expect(decorated.authenticate("h")).resolves.toMatchObject({ id: "u1" });
    });

    it("answers 403 to a user who is not listed", async () => {
        const decorated = new AllowlistAuthenticator(stub({ id: "u1", email: "stranger@example.com" }), ["ana@example.com"]);

        await expect(decorated.authenticate("h")).rejects.toMatchObject({ statusCode: 403, message: "Tu cuenta no tiene acceso a esta aplicación." });
    });

    it("answers 403 to a user without an email", async () => {
        await expect(new AllowlistAuthenticator(stub({ id: "u1" }), ["ana@example.com"]).authenticate("h")).rejects.toMatchObject({ statusCode: 403 });
    });

    it("an empty list lets nobody in", async () => {
        await expect(new AllowlistAuthenticator(stub({ id: "u1", email: "ana@example.com" }), []).authenticate("h")).rejects.toMatchObject({ statusCode: 403 });
    });

    it("lets the wrapped authenticator's own failure through untouched", async () => {
        await expect(new AllowlistAuthenticator(failing, ["ana@example.com"]).authenticate("h")).rejects.toMatchObject({ statusCode: 401, message: "no" });
    });

    it("passes the Authorization header on to the wrapped authenticator", async () => {
        let seen: string | undefined;
        const spy: Authenticator = { authenticate: async (header) => ((seen = header), { id: "u1", email: "ana@example.com" }) };

        await new AllowlistAuthenticator(spy, ["ana@example.com"]).authenticate("Bearer abc");

        expect(seen).toBe("Bearer abc");
    });
});
