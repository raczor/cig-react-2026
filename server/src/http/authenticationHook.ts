import type { onRequestAsyncHookHandler } from "fastify";
import type { AuthUser, Authenticator } from "../application/Authenticator.js";

declare module "fastify" {
    interface FastifyRequest {
        /** Set by the authentication hook on every protected route. */
        user?: AuthUser;
    }
}

// Runs before the route handler: an AuthError thrown here ends the request with 401 or 403.
export function authenticationHook(authenticator: Authenticator): onRequestAsyncHookHandler {
    return async (request) => {
        request.user = await authenticator.authenticate(request.headers.authorization);
    };
}
