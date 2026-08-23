import { ESTADOS_TRAMITE, FICHAS_TRAMITE } from "@/content/tramites";
import { diasHasta } from "@/lib/tiempo";
import type { EstadoTramite, TipoTramite, Tramite } from "@/types";

/**
 * Lógica pura del semáforo de trámites. Sin acceso a Firestore ni a React a propósito:
 * es lo único de esta sección que se puede probar en aislamiento.
 *
 * El semáforo NO se denormaliza en el documento del proyecto. Un trámite verde se vuelve
 * rojo por el simple paso del tiempo, sin ninguna escritura de por medio: cualquier valor
 * guardado quedaría desfasado el día siguiente. Se calcula siempre en el render, contra
 * `diasHasta`, que ancla "hoy" al día de Bogotá y no al del runtime (en Vercel, UTC).
 */

export type Semaforo = "verde" | "amarillo" | "rojo";

/**
 * Días de antelación con que un trámite pasa a ámbar. Siete y no tres (el umbral de las
 * tareas) porque un trámite no se resuelve trabajando más: hay que perseguir a un tercero,
 * y tres días de aviso no alcanzan para nada.
 */
export const DIAS_ALERTA_TRAMITE = 7;

const ORDEN_SEMAFORO: Semaforo[] = ["verde", "amarillo", "rojo"];

/** Un trámite cerrado ya no consume gestión: la entidad respondió. */
export function esTramiteCerrado(t: Pick<Tramite, "estado">): boolean {
  return t.estado === "Aprobado" || t.estado === "Rechazado";
}

export function semaforoTramite(t: Pick<Tramite, "estado" | "fechaLimite">): Semaforo {
  if (t.estado === "Aprobado") return "verde";
  if (t.estado === "Rechazado") return "rojo";

  const dias = diasHasta(t.fechaLimite);
  // Sin fecha comprometida no hay nada que vigilar, pero tampoco nada que garantice que
  // llegue a tiempo. Ámbar es literalmente el mensaje que corresponde: "ponle fecha".
  if (dias === null) return "amarillo";
  if (dias < 0) return "rojo";
  // Una subsanación nunca es verde aunque sobre plazo: hay una acción pendiente con la
  // entidad y el reloj corre en contra del proyecto entero.
  if (t.estado === "Subsanación") return "amarillo";
  return dias <= DIAS_ALERTA_TRAMITE ? "amarillo" : "verde";
}

/**
 * Semáforo de la sección: manda el peor de sus trámites. Un proyecto con nueve trámites al
 * día y uno vencido está en rojo — promediar escondería justo el que hay que mirar.
 * `null` cuando no hay trámites: no es verde, es que no se ha empezado a gestionar.
 */
export function semaforoProyecto(tramites: Pick<Tramite, "estado" | "fechaLimite">[]): Semaforo | null {
  if (tramites.length === 0) return null;
  return tramites.reduce<Semaforo>((peor, t) => {
    const actual = semaforoTramite(t);
    return ORDEN_SEMAFORO.indexOf(actual) > ORDEN_SEMAFORO.indexOf(peor) ? actual : peor;
  }, "verde");
}

/**
 * Métricas de trámites que se denormalizan en el documento del proyecto. Solo datos
 * INTEMPORALES: nada aquí cambia de valor por el mero paso del tiempo, que es lo que
 * permite guardarlas y seguir confiando en ellas mañana.
 *
 * `semaforoProyectoResumen(metricasTramites(x))` devuelve siempre lo mismo que
 * `semaforoProyecto(x)`; hay una prueba que lo fija, porque son dos caminos al mismo
 * color y que se separen es exactamente el bug que nadie notaría.
 */
export function metricasTramites(tramites: Pick<Tramite, "estado" | "fechaLimite">[]) {
  const abiertos = tramites.filter((t) => !esTramiteCerrado(t));
  const fechas = abiertos.map((t) => t.fechaLimite).filter(Boolean).sort();
  return {
    totalTramites: tramites.length,
    tramitesAbiertos: abiertos.length,
    tramitesRechazados: tramites.filter((t) => t.estado === "Rechazado").length,
    // Ámbar por naturaleza, sin mirar el calendario: una subsanación tiene una acción
    // pendiente y un trámite sin fecha no tiene nada que garantice que llegue a tiempo.
    tramitesEnAlerta: abiertos.filter((t) => t.estado === "Subsanación" || !t.fechaLimite).length,
    proximoVencimiento: fechas[0] ?? "",
  };
}

/**
 * Semáforo a partir de las métricas denormalizadas del proyecto, sin leer la subcolección.
 * Es lo que usa la lista de proyectos, donde leer los trámites de cada tarjeta serían N+1
 * viajes a Firestore para pintar un punto de color.
 *
 * Los campos son opcionales porque los proyectos anteriores a esta sección no los traen:
 * ausentes cuentan como cero y el proyecto sale sin semáforo, que es lo correcto.
 */
