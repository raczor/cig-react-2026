import { createAuthClient } from "@neondatabase/neon-js/auth";

// Login is on when the project has a Neon Auth URL. Without it (local development, tests)
// the app runs without a login page, matching the API, which is open in that case.
const url = import.meta.env.VITE_NEON_AUTH_URL;

export const authEnabled = Boolean(url);
export const authClient = authEnabled ? createAuthClient(url) : null;

// Optional shared demo account. When both variables are set, the login page offers a
// one-click entry so a visitor can look around without creating an account. The values
// ship in the browser bundle, so this must be a throwaway account with no private data.
const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;

export const demoCredentials =
    authEnabled && demoEmail && demoPassword ? { email: demoEmail, password: demoPassword } : null;
