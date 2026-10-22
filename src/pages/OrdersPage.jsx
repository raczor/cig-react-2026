import { useSearchParams } from "react-router-dom";
import KanbanBoard from "../components/KanbanBoard.jsx";
import { DEPARTMENTS } from "../data/catalogs.js";
import { useOrders, useChangeStatus } from "../hooks/useOrders.js";
import Alert from "../components/ui/Alert.jsx";
import Button from "../components/ui/Button.jsx";
import { controlClass } from "../components/ui/styles.js";

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

    const selectClass = `${controlClass} !w-auto min-w-44 !py-1.5 font-normal`;

    return (
        <>
            <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
                <p className="m-0 min-w-48 flex-1 self-center">
                    {visibleOrders.length} de {orders.length} órdenes
                    {search && <> para <strong>&ldquo;{search}&rdquo;</strong></>}
                </p>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
                    Departamento
                    <select
                        className={selectClass}
                        value={department}
                        onChange={(event) => setFilter("department", event.target.value)}
                    >
                        <option value="">Todos</option>
                        {DEPARTMENTS.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
                    Ordenar por
                    <select
                        className={selectClass}
                        value={sort}
                        onChange={(event) => setFilter("sort", event.target.value)}
                    >
                        <option value="date">Más recientes</option>
                        <option value="amount">Mayor monto</option>
                        <option value="code">Código</option>
                    </select>
                </label>

                {hasFilters && (
                    <Button variant="secondary" size="sm" onClick={() => setParams({}, { replace: true })}>
                        Limpiar filtros
                    </Button>
                )}
            </div>

            {notice && <Alert variant="error" className="mb-4">{notice}</Alert>}

            {isPending ? (
                <Alert>Cargando órdenes...</Alert>
            ) : !data ? (
                // Only without data does the error replace the board; if a refetch
                // fails later, TanStack Query keeps the previous list.
                <Alert variant="error">
                    <p className="mb-2">No se pudo cargar: {error.message}</p>
                    <p className="mb-3">Revisa que la terminal de npm run api siga corriendo.</p>
                    <Button onClick={() => refetch()}>Reintentar</Button>
                </Alert>
            ) : (
                <KanbanBoard orders={visibleOrders} onMove={changeStatus} />
            )}
        </>
    );
}

export default OrdersPage;
