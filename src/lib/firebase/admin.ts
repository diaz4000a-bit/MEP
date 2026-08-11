import 'server-only';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const credenciales = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64!, 'base64').toString('utf8'),
);

const adminApp: App = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(credenciales) });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
