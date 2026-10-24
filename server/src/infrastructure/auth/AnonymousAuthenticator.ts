import type { AuthUser, Authenticator } from "../../application/Authenticator.js";

// A Null Object: "login is off" is an Authenticator like any other, so the HTTP layer never has to
// ask whether there is one. Only local development and tests use it; production refuses to start without real auth.
export class AnonymousAuthenticator implements Authenticator {
    async authenticate(): Promise<AuthUser> {
        return { id: "anonymous" };
    }
}
