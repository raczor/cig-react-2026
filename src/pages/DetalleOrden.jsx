import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import TarjetaOrden from "../components/TarjetaOrden.jsx";
import { useOrden, useEliminarOrden } from "../hooks/useOrdenes.js";

// Vista de la ruta /ordenes/:id
function DetalleOrden() {
    // Todo lo que sale de la URL es texto: /ordenes/8 entrega { id: "8" }.
    const { id } = useParams();
    const navigate = useNavigate();
    // key "default" = primera pagina de la sesion: no hay a donde volver con -1.
    const hayHistorial = useLocation().key !== "default";
    const [aviso, setAviso] = useState(null);

    // Si el id de la URL cambia, la consulta se repite.
    const { data: orden, isPending, error } = useOrden(id);
    const eliminarMutacion = useEliminarOrden();

    // Los hooks van ANTES de cualquier return temprano.
    if (isPending) {
        return <p className="mensaje mensaje--cargando">Cargando orden...</p>;
    }

    if (error) {
        // /ordenes/99: la ruta SI coincide; el 404 lo responde la API.
        return (
            <div className="mensaje mensaje--error" role="alert">
                <p>No se pudo cargar la orden {id}: {error.message}</p>
                <Link to="/">Volver al listado</Link>
            </div>
        );
    }

    async function eliminar() {
        const confirmado = window.confirm(
            `¿Seguro que quieres eliminar ${orden.codigo}? No se puede deshacer.`
        );
        if (!confirmado) return; // Cancelar: no sale ninguna peticion

        setAviso(null);
        try {
            await eliminarMutacion.mutateAsync(orden.id); // DELETE /ordenes/8
            // replace: Atras no regresa a una orden que ya no existe.
            navigate("/", { replace: true });
        } catch (err) {
            setAviso(`No se pudo eliminar: ${err.message}`);
        }
    }

    return (
        <Panel titulo={`Orden ${orden.codigo}`}>
            {aviso && <p className="mensaje mensaje--error" role="alert">{aviso}</p>}

            {/* La misma tarjeta del listado, abierta con todos los campos */}
            <TarjetaOrden orden={orden} abierta />

            <div className="tarjeta__acciones">
                {/* Atras (-1) conserva los filtros del listado, que viven en la URL */}
                <Link
                    className="boton boton--secundario"
                    to="/"
                    onClick={(evento) => {
                        if (!hayHistorial) return;
                        evento.preventDefault();
                        navigate(-1);
                    }}
                >
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
