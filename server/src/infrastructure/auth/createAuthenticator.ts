import { createRemoteJWKSet, type JWTVerifyGetKey } from "jose";
import type { Authenticator } from "../../application/Authenticator.js";
import { AllowlistAuthenticator } from "./AllowlistAuthenticator.js";
import { AnonymousAuthenticator } from "./AnonymousAuthenticator.js";
import { JwtAuthenticator } from "./JwtAuthenticator.js";

export interface AuthConfig {
    /** The project's Neon Auth URL. Without it login is off (development only). */
    baseUrl?: string | undefined;
    /** Overrides where the public keys are fetched from (default: <baseUrl>/.well-known/jwks.json). */
    jwksUrl?: string | undefined;
    /** Overrides the expected token issuer (default: the origin of the base URL). */
    issuer?: string | undefined;
    /** When set, only these emails get in. */
    allowedEmails?: readonly string[] | undefined;
    /** On Vercel or NODE_ENV=production: refuse to run without real authentication. */
    production: boolean;
    /** A ready key set; tests pass a local one instead of fetching. */
    keys?: JWTVerifyGetKey | undefined;
}

// A Factory: reads the configuration and assembles the right Authenticator, stacking the
// optional allowlist decorator on top of the JWT one.
export function createAuthenticator(config: AuthConfig): Authenticator {
    if (!config.baseUrl) {
        if (config.production) {
            throw new Error("NEON_AUTH_BASE_URL is required in production: refusing to start with an open API.");
        }
        return new AnonymousAuthenticator();
    }

    const baseUrl = config.baseUrl.replace(/\/$/, "");
    const jwt = new JwtAuthenticator({
        issuer: config.issuer || new URL(baseUrl).origin,
        keys: config.keys ?? createRemoteJWKSet(new URL(config.jwksUrl ?? `${baseUrl}/.well-known/jwks.json`)),
    });

    return config.allowedEmails ? new AllowlistAuthenticator(jwt, config.allowedEmails) : jwt;
}
