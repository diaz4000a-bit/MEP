// Rejilla y eventos del calendario de entregas.
//
// Misma regla de oro que `tiempo.ts`: una fecha 'YYYY-MM-DD' YA es un día calendario de
// Bogotá, así que toda la aritmética se hace anclada a medianoche UTC y nunca con
// `new Date()` local ni `setDate`/`getDay` locales — en Vercel (UTC) y en el navegador
// (UTC-5) esos darían rejillas distintas cerca de medianoche.
//
// Por lo mismo NO se usa `date-fns` aquí aunque esté instalado: sus helpers de calendario
// (startOfWeek, addMonths, …) trabajan en la zona local del runtime.
import { fechaLarga } from "@/lib/tiempo";
import type { Proyecto, Tarea } from "@/types";

const DIA_MS = 86_400_000;

export type VistaCalendario = "dia" | "semana" | "mes" | "anio";

export const VISTAS: VistaCalendario[] = ["dia", "semana", "mes", "anio"];

export const ETIQUETA_VISTA: Record<VistaCalendario, string> = {
  dia: "Día",
  semana: "Semana",
  mes: "Mes",
  anio: "Año",
};

export function esVista(valor: string): valor is VistaCalendario {
  return (VISTAS as string[]).includes(valor);
}

/** Cabecera de la rejilla mensual. La semana arranca en lunes. */
export const DIAS_SEMANA = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
export const DIAS_SEMANA_INICIAL = ["L", "M", "M", "J", "V", "S", "D"];

// ─────────────────────────── aritmética de fechas ───────────────────────────

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * true solo si es 'YYYY-MM-DD' y el día existe de verdad.
 *
 * `Date.parse` NO basta: el parser ISO acepta cualquier día 01-31 y desborda al mes
 * siguiente (29-feb-2026 → 1-mar-2026) en vez de devolver NaN. Sin la comprobación de
 * ida y vuelta, una fecha inexistente guardada en Firestore se pintaría en la celda
 * equivocada del calendario.
 */
export function esFecha(fecha: string): boolean {
  if (!RE_FECHA.test(fecha)) return false;
  const ms = Date.parse(`${fecha}T00:00:00Z`);
  return !Number.isNaN(ms) && isoDeMs(ms) === fecha;
}

function anclaUTC(fecha: string): number {
  return Date.parse(`${fecha}T00:00:00Z`);
}

function isoDeMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function partes(fecha: string): { anio: number; mes: number; dia: number } {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return { anio, mes, dia };
}

function dosDigitos(n: number): string {
  return String(n).padStart(2, "0");
}

/** Días que tiene el mes (mes 1-12). */
export function diasEnMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

export function sumarDias(fecha: string, n: number): string {
  return isoDeMs(anclaUTC(fecha) + n * DIA_MS);
}

/** Suma meses recortando el día al último del mes destino (31 ene + 1 mes → 28/29 feb). */
export function sumarMeses(fecha: string, n: number): string {
  const { anio, mes, dia } = partes(fecha);
  const indice = anio * 12 + (mes - 1) + n;
  const anioDestino = Math.floor(indice / 12);
  const mesDestino = (indice % 12) + 1;
  const diaDestino = Math.min(dia, diasEnMes(anioDestino, mesDestino));
  return `${anioDestino}-${dosDigitos(mesDestino)}-${dosDigitos(diaDestino)}`;
}

/** Lunes de la semana a la que pertenece `fecha`. */
export function inicioSemana(fecha: string): string {
  const diaSemana = new Date(anclaUTC(fecha)).getUTCDay(); // 0 = domingo
  return sumarDias(fecha, -((diaSemana + 6) % 7));
}

export function finSemana(fecha: string): string {
  return sumarDias(inicioSemana(fecha), 6);
}

export function inicioMes(fecha: string): string {
  return `${fecha.slice(0, 7)}-01`;
}

export function finMes(fecha: string): string {
  const { anio, mes } = partes(fecha);
  return `${fecha.slice(0, 7)}-${dosDigitos(diasEnMes(anio, mes))}`;
}

export function inicioAnio(fecha: string): string {
  return `${fecha.slice(0, 4)}-01-01`;
}

export function finAnio(fecha: string): string {
  return `${fecha.slice(0, 4)}-12-31`;
}

