import { GestionEquipo } from "@/components/equipo/gestion-equipo";
import { PersonaCard } from "@/components/equipo/persona-card";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { agruparPorResponsable } from "@/lib/equipo";
import { adminDb } from "@/lib/firebase/admin";
import type { Proyecto, Tarea, Usuario } from "@/types";

export default async function EquipoPage() {
  const usuario = await exigirUsuario();

  const [usuariosSnap, equipoSnap, tareasSnap, proyectosSnap] = await Promise.all([
    adminDb.collection("usuarios").where("activo", "==", true).get(),
    adminDb.doc("config/equipo").get(),
    adminDb.collectionGroup("tareas").get(),
    adminDb.collection("proyectos").get(),
  ]);

  const nombresUsuarios = usuariosSnap.docs.map((d) => (d.data() as Usuario).nombre);
  const membersLegacy = (equipoSnap.data()?.membersLegacy as string[] | undefined) ?? [];
  const tareas = tareasSnap.docs.map((d) => d.data() as Tarea);
  const proyectosPorId = new Map(proyectosSnap.docs.map((d) => [d.id, (d.data() as Proyecto).nombre]));

  const personas = agruparPorResponsable(tareas, nombresUsuarios, membersLegacy);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">Equipo</h1>
        <p className="text-sm text-muted-foreground">Responsables y su carga de trabajo en todos los proyectos.</p>
      </div>

      {personas.length === 0 ? (
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            No hay responsables registrados. Agrégalos abajo o asígnalos al crear tareas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {personas.map((p) => (
            <PersonaCard key={p.nombre} persona={p} proyectosPorId={proyectosPorId} />
          ))}
        </div>
      )}

      {puede(usuario.rol, "gestionarEquipo") && <GestionEquipo membersLegacy={membersLegacy} />}
    </div>
  );
}
