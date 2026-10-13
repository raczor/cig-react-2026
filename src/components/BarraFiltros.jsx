import { DEPARTAMENTOS } from "../data/catalogos.js";
import "./BarraFiltros.css";

// Componente controlado: NO guarda estado propio.
// Muestra los valores que recibe de App y avisa a App cada vez que cambian.
function BarraFiltros({
    busqueda,
    departamento,
    criterio,
    onBusquedaChange,
    onDepartamentoChange,
    onCriterioChange,
}) {
    return (
        <div className="filtros">
            <label className="campo">
                <span className="campo__etiqueta">Buscar por codigo o cliente</span>
                <input
                    className="campo__control"
                    type="search"
                    placeholder="OS-2026-001 o Hotel"
                    value={busqueda}
                    onChange={(evento) => onBusquedaChange(evento.target.value)}
                />
            </label>

            <label className="campo">
                <span className="campo__etiqueta">Departamento</span>
                <select
                    className="campo__control"
                    value={departamento}
                    onChange={(evento) => onDepartamentoChange(evento.target.value)}
                >
                    <option value="">Todos</option>
                    {DEPARTAMENTOS.map((nombre) => (
                        <option key={nombre} value={nombre}>
                            {nombre}
                        </option>
                    ))}
                </select>
            </label>

            <label className="campo">
                <span className="campo__etiqueta">Ordenar por</span>
                <select
                    className="campo__control"
                    value={criterio}
                    onChange={(evento) => onCriterioChange(evento.target.value)}
                >
                    <option value="fecha">Mas recientes</option>
                    <option value="monto">Mayor monto</option>
                    <option value="codigo">Codigo</option>
                </select>
            </label>
        </div>
    );
}

export default BarraFiltros;
