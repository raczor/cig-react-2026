import "./ResumenOrdenes.css";

// Todas las cifras se calculan a partir del arreglo recibido.
// Ninguna esta escrita a mano: si cambian los datos, cambian los numeros.
function ResumenOrdenes({ ordenes = [] }) {
    const total = ordenes.length;
    const completadas = ordenes.filter((orden) => orden.estado === "completada").length;
    const pendientes = ordenes.filter((orden) => orden.estado === "pendiente").length;
    const montoTotal = ordenes.reduce((acumulado, orden) => acumulado + orden.monto, 0);

    const indicadores = [
        { etiqueta: "Ordenes", valor: total },
        { etiqueta: "Completadas", valor: completadas },
        { etiqueta: "Pendientes", valor: pendientes },
        { etiqueta: "Monto total", valor: "Q " + montoTotal.toLocaleString("es-GT") },
    ];

    return (
        <div className="resumen">
            {indicadores.map((indicador) => (
                <div className="resumen__dato" key={indicador.etiqueta}>
                    <p className="resumen__valor">{indicador.valor}</p>
                    <p className="resumen__etiqueta">{indicador.etiqueta}</p>
                </div>
            ))}
        </div>
    );
}

export default ResumenOrdenes;
