// Componente de presentacion puro: muestra un numero grande y su descripcion.
// No calcula nada; el valor ya llega listo por props.

function Indicador({ valor, etiqueta }) {
    return (
        <div className="indicador">
            <p className="indicador__valor">{valor}</p>
            <p className="indicador__etiqueta">{etiqueta}</p>
        </div>
    );
}

export default Indicador;
