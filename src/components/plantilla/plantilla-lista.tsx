"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ocultarTareaCatalogo } from "@/app/(app)/plantilla/actions";
import type { Grupo } from "@/content/grupos";
import type { TareaCatalogo } from "@/types";

export interface FilaPlantilla {
  tarea: TareaCatalogo;
  oculto: boolean;
  esNuevo: boolean;
  editada: boolean;
}

export function PlantillaLista({ filas, grupos }: { filas: FilaPlantilla[]; grupos: Grupo[] }) {
  const [pending, startTransition] = useTransition();

  const toggleOculto = (plantillaId: string, oculto: boolean) => {
    startTransition(async () => {
      try {
        await ocultarTareaCatalogo(plantillaId, oculto);
        toast.success(oculto ? "Tarea ocultada de proyectos nuevos." : "Tarea visible de nuevo.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo actualizar.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {grupos.map((grupo) => {
        const filasGrupo = filas.filter((f) => f.tarea.grupo === grupo.id);
        if (filasGrupo.length === 0) return null;
        return (
          <div key={grupo.id} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">{grupo.nombre}</h2>
            <div className="flex flex-col divide-y divide-border rounded-xl bg-card ring-1 ring-foreground/10">
              {filasGrupo.map((f) => (
                <div
                  key={f.tarea.plantillaId}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                >
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <Link
                      href={`/plantilla/${encodeURIComponent(f.tarea.plantillaId)}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {f.tarea.nombre}
                    </Link>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{f.tarea.plantillaId}</span>
                    {f.esNuevo && <Badge variant="secondary">Nueva</Badge>}
                    {f.editada && <Badge variant="secondary">Editada</Badge>}
                    {f.oculto && <Badge variant="secondary">Oculta</Badge>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => toggleOculto(f.tarea.plantillaId, !f.oculto)}
                  >
                    {f.oculto ? "Mostrar" : "Ocultar"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
