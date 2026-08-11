"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { eliminarProyecto } from "@/app/(app)/proyectos/actions";
import { InformeDialog } from "@/components/proyectos/informe-dialog";
import { colorAvance, ESTILO_ESTADO_PROYECTO, fechaLegible } from "@/lib/tareas";
import type { Proyecto } from "@/types";

export function ProyectoHeader({
  proyecto,
  responsables,
  puedeBorrar,
}: {
  proyecto: Proyecto;
  responsables: string[];
  puedeBorrar: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const eliminar = () => {
    if (!confirm(`¿Eliminar "${proyecto.nombre}" y todas sus tareas? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      try {
        await eliminarProyecto(proyecto.id);
        router.push("/proyectos");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar el proyecto.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium">{proyecto.nombre}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{proyecto.cliente || "Sin cliente"}</span>
            <span>
              {fechaLegible(proyecto.fechaInicio)} → {fechaLegible(proyecto.fechaEntrega)}
            </span>
            <span>{proyecto.software}</span>
            <Badge className={ESTILO_ESTADO_PROYECTO[proyecto.estado]} variant="secondary">
              {proyecto.estado}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InformeDialog proyectoId={proyecto.id} responsables={responsables} />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={`/api/proyectos/${proyecto.id}/exportar`} />}
          >
            Exportar JSON
          </Button>
          {puedeBorrar && (
            <Button variant="destructive" size="sm" onClick={eliminar} disabled={pending}>
              Eliminar proyecto
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full ${colorAvance(proyecto.avanceTotal)}`}
            style={{ width: `${proyecto.avanceTotal}%` }}
          />
        </div>
        <span className="text-base font-semibold">{proyecto.avanceTotal}%</span>
      </div>
    </div>
  );
}
