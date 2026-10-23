import type { Database } from "./Database.js";
import { ensureSchema } from "./setup.js";

export interface DatabaseConfig {
    /** A Postgres connection string. Without it the in-process PGlite is used. */
    databaseUrl?: string | undefined;
    /** Keep PGlite on disk in this folder instead of in memory (local development only). */
    pgliteDir?: string | undefined;
}

// One way to open a database. A Factory Method per driver: adding a driver is a new class,
// not an edit of the others.
interface DatabaseDriver {
    connect(): Promise<Database>;
}

// Real Postgres (Neon, Supabase, local...) through node-postgres. One connection per instance:
// a serverless function handles one request at a time and must not exhaust the server's slots.
class PostgresDriver implements DatabaseDriver {
    constructor(private readonly url: string) {}

    async connect(): Promise<Database> {
        const { default: pg } = await import("pg");
        const { drizzle } = await import("drizzle-orm/node-postgres");
        return drizzle({ client: new pg.Pool({ connectionString: this.url, max: 1 }) });
    }
}

// Postgres running inside the process (WASM): local development and tests need no installation.
class PgliteDriver implements DatabaseDriver {
    constructor(private readonly dataDir: string | undefined) {}

    async connect(): Promise<Database> {
        const { PGlite } = await import("@electric-sql/pglite");
        const { drizzle } = await import("drizzle-orm/pglite");
        return drizzle({ client: new PGlite(this.dataDir) });
    }
}

function driverFor({ databaseUrl, pgliteDir }: DatabaseConfig): DatabaseDriver {
    return databaseUrl ? new PostgresDriver(databaseUrl) : new PgliteDriver(pgliteDir);
}

// Opens the database and makes sure the table exists (and holds the demo data on first start).
export async function createDatabase(config: DatabaseConfig): Promise<Database> {
    const db = await driverFor(config).connect();
    await ensureSchema(db);
    return db;
}