export function semaforoProyectoResumen(p: {
  totalTramites?: number;
  tramitesRechazados?: number;
  tramitesEnAlerta?: number;
  proximoVencimiento?: string;
}): Semaforo | null {
  if ((p.totalTramites ?? 0) === 0) return null;

  const dias = diasHasta(p.proximoVencimiento ?? "");
  if ((p.tramitesRechazados ?? 0) > 0) return "rojo";
  if (dias !== null && dias < 0) return "rojo";
  if ((p.tramitesEnAlerta ?? 0) > 0) return "amarillo";
  if (dias !== null && dias <= DIAS_ALERTA_TRAMITE) return "amarillo";
  return "verde";
}

/** Días que faltan para la fecha límite. Negativo si ya venció, `null` si no hay fecha. */
export function diasRestantes(t: Pick<Tramite, "fechaLimite">): number | null {
  return diasHasta(t.fechaLimite);
}

/** Trámites abiertos cuya fecha límite ya pasó. */
export function estaVencido(t: Pick<Tramite, "estado" | "fechaLimite">): boolean {
  if (esTramiteCerrado(t)) return false;
  const dias = diasHasta(t.fechaLimite);
  return dias !== null && dias < 0;
}

/** Reparto por estado, en el orden del catálogo. Es el dato que consume la torta. */
export function contarPorEstado(tramites: Pick<Tramite, "estado">[]): { estado: EstadoTramite; total: number }[] {
  return ESTADOS_TRAMITE.map((estado) => ({
    estado,
    total: tramites.filter((t) => t.estado === estado).length,
  }));
}

export function contarPorSemaforo(
  tramites: Pick<Tramite, "estado" | "fechaLimite">[],
): Record<Semaforo, number> {
  const conteo: Record<Semaforo, number> = { verde: 0, amarillo: 0, rojo: 0 };
  for (const t of tramites) conteo[semaforoTramite(t)] += 1;
  return conteo;
}

/**
 * Fecha límite propuesta al radicar: fecha de radicación + plazo de referencia del tipo.
 * Solo una propuesta — el acuse de radicado real puede traer otro plazo y ese manda.
 * Devuelve "" cuando el tipo no tiene plazo de referencia o la fecha no es válida.
 */
export function fechaLimiteSugerida(tipo: TipoTramite, fechaRadicacion: string): string {
  const dias = FICHAS_TRAMITE[tipo]?.diasRespuesta ?? 0;
  if (!dias || !fechaRadicacion) return "";
  const ms = Date.parse(`${fechaRadicacion}T00:00:00Z`);
  if (Number.isNaN(ms)) return "";
  return new Date(ms + dias * 86_400_000).toISOString().slice(0, 10);
}

/** Clases del badge de estado. Mismo lenguaje visual que `ESTILO_ESTADO` de tareas. */
export const ESTILO_ESTADO_TRAMITE: Record<EstadoTramite, string> = {
  "Sin iniciar": "bg-muted text-muted-foreground",
  "En preparación": "bg-estado-progreso/15 text-estado-progreso",
  Radicado: "bg-estado-revision/15 text-estado-revision",
  Subsanación: "bg-prioridad-media/15 text-prioridad-media",
  Aprobado: "bg-estado-completada/15 text-estado-completada",
  Rechazado: "bg-estado-bloqueada/15 text-estado-bloqueada",
};

/**
 * Color de cada porción de la torta. Van como variables CSS y no como hex porque los
 * colores semánticos están definidos en los dos temas: la torta se reajusta sola al
 * cambiar a modo oscuro, igual que hace el timeline del proyecto.
 */
export const COLOR_ESTADO_TRAMITE: Record<EstadoTramite, string> = {
  "Sin iniciar": "var(--color-muted-foreground)",
  "En preparación": "var(--color-estado-progreso)",
  Radicado: "var(--color-estado-revision)",
  Subsanación: "var(--color-prioridad-media)",
  Aprobado: "var(--color-estado-completada)",
  Rechazado: "var(--color-estado-bloqueada)",
};

export const COLOR_SEMAFORO: Record<Semaforo, string> = {
  verde: "bg-estado-completada",
  amarillo: "bg-prioridad-media",
  rojo: "bg-estado-bloqueada",
};

export const TEXTO_SEMAFORO: Record<Semaforo, string> = {
  verde: "text-estado-completada",
  amarillo: "text-prioridad-media",
  rojo: "text-estado-bloqueada",
};

export const ETIQUETA_SEMAFORO: Record<Semaforo, string> = {
  verde: "Al día",
  amarillo: "Requiere atención",
  rojo: "Crítico",
};

/** Frase que explica POR QUÉ está en ese color. Un color sin motivo no es accionable. */
export function motivoSemaforo(tramites: Pick<Tramite, "estado" | "fechaLimite">[]): string {
  const conteo = contarPorSemaforo(tramites);
  if (tramites.length === 0) return "Sin trámites registrados en este proyecto.";
  if (conteo.rojo > 0) {
    return `${conteo.rojo} trámite(s) vencido(s) o rechazado(s). Es el cuello de botella del proyecto.`;
  }
  if (conteo.amarillo > 0) {
    return `${conteo.amarillo} trámite(s) por vencer (≤${DIAS_ALERTA_TRAMITE} días), en subsanación o sin fecha comprometida.`;
  }
  return "Ningún trámite vencido ni próximo a vencer.";
}
