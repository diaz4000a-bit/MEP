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
import {
  ESTADOS_TAREA,
  PRIORIDADES,
  TOPE_HISTORIAL,
  type DatosTarea,
  sanearHistorial,
  trocear,
  validarDatosProyecto,
  validarDatosTarea,
  validarEstadoYPorcentaje,
  validarVerificacion,
} from "@/lib/validar";
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
import type { DatosProyecto } from "@/lib/validar";

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

export async function crearProyecto(datosCrudos: unknown) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "crearProyecto");
  const datos = validarDatosProyecto(datosCrudos);

  const ref = adminDb.collection("proyectos").doc();
  const ahora = Date.now();
  await ref.set(proyectoBase(ref.id, datos, ahora));

  revalidatePath("/proyectos");
  return { id: ref.id };
}

/**
 * Crea un proyecto con sus tareas respetando el límite de 500 operaciones por WriteBatch.
 *
 * El documento del proyecto va PRIMERO a propósito: si un lote de tareas falla, queda un
 * proyecto incompleto —visible en la lista y borrable— en vez de una subcolección de tareas
 * colgando de un proyecto que no existe, invisible para la app y para el administrador.
 * Si algún lote falla se revierte lo escrito antes de propagar el error.
 */
async function crearProyectoConTareas(
  proyectoRef: FirebaseFirestore.DocumentReference,
  proyecto: Proyecto,
  tareas: { ref: FirebaseFirestore.DocumentReference; datos: Tarea }[],
) {
  await proyectoRef.set(proyecto);
  try {
    for (const lote of trocear(tareas)) {
      const batch = adminDb.batch();
      for (const t of lote) batch.set(t.ref, t.datos);
      await batch.commit();
    }
  } catch (err) {
    await eliminarProyectoCompleto(proyectoRef).catch(() => {});
    throw err;
  }
}

async function eliminarProyectoCompleto(proyectoRef: FirebaseFirestore.DocumentReference) {
  const tareasSnap = await proyectoRef.collection("tareas").get();
  for (const lote of trocear(tareasSnap.docs)) {
    const batch = adminDb.batch();
    for (const doc of lote) batch.delete(doc.ref);
    await batch.commit();
  }
  await proyectoRef.delete();
}

export async function crearProyectoDesdeplantilla(datosCrudos: unknown) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "crearProyecto");
  const datos = validarDatosProyecto(datosCrudos);

  const { lista: catalogo } = await catalogoVigente();

  const ref = adminDb.collection("proyectos").doc();
  const ahora = Date.now();
  const proyecto = proyectoBase(ref.id, datos, ahora);
  proyecto.totalTareas = catalogo.length;

  const tareas: { ref: FirebaseFirestore.DocumentReference; datos: Tarea }[] = [];
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
    tareas.push({ ref: tareaRef, datos: tarea });
  }
  await crearProyectoConTareas(ref, proyecto, tareas);

  revalidatePath("/proyectos");
  return { id: ref.id };
}

export async function eliminarProyecto(proyectoId: string) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "borrarProyecto");

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tareasSnap = await proyectoRef.collection("tareas").get();

  // Un WriteBatch admite como máximo 500 operaciones: un proyecto de plantilla completa ya
  // ronda las 200 tareas y uno importado puede pasar de 500, con lo que el batch entero
  // fallaba. Las tareas primero y el proyecto al final: si un lote falla, queda el proyecto
  // con tareas de menos (visible y recuperable) y no una subcolección sin proyecto padre.
  for (const lote of trocear(tareasSnap.docs)) {
    const batch = adminDb.batch();
    for (const doc of lote) batch.delete(doc.ref);
    await batch.commit();
  }
  await proyectoRef.delete();

  revalidatePath("/proyectos");
}

// No exportada: un archivo "use server" solo puede exportar funciones async — exportar
// esta constante invalida el módulo entero para el bundle de cliente (Turbopack lo trata
// como "sin exports", rompiendo cada Server Action que otros componentes importan de aquí).
const MAX_NOTAS_PROYECTO = 20_000;

export async function guardarNotasProyecto(proyectoId: string, notas: string) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "editarTareaPropia"); // cualquier miembro activo del equipo puede anotar
  if (typeof notas !== "string") throw new Error("Las notas deben ser texto.");
  if (notas.length > MAX_NOTAS_PROYECTO) {
    throw new Error(`Las notas superan el máximo de ${MAX_NOTAS_PROYECTO} caracteres.`);
  }
  await adminDb.doc(`proyectos/${proyectoId}`).update({ notas, actualizado: Date.now() });
  revalidatePath(`/proyectos/${proyectoId}`);
}

