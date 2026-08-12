// Toda la app trabaja en hora de Colombia. El código corre en dos runtimes con zonas
// distintas —el navegador (Colombia) y Vercel (UTC)— así que ninguna conversión puede
// depender de la zona del runtime: `toLocale*` sin `timeZone` y `setHours(0,0,0,0)`
// dan resultados distintos según dónde se ejecuten.
//
// Dos tipos de dato, dos tratamientos:
//   · timestamp (ms epoch)  → formatear con timeZone "America/Bogota".
//   · fecha "YYYY-MM-DD"    → YA es un día calendario de Bogotá; se ancla a mediodía UTC
//                             para formatearla, nunca se reconvierte a Bogotá (eso la
//                             correría al día anterior).
export const ZONA = "America/Bogota";

/** Bogotá es UTC-5 fijo, sin horario de verano. */
const OFFSET_MS = 5 * 60 * 60 * 1000;

/** Día calendario de Bogotá (YYYY-MM-DD) para un instante dado. */
export function fechaBogota(ms: number = Date.now()): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(ms));
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)!.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

/** Medianoche UTC de una fecha YYYY-MM-DD. Solo para restar días entre fechas. */
function anclaUTC(fecha: string): number {
  return Date.parse(`${fecha}T00:00:00Z`);
}

/** Instante en que empieza y acaba, en tiempo real, el día de Bogotá `fecha`. */
export function ventanaDelDia(fecha: string): { inicioMs: number; finMs: number } {
  const inicioMs = anclaUTC(fecha) + OFFSET_MS;
  return { inicioMs, finMs: inicioMs + 86_400_000 - 1 };
}

/** Días calendario completos desde hoy (Bogotá) hasta `fecha`. Negativo si ya pasó. */
export function diasHasta(fecha: string): number | null {
  if (!fecha) return null;
  const objetivo = anclaUTC(fecha);
  if (Number.isNaN(objetivo)) return null;
  return Math.round((objetivo - anclaUTC(fechaBogota())) / 86_400_000);
}

/** "11 ago 2026" a partir de una fecha YYYY-MM-DD. */
export function fechaLegible(fecha: string): string {
  if (!fecha) return "—";
  const ms = anclaUTC(fecha);
  if (Number.isNaN(ms)) return "—";
  return new Date(ms).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "lunes, 11 de agosto de 2026" a partir de una fecha YYYY-MM-DD. */
export function fechaLarga(fecha: string): string {
  const ms = anclaUTC(fecha);
  if (Number.isNaN(ms)) return fecha;
  return new Date(ms).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "11 ago, 14:30" a partir de un timestamp real. */
export function fechaHoraLegible(ms: number): string {
  return new Date(ms).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZONA,
  });
}

/** "11 ago 2026" a partir de un timestamp real. */
export function fechaDeTimestamp(ms: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: ZONA,
  });
}

export function haceTiempo(ms: number): string {
  const diffMin = Math.floor((Date.now() - ms) / 60000);
  if (diffMin < 1) return "justo ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} d`;
  const meses = Math.floor(d / 30);
  return `hace ${meses} mes${meses !== 1 ? "es" : ""}`;
}
