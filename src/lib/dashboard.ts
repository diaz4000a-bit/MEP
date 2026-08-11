import { GRUPOS } from "@/content/grupos";
import { estaProxima, estaVencida } from "@/lib/tareas";
import type { GrupoId, Jornada, Tarea } from "@/types";

export interface EventoActividad {
  ts: number;
  texto: string;
  proyectoNombre: string;
}

/** Combina historial[] de tareas + entradas/salidas de jornada en una sola línea de tiempo. */
export function actividadReciente(
  tareas: Tarea[],
  proyectosPorId: Map<string, string>,
  jornadas: Jornada[],
  limite = 20,
): EventoActividad[] {
  const eventos: EventoActividad[] = [];

  for (const t of tareas) {
    const proyectoNombre = proyectosPorId.get(t.proyectoId) ?? "Proyecto eliminado";
    for (const h of t.historial ?? []) {
      eventos.push({ ts: h.f, texto: `${t.nombre} → ${h.e} (${h.p}%)`, proyectoNombre });
    }
  }

  for (const j of jornadas) {
    eventos.push({ ts: j.entrada, texto: `${j.usuarioNombre} inició jornada`, proyectoNombre: j.proyectoNombre });
    if (j.salida) {
      eventos.push({ ts: j.salida, texto: `${j.usuarioNombre} cerró jornada`, proyectoNombre: j.proyectoNombre });
    }
  }

  return eventos.sort((a, b) => b.ts - a.ts).slice(0, limite);
}

export interface ProgresoGrupo {
  id: GrupoId;
  nombre: string;
  total: number;
  avance: number;
}

export function progresoPorGrupo(tareas: Tarea[]): ProgresoGrupo[] {
  return GRUPOS.map((g) => {
    const ts = tareas.filter((t) => t.grupo === g.id);
    const avance = ts.length ? Math.round(ts.reduce((s, t) => s + (Number(t.porcentaje) || 0), 0) / ts.length) : 0;
    return { id: g.id, nombre: g.nombre, total: ts.length, avance };
  });
}

export interface AvanceZona {
  proyectoId: string;
  proyectoNombre: string;
  zona: string;
  total: number;
  avance: number;
}

/** Agrupa por proyecto+zona (la misma zona en dos proyectos distintos no es la misma zona). */
export function avancePorZona(tareas: Tarea[], proyectosPorId: Map<string, string>): AvanceZona[] {
  const grupos = new Map<string, { proyectoId: string; zona: string; tareas: Tarea[] }>();
  for (const t of tareas) {
    const zona = t.zona || "Sin zona";
    const clave = `${t.proyectoId}__${zona}`;
    if (!grupos.has(clave)) grupos.set(clave, { proyectoId: t.proyectoId, zona, tareas: [] });
    grupos.get(clave)!.tareas.push(t);
  }
  return [...grupos.values()]
    .map((g) => ({
      proyectoId: g.proyectoId,
      proyectoNombre: proyectosPorId.get(g.proyectoId) ?? "Proyecto eliminado",
      zona: g.zona,
      total: g.tareas.length,
      avance: Math.round(g.tareas.reduce((s, t) => s + (Number(t.porcentaje) || 0), 0) / g.tareas.length),
    }))
    .sort((a, b) => a.avance - b.avance);
}

export function tareasUrgentes(tareas: Tarea[], proyectosPorId: Map<string, string>) {
  const conProyecto = (t: Tarea) => ({ tarea: t, proyectoNombre: proyectosPorId.get(t.proyectoId) ?? "Proyecto eliminado" });
  return {
    vencidas: tareas.filter(estaVencida).map(conProyecto),
    proximas: tareas.filter(estaProxima).map(conProyecto),
  };
}

export interface HorasProyecto {
  proyectoId: string;
  nombre: string;
  minutos: number;
}

export function horasPorProyecto(jornadas: Jornada[]): HorasProyecto[] {
  const map = new Map<string, HorasProyecto>();
  for (const j of jornadas) {
    if (j.estado !== "cerrada" || !j.duracionMin) continue;
    const actual = map.get(j.proyectoId) ?? { proyectoId: j.proyectoId, nombre: j.proyectoNombre, minutos: 0 };
    actual.minutos += j.duracionMin;
    map.set(j.proyectoId, actual);
  }
  return [...map.values()].sort((a, b) => b.minutos - a.minutos);
}

export function minutosTrabajadosHoy(jornadasPropias: Jornada[], jornadaAbierta: Jornada | null, hoy: string): number {
  const cerradasHoy = jornadasPropias
    .filter((j) => j.fecha === hoy && j.estado === "cerrada")
    .reduce((s, j) => s + (j.duracionMin ?? 0), 0);
  const abiertaHoy =
    jornadaAbierta && jornadaAbierta.fecha === hoy ? Math.round((Date.now() - jornadaAbierta.entrada) / 60000) : 0;
  return cerradasHoy + abiertaHoy;
}

export function tareaEnCurso(tareasPropias: Tarea[]): Tarea | null {
  const activas = tareasPropias.filter((t) => t.estado !== "Completada");
  if (activas.length === 0) return null;
  return activas.reduce((mejor, t) => (t.actualizado > mejor.actualizado ? t : mejor), activas[0]);
}
