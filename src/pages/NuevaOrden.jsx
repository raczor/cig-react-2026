import { useNavigate } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import FormularioOrden from "../components/FormularioOrden.jsx";
import { crearOrden } from "../services/ordenes.js";

// Vista de la ruta /ordenes/nueva.
function NuevaOrden() {
    const navigate = useNavigate();

    // El formulario espera esta promesa: deshabilita el boton mientras viaja
    // y, si falla, muestra el error y conserva lo escrito.
    async function guardar(datos) {
        const creada = await crearOrden(datos); // POST y PATCH del codigo
        // Solo se llega aqui si el guardado tuvo exito.
        navigate(`/ordenes/${creada.id}`); // al detalle de la orden nueva
    }

    return (
        <Panel titulo="Registrar orden">
            <FormularioOrden onGuardar={guardar} textoBoton="Registrar orden" />
        </Panel>
    );
}

export default NuevaOrden;
