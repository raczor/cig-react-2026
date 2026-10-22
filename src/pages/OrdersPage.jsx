import { useSearchParams } from "react-router-dom";
import FilterBar from "../components/FilterBar.jsx";
import Panel from "../components/Panel.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import OrderList from "../components/OrderList.jsx";
import { DEPARTMENTS } from "../data/catalogs.js";
import { useOrders, useCompleteOrder } from "../hooks/useOrders.js";

// Strips accents and case so "Panajachel" matches "panajachel" and "Sacatepéquez" matches "sacatepequez".
function normalize(text) {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const SORTERS = {
    date: (a, b) => b.date.localeCompare(a.date),
    amount: (a, b) => b.amount - a.amount,
    code: (a, b) => a.code.localeCompare(b.code),
};

function OrdersPage() {
    const { data, isPending, error, refetch } = useOrders();
    const { complete, notice } = useCompleteOrder();
    const orders = data ?? [];

    // Filters live in the URL (?q=&department=&sort=) so they survive visiting
    // a detail page and can be shared.
    const [params, setParams] = useSearchParams();
    const search = params.get("q") ?? "";
    const requestedDepartment = params.get("department");
    const department = DEPARTMENTS.includes(requestedDepartment) ? requestedDepartment : "";
    const requestedSort = params.get("sort");
    const sort = Object.hasOwn(SORTERS, requestedSort) ? requestedSort : "date";

    // An empty value removes the param. `replace` keeps typing out of the history stack.
    function setFilter(key, value) {
        setParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                if (value === "") next.delete(key);
                else next.set(key, value);
                return next;
            },
            { replace: true }
        );
    }

    const text = normalize(search.trim());
    const visibleOrders = [...orders]
        .sort(SORTERS[sort])
        .filter((order) => department === "" || order.department === department)
        .filter(
            (order) => normalize(order.code).includes(text) || normalize(order.client).includes(text)
        );

    return (
        <>
            <Panel title="Resumen">
                <OrderSummary orders={visibleOrders} />
            </Panel>

            <Panel title={`Órdenes registradas (${visibleOrders.length} de ${orders.length})`}>
                <FilterBar
                    search={search}
                    department={department}
                    sort={sort}
                    onSearchChange={(value) => setFilter("q", value)}
                    onDepartmentChange={(value) => setFilter("department", value)}
                    onSortChange={(value) => setFilter("sort", value)}
                />

                {notice && <p className="message message--error" role="alert">{notice}</p>}

                {isPending ? (
                    <p className="message message--loading">Cargando órdenes...</p>
                ) : !data ? (
                    // Only without data does the error replace the list; if a refetch
                    // fails later, TanStack Query keeps the previous list.
                    <div className="message message--error" role="alert">
                        <p>No se pudo cargar: {error.message}</p>
                        <p>Revisa que la terminal de npm run api siga corriendo.</p>
                        <button className="button" type="button" onClick={() => refetch()}>
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <OrderList
                        orders={visibleOrders}
                        onComplete={complete}
                        emptyMessage="Ninguna orden coincide con los filtros."
                    />
                )}
            </Panel>
        </>
    );
}

export default OrdersPage;
