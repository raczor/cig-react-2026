import { useState } from "react";
import KanbanCard from "./KanbanCard.jsx";
import { STATUS_LABELS } from "../data/catalogs.js";
import "./KanbanBoard.css";

// One column per status. Dropping a card on a column moves the order to that status.
function KanbanBoard({ orders, onMove }) {
    const [overStatus, setOverStatus] = useState(null);

    function handleDrop(event, status) {
        event.preventDefault();
        setOverStatus(null);
        const id = Number(event.dataTransfer.getData("text/plain"));
        const order = orders.find((o) => o.id === id);
        if (order && order.status !== status) onMove(id, status);
    }

    return (
        <div className="board">
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
                const column = orders.filter((order) => order.status === status);
                return (
                    <section
                        key={status}
                        className={`board__column${overStatus === status ? " board__column--over" : ""}`}
                        aria-label={label}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setOverStatus(status);
                        }}
                        onDragLeave={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) setOverStatus(null);
                        }}
                        onDrop={(event) => handleDrop(event, status)}
                    >
                        <header className="board__header">
                            <h2 className="board__title">{label}</h2>
                            <span className="board__count">{column.length}</span>
                        </header>

                        <div className="board__cards">
                            {column.map((order) => (
                                <KanbanCard key={order.id} order={order} onMove={onMove} />
                            ))}
                            {column.length === 0 && <p className="board__empty">Sin órdenes</p>}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

export default KanbanBoard;
