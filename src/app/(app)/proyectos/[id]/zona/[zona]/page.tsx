import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SIN_ZONA_SLUG } from "@/components/proyectos/zonas-card";
import { TareasTabla } from "@/components/tareas/tareas-tabla";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";
import { colorAvance, computeAvance, estaProxima, estaVencida } from "@/lib/tareas";
import type { Proyecto, Tarea, Usuario } from "@/types";

export default async function ZonaDetallePage({
  params,
}: {
  params: Promise<{ id: string; zona: string }>;
}) {
  const { id, zona: zonaParam } = await params;
  const usuario = await exigirUsuario();
  const esSinZona = zonaParam === SIN_ZONA_SLUG;
  const zonaNombre = esSinZona ? null : decodeURIComponent(zonaParam);

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

  if (!esSinZona && !(proyecto.zonas ?? []).includes(zonaNombre!)) {
    redirect(`/proyectos/${id}`);
  }

  const usuarios = usuariosSnap.docs.map((d) => d.data() as Usuario).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const membersLegacy = (equipoSnap.data()?.membersLegacy as string[] | undefined) ?? [];
  const responsablesDisponibles = [
    ...usuarios.map((u) => ({ label: u.nombre, uid: u.uid })),
    ...membersLegacy.filter((n) => !usuarios.some((u) => u.nombre === n)).map((n) => ({ label: n, uid: null })),
  ];

  const tareasZona = tareas.filter((t) => (esSinZona ? !t.zona : t.zona === zonaNombre));
  const otrasZonas = (proyecto.zonas ?? []).filter((z) => esSinZona || z !== zonaNombre);
  const pct = computeAvance(tareasZona);
  const done = tareasZona.filter((t) => t.estado === "Completada").length;
  const vencidas = tareasZona.filter(estaVencida).length;
  const proximas = tareasZona.filter(estaProxima).length;
  const hEst = tareasZona.reduce((s, t) => s + (Number(t.horasEstimadas) || 0), 0);
  const hReal = tareasZona.reduce((s, t) => s + (Number(t.horasReales) || 0), 0);

  const zonasProyecto = [
    ...new Set([...(proyecto.zonas ?? []), ...tareas.map((t) => t.zona).filter((z): z is string => !!z)]),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href={`/proyectos/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
              {proyecto.nombre}
            </Link>
            <h1 className="text-lg font-medium">{zonaNombre ?? "Sin zona"}</h1>
          </div>
          <Link
            href={`/proyectos/${id}`}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            ← Volver al proyecto
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${colorAvance(pct)}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-base font-semibold">{pct}%</span>
        </div>

        {otrasZonas.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Ir a otra zona:</span>
            {otrasZonas.map((z) => (
              <Link key={z} href={`/proyectos/${id}/zona/${encodeURIComponent(z)}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/15 hover:text-primary">
                  {z}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard etiqueta="Tareas completadas" valor={`${done}/${tareasZona.length}`} />
        <StatCard etiqueta="Vencidas" valor={vencidas} destacar={vencidas > 0 ? "mala" : "buena"} />
        <StatCard etiqueta="Por vencer (≤3 días)" valor={proximas} destacar={proximas > 0 ? "media" : undefined} />
        <StatCard etiqueta="Horas reales / estimadas" valor={`${hReal} / ${hEst} h`} />
      </div>

      <TareasTabla
        proyectoId={id}
        zonasProyecto={zonasProyecto}
        tareasIniciales={tareas}
        responsablesDisponibles={responsablesDisponibles}
        puedeCrear={puede(usuario.rol, "crearTarea")}
        puedeEliminar={puede(usuario.rol, "eliminarTarea")}
        puedeEditarAjenas={puede(usuario.rol, "editarTareaAjena")}
        uidActual={usuario.uid}
        zonaFija={esSinZona ? null : zonaNombre}
      />
    </div>
  );
}

function StatCard({
  etiqueta,
  valor,
  destacar,
}: {
  etiqueta: string;
  valor: string | number;
  destacar?: "buena" | "media" | "mala";
}) {
  const color =
    destacar === "buena"
      ? "text-estado-completada"
      : destacar === "media"
        ? "text-prioridad-media"
        : destacar === "mala"
          ? "text-estado-bloqueada"
          : "text-foreground";
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className={`text-xl font-semibold ${color}`}>{valor}</div>
      <div className="mt-1 text-xs text-muted-foreground">{etiqueta}</div>
    </div>
  );
}
