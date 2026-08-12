import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import type { Rol, Usuario } from '@/types';

export async function usuarioActual(): Promise<Usuario | null> {
  const jar = await cookies();
  const cookie = jar.get('sesion')?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const snap = await adminDb.doc(`usuarios/${decoded.uid}`).get();
    if (!snap.exists) return null;
    // El `uid` SIEMPRE sale del token verificado, nunca del documento: el campo `uid`
    // del doc es escribible por el propio usuario y decide toda la autorización
    // por-recurso (dueño de jornada, responsable de tarea, horario propio).
    return { ...(snap.data() as Usuario), uid: decoded.uid };
  } catch {
    return null;
  }
}

export async function exigirUsuario(): Promise<Usuario> {
  const u = await usuarioActual();
  if (!u || !u.activo) redirect('/login');
  return u;
}

export async function exigirRol(...roles: Rol[]): Promise<Usuario> {
  const u = await exigirUsuario();
  if (!roles.includes(u.rol)) redirect('/dashboard?error=sin-permiso');
  return u;
}
