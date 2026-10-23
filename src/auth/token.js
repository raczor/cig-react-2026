import { authClient } from "./client.js";

// The API layer must not depend on React, so the session is reached through these two functions.

// The JWT the API expects as `Authorization: Bearer <jwt>`, or null when there is none.
export async function getAccessToken() {
    return authClient ? authClient.getJWTToken() : null;
}

let unauthorizedHandler = () => {};

// AuthProvider registers what should happen when the API says the session is not valid.
export function setUnauthorizedHandler(handler) {
    unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
    unauthorizedHandler();
}
