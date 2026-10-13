import TarjetaOrden from "./TarjetaOrden.jsx";
import "./ListaOrdenes.css";

// Recibe el arreglo por props. El valor por defecto [] evita que .map
// reviente si el padre todavia no tiene datos que entregar.
function ListaOrdenes({ ordenes = [], mensajeVacio = "No hay ordenes." }) {
    // Salida temprana: el caso de lista vacia se resuelve antes de llegar al map.
    if (ordenes.length === 0) {
        return <p className="mensaje mensaje--vacio">{mensajeVacio}</p>;
    }

    return (
        <div className="lista">
            {ordenes.map((orden) => (
                <TarjetaOrden key={orden.id} orden={orden} />
            ))}
        </div>
    );
}

export default ListaOrdenes;
