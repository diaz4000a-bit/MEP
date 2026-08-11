"use server";

import { revalidatePath } from "next/cache";
import { exigirRol } from "@/lib/auth/sesion";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { Rol } from "@/types";

export async function actualizarUsuario(uid: string, cambios: { rol?: Rol; activo?: boolean }) {
  await exigirRol("admin");
  await adminDb.doc(`usuarios/${uid}`).update(cambios);
  revalidatePath("/usuarios");
}

export async function eliminarUsuario(uid: string) {
  const admin = await exigirRol("admin");
  if (uid === admin.uid) throw new Error("No puedes eliminar tu propia cuenta.");

  await adminDb.doc(`usuarios/${uid}`).delete();
  try {
    await adminAuth.deleteUser(uid);
  } catch (err) {
    if ((err as { code?: string }).code !== "auth/user-not-found") throw err;
  }
  revalidatePath("/usuarios");
}
