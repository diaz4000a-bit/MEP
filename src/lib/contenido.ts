import { catalogoVigente } from "@/lib/catalogo-vigente";
import type { NotaIngenieria, Tarea } from "@/types";

export interface ContenidoTarea {
  descripcion: string;
  objetivo: string;
  requisitos: string[];
  procedimiento: string[];
  resultadoEsperado: string;
  criteriosVerificacion: string[];
  notasIngenieria: NotaIngenieria[];
  tipsRevit: string[];
}

/** El override en la tarea (Firestore) siempre gana sobre el contenido del catálogo vigente. */
export async function contenidoTarea(t: Tarea): Promise<ContenidoTarea> {
  const { mapa } = await catalogoVigente();
  const base = t.plantillaId ? mapa.get(t.plantillaId) : undefined;
  return {
    descripcion: t.descripcion ?? base?.descripcion ?? "",
    objetivo: t.objetivo ?? base?.objetivo ?? "",
    requisitos: t.requisitos ?? base?.requisitos ?? [],
    procedimiento: t.procedimiento ?? base?.procedimiento ?? [],
    resultadoEsperado: t.resultadoEsperado ?? base?.resultadoEsperado ?? "",
    criteriosVerificacion: t.criteriosVerificacion ?? base?.criteriosVerificacion ?? [],
    notasIngenieria: t.notasIngenieria ?? base?.notasIngenieria ?? [],
    tipsRevit: t.tipsRevit ?? base?.tipsRevit ?? [],
  };
}
