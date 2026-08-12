import { ZONA, fechaBogota } from "@/lib/tiempo";

export { fechaBogota };

// `fechaLocalHoy` usaba la zona del runtime, así que devolvía el día UTC en el servidor.
// Se mantiene el nombre por los llamadores existentes, pero ahora siempre es día de Bogotá
// tanto en el navegador como en Vercel.
export function fechaLocalHoy(): string {
  return fechaBogota();
}

export function formatearDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatearHora(ms: number): string {
  // Sin `timeZone` explícito, `toLocaleTimeString` usa la zona del runtime que ejecuta el
  // código — en el cliente es la del navegador (Colombia, correcto), pero en Server
  // Components/API routes de Vercel es UTC, así que las horas salían 5h adelantadas.
  return new Date(ms).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: ZONA });
}

export function esJornadaColgada(entrada: number): boolean {
  return Date.now() - entrada > 16 * 60 * 60 * 1000;
}
