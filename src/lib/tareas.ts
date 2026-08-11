import type { EstadoProyecto, EstadoTarea, Prioridad, Tarea } from "@/types";

export function computeAvance(tareas: Pick<Tarea, "porcentaje">[]): number {
  if (tareas.length === 0) return 0;
  return Math.round(tareas.reduce((s, t) => s + (Number(t.porcentaje) || 0), 0) / tareas.length);
}

// Días hasta `fecha` (YYYY-MM-DD) desde hoy, en días calendario completos. Negativo si ya pasó.
export function diasHasta(fecha: string): number | null {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha + "T00:00:00");
  return Math.round((f.getTime() - hoy.getTime()) / 86_400_000);
}

export function estaVencida(t: Pick<Tarea, "fechaLimite" | "estado">): boolean {
  if (!t.fechaLimite || t.estado === "Completada") return false;
  const d = diasHasta(t.fechaLimite);
  return d !== null && d < 0;
}

export function estaProxima(t: Pick<Tarea, "fechaLimite" | "estado">): boolean {
  if (!t.fechaLimite || t.estado === "Completada") return false;
  const d = diasHasta(t.fechaLimite);
  return d !== null && d >= 0 && d <= 3;
}

// Rango de color del progreso: 0-30 rojo, 31-60 ámbar, 61-90 azul, 91-100 verde (igual a la v1).
export function colorAvance(pct: number): string {
  if (pct <= 30) return "bg-estado-bloqueada";
  if (pct <= 60) return "bg-prioridad-media";
  if (pct <= 90) return "bg-primary";
  return "bg-estado-completada";
}

export const ESTILO_ESTADO: Record<EstadoTarea, string> = {
  "Sin iniciar": "bg-muted text-muted-foreground",
  "En progreso": "bg-primary/15 text-primary",
  "En revisión": "bg-estado-revision/15 text-estado-revision",
  Completada: "bg-estado-completada/15 text-estado-completada",
  Bloqueada: "bg-estado-bloqueada/15 text-estado-bloqueada",
};

export const ESTILO_PRIORIDAD: Record<Prioridad, string> = {
  Alta: "bg-estado-bloqueada/15 text-estado-bloqueada",
  Media: "bg-prioridad-media/15 text-prioridad-media",
  Baja: "bg-muted text-muted-foreground",
};

export const ESTILO_ESTADO_PROYECTO: Record<EstadoProyecto, string> = {
  "Sin iniciar": "bg-muted text-muted-foreground",
  "En progreso": "bg-primary/15 text-primary",
  Revisión: "bg-estado-revision/15 text-estado-revision",
  Entregado: "bg-estado-completada/15 text-estado-completada",
};

export function fechaLegible(fecha: string): string {
  if (!fecha) return "—";
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fechaHoraLegible(ms: number): string {
  return new Date(ms).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
