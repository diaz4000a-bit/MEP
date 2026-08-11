"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";

async function exigirGestorEquipo() {
  const usuario = await exigirUsuario();
  if (!puede(usuario.rol, "gestionarEquipo")) {
    throw new Error("No tienes permiso para hacer esto.");
  }
}

export async function agregarResponsable(nombre: string) {
  await exigirGestorEquipo();
  const limpio = nombre.trim();
  if (!limpio) throw new Error("El nombre no puede estar vacío.");

  const snap = await adminDb.doc("config/equipo").get();
  const actuales = (snap.data()?.membersLegacy as string[] | undefined) ?? [];
  if (actuales.includes(limpio)) throw new Error("Ese responsable ya existe.");

  await adminDb.doc("config/equipo").set({ membersLegacy: FieldValue.arrayUnion(limpio) }, { merge: true });
  revalidatePath("/equipo");
}

export async function quitarResponsable(nombre: string) {
  await exigirGestorEquipo();
  await adminDb.doc("config/equipo").set({ membersLegacy: FieldValue.arrayRemove(nombre) }, { merge: true });
  revalidatePath("/equipo");
}
