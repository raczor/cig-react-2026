import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
  },
  server: {
    port: 5173,
    open: true,
    // json-server rewrites db.json on every save; reloading the app each time would break the UI.
    watch: { ignored: ["**/db.json"] },
  },
});
