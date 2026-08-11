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
  fuente: string | null;       // 'RETIE Art. 20.2' | null
  verificar: boolean;          // true si `fuente` es null → se pinta con aviso
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
