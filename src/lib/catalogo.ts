import type { CatalogoOverride, TareaCatalogo } from "@/types";

export const CAMPOS_CONTENIDO_CATALOGO = [
  "nombreOriginal", "nombre", "grupo", "subgrupo", "categoria", "disciplina", "dificultad",
  "horasEstimadas", "prioridad", "dependeDe", "guiaIds", "descripcion", "objetivo",
  "requisitos", "procedimiento", "resultadoEsperado", "criteriosVerificacion",
  "notasIngenieria", "tipsRevit",
] as const satisfies readonly (keyof TareaCatalogo)[];

export type CampoContenidoCatalogo = (typeof CAMPOS_CONTENIDO_CATALOGO)[number];

/** El override en Firestore siempre gana sobre el catálogo estático, campo a campo. */
export function aplicarOverride(base: TareaCatalogo, override?: CatalogoOverride): TareaCatalogo {
  if (!override) return base;
  return {
    ...base,
    nombreOriginal: override.nombreOriginal ?? base.nombreOriginal,
    nombre: override.nombre ?? base.nombre,
    grupo: override.grupo ?? base.grupo,
    subgrupo: override.subgrupo ?? base.subgrupo,
    categoria: override.categoria ?? base.categoria,
    disciplina: override.disciplina ?? base.disciplina,
    dificultad: override.dificultad ?? base.dificultad,
    horasEstimadas: override.horasEstimadas ?? base.horasEstimadas,
    prioridad: override.prioridad ?? base.prioridad,
    dependeDe: override.dependeDe ?? base.dependeDe,
    guiaIds: override.guiaIds ?? base.guiaIds,
    descripcion: override.descripcion ?? base.descripcion,
    objetivo: override.objetivo ?? base.objetivo,
    requisitos: override.requisitos ?? base.requisitos,
    procedimiento: override.procedimiento ?? base.procedimiento,
    resultadoEsperado: override.resultadoEsperado ?? base.resultadoEsperado,
    criteriosVerificacion: override.criteriosVerificacion ?? base.criteriosVerificacion,
    notasIngenieria: override.notasIngenieria ?? base.notasIngenieria,
    tipsRevit: override.tipsRevit ?? base.tipsRevit,
  };
}

/** Un override `esNuevo` no tiene base: es autosuficiente. Los `??` son solo defensivos. */
export function tareaCatalogoDesdeOverride(override: CatalogoOverride): TareaCatalogo {
  return {
    plantillaId: override.plantillaId,
    nombreOriginal: override.nombreOriginal ?? override.nombre ?? "",
    nombre: override.nombre ?? "",
    grupo: override.grupo ?? "01-gestion",
    subgrupo: override.subgrupo ?? "",
    categoria: override.categoria ?? "Modelado",
    disciplina: override.disciplina ?? "",
    dificultad: override.dificultad ?? 1,
    horasEstimadas: override.horasEstimadas ?? 4,
    prioridad: override.prioridad ?? "Media",
    dependeDe: override.dependeDe ?? [],
    guiaIds: override.guiaIds ?? [],
    descripcion: override.descripcion ?? "",
    objetivo: override.objetivo ?? "",
    requisitos: override.requisitos ?? [],
    procedimiento: override.procedimiento ?? [],
    resultadoEsperado: override.resultadoEsperado ?? "",
    criteriosVerificacion: override.criteriosVerificacion ?? [],
    notasIngenieria: override.notasIngenieria ?? [],
    tipsRevit: override.tipsRevit ?? [],
    nuevo: true,
  };
}

/**
 * Fusiona el catálogo estático de fábrica con los overrides guardados por el admin.
 * Función pura — sin Firestore — para poder testearla sin mocks. El wrapper que sí lee
 * Firestore vive en `catalogo-vigente.ts`, separado para que este archivo no arrastre
 * `firebase-admin` (y su credencial obligatoria) a los tests.
 */
export function mergeCatalogo(base: TareaCatalogo[], overrides: Map<string, CatalogoOverride>): TareaCatalogo[] {
  const existentes = base
    .filter((t) => !overrides.get(t.plantillaId)?.oculto)
    .map((t) => aplicarOverride(t, overrides.get(t.plantillaId)));

  const nuevas = [...overrides.values()].filter((o) => o.esNuevo && !o.oculto).map(tareaCatalogoDesdeOverride);

  return [...existentes, ...nuevas];
}

/**
 * Compara la tarea resultante de un guardado del editor contra su base de fábrica.
 * `cambios` son los campos a escribir; `sinCambios` son los campos que hay que limpiar del
 * override (con `FieldValue.delete()`, ver plantilla/actions.ts) para que un campo editado y
 * luego devuelto a su valor original no deje basura en Firestore.
 */
export function diffContenidoCatalogo(
  resultante: TareaCatalogo,
  base: TareaCatalogo,
): { cambios: Partial<TareaCatalogo>; sinCambios: CampoContenidoCatalogo[] } {
  const cambios: Partial<TareaCatalogo> = {};
  const sinCambios: CampoContenidoCatalogo[] = [];
  for (const campo of CAMPOS_CONTENIDO_CATALOGO) {
    const distinto = JSON.stringify(resultante[campo]) !== JSON.stringify(base[campo]);
    if (distinto) {
      (cambios as Record<string, unknown>)[campo] = resultante[campo];
    } else {
      sinCambios.push(campo);
    }
  }
  return { cambios, sinCambios };
}
