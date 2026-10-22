import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import OrderCard from "../components/OrderCard.jsx";
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
        return <p className="message message--loading">Cargando orden...</p>;
    }

    if (error) {
        return (
            <div className="message message--error" role="alert">
                <p>No se pudo cargar la orden {id}: {error.message}</p>
                <Link to="/">Volver al listado</Link>
            </div>
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
            {notice && <p className="message message--error" role="alert">{notice}</p>}

            <OrderCard order={order} open />

            <div className="detail__actions">
                {/* Going back (-1) keeps the list filters, which live in the URL. */}
                <Link
                    className="button button--secondary"
                    to="/"
                    onClick={(event) => {
                        if (!hasHistory) return;
                        event.preventDefault();
                        navigate(-1);
                    }}
                >
                    Volver
                </Link>
                <Link className="button" to={`/orders/${order.id}/edit`}>
                    Editar
                </Link>
                <button className="button button--danger" type="button" onClick={remove}>
                    Eliminar
                </button>
            </div>
        </Panel>
    );
}

export default OrderDetailPage;
