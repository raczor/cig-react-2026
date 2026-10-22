import { STATUS_LABELS } from "../data/catalogs.js";

const CLASS_NAMES = {
    pending: "bg-brand-50 text-brand-700 ring-1 ring-brand-300 ring-inset",
    in_progress: "bg-brand-200 text-brand-900",
    completed: "bg-brand-600 text-white",
    cancelled: "bg-slate-200 text-slate-600",
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
