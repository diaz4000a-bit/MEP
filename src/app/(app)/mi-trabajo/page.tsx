import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import { diasHasta, ESTILO_ESTADO, fechaLegible } from "@/lib/tareas";
import type { Proyecto, Tarea } from "@/types";

type Urgencia = "vencida" | "hoy" | "semana" | "resto";

function urgenciaDe(t: Tarea): Urgencia {
  if (!t.fechaLimite) return "resto";
  const d = diasHasta(t.fechaLimite);
  if (d === null) return "resto";
  if (d < 0) return "vencida";
  if (d === 0) return "hoy";
  if (d <= 7) return "semana";
  return "resto";
}

export default async function MiTrabajoPage() {
  const usuario = await exigirUsuario();

  const [tareasSnap, proyectosSnap] = await Promise.all([
    adminDb.collectionGroup("tareas").get(),
    adminDb.collection("proyectos").get(),
  ]);

  const proyectosPorId = new Map(proyectosSnap.docs.map((d) => [d.id, (d.data() as Proyecto).nombre]));
  const misTareas = tareasSnap.docs.map((d) => d.data() as Tarea).filter((t) => t.responsableUid === usuario.uid);

  const activas = misTareas.filter((t) => t.estado !== "Completada");
  const completadas = misTareas.filter((t) => t.estado === "Completada");

  const vencidas = activas.filter((t) => urgenciaDe(t) === "vencida");
  const hoy = activas.filter((t) => urgenciaDe(t) === "hoy");
  const estaSemana = activas.filter((t) => urgenciaDe(t) === "semana");
  const resto = activas.filter((t) => urgenciaDe(t) === "resto");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">Mi trabajo</h1>
        <p className="text-sm text-muted-foreground">Tus tareas en todos los proyectos, ordenadas por urgencia.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tarjeta titulo="Vencidas" valor={vencidas.length} clase={vencidas.length > 0 ? "text-estado-bloqueada" : undefined} />
        <Tarjeta titulo="Hoy" valor={hoy.length} clase={hoy.length > 0 ? "text-prioridad-media" : undefined} />
        <Tarjeta titulo="Pendientes" valor={activas.length} />
        <Tarjeta titulo="Completadas" valor={completadas.length} />
      </div>

      {misTareas.length === 0 ? (
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            No tienes tareas asignadas todavía. Pídele a tu coordinador que te asigne una, o toma una desde un proyecto.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <SeccionTareas
            titulo="Vencidas"
            tareas={vencidas}
            vacio="Nada vencido. Bien ahí."
            proyectosPorId={proyectosPorId}
            claseTitulo="text-estado-bloqueada"
          />
          <SeccionTareas titulo="Vencen hoy" tareas={hoy} vacio="Nada vence hoy." proyectosPorId={proyectosPorId} />
          <SeccionTareas
            titulo="Esta semana"
            tareas={estaSemana}
            vacio="Nada vence en los próximos 7 días."
            proyectosPorId={proyectosPorId}
          />
          <SeccionTareas titulo="Resto" tareas={resto} vacio="Sin más tareas pendientes." proyectosPorId={proyectosPorId} />

          {completadas.length > 0 && (
            <details className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Completadas ({completadas.length})
              </summary>
              <div className="mt-3">
                <TablaTareas tareas={completadas} proyectosPorId={proyectosPorId} />
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function Tarjeta({ titulo, valor, clase }: { titulo: string; valor: number; clase?: string }) {
  return (
    <div className="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
      <p className="text-xs text-muted-foreground">{titulo}</p>
      <p className={`mt-1 text-lg font-semibold ${clase ?? ""}`}>{valor}</p>
    </div>
  );
}

function SeccionTareas({
  titulo,
  tareas,
  vacio,
  proyectosPorId,
  claseTitulo,
}: {
  titulo: string;
  tareas: Tarea[];
  vacio: string;
  proyectosPorId: Map<string, string>;
  claseTitulo?: string;
}) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h3 className={`text-sm font-medium ${claseTitulo ?? ""}`}>
        {titulo} ({tareas.length})
      </h3>
      {tareas.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground italic">{vacio}</p>
      ) : (
        <div className="mt-2">
          <TablaTareas tareas={tareas} proyectosPorId={proyectosPorId} />
        </div>
      )}
    </div>
  );
}

function TablaTareas({ tareas, proyectosPorId }: { tareas: Tarea[]; proyectosPorId: Map<string, string> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarea</TableHead>
          <TableHead>Proyecto</TableHead>
          <TableHead>Zona</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Avance</TableHead>
          <TableHead>Fecha límite</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tareas.map((t) => (
          <TableRow key={t.id}>
            <TableCell>
              <Link href={`/proyectos/${t.proyectoId}/tarea/${t.id}`} className="font-medium hover:underline">
                {t.nombre}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{proyectosPorId.get(t.proyectoId) ?? "Proyecto eliminado"}</TableCell>
            <TableCell className="text-muted-foreground">{t.zona || "—"}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={ESTILO_ESTADO[t.estado]}>
                {t.estado}
              </Badge>
            </TableCell>
            <TableCell>{t.porcentaje}%</TableCell>
            <TableCell>{fechaLegible(t.fechaLimite)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
