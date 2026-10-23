import { createAuthClient } from "@neondatabase/neon-js/auth";

// Login is on when the project has a Neon Auth URL. Without it (local development, tests)
// the app runs without a login page, matching the API, which is open in that case.
const url = import.meta.env.VITE_NEON_AUTH_URL;

export const authEnabled = Boolean(url);
export const authClient = authEnabled ? createAuthClient(url) : null;
