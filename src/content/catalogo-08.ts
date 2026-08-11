import type { TareaCatalogo } from '../types';

export const CATALOGO_08: TareaCatalogo[] = [
  {
    plantillaId: 'PB-08-01',
    nombreOriginal: '',
    nombre: 'Crear una rutina Dynamo para renombrar y numerar tableros y circuitos eléctricos automáticamente',
    grupo: '08-automatizacion',
    subgrupo: 'Dynamo',
    categoria: 'Configuración BIM',
    disciplina: 'Eléctrica',
    dificultad: 5,
    dependeDe: [],
    guiaIds: ['M8.1', 'M8.2'],
    descripcion:
      'Rutina en Dynamo que recorre los tableros y circuitos eléctricos del modelo y les asigna de forma automática un nombre y una numeración consecutiva según las reglas del estudio, evitando el renombrado manual elemento por elemento.',
    objetivo:
      'Automatizar el renombrado y la numeración secuencial de tableros y circuitos eléctricos mediante Dynamo, reduciendo errores de digitación y el tiempo dedicado a esta tarea repetitiva.',
    requisitos: [
      'Tener Dynamo for Revit disponible (viene integrado con la instalación de Revit).',
      "Conocer el parámetro de tipo o de ejemplar donde se guarda el nombre y el número (p. ej. 'Panel Name', 'Circuit Number' o un parámetro compartido del estudio).",
      'Definir previamente el criterio de orden para la numeración (por ubicación, por nivel o por tipo de tablero).',
      'Tener el modelo con los tableros y circuitos ya creados en el proyecto.',
    ],
    procedimiento: [
      'Abrir Dynamo desde la pestaña Administrar > Dynamo y crear un archivo nuevo (.dyn) para la rutina.',
      "Usar los nodos 'Categories' y 'All Elements of Category' para recolectar los tableros (Electrical Equipment) o los circuitos (Electrical Circuits) del modelo.",
      "Obtener la ubicación o el nivel de cada elemento y ordenar la lista con 'List.SortByKey' según el criterio definido.",
      "Generar los nombres o números consecutivos combinando un prefijo fijo con un índice mediante nodos como 'String.Concat' o 'Formatting String from Object'.",
      "Escribir el resultado en el modelo con 'Element.SetParameterByName', apuntando al parámetro de nombre o número definido en los requisitos.",
      'Ejecutar la rutina en modo manual (Run) sobre una copia de prueba del modelo antes de aplicarla al proyecto real.',
      'Revisar en una tabla de planificación de tableros o circuitos que los valores asignados sean correctos y no existan duplicados.',
      'Guardar la rutina (.dyn) en la biblioteca de scripts del estudio para reutilizarla en otros proyectos.',
    ],
    resultadoEsperado:
      'Todos los tableros y circuitos seleccionados quedan renombrados y numerados de forma consecutiva y sin intervención manual, siguiendo el criterio de orden definido.',
    criteriosVerificacion: [
      'La rutina Dynamo se ejecuta de principio a fin sin errores en los nodos.',
      'Ningún tablero o circuito queda con nombre o número duplicado tras ejecutar la rutina.',
      'El valor escrito por Dynamo coincide con el que se muestra en las tablas de planificación del proyecto.',
      'La numeración sigue el criterio de orden definido (ubicación, nivel o tipo) sin saltos ni inconsistencias.',
      'La rutina (.dyn) queda guardada en la biblioteca del estudio para reutilización posterior.',
    ],
    notasIngenieria: [
      {
        texto:
          'La convención de nomenclatura y numeración de tableros y circuitos depende de los estándares internos del estudio; no existe una norma única aplicable a todos los proyectos.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa 'Dynamo Player' (pestaña Administrar) para ejecutar la rutina sin abrir el entorno completo de Dynamo, útil para que otros miembros del equipo la reutilicen.",
      "El nodo 'Element.SetParameterByName' requiere que el parámetro ya exista en el proyecto; créalo antes con el Editor de parámetros compartidos si aún no está disponible.",
      "Filtra por categoría 'Electrical Equipment' para tableros y 'Electrical Circuits' para circuitos con el nodo 'Categories' de Dynamo.",
      'Prueba siempre la rutina sobre un archivo de respaldo antes de ejecutarla en el modelo real, para evitar sobrescribir parámetros por error.',
    ],
    nuevo: true,
  },
  {
    plantillaId: 'PB-08-02',
    nombreOriginal: '',
    nombre: 'Construir la biblioteca de plantillas de vista reutilizables del estudio',
    grupo: '08-automatizacion',
    subgrupo: 'Plantillas reutilizables',
    categoria: 'Configuración BIM',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-03-01'],
    guiaIds: ['M3.2', 'M8.3'],
    descripcion:
      'Conjunto de plantillas de vista, filtros gráficos y sobrescrituras (overrides) guardados como estándar del estudio, listos para transferirse a cualquier proyecto nuevo sin reconfigurar la apariencia de cada vista desde cero.',
    objetivo:
      'Construir una biblioteca de plantillas de vista reutilizables, con sus filtros y sobrescrituras gráficas asociadas, que el estudio pueda transferir entre proyectos para estandarizar la presentación de planos y vistas de trabajo.',
    requisitos: [
      'Tener definidos los estándares gráficos del estudio (colores por sistema, grosores de línea, patrones).',
      'Conocer las categorías y subcategorías eléctricas que requieren filtros (tableros, circuitos, canalizaciones, iluminación).',
      'Contar con un proyecto de referencia que tenga las vistas ya configuradas correctamente como punto de partida.',
    ],
    procedimiento: [
      'Abrir el proyecto de referencia y ajustar las vistas tipo (planta de iluminación, planta de fuerza, planta de canalizaciones, etc.) con la visibilidad y los gráficos deseados.',
      "Crear los filtros de vista necesarios desde Visibilidad/Gráficos > pestaña Filtros, agrupando elementos por parámetro (p. ej. sistema eléctrico o tipo de circuito).",
      'Aplicar las sobrescrituras gráficas (color, patrón de línea, transparencia) a cada filtro según el estándar gráfico del estudio.',
      "Guardar la configuración de cada vista como plantilla de vista usando 'Crear plantilla de vista a partir de la vista actual'.",
      "Revisar en cada plantilla qué propiedades quedan incluidas o excluidas (escala, disciplina, categorías visibles) desde 'Propiedades de vista incluidas'.",
      "Transferir las plantillas de vista y los filtros a la biblioteca del estudio mediante 'Administrar > Transferir estándares de proyecto' o guardarlas en un archivo plantilla (.rte).",
      'Documentar en la biblioteca el propósito de cada plantilla (nombre, uso previsto, disciplina) para que otros usuarios la identifiquen con facilidad.',
      'Probar la importación de las plantillas en un proyecto distinto para confirmar que se transfieren sin errores.',
    ],
    resultadoEsperado:
      'Una biblioteca de plantillas de vista con sus filtros y sobrescrituras gráficas asociadas, documentada y disponible para transferirse a cualquier proyecto nuevo del estudio.',
    criteriosVerificacion: [
      'Cada plantilla de vista transferida conserva sus filtros y sobrescrituras gráficas sin perder configuración.',
      "Las plantillas se importan correctamente en un proyecto distinto mediante 'Transferir estándares de proyecto'.",
      'No existen plantillas duplicadas ni con nombres ambiguos en la biblioteca.',
      'Cada plantilla tiene documentado su propósito y su disciplina de uso.',
      'Los filtros aplicados muestran el color y el patrón de línea definidos en el estándar gráfico del estudio.',
    ],
    notasIngenieria: [
      {
        texto:
          'Los criterios de color y grafismo por sistema son un estándar interno del estudio, no una norma técnica; deben validarse con el equipo BIM antes de adoptarse como definitivos.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa 'Administrar > Transferir estándares de proyecto' para copiar plantillas de vista, filtros y estilos de línea entre proyectos sin recrearlos manualmente.",
      "En Visibilidad/Gráficos (VG), la pestaña 'Filtros' permite asociar un filtro a reglas por parámetro, por ejemplo 'Nombre del sistema eléctrico contiene...'.",
      "Al crear la plantilla de vista, revisa el botón 'Propiedades de vista incluidas' para no arrastrar la escala o el nivel de detalle de la vista de origen si no corresponde.",
      'Guarda un archivo plantilla de proyecto (.rte) con las plantillas de vista precargadas para que los nuevos proyectos partan ya con la biblioteca del estudio.',
    ],
    nuevo: true,
  },
];
