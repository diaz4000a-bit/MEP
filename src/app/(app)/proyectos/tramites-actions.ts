"use server";

import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";
import { fechaBogota } from "@/lib/tiempo";
import { metricasTramites } from "@/lib/tramites";
import { sanearHistorialTramite, TOPE_HISTORIAL, validarDatosTramite } from "@/lib/validar";
import type { DatosTramite } from "@/lib/validar";
import type { Tramite, Usuario } from "@/types";

/**
 * Server Actions de la sección de trámites. Viven aparte de `actions.ts` por el mismo
 * criterio con que `horario-actions.ts` se separó de `jornadas/actions.ts`: son otro
 * agregado, con otra colección y otra matriz de permisos.
 *
 * Toda escritura recalcula las métricas denormalizadas del proyecto DENTRO de la misma
 * transacción que toca el trámite, igual que hace `metricasProyecto` con las tareas: si el
 * conteo se hiciera en una segunda ida a Firestore, dos operaciones simultáneas leerían el
 * mismo estado y la última dejaría el semáforo de la lista de proyectos desfasado del
 * contenido real.
 */

async function exigirGestionTramites(usuario: Usuario) {
  if (!puede(usuario.rol, "gestionarTramites")) {
    throw new Error("No tienes permiso para gestionar los trámites del proyecto.");
  }
}

/** El estado cerrado fija la fecha de resolución si el formulario no la trajo. */
function resolverFechaResolucion(datos: DatosTramite, anterior: string): string {
  if (datos.estado !== "Aprobado" && datos.estado !== "Rechazado") return "";
  return datos.fechaResolucion || anterior || fechaBogota();
}

export async function crearTramite(proyectoId: string, datosCrudos: DatosTramite) {
  const usuario = await exigirUsuario();
  await exigirGestionTramites(usuario);
  const datos = validarDatosTramite(datosCrudos);

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tramiteRef = proyectoRef.collection("tramites").doc();
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    // En una transacción de Firestore TODAS las lecturas van antes que las escrituras.
    // Leer el proyecto además evita crear un trámite huérfano si lo borraron mientras el
    // diálogo estaba abierto: colgaría de un documento inexistente, invisible en la app.
    const proyectoSnap = await tx.get(proyectoRef);
    if (!proyectoSnap.exists) throw new Error("El proyecto ya no existe.");
    const todosSnap = await tx.get(proyectoRef.collection("tramites"));

    const tramite: Tramite = {
      id: tramiteRef.id,
      proyectoId,
      ...datos,
      fechaResolucion: resolverFechaResolucion(datos, ""),
      historial: [{ f: ahora, e: datos.estado }],
      creado: ahora,
      actualizado: ahora,
    };

    const todos = [...todosSnap.docs.map((d) => d.data() as Tramite), tramite];
    tx.set(tramiteRef, tramite);
    tx.update(proyectoRef, { ...metricasTramites(todos), actualizado: ahora });
  });

  revalidatePath(`/proyectos/${proyectoId}`);
  revalidatePath("/proyectos");
  return { id: tramiteRef.id };
}

export async function actualizarTramite(proyectoId: string, tramiteId: string, datosCrudos: DatosTramite) {
  const usuario = await exigirUsuario();
  await exigirGestionTramites(usuario);
  const datos = validarDatosTramite(datosCrudos);

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tramiteRef = proyectoRef.collection("tramites").doc(tramiteId);
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    const proyectoSnap = await tx.get(proyectoRef);
    if (!proyectoSnap.exists) throw new Error("El proyecto ya no existe.");
    const snap = await tx.get(tramiteRef);
    if (!snap.exists) throw new Error("El trámite ya no existe.");
    const actual = snap.data() as Tramite;
    const todosSnap = await tx.get(proyectoRef.collection("tramites"));

    const historialActual = sanearHistorialTramite(actual.historial);
    const historial =
      datos.estado !== actual.estado
        ? [...historialActual, { f: ahora, e: datos.estado }].slice(-TOPE_HISTORIAL)
        : historialActual;

    const actualizado: Tramite = {
      ...actual,
      ...datos,
      fechaResolucion: resolverFechaResolucion(datos, actual.fechaResolucion),
      historial,
      actualizado: ahora,
    };

    const otros = todosSnap.docs.filter((d) => d.id !== tramiteId).map((d) => d.data() as Tramite);
    tx.update(tramiteRef, actualizado as unknown as Record<string, unknown>);
    tx.update(proyectoRef, { ...metricasTramites([...otros, actualizado]), actualizado: ahora });
  });

  revalidatePath(`/proyectos/${proyectoId}`);
  revalidatePath("/proyectos");
}

export async function actualizarEstadoTramite(proyectoId: string, tramiteId: string, estadoCrudo: unknown) {
  const usuario = await exigirUsuario();
  await exigirGestionTramites(usuario);

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tramiteRef = proyectoRef.collection("tramites").doc(tramiteId);
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    const proyectoSnap = await tx.get(proyectoRef);
    if (!proyectoSnap.exists) throw new Error("El proyecto ya no existe.");
    const snap = await tx.get(tramiteRef);
    if (!snap.exists) throw new Error("El trámite ya no existe.");
    const actual = snap.data() as Tramite;
    const todosSnap = await tx.get(proyectoRef.collection("tramites"));

    // Se revalida el documento COMPLETO y no solo el estado suelto: cambiar a "Radicado"
    // sin fecha de radicación es justo la incoherencia que `validarDatosTramite` bloquea, y
    // este atajo desde la tabla no puede ser una puerta trasera a ella.
    const datos = validarDatosTramite({ ...actual, estado: estadoCrudo });

    const historialActual = sanearHistorialTramite(actual.historial);
    const historial =
      datos.estado !== actual.estado
        ? [...historialActual, { f: ahora, e: datos.estado }].slice(-TOPE_HISTORIAL)
        : historialActual;

    const actualizado: Tramite = {
      ...actual,
      estado: datos.estado,
      fechaResolucion: resolverFechaResolucion(datos, actual.fechaResolucion),
      historial,
      actualizado: ahora,
    };

    const otros = todosSnap.docs.filter((d) => d.id !== tramiteId).map((d) => d.data() as Tramite);
    tx.update(tramiteRef, {
      estado: actualizado.estado,
      fechaResolucion: actualizado.fechaResolucion,
      historial: actualizado.historial,
      actualizado: ahora,
    });
    tx.update(proyectoRef, { ...metricasTramites([...otros, actualizado]), actualizado: ahora });
  });

  revalidatePath(`/proyectos/${proyectoId}`);
  revalidatePath("/proyectos");
}

export async function eliminarTramite(proyectoId: string, tramiteId: string) {
  const usuario = await exigirUsuario();
  await exigirGestionTramites(usuario);

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tramiteRef = proyectoRef.collection("tramites").doc(tramiteId);
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    const proyectoSnap = await tx.get(proyectoRef);
    if (!proyectoSnap.exists) throw new Error("El proyecto ya no existe.");
    const todosSnap = await tx.get(proyectoRef.collection("tramites"));

    const restantes = todosSnap.docs.filter((d) => d.id !== tramiteId).map((d) => d.data() as Tramite);
    tx.delete(tramiteRef);
    tx.update(proyectoRef, { ...metricasTramites(restantes), actualizado: ahora });
  });

  revalidatePath(`/proyectos/${proyectoId}`);
  revalidatePath("/proyectos");
}
