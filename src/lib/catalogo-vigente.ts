import "server-only";
import { cache } from "react";
import { CATALOGO_TAREAS } from "@/content/catalogo-tareas";
import { adminDb } from "@/lib/firebase/admin";
import { mergeCatalogo } from "@/lib/catalogo";
import type { CatalogoOverride, TareaCatalogo } from "@/types";

export interface CatalogoVigente {
  lista: TareaCatalogo[];
  mapa: Map<string, TareaCatalogo>;
}

/**
 * Catálogo base fusionado con `catalogoOverrides` (ediciones del admin desde /plantilla).
 * `cache()` de React deduplica la lectura a Firestore dentro de un mismo request — varios
 * componentes de una misma página pueden llamar a esto sin multiplicar la consulta.
 */
export const catalogoVigente = cache(async (): Promise<CatalogoVigente> => {
  const snap = await adminDb.collection("catalogoOverrides").get();
  const overrides = new Map(snap.docs.map((d) => [d.id, d.data() as CatalogoOverride]));
  const lista = mergeCatalogo(CATALOGO_TAREAS, overrides);
  return { lista, mapa: new Map(lista.map((t) => [t.plantillaId, t])) };
});
