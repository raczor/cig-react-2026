import { useSearchParams } from "react-router-dom";
import FilterBar from "../components/FilterBar.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import OrderList from "../components/OrderList.jsx";
import { DEPARTMENTS, STATUS_LABELS } from "../data/catalogs.js";
import "./OrdersPage.css";
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

    // Filters live in the URL (?q=&department=&status=&sort=) so they survive visiting
    // a detail page and can be shared. q is set by the search box in the header.
    const [params, setParams] = useSearchParams();
    const search = params.get("q") ?? "";
    const requestedDepartment = params.get("department");
    const department = DEPARTMENTS.includes(requestedDepartment) ? requestedDepartment : "";
    const requestedStatus = params.get("status");
    const status = Object.hasOwn(STATUS_LABELS, requestedStatus) ? requestedStatus : "";
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
        .filter((order) => status === "" || order.status === status)
        .filter(
            (order) => normalize(order.code).includes(text) || normalize(order.client).includes(text)
        );

    const hasFilters = search !== "" || department !== "" || status !== "";

    return (
        <>
            <OrderSummary orders={visibleOrders} />

            <div className="catalog">
                <FilterBar
                    department={department}
                    status={status}
                    hasFilters={hasFilters}
                    onDepartmentChange={(value) => setFilter("department", value)}
                    onStatusChange={(value) => setFilter("status", value)}
                    onClear={() => setParams({}, { replace: true })}
                />

                <section className="catalog__results" aria-label="Resultados">
                    <div className="results-bar">
                        <p className="results-bar__count">
                            {visibleOrders.length} de {orders.length} órdenes
                            {search && <> para <strong>&ldquo;{search}&rdquo;</strong></>}
                        </p>
                        <label className="results-bar__sort">
                            Ordenar por
                            <select
                                className="field__control"
                                value={sort}
                                onChange={(event) => setFilter("sort", event.target.value)}
                            >
                                <option value="date">Más recientes</option>
                                <option value="amount">Mayor monto</option>
                                <option value="code">Código</option>
                            </select>
                        </label>
                    </div>

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
                </section>
            </div>
        </>
    );
}

export default OrdersPage;
