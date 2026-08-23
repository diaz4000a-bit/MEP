import { CATEGORIAS } from "@/content/categorias";
import { GRUPOS } from "@/content/grupos";
import { ESTADOS_TRAMITE, ESTADOS_TRAMITE_RADICADOS, TIPOS_TRAMITE } from "@/content/tramites";
import type {
  Categoria,
  EstadoTarea,
  EstadoTramite,
  GrupoId,
  Prioridad,
  Tarea,
  TipoTramite,
  Tramite,
} from "@/types";

/**
 * Validación de entrada para las Server Actions y saneado de documentos leídos.
 *
 * Una Server Action compila a un endpoint HTTP público: la anotación `datos: DatosTarea`
 * se borra al compilar y en runtime llega lo que el cliente decida mandar. Sin esto se
 * podían guardar porcentajes fuera de 0-100, estados inventados, horas negativas, fechas
 * incoherentes o un `historial` con strings — que además el informe HTML interpolaba sin
 * escapar (XSS persistente).
 *
 * Hecho a mano y no con zod a propósito: el proyecto no tiene zod como dependencia y esto
 * cubre las tres formas que realmente cruzan la frontera.
 */

export const ESTADOS_TAREA: EstadoTarea[] = [
  "Sin iniciar",
  "En progreso",
  "En revisión",
  "Completada",
  "Bloqueada",
];
export const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"];

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TEXTO_CORTO = 200;
const MAX_TEXTO_LARGO = 5000;
const MAX_HORAS = 100_000;

export class ErrorValidacion extends Error {}

function fallar(mensaje: string): never {
  throw new ErrorValidacion(mensaje);
}

function texto(v: unknown, campo: string, max = MAX_TEXTO_CORTO): string {
  if (v === null || v === undefined) return "";
  if (typeof v !== "string") fallar(`El campo "${campo}" debe ser texto.`);
  if (v.length > max) fallar(`El campo "${campo}" supera los ${max} caracteres.`);
  return v.trim();
}

function textoOpcional(v: unknown, campo: string, max = MAX_TEXTO_CORTO): string | null {
  return texto(v, campo, max) || null;
}

/** Fecha 'AAAA-MM-DD' real (rechaza 2026-02-31, que `new Date` normaliza en silencio) o "". */
export function fechaValida(v: unknown, campo: string): string {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v !== "string" || !FECHA_RE.test(v)) {
    fallar(`El campo "${campo}" debe tener formato AAAA-MM-DD.`);
  }
  const d = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) {
    fallar(`El campo "${campo}" no es una fecha existente.`);
  }
  return v;
}

function entero(v: unknown, campo: string, min: number, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) fallar(`El campo "${campo}" debe ser un número.`);
  const redondeado = Math.round(n);
  if (redondeado < min || redondeado > max) {
    fallar(`El campo "${campo}" debe estar entre ${min} y ${max}.`);
  }
  return redondeado;
}

function decimal(v: unknown, campo: string, min: number, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) fallar(`El campo "${campo}" debe ser un número.`);
  if (n < min || n > max) fallar(`El campo "${campo}" debe estar entre ${min} y ${max}.`);
  return n;
}

function unaDe<T extends string>(v: unknown, validos: readonly T[], campo: string): T {
  if (typeof v !== "string" || !validos.includes(v as T)) {
    fallar(`El campo "${campo}" no tiene un valor válido.`);
  }
  return v as T;
}

export interface DatosTarea {
  nombre: string;
  grupo: GrupoId | null;
  subgrupo: string | null;
  zona: string | null;
  etapa: string | null;
  categoria: Categoria;
  responsableUid: string | null;
  responsable: string;
  prioridad: Prioridad;
  estado: EstadoTarea;
  porcentaje: number;
  fechaInicio: string;
  fechaLimite: string;
  horasEstimadas: number;
  horasReales: number;
  comentarios: string;
  bloqueadoPor: string;
}

