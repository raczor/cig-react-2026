// Resumen de las ordenes: recibe la lista por props y calcula los totales.
// Los totales no se guardan en estado: se derivan de la lista en cada render.

import Indicador from "./Indicador.jsx";
import "./ResumenOrdenes.css";

function ResumenOrdenes({ ordenes }) {
    const completadas = ordenes.filter((orden) => orden.estado === "completada").length;
    const pendientes = ordenes.filter((orden) => orden.estado === "pendiente").length;
    const montoTotal = ordenes.reduce((suma, orden) => suma + orden.monto, 0);

    return (
        <section className="resumen">
            <Indicador valor={ordenes.length} etiqueta="Ordenes" />
            <Indicador valor={completadas} etiqueta="Completadas" />
            <Indicador valor={pendientes} etiqueta="Pendientes" />
            <Indicador valor={`Q ${montoTotal.toLocaleString("es-GT")}`} etiqueta="Monto total" />
        </section>
    );
}

export default ResumenOrdenes;
