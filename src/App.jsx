// App pide los datos con TanStack Query (src/hooks/useOrdenes.js). Ningun dato
// esta escrito en el codigo: todo sale de la API que levanta npm run api.
import { useState } from "react";
import BarraFiltros from "./components/BarraFiltros.jsx";
import FormularioOrden from "./components/FormularioOrden.jsx";

import Panel from "./components/Panel.jsx";
import ResumenOrdenes from "./components/ResumenOrdenes.jsx";
import ListaOrdenes from "./components/ListaOrdenes.jsx";
import "./App.css";

import { useOrdenes, useCrearOrden, useCompletarOrden } from "./hooks/useOrdenes.js";

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Una funcion de comparacion por cada criterio de orden.
const COMPARADORES = {
  fecha: (a, b) => b.fecha.localeCompare(a.fecha), // mas recientes primero
  monto: (a, b) => b.monto - a.monto, // mayor monto primero
  codigo: (a, b) => a.codigo.localeCompare(b.codigo),
};

function App() {

  // isPending: todavia no hay datos. error es un objeto Error, no un texto.
  // refetch repite la peticion (el boton Reintentar).
  const { data, isPending, error, refetch } = useOrdenes();
  const crear = useCrearOrden();
  const completar = useCompletarOrden();

  // data es undefined mientras carga: la lista recibe [] para que .map no falle.
  const ordenes = data ?? [];

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
    <div className="contenedor">
      <header className="cabecera">
        <p className="cabecera__etiqueta">Serviclima, S.A.</p>
        <h1>Panel de ordenes de servicio</h1>
      </header>

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

        {/* Completar es optimista (ver useCompletarOrden): si el servidor falla,
            la orden vuelve a su estado y el error queda en la mutacion. */}
        {completar.isError && (
          <p className="mensaje mensaje--error aviso">
            No se pudo completar la orden: {completar.error.message}
          </p>
        )}
        {isPending ? (
          <p className="mensaje mensaje--cargando">Cargando ordenes...</p>
        ) : error ? (
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
            onCompletar={completar.mutate}
            mensajeVacio="Ninguna orden coincide con los filtros."
          />
        )}

      </Panel>

      <Panel titulo="Registrar orden">
        {/* mutateAsync devuelve una promesa: el formulario la espera,
            deshabilita el boton y muestra el error si falla. */}
        <FormularioOrden onGuardar={crear.mutateAsync} textoBoton="Registrar orden" />
      </Panel>

    </div>
  );
}

export default App;