const IDS_GRUPO: GrupoId[] = GRUPOS.map((g) => g.id);

/** Normaliza y valida el payload de crear/actualizar tarea. Lanza `ErrorValidacion`. */
export function validarDatosTarea(entrada: unknown): DatosTarea {
  if (typeof entrada !== "object" || entrada === null) {
    fallar("Los datos de la tarea no tienen el formato esperado.");
  }
  const d = entrada as Record<string, unknown>;

  const nombre = texto(d.nombre, "nombre");
  if (!nombre) fallar("El nombre de la tarea es obligatorio.");

  const grupo =
    d.grupo === null || d.grupo === undefined || d.grupo === ""
      ? null
      : unaDe(d.grupo, IDS_GRUPO, "grupo");

  const fechaInicio = fechaValida(d.fechaInicio, "fechaInicio");
  const fechaLimite = fechaValida(d.fechaLimite, "fechaLimite");
  if (fechaInicio && fechaLimite && fechaLimite < fechaInicio) {
    fallar("La fecha límite no puede ser anterior a la fecha de inicio.");
  }

  const estado = unaDe(d.estado, ESTADOS_TAREA, "estado");
  const porcentaje = entero(d.porcentaje, "porcentaje", 0, 100);

  return {
    nombre,
    grupo,
    subgrupo: textoOpcional(d.subgrupo, "subgrupo"),
    zona: textoOpcional(d.zona, "zona"),
    etapa: textoOpcional(d.etapa, "etapa"),
    categoria: unaDe(d.categoria, CATEGORIAS, "categoria"),
    responsableUid: textoOpcional(d.responsableUid, "responsableUid"),
    responsable: texto(d.responsable, "responsable"),
    prioridad: unaDe(d.prioridad, PRIORIDADES, "prioridad"),
    estado,
    // Una tarea "Completada" al 40% deja la barra de avance, el indicador del proyecto y el
    // informe diciendo cosas distintas de la misma tarea; se normaliza en vez de rechazar.
    porcentaje: estado === "Completada" ? 100 : porcentaje,
    fechaInicio,
    fechaLimite,
    horasEstimadas: decimal(d.horasEstimadas, "horasEstimadas", 0, MAX_HORAS),
    horasReales: decimal(d.horasReales, "horasReales", 0, MAX_HORAS),
    comentarios: texto(d.comentarios, "comentarios", MAX_TEXTO_LARGO),
    bloqueadoPor: texto(d.bloqueadoPor, "bloqueadoPor", MAX_TEXTO_LARGO),
  };
}

export interface DatosProyecto {
  nombre: string;
  cliente: string;
  fechaInicio: string;
  fechaEntrega: string;
  software: string;
}

/** Normaliza y valida el payload de crear proyecto. Lanza `ErrorValidacion`. */
export function validarDatosProyecto(entrada: unknown): DatosProyecto {
  if (typeof entrada !== "object" || entrada === null) {
    fallar("Los datos del proyecto no tienen el formato esperado.");
  }
  const d = entrada as Record<string, unknown>;

  const nombre = texto(d.nombre, "nombre");
  if (!nombre) fallar("El nombre del proyecto es obligatorio.");

  const fechaInicio = fechaValida(d.fechaInicio, "fechaInicio");
  const fechaEntrega = fechaValida(d.fechaEntrega, "fechaEntrega");
  if (fechaInicio && fechaEntrega && fechaEntrega < fechaInicio) {
    fallar("La fecha de entrega no puede ser anterior a la fecha de inicio.");
  }

  return {
    nombre,
    cliente: texto(d.cliente, "cliente"),
    fechaInicio,
    fechaEntrega,
    software: texto(d.software, "software"),
  };
}

