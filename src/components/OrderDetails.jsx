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
        <article className="rounded-xl border border-slate-200 p-4">
            <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="m-0 text-lg font-semibold">{code}</h3>
                    <StatusBadge status={status} />
                </div>
                <p className="m-0 text-2xl font-semibold">Q {localAmount}</p>
            </header>

            <p className="mt-1 text-base font-medium">{client}</p>

            <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1">
                {rows.map(([label, value]) => (
                    <div key={label} className="contents">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="m-0">{value}</dd>
                    </div>
                ))}
            </dl>

            {hours > 8 && (
                <p className="mt-3 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                    Jornada extendida
                </p>
            )}
        </article>
    );
}

export default OrderDetails;
