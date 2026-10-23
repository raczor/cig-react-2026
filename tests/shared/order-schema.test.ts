// @vitest-environment node
import { describe, expect, it } from "vitest";
import { orderInputSchema, orderReplaceSchema, statusChangeSchema } from "../../shared/order-schema.js";

const valid = {
    client: "Hotel Mirador",
    taxId: "1234567-8",
    department: "Guatemala",
    category: "repair",
    technician: "Ana",
    date: "2026-10-14",
    hours: 4,
    amount: 150.5,
};

// The message of the first issue for a field, or undefined when the field is valid.
function errorFor(overrides: Record<string, unknown>, field: string): string | undefined {
    const result = orderInputSchema.safeParse({ ...valid, ...overrides });
    return result.success ? undefined : result.error.issues.find((i) => i.path[0] === field)?.message;
}

describe("orderInputSchema", () => {
    it("accepts a complete order", () => {
        expect(orderInputSchema.safeParse(valid).success).toBe(true);
    });

    it("reports every field of an empty form, with the messages the UI shows", () => {
        const result = orderInputSchema.safeParse({
            client: "", taxId: "", department: "", category: "", technician: "", date: "", hours: NaN, amount: NaN,
        });

        if (result.success) throw new Error("an empty form must not be valid");
        expect(Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]))).toMatchObject({
            client: "Cliente obligatorio.",
            taxId: "NIT obligatorio. Usa CF si no tienes.",
            department: "Selecciona un departamento.",
            category: "Selecciona una categoría.",
            technician: "Técnico obligatorio.",
            date: "Fecha obligatoria.",
            hours: "Horas entre 0 y 24.",
            amount: "Monto mayor que cero.",
        });
    });

    it.each(["1234567-8", "12345678", "1234567-K", "cf", "CF", " cf "])("accepts NIT %j", (taxId) => {
        expect(errorFor({ taxId }, "taxId")).toBeUndefined();
    });

    it.each(["abc", "123-", "1234567--8", "12345678901234-1"])("rejects NIT %j", (taxId) => {
        expect(errorFor({ taxId }, "taxId")).toBe("Formato de NIT: 1234567-8 o CF.");
    });

    it("trims text and uppercases the NIT", () => {
        const { data } = orderInputSchema.safeParse({ ...valid, client: "  Hotel  ", taxId: " cf ", technician: " Ana " });
        expect(data).toMatchObject({ client: "Hotel", taxId: "CF", technician: "Ana" });
    });

    it("treats whitespace-only text as empty", () => {
        expect(errorFor({ client: "   " }, "client")).toBe("Cliente obligatorio.");
        expect(errorFor({ technician: " " }, "technician")).toBe("Técnico obligatorio.");
    });

    it.each([0, -1, 24.5, NaN, "4"])("rejects hours %j", (hours) => {
        expect(errorFor({ hours }, "hours")).toBe("Horas entre 0 y 24.");
    });

    it.each([0.25, 24])("accepts hours %j", (hours) => {
        expect(errorFor({ hours }, "hours")).toBeUndefined();
    });

    it.each([0, -5, NaN, "150"])("rejects amount %j", (amount) => {
        expect(errorFor({ amount }, "amount")).toBe("Monto mayor que cero.");
    });

    it("rejects an amount the numeric(12, 2) column cannot hold", () => {
        expect(errorFor({ amount: 1e12 }, "amount")).toBe("Monto demasiado grande.");
    });

    it.each(["", "14/10/2026", "2026-13-45", "2026-02-31", "2026-04-31", "2026-02-29"])("rejects date %j", (date) => {
        expect(errorFor({ date }, "date")).toBe("Fecha obligatoria.");
    });

    it("accepts a real leap day", () => {
        expect(errorFor({ date: "2028-02-29" }, "date")).toBeUndefined();
    });

    it("rejects values outside the shared catalogs", () => {
        expect(errorFor({ department: "Narnia" }, "department")).toBe("Selecciona un departamento.");
        expect(errorFor({ category: "magic" }, "category")).toBe("Selecciona una categoría.");
    });

    it("drops fields that are not editable (id, code, status)", () => {
        const { data } = orderInputSchema.safeParse({ ...valid, id: 1, code: "HACK", status: "completed" });
        expect(data).not.toHaveProperty("id");
        expect(data).not.toHaveProperty("code");
        expect(data).not.toHaveProperty("status");
    });
});

describe("orderReplaceSchema and statusChangeSchema", () => {
    it("a replace may carry a status, but it is optional and must be known when present", () => {
        expect(orderReplaceSchema.safeParse({ ...valid, status: "in_progress" }).success).toBe(true);
        expect(orderReplaceSchema.safeParse(valid).success).toBe(true);
        expect(orderReplaceSchema.safeParse({ ...valid, status: "flying" }).success).toBe(false);
    });

    it("a status change accepts only known statuses", () => {
        expect(statusChangeSchema.safeParse({ status: "cancelled" }).success).toBe(true);
        const result = statusChangeSchema.safeParse({ status: "flying" });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("Estado no válido.");
    });
});
