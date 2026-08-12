"use client";

import { IconChevronRight } from "@tabler/icons-react";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { actualizarEstadoTarea, actualizarVerificacion, eliminarTarea } from "@/app/(app)/proyectos/actions";
import { Seccion, SeccionLista, SinDato } from "@/components/contenido/seccion-card";
import { db } from "@/lib/firebase/client";
import { colorAvance, ESTILO_ESTADO, ESTILO_PRIORIDAD, fechaHoraLegible, fechaLegible } from "@/lib/tareas";
import type { ContenidoTarea } from "@/lib/contenido";
import type { EstadoTarea, Tarea } from "@/types";
import { TareaDialog } from "./tarea-dialog";

const ESTADOS: EstadoTarea[] = ["Sin iniciar", "En progreso", "En revisión", "Completada", "Bloqueada"];

interface Responsable {
  label: string;
  uid: string | null;
}
interface Dependencia {
  plantillaId: string;
  nombre: string;
  tareaId: string | null;
}
interface LeccionRef {
  id: string;
  titulo: string;
  modulo: string;
}

export function FichaTarea({
  proyecto,
  tarea: tareaInicial,
  contenido,
  dificultad,
  nombreOriginal,
  dependencias,
  lecciones,
  zonasDisponibles,
  etapasDisponibles,
  responsablesDisponibles,
  puedeEditar,
  puedeEditarAjena,
  puedeEliminar,
}: {
  proyecto: { id: string; nombre: string };
  tarea: Tarea;
  contenido: ContenidoTarea;
  dificultad?: 1 | 2 | 3 | 4 | 5;
  nombreOriginal?: string;
  dependencias: Dependencia[];
  lecciones: LeccionRef[];
  zonasDisponibles: string[];
  etapasDisponibles: string[];
  responsablesDisponibles: Responsable[];
  puedeEditar: boolean;
  puedeEditarAjena: boolean;
  puedeEliminar: boolean;
}) {
  const router = useRouter();
  const [tarea, setTarea] = useState(tareaInicial);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [dialogGen, setDialogGen] = useState(0);
  const [pending, startTransition] = useTransition();

  const [estado, setEstado] = useState<EstadoTarea>(tareaInicial.estado);
  const [porcentaje, setPorcentaje] = useState(tareaInicial.porcentaje);
  const [confirmCompletar, setConfirmCompletar] = useState(false);

  const criteriosSinMarcar = contenido.criteriosVerificacion.filter((_, i) => !tarea.verificacion?.[i]).length;
  const hayCambiosEstado = estado !== tarea.estado || porcentaje !== tarea.porcentaje;

  // Un evento remoto (otro usuario, o incluso nuestro propio toggleCriterio) no debe pisar
  // un cambio de estado/porcentaje que el usuario todavía no ha guardado con "Guardar estado".
  const hayCambiosRef = useRef(hayCambiosEstado);
  useEffect(() => {
    hayCambiosRef.current = hayCambiosEstado;
  });

  useEffect(() => {
    return onSnapshot(doc(db, `proyectos/${proyecto.id}/tareas/${tareaInicial.id}`), (snap) => {
      if (!snap.exists()) return;
      const t = snap.data() as Tarea;
      setTarea(t);
      if (!hayCambiosRef.current) {
        setEstado(t.estado);
        setPorcentaje(t.porcentaje);
      }
    });
  }, [proyecto.id, tareaInicial.id]);

  const abrirEditar = () => {
    setDialogGen((g) => g + 1); // fuerza a TareaDialog a remontar con los valores actuales de `tarea`
    setDialogAbierto(true);
  };

  const cambiarEstadoSelect = (v: EstadoTarea) => {
    setEstado(v);
    if (v === "Completada") setPorcentaje(100);
  };

  const guardarEstado = (forzar = false) => {
    if (estado === "Completada" && criteriosSinMarcar > 0 && !forzar) {
      setConfirmCompletar(true);
      return;
    }
    startTransition(async () => {
      try {
        await actualizarEstadoTarea(proyecto.id, tarea.id, estado, porcentaje);
        toast.success("Estado actualizado.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo actualizar el estado.");
      }
    });
  };

  const toggleCriterio = (i: number, marcado: boolean) => {
    const verificacion = { ...(tarea.verificacion ?? {}), [i]: marcado };
    setTarea((t) => ({ ...t, verificacion }));
    actualizarVerificacion(proyecto.id, tarea.id, verificacion).catch(() => {
      toast.error("No se pudo guardar el criterio.");
    });
  };

  const eliminar = () => {
    if (!confirm(`¿Eliminar la tarea "${tarea.nombre}"?`)) return;
    startTransition(async () => {
      try {
        await eliminarTarea(proyecto.id, tarea.id);
        router.push(`/proyectos/${proyecto.id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar la tarea.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href={`/proyectos/${proyecto.id}`} className="hover:text-foreground">
          {proyecto.nombre}
        </Link>
        {tarea.zona && (
          <>
            <IconChevronRight size={14} />
            <Link
              href={`/proyectos/${proyecto.id}/zona/${encodeURIComponent(tarea.zona)}`}
              className="hover:text-foreground"
            >
              {tarea.zona}
            </Link>
          </>
        )}
        <IconChevronRight size={14} />
        <span className="text-foreground">{tarea.nombre}</span>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium">{tarea.nombre}</h1>
            {nombreOriginal && nombreOriginal !== tarea.nombre && (
              <p className="mt-0.5 text-xs text-muted-foreground">Plantilla original: {nombreOriginal}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className={ESTILO_ESTADO[tarea.estado]}>
                {tarea.estado}
              </Badge>
              <Badge variant="secondary" className={ESTILO_PRIORIDAD[tarea.prioridad]}>
                {tarea.prioridad}
              </Badge>
              <Badge variant="secondary">{tarea.categoria}</Badge>
              {dificultad && (
                <Badge variant="secondary">
                  Dificultad {"★".repeat(dificultad)}
                  {"☆".repeat(5 - dificultad)}
                </Badge>
              )}
              {tarea.plantillaId && (
                <Badge variant="secondary" className="font-mono">
                  {tarea.plantillaId}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {puedeEditar && (
              <Button variant="outline" size="sm" onClick={abrirEditar}>
                Editar
              </Button>
            )}
            {puedeEliminar && (
              <Button variant="destructive" size="sm" onClick={eliminar} disabled={pending}>
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {puedeEditar ? (
          <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <Select value={estado} onValueChange={(v) => v && cambiarEstadoSelect(v as EstadoTarea)}>
                <SelectTrigger size="sm" className="w-[150px]">
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
              <Slider
                value={[porcentaje]}
                onValueChange={(v) => setPorcentaje(Array.isArray(v) ? v[0] : v)}
                min={0}
                max={100}
                step={5}
                className="max-w-[160px] flex-1"
              />
              <span className="w-10 text-right text-sm font-semibold">{porcentaje}%</span>
            </div>
            {hayCambiosEstado && (
              <Button size="sm" onClick={() => guardarEstado()} disabled={pending}>
                {pending ? "Guardando…" : "Guardar estado"}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 border-t border-border pt-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${colorAvance(tarea.porcentaje)}`} style={{ width: `${tarea.porcentaje}%` }} />
            </div>
            <span className="text-sm font-semibold">{tarea.porcentaje}%</span>
          </div>
        )}

        {tarea.estado === "Bloqueada" && tarea.bloqueadoPor && (
          <p className="text-sm text-estado-bloqueada">🔒 Bloqueado por: {tarea.bloqueadoPor}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Seccion titulo="Descripción">{contenido.descripcion || <SinDato />}</Seccion>
          <Seccion titulo="Objetivo">{contenido.objetivo || <SinDato />}</Seccion>
          <SeccionLista titulo="Requisitos" items={contenido.requisitos} />
          <SeccionLista titulo="Procedimiento" items={contenido.procedimiento} numerada />
          <Seccion titulo="Resultado esperado">{contenido.resultadoEsperado || <SinDato />}</Seccion>

          <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <h3 className="text-sm font-medium">Notas de ingeniería</h3>
            {contenido.notasIngenieria.length === 0 ? (
              <SinDato className="mt-2" />
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {contenido.notasIngenieria.map((n, i) => (
                  <li key={i} className="rounded-lg border border-border p-2.5 text-sm">
                    <p>{n.texto}</p>
                    {n.verificar || !n.fuente ? (
                      <p className="mt-1 text-xs font-medium text-prioridad-media">
                        ⚠ Verificar contra el criterio de diseño del proyecto
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">Fuente: {n.fuente}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <SeccionLista titulo="Tips de Revit / BIM" items={contenido.tipsRevit} />

          <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <h3 className="text-sm font-medium">Criterios de verificación</h3>
            {contenido.criteriosVerificacion.length === 0 ? (
              <SinDato className="mt-2" />
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {contenido.criteriosVerificacion.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={!!tarea.verificacion?.[i]}
                      onCheckedChange={(v) => puedeEditar && toggleCriterio(i, v === true)}
                      disabled={!puedeEditar}
                      className="mt-0.5"
                    />
                    <span className={tarea.verificacion?.[i] ? "text-muted-foreground line-through" : undefined}>
                      {c}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <h3 className="text-sm font-medium">Datos de la tarea</h3>
            <dl className="mt-2 flex flex-col gap-2 text-sm">
              <Dato label="Zona">{tarea.zona ?? "—"}</Dato>
              <Dato label="Responsable">{tarea.responsable || "—"}</Dato>
              <Dato label="Etapa">{tarea.etapa ?? "—"}</Dato>
              <Dato label="Fecha inicio">{fechaLegible(tarea.fechaInicio)}</Dato>
              <Dato label="Fecha límite">{fechaLegible(tarea.fechaLimite)}</Dato>
              <Dato label="Fecha completada">{fechaLegible(tarea.fechaCompletada)}</Dato>
              <Dato label="Horas estimadas">{tarea.horasEstimadas} h</Dato>
              <Dato label="Horas reales">{tarea.horasReales} h</Dato>
              {tarea.comentarios && <Dato label="Comentarios">{tarea.comentarios}</Dato>}
            </dl>
          </div>

          {dependencias.length > 0 && (
            <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <h3 className="text-sm font-medium">Dependencias</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                {dependencias.map((d) =>
                  d.tareaId ? (
                    <li key={d.plantillaId}>
                      <Link
                        href={`/proyectos/${proyecto.id}/tarea/${d.tareaId}`}
                        className="text-primary hover:underline"
                      >
                        {d.nombre}
                      </Link>
                    </li>
                  ) : (
                    <li key={d.plantillaId} className="text-muted-foreground">
                      {d.nombre} <span className="text-xs">(no está en este proyecto)</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {lecciones.length > 0 && (
            <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <h3 className="text-sm font-medium">Lecciones de la guía</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                {lecciones.map((l) => (
                  <li key={l.id}>
                    <Link href={`/guia/${l.modulo}/${l.id}`} className="text-primary hover:underline">
                      {l.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tarea.historial.length > 0 && (
            <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <h3 className="text-sm font-medium">Historial</h3>
              <ul className="mt-2 flex flex-col gap-2 text-xs">
                {[...tarea.historial].reverse().map((h, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{fechaHoraLegible(h.f)}</span>
                    <span className="flex items-center gap-1.5">
                      <Badge variant="secondary" className={ESTILO_ESTADO[h.e]}>
                        {h.e}
                      </Badge>
                      <span className="font-semibold">{h.p}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {puedeEditar && (
        <TareaDialog
          key={dialogGen}
          open={dialogAbierto}
          onOpenChange={setDialogAbierto}
          proyectoId={proyecto.id}
          tarea={tarea}
          zonasDisponibles={zonasDisponibles}
          etapasDisponibles={etapasDisponibles}
          responsablesDisponibles={responsablesDisponibles}
          puedeEditarAjena={puedeEditarAjena}
        />
      )}

      <AlertDialog open={confirmCompletar} onOpenChange={setConfirmCompletar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Marcar como completada?</AlertDialogTitle>
            <AlertDialogDescription>
              Quedan {criteriosSinMarcar} criterio(s) de verificación sin marcar. ¿Marcar la tarea como completada de
              todas formas?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmCompletar(false);
                guardarEstado(true);
              }}
            >
              Marcar completada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
