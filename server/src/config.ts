import type { AuthConfig } from "./infrastructure/auth/createAuthenticator.js";
import type { DatabaseConfig } from "./infrastructure/database/createDatabase.js";

export interface AppConfig {
    database: DatabaseConfig;
    auth: AuthConfig;
    corsOrigin: string[] | true;
}

// The only place that reads environment variables. Everything else receives plain values,
// so tests can build any configuration without touching process.env.
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
    return {
        database: {
            databaseUrl: env.DATABASE_URL || undefined,
            pgliteDir: env.PGLITE_DIR || undefined,
        },
        auth: {
            baseUrl: env.NEON_AUTH_BASE_URL || undefined,
            jwksUrl: env.NEON_AUTH_JWKS_URL || undefined,
            issuer: env.NEON_AUTH_ISSUER || undefined,
            allowedEmails: parseList(env.AUTH_ALLOWED_EMAILS),
            production: Boolean(env.VERCEL) || env.NODE_ENV === "production",
        },
        corsOrigin: parseList(env.CORS_ORIGIN) ?? true,
    };
}

// "a@x.com, b@x.com" -> ["a@x.com", "b@x.com"]; blank or missing -> undefined (not configured).
function parseList(value: string | undefined): string[] | undefined {
    const items = (value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
}
