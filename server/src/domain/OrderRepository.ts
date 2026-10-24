import type { Order, OrderChanges } from "./order.js";

// What the application needs from storage. Nothing here mentions SQL, so the service can be
// tested with an in-memory fake and the database can change without touching the use cases.
export interface OrderRepository {
    findAll(): Promise<Order[]>;
    findById(id: number): Promise<Order | undefined>;
    /** Reserves the next id. Ids are never reused, even after a failed or deleted order. */
    nextId(): Promise<number>;
    insert(order: Order): Promise<Order>;
    update(id: number, changes: OrderChanges): Promise<Order | undefined>;
    /** True when an order was deleted, false when there was none with that id. */
    delete(id: number): Promise<boolean>;
}
