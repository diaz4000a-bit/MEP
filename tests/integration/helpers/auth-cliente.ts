import { initializeApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from "firebase/auth";

let contador = 0;

/**
 * Crea un usuario real en el emulador de Auth vía el SDK cliente (igual que login/page.tsx)
 * y devuelve un idToken real y verificable. `/api/session` valida el token con
 * `adminAuth.verifyIdToken`, así que un token inventado a mano nunca lo pasaría — hace falta
 * uno genuino, emitido por el mismo emulador contra el que corre la prueba.
 */
export async function idTokenDePrueba(): Promise<{ uid: string; idToken: string }> {
  contador += 1;
  const app = initializeApp(
    { apiKey: "fake-api-key", projectId: "demo-mep-manager", authDomain: "demo-mep-manager.firebaseapp.com" },
    `test-client-${contador}`,
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });

  const email = `usuario-${Date.now()}-${contador}@test.local`;
  const cred = await createUserWithEmailAndPassword(auth, email, "clave-de-prueba-123");
  const idToken = await cred.user.getIdToken();
  return { uid: cred.user.uid, idToken };
}