/** Valida `estado` + `porcentaje` sueltos (acción rápida desde el tablero). */
export function validarEstadoYPorcentaje(
  estado: unknown,
  porcentaje: unknown,
): { estado: EstadoTarea; porcentaje: number } {
  const e = unaDe(estado, ESTADOS_TAREA, "estado");
  const p = entero(porcentaje, "porcentaje", 0, 100);
  return { estado: e, porcentaje: e === "Completada" ? 100 : p };
}

/** Valida el mapa `verificacion`: índice del criterio → marcado. */
export function validarVerificacion(valor: unknown): Record<number, boolean> {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
    fallar("Los datos de verificación no tienen el formato esperado.");
  }
  const out: Record<number, boolean> = {};
  for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
    const i = Number(k);
    if (!Number.isInteger(i) || i < 0 || i > 500) continue;
    out[i] = v === true;
  }
  return out;
}

export const TOPE_HISTORIAL = 60;

/**
 * Sanea `historial` venido de Firestore o de un JSON importado. El informe HTML interpola
 * `p` y `f` como números crudos; si un import metió un string ahí, ese string acababa dentro
 * del HTML sin escapar. Devolver siempre números corta el vector en la raíz.
 */
export function sanearHistorial(valor: unknown): Tarea["historial"] {
  if (!Array.isArray(valor)) return [];
  const out: Tarea["historial"] = [];
  for (const item of valor) {
    if (typeof item !== "object" || item === null) continue;
    const h = item as Record<string, unknown>;
    const f = Number(h.f);
    const p = Number(h.p);
    if (!Number.isFinite(f) || !Number.isFinite(p)) continue;
    const e = ESTADOS_TAREA.includes(h.e as EstadoTarea) ? (h.e as EstadoTarea) : "Sin iniciar";
    out.push({ f: Math.trunc(f), p: Math.min(100, Math.max(0, Math.round(p))), e });
  }
  return out.slice(-TOPE_HISTORIAL);
}

/** Máximo de días que puede abarcar un filtro de fechas (~1 año + margen). */
export const MAX_DIAS_RANGO = 400;

const MS_POR_DIA = 86_400_000;

/**
 * Acota un rango `desde`/`hasta` recibido por querystring. Sin esto, `?desde=0001-01-01`
 * hacía que `rangoFechas` generara ~740.000 strings en memoria y que la consulta a
 * `jornadas` barriera la colección entera.
 */
export function validarRangoFechas(
  desde: string,
  hasta: string,
  porDefecto: { desde: string; hasta: string },
): { desde: string; hasta: string } {
  const d = FECHA_RE.test(desde) ? desde : porDefecto.desde;
  const h = FECHA_RE.test(hasta) ? hasta : porDefecto.hasta;
  const [ini, fin] = d <= h ? [d, h] : [h, d];

  const ms = Date.parse(`${fin}T00:00:00Z`) - Date.parse(`${ini}T00:00:00Z`);
  if (!Number.isFinite(ms)) return porDefecto;
  if (ms / MS_POR_DIA <= MAX_DIAS_RANGO) return { desde: ini, hasta: fin };

  // Rango demasiado ancho: se recorta hacia atrás desde `hasta`, que es el extremo que el
  // usuario suele estar mirando.
  const recortado = new Date(Date.parse(`${fin}T00:00:00Z`) - MAX_DIAS_RANGO * MS_POR_DIA);
  return { desde: recortado.toISOString().slice(0, 10), hasta: fin };
}

/**
 * Firestore rechaza un WriteBatch con más de 500 operaciones. Importar un proyecto grande,
 * borrarlo o vaciar una zona superaba ese tope y fallaba entero, a veces tras haber escrito
 * ya parte de los datos.
 */
export const LIMITE_LOTE_FIRESTORE = 450;

export function trocear<T>(items: T[], tam = LIMITE_LOTE_FIRESTORE): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < items.length; i += tam) lotes.push(items.slice(i, i + tam));
  return lotes;
}

/* ── Trámites ────────────────────────────────────────────────────────────────── */

