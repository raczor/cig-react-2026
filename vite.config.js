import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // SESION 6 - DESPLIEGUE
  // GitHub Pages publica en https://jinchuika.github.io/cig-react-2026/
  // El workflow (.github/workflows/deploy.yml) envia BASE_PATH con ese nombre.
  // En su computadora BASE_PATH no existe y se usa "/".
  // Sin esto la pagina publicada carga en blanco.
  base: process.env.BASE_PATH ?? "/",

  server: {
    port: 5173,
    open: true, // abre el navegador automaticamente al ejecutar npm run dev
  },
});
