import { computeAvance } from "@/lib/tareas";
import { fechaLarga, ventanaDelDia } from "@/lib/tiempo";
import { diasRestantes, semaforoTramite, type Semaforo } from "@/lib/tramites";
import { sanearHistorial } from "@/lib/validar";
import type { EstadoTarea, Proyecto, Tarea, Tramite } from "@/types";

/**
 * Núcleo del informe diario, sin HTML ni acceso a Firestore.
 *
 * Vive aquí y no dentro de `/api/informe/[id]` porque desde que el informe también sale por
 * WhatsApp hay DOS consumidores del mismo cálculo. Duplicarlo garantizaba que, al primer
 * ajuste del criterio de "actividad del día", el PDF y el mensaje reportaran cifras
 * distintas del mismo día — y nadie sabría cuál creer.
 */

export interface FilaActividad {
  tarea: string;
  zona: string;
  etapa: string;
  inicio: number;
  fin: number;
  delta: number;
  estado: EstadoTarea;
  hora: number;
  registros: number;
}

// Reúne, por responsable, las tareas con actividad (avance/estado) en una fecha dada.
// Para cada tarea con varios registros ese día se reporta el movimiento neto del día.
export function recolectarActividadDelDia(tareas: Tarea[], fecha: string): Record<string, FilaActividad[]> {
  // La ventana es el día de Bogotá, no el del runtime: en Vercel (UTC) recortaba de las
  // 19:00 del día anterior a las 18:59 del día pedido, así que el turno de tarde caía en
  // el informe del día siguiente mientras las jornadas (filtradas por el string `fecha`)
  // sí usaban el día real.
  const { inicioMs, finMs } = ventanaDelDia(fecha);
  const mapa: Record<string, FilaActividad[]> = {};

  for (const t of tareas) {
    // `sanearHistorial` fuerza que `f`/`p` sean números y `e` un estado de la lista blanca.
    // El HTML interpola `p` y `f` SIN escapar (nadie escapa un número); si el documento
    // trae strings ahí —posible vía import JSON— acaban dentro del HTML tal cual. Sanear al
    // leer hace verdadero el tipo en vez de confiar en el `as Tarea` del snapshot.
    const h = sanearHistorial(t.historial);
    const dia: { de: number; a: number; e: EstadoTarea; f: number }[] = [];
    // i === 0 es la foto inicial de creación/importación de la tarea, no trabajo real —
    // si se cuenta, toda tarea creada/importada hoy aparece como "trabajada" aunque nadie
    // la haya tocado (ver bug real: proyectos importados con 60+ tareas inundando el informe).
    h.forEach((x, i) => {
      if (i > 0 && x.f >= inicioMs && x.f <= finMs) dia.push({ de: h[i - 1].p, a: x.p, e: x.e, f: x.f });
    });
    if (dia.length === 0) continue;

    const inicio = dia[0].de;
    const ultimo = dia[dia.length - 1];
    const resp = t.responsable || "Sin asignar";
    (mapa[resp] ??= []).push({
      tarea: t.nombre,
      zona: t.zona || "",
      etapa: t.etapa || "",
      inicio,
      fin: ultimo.a,
      delta: ultimo.a - inicio,
      estado: ultimo.e,
      hora: ultimo.f,
      registros: dia.length,
    });
  }

  for (const filas of Object.values(mapa)) filas.sort((a, b) => a.hora - b.hora);
  return mapa;
}

/* ------------------------------------------------------------------ *
 * Resumen para mensajería (WhatsApp)
 * ------------------------------------------------------------------ */

export interface LineaTrabajador {
  nombre: string;
  puntos: number;
  tareas: number;
}

export interface LineaTramite {
  nombre: string;
  color: Semaforo;
  nota: string;
}

export interface ResumenInforme {
  proyecto: string;
  cliente: string;
  fecha: string;
  avanceProyecto: number;
  /** Suma de los avances positivos del día, en puntos porcentuales de tarea. */
  puntosDelDia: number;
  tareasConAvance: number;
  /** Ordenados de más a menos puntos: quien más movió va primero. */
  trabajadores: LineaTrabajador[];
  /** Responsables con tareas asignadas que no registraron nada ese día. */
  sinActividad: string[];
  /** Solo los que piden acción (rojo/ámbar). Un trámite al día no es noticia. */
  tramitesCriticos: LineaTramite[];
}

