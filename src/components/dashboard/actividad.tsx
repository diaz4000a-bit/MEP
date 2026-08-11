import Link from "next/link";
import type { AvanceZona, EventoActividad } from "@/lib/dashboard";
import { colorAvance, diasHasta } from "@/lib/tareas";
import { haceTiempo } from "@/lib/tiempo";
import type { Tarea } from "@/types";

interface TareaConProyecto {
  tarea: Tarea;
  proyectoNombre: string;
}

export function Actividad({
  eventos,
  vencidas,
  proximas,
  zonas,
}: {
  eventos: EventoActividad[];
  vencidas: TareaConProyecto[];
  proximas: TareaConProyecto[];
  zonas: AvanceZona[];
}) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground">Actividad y alertas</h2>
      <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h3 className="text-sm font-medium">Actividad reciente</h3>
          {eventos.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground italic">Aún no hay actividad registrada.</p>
          ) : (
            <ul className="mt-2 flex max-h-80 flex-col gap-2 overflow-y-auto text-sm">
              {eventos.map((e, i) => (
                <li key={i} className="flex flex-col">
                  <span>{e.texto}</span>
                  <span className="text-xs text-muted-foreground">
                    {e.proyectoNombre} · {haceTiempo(e.ts)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h3 className="text-sm font-medium">Vencidas y próximas a vencer</h3>
          {vencidas.length === 0 && proximas.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground italic">
              Nada vencido ni por vencer en los próximos 3 días.
            </p>
          ) : (
            <ul className="mt-2 flex max-h-80 flex-col gap-2 overflow-y-auto text-sm">
              {vencidas.map(({ tarea: t, proyectoNombre }) => (
                <li key={t.id}>
                  <Link href={`/proyectos/${t.proyectoId}/tarea/${t.id}`} className="hover:underline">
                    {t.nombre}
                  </Link>
                  <div className="text-xs text-estado-bloqueada">
                    {proyectoNombre} · vencida hace {Math.abs(diasHasta(t.fechaLimite) ?? 0)} d
                  </div>
                </li>
              ))}
              {proximas.map(({ tarea: t, proyectoNombre }) => (
                <li key={t.id}>
                  <Link href={`/proyectos/${t.proyectoId}/tarea/${t.id}`} className="hover:underline">
                    {t.nombre}
                  </Link>
                  <div className="text-xs text-prioridad-media">
                    {proyectoNombre} · vence en {diasHasta(t.fechaLimite) ?? 0} d
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h3 className="text-sm font-medium">Avance por zona</h3>
          {zonas.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground italic">Aún no hay tareas con zona asignada.</p>
          ) : (
            <ul className="mt-2 flex max-h-80 flex-col gap-2 overflow-y-auto text-sm">
              {zonas.map((z) => (
                <li key={`${z.proyectoId}__${z.zona}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate" title={`${z.proyectoNombre} · ${z.zona}`}>
                      {z.proyectoNombre} · {z.zona}
                    </span>
                    <span className="shrink-0 text-xs font-semibold">{z.avance}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${colorAvance(z.avance)}`} style={{ width: `${z.avance}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
