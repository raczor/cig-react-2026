// Componente de presentacion puro: recibe un texto y devuelve la etiqueta de color.
// No sabe nada de ordenes de servicio: por eso se reutiliza en otro lugar.

function EtiquetaEstado({ estado }) {
    // Traduce el valor del dato al nombre de clase que corresponde.
    // Estas clases ya existen en src/styles/global.css, no hay que escribirlas.
    const clases = {
        pendiente: "etiqueta etiqueta--pendiente",
        "en proceso": "etiqueta etiqueta--proceso",
        completada: "etiqueta etiqueta--completada",
        cancelada: "etiqueta etiqueta--cancelada",
    };

    // Si llega un estado que no esta en la lista, la etiqueta se dibuja sin color
    // en lugar de quedar con className undefined.
    return <span className={clases[estado] || "etiqueta"}>{estado}</span>;
}

export default EtiquetaEstado;