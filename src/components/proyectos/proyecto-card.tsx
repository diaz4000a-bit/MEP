import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { colorAvance, ESTILO_ESTADO_PROYECTO, fechaLegible } from "@/lib/tareas";
import type { Proyecto } from "@/types";

export function ProyectoCard({ proyecto }: { proyecto: Proyecto }) {
  return (
    <Link
      href={`/proyectos/${proyecto.id}`}
      className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:ring-primary/40"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{proyecto.nombre}</h3>
          <p className="text-sm text-muted-foreground">
            {proyecto.cliente || "Sin cliente"} · {fechaLegible(proyecto.fechaInicio)} →{" "}
            {fechaLegible(proyecto.fechaEntrega)}
          </p>
        </div>
        <Badge className={ESTILO_ESTADO_PROYECTO[proyecto.estado]} variant="secondary">
          {proyecto.estado}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full ${colorAvance(proyecto.avanceTotal)}`}
            style={{ width: `${proyecto.avanceTotal}%` }}
          />
        </div>
        <span className="text-sm font-semibold">{proyecto.avanceTotal}%</span>
        <span className="text-sm text-muted-foreground">
          {proyecto.tareasCompletadas}/{proyecto.totalTareas} tareas
        </span>
      </div>
    </Link>
  );
}
