import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import TarjetaOrden from "../components/TarjetaOrden.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { obtenerOrden, eliminarOrden } from "../services/ordenes.js";

// Vista de la ruta /ordenes/:id
function DetalleOrden() {
    // Todo lo que sale de la URL es texto: /ordenes/8 entrega { id: "8" }.
    const { id } = useParams();
    const navigate = useNavigate();
    const [aviso, setAviso] = useState(null);

    // El mismo hook del listado, ahora con obtenerOrden y el id.
    // Si el id de la URL cambia, la peticion se repite.
    const { datos: orden, cargando, error } = useFetch(obtenerOrden, id);

    // Los hooks van ANTES de cualquier return temprano.
    if (cargando) {
        return <p className="mensaje mensaje--cargando">Cargando orden...</p>;
    }

    if (error) {
        // /ordenes/99: la ruta SI coincide; el 404 lo responde la API.
        return (
            <div className="mensaje mensaje--error">
                <p>No se pudo cargar la orden {id}: {error}</p>
                <Link to="/">Volver al listado</Link>
            </div>
        );
    }

    async function eliminar() {
        const confirmado = window.confirm(
            `Se encuentra completamente seguro de eliminar ${orden.codigo}? No se puede deshacer.`
        );
        if (!confirmado) return; // Cancelar: no sale ninguna peticion

        setAviso(null);
        try {
            await eliminarOrden(orden.id); // DELETE /ordenes/8
            // replace: Atras no regresa a una orden que ya no existe.
            navigate("/", { replace: true });
        } catch (err) {
            setAviso(`No se pudo eliminar: ${err.message}`);
        }
    }

    return (
        <Panel titulo={`Orden ${orden.codigo}`}>
            {aviso && <p className="mensaje mensaje--error">{aviso}</p>}

            {/* La misma tarjeta del listado, abierta con todos los campos */}
            <TarjetaOrden orden={orden} abierta />

            <div className="tarjeta__acciones">
                <Link className="boton boton--secundario" to="/">
                    Volver
                </Link>
                <Link className="boton" to={`/ordenes/${orden.id}/editar`}>
                    Editar
                </Link>
                <button className="boton boton--peligro" type="button" onClick={eliminar}>
                    Eliminar
                </button>
            </div>
        </Panel>
    );
}

export default DetalleOrden;
