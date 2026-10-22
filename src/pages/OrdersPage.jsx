import { useSearchParams } from "react-router-dom";
import KanbanBoard from "../components/KanbanBoard.jsx";
import { DEPARTMENTS } from "../data/catalogs.js";
import { useOrders, useChangeStatus } from "../hooks/useOrders.js";
import "./OrdersPage.css";

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
    const { changeStatus, notice } = useChangeStatus();
    const orders = data ?? [];

    // Filters live in the URL (?q=&department=&sort=) so they survive visiting
    // a detail page and can be shared. q is set by the search box in the top bar.
    const [params, setParams] = useSearchParams();
    const search = params.get("q") ?? "";
    const requestedDepartment = params.get("department");
    const department = DEPARTMENTS.includes(requestedDepartment) ? requestedDepartment : "";
    const requestedSort = params.get("sort");
    const sort = Object.hasOwn(SORTERS, requestedSort) ? requestedSort : "date";

    // An empty value removes the param. `replace` keeps changes out of the history stack.
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

    const hasFilters = search !== "" || department !== "";

    return (
        <>
            <div className="toolbar">
                <p className="toolbar__count">
                    {visibleOrders.length} de {orders.length} órdenes
                    {search && <> para <strong>&ldquo;{search}&rdquo;</strong></>}
                </p>

                <label className="toolbar__control">
                    Departamento
                    <select
                        className="field__control"
                        value={department}
                        onChange={(event) => setFilter("department", event.target.value)}
                    >
                        <option value="">Todos</option>
                        {DEPARTMENTS.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </label>

                <label className="toolbar__control">
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

                {hasFilters && (
                    <button type="button" className="toolbar__clear" onClick={() => setParams({}, { replace: true })}>
                        Limpiar filtros
                    </button>
                )}
            </div>

            {notice && <p className="message message--error" role="alert">{notice}</p>}

            {isPending ? (
                <p className="message message--loading">Cargando órdenes...</p>
            ) : !data ? (
                // Only without data does the error replace the board; if a refetch
                // fails later, TanStack Query keeps the previous list.
                <div className="message message--error" role="alert">
                    <p>No se pudo cargar: {error.message}</p>
                    <p>Revisa que la terminal de npm run api siga corriendo.</p>
                    <button className="button" type="button" onClick={() => refetch()}>
                        Reintentar
                    </button>
                </div>
            ) : (
                <KanbanBoard orders={visibleOrders} onMove={changeStatus} />
            )}
        </>
    );
}

export default OrdersPage;
