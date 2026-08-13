"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  eliminarTareaCatalogoNueva,
  guardarOverrideCatalogo,
  restaurarCampoCatalogo,
} from "@/app/(app)/plantilla/actions";
import { CATEGORIAS } from "@/content/categorias";
import { GRUPOS } from "@/content/grupos";
import { NORMAS } from "@/content/normas";
import { HORAS_MAX_TAREA, PRIORIDADES } from "@/content/prioridades";
import type { CampoContenidoCatalogo } from "@/lib/catalogo";
import type { Categoria, GrupoId, NotaIngenieria, Prioridad, TareaCatalogo } from "@/types";

const ETIQUETA_CAMPO: Record<CampoContenidoCatalogo, string> = {
  nombreOriginal: "Nombre original (v1)",
  nombre: "Nombre",
  grupo: "Grupo",
  subgrupo: "Subgrupo",
  categoria: "Categoría",
  disciplina: "Disciplina",
  dificultad: "Dificultad",
  horasEstimadas: "Horas estimadas",
  prioridad: "Prioridad",
  dependeDe: "Depende de",
  guiaIds: "Lecciones de la guía",
  descripcion: "Descripción",
  objetivo: "Objetivo",
  requisitos: "Requisitos",
  procedimiento: "Procedimiento",
  resultadoEsperado: "Resultado esperado",
  criteriosVerificacion: "Criterios de verificación",
  notasIngenieria: "Notas de ingeniería",
  tipsRevit: "Tips de Revit / BIM",
};

