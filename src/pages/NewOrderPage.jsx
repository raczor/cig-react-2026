import { useLocation, useNavigate } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import OrderForm from "../components/OrderForm.jsx";
import { useCreateOrder } from "../hooks/useOrders.js";

function NewOrderPage() {
    const navigate = useNavigate();
    // location.key is "default" on the first page of the session: nothing to go back to.
    const hasHistory = useLocation().key !== "default";
    const create = useCreateOrder();

    function cancel() {
        if (hasHistory) navigate(-1);
        else navigate("/", { replace: true });
    }

    async function save(data) {
        const created = await create.mutateAsync(data);
        // replace: Back from the detail page should not return to the empty form.
        navigate(`/orders/${created.id}`, { replace: true });
    }

    return (
        <Panel title="Registrar orden">
            <OrderForm onSubmit={save} onCancel={cancel} submitLabel="Registrar orden" />
        </Panel>
    );
}

export default NewOrderPage;
