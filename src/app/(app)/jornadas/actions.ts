"use server";

import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";
import type { Jornada } from "@/types";

export async function registrarEntrada(input: {
  proyectoId: string;
  tareaId?: string;
  notas?: string;
  fecha: string; // YYYY-MM-DD local del navegador — ver src/lib/jornadas.ts
}) {
  const usuario = await exigirUsuario();

  const proyectoSnap = await adminDb.doc(`proyectos/${input.proyectoId}`).get();
  if (!proyectoSnap.exists) throw new Error("El proyecto ya no existe.");
  const proyectoNombre = proyectoSnap.data()!.nombre as string;

  let tareaNombre: string | null = null;
  if (input.tareaId) {
    const tareaSnap = await adminDb.doc(`proyectos/${input.proyectoId}/tareas/${input.tareaId}`).get();
    tareaNombre = tareaSnap.exists ? (tareaSnap.data()!.nombre as string) : null;
  }

  const jornadasRef = adminDb.collection("jornadas");
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    const abiertaSnap = await tx.get(jornadasRef.where("uid", "==", usuario.uid).where("estado", "==", "abierta"));
    if (!abiertaSnap.empty) {
      throw new Error("Ya tienes una jornada abierta. Ciérrala antes de registrar una entrada nueva.");
    }

    const ref = jornadasRef.doc();
    const jornada: Jornada = {
      id: ref.id,
      uid: usuario.uid,
      usuarioNombre: usuario.nombre,
      proyectoId: input.proyectoId,
      proyectoNombre,
      fecha: input.fecha,
      entrada: ahora,
      salida: null,
      duracionMin: null,
      estado: "abierta",
      tareaId: input.tareaId ?? null,
      tareaNombre,
      notas: input.notas?.trim() ?? "",
      creado: ahora,
      actualizado: ahora,
    };
    tx.set(ref, jornada);
  });

  revalidatePath("/", "layout");
}

export async function cambiarProyectoJornada(input: { proyectoId: string; fecha: string }) {
  const usuario = await exigirUsuario();

  const proyectoSnap = await adminDb.doc(`proyectos/${input.proyectoId}`).get();
  if (!proyectoSnap.exists) throw new Error("El proyecto ya no existe.");
  const proyectoNombre = proyectoSnap.data()!.nombre as string;

  const jornadasRef = adminDb.collection("jornadas");
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    const abiertaSnap = await tx.get(jornadasRef.where("uid", "==", usuario.uid).where("estado", "==", "abierta"));
    if (abiertaSnap.empty) throw new Error("No tienes una jornada abierta.");

    const actualDoc = abiertaSnap.docs[0];
    const actual = actualDoc.data() as Jornada;
    if (actual.proyectoId === input.proyectoId) throw new Error("Ya estás trabajando en ese proyecto.");

    const duracionMin = Math.round((ahora - actual.entrada) / 60000);
    tx.update(actualDoc.ref, { salida: ahora, duracionMin, estado: "cerrada", actualizado: ahora });

    const nuevaRef = jornadasRef.doc();
    const nueva: Jornada = {
      id: nuevaRef.id,
      uid: usuario.uid,
      usuarioNombre: usuario.nombre,
      proyectoId: input.proyectoId,
      proyectoNombre,
      fecha: input.fecha,
      entrada: ahora,
      salida: null,
      duracionMin: null,
      estado: "abierta",
      tareaId: null,
      tareaNombre: null,
      notas: "",
      creado: ahora,
      actualizado: ahora,
    };
    tx.set(nuevaRef, nueva);
  });

  revalidatePath("/", "layout");
  revalidatePath("/jornadas");
}

async function exigirAccesoJornada(jornadaId: string) {
  const usuario = await exigirUsuario();
  const ref = adminDb.doc(`jornadas/${jornadaId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("La jornada ya no existe.");
  const jornada = snap.data() as Jornada;
  const esDueño = jornada.uid === usuario.uid;
  const esGestor = puede(usuario.rol, "verJornadasAjenas");
  if (!esDueño && !esGestor) throw new Error("No tienes permiso sobre esta jornada.");
  return { ref, jornada };
}

export async function registrarSalida(input: { jornadaId: string; horaSalida?: number; notas?: string }) {
  const { ref, jornada } = await exigirAccesoJornada(input.jornadaId);
  if (jornada.estado !== "abierta") throw new Error("Esta jornada ya está cerrada.");

  const salida = input.horaSalida ?? Date.now();
  if (salida < jornada.entrada) throw new Error("La hora de salida no puede ser anterior a la de entrada.");

  const duracionMin = Math.round((salida - jornada.entrada) / 60000);
  await ref.update({
    salida,
    duracionMin,
    estado: "cerrada",
    notas: input.notas?.trim() || jornada.notas,
    actualizado: Date.now(),
  });

  revalidatePath("/", "layout");
  revalidatePath("/jornadas");
}

export async function anularJornada(jornadaId: string, motivo: string) {
  const { ref, jornada } = await exigirAccesoJornada(jornadaId);
  const razon = motivo.trim();
  if (!razon) throw new Error("Indica el motivo de la anulación.");

  await ref.update({
    estado: "anulada",
    notas: `${jornada.notas ? jornada.notas + " | " : ""}Anulada: ${razon}`,
    actualizado: Date.now(),
  });

  revalidatePath("/", "layout");
  revalidatePath("/jornadas");
}
