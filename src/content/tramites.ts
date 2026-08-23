import type { EstadoTramite, TipoTramite } from '@/types';

/**
 * Catálogo de trámites externos de un proyecto eléctrico en Colombia.
 *
 * Vive en código, NO en Firestore (mismo criterio que `categorias.ts` y el catálogo de
 * tareas): es contenido pedagógico y de plantilla, no dato de proyecto. Cada tipo trae la
 * entidad típica y el plazo legal/comercial de respuesta, que el diálogo usa para proponer
 * `fechaLimite` al radicar en vez de dejar al usuario adivinándola.
 */

/** Orden en que aparecen en el selector: sigue la secuencia real del proyecto. */
export const TIPOS_TRAMITE: TipoTramite[] = [
  'Disponibilidad de servicio',
  'Aprobación de proyecto ante OR',
  'Licencia de construcción',
  'Permiso de conexión',
  'Certificación RETIE',
  'Certificación RETILAP',
  'Aprobación de alumbrado público',
  'Concepto de bomberos',
  'Legalización y puesta en servicio',
  'Otro',
];

/** Orden de los estados. Es también el orden de las porciones de la torta. */
export const ESTADOS_TRAMITE: EstadoTramite[] = [
  'Sin iniciar',
  'En preparación',
  'Radicado',
  'Subsanación',
  'Aprobado',
  'Rechazado',
];

export interface FichaTramite {
  tipo: TipoTramite;
  /** Quién resuelve. Texto por defecto, editable: cambia según ciudad y operador de red. */
  entidad: string;
  /**
   * Días calendario de respuesta que se usan para PROPONER la fecha límite al radicar.
   * Son plazos de referencia, no una garantía: el trámite real puede traer su propio
   * plazo en el acuse de radicado y ese es el que manda. 0 = sin plazo de referencia.
   */
  diasRespuesta: number;
  descripcion: string;
}

export const FICHAS_TRAMITE: Record<TipoTramite, FichaTramite> = {
  'Disponibilidad de servicio': {
    tipo: 'Disponibilidad de servicio',
    entidad: 'Operador de red',
    diasRespuesta: 15,
    descripcion:
      'Solicitud al operador de red de la carga disponible y el punto de conexión. Condiciona el diseño de la acometida y el cuarto técnico, así que va antes de dimensionar tableros.',
  },
  'Aprobación de proyecto ante OR': {
    tipo: 'Aprobación de proyecto ante OR',
    entidad: 'Operador de red',
    diasRespuesta: 30,
    descripcion:
      'Radicación de planos, memorias y diagramas unifilares ante el operador de red para su visto bueno previo a la construcción.',
  },
  'Licencia de construcción': {
    tipo: 'Licencia de construcción',
    entidad: 'Curaduría urbana',
    diasRespuesta: 45,
    descripcion:
      'Licencia de la curaduría. El proyecto eléctrico va como anexo técnico; una subsanación aquí congela toda la obra.',
  },
  'Permiso de conexión': {
    tipo: 'Permiso de conexión',
    entidad: 'Operador de red',
    diasRespuesta: 30,
    descripcion:
      'Autorización formal para conectarse a la red una vez aprobado el proyecto y ejecutada la obra.',
  },
  'Certificación RETIE': {
    tipo: 'Certificación RETIE',
    entidad: 'Organismo de inspección acreditado (ONAC)',
    diasRespuesta: 20,
    descripcion:
      'Inspección y certificación de conformidad de la instalación. Sin ella el operador de red no energiza. Ver RETIE (Resolución 40284 de 2026).',
  },
  'Certificación RETILAP': {
    tipo: 'Certificación RETILAP',
    entidad: 'Organismo de inspección acreditado (ONAC)',
    diasRespuesta: 20,
    descripcion:
      'Certificación de conformidad de iluminación y alumbrado. Aplica cuando hay alumbrado público o espacios con niveles de iluminancia reglamentados.',
  },
  'Aprobación de alumbrado público': {
    tipo: 'Aprobación de alumbrado público',
    entidad: 'Operador de alumbrado público / municipio',
    diasRespuesta: 30,
    descripcion:
      'Visto bueno del diseño de alumbrado público antes de entregarlo al operador que lo va a administrar.',
  },
  'Concepto de bomberos': {
    tipo: 'Concepto de bomberos',
    entidad: 'Cuerpo Oficial de Bomberos',
    diasRespuesta: 15,
    descripcion:
      'Concepto técnico de seguridad humana y protección contra incendio. Toca detección, alarma e iluminación de evacuación.',
  },
  'Legalización y puesta en servicio': {
    tipo: 'Legalización y puesta en servicio',
    entidad: 'Operador de red',
    diasRespuesta: 15,
    descripcion:
      'Cierre del ciclo: matrícula, instalación de medida y energización definitiva. Es el último trámite antes de entregar.',
  },
  Otro: {
    tipo: 'Otro',
    entidad: '',
    diasRespuesta: 0,
    descripcion: 'Trámite que no encaja en los tipos anteriores. Describe la entidad a mano.',
  },
};
