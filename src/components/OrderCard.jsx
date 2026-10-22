import { useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import { CATEGORY_LABELS } from "../data/catalogs.js";
import "./OrderCard.css";

// `open` starts the card expanded (the detail page uses it).
function OrderCard({ order, currency = "Q", onComplete, open = false }) {
    const [expanded, setExpanded] = useState(open);

    const { id, code, client, taxId, department, category, technician } = order;
    const { date, hours, amount, status } = order;

    // "T00:00:00" keeps the date from shifting a day with the timezone.
    const localDate = new Date(date + "T00:00:00").toLocaleDateString("es-GT");
    const localAmount = amount.toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const canComplete = status === "pending" || status === "in_progress";

    return (
        <article className="card">
            <header className="card__header">
                <h3 className="card__code">
                    <Link to={`/orders/${id}`}>{code}</Link>
                </h3>
                <StatusBadge status={status} />
            </header>

            <p className="card__client">{client}</p>

            <dl className="card__details">
                <dt>Departamento</dt>
                <dd>{department}</dd>
                <dt>Categoría</dt>
                <dd>{CATEGORY_LABELS[category] ?? category}</dd>
                <dt>Fecha</dt>
                <dd>{localDate}</dd>
                {expanded && (
                    <>
                        <dt>NIT</dt>
                        <dd>{taxId}</dd>
                        <dt>Técnico</dt>
                        <dd>{technician}</dd>
                        <dt>Horas</dt>
                        <dd>{hours}</dd>
                    </>
                )}
            </dl>

            {hours > 8 && <p className="card__notice">Jornada extendida</p>}

            <p className="card__amount">
                {currency} {localAmount}
            </p>

            <div className="card__actions">
                <button
                    type="button"
                    className="button button--secondary card__button"
                    onClick={() => setExpanded((value) => !value)}
                >
                    {expanded ? "Ver menos" : "Ver más"}
                </button>

                {onComplete && canComplete && (
                    <button type="button" className="button card__button" onClick={() => onComplete(id)}>
                        Completar
                    </button>
                )}
            </div>
        </article>
    );
}

export default OrderCard;
