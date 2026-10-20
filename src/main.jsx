import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";

// Los estilos globales se importan una sola vez, aqui.
// El orden importa: variables primero, porque global.css las usa.
import "./styles/variables.css";
import "./styles/global.css";

// createRoot toma el div#root de index.html y monta ahi el arbol de componentes.
// StrictMode es una ayuda de desarrollo: ejecuta los efectos dos veces para
// detectar errores. No se ejecuta asi en produccion. Se explica en la sesion 4.
// QueryClient guarda el cache de todas las consultas. Se crea una sola vez.
// retry: 1 muestra el error despues de un reintento (el valor por defecto es 3).
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
