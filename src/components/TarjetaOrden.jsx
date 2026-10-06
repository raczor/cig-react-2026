function TarjetaOrden() {
    const orden = {
        codigo: "OS-2026-0042",
        cliente: "Clinica Santa Lucia",
        monto: 1875.5
    }

    return (
        <div className="tarjeta">
            <h3>{orden.codigo}</h3>
            <p>Cliente: {orden.cliente}</p>
            <p>Monto: Q {orden.monto.toFixed(2)}</p>
        </div>
    )
}

export default TarjetaOrden;
