import { describe, expect, it } from "vitest";
import { EMPTY, toPayload, validate } from "./validation.js";

const valid = {
    client: "Hotel Mirador",
    taxId: "1234567-8",
    department: "Guatemala",
    category: "repair",
    technician: "Ana",
    date: "2026-10-14",
    hours: "4",
    amount: "150.5",
};

describe("validate", () => {
    it("accepts a complete form", () => {
        expect(validate(valid)).toEqual({});
    });

    it("reports every required field on an empty form", () => {
        expect(Object.keys(validate(EMPTY))).toEqual(
            ["client", "taxId", "department", "category", "technician", "date", "hours", "amount"]
        );
    });

    it.each(["1234567-8", "12345678", "1234567-K", "cf", "CF"])("accepts NIT %s", (taxId) => {
        expect(validate({ ...valid, taxId }).taxId).toBeUndefined();
    });

    it.each(["abc", "123-", "1234567--8", "12345678901234-1"])("rejects NIT %s", (taxId) => {
        expect(validate({ ...valid, taxId }).taxId).toBeDefined();
    });

    it("treats whitespace-only text as empty", () => {
        const errors = validate({ ...valid, client: "   ", technician: " " });
        expect(errors.client).toBeDefined();
        expect(errors.technician).toBeDefined();
    });

    it.each(["0", "-1", "24.5", "abc", ""])("rejects hours %s", (hours) => {
        expect(validate({ ...valid, hours }).hours).toBeDefined();
    });

    it("accepts the 24 hour limit", () => {
        expect(validate({ ...valid, hours: "24" }).hours).toBeUndefined();
    });

    it.each(["0", "-5", "abc", ""])("rejects amount %s", (amount) => {
        expect(validate({ ...valid, amount }).amount).toBeDefined();
    });
});

describe("toPayload", () => {
    it("converts numbers and normalizes the NIT", () => {
        expect(toPayload({ ...valid, taxId: " cf ", hours: "4", amount: "150.5" })).toMatchObject({
            taxId: "CF",
            hours: 4,
            amount: 150.5,
        });
    });

    it("keeps extra fields such as id, code and status (edit sends them back)", () => {
        const payload = toPayload({ ...valid, id: 7, code: "OS-2026-007", status: "pending" });
        expect(payload).toMatchObject({ id: 7, code: "OS-2026-007", status: "pending" });
    });
});
