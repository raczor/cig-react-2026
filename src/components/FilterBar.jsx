import { DEPARTMENTS } from "../data/catalogs.js";
import "./FilterBar.css";

// Controlled component: it holds no state of its own.
function FilterBar({ search, department, sort, onSearchChange, onDepartmentChange, onSortChange }) {
    return (
        <div className="filters">
            <label className="field">
                <span className="field__label">Buscar por código o cliente</span>
                <input
                    className="field__control"
                    type="search"
                    placeholder="OS-2026-001 o Hotel"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </label>

            <label className="field">
                <span className="field__label">Departamento</span>
                <select
                    className="field__control"
                    value={department}
                    onChange={(event) => onDepartmentChange(event.target.value)}
                >
                    <option value="">Todos</option>
                    {DEPARTMENTS.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span className="field__label">Ordenar por</span>
                <select
                    className="field__control"
                    value={sort}
                    onChange={(event) => onSortChange(event.target.value)}
                >
                    <option value="date">Más recientes</option>
                    <option value="amount">Mayor monto</option>
                    <option value="code">Código</option>
                </select>
            </label>
        </div>
    );
}

export default FilterBar;
