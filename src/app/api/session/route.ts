import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const DURACION_MS = 60 * 60 * 24 * 5 * 1000; // 5 días

export async function POST(request: Request) {
  const { idToken } = await request.json();
  const decoded = await adminAuth.verifyIdToken(idToken);

  // Solo se acepta un token recién emitido (< 5 min): evita reutilizar tokens viejos
  if (Date.now() - decoded.auth_time * 1000 > 5 * 60 * 1000) {
    return Response.json({ error: 'Vuelve a iniciar sesión' }, { status: 401 });
  }

  const cookieSesion = await adminAuth.createSessionCookie(idToken, { expiresIn: DURACION_MS });
  const jar = await cookies();
  jar.set('sesion', cookieSesion, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DURACION_MS / 1000,
  });

  await adminDb.doc(`usuarios/${decoded.uid}`).update({ ultimoAcceso: Date.now() });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete('sesion');
  return Response.json({ ok: true });
}
