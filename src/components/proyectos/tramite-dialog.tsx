"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { actualizarTramite, crearTramite } from "@/app/(app)/proyectos/tramites-actions";
import { ESTADOS_TRAMITE, FICHAS_TRAMITE, TIPOS_TRAMITE } from "@/content/tramites";
import { fechaLimiteSugerida } from "@/lib/tramites";
import { fechaBogota } from "@/lib/tiempo";
import type { EstadoTramite, TipoTramite, Tramite } from "@/types";

interface Responsable {
  label: string;
  uid: string | null;
}

const TIPO_POR_DEFECTO: TipoTramite = "Disponibilidad de servicio";

export function TramiteDialog({
  open,
  onOpenChange,
  proyectoId,
  tramite,
  responsablesDisponibles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyectoId: string;
  tramite?: Tramite;
  responsablesDisponibles: Responsable[];
}) {
  const editando = !!tramite;
  const [pending, startTransition] = useTransition();

  const [tipo, setTipo] = useState<TipoTramite>(tramite?.tipo ?? TIPO_POR_DEFECTO);
  const [nombre, setNombre] = useState(tramite?.nombre ?? TIPO_POR_DEFECTO);
  const [entidad, setEntidad] = useState(tramite?.entidad ?? FICHAS_TRAMITE[TIPO_POR_DEFECTO].entidad);
  const [radicado, setRadicado] = useState(tramite?.radicado ?? "");
  const [estado, setEstado] = useState<EstadoTramite>(tramite?.estado ?? "Sin iniciar");
  const [responsable, setResponsable] = useState(tramite?.responsable ?? "");
  const [responsableUid, setResponsableUid] = useState<string | null>(tramite?.responsableUid ?? null);
  const [fechaRadicacion, setFechaRadicacion] = useState(tramite?.fechaRadicacion ?? "");
  const [fechaLimite, setFechaLimite] = useState(tramite?.fechaLimite ?? "");
  const [fechaResolucion, setFechaResolucion] = useState(tramite?.fechaResolucion ?? "");
  const [costo, setCosto] = useState(String(tramite?.costo ?? 0));
  const [notas, setNotas] = useState(tramite?.notas ?? "");

  const ficha = FICHAS_TRAMITE[tipo];
  const cerrado = estado === "Aprobado" || estado === "Rechazado";
  const exigeRadicacion = estado !== "Sin iniciar" && estado !== "En preparación";

  /**
   * Cambiar el tipo reescribe nombre y entidad SOLO si seguían siendo los del tipo anterior.
   * Así el formulario ayuda a quien va rápido sin pisar el texto de quien ya lo personalizó.
   */
  const cambiarTipo = (valor: TipoTramite) => {
    const anterior = FICHAS_TRAMITE[tipo];
    if (!nombre.trim() || nombre === tipo) setNombre(valor);
    if (!entidad.trim() || entidad === anterior.entidad) setEntidad(FICHAS_TRAMITE[valor].entidad);
    if (fechaRadicacion && !fechaLimite) setFechaLimite(fechaLimiteSugerida(valor, fechaRadicacion));
    setTipo(valor);
  };

  const cambiarFechaRadicacion = (valor: string) => {
    setFechaRadicacion(valor);
    if (valor && !fechaLimite) setFechaLimite(fechaLimiteSugerida(tipo, valor));
  };

  const cambiarEstado = (valor: EstadoTramite) => {
    setEstado(valor);
    // Marcar "Radicado" sin haber puesto la fecha es el caso normal: se acaba de radicar hoy.
    // El servidor la exige igualmente, así que se rellena aquí en vez de rebotar un error.
    if (valor !== "Sin iniciar" && valor !== "En preparación" && !fechaRadicacion) {
      cambiarFechaRadicacion(fechaBogota());
    }
    if ((valor === "Aprobado" || valor === "Rechazado") && !fechaResolucion) setFechaResolucion(fechaBogota());
  };

  const cambiarResponsable = (label: string) => {
    setResponsable(label);
    setResponsableUid(responsablesDisponibles.find((r) => r.label === label)?.uid ?? null);
  };

  const sugerirFechaLimite = () => {
    const sugerida = fechaLimiteSugerida(tipo, fechaRadicacion || fechaBogota());
    if (!sugerida) {
      toast.error(`El tipo ${tipo} no tiene plazo de referencia; escribe la fecha a mano.`);
      return;
    }
    setFechaLimite(sugerida);
  };

  const guardar = () => {
    if (!nombre.trim()) {
      toast.error("El nombre del trámite es obligatorio.");
      return;
    }
    if (exigeRadicacion && !fechaRadicacion) {
      toast.error(`Un trámite en estado ${estado} necesita fecha de radicación.`);
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      tipo,
      entidad: entidad.trim(),
      radicado: radicado.trim(),
      estado,
      responsableUid,
      responsable: responsable.trim(),
      fechaRadicacion,
      fechaLimite,
      fechaResolucion: cerrado ? fechaResolucion : "",
      costo: Number(costo) || 0,
      notas: notas.trim(),
    };

    startTransition(async () => {
      try {
        if (editando) await actualizarTramite(proyectoId, tramite.id, datos);
        else await crearTramite(proyectoId, datos);
        onOpenChange(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar el trámite.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar trámite" : "Nuevo trámite"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="tr-tipo">Tipo de trámite</Label>
            <Select value={tipo} onValueChange={(v) => v && cambiarTipo(v as TipoTramite)}>
              <SelectTrigger id="tr-tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_TRAMITE.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {ficha.descripcion && <p className="text-xs text-muted-foreground">{ficha.descripcion}</p>}
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="tr-nombre">Nombre del trámite *</Label>
            <Input id="tr-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tr-entidad">Entidad</Label>
            <Input
              id="tr-entidad"
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              placeholder="Ej: EPM, Curaduría Urbana 2…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tr-radicado">Número de radicado</Label>
            <Input
              id="tr-radicado"
              value={radicado}
              onChange={(e) => setRadicado(e.target.value)}
              placeholder="El que devolvió la entidad"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tr-estado">Estado</Label>
            <Select value={estado} onValueChange={(v) => v && cambiarEstado(v as EstadoTramite)}>
              <SelectTrigger id="tr-estado" className="w-full">
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
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tr-responsable">Responsable del seguimiento</Label>
            <Select value={responsable} onValueChange={(v) => v && cambiarResponsable(v)}>
              <SelectTrigger id="tr-responsable" className="w-full">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                {responsablesDisponibles.map((r) => (
                  <SelectItem key={r.label} value={r.label}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tr-radicacion">Fecha de radicación{exigeRadicacion ? " *" : ""}</Label>
            <Input
              id="tr-radicacion"
              type="date"
              value={fechaRadicacion}
              onChange={(e) => cambiarFechaRadicacion(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tr-limite">Fecha comprometida de respuesta</Label>
            <div className="flex gap-2">
              <Input
                id="tr-limite"
                type="date"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={sugerirFechaLimite}>
                Sugerir
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {ficha.diasRespuesta > 0
                ? `Plazo de referencia: ${ficha.diasRespuesta} días. Manda la fecha del acuse de radicado.`
                : "Es la fecha que gobierna el semáforo de la sección."}
            </p>
          </div>

          {cerrado && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tr-resolucion">Fecha de resolución</Label>
              <Input
                id="tr-resolucion"
                type="date"
                value={fechaResolucion}
                onChange={(e) => setFechaResolucion(e.target.value)}
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tr-costo">Costo del trámite (COP)</Label>
            <Input
              id="tr-costo"
              type="number"
              min={0}
              step={1000}
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="tr-notas">Notas</Label>
            <Textarea
              id="tr-notas"
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones de la entidad, documentos pendientes, contacto…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={pending}>
            {pending ? "Guardando…" : "Guardar trámite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
