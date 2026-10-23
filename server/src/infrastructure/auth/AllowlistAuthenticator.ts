import { AuthError, type AuthUser, type Authenticator } from "../../application/Authenticator.js";

// A Decorator: it adds "only these emails" on top of any other Authenticator without changing it.
// Open for extension (more policies can be stacked the same way), closed for modification.
export class AllowlistAuthenticator implements Authenticator {
    private readonly allowed: ReadonlySet<string>;

    constructor(
        private readonly inner: Authenticator,
        allowedEmails: Iterable<string>
    ) {
        this.allowed = new Set([...allowedEmails].map((email) => email.trim().toLowerCase()).filter(Boolean));
    }

    async authenticate(authorizationHeader: string | undefined): Promise<AuthUser> {
        const user = await this.inner.authenticate(authorizationHeader);
        const email = user.email?.toLowerCase();
        if (!email || !this.allowed.has(email)) {
            throw new AuthError(403, "Tu cuenta no tiene acceso a esta aplicación.", `email not on the allowlist: ${email ?? "(none)"}`);
        }
        return user;
    }
}
