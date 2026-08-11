"use server";

import { revalidatePath } from "next/cache";
import { CATALOGO_TAREAS } from "@/content/catalogo-tareas";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";
import { computeAvance } from "@/lib/tareas";
import type { NotaIngenieria, Proyecto, Tarea, Usuario } from "@/types";

interface DatosProyecto {
  nombre: string;
  cliente: string;
  fechaInicio: string;
  fechaEntrega: string;
  software: string;
}

async function exigirPermiso(usuario: Usuario, accion: Parameters<typeof puede>[1]) {
  if (!puede(usuario.rol, accion)) {
    throw new Error("No tienes permiso para hacer esto.");
  }
}

function proyectoBase(id: string, datos: DatosProyecto, ahora: number): Proyecto {
  return {
    id,
    nombre: datos.nombre,
    cliente: datos.cliente,
    fechaInicio: datos.fechaInicio,
    fechaEntrega: datos.fechaEntrega,
    disciplina: "Eléctrica",
    software: datos.software || "Revit",
    estado: "Sin iniciar",
    notas: "",
    zonas: ["Torre A", "Torre B", "Comunal", "Portería", "Urbanismo"],
    creado: ahora,
    actualizado: ahora,
    totalTareas: 0,
    tareasCompletadas: 0,
    avanceTotal: 0,
  };
}

export async function crearProyecto(datos: DatosProyecto) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "crearProyecto");

  const ref = adminDb.collection("proyectos").doc();
  const ahora = Date.now();
  await ref.set(proyectoBase(ref.id, datos, ahora));

  revalidatePath("/proyectos");
  return { id: ref.id };
}

export async function crearProyectoDesdeplantilla(datos: DatosProyecto) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "crearProyecto");

  const ref = adminDb.collection("proyectos").doc();
  const ahora = Date.now();
  const proyecto = proyectoBase(ref.id, datos, ahora);
  proyecto.totalTareas = CATALOGO_TAREAS.length;

  const batch = adminDb.batch();
  batch.set(ref, proyecto);
  for (const c of CATALOGO_TAREAS) {
    const tareaRef = ref.collection("tareas").doc();
    const notasIngenieria: NotaIngenieria[] = c.notasIngenieria;
    const tarea: Tarea = {
      id: tareaRef.id,
      proyectoId: ref.id,
      plantillaId: c.plantillaId,
      nombre: c.nombre,
      categoria: c.categoria,
      grupo: c.grupo,
      subgrupo: c.subgrupo,
      zona: null,
      etapa: null,
      responsableUid: null,
      responsable: "",
      prioridad: "Media",
      estado: "Sin iniciar",
      porcentaje: 0,
      fechaInicio: "",
      fechaLimite: "",
      fechaCompletada: "",
      horasEstimadas: 0,
      horasReales: 0,
      comentarios: "",
      bloqueadoPor: "",
      verificacion: {},
      historial: [{ f: ahora, p: 0, e: "Sin iniciar" }],
      actualizado: ahora,
      descripcion: c.descripcion,
      objetivo: c.objetivo,
      requisitos: c.requisitos,
      procedimiento: c.procedimiento,
      resultadoEsperado: c.resultadoEsperado,
      criteriosVerificacion: c.criteriosVerificacion,
      notasIngenieria,
      tipsRevit: c.tipsRevit,
    };
    batch.set(tareaRef, tarea);
  }
  await batch.commit();

  revalidatePath("/proyectos");
  return { id: ref.id };
}

export async function eliminarProyecto(proyectoId: string) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "borrarProyecto");

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tareasSnap = await proyectoRef.collection("tareas").get();
  const batch = adminDb.batch();
  for (const doc of tareasSnap.docs) batch.delete(doc.ref);
  batch.delete(proyectoRef);
  await batch.commit();

  revalidatePath("/proyectos");
}

export async function guardarNotasProyecto(proyectoId: string, notas: string) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "editarTareaPropia"); // cualquier miembro activo del equipo puede anotar
  await adminDb.doc(`proyectos/${proyectoId}`).update({ notas, actualizado: Date.now() });
  revalidatePath(`/proyectos/${proyectoId}`);
}

