import { Link } from "react-router-dom";
import Alert from "../components/ui/Alert.jsx";

function NotFoundPage() {
    return (
        <Alert>
            <p className="mb-2">La página solicitada no existe.</p>
            <Link to="/" className="text-brand-700 hover:underline">
                Volver al tablero
            </Link>
        </Alert>
    );
}

export default NotFoundPage;
