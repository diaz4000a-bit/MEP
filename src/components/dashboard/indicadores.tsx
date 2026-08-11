import { Badge } from "@/components/ui/badge";
import type { HorasProyecto, ProgresoGrupo } from "@/lib/dashboard";
import { formatearDuracion } from "@/lib/jornadas";
import { colorAvance, ESTILO_ESTADO } from "@/lib/tareas";
import type { EstadoTarea, Proyecto } from "@/types";

export function Indicadores({
  proyectos,
  horas,
  totalTareas,
  completadas,
  promedioHorasReales,
  promedioMinutosJornada,
  porEstado,
  progresoGrupos,
}: {
  proyectos: Proyecto[];
  horas: HorasProyecto[];
  totalTareas: number;
  completadas: number;
  promedioHorasReales: number | null;
  promedioMinutosJornada: number | null;
  porEstado: { estado: EstadoTarea; n: number }[];
  progresoGrupos: ProgresoGrupo[];
}) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground">Indicadores</h2>
      <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Tarjeta titulo="Horas trabajadas por proyecto (últimos 90 días)">
          {horas.length === 0 ? (
            <SinDatos texto="Aún no hay jornadas cerradas en este rango." />
          ) : (
            <BarrasLista
              filas={horas.map((h) => ({ etiqueta: h.nombre, valor: h.minutos, texto: formatearDuracion(h.minutos) }))}
            />
          )}
        </Tarjeta>

        <Tarjeta titulo="Tareas completadas vs. pendientes">
          {totalTareas === 0 ? (
            <SinDatos texto="Aún no hay tareas creadas." />
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-estado-completada"
                    style={{ width: `${Math.round((completadas / totalTareas) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">
                  {completadas}/{totalTareas}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Horas reales / tarea completada</p>
                  <p className="font-medium">
                    {promedioHorasReales != null ? `${promedioHorasReales.toFixed(1)} h` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tiempo de jornada / tarea completada</p>
                  <p className="font-medium">
                    {promedioMinutosJornada != null ? formatearDuracion(promedioMinutosJornada) : "—"}
                  </p>
                </div>
              </div>
            </>
          )}
        </Tarjeta>

        <Tarjeta titulo="Avance por proyecto">
          {proyectos.length === 0 ? (
            <SinDatos texto="Aún no hay proyectos." />
          ) : (
            <BarrasLista
              max={100}
              filas={proyectos.map((p) => ({
                etiqueta: p.nombre,
                valor: p.avanceTotal,
                texto: `${p.avanceTotal}%`,
                color: colorAvance(p.avanceTotal),
              }))}
            />
          )}
        </Tarjeta>

        <Tarjeta titulo="Tareas por estado">
          {totalTareas === 0 ? (
            <SinDatos texto="Aún no hay tareas creadas." />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {porEstado
                .filter((e) => e.n > 0)
                .map((e) => (
                  <Badge key={e.estado} variant="secondary" className={ESTILO_ESTADO[e.estado]}>
                    {e.estado}: {e.n}
                  </Badge>
                ))}
            </div>
          )}
        </Tarjeta>

        <Tarjeta titulo="Progreso por grupo" className="lg:col-span-2">
          {progresoGrupos.every((g) => g.total === 0) ? (
            <SinDatos texto="Aún no hay tareas creadas." />
          ) : (
            <BarrasLista
              max={100}
              filas={progresoGrupos.map((g) => ({
                etiqueta: `${g.nombre} (${g.total})`,
                valor: g.avance,
                texto: `${g.avance}%`,
                color: colorAvance(g.avance),
              }))}
            />
          )}
        </Tarjeta>
      </div>
    </div>
  );
}

function Tarjeta({ titulo, children, className }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-card p-4 ring-1 ring-foreground/10 ${className ?? ""}`}>
      <h3 className="text-sm font-medium">{titulo}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SinDatos({ texto }: { texto: string }) {
  return <p className="text-sm text-muted-foreground italic">{texto}</p>;
}

function BarrasLista({
  filas,
  max,
}: {
  filas: { etiqueta: string; valor: number; texto: string; color?: string }[];
  max?: number;
}) {
  const tope = max ?? Math.max(...filas.map((f) => f.valor), 1);
  return (
    <div className="flex flex-col gap-2">
      {filas.map((f) => (
        <div key={f.etiqueta} className="flex items-center gap-2 text-sm">
          <span className="w-32 shrink-0 truncate text-muted-foreground" title={f.etiqueta}>
            {f.etiqueta}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${f.color ?? "bg-primary"}`} style={{ width: `${Math.round((f.valor / tope) * 100)}%` }} />
          </div>
          <span className="w-16 shrink-0 text-right text-xs font-semibold">{f.texto}</span>
        </div>
      ))}
    </div>
  );
}
