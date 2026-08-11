import { CATALOGO_TAREAS, CATALOGO_TAREAS_MAP } from '../src/content/catalogo-tareas';
import { GRUPOS } from '../src/content/grupos';
import { GUIA_MODULOS, LECCIONES } from '../src/content/guia';
import type { Categoria } from '../src/types';
import plantillaV1 from './plantilla-v1.json';

const CATEGORIAS: Categoria[] = [
  'Configuración BIM', 'Modelado', 'Tableros', 'Iluminación',
  'Tomacorrientes', 'Ductos y Bandejas', 'Acometidas', 'Sistemas Especiales',
  'Coordinación MEP', 'Documentación', 'Revisión y QC', 'Entrega',
];

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

// 2. Ningún campo obligatorio vacío en las 78 entradas.
{
  const camposTexto: (keyof (typeof CATALOGO_TAREAS)[number])[] = [
    'plantillaId', 'nombre', 'subgrupo', 'disciplina', 'descripcion', 'objetivo', 'resultadoEsperado',
  ];
  const camposArray: (keyof (typeof CATALOGO_TAREAS)[number])[] = [
    'requisitos', 'procedimiento', 'criteriosVerificacion',
  ];
  for (const t of CATALOGO_TAREAS) {
    for (const c of camposTexto) {
      if (!String(t[c] ?? '').trim()) fallo(`[2] ${t.plantillaId}: campo "${c}" vacío`);
    }
    for (const c of camposArray) {
      if (!Array.isArray(t[c]) || (t[c] as unknown[]).length === 0) {
        fallo(`[2] ${t.plantillaId}: campo "${c}" vacío`);
      }
    }
  }
}

// 3. Todo plantillaId en dependeDe existe en el catálogo.
for (const t of CATALOGO_TAREAS) {
  for (const dep of t.dependeDe) {
    if (!CATALOGO_TAREAS_MAP.has(dep)) {
      fallo(`[3] ${t.plantillaId}: dependeDe referencia "${dep}", que no existe en el catálogo`);
    }
  }
}

// 4. Sin ciclos en dependeDe.
{
  const VISITANDO = 1;
  const VISITADO = 2;
  const estado = new Map<string, number>();

  const visitar = (id: string, pila: string[]): void => {
    const e = estado.get(id);
    if (e === VISITADO) return;
    if (e === VISITANDO) {
      fallo(`[4] Ciclo en dependeDe: ${[...pila, id].join(' -> ')}`);
      return;
    }
    estado.set(id, VISITANDO);
    const t = CATALOGO_TAREAS_MAP.get(id);
    if (t) for (const dep of t.dependeDe) visitar(dep, [...pila, id]);
    estado.set(id, VISITADO);
  };

  for (const t of CATALOGO_TAREAS) visitar(t.plantillaId, []);
}

// 5. Todo guiaId existe en LECCIONES.
for (const t of CATALOGO_TAREAS) {
  for (const guiaId of t.guiaIds) {
    if (!LECCIONES.has(guiaId)) {
      fallo(`[5] ${t.plantillaId}: guiaIds referencia "${guiaId}", que no existe en LECCIONES`);
    }
  }
}

// 6. Todo grupo/subgrupo existe en GRUPOS; toda categoria es uno de los 12 valores.
{
  const gruposValidos = new Map(GRUPOS.map((g) => [g.id, g]));
  for (const t of CATALOGO_TAREAS) {
    const g = gruposValidos.get(t.grupo);
    if (!g) {
      fallo(`[6] ${t.plantillaId}: grupo "${t.grupo}" no existe en GRUPOS`);
    } else if (!g.subgrupos.includes(t.subgrupo)) {
      fallo(`[6] ${t.plantillaId}: subgrupo "${t.subgrupo}" no existe en el grupo "${t.grupo}"`);
    }
    if (!CATEGORIAS.includes(t.categoria)) {
      fallo(`[6] ${t.plantillaId}: categoria "${t.categoria}" no es uno de los 12 valores válidos`);
    }
  }
}

// 7. Toda NotaIngenieria con fuente: null tiene verificar: true.
for (const t of CATALOGO_TAREAS) {
  for (const [i, nota] of t.notasIngenieria.entries()) {
    if (nota.fuente === null && !nota.verificar) {
      fallo(`[7] ${t.plantillaId}: notasIngenieria[${i}] tiene fuente null pero verificar no es true`);
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
