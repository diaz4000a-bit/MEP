"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { actualizarEstadoTramite, eliminarTramite } from "@/app/(app)/proyectos/tramites-actions";
import { TramiteDialog } from "@/components/proyectos/tramite-dialog";
import { TramitesTorta } from "@/components/proyectos/tramites-torta";
import { ESTADOS_TRAMITE } from "@/content/tramites";
import { fechaLegible } from "@/lib/tiempo";
import {
  COLOR_SEMAFORO,
  contarPorSemaforo,
  DIAS_ALERTA_TRAMITE,
  diasRestantes,
  esTramiteCerrado,
  ESTILO_ESTADO_TRAMITE,
  ETIQUETA_SEMAFORO,
  motivoSemaforo,
  semaforoProyecto,
  semaforoTramite,
  TEXTO_SEMAFORO,
  type Semaforo,
} from "@/lib/tramites";
import type { EstadoTramite, Tramite } from "@/types";

interface Responsable {
  label: string;
  uid: string | null;
}

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/**
 * Sección de trámites del proyecto: la gestión que NO depende de horas de modelado sino de
 * un tercero (operador de red, curaduría, organismo de inspección).
 *
 * Vive aparte de las tareas a propósito. Un trámite radicado no "avanza" un 10% por semana:
 * está esperando, y lo único que importa de él es si va a llegar a tiempo. Por eso su
 * indicador es un semáforo y no una barra de progreso.
 */
