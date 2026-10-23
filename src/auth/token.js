import { authClient } from "./client.js";

// The API layer must not depend on React, so the session is reached through these functions.

const REFRESH_MARGIN_MS = 60_000;

// The JWT is valid for about 15 minutes. Fetching it costs a round trip to the auth service,
// so it is reused until shortly before it expires.
let cached = null; // { token, expiresAt }

export function clearTokenCache() {
    cached = null;
}

// The `exp` claim in milliseconds, or 0 when the token cannot be read (then it is not cached).
function expiryOf(token) {
    try {
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(payload)).exp * 1000;
    } catch {
        return 0;
    }
}

// The JWT the API expects as `Authorization: Bearer <jwt>`, or null when there is no session.
// authClient.token() is the Better Auth JWT plugin (GET /token). Any other method name on this
// client is not a missing function: it becomes a request to a URL that does not exist.
export async function getAccessToken() {
    if (!authClient) return null;
    if (cached && cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) return cached.token;

    let result;
    try {
        result = await authClient.token();
    } catch {
        throw new Error("No se pudo comprobar tu sesión. Revisa tu conexión e intenta de nuevo.");
    }

    const token = result?.data?.token ?? null;
    cached = token ? { token, expiresAt: expiryOf(token) } : null;
    return token;
}

let unauthorizedHandler = () => {};

// AuthProvider registers what should happen when the API says the session is not valid.
export function setUnauthorizedHandler(handler) {
    unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
    unauthorizedHandler();
}