/**
 * Métricas denormalizadas del proyecto (`totalTareas`, `tareasCompletadas`, `avanceTotal`).
 * Se calcula SIEMPRE dentro de la transacción que modifica las tareas: cuando esto vivía
 * en una segunda ida a Firestore, dos operaciones simultáneas leían el mismo conteo y la
 * última dejaba el encabezado del proyecto desfasado del contenido real.
 */
function metricasProyecto(tareas: Tarea[], ahora: number) {
  return {
    totalTareas: tareas.length,
    tareasCompletadas: tareas.filter((t) => t.estado === "Completada").length,
    avanceTotal: computeAvance(tareas),
    actualizado: ahora,
  };
}

export async function crearTarea(proyectoId: string, datosCrudos: DatosTarea) {
  const usuario = await exigirUsuario();
  await exigirPermiso(usuario, "crearTarea");
  const datos = validarDatosTarea(datosCrudos);

  const proyectoRef = adminDb.doc(`proyectos/${proyectoId}`);
  const tareaRef = proyectoRef.collection("tareas").doc();
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    // En una transacción de Firestore TODAS las lecturas van antes que las escrituras.
    // Leer el proyecto además garantiza que no se cree una tarea huérfana si el proyecto
    // se borró entre que se abrió el diálogo y se pulsó Guardar.
    const proyectoSnap = await tx.get(proyectoRef);
    if (!proyectoSnap.exists) throw new Error("El proyecto ya no existe.");
    const todasSnap = await tx.get(proyectoRef.collection("tareas"));

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

    const todas = [...todasSnap.docs.map((d) => d.data() as Tarea), tarea];
    tx.set(tareaRef, tarea);
    tx.update(proyectoRef, metricasProyecto(todas, ahora));
  });

  revalidatePath(`/proyectos/${proyectoId}`);
}

export async function actualizarTarea(proyectoId: string, tareaId: string, datosCrudos: DatosTarea) {
  const usuario = await exigirUsuario();
  const datos = validarDatosTarea(datosCrudos);

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

    const historialActual = sanearHistorial(actual.historial);
    const huboCambio = datos.porcentaje !== actual.porcentaje || datos.estado !== actual.estado;
    const historial = huboCambio
      ? [...historialActual, { f: ahora, p: datos.porcentaje, e: datos.estado }].slice(-TOPE_HISTORIAL)
      : historialActual;
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
    tx.update(proyectoRef, metricasProyecto(todas, ahora));
  });

  revalidatePath(`/proyectos/${proyectoId}`);
}

export async function actualizarEstadoTarea(
  proyectoId: string,
  tareaId: string,
  estadoCrudo: Tarea["estado"],
  porcentajeCrudo: number,
) {
  const usuario = await exigirUsuario();
  const { estado, porcentaje } = validarEstadoYPorcentaje(estadoCrudo, porcentajeCrudo);

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

    const historialActual = sanearHistorial(actual.historial);
    const huboCambio = porcentaje !== actual.porcentaje || estado !== actual.estado;
    const historial = huboCambio
      ? [...historialActual, { f: ahora, p: porcentaje, e: estado }].slice(-TOPE_HISTORIAL)
      : historialActual;

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
    tx.update(proyectoRef, metricasProyecto(todas, ahora));
  });

  revalidatePath(`/proyectos/${proyectoId}/tarea/${tareaId}`);
  revalidatePath(`/proyectos/${proyectoId}`);
}

export async function actualizarVerificacion(
  proyectoId: string,
  tareaId: string,
  verificacionCruda: Record<number, boolean>,
) {
  const usuario = await exigirUsuario();
  const verificacion = validarVerificacion(verificacionCruda);

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
  const tareaRef = proyectoRef.collection("tareas").doc(tareaId);
  const ahora = Date.now();

  await adminDb.runTransaction(async (tx) => {
    const proyectoSnap = await tx.get(proyectoRef);
    if (!proyectoSnap.exists) throw new Error("El proyecto ya no existe.");
    const todasSnap = await tx.get(proyectoRef.collection("tareas"));

    const restantes = todasSnap.docs.filter((d) => d.id !== tareaId).map((d) => d.data() as Tarea);
    tx.delete(tareaRef);
    tx.update(proyectoRef, metricasProyecto(restantes, ahora));
  });

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

/** Tope de tareas por import. Por encima de esto el archivo casi seguro es un error. */
const MAX_TAREAS_IMPORT = 5000;

function strOr(v: unknown, fallback = "", max = 5000): string {
  return typeof v === "string" ? v.slice(0, max) : fallback;
}
function numOr(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
/** Entero acotado: un `porcentaje: 5000` del archivo rompía barras de avance y el informe. */
function numEnRango(v: unknown, min: number, max: number, fallback = 0): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
function listaDeTextos(v: unknown, maxItems = 500): string[] | null {
  if (!Array.isArray(v)) return null;
  return v
    .slice(0, maxItems)
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.slice(0, 5000));
}
/**
 * Fecha del archivo: se conserva solo si es 'AAAA-MM-DD' Y corresponde a un día real
 * (rechaza '2026-02-31', que `new Date` normaliza en silencio al 3 de marzo); si no,
 * se descarta sin lanzar — un import nunca debe reventar por una fecha mala.
 */
function fechaImportada(v: unknown): string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v ? v : "";
}
/** URL de nota de ingeniería: solo http(s) absoluto. `ficha-tarea.tsx` la renderiza como
 *  `<a href>`; aceptar 'javascript:' u otro esquema del archivo importado sería XSS al clic. */