/** Un trámite se considera noticia si su semáforo no está en verde. */
const ORDEN_ALERTA: Semaforo[] = ["rojo", "amarillo", "verde"];

function notaPlazo(t: Tramite): string {
  if (t.estado === "Rechazado") return "RECHAZADO — hay que volver a radicar";
  const d = diasRestantes(t);
  if (d === null) return "sin fecha comprometida";
  if (d < 0) return `vencido hace ${Math.abs(d)} d`;
  if (d === 0) return "vence HOY";
  return `vence en ${d} d`;
}

/**
 * Convierte los datos crudos del proyecto en las cifras que se comunican.
 *
 * Deliberadamente NO recibe jornadas: la hora de entrada/salida de cada trabajador es dato
 * reservado a gestores (misma regla que /jornadas y que el bloque de jornada del PDF), y un
 * mensaje de WhatsApp no puede comprobar quién termina leyéndolo en el teléfono.
 */
export function resumirInforme(
  proyecto: Pick<Proyecto, "nombre" | "cliente">,
  tareas: Tarea[],
  tramites: Tramite[],
  fecha: string,
): ResumenInforme {
  const actividad = recolectarActividadDelDia(tareas, fecha);

  const trabajadores = Object.entries(actividad)
    .map(([nombre, filas]) => ({
      nombre,
      // Solo los deltas positivos: una corrección a la baja no "resta trabajo hecho",
      // y sumarla haría que un día de reajustes apareciera como un día sin avance.
      puntos: filas.reduce((s, f) => s + Math.max(0, f.delta), 0),
      tareas: filas.length,
    }))
    .sort((a, b) => b.puntos - a.puntos || a.nombre.localeCompare(b.nombre));

  const sinActividad = [...new Set(tareas.map((t) => t.responsable).filter(Boolean))]
    .filter((r) => !actividad[r])
    .sort();

  // A diferencia del bloque del PDF —que solo lista ABIERTOS— aquí entran también los
  // rechazados. `esTramiteCerrado` los da por cerrados porque la entidad ya respondió, pero
  // un rechazo es justo el aviso que hay que empujar al teléfono: sin él el mensaje diría
  // "crítico" sin listar una sola causa.
  const tramitesCriticos = tramites
    .filter((t) => t.estado !== "Aprobado")
    .map((t) => ({ tramite: t, color: semaforoTramite(t) }))
    .filter(({ color }) => color !== "verde")
    .sort((a, b) => {
      const porColor = ORDEN_ALERTA.indexOf(a.color) - ORDEN_ALERTA.indexOf(b.color);
      if (porColor !== 0) return porColor;
      return (a.tramite.fechaLimite || "9999-12-31").localeCompare(b.tramite.fechaLimite || "9999-12-31");
    })
    .map(({ tramite, color }) => ({ nombre: tramite.nombre, color, nota: notaPlazo(tramite) }));

  return {
    proyecto: proyecto.nombre,
    cliente: proyecto.cliente || "",
    fecha,
    avanceProyecto: computeAvance(tareas),
    puntosDelDia: trabajadores.reduce((s, t) => s + t.puntos, 0),
    tareasConAvance: trabajadores.reduce((s, t) => s + t.tareas, 0),
    trabajadores,
    sinActividad,
    tramitesCriticos,
  };
}

/**
 * ¿Merece este resumen gastar una notificación?
 *
 * Un mensaje diario que casi siempre dice "no pasó nada" se vuelve invisible en dos semanas,
 * y entonces tampoco se lee el día que sí importa. Se calla únicamente cuando no hay NADA que
 * reportar: ni avance ni trámite en alerta. Un domingo sin trabajo y sin trámites vencidos no
 * genera mensaje; un domingo sin trabajo con un RETIE vencido, sí.
 */
export function mereceEnvio(r: ResumenInforme): boolean {
  return r.puntosDelDia > 0 || r.tareasConAvance > 0 || r.tramitesCriticos.length > 0;
}

/* ------------------------------------------------------------------ *
 * Formato del mensaje
 * ------------------------------------------------------------------ */

