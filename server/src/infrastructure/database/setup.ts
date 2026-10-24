import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { sql } from "drizzle-orm";
import { rowsOf, type Database } from "./Database.js";
import { orders } from "./schema.js";

// Next to the sources in development and tests. A bundler (such as the one behind a serverless
// function) moves this module and breaks the relative path, so the project root is tried too.
function seedPath(): URL {
    const beside = new URL("../../../data/seed.json", import.meta.url);
    const fromRoot = pathToFileURL(join(process.cwd(), "server/data/seed.json"));
    return existsSync(beside) ? beside : fromRoot;
}

// Creates the table when it does not exist and loads the demo orders into it, only then:
// deleting every order must not bring the demo data back on the next start.
// The advisory lock makes several instances starting together (serverless cold starts)
// take turns instead of racing on CREATE TABLE and on the seed.
export async function ensureSchema(db: Database): Promise<void> {
    await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(727001)`);

        const [{ exists } = { exists: false }] = rowsOf<{ exists: boolean }>(
            await tx.execute(sql`SELECT to_regclass('public.orders') IS NOT NULL AS exists`)
        );
        if (exists) return;

        await tx.execute(sql`
            CREATE TABLE orders (
                id serial PRIMARY KEY,
                code text NOT NULL UNIQUE,
                client text NOT NULL,
                tax_id text NOT NULL,
                department text NOT NULL,
                category text NOT NULL,
                technician text NOT NULL,
                date date NOT NULL,
                hours double precision NOT NULL,
                amount numeric(12, 2) NOT NULL,
                status text NOT NULL DEFAULT 'pending',
                created_at timestamp NOT NULL DEFAULT now()
            )
        `);
        await loadSeed(tx);
    });
}

async function loadSeed(db: Database): Promise<void> {
    const seed = (JSON.parse(readFileSync(seedPath(), "utf8")) as { orders: (typeof orders.$inferInsert)[] }).orders;
    await db.insert(orders).values(seed);
    // The seed carries explicit ids, so move the sequence past them.
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('orders', 'id'), (SELECT max(id) FROM orders))`);
}

// Back to the seed data with ids restarted. For tests: it wipes the table.
export async function resetData(db: Database): Promise<void> {
    await db.execute(sql`TRUNCATE orders RESTART IDENTITY`);
    await loadSeed(db);
}
