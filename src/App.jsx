// Componente raiz de la aplicacion.
// Esta pantalla de bienvenida existe para confirmar que el entorno quedo bien
// instalado. A partir de la sesion 2 se reemplaza por el panel de gestion.

import "./App.css";
import TarjetaOrden from "./components/TarjetaOrden.jsx";

function App() {
  // Valor leido del archivo .env. Si aparece "no configurada", falta copiar
  // .env.example como .env. Se usa de verdad hasta la sesion 4.
  const urlApi = import.meta.env.VITE_API_URL || "no configurada";

  return (
    <div className="bienvenida">
      <p className="bienvenida__etiqueta">Colegio de Ingenieros de Guatemala</p>

      <h1 className="bienvenida__titulo">React para Frontend Profesional</h1>

      <p className="bienvenida__texto">
        <TarjetaOrden />
        El entorno esta funcionando. Si ve esta pantalla, el proyecto quedo
        instalado correctamente y puede llegar a la primera sesion listo para
        programar.
      </p>

      <div className="bienvenida__tarjeta">
        <h2 className="bienvenida__subtitulo">Verificacion del entorno</h2>
        <dl className="bienvenida__lista">
          <dt>Servidor de desarrollo</dt>
          <dd>activo en el puerto 5173</dd>

          <dt>Variable VITE_API_URL</dt>
          <dd>{urlApi}</dd>

          <dt>Backend local</dt>
          <dd>se activa en la sesion 4 con npm run api</dd>
        </dl>
      </div>

      <p className="bienvenida__nota">
        Proyecto del curso: panel de gestion de ordenes de servicio de
        Serviclima, S.A.
      </p>
    </div>
  );
}

export default App;
