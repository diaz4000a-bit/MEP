"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";

export async function marcarLeccionLeida(leccionId: string, leida: boolean) {
  const usuario = await exigirUsuario();
  await adminDb.doc(`usuarios/${usuario.uid}`).update({
    guiaLeidas: leida ? FieldValue.arrayUnion(leccionId) : FieldValue.arrayRemove(leccionId),
  });

  revalidatePath("/guia");
  revalidatePath(`/guia/${leccionId.split(".")[0]}/${leccionId}`);
}
