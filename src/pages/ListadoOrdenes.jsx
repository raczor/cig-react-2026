import { useState } from "react";
import BarraFiltros from "../components/BarraFiltros.jsx";
import Panel from "../components/Panel.jsx";
import ResumenOrdenes from "../components/ResumenOrdenes.jsx";
import ListaOrdenes from "../components/ListaOrdenes.jsx";
import { useOrdenes, useCompletarOrden } from "../hooks/useOrdenes.js";

// Vista de la ruta "/". Es la App de la sesion 4 casi sin cambios:
// se movio aqui, sin la cabecera (ahora en Layout) y sin el formulario
// (ahora en NuevaOrden).

function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Una funcion de comparacion por cada criterio de orden.
const COMPARADORES = {
    fecha: (a, b) => b.fecha.localeCompare(a.fecha), // mas recientes primero
    monto: (a, b) => b.monto - a.monto, // mayor monto primero
    codigo: (a, b) => a.codigo.localeCompare(b.codigo),
};

function ListadoOrdenes() {
    // isPending: todavia no hay datos. error es un objeto Error.
    // refetch repite la peticion (el boton Reintentar).
    const { data, isPending, error, refetch } = useOrdenes();
    const { completar, aviso } = useCompletarOrden();

    // data es undefined mientras carga: la lista recibe [] para que .map no falle.
    const ordenes = data ?? [];

    // Filtros: estado local de esta vista. Al navegar a otra ruta la vista se
    // desmonta y los filtros se pierden (se resuelve en la sesion 6).
    const [busqueda, setBusqueda] = useState("");
    const [departamento, setDepartamento] = useState("");
    const [criterio, setCriterio] = useState("fecha");

    // DERIVADO: se calcula en cada render. No se guarda en otro useState.
    // [...ordenes] copia el arreglo antes de ordenar: sort modifica el original.
    const texto = normalizar(busqueda.trim());
    const ordenesVisibles = [...ordenes]
        .sort(COMPARADORES[criterio])
        .filter((orden) => departamento === "" || orden.departamento === departamento)
        .filter(
            (orden) =>
                normalizar(orden.codigo).includes(texto) ||
                normalizar(orden.cliente).includes(texto)
        );

    return (
        <>
            <Panel titulo="Resumen">
                <ResumenOrdenes ordenes={ordenesVisibles} />
            </Panel>

            <Panel titulo={`Ordenes registradas (${ordenesVisibles.length} de ${ordenes.length})`}>
                <BarraFiltros
                    busqueda={busqueda}
                    departamento={departamento}
                    criterio={criterio}
                    onBusquedaChange={setBusqueda}
                    onDepartamentoChange={setDepartamento}
                    onCriterioChange={setCriterio}
                />

                {/* Completar es optimista (ver useCompletarOrden): si el servidor
                    falla, la orden vuelve a su estado y aqui se avisa. */}
                {aviso && <p className="mensaje mensaje--error aviso">{aviso}</p>}

                {/* Los cuatro estados, en este orden: cargando, error, vacio, con datos.
            El vacio lo resuelve ListaOrdenes con su salida temprana. */}
                {isPending ? (
                    <p className="mensaje mensaje--cargando">Cargando ordenes...</p>
                ) : !data ? (
                    <div className="mensaje mensaje--error">
                        <p>No se pudo cargar: {error.message}</p>
                        <p>Revise que la terminal de npm run api siga corriendo.</p>
                        <button className="boton" type="button" onClick={() => refetch()}>
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <ListaOrdenes
                        ordenes={ordenesVisibles}
                        onCompletar={completar}
                        mensajeVacio="Ninguna orden coincide con los filtros."
                    />
                )}
            </Panel>
        </>
    );
}

export default ListadoOrdenes;
