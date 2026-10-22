import { useState } from "react";
import { DEPARTMENTS, STATUS_LABELS } from "../data/catalogs.js";
import "./FilterBar.css";

// Controlled sidebar: it holds no state of its own. "" means "any".
function FilterBar({ department, status, onDepartmentChange, onStatusChange, onClear, hasFilters }) {
    // Collapsed on small screens so the results are not pushed down the page.
    const [open] = useState(() => !window.matchMedia("(max-width: 860px)").matches);

    return (
        <details className="filters" open={open}>
            {/* Not collapsible on desktop: pointer-events is off in CSS and the keyboard is blocked here. */}
            <summary
                className="filters__summary"
                onClick={(event) => {
                    if (window.matchMedia("(min-width: 861px)").matches) event.preventDefault();
                }}
            >
                Filtros
            </summary>
            <fieldset className="filters__group">
                <legend className="filters__title">Departamento</legend>
                {[["", "Todos"], ...DEPARTMENTS.map((name) => [name, name])].map(([value, label]) => (
                    <label key={value} className="filters__option">
                        <input
                            type="radio"
                            name="department"
                            checked={department === value}
                            onChange={() => onDepartmentChange(value)}
                        />
                        {label}
                    </label>
                ))}
            </fieldset>

            <fieldset className="filters__group">
                <legend className="filters__title">Estado</legend>
                {[["", "Todos"], ...Object.entries(STATUS_LABELS)].map(([value, label]) => (
                    <label key={value} className="filters__option">
                        <input
                            type="radio"
                            name="status"
                            checked={status === value}
                            onChange={() => onStatusChange(value)}
                        />
                        {label}
                    </label>
                ))}
            </fieldset>

            {hasFilters && (
                <button type="button" className="filters__clear" onClick={onClear}>
                    Limpiar filtros
                </button>
            )}
        </details>
    );
}

export default FilterBar;
