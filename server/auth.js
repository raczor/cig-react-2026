import { createRemoteJWKSet, jwtVerify } from "jose";

// Verifies the JWTs that Neon Auth (managed Better Auth) issues to signed-in users.
// The browser sends one as `Authorization: Bearer <jwt>`; it is EdDSA-signed and short-lived.
//
// Configuration (all optional locally):
//   NEON_AUTH_BASE_URL     the project's Neon Auth URL; the issuer is its origin.
//   NEON_AUTH_JWKS_URL     overrides where the public keys are fetched from.
//   NEON_AUTH_ISSUER       overrides the expected token issuer (default: the origin of the base URL).
//   AUTH_ALLOWED_EMAILS    comma-separated emails; when set, only those users get in.
//
// Without NEON_AUTH_BASE_URL authentication is off, so local development needs no Neon account.
// On Vercel or with NODE_ENV=production it is required: the app refuses to start without it
// instead of silently serving an open API.
export function createAuth({
    baseUrl = process.env.NEON_AUTH_BASE_URL,
    jwksUrl = process.env.NEON_AUTH_JWKS_URL,
    issuerOverride = process.env.NEON_AUTH_ISSUER,
    allowedEmails = process.env.AUTH_ALLOWED_EMAILS,
    keys, // a ready key set; tests pass a local one instead of fetching
    production = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production",
} = {}) {
    if (!baseUrl) {
        if (production) throw new Error("NEON_AUTH_BASE_URL is required in production: refusing to start with an open API.");
        return null;
    }

    const issuer = issuerOverride || new URL(baseUrl).origin;
    const jwks = keys ?? createRemoteJWKSet(new URL(jwksUrl ?? `${baseUrl.replace(/\/$/, "")}/.well-known/jwks.json`));
    const allowed = allowedEmails
        ? new Set(allowedEmails.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean))
        : null;

    // Resolves to { id, email } for a valid token; throws an error with a statusCode otherwise.
    return async function authenticate(header) {
        const token = /^Bearer\s+(.+)$/i.exec(header ?? "")?.[1];
        if (!token) throw httpError(401, "Inicia sesión para continuar.");

        let payload;
        try {
            ({ payload } = await jwtVerify(token, jwks, { issuer }));
        } catch (error) {
            // `detail` is for the server log only; the client gets the generic message.
            throw httpError(401, "Tu sesión no es válida o expiró. Inicia sesión de nuevo.", `${error.code ?? error.name}: ${error.message}`);
        }

        const email = typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
        if (allowed && !(email && allowed.has(email))) throw httpError(403, "Tu cuenta no tiene acceso a esta aplicación.");

        return { id: String(payload.sub), email };
    };
}

function httpError(statusCode, message, detail) {
    return Object.assign(new Error(message), { statusCode, detail });
}
