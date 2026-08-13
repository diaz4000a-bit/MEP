import { REF, notaNorma, notaNormaVerificar } from './normas';
import type { TareaCatalogo } from '../types';

export const CATALOGO_04: TareaCatalogo[] = [
  {
    plantillaId: 'PB-04-01',
    nombreOriginal: '',
    nombre: 'Ejecutar la detección de interferencias entre la instalación eléctrica y arquitectura, estructura y HVAC',
    grupo: '04-coordinacion',
    subgrupo: 'Detección de interferencias',
    categoria: 'Coordinación MEP',
    disciplina: 'Eléctrica',
    dificultad: 3,
    horasEstimadas: 8,
    prioridad: 'Alta',
    dependeDe: ['PB-01-08', 'PB-02-14'],
    guiaIds: ['M6.1', 'M6.2'],
    descripcion:
      'Ronda de detección de interferencias (clash detection) entre el modelo eléctrico y los modelos vinculados de arquitectura, estructura e HVAC, usando el comando "Verificación de interferencias" de Revit para encontrar choques físicos antes de construcción.',
    objetivo:
      'Identificar y documentar todas las interferencias geométricas entre elementos eléctricos (bandejas, tubería, tableros, luminarias, tomacorrientes) y elementos de las demás disciplinas, generando un informe que sirva de base para su corrección.',
    requisitos: [
      'Modelos vinculados de arquitectura, estructura y HVAC cargados y actualizados a la última versión central.',
      'Categorías eléctricas relevantes visibles en el modelo, sin filtros de vista que las oculten.',
      'Workset del modelo eléctrico sincronizado antes de iniciar la verificación.',
    ],
    procedimiento: [
      'Abrir la pestaña "Insertar" > "Administrar vínculos" y confirmar que los vínculos de arquitectura, estructura y HVAC están en estado "Cargado" y actualizados.',
      'Ir a la pestaña "Colaborar" > grupo "Coordinar" > comando "Verificación de interferencias" > "Ejecutar verificación de interferencias".',
      'En el cuadro de diálogo, seleccionar en la primera columna las categorías eléctricas a verificar (bandejas portacables, tubo conduit, tableros, luminarias, tomacorrientes) y en la segunda columna el modelo vinculado de la disciplina a comparar.',
      'Ejecutar la verificación y revisar el informe de resultados, que agrupa las interferencias por par de categorías con el ID de cada elemento.',
      'Exportar el informe con el botón "Exportar" del cuadro de resultados en formato HTML para conservar un registro con IDs y ubicación de cada interferencia.',
      'Repetir la verificación por cada disciplina (arquitectónica, estructural, HVAC) generando un informe independiente por par de disciplinas.',
      'Guardar los informes exportados en la carpeta del proyecto correspondiente a la ronda de coordinación, identificada con la fecha de la ronda.',
    ],
    resultadoEsperado:
      'Uno o varios informes de interferencias (HTML/PDF) que listan cada clash detectado entre la instalación eléctrica y las demás disciplinas, con el ID de elemento y la ubicación de cada interferencia, listos para pasar a registro y seguimiento.',
    criteriosVerificacion: [
      'Se ejecutó la verificación de interferencias contra las tres disciplinas: arquitectónica, estructural y HVAC.',
      'El informe de resultados de cada verificación fue exportado y almacenado en la carpeta del proyecto.',
      'Todas las categorías eléctricas relevantes (bandejas, tubería, tableros, luminarias, tomacorrientes) fueron incluidas en al menos una verificación.',
      'Los vínculos de las demás disciplinas estaban en estado "Cargado" y actualizados antes de ejecutar la verificación.',
      'Cada informe exportado contiene el ID de elemento y la ubicación de cada interferencia detectada.',
    ],
    notasIngenieria: [
      notaNorma('La detección de interferencias no termina en el choque geométrico: el espacio de trabajo frente a tableros y los pasillos de operación deben quedar libres, y solo se detectan si se modelan como sólidos y se incluyen en la comprobación.', REF.ESPACIOS_MONTAJE),
      notaNormaVerificar('Las distancias de seguridad a partes energizadas son un requisito normativo, no una holgura de coordinación; verificar el valor aplicable al nivel de tensión de cada zona.', REF.DISTANCIAS_SEGURIDAD),
    ],
    tipsRevit: [
      'El comando "Verificación de interferencias" está en la pestaña Colaborar, grupo Coordinar; el botón "Mostrar" del cuadro de resultados aísla cada par de elementos en interferencia en la vista activa.',
      'Usa "Administrar vínculos" (pestaña Insertar) para confirmar que cada vínculo está en estado "Cargado" y no "No encontrado" antes de correr la verificación; de lo contrario el resultado será incompleto.',
      'Guarda una "Selección con nombre" (pestaña Modificar) para los elementos eléctricos habitualmente involucrados en clashes recurrentes y reutilízala en las siguientes rondas.',
      'El botón "Actualizar ahora" dentro del cuadro de resultados de interferencias recalcula el informe sin cerrar el diálogo, útil tras mover elementos durante la revisión.',
    ],
    nuevo: true,
  },
  {
    plantillaId: 'PB-04-02',
    nombreOriginal: '',
    nombre: 'Registrar y hacer seguimiento a los conflictos detectados en la ronda de coordinación hasta su resolución',
    grupo: '04-coordinacion',
    subgrupo: 'Corrección de conflictos',
    categoria: 'Coordinación MEP',
    disciplina: 'Eléctrica',
    dificultad: 3,
    horasEstimadas: 6,
    prioridad: 'Alta',
    dependeDe: ['PB-04-01'],
    guiaIds: ['M6.3', 'M6.4'],
    descripcion:
      'Registro, asignación y seguimiento de cada conflicto detectado en la ronda de interferencias hasta su cierre. La plataforma incluye una función que convierte el informe PDF de un reporte de coordinación (clashes) en un listado de tareas en formato JSON importable, siguiendo el flujo descrito en prompt-incidencias.md, lo que evita transcribir manualmente cada interferencia.',
    objetivo:
      'Convertir el informe de interferencias de PB-04-01 en incidencias trazables dentro de la plataforma, con responsable y severidad asignados, y confirmar en el modelo que cada conflicto quedó resuelto antes de cerrar la ronda de coordinación.',
    requisitos: [
      'Informe(s) de interferencias exportados en la tarea "Ejecutar la detección de interferencias..." (PB-04-01).',
      'Acceso al módulo de incidencias de la plataforma MEP Manager para importar el listado de conflictos.',
      'Criterios de priorización de conflictos (crítico, mayor, menor) acordados con el equipo de coordinación.',
    ],
    procedimiento: [
      'Tomar el informe de interferencias exportado en PB-04-01 (HTML/PDF) como insumo de la ronda de coordinación.',
      'Cargar el informe en el módulo de incidencias de la plataforma, que sigue el flujo de prompt-incidencias.md para convertir el reporte de clashes en un listado de tareas en formato JSON importable.',
      'Revisar el listado generado y clasificar cada conflicto por severidad (crítico, mayor, menor) y por disciplina responsable de la corrección.',
      'Asignar cada conflicto a un responsable dentro de la plataforma, indicando el ID de Revit del elemento eléctrico involucrado y su ubicación.',
      'Corregir el elemento eléctrico en el modelo de Revit según la solución acordada (reubicar, redimensionar o cambiar de tipo) y sincronizar con el modelo central.',
      'Marcar el conflicto como resuelto en la plataforma, adjuntando evidencia (captura de la vista 3D aislada o referencia al ID de la interferencia).',
      'Ejecutar nuevamente la verificación de interferencias de PB-04-01 sobre el mismo par de disciplinas para confirmar que el conflicto ya no aparece.',
      'Cerrar la ronda de coordinación cuando el número de conflictos abiertos llegue al nivel acordado con el equipo de proyecto.',
    ],
    resultadoEsperado:
      'Todos los conflictos del informe de interferencias quedan registrados como incidencias en la plataforma, con responsable, severidad y estado, y una nueva verificación de interferencias confirma que los conflictos cerrados ya no están presentes en el modelo.',
    criteriosVerificacion: [
      'El informe de interferencias fue importado al módulo de incidencias y generó una tarea por cada conflicto detectado en PB-04-01.',
      'Cada incidencia registrada tiene un responsable y una severidad asignados.',
      'Los conflictos marcados como resueltos ya no aparecen al repetir la verificación de interferencias sobre el mismo par de disciplinas.',
      'Cada incidencia cerrada cuenta con evidencia adjunta (captura o referencia al elemento corregido).',
      'Ninguna incidencia de la ronda queda en estado "sin revisar" al momento de cerrar la ronda de coordinación.',
    ],
    notasIngenieria: [
      notaNorma('Un conflicto cerrado moviendo la instalación eléctrica puede alterar el diseño; cuando el cambio afecta criterios técnicos debe validarlo el diseñador responsable y no resolverse solo en el modelo.', REF.RESPONSABILIDAD_DISENADOR),
    ],
    tipsRevit: [
      'Usa el "ID de elemento" que entrega el informe de Verificación de interferencias (clic derecho > "Seleccionar por ID") para ubicar en el modelo el elemento eléctrico exacto reportado en la incidencia.',
      'Aísla el elemento en conflicto con "Aislar elemento" desde la barra de control de vista antes de corregirlo, para evitar mover por error elementos de otras disciplinas.',
      'Sincroniza con central (pestaña Colaborar > "Sincronizar con central") después de corregir el elemento y antes de volver a ejecutar la verificación de interferencias, o el vínculo seguirá mostrando la versión anterior.',
      'Crea un filtro de vista temporal por un parámetro compartido de estado de incidencia para visualizar en el modelo qué elementos ya fueron corregidos y cuáles siguen pendientes.',
    ],
    nuevo: true,
  },
];
