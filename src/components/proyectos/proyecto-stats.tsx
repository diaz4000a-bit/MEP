"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { guardarNotasProyecto } from "@/app/(app)/proyectos/actions";
import { ESTILO_ESTADO, estaProxima, estaVencida } from "@/lib/tareas";
import type { EstadoTarea, Tarea } from "@/types";

const ORDEN_ESTADOS: EstadoTarea[] = ["Sin iniciar", "En progreso", "En revisión", "Completada", "Bloqueada"];

export function ProyectoStats({
  proyectoId,
  notas,
  tareas,
}: {
  proyectoId: string;
  notas: string;
  tareas: Tarea[];
}) {
  const [pending, startTransition] = useTransition();

  const hEst = tareas.reduce((s, t) => s + (Number(t.horasEstimadas) || 0), 0);
  const hReal = tareas.reduce((s, t) => s + (Number(t.horasReales) || 0), 0);
  const pctConsumido = hEst > 0 ? Math.round((hReal / hEst) * 100) : 0;
  const vencidas = tareas.filter(estaVencida).length;
  const proximas = tareas.filter(estaProxima).length;
  const porEstado = ORDEN_ESTADOS.map((e) => [e, tareas.filter((t) => t.estado === e).length] as const).filter(
    ([, n]) => n > 0,
  );

  const guardarNotas = (valor: string) => {
    startTransition(async () => {
      try {
        await guardarNotasProyecto(proyectoId, valor);
      } catch {
        toast.error("No se pudieron guardar las notas.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <h3 className="text-sm font-medium">Horas estimadas vs reales</h3>
        <div className="mt-3 flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimadas</span>
            <span className="font-semibold">{hEst} h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reales</span>
            <span className={`font-semibold ${hReal > hEst ? "text-estado-bloqueada" : "text-estado-completada"}`}>
              {hReal} h
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${hReal > hEst ? "bg-estado-bloqueada" : "bg-estado-completada"}`}
              style={{ width: `${Math.min(100, pctConsumido)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {hEst > 0 ? `${pctConsumido}% del tiempo estimado consumido` : "Sin horas estimadas"}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <h3 className="text-sm font-medium">Tareas por estado</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {porEstado.length ? (
            porEstado.map(([e, n]) => (
              <Badge key={e} className={ESTILO_ESTADO[e]} variant="secondary">
                {e}: {n}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Sin tareas aún</span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge className="bg-estado-bloqueada/15 text-estado-bloqueada" variant="secondary">
            Vencidas: {vencidas}
          </Badge>
          <Badge className="bg-prioridad-media/15 text-prioridad-media" variant="secondary">
            Por vencer (≤3 días): {proximas}
          </Badge>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <h3 className="text-sm font-medium">Notas del proyecto</h3>
        <Textarea
          className="mt-2"
          rows={5}
          defaultValue={notas}
          placeholder="Notas, pendientes de coordinación, acuerdos con el cliente..."
          onBlur={(e) => guardarNotas(e.target.value)}
          disabled={pending}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">Se guarda automáticamente al salir del campo.</p>
      </div>
    </div>
  );
}
