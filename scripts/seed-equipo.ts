// Siembra config/equipo.membersLegacy con los nombres que usaba la v1
// (index.html línea 1115, valor por defecto de `team` para una instalación nueva).
// El Paso 20 (migración) usa esta lista para que cada usuario pueda elegir su
// nombre legacy y así heredar `responsableUid` en las tareas importadas.
//
// No importa '@/lib/firebase/admin': ese módulo trae 'server-only', que revienta
// fuera del entorno RSC de Next.js (incluido tsx corriendo este script suelto).
// Los scripts de un solo uso inicializan su propia instancia mínima de Admin SDK.
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

process.loadEnvFile(".env.local");

const credenciales = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64!, "base64").toString("utf8"),
);
const app = initializeApp({ credential: cert(credenciales) });
const db = getFirestore(app);

const MEMBERS_LEGACY = ["Carlos Pérez", "Ana López", "Esteban R."];

async function main() {
  await db.doc("config/equipo").set({ membersLegacy: MEMBERS_LEGACY }, { merge: true });
  console.log(`config/equipo.membersLegacy sembrado con ${MEMBERS_LEGACY.length} nombres.`);
}

main().then(() => process.exit(0));
