"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DIAS_SEMANA,
  DIAS_SEMANA_INICIAL,
  ETIQUETA_TIPO,
  diaDelMes,
  diasDeSemana,
  esFinDeSemana,
  estaVencido,
  eventosEnRango,
  finAnio,
  inicioAnio,
  matrizMes,
  mesesDelAnio,
  mismoMesQue,
  type EventoCalendario,
  type TipoEvento,
} from "@/lib/calendario";
import { fechaLegible } from "@/lib/tiempo";
import { cn } from "@/lib/utils";

/** Cuántos eventos caben en una celda del mes antes de resumir con "+N más". */
const MAX_POR_CELDA = 3;

const ESTILO_TIPO: Record<TipoEvento, string> = {
  entrega: "bg-prioridad-media/15 text-prioridad-media",
  inicio: "bg-muted text-muted-foreground",
  tarea: "bg-estado-progreso/15 text-estado-progreso",
};

const PUNTO_TIPO: Record<TipoEvento, string> = {
  entrega: "bg-prioridad-media",
  inicio: "bg-muted-foreground",
  tarea: "bg-estado-progreso",
};

/**
 * El color dice el estado, no el tipo: vencido y completado ganan siempre. Quien escanea
 * el mes necesita ver primero qué se pasó de fecha, no de qué clase era el hito.
 */
function estiloEvento(evento: EventoCalendario, hoy: string): string {
  if (evento.completado) return "bg-estado-completada/15 text-estado-completada";
  if (estaVencido(evento, hoy)) return "bg-estado-bloqueada/15 text-estado-bloqueada";
  return ESTILO_TIPO[evento.tipo];
}

function puntoEvento(evento: EventoCalendario, hoy: string): string {
  if (evento.completado) return "bg-estado-completada";
  if (estaVencido(evento, hoy)) return "bg-estado-bloqueada";
  return PUNTO_TIPO[evento.tipo];
}

/**
 * Misma paleta, más saturada: en las celdas de ~20 px de la vista de año el tinte al 15%
 * no se distingue del fondo y los días con entrega pasaban desapercibidos.
 */
const ESTILO_TIPO_FUERTE: Record<TipoEvento, string> = {
  entrega: "bg-prioridad-media/35 text-prioridad-media",
  inicio: "bg-muted-foreground/25 text-foreground",
  tarea: "bg-estado-progreso/30 text-estado-progreso",
};

function estiloEventoFuerte(evento: EventoCalendario, hoy: string): string {
  if (evento.completado) return "bg-estado-completada/30 text-estado-completada";
  if (estaVencido(evento, hoy)) return "bg-estado-bloqueada/30 text-estado-bloqueada";
  return ESTILO_TIPO_FUERTE[evento.tipo];
}

function descripcion(evento: EventoCalendario): string {
  return `${ETIQUETA_TIPO[evento.tipo]} · ${evento.proyectoNombre} · ${evento.titulo}`;
}

function eventosDe(porFecha: Map<string, EventoCalendario[]>, fecha: string): EventoCalendario[] {
  return porFecha.get(fecha) ?? [];
}

// ───────────────────────────── piezas compartidas ─────────────────────────────

