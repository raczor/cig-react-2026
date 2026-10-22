export function makeOrder(overrides = {}) {
    return {
        id: 1,
        code: "OS-2026-001",
        client: "Distribuidora La Ceiba",
        taxId: "1234567-8",
        department: "Guatemala",
        category: "repair",
        technician: "Mario Ixcot",
        date: "2026-01-14",
        hours: 3.5,
        amount: 1750,
        status: "pending",
        ...overrides,
    };
}
