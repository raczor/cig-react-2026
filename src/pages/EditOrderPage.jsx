import { useLocation, useNavigate, useParams } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import OrderForm from "../components/OrderForm.jsx";
import Alert from "../components/ui/Alert.jsx";
import { useOrder, useUpdateOrder } from "../hooks/useOrders.js";

function EditOrderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const hasHistory = useLocation().key !== "default";
    const { data: order, isPending, error } = useOrder(id);
    const update = useUpdateOrder(id);

    // The form only yields the editable fields. The status is not sent: changing it is the
    // board's job, and the server keeps the stored one.
    async function save(data) {
        await update.mutateAsync(data);
        // Go back to the detail page instead of pushing a new entry, so its "Volver" button
        // does not land on this form again.
        if (hasHistory) navigate(-1);
        else navigate(`/orders/${id}`, { replace: true });
    }

    if (isPending) {
        return <Alert>Cargando orden...</Alert>;
    }
    if (error) {
        return <Alert variant="error">No se pudo cargar: {error.message}</Alert>;
    }

    return (
        <Panel title={`Editar ${order.code}`}>
            <OrderForm initial={order} onSubmit={save} submitLabel="Guardar cambios" />
        </Panel>
    );
}

export default EditOrderPage;
