import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import OrderDetails from "../components/OrderDetails.jsx";
import Alert from "../components/ui/Alert.jsx";
import Button from "../components/ui/Button.jsx";
import { buttonClass } from "../components/ui/styles.js";
import { useOrder, useDeleteOrder } from "../hooks/useOrders.js";

function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // location.key is "default" on the first page of the session: nothing to go back to.
    const hasHistory = useLocation().key !== "default";
    const [notice, setNotice] = useState(null);

    const { data: order, isPending, error } = useOrder(id);
    const deletion = useDeleteOrder();

    if (isPending) {
        return <Alert>Cargando orden...</Alert>;
    }

    if (error) {
        return (
            <Alert variant="error">
                <p className="mb-2">No se pudo cargar la orden {id}: {error.message}</p>
                <Link to="/" className="underline">Volver al tablero</Link>
            </Alert>
        );
    }

    async function remove() {
        const confirmed = window.confirm(
            `¿Seguro que quieres eliminar ${order.code}? No se puede deshacer.`
        );
        if (!confirmed) return;

        setNotice(null);
        try {
            await deletion.mutateAsync(order.id);
            navigate("/", { replace: true });
        } catch (err) {
            setNotice(`No se pudo eliminar: ${err.message}`);
        }
    }

    return (
        <Panel title={`Orden ${order.code}`}>
            {notice && <Alert variant="error" className="mb-4">{notice}</Alert>}

            <OrderDetails order={order} />

            <div className="mt-4 flex flex-wrap gap-2">
                {/* Going back (-1) keeps the list filters, which live in the URL. */}
                <Link
                    className={buttonClass({ variant: "secondary" })}
                    to="/"
                    onClick={(event) => {
                        if (!hasHistory) return;
                        event.preventDefault();
                        navigate(-1);
                    }}
                >
                    Volver
                </Link>
                <Link className={buttonClass()} to={`/orders/${order.id}/edit`}>
                    Editar
                </Link>
                <Button variant="danger" onClick={remove}>
                    Eliminar
                </Button>
            </div>
        </Panel>
    );
}

export default OrderDetailPage;
