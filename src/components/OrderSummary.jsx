import "./OrderSummary.css";

function OrderSummary({ orders = [] }) {
    const completed = orders.filter((order) => order.status === "completed").length;
    const pending = orders.filter((order) => order.status === "pending").length;
    const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);

    const items = [
        { label: "Órdenes", value: orders.length },
        { label: "Completadas", value: completed },
        { label: "Pendientes", value: pending },
        { label: "Monto total", value: "Q " + totalAmount.toLocaleString("es-GT") },
    ];

    return (
        <div className="summary">
            {items.map((item) => (
                <div className="summary__item" key={item.label}>
                    <p className="summary__value">{item.value}</p>
                    <p className="summary__label">{item.label}</p>
                </div>
            ))}
        </div>
    );
}

export default OrderSummary;
