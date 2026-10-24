import { eq, sql } from "drizzle-orm";
import type { Category, Department, OrderStatus } from "../../../../shared/catalog.js";
import type { Order, OrderChanges } from "../../domain/order.js";
import type { OrderRepository } from "../../domain/OrderRepository.js";
import { rowsOf, type Database } from "../database/Database.js";
import { orders } from "../database/schema.js";

type OrderRow = typeof orders.$inferSelect;

// The columns are plain text; what is stored was validated against the shared catalogs on the
// way in, so reading it back as those types is safe. The row's internal columns stay behind.
function toOrder(row: OrderRow): Order {
    return {
        id: row.id,
        code: row.code,
        client: row.client,
        taxId: row.taxId,
        department: row.department as Department,
        category: row.category as Category,
        technician: row.technician,
        date: row.date,
        hours: row.hours,
        amount: row.amount,
        status: row.status as OrderStatus,
    };
}

export class DrizzleOrderRepository implements OrderRepository {
    constructor(private readonly db: Database) {}

    async findAll(): Promise<Order[]> {
        const rows = await this.db.select().from(orders).orderBy(orders.id);
        return rows.map(toOrder);
    }

    async findById(id: number): Promise<Order | undefined> {
        const [row] = await this.db.select().from(orders).where(eq(orders.id, id));
        return row && toOrder(row);
    }

    // Taken from the sequence on its own so the code, which depends on the id, goes in with a
    // single INSERT. A failed insert leaves a gap in the ids, which is harmless.
    async nextId(): Promise<number> {
        const [row] = rowsOf<{ id: string | number }>(
            await this.db.execute(sql`SELECT nextval(pg_get_serial_sequence('orders', 'id')) AS id`)
        );
        if (!row) throw new Error("The orders id sequence returned nothing");
        return Number(row.id);
    }

    async insert(order: Order): Promise<Order> {
        const [row] = await this.db.insert(orders).values(order).returning();
        if (!row) throw new Error("INSERT ... RETURNING returned no row");
        return toOrder(row);
    }

    async update(id: number, changes: OrderChanges): Promise<Order | undefined> {
        // Drizzle refuses an empty SET, and undefined fields mean "leave as is".
        const defined = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
        if (Object.keys(defined).length === 0) return this.findById(id);

        const [row] = await this.db.update(orders).set(defined).where(eq(orders.id, id)).returning();
        return row && toOrder(row);
    }

    async delete(id: number): Promise<boolean> {
        const rows = await this.db.delete(orders).where(eq(orders.id, id)).returning({ id: orders.id });
        return rows.length > 0;
    }
}
