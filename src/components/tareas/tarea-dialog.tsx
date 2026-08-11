"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { actualizarTarea, crearTarea } from "@/app/(app)/proyectos/actions";
import { CATEGORIAS } from "@/content/categorias";
import { GRUPOS } from "@/content/grupos";
import type { Categoria, EstadoTarea, GrupoId, Prioridad, Tarea } from "@/types";

const ESTADOS: EstadoTarea[] = ["Sin iniciar", "En progreso", "En revisión", "Completada", "Bloqueada"];
const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"];
const SIN_ZONA = "__sin_zona__";

interface Responsable {
  label: string;
  uid: string | null;
}

export function TareaDialog({
  open,
  onOpenChange,
  proyectoId,
  tarea,
  zonaPreset,
  zonasDisponibles,
  etapasDisponibles,
  responsablesDisponibles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyectoId: string;
  tarea?: Tarea;
  /** Zona con la que arranca una tarea NUEVA (p. ej. al crear desde la vista de una zona). */
  zonaPreset?: string;
  zonasDisponibles: string[];
  etapasDisponibles: string[];
  responsablesDisponibles: Responsable[];
}) {
  const editando = !!tarea;
  const [pending, startTransition] = useTransition();

  const [nombre, setNombre] = useState(tarea?.nombre ?? "");
  const [grupo, setGrupo] = useState<GrupoId>(tarea?.grupo ?? "01-gestion");
  const [subgrupo, setSubgrupo] = useState(tarea?.subgrupo ?? "");
  const [zona, setZona] = useState(tarea?.zona ?? zonaPreset ?? "");
  const [etapa, setEtapa] = useState(tarea?.etapa ?? "");
  const [categoria, setCategoria] = useState<Categoria>(tarea?.categoria ?? "Modelado");
  const [responsable, setResponsable] = useState(tarea?.responsable ?? "");
  const [responsableUid, setResponsableUid] = useState<string | null>(tarea?.responsableUid ?? null);
  const [prioridad, setPrioridad] = useState<Prioridad>(tarea?.prioridad ?? "Media");
  const [estado, setEstado] = useState<EstadoTarea>(tarea?.estado ?? "Sin iniciar");
  const [bloqueadoPor, setBloqueadoPor] = useState(tarea?.bloqueadoPor ?? "");
  const [porcentaje, setPorcentaje] = useState(tarea?.porcentaje ?? 0);
  const [fechaInicio, setFechaInicio] = useState(tarea?.fechaInicio ?? "");
  const [fechaLimite, setFechaLimite] = useState(tarea?.fechaLimite ?? "");
  const [horasEstimadas, setHorasEstimadas] = useState(tarea?.horasEstimadas ?? 8);
  const [horasReales, setHorasReales] = useState(tarea?.horasReales ?? 0);
  const [comentarios, setComentarios] = useState(tarea?.comentarios ?? "");

  const cambiarEstado = (v: EstadoTarea) => {
    setEstado(v);
    if (v === "Completada") setPorcentaje(100);
  };

  const cambiarResponsable = (label: string) => {
    setResponsable(label);
    setResponsableUid(responsablesDisponibles.find((r) => r.label === label)?.uid ?? null);
  };

  const guardar = () => {
    if (!nombre.trim()) return toast.error("El nombre de la tarea es obligatorio.");
    if (!responsable.trim()) return toast.error("El responsable es obligatorio.");
    if (estado === "Bloqueada" && !bloqueadoPor.trim()) return toast.error('Indica qué bloquea la tarea.');

    const datos = {
      nombre: nombre.trim(),
      grupo,
      subgrupo,
      zona: zona || null,
      etapa: etapa.trim() || null,
      categoria,
      responsableUid,
      responsable: responsable.trim(),
      prioridad,
      estado,
      porcentaje,
      fechaInicio,
      fechaLimite,
      horasEstimadas: Number(horasEstimadas) || 0,
      horasReales: Number(horasReales) || 0,
      comentarios: comentarios.trim(),
      bloqueadoPor: estado === "Bloqueada" ? bloqueadoPor.trim() : "",
    };

    startTransition(async () => {
      try {
        if (editando) await actualizarTarea(proyectoId, tarea.id, datos);
        else await crearTarea(proyectoId, datos);
        onOpenChange(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar la tarea.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="t-nombre">Nombre de la tarea *</Label>
            <Input id="t-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Grupo</Label>
            <Select
              value={grupo}
              items={Object.fromEntries(GRUPOS.map((g) => [g.id, g.nombre]))}
              onValueChange={(v) => {
                setGrupo(v as GrupoId);
                setSubgrupo("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRUPOS.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Subgrupo</Label>
            <Select value={subgrupo} onValueChange={(v) => setSubgrupo(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                {(GRUPOS.find((g) => g.id === grupo)?.subgrupos ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Zona / Modelo</Label>
            <Select
              value={zona || SIN_ZONA}
              items={{ [SIN_ZONA]: "— Sin zona —", ...Object.fromEntries(zonasDisponibles.map((z) => [z, z])) }}
              onValueChange={(v) => setZona(!v || v === SIN_ZONA ? "" : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_ZONA}>— Sin zona —</SelectItem>
                {zonasDisponibles.map((z) => (
                  <SelectItem key={z} value={z}>
                    {z}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Categoría</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-etapa">Etapa</Label>
            <Input
              id="t-etapa"
              list="dl-etapas"
              placeholder="Ej: 2.1 Anteproyecto"
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
            />
            <datalist id="dl-etapas">
              {etapasDisponibles.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Responsable *</Label>
            <Select value={responsable} onValueChange={(v) => v && cambiarResponsable(v)}>
              <SelectTrigger className="w-full">
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
            <Label>Prioridad</Label>
            <Select value={prioridad} onValueChange={(v) => setPrioridad(v as Prioridad)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORIDADES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={(v) => cambiarEstado(v as EstadoTarea)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {estado === "Bloqueada" && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="t-bloqueado" className="text-estado-bloqueada">
                Bloqueado por *
              </Label>
              <Input
                id="t-bloqueado"
                placeholder="¿Qué bloquea esta tarea? Ej: pendiente modelo HVAC"
                value={bloqueadoPor}
                onChange={(e) => setBloqueadoPor(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Porcentaje de avance</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[porcentaje]}
                onValueChange={(v) => setPorcentaje(Array.isArray(v) ? v[0] : v)}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="w-12 text-right text-sm font-semibold">{porcentaje}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-finicio">Fecha de inicio</Label>
            <Input id="t-finicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-flimite">Fecha límite</Label>
            <Input id="t-flimite" type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-hest">Horas estimadas</Label>
            <Input
              id="t-hest"
              type="number"
              min={0}
              step={0.5}
              value={horasEstimadas}
              onChange={(e) => setHorasEstimadas(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-hreal">Horas reales</Label>
            <Input
              id="t-hreal"
              type="number"
              min={0}
              step={0.5}
              value={horasReales}
              onChange={(e) => setHorasReales(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="t-comentarios">Comentarios</Label>
            <Textarea
              id="t-comentarios"
              rows={3}
              placeholder="Observaciones, acuerdos, referencias de planos..."
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={pending}>
            {pending ? "Guardando…" : "Guardar tarea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
