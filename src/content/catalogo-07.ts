import type { TareaCatalogo } from '../types';

export const CATALOGO_07: TareaCatalogo[] = [
  {
    plantillaId: 'PB-07-01',
    nombreOriginal: '',
    nombre: 'Registrar y triar en la plataforma las incidencias importadas del informe de coordinación',
    grupo: '07-seguimiento',
    subgrupo: 'Incidencias',
    categoria: 'Coordinación MEP',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-04-02'],
    guiaIds: ['M6.3', 'M6.4', 'M6.5'],
    descripcion:
      'La plataforma cuenta con un flujo que usa el prompt "prompt-incidencias.md" para convertir un ' +
      'informe PDF de coordinación/clashes en un lote de tareas importables en formato JSON, todas con ' +
      'categoría "Coordinación MEP". Esta tarea es el paso siguiente de ese flujo: tomar el lote importado ' +
      'y triar cada incidencia una por una, asignándole zona, responsable, prioridad y fecha límite, para ' +
      'que quede correctamente registrada y con seguimiento hasta su resolución en lugar de quedar como un ' +
      'ítem genérico sin dueño.',
    objetivo:
      'Convertir el lote de incidencias importado desde el informe de coordinación (vía prompt-incidencias.md) ' +
      'en tareas plenamente registradas y accionables, con zona, responsable, prioridad y fecha límite ' +
      'asignados, de modo que cada conflicto quede trazado hasta su cierre.',
    requisitos: [
      'Lote de incidencias importado en formato JSON generado por prompt-incidencias.md a partir del informe PDF de coordinación',
      'Acceso al proyecto en la plataforma con permisos para crear y editar tareas',
      'Listado actualizado de responsables del equipo y su disciplina asignada',
      'Cronograma del proyecto vigente para definir fechas límite coherentes',
    ],
    procedimiento: [
      'Importar el archivo JSON generado por prompt-incidencias.md en el módulo de tareas del proyecto.',
      'Revisar cada incidencia importada y verificar que la descripción y la ubicación coincidan con el informe de coordinación original.',
      'Asignar la zona del proyecto correspondiente a cada incidencia (nivel, área o sector).',
      'Asignar el responsable de cada incidencia según la disciplina involucrada en el conflicto.',
      'Clasificar la prioridad de cada incidencia (crítica, alta, media, baja) según su impacto en el cronograma.',
      'Definir la fecha límite de resolución de cada incidencia en función del cronograma del proyecto.',
      'Vincular cada incidencia registrada con la tarea de detección y registro de conflictos de origen (PB-04-02) para mantener trazabilidad.',
      'Publicar el lote de incidencias registradas para que cada responsable reciba la notificación de su asignación.',
    ],
    resultadoEsperado:
      'Todas las incidencias del informe de coordinación quedan registradas en la plataforma con zona, ' +
      'responsable, prioridad y fecha límite asignados, listas para seguimiento hasta su cierre.',
    criteriosVerificacion: [
      'Todas las incidencias del lote JSON importado están registradas como tareas en la plataforma',
      'Cada incidencia tiene zona, responsable, prioridad y fecha límite asignados, sin campos vacíos',
      'Ninguna incidencia registrada quedó fuera de la categoría "Coordinación MEP"',
      'Cada incidencia registrada referencia la tarea de detección de conflictos de origen',
      'Cada responsable asignado recibió la notificación de su incidencia',
    ],
    notasIngenieria: [
      {
        texto:
          'La prioridad asignada a cada incidencia conviene que refleje su impacto en la ruta crítica del ' +
          'cronograma y no solo la gravedad técnica del conflicto, para evitar que incidencias urgentes por ' +
          'plazo queden mal priorizadas.',
        fuente: null,
        verificar: true,
      },
      {
        texto:
          'Antes de registrar una incidencia importada conviene revisar si ya existe una tarea equivalente ' +
          'de una ronda de coordinación anterior, para no duplicar el seguimiento del mismo conflicto.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa el comando 'Seleccionar por ID' (pestaña Administrar > Selección) para ubicar en el modelo el elemento referenciado por el ID de clash del informe de coordinación.",
      "Registra el número de incidencia asignado en la plataforma en un parámetro compartido o en 'Comentarios' del elemento afectado, para dejar trazabilidad visible desde el propio modelo.",
      "Guarda una vista 3D por cada zona de conflicto, con el mismo encuadre de cámara del informe original, para revisar rápidamente cada incidencia durante el triaje.",
    ],
    nuevo: true,
  },
];
