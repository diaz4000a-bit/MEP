import { notFound } from "next/navigation";
import { FichaTarea } from "@/components/tareas/ficha-tarea";
import { CATALOGO_TAREAS_MAP } from "@/content/catalogo-tareas";
import { LECCIONES } from "@/content/guia";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";
import { contenidoTarea } from "@/lib/contenido";
import type { Proyecto, Tarea, Usuario } from "@/types";

export default async function FichaTareaPage({
  params,
}: {
  params: Promise<{ id: string; tareaId: string }>;
}) {
  const { id, tareaId } = await params;
  const usuario = await exigirUsuario();

  const proyectoRef = adminDb.doc(`proyectos/${id}`);
  const [proyectoSnap, tareaSnap, tareasSnap, usuariosSnap, equipoSnap] = await Promise.all([
    proyectoRef.get(),
    proyectoRef.collection("tareas").doc(tareaId).get(),
    proyectoRef.collection("tareas").get(),
    adminDb.collection("usuarios").where("activo", "==", true).get(),
    adminDb.doc("config/equipo").get(),
  ]);

  if (!proyectoSnap.exists || !tareaSnap.exists) notFound();

  const proyecto = proyectoSnap.data() as Proyecto;
  const tarea = tareaSnap.data() as Tarea;
  const tareasProyecto = tareasSnap.docs.map((d) => d.data() as Tarea);
  const usuarios = usuariosSnap.docs.map((d) => d.data() as Usuario).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const membersLegacy = (equipoSnap.data()?.membersLegacy as string[] | undefined) ?? [];

  const responsablesDisponibles = [
    ...usuarios.map((u) => ({ label: u.nombre, uid: u.uid })),
    ...membersLegacy
      .filter((nombre) => !usuarios.some((u) => u.nombre === nombre))
      .map((nombre) => ({ label: nombre, uid: null })),
  ];
  const zonasDisponibles = [
    ...new Set([...(proyecto.zonas ?? []), ...tareasProyecto.map((t) => t.zona).filter((z): z is string => !!z)]),
  ];
  const etapasDisponibles = [...new Set(tareasProyecto.map((t) => t.etapa).filter((e): e is string => !!e))];

  const catalogo = tarea.plantillaId ? CATALOGO_TAREAS_MAP.get(tarea.plantillaId) : undefined;
  const contenido = contenidoTarea(tarea);

  const dependencias = (catalogo?.dependeDe ?? []).map((plantillaId) => {
    const c = CATALOGO_TAREAS_MAP.get(plantillaId);
    const enProyecto = tareasProyecto.find((t) => t.plantillaId === plantillaId);
    return { plantillaId, nombre: c?.nombre ?? plantillaId, tareaId: enProyecto?.id ?? null };
  });

  const lecciones = (catalogo?.guiaIds ?? []).map((leccionId) => {
    const l = LECCIONES.get(leccionId);
    return { id: leccionId, titulo: l?.titulo ?? leccionId, modulo: leccionId.split(".")[0] };
  });

  const puedeEditarAjena = puede(usuario.rol, "editarTareaAjena");
  const puedeEditar =
    puedeEditarAjena || (puede(usuario.rol, "editarTareaPropia") && tarea.responsableUid === usuario.uid);

  return (
    <FichaTarea
      proyecto={{ id, nombre: proyecto.nombre }}
      tarea={tarea}
      contenido={contenido}
      dificultad={catalogo?.dificultad}
      nombreOriginal={catalogo?.nombreOriginal}
      dependencias={dependencias}
      lecciones={lecciones}
      zonasDisponibles={zonasDisponibles}
      etapasDisponibles={etapasDisponibles}
      responsablesDisponibles={responsablesDisponibles}
      puedeEditar={puedeEditar}
      puedeEditarAjena={puedeEditarAjena}
      puedeEliminar={puede(usuario.rol, "eliminarTarea")}
    />
  );
}
