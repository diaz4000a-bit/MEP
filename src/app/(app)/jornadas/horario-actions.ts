"use server";

import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";
import type { HorarioSemanal } from "@/types";

export async function guardarHorario(uidObjetivo: string, dias: HorarioSemanal["dias"]) {
  const usuario = await exigirUsuario();
  const esPropio = usuario.uid === uidObjetivo;
  if (!esPropio && !puede(usuario.rol, "gestionarEquipo")) {
    throw new Error("No tienes permiso para editar el horario de otra persona.");
  }

  const horario: HorarioSemanal = { uid: uidObjetivo, dias, actualizado: Date.now() };
  await adminDb.doc(`horarios/${uidObjetivo}`).set(horario);

  revalidatePath("/jornadas");
}