export function TramitesCard({
  proyectoId,
  tramites,
  responsablesDisponibles,
  puedeGestionar,
}: {
  proyectoId: string;
  tramites: Tramite[];
  responsablesDisponibles: Responsable[];
  /** Espeja el permiso `gestionarTramites` que exigen las Server Actions en el servidor. */
  puedeGestionar: boolean;
}) {
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Tramite | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  const semaforo = semaforoProyecto(tramites);
  const conteo = contarPorSemaforo(tramites);
  const abiertos = tramites.filter((t) => !esTramiteCerrado(t));
  const costoTotal = tramites.reduce((s, t) => s + (Number(t.costo) || 0), 0);

  // El peor primero: rojo arriba, y dentro del mismo color el que vence antes. Es el orden
  // en que hay que llamar a las entidades, que es para lo que se abre esta tabla.
  const orden: Semaforo[] = ["rojo", "amarillo", "verde"];
  const ordenados = [...tramites].sort((a, b) => {
    const porColor = orden.indexOf(semaforoTramite(a)) - orden.indexOf(semaforoTramite(b));
    if (porColor !== 0) return porColor;
    return (a.fechaLimite || "9999-12-31").localeCompare(b.fechaLimite || "9999-12-31");
  });

  const abrirNuevo = () => {
    setEnEdicion(undefined);
    setDialogAbierto(true);
  };

  const abrirEdicion = (t: Tramite) => {
    setEnEdicion(t);
    setDialogAbierto(true);
  };

  const cambiarEstado = (t: Tramite, estado: EstadoTramite) => {
    if (estado === t.estado) return;
    startTransition(async () => {
      try {
        await actualizarEstadoTramite(proyectoId, t.id, estado);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cambiar el estado del trámite.");
      }
    });
  };

  const eliminar = (t: Tramite) => {
    if (!confirm(`¿Eliminar el trámite "${t.nombre}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      try {
        await eliminarTramite(proyectoId, t.id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar el trámite.");
      }
    });
  };

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Trámites y permisos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión ante terceros: operador de red, curaduría, organismos de inspección y bomberos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SemaforoTramites estado={semaforo} />
          {puedeGestionar && (
            <Button size="sm" onClick={abrirNuevo} disabled={pending}>
              Nuevo trámite
            </Button>
          )}
        </div>
      </div>

      <p className={`mt-2 text-sm ${semaforo ? TEXTO_SEMAFORO[semaforo] : "text-muted-foreground"}`}>
        {motivoSemaforo(tramites)}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <TramitesTorta tramites={tramites} />
          {tramites.length > 0 && (
            <dl className="grid grid-cols-3 gap-2 text-center">
              <Resumen etiqueta="Abiertos" valor={String(abiertos.length)} />
              <Resumen etiqueta="En riesgo" valor={String(conteo.amarillo + conteo.rojo)} />
              <Resumen etiqueta="Costo" valor={COP.format(costoTotal)} />
            </dl>
          )}
        </div>

        {ordenados.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {puedeGestionar
              ? "Sin trámites registrados. Empieza por la disponibilidad de servicio ante el operador de red."
              : "Sin trámites registrados en este proyecto."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" aria-label="Semáforo" />
                  <TableHead>Trámite</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Responsable</TableHead>
                  {puedeGestionar && <TableHead className="w-24 text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordenados.map((t) => (
                  <FilaTramite
                    key={t.id}
                    tramite={t}
                    puedeGestionar={puedeGestionar}
                    pending={pending}
                    onEstado={(estado) => cambiarEstado(t, estado)}
                    onEditar={() => abrirEdicion(t)}
                    onEliminar={() => eliminar(t)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {puedeGestionar && dialogAbierto && (
        <TramiteDialog
          // Remontar el diálogo por trámite: sus campos son estado local inicializado en el
          // primer render, así que reutilizar la instancia mostraba los datos del anterior.
          key={enEdicion?.id ?? "nuevo"}
          open={dialogAbierto}
          onOpenChange={setDialogAbierto}
          proyectoId={proyectoId}
          tramite={enEdicion}
          responsablesDisponibles={responsablesDisponibles}
        />
      )}
    </div>
  );
}

function Resumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border p-2">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="truncate text-sm font-semibold" title={valor}>
        {valor}
      </dd>
    </div>
  );
}

/** Semáforo de tres luces: solo se enciende la que aplica, las otras quedan apagadas. */
function SemaforoTramites({ estado }: { estado: Semaforo | null }) {
  const luces: Semaforo[] = ["rojo", "amarillo", "verde"];
  const etiqueta = estado ? ETIQUETA_SEMAFORO[estado] : "Sin trámites";

  return (
    <div className="flex items-center gap-2" role="status" aria-label={`Estado de los trámites: ${etiqueta}`}>
      <div className="flex items-center gap-1 rounded-full bg-muted px-1.5 py-1" aria-hidden="true">
        {luces.map((luz) => (
          <span
            key={luz}
            className={`size-2.5 rounded-full ${luz === estado ? COLOR_SEMAFORO[luz] : "bg-foreground/15"}`}
          />
        ))}
      </div>
      <span className={`text-sm font-medium ${estado ? TEXTO_SEMAFORO[estado] : "text-muted-foreground"}`}>
        {etiqueta}
      </span>
    </div>
  );
}

function FilaTramite({
  tramite,
  puedeGestionar,
  pending,
  onEstado,
  onEditar,
  onEliminar,
}: {
  tramite: Tramite;
  puedeGestionar: boolean;
  pending: boolean;
  onEstado: (estado: EstadoTramite) => void;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const color = semaforoTramite(tramite);
  const dias = diasRestantes(tramite);

  return (
    <TableRow>
      <TableCell>
        <span
          className={`block size-2.5 rounded-full ${COLOR_SEMAFORO[color]}`}
          title={ETIQUETA_SEMAFORO[color]}
          aria-label={ETIQUETA_SEMAFORO[color]}
          role="img"
        />
      </TableCell>
      <TableCell>
        <span className="font-medium">{tramite.nombre}</span>
        <span className="block text-xs text-muted-foreground">
          {tramite.entidad || "Sin entidad"}
          {tramite.radicado ? ` · Radicado ${tramite.radicado}` : ""}
        </span>
      </TableCell>
      <TableCell>
        {puedeGestionar ? (
          <Select
            value={tramite.estado}
            onValueChange={(v) => v && onEstado(v as EstadoTramite)}
            disabled={pending}
          >
            <SelectTrigger className="h-8 w-40" aria-label={`Estado de ${tramite.nombre}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_TRAMITE.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge className={ESTILO_ESTADO_TRAMITE[tramite.estado]} variant="secondary">
            {tramite.estado}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <VencimientoTramite tramite={tramite} dias={dias} />
      </TableCell>
      <TableCell className="text-sm">{tramite.responsable || "—"}</TableCell>
      {puedeGestionar && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={onEditar} disabled={pending}>
              Editar
            </Button>
            <button
              onClick={onEliminar}
              disabled={pending}
              className="px-1 text-muted-foreground hover:text-estado-bloqueada disabled:opacity-50"
              aria-label={`Eliminar el trámite ${tramite.nombre}`}
              title="Eliminar trámite"
            >
              ✕
            </button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

/** Fecha comprometida + cuánto falta. El número de días es lo que se lee de un vistazo. */
function VencimientoTramite({ tramite, dias }: { tramite: Tramite; dias: number | null }) {
  if (esTramiteCerrado(tramite)) {
    return (
      <span className="text-sm text-muted-foreground">
        Resuelto {tramite.fechaResolucion ? fechaLegible(tramite.fechaResolucion) : ""}
      </span>
    );
  }
  if (dias === null) {
    return <span className="text-sm text-prioridad-media">Sin fecha comprometida</span>;
  }

  const critico = dias < 0;
  const proximo = dias <= DIAS_ALERTA_TRAMITE;
  const texto = critico
    ? `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? "" : "s"}`
    : dias === 0
      ? "Vence hoy"
      : `Faltan ${dias} día${dias === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col">
      <span className="text-sm">{fechaLegible(tramite.fechaLimite)}</span>
      <span
        className={`text-xs ${
          critico ? "text-estado-bloqueada" : proximo ? "text-prioridad-media" : "text-muted-foreground"
        }`}
      >
        {texto}
      </span>
    </div>
  );
}