interface DatosTarea {
  nombre: string;
  grupo: Tarea["grupo"];
  subgrupo: string;
  zona: string | null;
  etapa: string | null;
  categoria: Tarea["categoria"];
  responsableUid: string | null;
  responsable: string;
  prioridad: Tarea["prioridad"];
  estado: Tarea["estado"];
  porcentaje: number;
  fechaInicio: string;
  fechaLimite: string;
  horasEstimadas: number;
  horasReales: number;
  comentarios: string;
  bloqueadoPor: string;
}

async function recalcularProyecto(proyectoId: string, ahora: number) {
  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const snap = await proyectoRef.collection("tareas").get();
  const tareas = snap.docs.map((d) => d.data() as Tarea);
  await proyectoRef.update({
    totalTareas: tareas.length,
    tareasCompletadas: tareas.filter((t) => t.estado === "Completada").length,
    avanceTotal: computeAvance(tareas),
    actualizado: ahora,
  });
}

export async function crearTarea(proyectoId: string, datos: DatosTarea) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "crearTarea");

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tareaRef = proyectoRef.collection("tareas").doc();
  const ahora = Date.now();
  const tarea: Tarea = {
    id: tareaRef.id,
    proyectoId,
    plantillaId: null,
    ...datos,
    fechaCompletada: datos.estado === "Completada" ? new Date().toISOString().slice(0, 10) : "",
    verificacion: {},
    historial: [{ f: ahora, p: datos.porcentaje, e: datos.estado }],
    actualizado: ahora,
  };
  await tareaRef.set(tarea);
  await recalcularProyecto(proyectoId, ahora);
  revalidatePath(`/proyectos/${proyectoId}`);
}

export async function actualizarTarea(proyectoId: string, tareaId: string, datos: DatosTarea) {
  const usuario = await exigirUsuario();

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tareaRef = proyectoRef.collection("tareas").doc(tareaId);
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    const tareaSnap = await tx.get(tareaRef);
    if (!tareaSnap.exists) throw new Error("La tarea ya no existe.");
    const actual = tareaSnap.data() as Tarea;

    const puedeAjena = puede(usuario.rol, "editarTareaAjena");
    const puedePropia = puede(usuario.rol, "editarTareaPropia") && actual.responsableUid === usuario.uid;
    if (!puedeAjena && !puedePropia) {
      throw new Error("No tienes permiso para editar esta tarea.");
    }

    const todasSnap = await tx.get(proyectoRef.collection("tareas"));

    const huboCambio = datos.porcentaje !== actual.porcentaje || datos.estado !== actual.estado;
    const historial = huboCambio
      ? [...actual.historial, { f: ahora, p: datos.porcentaje, e: datos.estado }].slice(-60)
      : actual.historial;

    const actualizada: Tarea = {
      ...actual,
      ...datos,
      fechaCompletada:
        datos.estado === "Completada"
          ? actual.fechaCompletada || new Date().toISOString().slice(0, 10)
          : "",
      historial,
      actualizado: ahora,
    };

    const otras = todasSnap.docs.filter((d) => d.id !== tareaId).map((d) => d.data() as Tarea);
    const todas = [...otras, actualizada];

    tx.update(tareaRef, actualizada as unknown as Record<string, unknown>);
    tx.update(proyectoRef, {
      totalTareas: todas.length,
      tareasCompletadas: todas.filter((t) => t.estado === "Completada").length,
      avanceTotal: computeAvance(todas),
      actualizado: ahora,
    });
  });

  revalidatePath(`/proyectos/${proyectoId}`);
}

