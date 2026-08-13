export type Rol = 'admin' | 'coordinador' | 'ingeniero' | 'modelador' | 'usuario';

export type EstadoTarea = 'Sin iniciar' | 'En progreso' | 'En revisión' | 'Completada' | 'Bloqueada';
export type Prioridad = 'Alta' | 'Media' | 'Baja';
export type EstadoProyecto = 'Sin iniciar' | 'En progreso' | 'Revisión' | 'Entregado';

/** Los 12 valores heredados de la v1. NO renombrar: `prompt-incidencias.md` depende de ellos. */
export type Categoria =
  | 'Configuración BIM' | 'Modelado' | 'Tableros' | 'Iluminación'
  | 'Tomacorrientes' | 'Ductos y Bandejas' | 'Acometidas' | 'Sistemas Especiales'
  | 'Coordinación MEP' | 'Documentación' | 'Revisión y QC' | 'Entrega';

export type GrupoId =
  | '01-gestion' | '02-modelado' | '03-documentacion' | '04-coordinacion'
  | '05-calidad' | '06-entregables' | '07-seguimiento' | '08-automatizacion';

export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
  creado: number;
  ultimoAcceso: number;
  guiaLeidas: string[];        // ids de lección: ['M1.1', 'M2.3']
  nombreLegacy?: string;       // nombre tal como aparecía en las tareas de la v1
}

export interface Proyecto {
  id: string;
  nombre: string;
  cliente: string;
  fechaInicio: string;         // 'YYYY-MM-DD'
  fechaEntrega: string;
  disciplina: string;
  software: string;
  estado: EstadoProyecto;
  notas: string;
  zonas: string[];
  creado: number;
  actualizado: number;
  // Denormalizados: se recalculan al escribir tareas. Evitan leer la subcolección
  // solo para pintar una barra de progreso en la lista de proyectos.
  totalTareas: number;
  tareasCompletadas: number;
  avanceTotal: number;         // 0-100
}

export interface NotaIngenieria {
  texto: string;
  /** Aparte citado, ya resuelto a texto. Ver `REF` en `src/content/normas.ts`. */
  fuente: string | null;
  /**
   * Enlace directo al documento oficial de la norma, anclado al aparte (`...pdf#page=42`).
   * OPCIONAL a propósito: las notas guardadas en Firestore antes de este campo no lo traen
   * y deben seguir leyéndose sin migración.
   */
  url?: string | null;
  /**
   * true → se pinta con aviso "verificar contra el criterio de diseño". Obligatorio cuando
   * `fuente` es null, pero también válido CON fuente: la norma fija el requisito y el
   * proyecto fija el valor (calibres, resistencia de SPT, niveles de iluminancia).
   */
  verificar: boolean;
}

/** Contenido pedagógico. Vive en `src/content/`, NO en Firestore. */
export interface TareaCatalogo {
  plantillaId: string;         // 'PB-01-01'
  nombreOriginal: string;      // literal de la v1 — trazabilidad, obligatorio
  nombre: string;
  grupo: GrupoId;
  subgrupo: string;
  categoria: Categoria;
  disciplina: string;
  dificultad: 1 | 2 | 3 | 4 | 5;
  /** Horas de modelado de fábrica. Semilla de `Tarea.horasEstimadas` al crear un proyecto. */
  horasEstimadas: number;
  /** Prioridad de fábrica. Semilla de `Tarea.prioridad` al crear un proyecto. */
  prioridad: Prioridad;
  dependeDe: string[];         // plantillaId[]
  guiaIds: string[];           // ['M5.1']
  descripcion: string;
  objetivo: string;
  requisitos: string[];
  procedimiento: string[];
  resultadoEsperado: string;
  criteriosVerificacion: string[];
  notasIngenieria: NotaIngenieria[];
  tipsRevit: string[];
  nuevo?: boolean;             // true si no existía en la plantilla v1
}

