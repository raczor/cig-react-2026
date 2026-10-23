import type { Order, OrderChanges } from "../../server/src/domain/order.js";
import type { OrderRepository } from "../../server/src/domain/OrderRepository.js";

// A fake that keeps orders in a Map. It lets OrderService be tested without a database,
// which is the point of depending on the OrderRepository interface.
export class InMemoryOrderRepository implements OrderRepository {
    private readonly rows = new Map<number, Order>();
    private lastId: number;

    constructor(seed: Order[] = []) {
        for (const order of seed) this.rows.set(order.id, { ...order });
        this.lastId = Math.max(0, ...seed.map((order) => order.id));
    }

    async findAll(): Promise<Order[]> {
        return [...this.rows.values()].sort((a, b) => a.id - b.id);
    }

    async findById(id: number): Promise<Order | undefined> {
        const order = this.rows.get(id);
        return order && { ...order };
    }

    async nextId(): Promise<number> {
        return ++this.lastId;
    }

    async insert(order: Order): Promise<Order> {
        this.rows.set(order.id, { ...order });
        return { ...order };
    }

    async update(id: number, changes: OrderChanges): Promise<Order | undefined> {
        const current = this.rows.get(id);
        if (!current) return undefined;
        const defined = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
        const updated = { ...current, ...defined };
        this.rows.set(id, updated);
        return { ...updated };
    }

    async delete(id: number): Promise<boolean> {
        return this.rows.delete(id);
    }
}
