import type { OrderStatus } from "../../../shared/catalog.js";
import type { OrderInput, OrderReplace } from "../../../shared/order-schema.js";
import { OrderNotFoundError, type Order } from "../domain/order.js";
import type { OrderCodeGenerator } from "../domain/orderCode.js";
import type { OrderRepository } from "../domain/OrderRepository.js";

// The use cases of the application. It knows the rules (the server owns id, code and the initial
// status) but nothing about HTTP or SQL: both arrive through the constructor.
export class OrderService {
    constructor(
        private readonly orders: OrderRepository,
        private readonly codes: OrderCodeGenerator
    ) {}

    list(): Promise<Order[]> {
        return this.orders.findAll();
    }

    async get(id: number): Promise<Order> {
        return this.orFail(id, await this.orders.findById(id));
    }

    // Whatever the client sends for id, code or status never reaches this point: the schema drops it.
    async create(input: OrderInput): Promise<Order> {
        const id = await this.orders.nextId();
        return this.orders.insert({ ...input, id, code: this.codes.generate(id), status: "pending" });
    }

    // Replaces the editable fields; id and code never change, and a missing status keeps the stored one.
    async replace(id: number, changes: OrderReplace): Promise<Order> {
        return this.orFail(id, await this.orders.update(id, changes));
    }

    // One statement that touches only the status, so a concurrent edit of other fields is not undone.
    async changeStatus(id: number, status: OrderStatus): Promise<Order> {
        return this.orFail(id, await this.orders.update(id, { status }));
    }

    async remove(id: number): Promise<void> {
        if (!(await this.orders.delete(id))) throw new OrderNotFoundError(id);
    }

    private orFail(id: number, order: Order | undefined): Order {
        if (!order) throw new OrderNotFoundError(id);
        return order;
    }
}
