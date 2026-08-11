import { M1 } from './M1';
import { M2 } from './M2';
import { M3 } from './M3';
import { M4 } from './M4';
import { M5 } from './M5';
import { M6 } from './M6';
import { M7 } from './M7';
import { M8 } from './M8';
import { M9 } from './M9';

export const GUIA_MODULOS = [M1, M2, M3, M4, M5, M6, M7, M8, M9];

export const LECCIONES = new Map(
  GUIA_MODULOS.flatMap((m) => m.lecciones.map((l) => [l.id, l] as const)),
);
