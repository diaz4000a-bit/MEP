import { generateKeyPairSync } from "node:crypto";
import path from "node:path";
import { defineConfig } from "vitest/config";

// src/lib/firebase/admin.ts exige FIREBASE_SERVICE_ACCOUNT_B64 y lanza si falta, aunque el
// Admin SDK vaya a apuntar al emulador (FIRESTORE_EMULATOR_HOST, que `firebase emulators:exec`
// ya inyecta solo) y nunca llame a una API real de Google. Se genera una clave RSA real (no un
// placeholder) para que `cert()` no falle al parsear el PEM al inicializar la app.
const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs1", format: "pem" },
  publicKeyEncoding: { type: "pkcs1", format: "pem" },
});
const credencialFalsa = Buffer.from(
  JSON.stringify({
    project_id: "demo-mep-manager",
    client_email: "test@demo-mep-manager.iam.gserviceaccount.com",
    private_key: privateKey,
  }),
).toString("base64");

// Suite separada para pruebas que necesitan el emulador de Firebase (reglas de Firestore,
// Server Actions contra el Admin SDK apuntado al emulador). Se corre con
// `npm run test:integration`, que envuelve `vitest run -c vitest.integration.config.mts`
// dentro de `firebase emulators:exec`.
export default defineConfig({
  resolve: {
    alias: {
      // Mismo mapeo que tsconfig.json ("@/*" -> "./src/*"), necesario para las pruebas de
      // Server Actions que importan código de `src/` (ver vitest.config.mts).
      "@": path.resolve(import.meta.dirname, "./src"),
      // `server-only` lanza fuera del bundler de Next.js; en Vitest (Node puro) no aplica.
      "server-only": path.resolve(import.meta.dirname, "tests/integration/helpers/server-only-stub.ts"),
    },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 20_000,
    hookTimeout: 20_000,
    env: { FIREBASE_SERVICE_ACCOUNT_B64: credencialFalsa },
    // Todos los archivos comparten el MISMO emulador de Firestore (recurso externo real, no
    // aislado por worker). El `beforeEach` de cada archivo hace un `recursiveDelete` global;
    // en paralelo, el limpiado de un archivo borra los datos de un test en vuelo de otro.
    fileParallelism: false,
  },
});
