"use server";

import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";
import { validarDias } from "@/lib/horarios";
import type { HorarioSemanal } from "@/types";

export async function guardarHorario(uidObjetivo: string, dias: unknown) {
  const usuario = await exigirUsuario();
  const esPropio = usuario.uid === uidObjetivo;
  if (!esPropio && !puede(usuario.rol, "gestionarEquipo")) {
    throw new Error("No tienes permiso para editar el horario de otra persona.");
  }

  const diasValidados = validarDias(dias);
  if (!diasValidados) throw new Error("El horario no tiene un formato válido.");

  const horario: HorarioSemanal = { uid: uidObjetivo, dias: diasValidados, actualizado: Date.now() };
  await adminDb.doc(`horarios/${uidObjetivo}`).set(horario);

  revalidatePath("/jornadas");
}
