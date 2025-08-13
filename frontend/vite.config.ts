import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // important if running in Docker for local dev
  },
  build: {
    outDir: "dist", // default, but ensure it's not 'build' like CRA
  },
});
