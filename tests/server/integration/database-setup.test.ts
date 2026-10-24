// @vitest-environment node
import { describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { createDatabase } from "../../../server/src/infrastructure/database/createDatabase.js";
import { rowsOf } from "../../../server/src/infrastructure/database/Database.js";
import { orders } from "../../../server/src/infrastructure/database/schema.js";
import { ensureSchema } from "../../../server/src/infrastructure/database/setup.js";

describe("createDatabase and ensureSchema", () => {
    it("without a connection string uses the in-process database, with the table created and seeded", async () => {
        const db = await createDatabase({});
        expect(await db.select().from(orders)).toHaveLength(24);
    });

    it("keeps the next id past the seeded ones", async () => {
        const db = await createDatabase({});
        const [row] = rowsOf<{ id: string }>(await db.execute(sql`SELECT nextval(pg_get_serial_sequence('orders', 'id')) AS id`));
        expect(Number(row?.id)).toBe(25);
    });

    it("does not bring the demo data back after every order was deleted", async () => {
        const db = await createDatabase({});
        await db.delete(orders);

        await ensureSchema(db);

        expect(await db.select().from(orders)).toHaveLength(0);
    });

    it("is safe to run again and again, and concurrently", async () => {
        const db = await createDatabase({});

        await Promise.all([ensureSchema(db), ensureSchema(db), ensureSchema(db)]);

        expect(await db.select().from(orders)).toHaveLength(24);
    });
});
