import { useState } from "react";
import KanbanCard from "./KanbanCard.jsx";
import { STATUS_LABELS } from "../data/catalogs.js";

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

    const statuses = Object.entries(STATUS_LABELS);

    return (
        <div className="grid grid-cols-[repeat(4,minmax(300px,1fr))] gap-8 overflow-x-auto rounded-xl bg-[radial-gradient(circle_at_25%_0%,var(--color-board-from),var(--color-board)_75%)] p-6">
            {statuses.map(([status, label], index) => {
                const column = orders.filter((order) => order.status === status);
                const isLast = index === statuses.length - 1;
                return (
                    <section
                        key={status}
                        aria-label={label}
                        className={`min-w-0 rounded-xl pb-6 ${
                            overStatus === status ? "bg-white/10 outline-2 outline-offset-4 outline-dashed outline-white/50" : ""
                        }`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setOverStatus(status);
                        }}
                        onDragLeave={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) setOverStatus(null);
                        }}
                        onDrop={(event) => handleDrop(event, status)}
                    >
                        {/* The line after the header joins the columns, like a flow. */}
                        <header
                            className={`relative mb-4 flex items-center justify-between rounded-xl bg-board px-5 py-4 text-white ${
                                isLast ? "" : "after:absolute after:left-full after:top-1/2 after:h-px after:w-8 after:bg-white/35"
                            }`}
                        >
                            <h2 className="m-0 text-lg font-semibold">{label}</h2>
                            <span className="min-w-7 rounded-lg bg-board-chip px-2 py-0.5 text-center text-sm font-bold text-board-chip-text">
                                {column.length}
                            </span>
                        </header>

                        <div className="flex flex-col gap-4">
                            {column.map((order) => (
                                <KanbanCard key={order.id} order={order} onMove={onMove} />
                            ))}
                            {column.length === 0 && (
                                <p className="rounded-xl border border-dashed border-white/35 p-4 text-center text-white/70">
                                    Sin órdenes
                                </p>
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

export default KanbanBoard;
