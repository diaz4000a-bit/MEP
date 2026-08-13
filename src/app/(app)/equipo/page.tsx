import { GestionEquipo } from "@/components/equipo/gestion-equipo";
import { PersonaCard } from "@/components/equipo/persona-card";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { leerProyectos, leerTareas } from "@/lib/datos";
import { agruparPorResponsable } from "@/lib/equipo";
import { adminDb } from "@/lib/firebase/admin";
import type { Usuario } from "@/types";

export default async function EquipoPage() {
  const usuario = await exigirUsuario();

  // Memoizadas por request: el layout de (app) ya escaneó tareas y proyectos para el
  // índice de búsqueda, así que esta page reutiliza ese resultado en vez de repetirlo.
  const [usuariosSnap, equipoSnap, tareas, proyectos] = await Promise.all([
    adminDb.collection("usuarios").where("activo", "==", true).get(),
    adminDb.doc("config/equipo").get(),
    leerTareas(),
    leerProyectos(),
  ]);

  const nombresUsuarios = usuariosSnap.docs.map((d) => (d.data() as Usuario).nombre);
  const membersLegacy = (equipoSnap.data()?.membersLegacy as string[] | undefined) ?? [];
  const proyectosPorId = new Map(proyectos.map((p) => [p.id, p.nombre]));

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
