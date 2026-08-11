import type { GrupoId } from '@/types';

export interface Grupo {
  id: GrupoId;
  n: number;
  nombre: string;
  icon: string;
  subgrupos: string[];
}

export const GRUPOS: Grupo[] = [
  { id: '01-gestion', n: 1, nombre: 'Gestión y preparación', icon: 'ti-settings-cog',
    subgrupos: ['Información inicial', 'Archivos y vínculos', 'Parámetros', 'Configuración del proyecto', 'Predimensionamiento'] },
  { id: '02-modelado', n: 2, nombre: 'Modelado', icon: 'ti-box',
    subgrupos: ['Acometidas y subestación', 'Distribución BT', 'Iluminación', 'Tomacorrientes y fuerza', 'Canalizaciones', 'Sistemas especiales', 'Puesta a tierra y apantallamiento'] },
  { id: '03-documentacion', n: 3, nombre: 'Documentación', icon: 'ti-file-description',
    subgrupos: ['Vistas', 'Planos', 'Detalles', 'Anotaciones', 'Tablas y cuantificaciones', 'Memorias y cálculos'] },
  { id: '04-coordinacion', n: 4, nombre: 'Coordinación BIM', icon: 'ti-affiliate',
    subgrupos: ['Coordinación interdisciplinaria', 'Detección de interferencias', 'Revisión de modelos vinculados', 'Corrección de conflictos'] },
  { id: '05-calidad', n: 5, nombre: 'Control de calidad', icon: 'ti-shield-check',
    subgrupos: ['Revisión del modelo', 'Parámetros y datos', 'Nomenclatura', 'Duplicados y warnings', 'Revisión de planos'] },
  { id: '06-entregables', n: 6, nombre: 'Entregables', icon: 'ti-package-export',
    subgrupos: ['Preparación de planos', 'Entregables Operador de Red', 'Exportaciones', 'Publicación', 'Entrega al cliente'] },
  { id: '07-seguimiento', n: 7, nombre: 'Seguimiento y gestión', icon: 'ti-timeline-event',
    subgrupos: ['Incidencias', 'Revisiones y cambios', 'Fechas y horas'] },
  { id: '08-automatizacion', n: 8, nombre: 'Automatización y productividad', icon: 'ti-wand',
    subgrupos: ['Dynamo', 'Scripts y complementos', 'Plantillas reutilizables'] },
];
