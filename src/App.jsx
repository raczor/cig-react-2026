import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ListadoOrdenes from "./pages/ListadoOrdenes.jsx";
import NuevaOrden from "./pages/NuevaOrden.jsx";
import DetalleOrden from "./pages/DetalleOrden.jsx";
import EditarOrden from "./pages/EditarOrden.jsx";

import "./App.css";

// App ya no guarda estado ni pide datos: solo decide que vista se dibuja.
// Lo que antes estaba aqui ahora vive en pages/ListadoOrdenes.jsx.
function App() {
  return (
    <Routes>
      {/* Ruta de diseno: Layout se dibuja siempre y sus hijas entran en su Outlet */}
      <Route element={<Layout />}>
        {/* index: la ruta "/" */}
        <Route index element={<ListadoOrdenes />} />
        {/* Fija: gana a ordenes/:id aunque las dos coincidan con /ordenes/nueva */}
        <Route path="ordenes/nueva" element={<NuevaOrden />} />
        <Route path="ordenes/:id" element={<DetalleOrden />} />
        <Route path="ordenes/:id/editar" element={<EditarOrden />} />
      </Route>
    </Routes>
  );
}

export default App;
