// Siembra los usuarios de prueba en el emulador ANTES de levantar `next dev` (ver
// playwright.config.ts). No importa src/lib/firebase/admin.ts a propósito: ese módulo hace
// `import "server-only"`, que lanza fuera del bundler de Next.js — aquí se inicializa un
// Admin SDK mínimo propio, y como solo habla con el emulador no necesita credencial real.
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { ADMIN_E2E, PASSWORD_E2E, USUARIO_E2E } from "./fixtures/usuarios";

const app = getApps().length ? getApps()[0] : initializeApp({ projectId: "demo-mep-manager" });
const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

const USUARIOS = [
  { ...ADMIN_E2E, rol: "admin" as const },
  { ...USUARIO_E2E, rol: "usuario" as const },
];

async function main() {
  for (const u of USUARIOS) {
    await adminAuth.createUser({ uid: u.uid, email: u.email, password: PASSWORD_E2E });
    await adminDb.doc(`usuarios/${u.uid}`).set({
      uid: u.uid,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      activo: true,
      creado: Date.now(),
      ultimoAcceso: Date.now(),
      guiaLeidas: [],
    });
  }
  console.log(`Seed E2E listo: ${USUARIOS.length} usuarios.`);
}

main().catch((err) => {
  console.error("Seed E2E falló:", err);
  process.exit(1);
});
