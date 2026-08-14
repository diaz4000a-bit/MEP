import { Actividad } from "@/components/dashboard/actividad";
import { Indicadores } from "@/components/dashboard/indicadores";
import { MiEstado } from "@/components/dashboard/mi-estado";
import { puede } from "@/lib/auth/roles";
import { exigirUsuario } from "@/lib/auth/sesion";
import {
  actividadReciente,
  avancePorZona,
  horasPorProyecto,
  minutosTrabajadosHoy,
  progresoPorGrupo,
  tareaEnCurso,
  tareasUrgentes,
} from "@/lib/dashboard";
import { leerProyectos, leerTareas } from "@/lib/datos";
import { adminDb } from "@/lib/firebase/admin";
import { fechaBogota } from "@/lib/jornadas";
import type { EstadoTarea, Jornada } from "@/types";

const ESTADOS: EstadoTarea[] = ["Sin iniciar", "En progreso", "En revisión", "Completada", "Bloqueada"];

/**
 * `new Date(); d.setDate(...)` usa la hora local del runtime: en Vercel (UTC) el corte de
 * "hoy" cae hasta 5 horas antes que en Bogotá, así que cerca de medianoche colombiana el
 * rango de 90 días podía arrancar un día más tarde o más temprano según dónde corriera.
 * Se ancla primero al día calendario de Bogotá y se resta con aritmética UTC pura.
 */
function hace90Dias(): string {
  const ms = Date.parse(`${fechaBogota()}T00:00:00Z`) - 90 * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const usuario = await exigirUsuario();

  // `leerTareas`/`leerProyectos` están memoizadas por request: el layout de (app) ya
  // las pidió para el índice de búsqueda, así que aquí no se repite el escaneo.
  const [tareas, proyectosSinOrden, jornadasSnap] = await Promise.all([
    leerTareas(),
    leerProyectos(),
    adminDb.collection("jornadas").where("fecha", ">=", hace90Dias()).get(),
  ]);

  const proyectos = [...proyectosSinOrden].sort((a, b) => a.avanceTotal - b.avanceTotal);
  const jornadas = jornadasSnap.docs.map((d) => d.data() as Jornada);
  const proyectosPorId = new Map(proyectos.map((p) => [p.id, p.nombre]));

  // Banda 1 — Mi estado ahora
  const jornadaAbierta = jornadas.find((j) => j.uid === usuario.uid && j.estado === "abierta") ?? null;
  const jornadasPropias = jornadas.filter((j) => j.uid === usuario.uid).sort((a, b) => b.entrada - a.entrada);
  const proyectoActual = jornadaAbierta?.proyectoNombre ?? jornadasPropias[0]?.proyectoNombre ?? null;

  // Las jornadas ajenas son dato reservado a gestores (misma regla que /jornadas y el
  // informe diario): sin este filtro, cualquier rol veía nombre + hora de entrada/salida
  // de todo el equipo en "Actividad reciente" y las horas por proyecto.
  const jornadasVisibles = puede(usuario.rol, "verJornadasAjenas") ? jornadas : jornadasPropias;

  const hoy = fechaBogota();
  const minutosHoy = minutosTrabajadosHoy(jornadasPropias, jornadaAbierta, hoy);

  const tareasPropias = tareas.filter((t) => t.responsableUid === usuario.uid);
  const tareasPendientesPropias = tareasPropias.filter((t) => t.estado !== "Completada");
  const tareaActual = tareaEnCurso(tareasPropias);

  // Banda 2 — Indicadores
  const completadas = tareas.filter((t) => t.estado === "Completada").length;
  const promedioHorasReales =
    completadas > 0
      ? tareas.filter((t) => t.estado === "Completada").reduce((s, t) => s + (Number(t.horasReales) || 0), 0) /
        completadas
      : null;
  // "Tiempo de jornada / tarea completada": el numerador (minutos de jornadas cerradas) solo
  // cubre los últimos 90 días (`jornadasSnap` está acotado a ese rango), pero el denominador
  // usaba `completadas` SIN acotar — tareas completadas hace años inflaban el conteo sin
  // aportar minutos al numerador, dando un promedio que no correspondía a ningún periodo real.
  // Se acota también el denominador a los últimos 90 días, usando `fechaCompletada`.
  const desde90 = hace90Dias();
  const completadasUltimos90 = tareas.filter(
    (t) => t.estado === "Completada" && t.fechaCompletada >= desde90,
  ).length;
  const minutosJornadaTotal = jornadas.filter((j) => j.estado === "cerrada").reduce((s, j) => s + (j.duracionMin ?? 0), 0);
  const promedioMinutosJornada =
    completadasUltimos90 > 0 ? Math.round(minutosJornadaTotal / completadasUltimos90) : null;
  const porEstado = ESTADOS.map((estado) => ({ estado, n: tareas.filter((t) => t.estado === estado).length }));

  // Banda 3 — Actividad y alertas
  const eventos = actividadReciente(tareas, proyectosPorId, jornadasVisibles);
  const { vencidas, proximas } = tareasUrgentes(tareas, proyectosPorId);
  const zonas = avancePorZona(tareas, proyectosPorId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-medium">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Resumen de tu trabajo y el de todos los proyectos.</p>
      </div>

      <MiEstado
        usuario={{ nombre: usuario.nombre, rol: usuario.rol }}
        proyectoActual={proyectoActual}
        jornadaAbierta={jornadaAbierta}
        minutosHoy={minutosHoy}
        tareasPendientes={tareasPendientesPropias}
        tareaActual={tareaActual}
        proyectoTareaActual={tareaActual ? (proyectosPorId.get(tareaActual.proyectoId) ?? null) : null}
      />

      <Indicadores
        proyectos={proyectos}
        horas={horasPorProyecto(jornadasVisibles)}
        totalTareas={tareas.length}
        completadas={completadas}
        promedioHorasReales={promedioHorasReales}
        promedioMinutosJornada={promedioMinutosJornada}
        porEstado={porEstado}
        progresoGrupos={progresoPorGrupo(tareas)}
      />

      <Actividad eventos={eventos} vencidas={vencidas} proximas={proximas} zonas={zonas} />
    </div>
  );
}
