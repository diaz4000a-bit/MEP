"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { eliminarTarea } from "@/app/(app)/proyectos/actions";
import { CATEGORIAS } from "@/content/categorias";
import { GRUPOS } from "@/content/grupos";
import { db } from "@/lib/firebase/client";
import {
  colorAvance,
  diasHasta,
  ESTILO_ESTADO,
  ESTILO_PRIORIDAD,
  estaProxima,
  estaVencida,
  fechaLegible,
} from "@/lib/tareas";
import type { EstadoTarea, Prioridad, Tarea } from "@/types";
import { TareaDialog } from "./tarea-dialog";

const ESTADOS: EstadoTarea[] = ["Sin iniciar", "En progreso", "En revisión", "Completada", "Bloqueada"];
const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"];
const TODOS = "__todos__";

type Agrupacion = "grupo" | "etapa" | "zona" | "ninguna";

interface Filtros {
  zona: string;
  etapa: string;
  categoria: string;
  responsable: string;
  estado: string;
  prioridad: string;
  grupo: string;
}

const FILTROS_VACIOS: Filtros = { zona: "", etapa: "", categoria: "", responsable: "", estado: "", prioridad: "", grupo: "" };

interface Responsable {
  label: string;
  uid: string | null;
}

export function TareasTabla({
  proyectoId,
  zonasProyecto,
  tareasIniciales,
  responsablesDisponibles,
  puedeCrear,
  puedeEliminar,
  puedeEditarAjenas,
  uidActual,
  zonaFija,
}: {
  proyectoId: string;
  zonasProyecto: string[];
  tareasIniciales: Tarea[];
  responsablesDisponibles: Responsable[];
  puedeCrear: boolean;
  puedeEliminar: boolean;
  puedeEditarAjenas: boolean;
  uidActual: string;
  /** Si viene definido, la tabla queda fija a esa zona (null = "Sin zona") — usado por la vista de zona. */
  zonaFija?: string | null;
}) {
  const [tareasProyecto, setTareasProyecto] = useState(tareasIniciales);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
  const [agrupar, setAgrupar] = useState<Agrupacion>("grupo");
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<Tarea | undefined>(undefined);

  useEffect(() => {
    const q = query(collection(db, `proyectos/${proyectoId}/tareas`), orderBy("actualizado", "desc"));
    return onSnapshot(
      q,
      (snap) => setTareasProyecto(snap.docs.map((d) => d.data() as Tarea)),
      () => toast.error("Se perdió la sincronización en tiempo real de las tareas."),
    );
  }, [proyectoId]);

  const tareas = useMemo(
    () =>
      zonaFija === undefined
        ? tareasProyecto
        : tareasProyecto.filter((t) => (zonaFija === null ? !t.zona : t.zona === zonaFija)),
    [tareasProyecto, zonaFija],
  );

  const zonasDisponibles = useMemo(
    () => [...new Set([...zonasProyecto, ...tareasProyecto.map((t) => t.zona).filter((z): z is string => !!z)])],
    [zonasProyecto, tareasProyecto],
  );
  const etapasDisponibles = useMemo(
    () => [...new Set(tareas.map((t) => t.etapa).filter((e): e is string => !!e))],
    [tareas],
  );
  const responsablesFiltro = useMemo(
    () => [...new Set([...responsablesDisponibles.map((r) => r.label), ...tareas.map((t) => t.responsable).filter(Boolean)])],
    [responsablesDisponibles, tareas],
  );

  const visibles = tareas.filter(
    (t) =>
      (!filtros.zona || (t.zona || "") === filtros.zona) &&
      (!filtros.etapa || (t.etapa || "") === filtros.etapa) &&
      (!filtros.categoria || t.categoria === filtros.categoria) &&
      (!filtros.responsable || t.responsable === filtros.responsable) &&
      (!filtros.estado || t.estado === filtros.estado) &&
      (!filtros.prioridad || t.prioridad === filtros.prioridad) &&
      (!filtros.grupo || t.grupo === filtros.grupo),
  );

  const abrirNueva = () => {
    setTareaEditando(undefined);
    setDialogAbierto(true);
  };
  const abrirEdicion = (t: Tarea) => {
    setTareaEditando(t);
    setDialogAbierto(true);
  };
  const eliminar = (t: Tarea) => {
    if (!confirm(`¿Eliminar la tarea "${t.nombre}"?`)) return;
    eliminarTarea(proyectoId, t.id).catch(() =>
      toast.error("No se pudo eliminar la tarea."),
    );
  };

  const puedeEditar = (t: Tarea) => puedeEditarAjenas || t.responsableUid === uidActual;

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          Tareas ({visibles.length}
          {visibles.length !== tareas.length ? ` de ${tareas.length}` : ""})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {(["grupo", "etapa", "zona", "ninguna"] as const).map((modo) => (
              <button
                key={modo}
                onClick={() => setAgrupar(modo)}
                className={`rounded-md px-2 py-1 text-xs capitalize transition-colors ${
                  agrupar === modo ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {modo === "ninguna" ? "Ninguna" : modo}
              </button>
            ))}
          </div>
          {puedeCrear && <Button size="sm" onClick={abrirNueva}>Agregar tarea</Button>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <FiltroSelect
          label="Grupo"
          valor={filtros.grupo}
          onCambio={(v) => setFiltros((f) => ({ ...f, grupo: v }))}
          opciones={GRUPOS.map((g) => ({ value: g.id, label: g.nombre }))}
        />
        {zonaFija === undefined && zonasDisponibles.length > 0 && (
          <FiltroSelect
            label="Zona"
            valor={filtros.zona}
            onCambio={(v) => setFiltros((f) => ({ ...f, zona: v }))}
            opciones={zonasDisponibles.map((z) => ({ value: z, label: z }))}
          />
        )}
        {etapasDisponibles.length > 0 && (
          <FiltroSelect
            label="Etapa"
            valor={filtros.etapa}
            onCambio={(v) => setFiltros((f) => ({ ...f, etapa: v }))}
            opciones={etapasDisponibles.map((e) => ({ value: e, label: e }))}
          />
        )}
        <FiltroSelect
          label="Categoría"
          valor={filtros.categoria}
          onCambio={(v) => setFiltros((f) => ({ ...f, categoria: v }))}
          opciones={CATEGORIAS.map((c) => ({ value: c, label: c }))}
        />
        <FiltroSelect
          label="Responsable"
          valor={filtros.responsable}
          onCambio={(v) => setFiltros((f) => ({ ...f, responsable: v }))}
          opciones={responsablesFiltro.map((r) => ({ value: r, label: r }))}
        />
        <FiltroSelect
          label="Estado"
          valor={filtros.estado}
          onCambio={(v) => setFiltros((f) => ({ ...f, estado: v }))}
          opciones={ESTADOS.map((e) => ({ value: e, label: e }))}
        />
        <FiltroSelect
          label="Prioridad"
          valor={filtros.prioridad}
          onCambio={(v) => setFiltros((f) => ({ ...f, prioridad: v }))}
          opciones={PRIORIDADES.map((p) => ({ value: p, label: p }))}
        />
        <Button variant="ghost" size="sm" onClick={() => setFiltros(FILTROS_VACIOS)}>
          Limpiar filtros
        </Button>
      </div>

      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Zona</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Avance</TableHead>
              <TableHead>Fecha límite</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <CuerpoTabla
              proyectoId={proyectoId}
              visibles={visibles}
              todas={tareas}
              zonasProyecto={zonasProyecto}
              agrupar={agrupar}
              onEditar={abrirEdicion}
              onEliminar={eliminar}
              puedeEliminar={puedeEliminar}
              puedeEditar={puedeEditar}
            />
          </TableBody>
        </Table>
      </div>

      <TareaDialog
        key={tareaEditando?.id ?? "nueva"}
        open={dialogAbierto}
        onOpenChange={setDialogAbierto}
        proyectoId={proyectoId}
        tarea={tareaEditando}
        zonaPreset={zonaFija ?? undefined}
        zonasDisponibles={zonasDisponibles}
        etapasDisponibles={etapasDisponibles}
        responsablesDisponibles={responsablesDisponibles}
        puedeEditarAjena={puedeEditarAjenas}
      />
    </div>
  );
}

function FiltroSelect({
  label,
  valor,
  onCambio,
  opciones,
}: {
  label: string;
  valor: string;
  onCambio: (v: string) => void;
  opciones: { value: string; label: string }[];
}) {
  const items = { [TODOS]: `${label}: todos`, ...Object.fromEntries(opciones.map((o) => [o.value, o.label])) };
  return (
    <Select value={valor || TODOS} items={items} onValueChange={(v) => onCambio(!v || v === TODOS ? "" : v)}>
      <SelectTrigger size="sm" className="min-w-[130px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{label}: todos</SelectItem>
        {opciones.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CuerpoTabla({
  proyectoId,
  visibles,
  todas,
  zonasProyecto,
  agrupar,
  onEditar,
  onEliminar,
  puedeEliminar,
  puedeEditar,
}: {
  proyectoId: string;
  visibles: Tarea[];
  todas: Tarea[];
  zonasProyecto: string[];
  agrupar: Agrupacion;
  onEditar: (t: Tarea) => void;
  onEliminar: (t: Tarea) => void;
  puedeEliminar: boolean;
  puedeEditar: (t: Tarea) => boolean;
}) {
  if (visibles.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
          No hay tareas que coincidan con los filtros.
        </TableCell>
      </TableRow>
    );
  }

  if (agrupar === "ninguna") {
    return (
      <>
        {visibles.map((t) => (
          <FilaTarea
            key={t.id}
            proyectoId={proyectoId}
            tarea={t}
            onEditar={onEditar}
            onEliminar={onEliminar}
            puedeEliminar={puedeEliminar}
            puedeEditar={puedeEditar(t)}
          />
        ))}
      </>
    );
  }

  let grupos: { id: string; label: string }[];
  let campo: (t: Tarea) => string;

  if (agrupar === "grupo") {
    grupos = GRUPOS.map((g) => ({ id: g.id, label: g.nombre }));
    campo = (t) => t.grupo ?? "";
  } else if (agrupar === "zona") {
    const ids = [...new Set([...zonasProyecto, ...todas.map((t) => t.zona).filter((z): z is string => !!z)])];
    grupos = ids.map((z) => ({ id: z, label: z }));
    campo = (t) => t.zona || "";
  } else {
    const ids = [...new Set(todas.map((t) => t.etapa).filter((e): e is string => !!e))];
    grupos = ids.map((e) => ({ id: e, label: e }));
    campo = (t) => t.etapa || "";
  }

  const sinLabel = agrupar === "zona" ? "Sin zona" : agrupar === "etapa" ? "Sin etapa" : "Sin grupo";

  return (
    <>
      {[...grupos, { id: "", label: sinLabel }].map((g) => {
        const ts = visibles.filter((t) => campo(t) === g.id);
        if (ts.length === 0) return null;
        const avg = Math.round(ts.reduce((s, t) => s + (Number(t.porcentaje) || 0), 0) / ts.length);
        const done = ts.filter((t) => t.estado === "Completada").length;
        return (
          <Fragment key={g.id || "sin-grupo"}>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableCell colSpan={8}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium">{g.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {done}/{ts.length} tareas
                  </span>
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${colorAvance(avg)}`} style={{ width: `${avg}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{avg}%</span>
                </div>
              </TableCell>
            </TableRow>
            {ts.map((t) => (
              <FilaTarea
                key={t.id}
                proyectoId={proyectoId}
                tarea={t}
                onEditar={onEditar}
                onEliminar={onEliminar}
                puedeEliminar={puedeEliminar}
                puedeEditar={puedeEditar(t)}
              />
            ))}
          </Fragment>
        );
      })}
    </>
  );
}

function FilaTarea({
  proyectoId,
  tarea: t,
  onEditar,
  onEliminar,
  puedeEliminar,
  puedeEditar,
}: {
  proyectoId: string;
  tarea: Tarea;
  onEditar: (t: Tarea) => void;
  onEliminar: (t: Tarea) => void;
  puedeEliminar: boolean;
  puedeEditar: boolean;
}) {
  const vencida = estaVencida(t);
  const proxima = estaProxima(t);
  const d = diasHasta(t.fechaLimite);

  return (
    <TableRow className={vencida ? "bg-estado-bloqueada/5" : proxima ? "bg-prioridad-media/5" : undefined}>
      <TableCell>
        <Link href={`/proyectos/${proyectoId}/tarea/${t.id}`} className="font-medium hover:underline">
          {t.nombre}
        </Link>
        {t.estado === "Bloqueada" && t.bloqueadoPor && (
          <div className="text-xs text-estado-bloqueada">🔒 {t.bloqueadoPor}</div>
        )}
      </TableCell>
      <TableCell>
        {t.zona ? (
          <Badge variant="secondary" className="bg-estado-revision/15 text-estado-revision">
            {t.zona}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>{t.responsable || <span className="text-muted-foreground">—</span>}</TableCell>
      <TableCell>
        <Badge variant="secondary" className={ESTILO_PRIORIDAD[t.prioridad]}>
          {t.prioridad}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={ESTILO_ESTADO[t.estado]}>
          {t.estado}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${colorAvance(t.porcentaje)}`} style={{ width: `${t.porcentaje}%` }} />
          </div>
          <span className="text-xs font-semibold">{t.porcentaje}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div>{fechaLegible(t.fechaLimite)}</div>
        {t.fechaLimite && t.estado !== "Completada" && d !== null && d <= 3 && (
          <div className={`text-xs ${d < 0 ? "text-estado-bloqueada" : "text-prioridad-media"}`}>
            {d < 0 ? `Vencida hace ${Math.abs(d)} d` : d === 0 ? "Vence hoy" : `Faltan ${d} d`}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {puedeEditar && (
            <Button variant="ghost" size="icon-sm" onClick={() => onEditar(t)} aria-label="Editar tarea" title="Editar">
              ✎
            </Button>
          )}
          {puedeEliminar && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEliminar(t)}
              aria-label="Eliminar tarea"
              title="Eliminar"
              className="text-estado-bloqueada"
            >
              ✕
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
