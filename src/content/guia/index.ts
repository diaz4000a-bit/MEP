import { M1 } from './M1';
import { M2 } from './M2';
import { M3 } from './M3';
import { M4 } from './M4';
import { M5 } from './M5';
import { M6 } from './M6';

// TODO: M7 (Revisión y QC), M8 (Automatización), M9 (Buenas prácticas) — pendientes.
// Ver PLAN-MEJORAS.md § C Fase 5 para el temario completo de las 46 lecciones.
export const GUIA_MODULOS = [M1, M2, M3, M4, M5, M6];

export const LECCIONES = new Map(
  GUIA_MODULOS.flatMap((m) => m.lecciones.map((l) => [l.id, l] as const)),
);
