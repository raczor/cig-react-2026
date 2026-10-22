import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import OrderDetails from "../components/OrderDetails.jsx";
import Alert from "../components/ui/Alert.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { buttonClass } from "../components/ui/styles.js";
import { useOrder, useDeleteOrder } from "../hooks/useOrders.js";

function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // location.key is "default" on the first page of the session: nothing to go back to.
    const hasHistory = useLocation().key !== "default";
    const [notice, setNotice] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

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
        setNotice(null);
        try {
            await deletion.mutateAsync(order.id);
            navigate("/", { replace: true });
        } catch (err) {
            setConfirmingDelete(false);
            setNotice(`No se pudo eliminar: ${err.message}`);
        }
    }

    return (
        <>
            {notice && <Alert variant="error" className="mb-4">{notice}</Alert>}

            <Card className="p-6">
                <OrderDetails order={order} />

                <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                    {/* Going back (-1) keeps the board filters, which live in the URL. */}
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
                    <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                        Eliminar
                    </Button>
                </div>
            </Card>

            <ConfirmDialog
                open={confirmingDelete}
                title="Eliminar orden"
                confirmLabel="Eliminar"
                busyLabel="Eliminando..."
                busy={deletion.isPending}
                onConfirm={remove}
                onCancel={() => setConfirmingDelete(false)}
            >
                <p className="m-0">
                    ¿Seguro que quieres eliminar la orden <strong>{order.code}</strong>? Esta acción no se puede deshacer.
                </p>
            </ConfirmDialog>
        </>
    );
}

export default OrderDetailPage;
