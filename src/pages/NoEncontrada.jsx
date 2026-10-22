import { Link } from "react-router-dom";

// Ruta comodin (*): ninguna otra ruta reconocio la URL.
// No hay peticion a la API: lo detecta React Router.
function NoEncontrada() {
    return (
        <div className="mensaje mensaje--vacio">
            <p>La pagina solicitada no existe.</p>
            <Link to="/">Volver al listado</Link>
        </div>
    );
}

export default NoEncontrada;
