import { STATUS_LABELS } from "../data/catalogs.js";

const CLASS_NAMES = {
    pending: "bg-amber-100 text-amber-800",
    in_progress: "bg-sky-100 text-sky-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800",
};

function StatusBadge({ status }) {
    // An unknown status renders neutral instead of with className undefined.
    return (
        <span
            className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${
                CLASS_NAMES[status] ?? "bg-slate-100 text-slate-700"
            }`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

export default StatusBadge;
