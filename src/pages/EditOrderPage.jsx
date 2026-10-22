import { useLocation, useNavigate, useParams } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import OrderForm from "../components/OrderForm.jsx";
import { useOrder, useUpdateOrder } from "../hooks/useOrders.js";

function EditOrderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const hasHistory = useLocation().key !== "default";
    const { data: order, isPending, error } = useOrder(id);
    const update = useUpdateOrder(id);

    // PUT replaces the whole order: the form data carries the fields from `initial`
    // (including id, code and status).
    async function save(data) {
        await update.mutateAsync(data);
        // Go back to the detail page instead of pushing a new entry, so its "Volver" button
        // does not land on this form again.
        if (hasHistory) navigate(-1);
        else navigate(`/orders/${id}`, { replace: true });
    }

    if (isPending) {
        return <p className="message message--loading">Cargando orden...</p>;
    }
    if (error) {
        return <p className="message message--error" role="alert">No se pudo cargar: {error.message}</p>;
    }

    return (
        <Panel title={`Editar ${order.code}`}>
            <OrderForm initial={order} onSubmit={save} submitLabel="Guardar cambios" />
        </Panel>
    );
}

export default EditOrderPage;
