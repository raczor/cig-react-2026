// Componente raiz de la aplicacion: panel de ordenes de servicio.

import "./App.css";
import TarjetaOrden from "./components/TarjetaOrden.jsx";
import ResumenOrdenes from "./components/ResumenOrdenes.jsx";
import { ordenes } from "../db.json";

function App() {
  return (
    <div className="contenedor panel">
      <header className="panel__encabezado">
        <p className="panel__etiqueta">Serviclima, S.A. · Colegio de Ingenieros de Guatemala</p>
        <h1 className="panel__titulo">Ordenes</h1>
      </header>

      <section className="seccion">
        <h2 className="seccion__titulo">Resumen</h2>
        <ResumenOrdenes ordenes={ordenes} />
      </section>

      <section className="seccion">
        <div className="seccion__encabezado">
          <h2 className="seccion__titulo">Ordenes registradas</h2>
          <span className="seccion__contador">{ordenes.length}</span>
        </div>

        <div className="lista-ordenes">
          {ordenes.map((orden) => (
            <TarjetaOrden key={orden.id} orden={orden} />
          ))}
        </div>
      </section>

      <p className="panel__nota">
        Proyecto del curso: panel de gestion de ordenes de servicio de
        Serviclima, S.A.
      </p>
    </div>
  );
}

export default App;
