import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import { CATEGORY_LABELS, STATUS_LABELS } from "../data/catalogs.js";

const AVATAR_COLORS = ["#5b6ee1", "#e07a5f", "#3d9970", "#b565a7", "#d99a2b", "#2a9d8f"];

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
        <span className="kcard__avatar" style={{ backgroundColor: AVATAR_COLORS[hash % AVATAR_COLORS.length] }} aria-hidden="true">
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
        <article className="kcard" draggable onDragStart={handleDragStart}>
            <header className="kcard__header">
                <h3 className="kcard__title">
                    <Link to={`/orders/${id}`}>Orden {code}</Link>
                </h3>
                <span className="kcard__amount">
                    Q {amount.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </header>

            <p className="kcard__type">Tipo: {CATEGORY_LABELS[category] ?? category}</p>

            <p className="kcard__department">
                <span className="kcard__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />
                    </svg>
                </span>
                Departamento: <strong>{department}</strong>
            </p>

            <p className="kcard__row">
                Estado <StatusBadge status={status} />
            </p>

            <p className="kcard__row kcard__row--person">
                Técnico <Avatar name={technician} /> {technician}
            </p>

            <div className="kcard__actions">
                {canComplete && (
                    <button type="button" className="kcard__complete" onClick={() => onMove(id, "completed")}>
                        Completar
                    </button>
                )}
                <select
                    className="kcard__move"
                    aria-label={`Mover la orden ${code} a`}
                    value=""
                    onChange={(event) => onMove(id, event.target.value)}
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
