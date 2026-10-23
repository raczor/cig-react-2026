import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient, authEnabled } from "./client.js";
import { NETWORK_MESSAGE, authErrorMessage } from "./errors.js";
import { setUnauthorizedHandler } from "./token.js";
import { AuthContext } from "./auth-context.js";

// Runs an auth call and turns both failure styles into an Error with a Spanish message:
// the SDK returns { error } for rejected credentials and throws when the service is unreachable.
async function attempt(request) {
    let result;
    try {
        result = await request();
    } catch {
        throw new Error(NETWORK_MESSAGE);
    }
    if (result?.error) throw new Error(authErrorMessage(result.error));
}

// Holds the signed-in user for the whole app.
// Cached orders are dropped whenever the user changes so nobody sees someone else's data.
function AuthProvider({ children }) {
    const queryClient = useQueryClient();
    const [state, setState] = useState({ user: null, loading: authEnabled });

    const refresh = useCallback(async () => {
        const { data } = await authClient.getSession();
        const user = data?.user ?? null;
        setState({ user, loading: false });
        return user;
    }, []);

    useEffect(() => {
        if (!authEnabled) return;
        refresh().catch(() => setState({ user: null, loading: false }));
        // The API rejected the token (expired or revoked): go back to the login page.
        // The cookie session is ended too: left alone, getSession would keep reporting a user
        // the API does not accept, and sign-in would loop back here.
        setUnauthorizedHandler(() => {
            authClient.signOut().catch(() => {});
            queryClient.clear();
            setState({ user: null, loading: false });
        });
    }, [refresh, queryClient]);

    const value = useMemo(
        () => ({
            enabled: authEnabled,
            ...state,

            // Each of these throws an Error with a Spanish message when the request fails.
            async signIn(email, password) {
                await attempt(() => authClient.signIn.email({ email, password }));
                queryClient.clear();
                await refresh();
            },

            // Resolves to true when the new account is signed in right away; false when the
            // project requires verifying the email first.
            async signUp(email, password) {
                await attempt(() => authClient.signUp.email({ name: email.split("@")[0], email, password }));
                queryClient.clear();
                return Boolean(await refresh());
            },

            async signOut() {
                await authClient.signOut();
                queryClient.clear();
                setState({ user: null, loading: false });
            },
        }),
        [state, refresh, queryClient]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
