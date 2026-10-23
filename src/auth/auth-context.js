import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

// { enabled, user, loading, signIn, signUp, signOut }
// `enabled` is false when the project has no Neon Auth URL: there is no login then.
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
    return context;
}
