import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Config próprio para testes, separado de vite.config.ts — este último regista
// plugins de build (sitemap/prerender) que só fazem sentido num `vite build`
// real, nunca durante `vitest run`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    globals: true,
  },
});