function textoAArray(texto: string): string[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function RestaurarCampo({
  campo,
  puedeRestaurar,
  onRestaurar,
}: {
  campo: CampoContenidoCatalogo;
  puedeRestaurar: boolean;
  onRestaurar: (campo: CampoContenidoCatalogo) => void;
}) {
  if (!puedeRestaurar) return null;
  return (
    <button
      type="button"
      onClick={() => onRestaurar(campo)}
      className="text-xs text-muted-foreground underline-offset-2 hover:underline"
    >
      Restaurar valor de fábrica
    </button>
  );
}

export function PlantillaForm({
  modo,
  plantillaIdInicial,
  tareaInicial,
  camposConOverride,
  esNuevo,
}: {
  modo: "crear" | "editar";
  plantillaIdInicial: string;
  tareaInicial: TareaCatalogo;
  camposConOverride: CampoContenidoCatalogo[];
  esNuevo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [plantillaIdInput, setPlantillaIdInput] = useState(plantillaIdInicial);
  const [escalares, setEscalares] = useState({
    nombreOriginal: tareaInicial.nombreOriginal,
    nombre: tareaInicial.nombre,
    grupo: tareaInicial.grupo,
    subgrupo: tareaInicial.subgrupo,
    categoria: tareaInicial.categoria,
    disciplina: tareaInicial.disciplina,
    dificultad: tareaInicial.dificultad,
    horasEstimadas: tareaInicial.horasEstimadas,
    prioridad: tareaInicial.prioridad,
    descripcion: tareaInicial.descripcion,
    objetivo: tareaInicial.objetivo,
    resultadoEsperado: tareaInicial.resultadoEsperado,
  });
  const [textos, setTextos] = useState({
    dependeDe: tareaInicial.dependeDe.join("\n"),
    guiaIds: tareaInicial.guiaIds.join("\n"),
    requisitos: tareaInicial.requisitos.join("\n"),
    procedimiento: tareaInicial.procedimiento.join("\n"),
    criteriosVerificacion: tareaInicial.criteriosVerificacion.join("\n"),
    tipsRevit: tareaInicial.tipsRevit.join("\n"),
  });
  const [notas, setNotas] = useState<NotaIngenieria[]>(tareaInicial.notasIngenieria);

  const puedeRestaurarCampo = (campo: CampoContenidoCatalogo) =>
    modo === "editar" && !esNuevo && camposConOverride.includes(campo);

  const opcionesSubgrupo = GRUPOS.find((g) => g.id === escalares.grupo)?.subgrupos ?? [];

  const cambiarGrupo = (grupo: GrupoId) => {
    const opciones = GRUPOS.find((g) => g.id === grupo)?.subgrupos ?? [];
    setEscalares((f) => ({ ...f, grupo, subgrupo: opciones.includes(f.subgrupo) ? f.subgrupo : (opciones[0] ?? "") }));
  };

  const restaurar = (campo: CampoContenidoCatalogo) => {
    if (
      !confirm(
        `Esto restaura "${ETIQUETA_CAMPO[campo]}" al valor de fábrica y recarga el formulario, descartando cualquier otro cambio sin guardar. ¿Continuar?`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await restaurarCampoCatalogo(plantillaIdInicial, campo);
        toast.success("Campo restaurado al valor de fábrica.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo restaurar el campo.");
      }
    });
  };

  const guardar = () => {
    const plantillaId = modo === "crear" ? plantillaIdInput.trim() : plantillaIdInicial;
    if (!plantillaId) {
      toast.error("El id de plantilla es obligatorio.");
      return;
    }
    const resultante: TareaCatalogo = {
      plantillaId,
      nombreOriginal: escalares.nombreOriginal,
      nombre: escalares.nombre,
      grupo: escalares.grupo,
      subgrupo: escalares.subgrupo,
      categoria: escalares.categoria,
      disciplina: escalares.disciplina,
      dificultad: escalares.dificultad,
      horasEstimadas: Number(escalares.horasEstimadas) || 0,
      prioridad: escalares.prioridad,
      dependeDe: textoAArray(textos.dependeDe),
      guiaIds: textoAArray(textos.guiaIds),
      descripcion: escalares.descripcion,
      objetivo: escalares.objetivo,
      requisitos: textoAArray(textos.requisitos),
      procedimiento: textoAArray(textos.procedimiento),
      resultadoEsperado: escalares.resultadoEsperado,
      criteriosVerificacion: textoAArray(textos.criteriosVerificacion),
      notasIngenieria: notas,
      tipsRevit: textoAArray(textos.tipsRevit),
    };
    startTransition(async () => {
      try {
        await guardarOverrideCatalogo(plantillaId, resultante, { crear: modo === "crear" });
        toast.success("Tarea guardada.");
        router.push(`/plantilla/${encodeURIComponent(plantillaId)}`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar la tarea.");
      }
    });
  };

  const eliminar = () => {
    if (!confirm(`¿Eliminar la tarea "${escalares.nombre}" de la plantilla? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      try {
        await eliminarTareaCatalogoNueva(plantillaIdInicial);
        toast.success("Tarea eliminada de la plantilla.");
        router.push("/plantilla");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar la tarea.");
      }
    });
  };

  const agregarNota = () => setNotas((n) => [...n, { texto: "", fuente: "", url: null, verificar: false }]);
  const quitarNota = (i: number) => setNotas((n) => n.filter((_, idx) => idx !== i));
  const actualizarNota = (i: number, cambios: Partial<NotaIngenieria>) =>
    setNotas((n) => n.map((nota, idx) => (idx === i ? { ...nota, ...cambios } : nota)));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plantillaId">Id de plantilla</Label>
          <Input
            id="plantillaId"
            value={plantillaIdInput}
            onChange={(e) => setPlantillaIdInput(e.target.value)}
            disabled={modo === "editar"}
            placeholder="PB-09-01"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <div className="flex items-center justify-between gap-2">
            <Input
              id="nombre"
              value={escalares.nombre}
              onChange={(e) => setEscalares((f) => ({ ...f, nombre: e.target.value }))}
            />
          </div>
          <RestaurarCampo campo="nombre" puedeRestaurar={puedeRestaurarCampo("nombre")} onRestaurar={restaurar} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Grupo</Label>
          <Select value={escalares.grupo} onValueChange={(v) => v && cambiarGrupo(v as GrupoId)}>
            <SelectTrigger size="sm">
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
          <RestaurarCampo campo="grupo" puedeRestaurar={puedeRestaurarCampo("grupo")} onRestaurar={restaurar} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Subgrupo</Label>
          <Select
            value={escalares.subgrupo}
            onValueChange={(v) => v && setEscalares((f) => ({ ...f, subgrupo: v }))}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {opcionesSubgrupo.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <RestaurarCampo campo="subgrupo" puedeRestaurar={puedeRestaurarCampo("subgrupo")} onRestaurar={restaurar} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Categoría</Label>
          <Select
            value={escalares.categoria}
            onValueChange={(v) => v && setEscalares((f) => ({ ...f, categoria: v as Categoria }))}
          >
            <SelectTrigger size="sm">
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
          <RestaurarCampo campo="categoria" puedeRestaurar={puedeRestaurarCampo("categoria")} onRestaurar={restaurar} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="disciplina">Disciplina</Label>
          <Input
            id="disciplina"
            value={escalares.disciplina}
            onChange={(e) => setEscalares((f) => ({ ...f, disciplina: e.target.value }))}
          />
          <RestaurarCampo campo="disciplina" puedeRestaurar={puedeRestaurarCampo("disciplina")} onRestaurar={restaurar} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Dificultad</Label>
          <Select
            value={String(escalares.dificultad)}
            onValueChange={(v) => v && setEscalares((f) => ({ ...f, dificultad: Number(v) as 1 | 2 | 3 | 4 | 5 }))}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <RestaurarCampo campo="dificultad" puedeRestaurar={puedeRestaurarCampo("dificultad")} onRestaurar={restaurar} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Prioridad</Label>
          <Select
            value={escalares.prioridad}
            onValueChange={(v) => v && setEscalares((f) => ({ ...f, prioridad: v as Prioridad }))}
          >
            <SelectTrigger size="sm">
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
          <RestaurarCampo campo="prioridad" puedeRestaurar={puedeRestaurarCampo("prioridad")} onRestaurar={restaurar} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="horasEstimadas">Horas estimadas</Label>
          <Input
            id="horasEstimadas"
            type="number"
            min={0.5}
            max={HORAS_MAX_TAREA}
            step={0.5}
            value={escalares.horasEstimadas}
            onChange={(e) => setEscalares((f) => ({ ...f, horasEstimadas: Number(e.target.value) }))}
          />
          <p className="text-xs text-muted-foreground">
            Horas de modelado de un modelador con la tarea ya definida. Máximo {HORAS_MAX_TAREA} h.
          </p>
          <RestaurarCampo
            campo="horasEstimadas"
            puedeRestaurar={puedeRestaurarCampo("horasEstimadas")}
            onRestaurar={restaurar}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombreOriginal">Nombre original (v1)</Label>
          <Input
            id="nombreOriginal"
            value={escalares.nombreOriginal}
            onChange={(e) => setEscalares((f) => ({ ...f, nombreOriginal: e.target.value }))}
          />
        </div>
      </div>

      <CampoTextarea
        etiqueta={ETIQUETA_CAMPO.dependeDe}
        ayuda="Un plantillaId por línea, ej. PB-01-01"
        value={textos.dependeDe}
        onChange={(v) => setTextos((f) => ({ ...f, dependeDe: v }))}
        campo="dependeDe"
        puedeRestaurar={puedeRestaurarCampo("dependeDe")}
        onRestaurar={restaurar}
      />
      <CampoTextarea
        etiqueta={ETIQUETA_CAMPO.guiaIds}
        ayuda="Un id de lección por línea, ej. M5.1"
        value={textos.guiaIds}
        onChange={(v) => setTextos((f) => ({ ...f, guiaIds: v }))}
        campo="guiaIds"
        puedeRestaurar={puedeRestaurarCampo("guiaIds")}
        onRestaurar={restaurar}
      />
      <CampoTextarea
        etiqueta={ETIQUETA_CAMPO.descripcion}
        value={escalares.descripcion}
        onChange={(v) => setEscalares((f) => ({ ...f, descripcion: v }))}
        campo="descripcion"
        puedeRestaurar={puedeRestaurarCampo("descripcion")}
        onRestaurar={restaurar}
      />
      <CampoTextarea
        etiqueta={ETIQUETA_CAMPO.objetivo}
        value={escalares.objetivo}
        onChange={(v) => setEscalares((f) => ({ ...f, objetivo: v }))}
        campo="objetivo"
        puedeRestaurar={puedeRestaurarCampo("objetivo")}
        onRestaurar={restaurar}
      />
      <CampoTextarea
        etiqueta={ETIQUETA_CAMPO.requisitos}
        ayuda="Un requisito por línea"
        value={textos.requisitos}
        onChange={(v) => setTextos((f) => ({ ...f, requisitos: v }))}
        campo="requisitos"
        puedeRestaurar={puedeRestaurarCampo("requisitos")}
        onRestaurar={restaurar}
      />
      <CampoTextarea
        etiqueta={ETIQUETA_CAMPO.procedimiento}
        ayuda="Un paso por línea"
        value={textos.procedimiento}
        onChange={(v) => setTextos((f) => ({ ...f, procedimiento: v }))}
        campo="procedimiento"
        puedeRestaurar={puedeRestaurarCampo("procedimiento")}
        onRestaurar={restaurar}
      />
      <CampoTextarea
        etiqueta={ETIQUETA_CAMPO.resultadoEsperado}
        value={escalares.resultadoEsperado}
        onChange={(v) => setEscalares((f) => ({ ...f, resultadoEsperado: v }))}
        campo="resultadoEsperado"
        puedeRestaurar={puedeRestaurarCampo("resultadoEsperado")}
        onRestaurar={restaurar}
      />
      <CampoTextarea
        etiqueta={ETIQUETA_CAMPO.criteriosVerificacion}
        ayuda="Un criterio por línea"
        value={textos.criteriosVerificacion}
        onChange={(v) => setTextos((f) => ({ ...f, criteriosVerificacion: v }))}
        campo="criteriosVerificacion"
        puedeRestaurar={puedeRestaurarCampo("criteriosVerificacion")}
        onRestaurar={restaurar}
      />
      <CampoTextarea
        etiqueta={ETIQUETA_CAMPO.tipsRevit}
        ayuda="Un tip por línea"
        value={textos.tipsRevit}
        onChange={(v) => setTextos((f) => ({ ...f, tipsRevit: v }))}
        campo="tipsRevit"
        puedeRestaurar={puedeRestaurarCampo("tipsRevit")}
        onRestaurar={restaurar}
      />

      <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <Label>Notas de ingeniería</Label>
          <RestaurarCampo
            campo="notasIngenieria"
            puedeRestaurar={puedeRestaurarCampo("notasIngenieria")}
            onRestaurar={restaurar}
          />
        </div>
        {notas.map((nota, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
            <Textarea
              value={nota.texto}
              onChange={(e) => actualizarNota(i, { texto: e.target.value })}
              placeholder="Texto de la nota"
            />
            <Input
              value={nota.fuente ?? ""}
              onChange={(e) => actualizarNota(i, { fuente: e.target.value || null })}
              placeholder="Fuente (ej. RETIE (Res. 40284 de 2026) — Libro 3, Art. 3.12.1), vacío si no hay"
            />
            <Input
              value={nota.url ?? ""}
              onChange={(e) => actualizarNota(i, { url: e.target.value || null })}
              placeholder="Enlace directo a la norma (https, se admite …pdf#page=42)"
            />
            <p className="text-xs text-muted-foreground">
              Solo se aceptan enlaces https a: {NORMAS.map((n) => new URL(n.url).hostname).join(", ")}.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={nota.verificar}
                  onChange={(e) => actualizarNota(i, { verificar: e.target.checked })}
                />
                Verificar contra el proyecto
              </label>
              <Button type="button" variant="ghost" size="sm" onClick={() => quitarNota(i)}>
                Quitar
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={agregarNota}>
          + Agregar nota
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        {modo === "editar" && esNuevo ? (
          <Button type="button" variant="destructive" onClick={eliminar} disabled={pending}>
            Eliminar de la plantilla
          </Button>
        ) : (
          <span />
        )}
        <Button type="button" onClick={guardar} disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function CampoTextarea({
  etiqueta,
  ayuda,
  value,
  onChange,
  campo,
  puedeRestaurar,
  onRestaurar,
}: {
  etiqueta: string;
  ayuda?: string;
  value: string;
  onChange: (v: string) => void;
  campo: CampoContenidoCatalogo;
  puedeRestaurar: boolean;
  onRestaurar: (campo: CampoContenidoCatalogo) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between">
        <Label>{etiqueta}</Label>
        <RestaurarCampo campo={campo} puedeRestaurar={puedeRestaurar} onRestaurar={onRestaurar} />
      </div>
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} />
    </div>
  );
}
