import { Actividad } from "@/components/dashboard/actividad";
import { Indicadores } from "@/components/dashboard/indicadores";
import { MiEstado } from "@/components/dashboard/mi-estado";
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
import { adminDb } from "@/lib/firebase/admin";
import { fechaBogota } from "@/lib/jornadas";
import type { EstadoTarea, Jornada, Proyecto, Tarea } from "@/types";

const ESTADOS: EstadoTarea[] = ["Sin iniciar", "En progreso", "En revisión", "Completada", "Bloqueada"];

function hace90Dias(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const usuario = await exigirUsuario();

  const [tareasSnap, proyectosSnap, jornadasSnap] = await Promise.all([
    adminDb.collectionGroup("tareas").get(),
    adminDb.collection("proyectos").get(),
    adminDb.collection("jornadas").where("fecha", ">=", hace90Dias()).get(),
  ]);

  const tareas = tareasSnap.docs.map((d) => d.data() as Tarea);
  const proyectos = proyectosSnap.docs.map((d) => d.data() as Proyecto).sort((a, b) => a.avanceTotal - b.avanceTotal);
  const jornadas = jornadasSnap.docs.map((d) => d.data() as Jornada);
  const proyectosPorId = new Map(proyectos.map((p) => [p.id, p.nombre]));

  // Banda 1 — Mi estado ahora
  const jornadaAbierta = jornadas.find((j) => j.uid === usuario.uid && j.estado === "abierta") ?? null;
  const jornadasPropias = jornadas.filter((j) => j.uid === usuario.uid).sort((a, b) => b.entrada - a.entrada);
  const proyectoActual = jornadaAbierta?.proyectoNombre ?? jornadasPropias[0]?.proyectoNombre ?? null;

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
  const minutosJornadaTotal = jornadas.filter((j) => j.estado === "cerrada").reduce((s, j) => s + (j.duracionMin ?? 0), 0);
  const promedioMinutosJornada = completadas > 0 ? Math.round(minutosJornadaTotal / completadas) : null;
  const porEstado = ESTADOS.map((estado) => ({ estado, n: tareas.filter((t) => t.estado === estado).length }));

  // Banda 3 — Actividad y alertas
  const eventos = actividadReciente(tareas, proyectosPorId, jornadas);
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
        horas={horasPorProyecto(jornadas)}
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