/** Ventana de días que cubre la vista (sin los días de relleno de la rejilla mensual). */
export function rangoVista(vista: VistaCalendario, ancla: string): { desde: string; hasta: string } {
  switch (vista) {
    case "dia":
      return { desde: ancla, hasta: ancla };
    case "semana":
      return { desde: inicioSemana(ancla), hasta: finSemana(ancla) };
    case "mes":
      return { desde: inicioMes(ancla), hasta: finMes(ancla) };
    case "anio":
      return { desde: inicioAnio(ancla), hasta: finAnio(ancla) };
  }
}

/**
 * Mueve el ancla una unidad de la vista actual.
 *
 * Mes y año se anclan al día 1: si se moviera el día exacto, "siguiente + anterior" desde
 * un 31 no volvería al 31 (el recorte de `sumarMeses` lo dejaría en 30). El día concreto
 * no se pierde para el usuario: al pulsar una celda se salta a la vista de día con esa fecha.
 */
export function desplazar(vista: VistaCalendario, ancla: string, delta: number): string {
  switch (vista) {
    case "dia":
      return sumarDias(ancla, delta);
    case "semana":
      return sumarDias(ancla, delta * 7);
    case "mes":
      return sumarMeses(inicioMes(ancla), delta);
    case "anio":
      return `${partes(ancla).anio + delta}-01-01`;
  }
}

