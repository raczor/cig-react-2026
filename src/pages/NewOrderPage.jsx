import { useNavigate } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import OrderForm from "../components/OrderForm.jsx";
import { useCreateOrder } from "../hooks/useOrders.js";

function NewOrderPage() {
    const navigate = useNavigate();
    const create = useCreateOrder();

    async function save(data) {
        const created = await create.mutateAsync(data);
        // replace: Back from the detail page should not return to the empty form.
        navigate(`/orders/${created.id}`, { replace: true });
    }

    return (
        <Panel title="Registrar orden">
            <OrderForm onSubmit={save} submitLabel="Registrar orden" />
        </Panel>
    );
}

export default NewOrderPage;
