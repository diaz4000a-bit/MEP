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

  // La cuenta debe existir y estar aprobada ANTES de emitir la cookie. El corte que
  // había en el formulario de login es solo de UI: cualquiera puede pedir un idToken
  // a la API pública de Firebase Auth y llamar a este endpoint directamente.
  const ref = adminDb.doc(`usuarios/${decoded.uid}`);
  const snap = await ref.get();
  if (!snap.exists) {
    return Response.json({ error: 'Tu cuenta no está registrada.' }, { status: 403 });
  }
  if (snap.data()?.activo !== true) {
    return Response.json({ error: 'Tu cuenta espera aprobación.' }, { status: 403 });
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

  // Registrar el acceso no debe poder tumbar un login ya válido.
  try {
    await ref.update({ ultimoAcceso: Date.now() });
  } catch {
    // sin efecto para el usuario: la sesión ya está creada
  }

  return Response.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete('sesion');
  return Response.json({ ok: true });
}
