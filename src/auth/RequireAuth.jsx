import { Navigate, Outlet, useLocation } from "react-router-dom";
import Alert from "../components/ui/Alert.jsx";
import { useAuth } from "./auth-context.js";

// Renders the nested routes only for a signed-in user (or when login is off).
function RequireAuth() {
    const { enabled, user, loading } = useAuth();
    const location = useLocation();

    if (!enabled) return <Outlet />;
    if (loading) {
        return (
            <div className="p-6">
                <Alert>Cargando...</Alert>
            </div>
        );
    }
    // `from` brings the user back to the page they asked for after signing in.
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    return <Outlet />;
}

export default RequireAuth;
