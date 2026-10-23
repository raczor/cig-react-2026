import { jwtVerify, type JWTVerifyGetKey } from "jose";
import { AuthError, type AuthUser, type Authenticator } from "../../application/Authenticator.js";

export interface JwtAuthenticatorOptions {
    /** The `iss` claim tokens must carry. */
    issuer: string;
    /** Where the public keys come from: a remote key set in production, a local one in tests. */
    keys: JWTVerifyGetKey;
}

// Verifies the JWTs Neon Auth (managed Better Auth) issues: `Authorization: Bearer <jwt>`,
// EdDSA signed and short lived. Signature, issuer and expiry are checked; nothing else.
export class JwtAuthenticator implements Authenticator {
    constructor(private readonly options: JwtAuthenticatorOptions) {}

    async authenticate(authorizationHeader: string | undefined): Promise<AuthUser> {
        const token = /^Bearer\s+(.+)$/i.exec(authorizationHeader ?? "")?.[1];
        if (!token) {
            throw new AuthError(401, "Inicia sesión para continuar.", "no bearer token in the Authorization header");
        }

        try {
            const { payload } = await jwtVerify(token, this.options.keys, { issuer: this.options.issuer });
            if (!payload.sub) throw new Error("the token has no subject (sub) claim");
            return {
                id: payload.sub,
                email: typeof payload.email === "string" ? payload.email.toLowerCase() : undefined,
            };
        } catch (error) {
            const reason = error instanceof Error ? `${(error as { code?: string }).code ?? error.name}: ${error.message}` : String(error);
            throw new AuthError(401, "Tu sesión no es válida o expiró. Inicia sesión de nuevo.", reason);
        }
    }
}
