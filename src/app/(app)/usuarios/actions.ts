"use server";

import { revalidatePath } from "next/cache";
import { exigirRol } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { Rol } from "@/types";

export async function actualizarUsuario(uid: string, cambios: { rol?: Rol; activo?: boolean }) {
  await exigirRol("admin");
  await adminDb.doc(`usuarios/${uid}`).update(cambios);
  revalidatePath("/usuarios");
}
