import type { Grupo } from '@/content/grupos';
import { DOMINIOS_NORMA_PERMITIDOS } from '@/content/normas';
import { HORAS_MAX_TAREA, PRIORIDADES } from '@/content/prioridades';
import type { Categoria, NotaIngenieria, TareaCatalogo } from '@/types';

export interface ContextoValidacionCatalogo {
  grupos: Grupo[];
  categorias: readonly Categoria[];
  leccionesIds: ReadonlySet<string>;
}

const CAMPOS_TEXTO_OBLIGATORIOS: (keyof TareaCatalogo)[] = [
  'plantillaId', 'nombre', 'subgrupo', 'disciplina', 'descripcion', 'objetivo', 'resultadoEsperado',
];
const CAMPOS_ARRAY_OBLIGATORIOS: (keyof TareaCatalogo)[] = ['requisitos', 'procedimiento', 'criteriosVerificacion'];
const CAMPOS_ARRAY_TEXTO: (keyof TareaCatalogo)[] = [
  'requisitos', 'procedimiento', 'criteriosVerificacion', 'dependeDe', 'guiaIds', 'tipsRevit',
];
const PLANTILLA_ID_VALIDO = /^[A-Za-z0-9_-]+$/;

function esArrayDeStrings(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === 'string');
}

function esNotaValida(v: unknown): v is NotaIngenieria {
  if (typeof v !== 'object' || v === null) return false;
  const n = v as Record<string, unknown>;
  return (
    typeof n.texto === 'string' &&
    typeof n.verificar === 'boolean' &&
    (n.fuente === null || typeof n.fuente === 'string') &&
    (n.url === null || n.url === undefined || typeof n.url === 'string')
  );
}

/**
 * El enlace de una nota se pinta como `<a href>` en la ficha de tarea, y el editor de plantilla
 * es una Server Action que recibe JSON del cliente. Sin esta comprobación un admin podría
 * guardar un `javascript:` o apuntar a un dominio cualquiera, y quedaría publicado para todo
 * el equipo con la apariencia de ser la norma oficial.
 */
function errorUrlNorma(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'no es una URL válida';
  }
  if (parsed.protocol !== 'https:') return 'debe usar https';
  if (!DOMINIOS_NORMA_PERMITIDOS.includes(parsed.hostname)) {
    return `apunta a "${parsed.hostname}", que no es una fuente normativa permitida`;
  }
  return null;
}

/**
 * Valida una TareaCatalogo contra el resto del catálogo (`mapa`, ya fusionado con overrides).
 * `t` no necesita estar presente en `mapa` (caso de una edición o tarea nueva aún no guardada):
 * la detección de ciclos usa `t` directamente como su propio nodo de partida. Valida también la
 * FORMA de los datos (no solo el contenido) porque una Server Action recibe JSON del cliente sin
 * garantía de tipos en runtime — un array corrupto guardado aquí rompe el render para cualquier
 * usuario que abra la tarea, no solo para el admin que la editó.
 */
export function validarTareaCatalogo(
  t: TareaCatalogo,
  mapa: Map<string, TareaCatalogo>,
  contexto: ContextoValidacionCatalogo,
): string[] {
  const errores: string[] = [];

  if (!PLANTILLA_ID_VALIDO.test(t.plantillaId)) {
    errores.push('plantillaId solo puede tener letras, números, "-" y "_"');
  }

  for (const c of CAMPOS_TEXTO_OBLIGATORIOS) {
    if (typeof t[c] !== 'string' || !t[c].trim()) errores.push(`campo "${c}" vacío`);
  }
  for (const c of CAMPOS_ARRAY_TEXTO) {
    if (!esArrayDeStrings(t[c])) {
      errores.push(`campo "${c}" debe ser una lista de texto`);
    } else if (CAMPOS_ARRAY_OBLIGATORIOS.includes(c) && t[c].length === 0) {
      errores.push(`campo "${c}" vacío`);
    }
  }
  if (!Number.isInteger(t.dificultad) || t.dificultad < 1 || t.dificultad > 5) {
    errores.push('dificultad debe ser un número entero entre 1 y 5');
  }
  if (typeof t.horasEstimadas !== 'number' || !Number.isFinite(t.horasEstimadas) || t.horasEstimadas <= 0) {
    errores.push('horasEstimadas debe ser un número mayor que 0');
  } else if (t.horasEstimadas > HORAS_MAX_TAREA) {
    errores.push(`horasEstimadas no puede superar ${HORAS_MAX_TAREA} h: divide la tarea`);
  }
  if (!PRIORIDADES.includes(t.prioridad)) {
    errores.push(`prioridad "${t.prioridad}" no es un valor válido`);
  }

  if (esArrayDeStrings(t.dependeDe)) {
    for (const dep of t.dependeDe) {
      if (dep !== t.plantillaId && !mapa.has(dep)) {
        errores.push(`dependeDe referencia "${dep}", que no existe en el catálogo`);
      }
    }

    const VISITANDO = 1;
    const VISITADO = 2;
    const estado = new Map<string, number>();
    const visitar = (id: string, pila: string[]): void => {
      if (estado.get(id) === VISITADO) return;
      if (estado.get(id) === VISITANDO) {
        errores.push(`ciclo en dependeDe: ${[...pila, id].join(' -> ')}`);
        return;
      }
      estado.set(id, VISITANDO);
      const nodo = id === t.plantillaId ? t : mapa.get(id);
      if (nodo && esArrayDeStrings(nodo.dependeDe)) {
        for (const dep of nodo.dependeDe) visitar(dep, [...pila, id]);
      }
      estado.set(id, VISITADO);
    };
    visitar(t.plantillaId, []);
  }

  if (esArrayDeStrings(t.guiaIds)) {
    for (const guiaId of t.guiaIds) {
      if (!contexto.leccionesIds.has(guiaId)) {
        errores.push(`guiaIds referencia "${guiaId}", que no existe en LECCIONES`);
      }
    }
  }

  {
    const grupo = contexto.grupos.find((g) => g.id === t.grupo);
    if (!grupo) {
      errores.push(`grupo "${t.grupo}" no existe en GRUPOS`);
    } else if (!grupo.subgrupos.includes(t.subgrupo)) {
      errores.push(`subgrupo "${t.subgrupo}" no existe en el grupo "${t.grupo}"`);
    }
    if (!contexto.categorias.includes(t.categoria)) {
      errores.push(`categoria "${t.categoria}" no es un valor válido`);
    }
  }

  if (!Array.isArray(t.notasIngenieria)) {
    errores.push('campo "notasIngenieria" debe ser una lista');
  } else {
    for (const [i, nota] of t.notasIngenieria.entries()) {
      if (!esNotaValida(nota)) {
        errores.push(`notasIngenieria[${i}] tiene forma inválida`);
        continue;
      }
      if (nota.fuente === null && !nota.verificar) {
        errores.push(`notasIngenieria[${i}] tiene fuente null pero verificar no es true`);
      }
      if (nota.url) {
        const error = errorUrlNorma(nota.url);
        if (error) errores.push(`notasIngenieria[${i}].url ${error}`);
        if (!nota.fuente) errores.push(`notasIngenieria[${i}] tiene url pero no fuente`);
      }
    }
  }

  return errores;
}
