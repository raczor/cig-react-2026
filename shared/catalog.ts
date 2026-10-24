// Single source of truth for the closed lists shared by the API and the UI.
export const DEPARTMENTS = [
    "Guatemala",
    "Sacatepéquez",
    "Chimaltenango",
    "Quetzaltenango",
    "Escuintla",
    "Alta Verapaz",
    "Baja Verapaz",
    "El Progreso",
] as const;

export const CATEGORIES = ["installation", "preventive_maintenance", "repair", "diagnosis"] as const;

export const STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type Category = (typeof CATEGORIES)[number];
export type OrderStatus = (typeof STATUSES)[number];
