// Fecha local (YYYY-MM-DD) del navegador — nunca UTC, para que la jornada quede
// registrada en el día calendario real del usuario, igual que `todayStr()` en la v1.
export function fechaLocalHoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatearDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatearHora(ms: number): string {
  return new Date(ms).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function esJornadaColgada(entrada: number): boolean {
  return Date.now() - entrada > 16 * 60 * 60 * 1000;
}