/** Línea compacta para las celdas de mes y las columnas de semana. */
function EventoChip({ evento, hoy }: { evento: EventoCalendario; hoy: string }) {
  return (
    <Link
      href={evento.href}
      title={descripcion(evento)}
      className={cn(
        "flex items-center gap-1 rounded px-1.5 py-0.5 text-left text-xs transition-opacity hover:opacity-80",
        estiloEvento(evento, hoy),
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", puntoEvento(evento, hoy))} />
      <span className="truncate">{evento.tipo === "tarea" ? evento.titulo : evento.proyectoNombre}</span>
    </Link>
  );
}

/** Ficha completa para las vistas de día y semana. */
function EventoFicha({ evento, hoy }: { evento: EventoCalendario; hoy: string }) {
  const vencido = estaVencido(evento, hoy);
  return (
    <Link
      href={evento.href}
      className="flex flex-col gap-1 rounded-lg bg-card p-3 ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className={estiloEvento(evento, hoy)}>
          {ETIQUETA_TIPO[evento.tipo]}
        </Badge>
        {vencido && (
          <Badge variant="secondary" className="bg-estado-bloqueada/15 text-estado-bloqueada">
            Vencida
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{evento.estado}</span>
      </div>
      <span className="text-sm font-medium">{evento.titulo}</span>
      <span className="text-xs text-muted-foreground">
        {evento.proyectoNombre}
        {evento.responsable ? ` · ${evento.responsable}` : ""}
      </span>
    </Link>
  );
}

function SinEventos({ texto }: { texto: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{texto}</p>;
}

// ───────────────────────────────── vista día ─────────────────────────────────

export function VistaDia({
  fecha,
  porFecha,
  hoy,
}: {
  fecha: string;
  porFecha: Map<string, EventoCalendario[]>;
  hoy: string;
}) {
  const eventos = eventosDe(porFecha, fecha);
  return (
    <div className="flex flex-col gap-2">
      {eventos.length === 0 ? (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <SinEventos texto="Sin entregas ni vencimientos este día." />
        </div>
      ) : (
        eventos.map((e) => <EventoFicha key={e.id} evento={e} hoy={hoy} />)
      )}
    </div>
  );
}

// ──────────────────────────────── vista semana ────────────────────────────────

export function VistaSemana({
  ancla,
  porFecha,
  hoy,
  onDia,
}: {
  ancla: string;
  porFecha: Map<string, EventoCalendario[]>;
  hoy: string;
  onDia: (fecha: string) => void;
}) {
  const dias = diasDeSemana(ancla);
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
      {dias.map((fecha, i) => {
        const eventos = eventosDe(porFecha, fecha);
        const esHoy = fecha === hoy;
        return (
          <div
            key={fecha}
            className={cn(
              "flex min-h-[8rem] flex-col gap-1.5 rounded-lg bg-card p-2 ring-1 ring-foreground/10",
              esFinDeSemana(fecha) && "bg-muted/40",
              esHoy && "ring-2 ring-primary",
            )}
          >
            <button
              type="button"
              onClick={() => onDia(fecha)}
              className="flex items-baseline justify-between rounded px-1 text-left hover:bg-muted/50"
            >
              <span className="text-xs text-muted-foreground capitalize">{DIAS_SEMANA[i]}</span>
              <span className={cn("text-sm font-medium", esHoy && "text-primary")}>{diaDelMes(fecha)}</span>
            </button>
            <div className="flex flex-col gap-1">
              {eventos.map((e) => (
                <EventoChip key={e.id} evento={e} hoy={hoy} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────────────── vista mes ─────────────────────────────────

export function VistaMes({
  ancla,
  porFecha,
  hoy,
  onDia,
}: {
  ancla: string;
  porFecha: Map<string, EventoCalendario[]>;
  hoy: string;
  onDia: (fecha: string) => void;
}) {
  const semanas = matrizMes(ancla);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[44rem]">
        <div className="grid grid-cols-7 gap-1 pb-1">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="px-1 text-xs font-medium text-muted-foreground capitalize">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {semanas.flat().map((fecha) => {
            const eventos = eventosDe(porFecha, fecha);
            const visibles = eventos.slice(0, MAX_POR_CELDA);
            const resto = eventos.length - visibles.length;
            const delMes = mismoMesQue(fecha, ancla);
            const esHoy = fecha === hoy;
            return (
              <div
                key={fecha}
                className={cn(
                  "flex min-h-[5.5rem] flex-col gap-1 rounded-lg bg-card p-1.5 ring-1 ring-foreground/10",
                  !delMes && "bg-muted/30",
                  esFinDeSemana(fecha) && delMes && "bg-muted/40",
                  esHoy && "ring-2 ring-primary",
                )}
              >
                <button
                  type="button"
                  onClick={() => onDia(fecha)}
                  aria-label={`Ver ${fechaLegible(fecha)}`}
                  className={cn(
                    "self-start rounded px-1 text-xs font-medium hover:bg-muted/60",
                    !delMes && "text-muted-foreground/60",
                    esHoy && "bg-primary text-primary-foreground hover:bg-primary",
                  )}
                >
                  {diaDelMes(fecha)}
                </button>
                {visibles.map((e) => (
                  <EventoChip key={e.id} evento={e} hoy={hoy} />
                ))}
                {resto > 0 && (
                  <button
                    type="button"
                    onClick={() => onDia(fecha)}
                    className="px-1.5 text-left text-xs text-muted-foreground hover:text-foreground"
                  >
                    +{resto} más
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────── vista año ─────────────────────────────────

export function VistaAnio({
  ancla,
  porFecha,
  eventos,
  hoy,
  onDia,
  onMes,
}: {
  ancla: string;
  porFecha: Map<string, EventoCalendario[]>;
  eventos: EventoCalendario[];
  hoy: string;
  onDia: (fecha: string) => void;
  onMes: (fecha: string) => void;
}) {
  const meses = mesesDelAnio(ancla);
  const entregas = eventosEnRango(eventos, inicioAnio(ancla), finAnio(ancla)).filter((e) => e.tipo === "entrega");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {meses.map(({ mes, nombre, semanas }) => (
          <div key={mes} className="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
            <button
              type="button"
              onClick={() => onMes(mes)}
              className="mb-2 w-full rounded px-1 text-left text-sm font-medium hover:bg-muted/50"
            >
              {nombre}
            </button>
            <div className="grid grid-cols-7 gap-0.5">
              {DIAS_SEMANA_INICIAL.map((d, i) => (
                <span key={i} className="text-center text-[10px] text-muted-foreground">
                  {d}
                </span>
              ))}
              {semanas.flat().map((fecha) => {
                const delMes = mismoMesQue(fecha, mes);
                const delDia = delMes ? eventosDe(porFecha, fecha) : [];
                // Con varios eventos el mismo día manda la entrega: es el hito que no se
                // puede perder de vista en una celda de 20 píxeles.
                const principal = delDia.find((e) => e.tipo === "entrega") ?? delDia[0];
                return (
                  <button
                    key={fecha}
                    type="button"
                    onClick={() => onDia(fecha)}
                    disabled={!delMes}
                    title={delDia.length > 0 ? delDia.map(descripcion).join("\n") : undefined}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded text-[11px] transition-colors",
                      delMes ? "hover:bg-muted" : "invisible",
                      principal && fecha !== hoy && cn("font-medium", estiloEventoFuerte(principal, hoy)),
                      fecha === hoy && "bg-primary font-medium text-primary-foreground hover:bg-primary",
                    )}
                  >
                    {diaDelMes(fecha)}
                    {delDia.length > 1 && (
                      <span className="absolute right-0.5 bottom-0.5 size-1 rounded-full bg-current opacity-70" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <h3 className="text-sm font-medium">Entregas de {ancla.slice(0, 4)}</h3>
        {entregas.length === 0 ? (
          <SinEventos texto="Ningún proyecto tiene fecha de entrega en este año." />
        ) : (
          <div className="mt-2 flex flex-col gap-1.5">
            {entregas.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
              >
                <Link href={e.href} className="flex items-center gap-2 hover:underline">
                  <span className={cn("size-1.5 shrink-0 rounded-full", puntoEvento(e, hoy))} />
                  {e.proyectoNombre}
                </Link>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {e.estado}
                  <button
                    type="button"
                    onClick={() => onDia(e.fecha)}
                    className="rounded px-1 underline-offset-2 hover:underline"
                  >
                    {fechaLegible(e.fecha)}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
