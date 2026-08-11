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
    return snap.exists ? (snap.data() as Usuario) : null;
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
