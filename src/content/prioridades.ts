import type { Prioridad } from '@/types';

/** Orden de mayor a menor. Reemplaza las copias sueltas del array en actions y componentes. */
export const PRIORIDADES: Prioridad[] = ['Alta', 'Media', 'Baja'];

/**
 * Tope de horas de una tarea de catálogo. Una tarea de modelado que se estima por encima de
 * una semana laboral no es una tarea: hay que partirla. El validador lo usa como cota dura.
 */
export const HORAS_MAX_TAREA = 40;
