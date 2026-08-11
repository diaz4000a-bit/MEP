import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ETIQUETA_ROL } from "@/lib/auth/roles";
import { formatearDuracion, formatearHora } from "@/lib/jornadas";
import { ESTILO_ESTADO } from "@/lib/tareas";
import type { Jornada, Rol, Tarea } from "@/types";

export function MiEstado({
  usuario,
  proyectoActual,
  jornadaAbierta,
  minutosHoy,
  tareasPendientes,
  tareaActual,
  proyectoTareaActual,
}: {
  usuario: { nombre: string; rol: Rol };
  proyectoActual: string | null;
  jornadaAbierta: Jornada | null;
  minutosHoy: number;
  tareasPendientes: Tarea[];
  tareaActual: Tarea | null;
  proyectoTareaActual: string | null;
}) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground">Mi estado ahora</h2>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Tarjeta titulo="Usuario">
          <p className="text-sm font-medium">{usuario.nombre}</p>
          <Badge variant="secondary" className="mt-1">
            {ETIQUETA_ROL[usuario.rol]}
          </Badge>
        </Tarjeta>

        <Tarjeta titulo="Proyecto actual">
          {proyectoActual ? (
            <p className="text-sm font-medium">{proyectoActual}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Aún no registras actividad en ningún proyecto.</p>
          )}
        </Tarjeta>

        <Tarjeta titulo="Jornada">
          {jornadaAbierta ? (
            <>
              <p className="text-sm font-medium text-estado-completada">En jornada</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Desde las {formatearHora(jornadaAbierta.entrada)}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sin jornada abierta.</p>
          )}
        </Tarjeta>

        <Tarjeta titulo="Trabajado hoy">
          {minutosHoy > 0 ? (
            <p className="text-sm font-medium">{formatearDuracion(minutosHoy)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Aún no registras tiempo hoy.</p>
          )}
        </Tarjeta>

        <Tarjeta titulo="Tareas pendientes">
          <p className="text-sm font-medium">{tareasPendientes.length}</p>
          {tareasPendientes.length === 0 && <p className="mt-0.5 text-xs text-muted-foreground">Ninguna asignada.</p>}
        </Tarjeta>
      </div>

      {tareaActual && (
        <div className="mt-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h3 className="text-sm font-medium">Tarea en curso</h3>
          <Link
            href={`/proyectos/${tareaActual.proyectoId}/tarea/${tareaActual.id}`}
            className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm hover:underline"
          >
            <span>
              {tareaActual.nombre}
              {proyectoTareaActual && <span className="text-muted-foreground"> · {proyectoTareaActual}</span>}
            </span>
            <Badge variant="secondary" className={ESTILO_ESTADO[tareaActual.estado]}>
              {tareaActual.estado} · {tareaActual.porcentaje}%
            </Badge>
          </Link>
        </div>
      )}
    </div>
  );
}

function Tarjeta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
      <p className="text-xs text-muted-foreground">{titulo}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
