import { CATEGORIAS } from '../src/content/categorias';
import { CATALOGO_TAREAS, CATALOGO_TAREAS_MAP } from '../src/content/catalogo-tareas';
import { GRUPOS } from '../src/content/grupos';
import { GUIA_MODULOS, LECCIONES } from '../src/content/guia';
import { validarTareaCatalogo } from '../src/lib/catalogo-validacion';
import plantillaV1 from './plantilla-v1.json';

const errores: string[] = [];
const fallo = (msg: string) => errores.push(msg);

// 1. Los nombreOriginal de las tareas heredadas de la v1 coinciden literalmente con PLANTILLA_BASE.
{
  const plantillaSet = new Set(plantillaV1 as string[]);
  const usados = new Set<string>();
  for (const t of CATALOGO_TAREAS) {
    if (t.nuevo) continue;
    if (!t.nombreOriginal || !plantillaSet.has(t.nombreOriginal)) {
      fallo(`[1] ${t.plantillaId}: nombreOriginal "${t.nombreOriginal}" no está en PLANTILLA_BASE de la v1`);
    } else {
      usados.add(t.nombreOriginal);
    }
  }
  for (const nombre of plantillaSet) {
    if (!usados.has(nombre)) fallo(`[1] Falta en el catálogo una tarea de la v1: "${nombre}"`);
  }
}

// 2-7. Campos obligatorios, dependeDe (existe y sin ciclos), guiaIds, grupo/subgrupo/categoria,
// notasIngenieria — misma lógica que usa el "modo editor" al guardar un override (DRY, ver
// src/lib/catalogo-validacion.ts).
{
  const contexto = { grupos: GRUPOS, categorias: CATEGORIAS, leccionesIds: new Set(LECCIONES.keys()) };
  for (const t of CATALOGO_TAREAS) {
    for (const e of validarTareaCatalogo(t, CATALOGO_TAREAS_MAP, contexto)) {
      fallo(`[2-7] ${t.plantillaId}: ${e}`);
    }
  }
}

// 8. Todo ejemploAplicado (vía tareasRelacionadas) referencia un plantillaId existente.
for (const modulo of GUIA_MODULOS) {
  for (const leccion of modulo.lecciones) {
    if (!leccion.tareasRelacionadas || leccion.tareasRelacionadas.length === 0) {
      fallo(`[8] ${leccion.id}: tareasRelacionadas vacío (obligatorio, mínimo 1)`);
      continue;
    }
    for (const id of leccion.tareasRelacionadas) {
      if (!CATALOGO_TAREAS_MAP.has(id)) {
        fallo(`[8] ${leccion.id}: tareasRelacionadas referencia "${id}", que no existe en el catálogo`);
      }
    }
  }
}

console.log(`Catálogo: ${CATALOGO_TAREAS.length} tareas. Guía: ${GUIA_MODULOS.reduce((s, m) => s + m.lecciones.length, 0)} lecciones.`);

if (errores.length > 0) {
  console.error(`\n${errores.length} error(es):\n`);
  for (const e of errores) console.error(' - ' + e);
  process.exit(1);
} else {
  console.log('Validación de contenido: OK (8/8 comprobaciones limpias).');
}
