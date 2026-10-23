export interface AuthUser {
    readonly id: string;
    readonly email?: string | undefined;
}

// Turns the Authorization header of a request into a user, or fails with an AuthError.
// One method, so every implementation (and every decorator around one) is easy to swap.
export interface Authenticator {
    authenticate(authorizationHeader: string | undefined): Promise<AuthUser>;
}

// 401: we do not know who you are. 403: we know, and you are not allowed.
export class AuthError extends Error {
    constructor(
        readonly statusCode: 401 | 403,
        message: string,
        /** Why, for the server log only: it is never sent to the client. */
        readonly detail?: string
    ) {
        super(message);
        this.name = "AuthError";
    }
}
