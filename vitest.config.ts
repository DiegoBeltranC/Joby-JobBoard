import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Configuración base de Vitest para bolsa-trabajo.
// Entorno `node`: cubre helpers puros (`src/lib`) y lógica de server actions.
// Los tests de componentes (jsdom + Testing Library) se añadirán en su fase.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      // Reporte informativo sobre las capas de lógica; sin umbral (aún no hay CI).
      include: ["src/lib/**", "src/actions/**"],
    },
  },
  resolve: {
    alias: {
      // Espejo del alias `@/` -> `src` que usa el proyecto (tsconfig / Next).
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
