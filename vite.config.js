import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Front end tests sit next to their components in src/; server and shared tests live in tests/.
    include: ["src/**/*.test.{js,jsx}", "tests/**/*.test.ts"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
  },
  server: {
    port: 5173,
    open: true,
    // The local API can keep its database in .data/; writes there must not reload the app.
    watch: { ignored: ["**/.data/**"] },
  },
});
