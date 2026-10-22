import StatusBadge from "./StatusBadge.jsx";
import { CATEGORY_LABELS } from "../data/catalogs.js";

function OrderDetails({ order }) {
    const { code, client, taxId, department, category, technician, date, hours, amount, status } = order;

    // "T00:00:00" keeps the date from shifting a day with the timezone.
    const localDate = new Date(date + "T00:00:00").toLocaleDateString("es-GT");
    const localAmount = amount.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const rows = [
        ["Departamento", department],
        ["Categoría", CATEGORY_LABELS[category] ?? category],
        ["Fecha", localDate],
        ["NIT", taxId],
        ["Técnico", technician],
        ["Horas", hours],
    ];

    return (
        <article>
            <header className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="m-0 text-2xl font-semibold">Orden {code}</h1>
                        <StatusBadge status={status} />
                    </div>
                    <p className="mt-1 text-base text-slate-600">{client}</p>
                </div>
                <p className="m-0 text-3xl font-semibold">Q {localAmount}</p>
            </header>

            <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-2 border-t border-slate-200 pt-4">
                {rows.map(([label, value]) => (
                    <div key={label} className="contents">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="m-0">{value}</dd>
                    </div>
                ))}
            </dl>

            {hours > 8 && (
                <p className="mt-4 inline-block rounded bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                    Jornada extendida
                </p>
            )}
        </article>
    );
}

export default OrderDetails;