export async function actualizarEstadoTarea(
  proyectoId: string,
  tareaId: string,
  estado: Tarea["estado"],
  porcentaje: number,
) {
  const usuario = await exigirUsuario();

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tareaRef = proyectoRef.collection("tareas").doc(tareaId);
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    const tareaSnap = await tx.get(tareaRef);
    if (!tareaSnap.exists) throw new Error("La tarea ya no existe.");
    const actual = tareaSnap.data() as Tarea;

    const puedeAjena = puede(usuario.rol, "editarTareaAjena");
    const puedePropia = puede(usuario.rol, "editarTareaPropia") && actual.responsableUid === usuario.uid;
    if (!puedeAjena && !puedePropia) {
      throw new Error("No tienes permiso para editar esta tarea.");
    }

    const todasSnap = await tx.get(proyectoRef.collection("tareas"));

    const huboCambio = porcentaje !== actual.porcentaje || estado !== actual.estado;
    const historial = huboCambio
      ? [...actual.historial, { f: ahora, p: porcentaje, e: estado }].slice(-60)
      : actual.historial;

    const actualizada: Tarea = {
      ...actual,
      estado,
      porcentaje,
      fechaCompletada:
        estado === "Completada" ? actual.fechaCompletada || new Date().toISOString().slice(0, 10) : "",
      historial,
      actualizado: ahora,
    };

    const otras = todasSnap.docs.filter((d) => d.id !== tareaId).map((d) => d.data() as Tarea);
    const todas = [...otras, actualizada];

    tx.update(tareaRef, actualizada as unknown as Record<string, unknown>);
    tx.update(proyectoRef, {
      totalTareas: todas.length,
      tareasCompletadas: todas.filter((t) => t.estado === "Completada").length,
      avanceTotal: computeAvance(todas),
      actualizado: ahora,
    });
  });

  revalidatePath(`/proyectos/${proyectoId}/tarea/${tareaId}`);
  revalidatePath(`/proyectos/${proyectoId}`);
}

export async function actualizarVerificacion(
  proyectoId: string,
  tareaId: string,
  verificacion: Record<number, boolean>,
) {
  const usuario = await exigirUsuario();

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tareaRef = proyectoRef.collection("tareas").doc(tareaId);
  const tareaSnap = await tareaRef.get();
  if (!tareaSnap.exists) throw new Error("La tarea ya no existe.");
  const actual = tareaSnap.data() as Tarea;

  const puedeAjena = puede(usuario.rol, "editarTareaAjena");
  const puedePropia = puede(usuario.rol, "editarTareaPropia") && actual.responsableUid === usuario.uid;
  if (!puedeAjena && !puedePropia) {
    throw new Error("No tienes permiso para editar esta tarea.");
  }

  await tareaRef.update({ verificacion, actualizado: Date.now() });
  revalidatePath(`/proyectos/${proyectoId}/tarea/${tareaId}`);
}

export async function eliminarTarea(proyectoId: string, tareaId: string) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "eliminarTarea");

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  await proyectoRef.collection("tareas").doc(tareaId).delete();
  await recalcularProyecto(proyectoId, Date.now());
  revalidatePath(`/proyectos/${proyectoId}`);
}

export async function agregarZona(proyectoId: string, nombre: string) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "crearProyecto");

  const limpio = nombre.trim();
  if (!limpio) throw new Error("El nombre de la zona es obligatorio.");

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(proyectoRef);
    if (!snap.exists) throw new Error("El proyecto ya no existe.");
    const zonas = ((snap.data() as Proyecto).zonas ?? []).slice();
    if (zonas.some((z) => z.toLowerCase() === limpio.toLowerCase())) {
      throw new Error("Esa zona ya existe.");
    }
    zonas.push(limpio);
    tx.update(proyectoRef, { zonas, actualizado: Date.now() });
  });

  revalidatePath(`/proyectos/${proyectoId}`);
}

// Quitar una zona NO borra sus tareas: quedan sin zona (igual que la v1).
export async function eliminarZona(proyectoId: string, zona: string) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "crearProyecto");

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const [proyectoSnap, tareasDeZonaSnap] = await Promise.all([
    proyectoRef.get(),
    proyectoRef.collection("tareas").where("zona", "==", zona).get(),
  ]);
  if (!proyectoSnap.exists) throw new Error("El proyecto ya no existe.");

  const batch = adminDb.batch();
  const zonas = ((proyectoSnap.data() as Proyecto).zonas ?? []).filter((z) => z !== zona);
  batch.update(proyectoRef, { zonas, actualizado: Date.now() });
  for (const doc of tareasDeZonaSnap.docs) {
    batch.update(doc.ref, { zona: null, actualizado: Date.now() });
  }
  await batch.commit();

  revalidatePath(`/proyectos/${proyectoId}`);
}
