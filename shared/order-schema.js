import { z } from "zod";
import { CATEGORIES, DEPARTMENTS, STATUSES } from "./catalog.js";

// Date.parse accepts 2026-02-31 (it rolls over to March), so compare after a round trip.
// Zod also runs this check on text that failed the format check, so it must never throw.
function isRealDate(value) {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const required = (message) => z.string({ error: message }).trim().min(1, message);

// Digits, optional dash and a check digit (number or K), or CF.
const NIT = /^(CF|\d{1,12}-?[\dK])$/;

// Fields a client sends to create or replace an order. Messages are shown in the UI as they are.
export const orderInputSchema = z.object({
    client: required("Cliente obligatorio."),
    taxId: required("NIT obligatorio. Usa CF si no tienes.")
        .transform((value) => value.toUpperCase())
        .refine((value) => NIT.test(value), "Formato de NIT: 1234567-8 o CF."),
    department: z.enum(DEPARTMENTS, { error: "Selecciona un departamento." }),
    category: z.enum(CATEGORIES, { error: "Selecciona una categoría." }),
    technician: required("Técnico obligatorio."),
    date: z
        .string({ error: "Fecha obligatoria." })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha obligatoria.")
        .refine(isRealDate, "Fecha obligatoria."),
    hours: z.number({ error: "Horas entre 0 y 24." }).gt(0, "Horas entre 0 y 24.").lte(24, "Horas entre 0 y 24."),
    // The column is numeric(12, 2): anything larger would fail in the database.
    amount: z.number({ error: "Monto mayor que cero." }).gt(0, "Monto mayor que cero.").max(9_999_999_999.99, "Monto demasiado grande."),
});

// A replace may carry a status; without one the stored status is left alone, so editing a
// stale copy of an order cannot undo a status change made elsewhere (e.g. on the board).
export const orderReplaceSchema = orderInputSchema.extend({
    status: z.enum(STATUSES, { error: "Estado no válido." }).optional(),
});

export const statusChangeSchema = z.object({
    status: z.enum(STATUSES, { error: "Estado no válido." }),
});
