import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <div className="message message--empty">
            <p>La página solicitada no existe.</p>
            <Link to="/">Volver al listado</Link>
        </div>
    );
}

export default NotFoundPage;
