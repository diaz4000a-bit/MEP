import path from "node:path";
import { defineConfig } from "vitest/config";

// Suite separada para pruebas que necesitan el emulador de Firebase (reglas de Firestore,
// y más adelante Server Actions/Auth contra el Admin SDK apuntado al emulador). Se corre
// con `npm run test:integration`, que envuelve `vitest run -c vitest.integration.config.ts`
// dentro de `firebase emulators:exec`.
export default defineConfig({
  resolve: {
    // Mismo mapeo que tsconfig.json ("@/*" -> "./src/*"), necesario para cuando las próximas
    // pruebas de Server Actions importen código de `src/` (ver vitest.config.ts).
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
