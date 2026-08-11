import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { iniciales, type ResponsableInfo } from "@/lib/equipo";
import { icono } from "@/lib/icons";
import { colorAvance, ESTILO_ESTADO, estaVencida, fechaLegible } from "@/lib/tareas";

const IconChevronDown = icono("ti-chevron-down");

export function PersonaCard({
  persona,
  proyectosPorId,
}: {
  persona: ResponsableInfo;
  proyectosPorId: Map<string, string>;
}) {
  return (
    <details className="group rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 [&::-webkit-details-marker]:hidden">
        <Avatar>
          <AvatarFallback>{iniciales(persona.nombre)}</AvatarFallback>
        </Avatar>
        <div className="min-w-[140px] flex-1">
          <p className="text-sm font-medium">{persona.nombre}</p>
          <p className="text-xs text-muted-foreground">
            {persona.tareas.length} tarea{persona.tareas.length !== 1 ? "s" : ""} asignada
            {persona.tareas.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Stat valor={persona.completadas} label="Completadas" clase="text-estado-completada" />
          <Stat
            valor={persona.vencidas}
            label="Vencidas"
            clase={persona.vencidas > 0 ? "text-estado-bloqueada" : "text-foreground"}
          />
          <Stat valor={`${persona.avancePromedio}%`} label="Avance prom." />
        </div>

        <div className="hidden w-28 sm:block">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${colorAvance(persona.avancePromedio)}`} style={{ width: `${persona.avancePromedio}%` }} />
          </div>
        </div>

        <IconChevronDown size={18} className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-3 border-t border-border pt-3">
        {persona.tareas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin tareas asignadas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Avance</TableHead>
                <TableHead>Fecha límite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {persona.tareas.map((t) => (
                <TableRow key={t.id} className={estaVencida(t) ? "bg-estado-bloqueada/5" : undefined}>
                  <TableCell>
                    <Link
                      href={`/proyectos/${t.proyectoId}/tarea/${t.id}`}
                      prefetch={false}
                      className="font-medium hover:underline"
                    >
                      {t.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {proyectosPorId.get(t.proyectoId) ?? "Proyecto eliminado"}
                  </TableCell>
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
        )}
      </div>
    </details>
  );
}

function Stat({ valor, label, clase }: { valor: string | number; label: string; clase?: string }) {
  return (
    <div className="text-center">
      <div className={`text-sm font-semibold ${clase ?? ""}`}>{valor}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
