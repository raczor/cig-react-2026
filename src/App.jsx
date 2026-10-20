// App pide los datos con el hook useFetch. Ningun dato esta escrito en el codigo:
// todo sale de la API que levanta npm run api.
import { useState } from "react";
import BarraFiltros from "./components/BarraFiltros.jsx";
import FormularioOrden from "./components/FormularioOrden.jsx";

import Panel from "./components/Panel.jsx";
import ResumenOrdenes from "./components/ResumenOrdenes.jsx";
import ListaOrdenes from "./components/ListaOrdenes.jsx";
import "./App.css";

import { obtenerOrdenes, crearOrden, cambiarEstado } from "./services/ordenes.js";
import { useFetch } from "./hooks/useFetch.js";

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

  // Carga desde la API: el bloque useState + useEffect de la sesion 4
  // ahora vive en src/hooks/useFetch.js.
  const {
    datos,
    setDatos: setOrdenes,
    cargando,
    error,
    recargar,
  } = useFetch(obtenerOrdenes);

  // datos es null mientras carga: la lista recibe [] para que .map no falle.
  const ordenes = datos ?? [];

  const [busqueda, setBusqueda] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [criterio, setCriterio] = useState("fecha");

  // ALTA: espera al servidor. Entra al estado la orden que devolvio la API,
  // con el id y el codigo que asigno el servidor.
  async function agregarOrden(datosNuevos) {
    const creada = await crearOrden(datosNuevos);
    setOrdenes((anteriores) => [...anteriores, creada]);
  }

  // COMPLETAR: PATCH del campo estado; la lista recibe la orden actualizada.
  async function completarOrden(id) {
    const actualizada = await cambiarEstado(id, "completada");
    setOrdenes((anteriores) =>
      anteriores.map((o) => (o.id === id ? actualizada : o))
    );
  }


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
        {cargando ? (
          <p className="mensaje mensaje--cargando">Cargando ordenes...</p>
        ) : error ? (
          <div className="mensaje mensaje--error">
            <p>No se pudo cargar: {error}</p>
            <p>Revise que la terminal de npm run api siga corriendo.</p>
            <button className="boton" type="button" onClick={recargar}>
              Reintentar
            </button>
          </div>
        ) : (
          <ListaOrdenes
            ordenes={ordenesVisibles}
            onCompletar={completarOrden}
            mensajeVacio="Ninguna orden coincide con los filtros."
          />
        )}

      </Panel>

      <Panel titulo="Registrar orden">
        <FormularioOrden onAgregar={agregarOrden} />
      </Panel>

    </div>
  );
}

export default App;