/**
 * Documento en `catalogoOverrides/{plantillaId}`. Overlay editable sobre `TareaCatalogo`
 * (que sigue viviendo en código, NO en Firestore). Un campo presente aquí gana sobre el
 * valor de fábrica del catálogo estático; un campo ausente cae al valor de fábrica.
 * Si `esNuevo` es true, el plantillaId no existe en el catálogo estático y este doc debe
 * traer TODOS los campos de contenido (no hay base que rellene huecos).
 */
export interface CatalogoOverride {
  plantillaId: string;
  oculto: boolean;
  esNuevo: boolean;
  actualizado: number;
  actualizadoPor: string;       // uid del admin
  nombreOriginal?: string;
  nombre?: string;
  grupo?: GrupoId;
  subgrupo?: string;
  categoria?: Categoria;
  disciplina?: string;
  dificultad?: 1 | 2 | 3 | 4 | 5;
  horasEstimadas?: number;
  prioridad?: Prioridad;
  dependeDe?: string[];
  guiaIds?: string[];
  descripcion?: string;
  objetivo?: string;
  requisitos?: string[];
  procedimiento?: string[];
  resultadoEsperado?: string;
  criteriosVerificacion?: string[];
  notasIngenieria?: NotaIngenieria[];
  tipsRevit?: string[];
}

/** Documento en `proyectos/{id}/tareas/{id}`. Los campos de contenido son OVERRIDE opcional. */
export interface Tarea {
  id: string;
  proyectoId: string;
  plantillaId: string | null;
  nombre: string;
  categoria: Categoria;
  grupo: GrupoId | null;
  subgrupo: string | null;
  zona: string | null;
  etapa: string | null;        // legacy v1, se conserva
  responsableUid: string | null;
  responsable: string;         // legacy v1: nombre libre. Fallback si no hay uid
  prioridad: Prioridad;
  estado: EstadoTarea;
  porcentaje: number;
  fechaInicio: string;
  fechaLimite: string;
  fechaCompletada: string;
  horasEstimadas: number;
  horasReales: number;
  comentarios: string;
  bloqueadoPor: string;
  verificacion: Record<number, boolean>;   // índice del criterio → marcado
  historial: { f: number; p: number; e: EstadoTarea }[];  // tope 60
  actualizado: number;
  // Overrides de contenido: si están, ganan sobre el catálogo
  descripcion?: string;
  objetivo?: string;
  requisitos?: string[];
  procedimiento?: string[];
  resultadoEsperado?: string;
  criteriosVerificacion?: string[];
  notasIngenieria?: NotaIngenieria[];
  tipsRevit?: string[];
}

export interface Jornada {
  id: string;
  uid: string;
  usuarioNombre: string;
  proyectoId: string;
  proyectoNombre: string;
  fecha: string;               // 'YYYY-MM-DD' local
  entrada: number;             // ms
  salida: number | null;
  duracionMin: number | null;  // se calcula AL CERRAR y se guarda
  estado: 'abierta' | 'cerrada' | 'anulada';
  tareaId: string | null;
  tareaNombre: string | null;
  notas: string;
  creado: number;
  actualizado: number;
}

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

export interface BloqueHorario {
  inicio: string;   // 'HH:mm'
  fin: string;      // 'HH:mm'
}

export interface DiaHorario {
  manana: BloqueHorario | null;
  tarde: BloqueHorario | null;
}

/** Horario semanal objetivo de un empleado. Documento en `horarios/{uid}`. */
export interface HorarioSemanal {
  uid: string;
  dias: Record<DiaSemana, DiaHorario>;
  actualizado: number;
}

export interface Leccion {
  id: string;                  // 'M1.1'
  titulo: string;
  minutos: number;
  queEs: string;
  paraQueSirve: string;
  cuandoUsarlo: string;
  procedimiento: string[];
  erroresFrecuentes: string[];
  buenasPracticas: string[];
  ejemploAplicado: string;
  tareasRelacionadas: string[];  // plantillaId[] — obligatorio, mínimo 1
}
