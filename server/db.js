import { readFileSync } from "node:fs";
import { sql } from "drizzle-orm";
import { orders } from "./schema.js";

const SEED_PATH = new URL("./seed.json", import.meta.url);

// DATABASE_URL set  -> real Postgres (Neon, Supabase, local...) through node-postgres.
// DATABASE_URL unset -> PGlite, a Postgres that runs inside the process: used for local
//   development and tests. In memory by default; set PGLITE_DIR to keep it on disk.
// Both go through the same Drizzle schema and queries.
export async function createDb({ databaseUrl = process.env.DATABASE_URL, pgliteDir = process.env.PGLITE_DIR } = {}) {
    let db;
    if (databaseUrl) {
        const { default: pg } = await import("pg");
        const { drizzle } = await import("drizzle-orm/node-postgres");
        db = drizzle({ client: new pg.Pool({ connectionString: databaseUrl, max: 1 }) });
    } else {
        const { PGlite } = await import("@electric-sql/pglite");
        const { drizzle } = await import("drizzle-orm/pglite");
        db = drizzle({ client: new PGlite(pgliteDir) });
    }
    await ensureSchema(db);
    return db;
}

// Creates the table when it does not exist and loads the demo orders into it, only then:
// deleting every order must not bring the demo data back on the next start.
// The advisory lock makes several instances starting together (serverless cold starts)
// take turns instead of racing on CREATE TABLE and on the seed.
export async function ensureSchema(db) {
    await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(727001)`);

        const { rows } = await tx.execute(sql`SELECT to_regclass('public.orders') IS NOT NULL AS exists`);
        if (rows[0].exists) return;

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

async function loadSeed(db) {
    const seed = JSON.parse(readFileSync(SEED_PATH, "utf8")).orders;
    await db.insert(orders).values(seed);
    // The seed carries explicit ids, so move the sequence past them.
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('orders', 'id'), (SELECT max(id) FROM orders))`);
}

// Back to the seed data with ids restarted. For tests: it wipes the table.
export async function resetData(db) {
    await db.execute(sql`TRUNCATE orders RESTART IDENTITY`);
    await loadSeed(db);
}
