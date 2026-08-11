import { CATALOGO_TAREAS, CATALOGO_TAREAS_MAP } from "@/content/catalogo-tareas";
import type { Categoria, GrupoId } from "@/types";

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Busca la tarea del catálogo cuyo `nombreOriginal` coincide con `nombre` (import de JSON viejos). */
export function inferirPlantillaId(nombre: string): string | null {
  const norm = normalizar(nombre);
  for (const c of CATALOGO_TAREAS) {
    if (normalizar(c.nombreOriginal) === norm) return c.plantillaId;
  }
  return null;
}

// Mapeo etapa (v1, texto legado) → grupo nuevo. Los prefijos más específicos
// ('4.1.1', '4.1.2') van antes que su prefijo general ('4.1') porque se compara con startsWith.
const MAPA_ETAPA_GRUPO: { prefijo: string; grupo: GrupoId }[] = [
  { prefijo: "1.1", grupo: "01-gestion" },
  { prefijo: "4.1.1", grupo: "06-entregables" },
  { prefijo: "4.1.2", grupo: "03-documentacion" },
  { prefijo: "2.1", grupo: "02-modelado" },
  { prefijo: "3.1", grupo: "05-calidad" },
  { prefijo: "4.1", grupo: "02-modelado" },
  { prefijo: "5.1", grupo: "05-calidad" },
];

function grupoDesdeEtapa(etapa: string): GrupoId | null {
  const norm = etapa.trim();
  const match = MAPA_ETAPA_GRUPO.find(({ prefijo }) => norm.startsWith(prefijo));
  return match?.grupo ?? null;
}

// Fallback cuando no hay etapa reconocible (p. ej. incidencias-*.json, que no trae etapa).
const MAPA_CATEGORIA_GRUPO: Record<Categoria, GrupoId> = {
  "Configuración BIM": "01-gestion",
  Modelado: "02-modelado",
  Tableros: "02-modelado",
  Iluminación: "02-modelado",
  Tomacorrientes: "02-modelado",
  "Ductos y Bandejas": "02-modelado",
  Acometidas: "02-modelado",
  "Sistemas Especiales": "02-modelado",
  "Coordinación MEP": "04-coordinacion",
  Documentación: "03-documentacion",
  "Revisión y QC": "05-calidad",
  Entrega: "06-entregables",
};

/**
 * `plantillaId` resuelto (match exacto contra el catálogo) manda sobre todo lo demás.
 * Si no hay match, se intenta por `etapa` (texto legado v1) y por último por `categoria`.
 */
export function inferirGrupoYSubgrupo(input: {
  plantillaId: string | null;
  etapa: string;
  categoria: string;
}): { grupo: GrupoId | null; subgrupo: string | null } {
  if (input.plantillaId) {
    const c = CATALOGO_TAREAS_MAP.get(input.plantillaId);
    if (c) return { grupo: c.grupo, subgrupo: c.subgrupo };
  }
  if (input.etapa) {
    const g = grupoDesdeEtapa(input.etapa);
    if (g) return { grupo: g, subgrupo: null };
  }
  const gc = MAPA_CATEGORIA_GRUPO[input.categoria as Categoria];
  return { grupo: gc ?? null, subgrupo: null };
}
