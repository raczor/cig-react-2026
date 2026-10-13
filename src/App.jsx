// Componente raiz de la aplicacion.
// Esta pantalla de bienvenida existe para confirmar que el entorno quedo bien
// instalado. A partir de la sesion 2 se reemplaza por el panel de gestion.

import "./App.css";
import TarjetaOrden from "./components/TarjetaOrden.jsx";
import EtiquetaEstado from "./components/EtiquetaEstado.jsx";
import ResumenOrdenes from "./components/ResumenOrdenes.jsx";
import { ordenes } from "../db.json";

function App() {
  // Valor leido del archivo .env. Si aparece "no configurada", falta copiar
  // .env.example como .env. Se usa de verdad hasta la sesion 4.
  const urlApi = import.meta.env.VITE_API_URL || "no configurada";

  return (
    <div className="bienvenida">
      
      <p className="bienvenida__etiqueta">Colegio de Ingenieros de Guatemala</p>

      <h1 className="bienvenida__titulo">Ordenes</h1>

      <ResumenOrdenes ordenes={ordenes} />

      {
        ordenes.map((orden) => {
          return <>
            <div className="bienvenida__tarjeta">
              <TarjetaOrden key={orden.id} orden={orden} />
            </div>
          </>
        })
      }      

      <p className="bienvenida__nota">
        Proyecto del curso: panel de gestion de ordenes de servicio de
        Serviclima, S.A.
      </p>
    </div>
  );
}

export default App;
