"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agregarZona, eliminarZona } from "@/app/(app)/proyectos/actions";
import { colorAvance, computeAvance, estaVencida } from "@/lib/tareas";
import type { Tarea } from "@/types";

const SIN_ZONA_SLUG = "__sin_zona__";

interface ZonaResumen {
  nombre: string | null; // null = "Sin zona"
  slug: string;
  tareas: Tarea[];
}

export function ZonasCard({
  proyectoId,
  zonas,
  tareas,
  puedeGestionar,
}: {
  proyectoId: string;
  zonas: string[];
  tareas: Tarea[];
  puedeGestionar: boolean;
}) {
  const [nuevaZona, setNuevaZona] = useState("");
  const [pending, startTransition] = useTransition();

  const resumenes: ZonaResumen[] = [
    ...zonas.map((z) => ({ nombre: z, slug: encodeURIComponent(z), tareas: tareas.filter((t) => t.zona === z) })),
  ];
  const sinZona = tareas.filter((t) => !t.zona);

  const crear = () => {
    const nombre = nuevaZona.trim();
    if (!nombre) return;
    startTransition(async () => {
      try {
        await agregarZona(proyectoId, nombre);
        setNuevaZona("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo agregar la zona.");
      }
    });
  };

  const eliminar = (zona: string, cantidadTareas: number) => {
    const msg =
      cantidadTareas > 0
        ? `¿Quitar la zona "${zona}"? Tiene ${cantidadTareas} tarea(s) asignada(s); esas tareas quedarán sin zona (no se eliminan).`
        : `¿Quitar la zona "${zona}"?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      try {
        await eliminarZona(proyectoId, zona);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo quitar la zona.");
      }
    });
  };

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h3 className="text-sm font-medium">Zonas / Modelos del proyecto</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Las zonas pertenecen únicamente a este proyecto. Selecciona una para ver su checklist de tareas.
      </p>

      {resumenes.length === 0 && sinZona.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Sin zonas definidas. Agrega la primera abajo (ej: Torre A, Sótano, Urbanismo…).
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {resumenes.map((r) => (
            <ZonaNavCard
              key={r.slug}
              proyectoId={proyectoId}
              nombre={r.nombre!}
              slug={r.slug}
              tareas={r.tareas}
              onEliminar={puedeGestionar ? () => eliminar(r.nombre!, r.tareas.length) : undefined}
            />
          ))}
          {sinZona.length > 0 && (
            <ZonaNavCard proyectoId={proyectoId} nombre={null} slug={SIN_ZONA_SLUG} tareas={sinZona} />
          )}
        </div>
      )}

      {puedeGestionar && (
        <div className="mt-3 flex gap-2">
          <Input
            value={nuevaZona}
            onChange={(e) => setNuevaZona(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && crear()}
            placeholder="Nueva zona / modelo (ej: Torre A)"
            disabled={pending}
          />
          <Button onClick={crear} disabled={pending}>
            Agregar zona
          </Button>
        </div>
      )}
    </div>
  );
}

function ZonaNavCard({
  proyectoId,
  nombre,
  slug,
  tareas,
  onEliminar,
}: {
  proyectoId: string;
  nombre: string | null;
  slug: string;
  tareas: Tarea[];
  onEliminar?: () => void;
}) {
  const pct = computeAvance(tareas);
  const done = tareas.filter((t) => t.estado === "Completada").length;
  const venc = tareas.filter(estaVencida).length;

  return (
    <Link
      href={`/proyectos/${proyectoId}/zona/${slug}`}
      className="flex flex-col gap-2 rounded-lg border border-border p-3 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{nombre ?? "Sin zona"}</span>
        <div className="flex items-center gap-2">
          {onEliminar && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEliminar();
              }}
              className="text-muted-foreground hover:text-estado-bloqueada"
              title="Quitar zona"
            >
              ✕
            </button>
          )}
          <span className="text-sm font-semibold">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${colorAvance(pct)}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>
          {done}/{tareas.length} tarea{tareas.length !== 1 ? "s" : ""}
        </span>
        {venc > 0 && (
          <Badge variant="secondary" className="bg-estado-bloqueada/15 text-estado-bloqueada">
            {venc} vencida{venc > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    </Link>
  );
}

export { SIN_ZONA_SLUG };
