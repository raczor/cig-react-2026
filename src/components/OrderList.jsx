import OrderCard from "./OrderCard.jsx";
import "./OrderList.css";

function OrderList({ orders = [], emptyMessage = "No hay órdenes.", onComplete }) {
    if (orders.length === 0) {
        return <p className="message message--empty">{emptyMessage}</p>;
    }

    return (
        <div className="list">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} onComplete={onComplete} />
            ))}
        </div>
    );
}

export default OrderList;
