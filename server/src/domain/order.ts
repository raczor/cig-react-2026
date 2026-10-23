import type { OrderStatus } from "../../../shared/catalog.js";
import type { OrderInput } from "../../../shared/order-schema.js";

// An order as the business sees it: the fields a client may edit, plus the ones the server owns.
export interface Order extends OrderInput {
    readonly id: number;
    readonly code: string;
    status: OrderStatus;
}

// What can be changed on an existing order: any of the editable fields and the status.
// Fields that are not present (or undefined) are left as they are.
export type OrderChanges = Partial<OrderInput> & { status?: OrderStatus | undefined };

export class OrderNotFoundError extends Error {
    constructor(readonly orderId: number) {
        super(`Order ${orderId} not found`);
        this.name = "OrderNotFoundError";
    }
}
