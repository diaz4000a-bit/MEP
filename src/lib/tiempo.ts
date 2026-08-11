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
