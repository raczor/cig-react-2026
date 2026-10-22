import { describe, expect, it } from "vitest";
import { filterOrders, normalize } from "./filters.js";
import { makeOrder } from "../test/fixtures.js";

const orders = [
    makeOrder({ id: 1, code: "OS-2026-001", client: "Hotel Mirador", department: "Guatemala", date: "2026-01-10", amount: 500 }),
    makeOrder({ id: 2, code: "OS-2026-002", client: "Colegio Santa Inés", department: "Sacatepéquez", date: "2026-03-01", amount: 900 }),
    makeOrder({ id: 3, code: "OS-2026-003", client: "Clínica Norte", department: "Guatemala", date: "2026-02-01", amount: 100 }),
];

const codes = (list) => list.map((order) => order.code);

describe("normalize", () => {
    it("strips accents and case", () => {
        expect(normalize("Sacatepéquez")).toBe("sacatepequez");
        expect(normalize("INÉS")).toBe("ines");
    });
});

describe("filterOrders", () => {
    it("sorts by date, newest first, by default", () => {
        expect(codes(filterOrders(orders, {}))).toEqual(["OS-2026-002", "OS-2026-003", "OS-2026-001"]);
    });

    it("sorts by amount, highest first", () => {
        expect(codes(filterOrders(orders, { sort: "amount" }))).toEqual(["OS-2026-002", "OS-2026-001", "OS-2026-003"]);
    });

    it("sorts by code", () => {
        expect(codes(filterOrders(orders, { sort: "code" }))).toEqual(["OS-2026-001", "OS-2026-002", "OS-2026-003"]);
    });

    it("filters by department", () => {
        expect(codes(filterOrders(orders, { department: "Guatemala", sort: "code" }))).toEqual(["OS-2026-001", "OS-2026-003"]);
    });

    it("searches code and client ignoring accents and case", () => {
        expect(codes(filterOrders(orders, { search: "ines" }))).toEqual(["OS-2026-002"]);
        expect(codes(filterOrders(orders, { search: "os-2026-003" }))).toEqual(["OS-2026-003"]);
        expect(codes(filterOrders(orders, { search: "  CLINICA " }))).toEqual(["OS-2026-003"]);
    });

    it("combines department and search", () => {
        expect(filterOrders(orders, { department: "Sacatepéquez", search: "hotel" })).toEqual([]);
    });

    it("does not mutate the input", () => {
        const copy = [...orders];
        filterOrders(orders, { sort: "amount" });
        expect(orders).toEqual(copy);
    });
});
