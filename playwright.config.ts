import { generateKeyPairSync } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

// Mismo motivo que vitest.integration.config.mts: src/lib/firebase/admin.ts exige
// FIREBASE_SERVICE_ACCOUNT_B64 aunque el Admin SDK del servidor Next vaya a apuntar al
// emulador. Se genera una clave RSA real para que `cert()` no falle al parsear el PEM.
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

const PUERTO = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  // `fullyParallel: false` solo evita paralelismo DENTRO de un archivo — Playwright igual
  // corría los 3 specs en 3 workers a la vez. Mismo riesgo que fileParallelism en
  // vitest.integration.config.mts: todos comparten el mismo emulador (recurso externo real).
  // Por ahora no colisionan (cada spec usa ids propios), pero un worker por spec es la
  // garantía real, no una casualidad de qué datos toca cada uno.
  workers: 1,
  retries: 0,
  // "html" con open:"never": genera playwright-report/ (lo que sube e2e-nightly.yml como
  // artefacto si algo falla) sin intentar abrir un navegador al terminar, que en CI no existe.
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // El emulador siembra usuarios de prueba (tests/e2e/seed.ts) ANTES de levantar `next dev`,
    // para que los specs no tengan que crear sus fixtures por la UI cada vez.
    command:
      'firebase emulators:exec --only firestore,auth --project demo-mep-manager ' +
      `"npx tsx tests/e2e/seed.ts && npx next dev -p ${PUERTO}"`,
    url: `http://localhost:${PUERTO}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
    env: {
      FIREBASE_SERVICE_ACCOUNT_B64: credencialFalsa,
      // Config de cliente falsa a propósito: con NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true el
      // SDK del navegador se conecta al emulador (src/lib/firebase/client.ts) y nunca toca
      // el proyecto real de Firebase, aunque exista un .env.local con credenciales reales —
      // las variables ya presentes en el entorno del proceso ganan sobre cualquier .env* que
      // Next.js cargue (así es como Next resuelve la precedencia, nunca al revés).
      NEXT_PUBLIC_FIREBASE_API_KEY: "demo-api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-mep-manager.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-mep-manager",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-mep-manager.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "0",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:0:web:0",
      NEXT_PUBLIC_USE_FIREBASE_EMULATOR: "true",
      NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
      NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
    },
  },
});
