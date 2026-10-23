// @vitest-environment node
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { DrizzleOrderRepository } from "../../../server/src/infrastructure/persistence/DrizzleOrderRepository.js";
import { createDatabase } from "../../../server/src/infrastructure/database/createDatabase.js";
import type { Database } from "../../../server/src/infrastructure/database/Database.js";
import { resetData } from "../../../server/src/infrastructure/database/setup.js";
import { makeOrder } from "../../support/fixtures.js";

// The repository against a real Postgres (PGlite): the part the service tests fake.
let db: Database;
let repository: DrizzleOrderRepository;

beforeAll(async () => {
    db = await createDatabase({});
    repository = new DrizzleOrderRepository(db);
});

beforeEach(() => resetData(db));

describe("DrizzleOrderRepository", () => {
    it("lists the orders by id with the domain's fields only", async () => {
        const orders = await repository.findAll();

        expect(orders).toHaveLength(24);
        expect(orders.map((o) => o.id)).toEqual([...Array(24).keys()].map((i) => i + 1));
        expect(Object.keys(orders[0] ?? {}).sort()).toEqual(
            ["amount", "category", "client", "code", "date", "department", "hours", "id", "status", "taxId", "technician"]
        );
    });

    it("reads numeric columns back as numbers", async () => {
        const order = await repository.findById(1);
        expect(order).toMatchObject({ hours: 3.5, amount: 1750 });
        expect(typeof order?.amount).toBe("number");
    });

    it("finds nothing for an unknown id", async () => {
        expect(await repository.findById(9999)).toBeUndefined();
    });

    it("hands out increasing ids that survive deletes", async () => {
        expect(await repository.nextId()).toBe(25);
        expect(await repository.nextId()).toBe(26);
        await repository.delete(24);
        expect(await repository.nextId()).toBe(27);
    });

    it("inserts and reads back the same order", async () => {
        const id = await repository.nextId();
        const inserted = await repository.insert(makeOrder({ id, code: `OS-2026-0${id}`, status: "pending" }));

        expect(inserted).toMatchObject({ id: 25, client: "Hotel Mirador", status: "pending" });
        expect(await repository.findById(25)).toEqual(inserted);
    });

    it("rejects a duplicate code instead of overwriting", async () => {
        await expect(repository.insert(makeOrder({ id: 100, code: "OS-2026-001" }))).rejects.toThrow();
    });

    it("updates only the fields it is given", async () => {
        const before = await repository.findById(3);
        const updated = await repository.update(3, { status: "cancelled" });

        expect(updated).toEqual({ ...before, status: "cancelled" });
    });

    it("treats undefined fields as 'leave as is'", async () => {
        const before = await repository.findById(3);
        const updated = await repository.update(3, { client: "Nuevo Cliente", status: undefined });

        expect(updated).toEqual({ ...before, client: "Nuevo Cliente" });
    });

    it("an update with nothing to change returns the order untouched", async () => {
        expect(await repository.update(3, {})).toEqual(await repository.findById(3));
    });

    it("updating an unknown order gives undefined", async () => {
        expect(await repository.update(9999, { status: "completed" })).toBeUndefined();
        expect(await repository.update(9999, {})).toBeUndefined();
    });

    it("never changes the id or the code", async () => {
        const updated = await repository.update(3, { client: "X" });
        expect(updated).toMatchObject({ id: 3, code: "OS-2026-003" });
    });

    it("deletes once, then reports there was nothing", async () => {
        expect(await repository.delete(4)).toBe(true);
        expect(await repository.delete(4)).toBe(false);
        expect(await repository.findById(4)).toBeUndefined();
    });
});
