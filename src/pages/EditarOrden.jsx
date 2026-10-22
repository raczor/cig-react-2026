import { useNavigate, useParams } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import FormularioOrden from "../components/FormularioOrden.jsx";
import { useOrden, useActualizarOrden } from "../hooks/useOrdenes.js";

// Vista de la ruta /ordenes/:id/editar
function EditarOrden() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: orden, isPending, error } = useOrden(id);
    const actualizar = useActualizarOrden(id);

    // PUT reemplaza la orden completa: datos trae los campos del formulario
    // mas id, codigo y estado, que venian en inicial.
    async function guardar(datos) {
        await actualizar.mutateAsync(datos);
        navigate(`/ordenes/${id}`); // de vuelta al detalle
    }

    // useState(inicial) solo lee inicial al MONTAR el formulario.
    // Por eso el formulario se dibuja cuando la orden ya llego.
    if (isPending) {
        return <p className="mensaje mensaje--cargando">Cargando orden...</p>;
    }
    if (error) {
        return <p className="mensaje mensaje--error">No se pudo cargar: {error.message}</p>;
    }

    return (
        <Panel titulo={`Editar ${orden.codigo}`}>
            <FormularioOrden inicial={orden} onGuardar={guardar} textoBoton="Guardar cambios" />
        </Panel>
    );
}

export default EditarOrden;