/** Cota dura del costo de un trámite, en COP. Por encima de esto el dato es un error de dedo. */
const MAX_COSTO_TRAMITE = 10_000_000_000;

export interface DatosTramite {
  nombre: string;
  tipo: TipoTramite;
  entidad: string;
  radicado: string;
  estado: EstadoTramite;
  responsableUid: string | null;
  responsable: string;
  fechaRadicacion: string;
  fechaLimite: string;
  fechaResolucion: string;
  costo: number;
  notas: string;
}

/** Normaliza y valida el payload de crear/actualizar trámite. Lanza `ErrorValidacion`. */
export function validarDatosTramite(entrada: unknown): DatosTramite {
  if (typeof entrada !== "object" || entrada === null) {
    fallar("Los datos del trámite no tienen el formato esperado.");
  }
  const d = entrada as Record<string, unknown>;

  const nombre = texto(d.nombre, "nombre");
  if (!nombre) fallar("El nombre del trámite es obligatorio.");

  const estado = unaDe(d.estado, ESTADOS_TRAMITE, "estado");
  const fechaRadicacion = fechaValida(d.fechaRadicacion, "fechaRadicacion");
  const fechaLimite = fechaValida(d.fechaLimite, "fechaLimite");
  const fechaResolucion = fechaValida(d.fechaResolucion, "fechaResolucion");

  // Un trámite no puede estar "Radicado" sin decir cuándo se radicó: esa fecha es el origen
  // del plazo de respuesta y, sin ella, el semáforo no tiene contra qué medir.
  if (ESTADOS_TRAMITE_RADICADOS.includes(estado) && !fechaRadicacion) {
    fallar(`Un trámite en estado "${estado}" necesita fecha de radicación.`);
  }
  if (fechaRadicacion && fechaLimite && fechaLimite < fechaRadicacion) {
    fallar("La fecha límite no puede ser anterior a la fecha de radicación.");
  }
  if (fechaRadicacion && fechaResolucion && fechaResolucion < fechaRadicacion) {
    fallar("La fecha de resolución no puede ser anterior a la fecha de radicación.");
  }

  return {
    nombre,
    tipo: unaDe(d.tipo, TIPOS_TRAMITE, "tipo"),
    entidad: texto(d.entidad, "entidad"),
    radicado: texto(d.radicado, "radicado"),
    estado,
    responsableUid: textoOpcional(d.responsableUid, "responsableUid"),
    responsable: texto(d.responsable, "responsable"),
    fechaRadicacion,
    fechaLimite,
    // Solo un trámite cerrado tiene fecha de resolución. Conservarla al reabrirlo dejaba
    // la ficha diciendo "resuelto el 3 de mayo" sobre un trámite otra vez en curso.
    fechaResolucion: estado === "Aprobado" || estado === "Rechazado" ? fechaResolucion : "",
    costo: decimal(d.costo, "costo", 0, MAX_COSTO_TRAMITE),
    notas: texto(d.notas, "notas", MAX_TEXTO_LARGO),
  };
}

/**
 * Sanea el `historial` de un trámite leído de Firestore. Mismo motivo que en tareas: el
 * informe HTML interpola estos valores, así que `f` sale siempre número y `e` siempre de
 * la lista blanca de estados.
 */
export function sanearHistorialTramite(valor: unknown): Tramite["historial"] {
  if (!Array.isArray(valor)) return [];
  const out: Tramite["historial"] = [];
  for (const item of valor) {
    if (typeof item !== "object" || item === null) continue;
    const h = item as Record<string, unknown>;
    const f = Number(h.f);
    if (!Number.isFinite(f)) continue;
    const e = ESTADOS_TRAMITE.includes(h.e as EstadoTramite) ? (h.e as EstadoTramite) : "Sin iniciar";
    out.push({ f: Math.trunc(f), e });
  }
  return out.slice(-TOPE_HISTORIAL);
}
