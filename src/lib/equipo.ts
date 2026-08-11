import { computeAvance, estaVencida } from "@/lib/tareas";
import type { Tarea } from "@/types";

export interface ResponsableInfo {
  nombre: string;
  esUsuarioReal: boolean;
  tareas: Tarea[];
  completadas: number;
  vencidas: number;
  avancePromedio: number;
}

/** Unión de equipo configurado + usuarios reales + responsables encontrados en tareas (igual que la v1). */
export function agruparPorResponsable(
  tareas: Tarea[],
  nombresUsuarios: string[],
  membersLegacy: string[],
): ResponsableInfo[] {
  const usuariosSet = new Set(nombresUsuarios);
  const nombres = [...new Set([...membersLegacy, ...nombresUsuarios, ...tareas.map((t) => t.responsable)])]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"));

  return nombres.map((nombre) => {
    const ts = tareas.filter((t) => t.responsable === nombre);
    return {
      nombre,
      esUsuarioReal: usuariosSet.has(nombre),
      tareas: ts,
      completadas: ts.filter((t) => t.estado === "Completada").length,
      vencidas: ts.filter(estaVencida).length,
      avancePromedio: computeAvance(ts),
    };
  });
}

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}
