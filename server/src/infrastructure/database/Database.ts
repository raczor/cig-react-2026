import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

// The Drizzle database both drivers produce (node-postgres and PGlite). Code that only runs
// queries depends on this, never on a driver.
export type Database = PgDatabase<PgQueryResultHKT>;

// db.execute() answers with a driver specific object; both drivers put the rows in `rows`.
export function rowsOf<Row>(result: unknown): Row[] {
    return (result as { rows: Row[] }).rows;
}
