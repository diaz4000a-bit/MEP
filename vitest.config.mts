import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

// Las pruebas de integración (tests/integration/**) necesitan el emulador de Firebase
// corriendo y se ejecutan aparte con `npm run test:integration` (ver vitest.integration.config.ts).
// tests/e2e/** son specs de Playwright (`test`/`describe` de @playwright/test, incompatibles
// con el runner de Vitest) y se ejecutan con `npm run test:e2e`.
// `npm test` debe seguir siendo rápido y no depender de Java/el emulador/un navegador.
export default defineConfig({
  resolve: {
    // Sin este archivo, Vitest resolvía "@/..." por su propio modo "sin config" (lee
    // tsconfig.json de forma implícita). En cuanto existe un vitest.config.ts explícito,
    // esa resolución implícita se apaga y hay que repetir el mismo mapeo de tsconfig.json
    // ("@/*" -> "./src/*") a mano.
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    exclude: [...configDefaults.exclude, "tests/integration/**", "tests/e2e/**"],
  },
});
