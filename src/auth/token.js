import { authClient } from "./client.js";

// The API layer must not depend on React, so the session is reached through these functions.

// A JWT is three dot-separated parts; the opaque session id the service also uses has none.
const looksLikeJwt = (token) => typeof token === "string" && token.split(".").length === 3;

// Bypasses the SDK's in-memory session cache (an internal header of @neondatabase/auth).
const FORCE_FETCH = { fetchOptions: { headers: { "X-Force-Fetch": "true" } } };

// The JWT the API expects as `Authorization: Bearer <jwt>`, or null when there is none.
//
// With this SDK the JWT is session.token: it takes the `set-auth-jwt` header of the session
// response and puts it there. getSession() is cached in memory until shortly before the JWT
// expires, so calling it on every request is cheap. Other method names on this client are not
// missing functions: any unknown name becomes a request to a URL that does not exist
// (getJWTToken() and token() both ended up as 404 or empty answers that way).
export async function getAccessToken() {
    if (!authClient) return null;

    try {
        let { data } = await authClient.getSession();
        // A session cached right after signing in can still hold the opaque id: ask the service again.
        if (data?.session && !looksLikeJwt(data.session.token)) {
            ({ data } = await authClient.getSession(FORCE_FETCH));
        }

        const token = data?.session?.token;
        if (looksLikeJwt(token)) return token;
        if (data?.session) console.warn("Neon Auth session has no JWT: the API will not accept this request.");
        return null;
    } catch {
        throw new Error("No se pudo comprobar tu sesión. Revisa tu conexión e intenta de nuevo.");
    }
}

let unauthorizedHandler = () => {};

// AuthProvider registers what should happen when the API says the session is not valid.
export function setUnauthorizedHandler(handler) {
    unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
    unauthorizedHandler();
}
