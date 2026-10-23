// The lists of valid values live in shared/ so the API and the UI cannot drift apart.
export { DEPARTMENTS } from "../../shared/catalog.js";

// Stored values are stable codes; the labels are what the UI shows.
export const CATEGORY_LABELS = {
    installation: "Instalación",
    preventive_maintenance: "Mantenimiento preventivo",
    repair: "Reparación",
    diagnosis: "Diagnóstico",
};

export const STATUS_LABELS = {
    pending: "Pendiente",
    in_progress: "En proceso",
    completed: "Completada",
    cancelled: "Cancelada",
};