function urlSegura(v: unknown): string | null {
  if (typeof v !== "string" || !v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? v.slice(0, 2000) : null;
  } catch {
    return null;
  }
}
function notaImportada(v: unknown): NotaIngenieria | null {
  if (typeof v !== "object" || v === null) return null;
  const n = v as Record<string, unknown>;
  const texto = strOr(n.texto, "");
  if (!texto) return null;
  return {
    texto,
    fuente: strOr(n.fuente, "") || null,
    url: urlSegura(n.url),
    verificar: n.verificar === true,
  };
}
/** Sanea `notasIngenieria` del archivo: cada nota necesita `texto`, y `url` pasa por
 *  `urlSegura`. Antes se aceptaba el array tal cual del JSON sin validar ningún campo. */
function notasIngenieriaImportadas(v: unknown): NotaIngenieria[] | null {
  if (!Array.isArray(v)) return null;
  const out = v
    .slice(0, 200)
    .map(notaImportada)
    .filter((n): n is NotaIngenieria => n !== null);
  return out.length > 0 ? out : null;
}
function historialImportado(
  v: unknown,
  ahora: number,
  porcentaje: number,
  estado: EstadoTarea,
): Tarea["historial"] {
  const saneado = sanearHistorial(v);
  return saneado.length > 0 ? saneado : [{ f: ahora, p: porcentaje, e: estado }];
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
  if (typeof raw.nombre !== "string" || !raw.nombre.trim() || !Array.isArray(raw.tareas)) {
    throw new Error("El archivo no tiene el formato de proyecto esperado.");
  }
  if (raw.tareas.length > MAX_TAREAS_IMPORT) {
    throw new Error(`El archivo trae ${raw.tareas.length} tareas; el máximo por importación es ${MAX_TAREAS_IMPORT}.`);
  }

  const [usuariosSnap, equipoSnap] = await Promise.all([
    adminDb.collection("usuarios").get(),
    adminDb.doc("config/equipo").get(),
  ]);
  const nombresConocidos = new Set([
    ...usuariosSnap.docs.map((d) => (d.data() as Usuario).nombre),
    ...((equipoSnap.data()?.membersLegacy as string[] | undefined) ?? []),
  ]);
  // Un `responsableUid` inventado (typo, id de otro entorno) dejaba la tarea "asignada" a un
  // usuario que no existe: no aparecía en ningún filtro por persona ni en "Mis tareas".
  const uidsConocidos = new Set(usuariosSnap.docs.map((d) => d.id));

  const ahora = Date.now();
  const proyectoRef = adminDb.collection("proyectos").doc();
  const tareasAEscribir: { ref: FirebaseFirestore.DocumentReference; datos: Tarea }[] = [];
  const tareasCreadas: Tarea[] = [];

  for (const item of raw.tareas) {
    if (typeof item !== "object" || item === null) continue;
    const t = item as Record<string, unknown>;

    const nombre = strOr(t.nombre, "Tarea sin nombre");
    const etapa = strOr(t.etapa, "");
    const categoria = CATEGORIAS.includes(t.categoria as Categoria) ? (t.categoria as Categoria) : "Modelado";
    const estado = ESTADOS_TAREA.includes(t.estado as EstadoTarea) ? (t.estado as EstadoTarea) : "Sin iniciar";
    const prioridad = PRIORIDADES.includes(t.prioridad as Prioridad) ? (t.prioridad as Prioridad) : "Media";
    // Una tarea "Completada" al 40% deja `tareasCompletadas` y `avanceTotal` diciendo cosas
    // distintas de la misma tarea (mismo motivo que `validarDatosTarea`); se normaliza en
    // vez de conservar el porcentaje crudo del archivo.
    const porcentaje = estado === "Completada" ? 100 : numEnRango(t.porcentaje, 0, 100, 0);

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
      responsableUid: typeof t.responsableUid === "string" && uidsConocidos.has(t.responsableUid) ? t.responsableUid : null,
      responsable: strOr(t.responsable, ""),
      prioridad,
      estado,
      porcentaje,
      fechaInicio: fechaImportada(t.fechaInicio),
      fechaLimite: fechaImportada(t.fechaLimite),
      fechaCompletada: fechaImportada(t.fechaCompletada),
      horasEstimadas: Math.max(0, numOr(t.horasEstimadas, 0)),
      horasReales: Math.max(0, numOr(t.horasReales, 0)),
      comentarios: strOr(t.comentarios, ""),
      bloqueadoPor: strOr(t.bloqueadoPor, ""),
      verificacion: validarVerificacion(
        typeof t.verificacion === "object" && t.verificacion !== null ? t.verificacion : {},
      ),
      // `historial` es el campo que el informe HTML interpola sin escapar (`p` y `f` van
      // como números crudos). Aceptarlo tal cual del archivo era el vector de XSS
      // persistente: `sanearHistorial` fuerza números y estados de la lista blanca.
      historial: historialImportado(t.historial, ahora, porcentaje, estado),
      actualizado: ahora,
    };

    // Overrides de contenido: solo si vienen en el archivo (Firestore rechaza `undefined`).
    // Los arrays se filtran a strings; antes un `requisitos: [{...}]` entraba tal cual y la
    // ficha de la tarea reventaba al renderizarlo.
    if (typeof t.descripcion === "string") tarea.descripcion = strOr(t.descripcion);
    if (typeof t.objetivo === "string") tarea.objetivo = strOr(t.objetivo);
    const requisitos = listaDeTextos(t.requisitos);
    if (requisitos) tarea.requisitos = requisitos;
    const procedimiento = listaDeTextos(t.procedimiento);
    if (procedimiento) tarea.procedimiento = procedimiento;
    if (typeof t.resultadoEsperado === "string") tarea.resultadoEsperado = strOr(t.resultadoEsperado);
    const criterios = listaDeTextos(t.criteriosVerificacion);
    if (criterios) tarea.criteriosVerificacion = criterios;
    const notas = notasIngenieriaImportadas(t.notasIngenieria);
    if (notas) tarea.notasIngenieria = notas;
    const tips = listaDeTextos(t.tipsRevit);
    if (tips) tarea.tipsRevit = tips;

    tareasAEscribir.push({ ref: tareaRef, datos: tarea });
    tareasCreadas.push(tarea);
  }

  const proyecto: Proyecto = {
    id: proyectoRef.id,
    nombre: strOr(raw.nombre, "Proyecto importado", 200),
    cliente: strOr(raw.cliente, "", 200),
    fechaInicio: fechaImportada(raw.fechaInicio),
    fechaEntrega: fechaImportada(raw.fechaEntrega),
    disciplina: strOr(raw.disciplina, "Eléctrica"),
    software: strOr(raw.software, "Revit", 200),
    estado: ESTADOS_PROYECTO.includes(raw.estado as EstadoProyecto) ? (raw.estado as EstadoProyecto) : "Sin iniciar",
    notas: strOr(raw.notas, ""),
    zonas: listaDeTextos(raw.zonas, 300) ?? [],
    creado: ahora,
    actualizado: ahora,
    totalTareas: tareasCreadas.length,
    tareasCompletadas: tareasCreadas.filter((t) => t.estado === "Completada").length,
    avanceTotal: computeAvance(tareasCreadas),
  };

  await crearProyectoConTareas(proyectoRef, proyecto, tareasAEscribir);

  // Incorporar responsables nuevos al equipo, igual que hacía la v1 al importar. Va después
  // del proyecto: es un efecto secundario y no debe abortar la importación si falla.
  const nombresNuevos = [...new Set(tareasCreadas.map((t) => t.responsable).filter(Boolean))].filter(
    (n) => !nombresConocidos.has(n),
  );
  if (nombresNuevos.length > 0) {
    await adminDb
      .doc("config/equipo")
      .set({ membersLegacy: FieldValue.arrayUnion(...nombresNuevos) }, { merge: true });
  }

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

  const ahora = Date.now();
  const zonas = ((proyectoSnap.data() as Proyecto).zonas ?? []).filter((z) => z !== zona);

  // Una zona con más de 500 tareas reventaba el batch único (límite de Firestore).
  for (const lote of trocear(tareasDeZonaSnap.docs)) {
    const batch = adminDb.batch();
    for (const doc of lote) batch.update(doc.ref, { zona: null, actualizado: ahora });
    await batch.commit();
  }
  await proyectoRef.update({ zonas, actualizado: ahora });

  revalidatePath(`/proyectos/${proyectoId}`);
}