/** WhatsApp corta un mensaje a los 4096 caracteres, y las pasarelas suelen bajarlo a 1600.
 * Se recorta muy por debajo: un informe que hay que desplegar en el teléfono no se lee. */
export const TOPE_MENSAJE = 1500;
const TOPE_TRABAJADORES = 8;
const TOPE_TRAMITES = 6;
const TOPE_NOMBRE = 60;

const EMOJI_SEMAFORO: Record<Semaforo, string> = { rojo: "🔴", amarillo: "🟡", verde: "🟢" };

/**
 * Aplana un nombre que viene de Firestore a UNA línea de texto plano.
 *
 * El equivalente de `esc()` del informe HTML. Aquí el riesgo no es ejecutar código sino
 * falsificar estructura: una tarea llamada "Tablero\n\n*Trámites críticos*" inventaría una
 * sección entera del mensaje, y `*` / `_` alrededor del nombre lo pondrían en negrita o
 * cursiva. Se colapsa todo espacio en blanco (saltos incluidos) y se neutralizan los
 * marcadores de WhatsApp en los extremos.
 */
function limpiar(texto: string): string {
  const plano = String(texto ?? "")
    .replace(/[\p{Cc}\p{Cf}]/gu, " ")
    .replace(/\s+/g, " ")
    .replace(/^[*_~`]+|[*_~`]+$/g, "")
    .trim();
  return plano.length > TOPE_NOMBRE ? plano.slice(0, TOPE_NOMBRE - 1) + "…" : plano;
}

function bloqueTramites(criticos: LineaTramite[]): string[] {
  if (criticos.length === 0) return [];
  const visibles = criticos.slice(0, TOPE_TRAMITES);
  const lineas = visibles.map((t) => `${EMOJI_SEMAFORO[t.color]} ${limpiar(t.nombre)} — ${t.nota}`);
  if (criticos.length > visibles.length) lineas.push(`…y ${criticos.length - visibles.length} trámite(s) más`);
  return ["", "*Trámites que piden acción*", ...lineas];
}

function bloqueTrabajadores(trabajadores: LineaTrabajador[]): string[] {
  if (trabajadores.length === 0) return ["", "_Sin avance de tareas registrado en esta fecha._"];
  const visibles = trabajadores.slice(0, TOPE_TRABAJADORES);
  const lineas = visibles.map((t) => `• ${limpiar(t.nombre)} — +${t.puntos} pts (${t.tareas} tarea${t.tareas === 1 ? "" : "s"})`);
  if (trabajadores.length > visibles.length) lineas.push(`…y ${trabajadores.length - visibles.length} más`);
  return ["", "*Avance por trabajador*", ...lineas];
}

/**
 * Texto final del mensaje. WhatsApp interpreta `*negrita*` y `_cursiva_`; no admite HTML.
 * Nunca supera `TOPE_MENSAJE`: si aun recortando listas se pasa (nombres largos), se corta
 * en seco antes que dejar que el mensaje salga cortado por donde caiga.
 */
export function formatearResumenWhatsApp(r: ResumenInforme): string {
  const encabezado = `📋 *Informe diario · ${limpiar(r.proyecto)}*`;
  const subtitulo = r.cliente ? `${limpiar(r.cliente)} · ${fechaLarga(r.fecha)}` : fechaLarga(r.fecha);

  const lineas = [
    encabezado,
    subtitulo,
    "",
    `Avance del proyecto: *${r.avanceProyecto}%*`,
    `Hoy: +${r.puntosDelDia} pts · ${r.tareasConAvance} tarea(s) · ${r.trabajadores.length} trabajador(es)`,
    ...bloqueTramites(r.tramitesCriticos),
    ...bloqueTrabajadores(r.trabajadores),
  ];

  if (r.sinActividad.length > 0) {
    const nombres = r.sinActividad.slice(0, TOPE_TRABAJADORES).map(limpiar).join(", ");
    const resto = r.sinActividad.length > TOPE_TRABAJADORES ? ` y ${r.sinActividad.length - TOPE_TRABAJADORES} más` : "";
    lineas.push("", `_Sin actividad hoy: ${nombres}${resto}._`);
  }

  const texto = lineas.join("\n");
  return texto.length > TOPE_MENSAJE ? texto.slice(0, TOPE_MENSAJE - 1) + "…" : texto;
}
