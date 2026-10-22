// Strips accents and case so "Panajachel" matches "panajachel" and "Sacatepéquez" matches "sacatepequez".
export function normalize(text) {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export const SORTERS = {
    date: (a, b) => b.date.localeCompare(a.date),
    amount: (a, b) => b.amount - a.amount,
    code: (a, b) => a.code.localeCompare(b.code),
};

// Applies the board filters and the sort. Empty department / search mean "any".
export function filterOrders(orders, { search = "", department = "", sort = "date" }) {
    const text = normalize(search.trim());
    return [...orders]
        .sort(SORTERS[sort])
        .filter((order) => department === "" || order.department === department)
        .filter((order) => normalize(order.code).includes(text) || normalize(order.client).includes(text));
}
