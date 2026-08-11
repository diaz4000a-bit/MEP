import { notFound } from "next/navigation";
import { ProyectoHeader } from "@/components/proyectos/proyecto-header";
import { ProyectoStats } from "@/components/proyectos/proyecto-stats";
import { ProyectoTimeline } from "@/components/proyectos/proyecto-timeline";
import { ZonasCard } from "@/components/proyectos/zonas-card";
import { TareasTabla } from "@/components/tareas/tareas-tabla";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";
import type { Proyecto, Tarea, Usuario } from "@/types";

export default async function ProyectoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await exigirUsuario();

  const proyectoRef = adminDb.doc(`proyectos/${id}`);
  const [proyectoSnap, tareasSnap, usuariosSnap, equipoSnap] = await Promise.all([
    proyectoRef.get(),
    proyectoRef.collection("tareas").orderBy("actualizado", "desc").get(),
    adminDb.collection("usuarios").where("activo", "==", true).get(),
    adminDb.doc("config/equipo").get(),
  ]);

  if (!proyectoSnap.exists) notFound();

  const proyecto = proyectoSnap.data() as Proyecto;
  const tareas = tareasSnap.docs.map((d) => d.data() as Tarea);
  const usuarios = usuariosSnap.docs.map((d) => d.data() as Usuario).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const membersLegacy = (equipoSnap.data()?.membersLegacy as string[] | undefined) ?? [];

  const responsablesDisponibles = [
    ...usuarios.map((u) => ({ label: u.nombre, uid: u.uid })),
    ...membersLegacy
      .filter((nombre) => !usuarios.some((u) => u.nombre === nombre))
      .map((nombre) => ({ label: nombre, uid: null })),
  ];

  const zonasProyecto = [
    ...new Set([...(proyecto.zonas ?? []), ...tareas.map((t) => t.zona).filter((z): z is string => !!z)]),
  ];
  const responsablesConTareas = [...new Set(tareas.map((t) => t.responsable).filter(Boolean))].sort();

  return (
    <div className="flex flex-col gap-4">
      <ProyectoHeader
        proyecto={proyecto}
        responsables={responsablesConTareas}
        puedeBorrar={puede(usuario.rol, "borrarProyecto")}
      />
      <ZonasCard
        proyectoId={id}
        zonas={proyecto.zonas ?? []}
        tareas={tareas}
        puedeGestionar={puede(usuario.rol, "crearProyecto")}
      />
      <ProyectoStats proyectoId={id} notas={proyecto.notas} tareas={tareas} />
      <ProyectoTimeline tareas={tareas} />
      <TareasTabla
        proyectoId={id}
        zonasProyecto={zonasProyecto}
        tareasIniciales={tareas}
        responsablesDisponibles={responsablesDisponibles}
        puedeCrear={puede(usuario.rol, "crearTarea")}
        puedeEliminar={puede(usuario.rol, "eliminarTarea")}
        puedeEditarAjenas={puede(usuario.rol, "editarTareaAjena")}
        uidActual={usuario.uid}
      />
    </div>
  );
}
