import { useState } from "react";
import EtiquetaEstado from "./EtiquetaEstado.jsx";
import "./TarjetaOrden.css";

// Recibe UNA orden por props. No importa datos.js: por eso sigue sirviendo
// cuando en la sesion 4 los datos lleguen por HTTP.
function TarjetaOrden({ orden, moneda = "Q" }) {
    // Desestructuracion: cada campo de la orden pasa a ser una constante.
    const { codigo, cliente, nit, departamento, categoria, tecnico } = orden;
    const { fecha, horas, monto, estado } = orden;

    // Estado local: cada tarjeta recuerda si esta expandida, sin afectar a las demas.
    const [expandida, setExpandida] = useState(false);

    // Valores derivados. Se calculan aqui, no se modifican sobre la prop.
    // El "T00:00:00" evita que la fecha se corra un dia por la zona horaria.
    const fechaLocal = new Date(fecha + "T00:00:00").toLocaleDateString("es-GT");
    const montoLocal = monto.toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

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

                {/* Los detalles solo se muestran cuando la tarjeta esta expandida. */}
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

            {/* Renderizado condicional: la nota solo aparece si se cumple la condicion. */}
            {horas > 8 && <p className="tarjeta__aviso">Jornada extendida</p>}

            <p className="tarjeta__monto">
                {moneda} {montoLocal}
            </p>

            <button
                type="button"
                className="boton boton--secundario tarjeta__boton"
                aria-expanded={expandida}
                onClick={() => setExpandida((actual) => !actual)}
            >
                {expandida ? "Ver menos" : "Ver mas"}
            </button>
        </article>
    );
}

export default TarjetaOrden;