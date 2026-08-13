"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { CATEGORIAS } from "@/content/categorias";
import { GRUPOS } from "@/content/grupos";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { catalogoVigente } from "@/lib/catalogo-vigente";
import { adminDb } from "@/lib/firebase/admin";
import { inferirGrupoYSubgrupo, inferirPlantillaId } from "@/lib/importar";
import { computeAvance } from "@/lib/tareas";
import { fechaBogota } from "@/lib/tiempo";
import type {
  Categoria,
  EstadoProyecto,
  EstadoTarea,
  GrupoId,
  NotaIngenieria,
  Prioridad,
  Proyecto,
  Tarea,
  Usuario,
} from "@/types";

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

  const { lista: catalogo } = await catalogoVigente();

  const ref = adminDb.collection("proyectos").doc();
  const ahora = Date.now();
  const proyecto = proyectoBase(ref.id, datos, ahora);
  proyecto.totalTareas = catalogo.length;

  const batch = adminDb.batch();
  batch.set(ref, proyecto);
  for (const c of catalogo) {
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
      prioridad: c.prioridad,
      estado: "Sin iniciar",
      porcentaje: 0,
      fechaInicio: "",
      fechaLimite: "",
      fechaCompletada: "",
      horasEstimadas: c.horasEstimadas,
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
    fechaCompletada: datos.estado === "Completada" ? fechaBogota() : "",
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
    const fechaCompletada = datos.estado === "Completada" ? actual.fechaCompletada || fechaBogota() : "";

    // Sin editarTareaAjena solo se puede tocar el progreso de la propia tarea: reasignar,
    // repriorizar, mover fechas o cambiar horas estimadas es gestión de proyecto, reservada
    // a quien tiene editarTareaAjena. TareaDialog ya deshabilita esos campos en ese caso;
    // esto es lo que realmente lo impide si alguien llama la action directo.
    const actualizada: Tarea = puedeAjena
      ? { ...actual, ...datos, fechaCompletada, historial, actualizado: ahora }
      : {
          ...actual,
          estado: datos.estado,
          porcentaje: datos.porcentaje,
          horasReales: datos.horasReales,
          comentarios: datos.comentarios,
          bloqueadoPor: datos.bloqueadoPor,
          fechaCompletada,
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
        estado === "Completada" ? actual.fechaCompletada || fechaBogota() : "",
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

const ESTADOS_PROYECTO: EstadoProyecto[] = ["Sin iniciar", "En progreso", "Revisión", "Entregado"];
const ESTADOS_TAREA: EstadoTarea[] = ["Sin iniciar", "En progreso", "En revisión", "Completada", "Bloqueada"];
const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"];

function strOr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function numOr(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Acepta el formato v1 (proyecto con `tareas[]` plana) y el de `prompt-incidencias.md`, sin
 * cambios. Regenera ids, infiere `grupo`/`subgrupo`/`plantillaId` cuando el archivo no los
 * trae, y crea la subcolección real (nunca el array plano de la v1).
 */
export async function importarProyectoJSON(datos: unknown) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "crearProyecto");

  if (typeof datos !== "object" || datos === null) {
    throw new Error("El archivo no tiene el formato esperado.");
  }
  const raw = datos as Record<string, unknown>;
  if (typeof raw.nombre !== "string" || !Array.isArray(raw.tareas)) {
    throw new Error("El archivo no tiene el formato de proyecto esperado.");
  }

  const [usuariosSnap, equipoSnap] = await Promise.all([
    adminDb.collection("usuarios").get(),
    adminDb.doc("config/equipo").get(),
  ]);
  const nombresConocidos = new Set([
    ...usuariosSnap.docs.map((d) => (d.data() as Usuario).nombre),
    ...((equipoSnap.data()?.membersLegacy as string[] | undefined) ?? []),
  ]);

  const ahora = Date.now();
  const proyectoRef = adminDb.collection("proyectos").doc();
  const batch = adminDb.batch();
  const tareasCreadas: Tarea[] = [];

  for (const item of raw.tareas) {
    if (typeof item !== "object" || item === null) continue;
    const t = item as Record<string, unknown>;

    const nombre = strOr(t.nombre, "Tarea sin nombre");
    const etapa = strOr(t.etapa, "");
    const categoria = CATEGORIAS.includes(t.categoria as Categoria) ? (t.categoria as Categoria) : "Modelado";
    const estado = ESTADOS_TAREA.includes(t.estado as EstadoTarea) ? (t.estado as EstadoTarea) : "Sin iniciar";
    const prioridad = PRIORIDADES.includes(t.prioridad as Prioridad) ? (t.prioridad as Prioridad) : "Media";
    const porcentaje = numOr(t.porcentaje, 0);

    const plantillaId =
      typeof t.plantillaId === "string" && t.plantillaId ? t.plantillaId : inferirPlantillaId(nombre);
    const inferido = inferirGrupoYSubgrupo({ plantillaId, etapa, categoria });
    // `grupo` debe ser uno de los 8 grupos reales: un valor ajeno (typo, campo legacy de la v1)
    // desaparecía en silencio de la vista "Agrupar por grupo" aunque la tarea siguiera contando
    // en el total del encabezado.
    const grupoImportado =
      typeof t.grupo === "string" && GRUPOS.some((g) => g.id === t.grupo) ? (t.grupo as GrupoId) : null;
    const grupo = grupoImportado ?? inferido.grupo ?? null;
    const subgrupo = (typeof t.subgrupo === "string" && t.subgrupo ? t.subgrupo : inferido.subgrupo) ?? null;

    const tareaRef = proyectoRef.collection("tareas").doc();
    const tarea: Tarea = {
      id: tareaRef.id,
      proyectoId: proyectoRef.id,
      plantillaId,
      nombre,
      categoria,
      grupo,
      subgrupo,
      zona: strOr(t.zona, "") || null,
      etapa: etapa || null,
      responsableUid: typeof t.responsableUid === "string" ? t.responsableUid : null,
      responsable: strOr(t.responsable, ""),
      prioridad,
      estado,
      porcentaje,
      fechaInicio: strOr(t.fechaInicio, ""),
      fechaLimite: strOr(t.fechaLimite, ""),
      fechaCompletada: strOr(t.fechaCompletada, ""),
      horasEstimadas: numOr(t.horasEstimadas, 0),
      horasReales: numOr(t.horasReales, 0),
      comentarios: strOr(t.comentarios, ""),
      bloqueadoPor: strOr(t.bloqueadoPor, ""),
      verificacion:
        typeof t.verificacion === "object" && t.verificacion !== null
          ? (t.verificacion as Record<number, boolean>)
          : {},
      historial:
        Array.isArray(t.historial) && t.historial.length > 0
          ? (t.historial as Tarea["historial"])
          : [{ f: ahora, p: porcentaje, e: estado }],
      actualizado: ahora,
    };

    // Overrides de contenido: solo si vienen en el archivo (Firestore rechaza `undefined`).
    if (typeof t.descripcion === "string") tarea.descripcion = t.descripcion;
    if (typeof t.objetivo === "string") tarea.objetivo = t.objetivo;
    if (Array.isArray(t.requisitos)) tarea.requisitos = t.requisitos as string[];
    if (Array.isArray(t.procedimiento)) tarea.procedimiento = t.procedimiento as string[];
    if (typeof t.resultadoEsperado === "string") tarea.resultadoEsperado = t.resultadoEsperado;
    if (Array.isArray(t.criteriosVerificacion)) tarea.criteriosVerificacion = t.criteriosVerificacion as string[];
    if (Array.isArray(t.notasIngenieria)) tarea.notasIngenieria = t.notasIngenieria as NotaIngenieria[];
    if (Array.isArray(t.tipsRevit)) tarea.tipsRevit = t.tipsRevit as string[];

    batch.set(tareaRef, tarea);
    tareasCreadas.push(tarea);
  }

  const proyecto: Proyecto = {
    id: proyectoRef.id,
    nombre: raw.nombre,
    cliente: strOr(raw.cliente, ""),
    fechaInicio: strOr(raw.fechaInicio, ""),
    fechaEntrega: strOr(raw.fechaEntrega, ""),
    disciplina: strOr(raw.disciplina, "Eléctrica"),
    software: strOr(raw.software, "Revit"),
    estado: ESTADOS_PROYECTO.includes(raw.estado as EstadoProyecto) ? (raw.estado as EstadoProyecto) : "Sin iniciar",
    notas: strOr(raw.notas, ""),
    zonas: Array.isArray(raw.zonas) ? (raw.zonas as string[]) : [],
    creado: ahora,
    actualizado: ahora,
    totalTareas: tareasCreadas.length,
    tareasCompletadas: tareasCreadas.filter((t) => t.estado === "Completada").length,
    avanceTotal: computeAvance(tareasCreadas),
  };
  batch.set(proyectoRef, proyecto);

  // Incorporar responsables nuevos al equipo, igual que hacía la v1 al importar.
  const nombresNuevos = [...new Set(tareasCreadas.map((t) => t.responsable).filter(Boolean))].filter(
    (n) => !nombresConocidos.has(n),
  );
  if (nombresNuevos.length > 0) {
    batch.set(adminDb.doc("config/equipo"), { membersLegacy: FieldValue.arrayUnion(...nombresNuevos) }, { merge: true });
  }

  await batch.commit();

  revalidatePath("/proyectos");
  return { id: proyectoRef.id };
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
