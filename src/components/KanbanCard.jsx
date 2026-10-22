import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import Button from "./ui/Button.jsx";
import { CATEGORY_LABELS, STATUS_LABELS } from "../data/catalogs.js";

const AVATAR_COLORS = ["#255b96", "#2f74ba", "#1d4777", "#15335a", "#1f67ae"];

// Initials on a color derived from the name, so the same person always looks the same.
function Avatar({ name }) {
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return (
        <span
            className="inline-flex size-[22px] items-center justify-center rounded-full text-[0.65rem] font-bold text-white"
            style={{ backgroundColor: AVATAR_COLORS[hash % AVATAR_COLORS.length] }}
            aria-hidden="true"
        >
            {initials}
        </span>
    );
}

// Dragging needs a mouse, so every card also has a "Mover a" select (keyboard and touch).
function KanbanCard({ order, onMove }) {
    const { id, code, category, department, technician, amount, status } = order;
    const canComplete = status === "pending" || status === "in_progress";

    function handleDragStart(event) {
        event.dataTransfer.setData("text/plain", String(id));
        event.dataTransfer.effectAllowed = "move";
    }

    return (
        <article
            draggable
            onDragStart={handleDragStart}
            className="cursor-grab rounded-xl bg-white p-4 text-slate-600 shadow-sm active:cursor-grabbing"
        >
            <header className="mb-1.5 flex items-baseline justify-between gap-2">
                <h3 className="m-0 whitespace-nowrap text-[0.95rem] font-bold">
                    <Link to={`/orders/${id}`} className="text-slate-900 hover:underline">
                        Orden {code}
                    </Link>
                </h3>
                <span className="whitespace-nowrap text-[0.95rem] font-bold text-slate-900">
                    Q {amount.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </header>

            <p className="mb-2">Tipo: {CATEGORY_LABELS[category] ?? category}</p>

            <p className="mb-2 flex items-center gap-2">
                <span
                    aria-hidden="true"
                    className="inline-flex size-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />
                    </svg>
                </span>
                Departamento: <strong className="text-slate-900">{department}</strong>
            </p>

            <p className="mb-2 flex items-center gap-2">
                Estado <StatusBadge status={status} />
            </p>

            <p className="mb-2 flex items-center gap-2">
                Técnico <Avatar name={technician} /> {technician}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
                {canComplete && (
                    <Button variant="secondary" size="sm" onClick={() => onMove(id, "completed")}>
                        Completar
                    </Button>
                )}
                <select
                    aria-label={`Mover la orden ${code} a`}
                    value=""
                    onChange={(event) => onMove(id, event.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                    <option value="" disabled>Mover a...</option>
                    {Object.entries(STATUS_LABELS)
                        .filter(([value]) => value !== status)
                        .map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                </select>
            </div>
        </article>
    );
}

export default KanbanCard;
