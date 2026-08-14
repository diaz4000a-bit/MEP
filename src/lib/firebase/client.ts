import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore, initializeFirestore,
  persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export const app = getApps().length ? getApp() : initializeApp(config);
export const auth = getAuth(app);

// initializeFirestore lanza si se llama dos veces (pasa con el hot reload de Next).
// El catch devuelve la instancia ya creada.
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    return getFirestore(app);
  }
})();

// Solo para pruebas E2E (Playwright) contra el emulador local — nunca se activa en producción,
// que no define esta variable. `connect*Emulator` lanza si ya se conectó antes (hot reload de
// Next en dev), de ahí el try/catch: mismo motivo que el de `db` arriba.
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, `http://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`, {
      disableWarnings: true,
    });
  } catch {
    // ya conectado (hot reload)
  }
  try {
    const [host, port] = (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ?? '').split(':');
    connectFirestoreEmulator(db, host, Number(port));
  } catch {
    // ya conectado (hot reload)
  }
}
