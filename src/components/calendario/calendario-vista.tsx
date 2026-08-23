"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { VistaAnio, VistaDia, VistaMes, VistaSemana } from "@/components/calendario/vistas-calendario";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ETIQUETA_TIPO_CORTA,
  ETIQUETA_VISTA,
  TIPOS_EVENTO,
  VISTAS,
  agruparPorFecha,
  desplazar,
  estaVencido,
  eventosEnRango,
  filtrarEventos,
  inicioMes,
  rangoVista,
  tituloVista,
  type EventoCalendario,
  type TipoEvento,
  type VistaCalendario,
} from "@/lib/calendario";
import { cn } from "@/lib/utils";

const TODOS = "__todos__";

const ESTILO_TIPO_ACTIVO: Record<TipoEvento, string> = {
  entrega: "bg-prioridad-media/15 text-prioridad-media hover:bg-prioridad-media/20",
  inicio: "bg-muted text-foreground hover:bg-muted",
  tarea: "bg-estado-progreso/15 text-estado-progreso hover:bg-estado-progreso/20",
};

interface ProyectoOpcion {
  id: string;
  nombre: string;
}

/**
 * Toda la navegación (vista, mes, filtros) es estado de cliente: los eventos completos ya
 * vienen en el primer render, así que cambiar de mes no necesita volver al servidor. La URL
 * se mantiene al día con `replaceState` para poder compartir un enlace, pero sin provocar
 * navegación ni un nuevo escaneo de Firestore.
 */
export function CalendarioVista({
  eventos,
  proyectos,
  hoy,
  vistaInicial,
  fechaInicial,
  proyectoInicial,
}: {
  eventos: EventoCalendario[];
  proyectos: ProyectoOpcion[];
  hoy: string;
  vistaInicial: VistaCalendario;
  fechaInicial: string;
  proyectoInicial: string;
}) {
  const [vista, setVista] = useState<VistaCalendario>(vistaInicial);
  const [ancla, setAncla] = useState(fechaInicial);
  const [proyectoId, setProyectoId] = useState(proyectoInicial);
  const [tipos, setTipos] = useState<TipoEvento[]>(TIPOS_EVENTO);

  useEffect(() => {
    const params = new URLSearchParams({ vista, fecha: ancla });
    if (proyectoId) params.set("proyecto", proyectoId);
    if (tipos.length !== TIPOS_EVENTO.length) params.set("tipos", tipos.join(","));
    window.history.replaceState(null, "", `/calendario?${params.toString()}`);
  }, [vista, ancla, proyectoId, tipos]);

  const filtrados = useMemo(() => filtrarEventos(eventos, { proyectoId, tipos }), [eventos, proyectoId, tipos]);
  const porFecha = useMemo(() => agruparPorFecha(filtrados), [filtrados]);

  const { desde, hasta } = rangoVista(vista, ancla);
  const enRango = useMemo(() => eventosEnRango(filtrados, desde, hasta), [filtrados, desde, hasta]);
  const entregasEnRango = enRango.filter((e) => e.tipo === "entrega").length;
  const vencidasEnRango = enRango.filter((e) => estaVencido(e, hoy)).length;

  const irADia = (fecha: string) => {
    setAncla(fecha);
    setVista("dia");
  };

  const irAMes = (fecha: string) => {
    setAncla(inicioMes(fecha));
    setVista("mes");
  };

  // Nunca se dejan los tres tipos apagados: un calendario en blanco sin motivo visible
  // se lee como un error de carga. El último tipo activo no se puede quitar.
  const alternarTipo = (tipo: TipoEvento) => {
    setTipos((actuales) => {
      if (!actuales.includes(tipo)) return [...actuales, tipo];
      return actuales.length === 1 ? actuales : actuales.filter((t) => t !== tipo);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Anterior"
            onClick={() => setAncla(desplazar(vista, ancla, -1))}
          >
            <IconChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Siguiente"
            onClick={() => setAncla(desplazar(vista, ancla, 1))}
          >
            <IconChevronRight size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAncla(hoy)}>
            Hoy
          </Button>
          <h2 className="ml-2 text-base font-medium">{tituloVista(vista, ancla)}</h2>
        </div>

        <Tabs value={vista} onValueChange={(v) => setVista(v as VistaCalendario)}>
          <TabsList>
            {VISTAS.map((v) => (
              <TabsTrigger key={v} value={v}>
                {ETIQUETA_VISTA[v]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={proyectoId || TODOS}
          items={{
            [TODOS]: "Proyecto: todos",
            ...Object.fromEntries(proyectos.map((p) => [p.id, p.nombre])),
          }}
          onValueChange={(v) => setProyectoId(!v || v === TODOS ? "" : String(v))}
        >
          <SelectTrigger size="sm" className="min-w-[180px]">
            <SelectValue placeholder="Proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Proyecto: todos</SelectItem>
            {proyectos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-1">
          {TIPOS_EVENTO.map((tipo) => {
            const activo = tipos.includes(tipo);
            return (
              <Button
                key={tipo}
                type="button"
                size="sm"
                variant="outline"
                aria-pressed={activo}
                onClick={() => alternarTipo(tipo)}
                className={cn(activo ? ESTILO_TIPO_ACTIVO[tipo] : "text-muted-foreground opacity-60")}
              >
                {ETIQUETA_TIPO_CORTA[tipo]}
              </Button>
            );
          })}
        </div>

        <span className="ml-auto text-xs text-muted-foreground">
          {enRango.length} evento{enRango.length === 1 ? "" : "s"} · {entregasEnRango} entrega
          {entregasEnRango === 1 ? "" : "s"}
          {vencidasEnRango > 0 && <span className="text-estado-bloqueada"> · {vencidasEnRango} vencido(s)</span>}
        </span>
      </div>

      {vista === "dia" && <VistaDia fecha={ancla} porFecha={porFecha} hoy={hoy} />}
      {vista === "semana" && <VistaSemana ancla={ancla} porFecha={porFecha} hoy={hoy} onDia={irADia} />}
      {vista === "mes" && <VistaMes ancla={ancla} porFecha={porFecha} hoy={hoy} onDia={irADia} />}
      {vista === "anio" && (
        <VistaAnio ancla={ancla} porFecha={porFecha} eventos={filtrados} hoy={hoy} onDia={irADia} onMes={irAMes} />
      )}
    </div>
  );
}
