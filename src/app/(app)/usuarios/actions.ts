"use server";

import { revalidatePath } from "next/cache";
import { exigirRol } from "@/lib/auth/sesion";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { Rol } from "@/types";

export async function actualizarUsuario(uid: string, cambios: { rol?: Rol; activo?: boolean }) {
  const admin = await exigirRol("admin");
  if (uid === admin.uid) throw new Error("No puedes cambiar tu propio rol o estado.");

  await adminDb.doc(`usuarios/${uid}`).update(cambios);
  revalidatePath("/usuarios");
}

export async function eliminarUsuario(uid: string) {
  const admin = await exigirRol("admin");
  if (uid === admin.uid) throw new Error("No puedes eliminar tu propia cuenta.");

  // Auth PRIMERO y Firestore después, a propósito: los dos sistemas no comparten
  // transacción, así que hay que elegir cuál es el estado intermedio menos malo.
  //   - Firestore primero: si falla Auth queda una cuenta que aún puede iniciar sesión,
  //     invisible en esta tabla y con el correo ocupado — no se puede recrear al usuario.
  //   - Auth primero: si falla Firestore queda un documento sin cuenta, visible en la
  //     tabla, borrable con un segundo intento y ya sin poder autenticarse.
  try {
    await adminAuth.deleteUser(uid);
  } catch (err) {
    if ((err as { code?: string }).code !== "auth/user-not-found") throw err;
  }
  await adminDb.doc(`usuarios/${uid}`).delete();
  revalidatePath("/usuarios");
}
