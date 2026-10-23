// @vitest-environment node
import { describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { createDb, ensureSchema } from "./db.js";
import { orders } from "./schema.js";

describe("ensureSchema", () => {
    it("creates the table and seeds it on a new database", async () => {
        const db = await createDb({ databaseUrl: null });
        expect(await db.select().from(orders)).toHaveLength(24);
    });

    it("keeps the next id past the seeded ones", async () => {
        const db = await createDb({ databaseUrl: null });
        const { rows } = await db.execute(sql`SELECT nextval(pg_get_serial_sequence('orders', 'id')) AS id`);
        expect(Number(rows[0].id)).toBe(25);
    });

    it("does not bring the demo data back after every order was deleted", async () => {
        const db = await createDb({ databaseUrl: null });
        await db.delete(orders);

        await ensureSchema(db);

        expect(await db.select().from(orders)).toHaveLength(0);
    });

    it("is safe to run again and again, and concurrently", async () => {
        const db = await createDb({ databaseUrl: null });

        await Promise.all([ensureSchema(db), ensureSchema(db), ensureSchema(db)]);

        expect(await db.select().from(orders)).toHaveLength(24);
    });
});
