import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair, type JWTVerifyGetKey } from "jose";

export const AUTH_BASE_URL = "https://ep-test.neonauth.example.com/neondb/auth";
export const ISSUER = new URL(AUTH_BASE_URL).origin;

export interface TokenIssuer {
    /** The public keys to hand to the code under test (what the remote key set is in production). */
    keys: JWTVerifyGetKey;
    sign(options?: SignOptions): Promise<string>;
    /** A token signed with a key the server does not know. */
    signWithUnknownKey(options?: SignOptions): Promise<string>;
    /** The private key the keys above verify, for tests that must build unusual tokens by hand. */
    privateKeyForTests: SigningKey;
}

type SigningKey = Parameters<SignJWT["sign"]>[0];

interface SignOptions {
    issuer?: string;
    /** `undefined` leaves the email claim out entirely. */
    email?: string | undefined;
    sub?: string;
    expires?: string;
}

// Signs real EdDSA JWTs with a key pair generated for the test run, like Neon Auth does,
// so verification is exercised for real without a network or an account.
export async function createTokenIssuer(): Promise<TokenIssuer> {
    const known = await generateKeyPair("EdDSA", { extractable: true });
    const unknown = await generateKeyPair("EdDSA");
    const keys = createLocalJWKSet({ keys: [{ ...(await exportJWK(known.publicKey)), kid: "test-key", alg: "EdDSA" }] });

    const signWith = (key: SigningKey) => (options: SignOptions = {}) => {
        const { issuer = ISSUER, sub = "user-1", expires = "15m" } = options;
        const email = "email" in options ? options.email : "ana@example.com";
        return new SignJWT(email === undefined ? {} : { email })
            .setProtectedHeader({ alg: "EdDSA", kid: "test-key" })
            .setSubject(sub)
            .setIssuer(issuer)
            .setIssuedAt()
            .setExpirationTime(expires)
            .sign(key);
    };

    return { keys, sign: signWith(known.privateKey), signWithUnknownKey: signWith(unknown.privateKey), privateKeyForTests: known.privateKey };
}

export const bearer = (token: string) => ({ authorization: `Bearer ${token}` });
