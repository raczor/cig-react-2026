import { STATUS_LABELS } from "../data/catalogs.js";

const CLASS_NAMES = {
    pending: "badge badge--pending",
    in_progress: "badge badge--in-progress",
    completed: "badge badge--completed",
    cancelled: "badge badge--cancelled",
};

function StatusBadge({ status }) {
    // An unknown status renders uncolored instead of with className undefined.
    return <span className={CLASS_NAMES[status] || "badge"}>{STATUS_LABELS[status] ?? status}</span>;
}

export default StatusBadge;
