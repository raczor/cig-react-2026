import type { Order } from "../../server/src/domain/order.js";
import type { OrderInput } from "../../shared/order-schema.js";

// A valid body for POST /api/orders and for OrderService.create.
export const validInput: OrderInput = {
    client: "Hotel Mirador",
    taxId: "1234567-8",
    department: "Guatemala",
    category: "repair",
    technician: "Ana Pérez",
    date: "2026-10-14",
    hours: 4,
    amount: 150.5,
};

export function makeOrder(overrides: Partial<Order> = {}): Order {
    return { ...validInput, id: 1, code: "OS-2026-001", status: "pending", ...overrides };
}