function formatearUTC(fecha: string, opciones: Intl.DateTimeFormatOptions): string {
  return new Date(anclaUTC(fecha)).toLocaleDateString("es-CO", { ...opciones, timeZone: "UTC" });
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "Agosto 2026", "18 – 24 ago 2026", … según la vista. */
export function tituloVista(vista: VistaCalendario, ancla: string): string {
  switch (vista) {
    case "dia":
      return capitalizar(fechaLarga(ancla));
    case "semana": {
      const desde = inicioSemana(ancla);
      const hasta = finSemana(ancla);
      const izquierda =
        desde.slice(0, 7) === hasta.slice(0, 7)
          ? formatearUTC(desde, { day: "numeric" })
          : formatearUTC(desde, { day: "numeric", month: "short" });
      const derecha = formatearUTC(hasta, { day: "numeric", month: "short", year: "numeric" });
      return `${izquierda} – ${derecha}`;
    }
    case "mes":
      return capitalizar(formatearUTC(ancla, { month: "long", year: "numeric" }));
    case "anio":
      return ancla.slice(0, 4);
  }
}

export function nombreMes(fecha: string, formato: "long" | "short" = "long"): string {
  // es-CO devuelve "ene." en formato corto: el punto sobra en la cabecera de un mini-mes.
  return capitalizar(formatearUTC(fecha, { month: formato }).replace(/\.$/, ""));
}

export function diaDelMes(fecha: string): number {
  return partes(fecha).dia;
}

export function esFinDeSemana(fecha: string): boolean {
  const d = new Date(anclaUTC(fecha)).getUTCDay();
  return d === 0 || d === 6;
}

export function mismoMesQue(fecha: string, referencia: string): boolean {
  return fecha.slice(0, 7) === referencia.slice(0, 7);
}

/** Los 7 días (lunes→domingo) de la semana de `fecha`. */
export function diasDeSemana(fecha: string): string[] {
  const lunes = inicioSemana(fecha);
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

/**
 * Rejilla del mes: SIEMPRE 6 semanas × 7 días, con relleno de los meses vecinos.
 * Fijar 6 filas evita que la rejilla cambie de alto al navegar entre meses.
 */
export function matrizMes(fecha: string): string[][] {
  const primeraCasilla = inicioSemana(inicioMes(fecha));
  return Array.from({ length: 6 }, (_, semana) =>
    Array.from({ length: 7 }, (_, dia) => sumarDias(primeraCasilla, semana * 7 + dia)),
  );
}

/** Los 12 meses del año de `fecha`, cada uno con su rejilla. */
export function mesesDelAnio(fecha: string): { mes: string; nombre: string; semanas: string[][] }[] {
  const anio = partes(fecha).anio;
  return Array.from({ length: 12 }, (_, i) => {
    const mes = `${anio}-${dosDigitos(i + 1)}-01`;
    return { mes, nombre: nombreMes(mes, "short"), semanas: matrizMes(mes) };
  });
}

// ─────────────────────────────── eventos ───────────────────────────────

export type TipoEvento = "entrega" | "inicio" | "tarea";

export const TIPOS_EVENTO: TipoEvento[] = ["entrega", "inicio", "tarea"];

export const ETIQUETA_TIPO: Record<TipoEvento, string> = {
  entrega: "Entrega de proyecto",
  inicio: "Inicio de proyecto",
  tarea: "Fecha límite de tarea",
};

export const ETIQUETA_TIPO_CORTA: Record<TipoEvento, string> = {
  entrega: "Entregas",
  inicio: "Inicios",
  tarea: "Tareas",
};

export interface EventoCalendario {
  id: string;
  fecha: string;
  tipo: TipoEvento;
  titulo: string;
  proyectoId: string;
  proyectoNombre: string;
  estado: string;
  completado: boolean;
  responsable: string;
  href: string;
}

const ORDEN_TIPO: Record<TipoEvento, number> = { entrega: 0, inicio: 1, tarea: 2 };

function ordenar(eventos: EventoCalendario[]): EventoCalendario[] {
  return eventos.sort(
    (a, b) =>
      a.fecha.localeCompare(b.fecha) ||
      ORDEN_TIPO[a.tipo] - ORDEN_TIPO[b.tipo] ||
      a.proyectoNombre.localeCompare(b.proyectoNombre) ||
      a.titulo.localeCompare(b.titulo),
  );
}

/**
 * Aplana proyectos y tareas en eventos de un día.
 *
 * Las fechas se validan una a una: la v1 guardaba cadenas libres y hay documentos con
 * `fechaEntrega: ""`. Un evento con fecha inválida no rompería la rejilla (nunca casaría
 * con una celda), pero sí inflaría los contadores del encabezado.
 */
export function construirEventos(proyectos: Proyecto[], tareas: Tarea[]): EventoCalendario[] {
  const eventos: EventoCalendario[] = [];
  const nombrePorProyecto = new Map(proyectos.map((p) => [p.id, p.nombre]));

  for (const p of proyectos) {
    const base = {
      proyectoId: p.id,
      proyectoNombre: p.nombre,
      estado: p.estado,
      responsable: p.cliente ?? "",
      href: `/proyectos/${p.id}`,
    };
    if (esFecha(p.fechaEntrega)) {
      eventos.push({
        ...base,
        id: `entrega:${p.id}`,
        fecha: p.fechaEntrega,
        tipo: "entrega",
        titulo: p.nombre,
        completado: p.estado === "Entregado",
      });
    }
    if (esFecha(p.fechaInicio)) {
      eventos.push({
        ...base,
        id: `inicio:${p.id}`,
        fecha: p.fechaInicio,
        tipo: "inicio",
        titulo: p.nombre,
        completado: false,
      });
    }
  }

  for (const t of tareas) {
    if (!esFecha(t.fechaLimite)) continue;
    eventos.push({
      id: `tarea:${t.proyectoId}:${t.id}`,
      fecha: t.fechaLimite,
      tipo: "tarea",
      titulo: t.nombre,
      proyectoId: t.proyectoId,
      proyectoNombre: nombrePorProyecto.get(t.proyectoId) ?? "Proyecto",
      estado: t.estado,
      completado: t.estado === "Completada",
      responsable: t.responsable ?? "",
      href: `/proyectos/${t.proyectoId}/tarea/${t.id}`,
    });
  }

  return ordenar(eventos);
}

export function filtrarEventos(
  eventos: EventoCalendario[],
  filtros: { proyectoId?: string; tipos?: TipoEvento[] },
): EventoCalendario[] {
  const tipos = filtros.tipos;
  return eventos.filter(
    (e) => (!filtros.proyectoId || e.proyectoId === filtros.proyectoId) && (!tipos || tipos.includes(e.tipo)),
  );
}

export function agruparPorFecha(eventos: EventoCalendario[]): Map<string, EventoCalendario[]> {
  const mapa = new Map<string, EventoCalendario[]>();
  for (const e of eventos) {
    const lista = mapa.get(e.fecha);
    if (lista) lista.push(e);
    else mapa.set(e.fecha, [e]);
  }
  return mapa;
}

export function eventosEnRango(eventos: EventoCalendario[], desde: string, hasta: string): EventoCalendario[] {
  return eventos.filter((e) => e.fecha >= desde && e.fecha <= hasta);
}

/**
 * Vencido = fecha pasada y sin completar. `hoy` se pasa siempre para no leer el reloj aquí.
 *
 * El inicio de proyecto queda fuera: es una marca en el tiempo, no un compromiso que se
 * pueda incumplir, así que un inicio pasado no debe pintarse en rojo (ni en verde de
 * "completado", que sería igual de falso).
 */
export function estaVencido(evento: EventoCalendario, hoy: string): boolean {
  return evento.tipo !== "inicio" && !evento.completado && evento.fecha < hoy;
}
