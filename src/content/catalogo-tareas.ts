import type { TareaCatalogo } from '../types';
import { CATALOGO_01 } from './catalogo-01';
import { CATALOGO_02 } from './catalogo-02';
import { CATALOGO_03 } from './catalogo-03';
import { CATALOGO_04 } from './catalogo-04';
import { CATALOGO_05 } from './catalogo-05';
import { CATALOGO_06 } from './catalogo-06';
import { CATALOGO_07 } from './catalogo-07';
import { CATALOGO_08 } from './catalogo-08';

export const CATALOGO_TAREAS: TareaCatalogo[] = [
  ...CATALOGO_01,
  ...CATALOGO_02,
  ...CATALOGO_03,
  ...CATALOGO_04,
  ...CATALOGO_05,
  ...CATALOGO_06,
  ...CATALOGO_07,
  ...CATALOGO_08,
];

export const CATALOGO_TAREAS_MAP: Map<string, TareaCatalogo> = new Map(
  CATALOGO_TAREAS.map((t) => [t.plantillaId, t]),
);
