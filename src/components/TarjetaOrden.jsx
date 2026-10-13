import { useState } from "react";
import EtiquetaEstado from "./EtiquetaEstado.jsx";
import "./TarjetaOrden.css";

// Recibe UNA orden por props. No importa datos.js: por eso sigue sirviendo
// cuando en la sesion 4 los datos lleguen por HTTP.
function TarjetaOrden({ orden, moneda = "Q", onCompletar }) {
    // Estado LOCAL: solo esta tarjeta necesita saber si esta expandida.
    const [expandida, setExpandida] = useState(false);

    // Desestructuracion: cada campo de la orden pasa a ser una constante.
    const { id, codigo, cliente, nit, departamento, categoria, tecnico } = orden;
    const { fecha, horas, monto, estado } = orden;

    // Valores derivados. Se calculan aqui, no se modifican sobre la prop.
    // El "T00:00:00" evita que la fecha se corra un dia por la zona horaria.
    const fechaLocal = new Date(fecha + "T00:00:00").toLocaleDateString("es-GT");
    const montoLocal = monto.toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const puedeCompletar = estado === "pendiente" || estado === "en proceso";

    return (
        <article className="tarjeta">
            <header className="tarjeta__encabezado">
                <h3 className="tarjeta__codigo">{codigo}</h3>
                <EtiquetaEstado estado={estado} />
            </header>

            <p className="tarjeta__cliente">{cliente}</p>

            <dl className="tarjeta__datos">
                <dt>Departamento</dt>
                <dd>{departamento}</dd>
                <dt>Categoria</dt>
                <dd>{categoria}</dd>
                <dt>Fecha</dt>
                <dd>{fechaLocal}</dd>
                {/* Renderizado condicional con el estado local */}
                {expandida && (
                    <>
                        <dt>NIT</dt>
                        <dd>{nit}</dd>
                        <dt>Tecnico</dt>
                        <dd>{tecnico}</dd>
                        <dt>Horas</dt>
                        <dd>{horas}</dd>
                    </>
                )}
            </dl>

            {horas > 8 && <p className="tarjeta__aviso">Jornada extendida</p>}

            <p className="tarjeta__monto">
                {moneda} {montoLocal}
            </p>

            <div className="tarjeta__acciones">
                {/* Se pasa una funcion; no se llama aqui. */}
                <button
                    type="button"
                    className="boton boton--secundario tarjeta__boton"
                    onClick={() => setExpandida((valor) => !valor)}
                >
                    {expandida ? "Ver menos" : "Ver mas"}
                </button>

                {/* El hijo avisa al padre: llama a la funcion que recibio por props. */}
                {onCompletar && puedeCompletar && (
                    <button
                        type="button"
                        className="boton tarjeta__boton"
                        onClick={() => onCompletar(id)}
                    >
                        Completar
                    </button>
                )}
            </div>
        </article>
    );
}

export default TarjetaOrden;
