import { REF, notaCriterio, notaNorma, notaNormaVerificar } from './normas';
import type { TareaCatalogo } from '../types';

export const CATALOGO_03: TareaCatalogo[] = [
  {
    plantillaId: "PB-03-01",
    nombreOriginal: "Crear vistas planimetría en rótulos",
    nombre: "Crear las vistas de planimetría eléctrica y ubicarlas dentro de los rótulos de las láminas del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Vistas",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 2,
    horasEstimadas: 6,
    prioridad: 'Alta',
    dependeDe: [],
    guiaIds: ["M3.1", "M3.2"],
    descripcion: "Preparar las láminas del proyecto eléctrico creando las vistas de planta necesarias e insertándolas en los rótulos definidos para la entrega, de modo que cada vista quede correctamente encuadrada, escalada y rotulada dentro de su hoja.",
    objetivo: "Dejar organizadas las vistas de planta eléctricas dentro de las hojas del proyecto para iniciar la producción de planos.",
    requisitos: [
      "Modelo eléctrico con los sistemas principales modelados",
      "Plantillas de vista y familias de rótulo del estudio cargadas en el proyecto",
      "Niveles y rejillas del proyecto verificados"
    ],
    procedimiento: [
      "Duplicar las vistas de planta base necesarias con el comando 'Duplicar vista > Duplicar' para cada disciplina o nivel a documentar.",
      "Aplicar la plantilla de vista correspondiente desde el panel de propiedades para fijar visibilidad, escala y grafismo.",
      "Crear las hojas nuevas con el comando 'Nueva lámina' e insertar la familia de rótulo del estudio.",
      "Arrastrar cada vista de planta a su lámina y encuadrarla dentro del área de dibujo del rótulo.",
      "Ajustar el cajetín (título, número de lámina, escala) llenando los parámetros de la hoja.",
      "Verificar que el recuadro de referencia (viewport) no invada el marco del rótulo."
    ],
    resultadoEsperado: "Todas las vistas de planta eléctricas requeridas están ubicadas en sus láminas, con el rótulo correctamente diligenciado y sin conflictos de encuadre.",
    criteriosVerificacion: [
      "Cada lámina tiene asignada una vista de planta activa",
      "El rótulo de cada lámina tiene número, título y escala diligenciados",
      "Ninguna vista sobrepasa el área de dibujo del rótulo",
      "Todas las vistas usan la plantilla de vista definida para el estudio"
    ],
    notasIngenieria: [
      notaNorma('Los planos son parte del diseño exigible por el RETIE, no un producto accesorio del modelo: deben permitir construir e inspeccionar la instalación sin volver al archivo de Revit.', REF.REQUIEREN_DISENO),
      notaCriterio('Ubicar las vistas en el rótulo con una escala y un recorte definidos desde el inicio evita rehacer la composición de todas las láminas cuando el proyecto crece.'),
    ],
    tipsRevit: [
      "Usa 'Duplicar vista > Duplicar' en lugar de 'Duplicar con detallado' cuando no necesites anotaciones independientes.",
      "Aplica la plantilla de vista desde el parámetro 'Plantilla de vista' en Propiedades para evitar reconfigurar visibilidad manualmente.",
      "Usa el 'Programador de hojas' (Sheet List) para llevar control de las láminas creadas y pendientes."
    ]
  },
  {
    plantillaId: "PB-03-02",
    nombreOriginal: "Memorias base",
    nombre: "Redactar la memoria descriptiva base del proyecto eléctrico con los criterios generales de diseño",
    grupo: "03-documentacion",
    subgrupo: "Memorias y cálculos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 8,
    prioridad: 'Alta',
    dependeDe: ["PB-01-01", "PB-02-16"],
    guiaIds: ["M3.1", "M5.1"],
    descripcion: "Elaborar el documento de memoria descriptiva que resume el alcance, los criterios de diseño, las cargas consideradas y los sistemas eléctricos proyectados, sirviendo como base para las memorias específicas posteriores (RETIE, especificaciones técnicas).",
    objetivo: "Dejar documentado el criterio general de diseño eléctrico del proyecto como referencia para el resto de memorias y planos.",
    requisitos: [
      "Cálculo preliminar y definitivo de capacidad del transformador disponibles",
      "Definición de subestación aprobada",
      "Modelo con los sistemas principales modelados"
    ],
    procedimiento: [
      "Recopilar los datos de área, uso y clasificación del proyecto desde el modelo arquitectónico vinculado.",
      "Extraer de las tablas de planificación de Revit las cargas instaladas por tablero y por circuito.",
      "Redactar el capítulo de criterios de diseño (niveles de tensión, sistema de distribución, factores de demanda considerados).",
      "Describir los sistemas modelados (media tensión, baja tensión, iluminación, tomacorrientes, puesta a tierra).",
      "Incluir el resumen de la capacidad de transformador definida en el proyecto.",
      "Revisar consistencia entre lo descrito en la memoria y lo modelado en el proyecto."
    ],
    resultadoEsperado: "Memoria descriptiva base redactada y consistente con el modelo, lista para servir de insumo a las memorias RETIE y especificaciones técnicas.",
    criteriosVerificacion: [
      "La memoria referencia la capacidad de transformador definida en el modelo",
      "Todos los sistemas modelados están descritos en la memoria",
      "Las cargas reportadas coinciden con las tablas de planificación del modelo",
      "El documento incluye el alcance y la clasificación del proyecto"
    ],
    notasIngenieria: [
      notaNorma('La memoria descriptiva hace parte de la documentación de diseño que el RETIE exige para las instalaciones que requieren diseño, y debe ser coherente con los planos y con el modelo.', REF.REQUIEREN_DISENO),
      notaNorma('La memoria debe estar respaldada por el profesional competente responsable del diseño; el modelador redacta el soporte documental, no asume la responsabilidad técnica.', REF.RESPONSABILIDAD_DISENADOR),
    ],
    tipsRevit: [
      "Genera una tabla de planificación de cargas por tablero con el comando 'Tabla de planificación/cuantificaciones' filtrada por categoría 'Tableros eléctricos' para alimentar la memoria con datos reales del modelo.",
      "Exporta la tabla a formato de texto o programa desde Revit para evitar transcribir valores manualmente."
    ]
  },
  {
    plantillaId: "PB-03-03",
    nombreOriginal: "Diagramas unifilares",
    nombre: "Elaborar los diagramas unifilares de media tensión, baja tensión y tableros del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Tablas y cuantificaciones",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 12,
    prioridad: 'Alta',
    dependeDe: ["PB-02-09", "PB-02-02"],
    guiaIds: ["M3.6", "M5.3"],
    descripcion: "Construir los diagramas unifilares que representan la topología de la red eléctrica del proyecto (acometida de media tensión, subestación, distribución en baja tensión y tableros), reflejando los circuitos definidos en el modelo.",
    objetivo: "Representar gráficamente en un diagrama unifilar la topología eléctrica del proyecto para su uso en planos y memorias.",
    requisitos: [
      "Circuitos creados en el modelo para cada tipología",
      "Redes de media y baja tensión modeladas",
      "Cálculo definitivo del transformador disponible"
    ],
    procedimiento: [
      "Extraer del modelo la lista de tableros y circuitos mediante una tabla de planificación de paneles eléctricos.",
      "Crear una vista de dibujo (Drafting View) dedicada para el diagrama unifilar.",
      "Insertar los símbolos de detalle 2D (transformador, interruptores, tableros) según la topología real modelada.",
      "Conectar los símbolos con líneas de detalle representando los tramos de media y baja tensión.",
      "Rotular cada tramo con calibre, protección y tablero de destino tomando los datos del modelo.",
      "Verificar que la topología del diagrama coincide con las conexiones reales del modelo eléctrico."
    ],
    resultadoEsperado: "Diagrama unifilar completo y consistente con la topología modelada, listo para incluirse en las láminas de entrega.",
    criteriosVerificacion: [
      "Todos los tableros modelados aparecen representados en el diagrama unifilar",
      "Cada tramo del diagrama indica calibre y protección",
      "La jerarquía del diagrama coincide con las conexiones reales del modelo",
      "El diagrama incluye la acometida de media tensión hasta los tableros finales"
    ],
    notasIngenieria: [
      notaNormaVerificar('El diagrama unifilar debe reflejar las protecciones realmente seleccionadas, con su capacidad nominal y su capacidad de corte, y ser coherente con el estudio de coordinación de protecciones del proyecto.', REF.SOBRECORRIENTES),
      notaNorma('Los tableros y celdas representados en el unifilar deben corresponder a equipos que cumplan los requisitos de instalación del RETIE, incluida su identificación y rotulación.', REF.CELDAS_TABLEROS),
      notaCriterio('Revit no genera diagramas unifilares de forma automática a partir de la topología eléctrica; el diagrama se construye manualmente sobre los datos extraídos del modelo.'),
    ],
    tipsRevit: [
      "Usa una 'Vista de dibujo' (Drafting View) para el unifilar, ya que Revit no tiene una herramienta nativa de diagramas de una línea.",
      "Apóyate en familias de detalle 2D de la biblioteca del estudio para los símbolos normalizados de tableros y protecciones.",
      "Usa 'Editar tabla de tablero eléctrico' (Edit Panel Schedule) para verificar los circuitos reales antes de dibujarlos."
    ]
  },
  {
    plantillaId: "PB-03-04",
    nombreOriginal: "Modelar y crear vistas de escaleras",
    nombre: "Modelar las instalaciones eléctricas de las escaleras y crear sus vistas de documentación",
    grupo: "03-documentacion",
    subgrupo: "Vistas",
    categoria: "Modelado",
    disciplina: "Eléctrica",
    dificultad: 2,
    horasEstimadas: 6,
    prioridad: 'Media',
    dependeDe: ["PB-02-15"],
    guiaIds: ["M2.5", "M3.1"],
    descripcion: "Modelar los elementos eléctricos ubicados en las cajas de escalera (iluminación, tomas, salidas de emergencia) y generar las vistas de planta y corte necesarias para documentarlas.",
    objetivo: "Completar el modelado eléctrico de las escaleras y dejar disponibles las vistas necesarias para su documentación.",
    requisitos: [
      "Modelo arquitectónico de escaleras vinculado y visible",
      "Tubería de iluminación modelada en los niveles correspondientes",
      "Niveles del proyecto verificados"
    ],
    procedimiento: [
      "Vincular y verificar la visibilidad del modelo arquitectónico de las escaleras en la vista de trabajo.",
      "Ubicar las luminarias y tomas requeridas dentro de la caja de escalera según el diseño de iluminación.",
      "Modelar las canalizaciones que alimentan los puntos ubicados en la escalera.",
      "Crear una vista de planta por nivel que incluya el rango de la caja de escalera (View Range).",
      "Crear una vista de corte (Section) que muestre el desarrollo vertical de la escalera y sus instalaciones.",
      "Asignar la plantilla de vista correspondiente a las nuevas vistas creadas."
    ],
    resultadoEsperado: "Instalaciones eléctricas de las escaleras modeladas por completo, con vistas de planta y corte disponibles para su documentación posterior.",
    criteriosVerificacion: [
      "Todas las luminarias y tomas de la escalera están modeladas en el nivel correcto",
      "Existe una vista de planta por cada nivel de escalera",
      "Existe al menos una vista de corte que muestre el desarrollo vertical de la escalera",
      "Las vistas nuevas tienen asignada la plantilla de vista del estudio"
    ],
    notasIngenieria: [
      notaNorma('La iluminación de escaleras y rutas de evacuación pertenece a los sistemas de emergencia y debe ser independiente del alumbrado normal.', REF.SISTEMAS_EMERGENCIA),
      notaNormaVerificar('Los niveles de iluminancia y la autonomía exigidos al alumbrado de emergencia los fija el RETILAP; confirmar los valores aplicables a escaleras y circulaciones antes de cerrar el diseño.', REF.ILUM_EMERGENCIA),
    ],
    tipsRevit: [
      "Ajusta el 'Rango de vista' (View Range) de la planta para que el corte superior incluya los descansos intermedios de la escalera.",
      "Usa 'Copiar/Monitorear' en la pestaña Colaborar para mantener sincronizados los niveles del modelo arquitectónico de escaleras.",
      "Crea la vista de corte con la herramienta 'Sección' y ajusta la 'Caja de sección' (Section Box) para aislar solo la caja de escalera."
    ]
  },
  {
    plantillaId: "PB-03-05",
    nombreOriginal: "Validar especificaciones hidrosanitarias",
    nombre: "Validar la compatibilidad de las especificaciones hidrosanitarias con los requisitos eléctricos del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Memorias y cálculos",
    categoria: "Coordinación MEP",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 5,
    prioridad: 'Media',
    dependeDe: ["PB-04-01"],
    guiaIds: ["M6.1", "M6.5"],
    descripcion: "Revisar las especificaciones técnicas de los equipos hidrosanitarios (bombas, equipos de presión, calentadores) para confirmar que sus requerimientos eléctricos (potencia, tensión, protecciones) están correctamente reflejados en el diseño eléctrico.",
    objetivo: "Confirmar que el diseño eléctrico cubre correctamente los requerimientos de los equipos hidrosanitarios del proyecto.",
    requisitos: [
      "Especificaciones técnicas de equipos hidrosanitarios entregadas por la disciplina hidráulica",
      "Modelo eléctrico con circuitos de fuerza para equipos especiales creados",
      "Informe de detección de interferencias disponible"
    ],
    procedimiento: [
      "Recopilar las fichas técnicas de los equipos hidrosanitarios que requieren alimentación eléctrica.",
      "Comparar la potencia y tensión de cada equipo contra el circuito asignado en el modelo eléctrico.",
      "Verificar en el modelo que exista un circuito y una protección dedicados para cada equipo hidrosanitario.",
      "Revisar la ubicación modelada del punto de alimentación contra la ubicación real del equipo en el modelo hidrosanitario vinculado.",
      "Registrar las inconsistencias encontradas para su corrección.",
      "Confirmar el cierre de las inconsistencias una vez corregido el modelo."
    ],
    resultadoEsperado: "Todos los equipos hidrosanitarios con requerimiento eléctrico cuentan con circuito, protección y ubicación validados contra sus especificaciones técnicas.",
    criteriosVerificacion: [
      "Cada equipo hidrosanitario con demanda eléctrica tiene un circuito asignado en el modelo",
      "La protección de cada circuito es compatible con la potencia del equipo especificado",
      "La ubicación del punto de alimentación coincide con la ubicación del equipo en el modelo hidrosanitario",
      "No quedan inconsistencias abiertas entre especificación hidrosanitaria y modelo eléctrico"
    ],
    notasIngenieria: [
      notaNorma('Los puntos donde una red hidrosanitaria coincide con salidas o tableros eléctricos exigen protección contra falla de aislamiento y separación adecuada; la coordinación entre disciplinas es la que evita ese riesgo.', REF.PROTECCION_AISLAMIENTO),
      notaNorma('Ninguna tubería de otra disciplina puede invadir el espacio de trabajo frente a tableros ni el interior de cuartos técnicos eléctricos.', REF.ESPACIOS_MONTAJE),
    ],
    tipsRevit: [
      "Usa 'Copiar/Monitorear' para vincular la ubicación de los equipos hidrosanitarios del modelo de esa disciplina.",
      "Filtra por categoría 'Equipo mecánico' en el modelo vinculado para ubicar rápidamente los equipos con demanda eléctrica.",
      "Registra los hallazgos en el mismo flujo de incidencias de coordinación usado para el resto de conflictos entre disciplinas."
    ]
  },
  {
    plantillaId: "PB-03-06",
    nombreOriginal: "Memorias RETIE",
    nombre: "Redactar la memoria de cumplimiento RETIE del proyecto eléctrico",
    grupo: "03-documentacion",
    subgrupo: "Memorias y cálculos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 4,
    horasEstimadas: 12,
    prioridad: 'Alta',
    dependeDe: ["PB-03-02", "PB-02-08"],
    guiaIds: ["M5.1", "M5.6"],
    descripcion: "Elaborar la memoria técnica que sustenta el cumplimiento del Reglamento Técnico de Instalaciones Eléctricas (RETIE) por parte del proyecto, cubriendo los aspectos de diseño, protecciones y puesta a tierra exigidos.",
    objetivo: "Dejar documentado el cumplimiento normativo RETIE del diseño eléctrico del proyecto.",
    requisitos: [
      "Memoria descriptiva base redactada",
      "Malla de puesta a tierra modelada y calculada",
      "Cálculo definitivo de capacidad del transformador disponible"
    ],
    procedimiento: [
      "Partir de la memoria descriptiva base y extraer los datos generales del proyecto.",
      "Documentar el sistema de puesta a tierra proyectado y su valor de resistencia esperado.",
      "Documentar las protecciones eléctricas previstas (interruptores, diferenciales) por nivel de tablero.",
      "Documentar el sistema de apantallamiento y su método de cálculo si aplica al proyecto.",
      "Revisar el documento contra el listado de aspectos que exige cubrir el RETIE para el tipo de proyecto.",
      "Dejar constancia de los puntos que requieren verificación por un ingeniero certificador RETIE antes de la entrega final."
    ],
    resultadoEsperado: "Memoria RETIE redactada, consistente con el modelo y con los puntos pendientes de verificación normativa señalados explícitamente.",
    criteriosVerificacion: [
      "La memoria documenta el sistema de puesta a tierra con su valor de resistencia",
      "La memoria documenta las protecciones eléctricas por nivel de tablero",
      "Los puntos no verificados con certeza normativa quedan señalados explícitamente",
      "El documento es consistente con los datos del modelo eléctrico"
    ],
    notasIngenieria: [
      notaNorma('La demostración de conformidad de la instalación se hace mediante declaración de cumplimiento del constructor y, cuando se exige certificación plena, con el dictamen de inspección de un organismo acreditado por la ONAC.', REF.DECLARACION_CUMPLIMIENTO),
      notaNorma('El RETIE define qué instalaciones requieren certificación plena; determinarlo antes de redactar la memoria evita preparar un soporte documental insuficiente para el trámite.', REF.CERTIFICACION_PLENA),
      notaNormaVerificar('No se debe citar un número de artículo o tabla del RETIE en la memoria sin confirmarlo contra el texto vigente. El reglamento fue reexpedido por la Resolución 40284 de 2026 y su numeración cambió respecto a versiones anteriores.', REF.REQUIEREN_DISENO),
    ],
    tipsRevit: [
      "Genera desde Revit las tablas de planificación de tableros y de la malla de puesta a tierra para anexarlas como soporte de la memoria, evitando transcripción manual de datos.",
      "Usa parámetros compartidos en las familias de tableros para registrar el dato de resistencia de puesta a tierra directamente en el modelo."
    ]
  },
  {
    plantillaId: "PB-03-07",
    nombreOriginal: "Especificaciones técnicas",
    nombre: "Redactar las especificaciones técnicas de materiales y equipos eléctricos del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Memorias y cálculos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 8,
    prioridad: 'Alta',
    dependeDe: ["PB-03-02"],
    guiaIds: ["M3.1", "M9.3"],
    descripcion: "Elaborar el documento de especificaciones técnicas que define los materiales, equipos y criterios de instalación exigidos para la ejecución del proyecto eléctrico, en consistencia con lo modelado.",
    objetivo: "Dejar documentados los requisitos técnicos de materiales y equipos para la construcción del proyecto eléctrico.",
    requisitos: [
      "Memoria descriptiva base redactada",
      "Modelo con las familias de equipos y materiales definitivas asignadas"
    ],
    procedimiento: [
      "Listar las familias de equipos y materiales usadas en el modelo (tableros, luminarias, tomas, conductores, canalizaciones).",
      "Redactar la especificación de cada material indicando las características mínimas exigidas.",
      "Redactar la especificación de instalación para cada sistema (canalizaciones, puesta a tierra, tableros).",
      "Verificar que cada equipo modelado tiene una especificación técnica correspondiente en el documento.",
      "Revisar consistencia entre las marcas o referencias mencionadas y los tipos de familia usados en el modelo.",
      "Enviar el documento a revisión del ingeniero responsable del proyecto."
    ],
    resultadoEsperado: "Documento de especificaciones técnicas completo, consistente con las familias y materiales usados en el modelo.",
    criteriosVerificacion: [
      "Cada tipo de equipo modelado tiene una especificación técnica correspondiente",
      "El documento incluye criterios de instalación por sistema",
      "No existen referencias a materiales que no están presentes en el modelo",
      "El documento fue revisado por el ingeniero responsable antes de su entrega"
    ],
    notasIngenieria: [
      notaNorma('Los productos objeto del RETIE deben contar con certificado de conformidad o declaración de conformidad del proveedor; la especificación técnica debe exigirlo explícitamente y no solo describir el producto.', REF.PRODUCTOS_RETIE),
      notaNorma('Las normas técnicas aplicables a cada producto e instalación las remite el propio RETIE; la especificación debe citar la norma vigente y no una edición derogada.', REF.NORMAS_TECNICAS),
      notaCriterio('Las especificaciones técnicas deben ser consistentes con las familias realmente cargadas en el modelo para evitar contradicciones entre plano y documento.'),
    ],
    tipsRevit: [
      "Usa el 'Administrador de tipos' para revisar de forma rápida todas las variantes de familia usadas en el proyecto antes de redactar las especificaciones.",
      "Exporta un listado de familias y tipos con una tabla de planificación de componentes para no omitir ningún equipo en el documento."
    ]
  },
  {
    plantillaId: "PB-03-08",
    nombreOriginal: "Crear planimetría",
    nombre: "Generar la planimetría eléctrica general del proyecto a partir del modelo",
    grupo: "03-documentacion",
    subgrupo: "Vistas",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 2,
    horasEstimadas: 8,
    prioridad: 'Alta',
    dependeDe: ["PB-03-01"],
    guiaIds: ["M3.1", "M3.2"],
    descripcion: "Producir el conjunto de planos de planta eléctricos generales del proyecto, consolidando en las láminas ya preparadas la información modelada de cada sistema.",
    objetivo: "Dejar generada la planimetría eléctrica general del proyecto lista para revisión y entrega.",
    requisitos: [
      "Vistas de planimetría creadas y ubicadas en los rótulos de lámina",
      "Sistemas eléctricos principales modelados",
      "Plantillas de vista y filtros de grafismo definidos"
    ],
    procedimiento: [
      "Revisar en cada lámina que la vista de planta asignada muestre la disciplina y el nivel correctos.",
      "Aplicar los filtros de vista necesarios para diferenciar sistemas (iluminación, tomas, fuerza) por color o patrón.",
      "Verificar que las anotaciones y etiquetas de los elementos estén visibles y legibles a la escala de la lámina.",
      "Ajustar el rango de vista (View Range) donde sea necesario para mostrar correctamente los elementos por nivel.",
      "Revisar que las leyendas de simbología estén presentes y actualizadas en cada lámina.",
      "Marcar cada lámina como lista para revisión en el estado de flujo de trabajo del proyecto."
    ],
    resultadoEsperado: "Conjunto de planos de planta eléctricos generales generado, legible y consistente con el modelo, listo para el proceso de revisión.",
    criteriosVerificacion: [
      "Cada lámina de planimetría muestra el nivel y la disciplina correctos",
      "Las etiquetas de los elementos son legibles a la escala definida",
      "Cada lámina incluye la leyenda de simbología correspondiente",
      "Los filtros de grafismo diferencian correctamente cada sistema representado"
    ],
    notasIngenieria: [
      notaNorma('La planimetría es parte del diseño exigible y debe permitir construir la instalación tal como fue concebida; una vista bonita pero sin cotas ni referencias no cumple esa función.', REF.REQUIEREN_DISENO),
      notaCriterio('La escala y el nivel de detalle mostrado deben ser consistentes con el uso previsto del plano (coordinación, construcción o entrega a operador de red).'),
    ],
    tipsRevit: [
      "Usa 'Filtros de vista' (View Filters) para colorear por sistema eléctrico sin duplicar vistas.",
      "Verifica el parámetro 'Detalle de vista' (Coarse/Medium/Fine) porque afecta qué tanto detalle de las familias se muestra en el plano.",
      "Actualiza la leyenda con el comando 'Leyenda' enlazado a los filtros de vista usados, para que no quede desincronizada."
    ]
  },
  {
    plantillaId: "PB-03-09",
    nombreOriginal: "Plano de apantallamiento",
    nombre: "Elaborar el plano del sistema de apantallamiento (protección contra rayos) del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 6,
    prioridad: 'Alta',
    dependeDe: ["PB-02-11"],
    guiaIds: ["M5.6", "M3.1"],
    descripcion: "Documentar en plano el sistema de apantallamiento (pararrayos y bajantes) modelado en el proyecto, mostrando su ubicación en planta y su relación con la malla de puesta a tierra.",
    objetivo: "Dejar documentado en plano el sistema de apantallamiento proyectado.",
    requisitos: [
      "Sistema de apantallamiento modelado",
      "Malla de puesta a tierra modelada",
      "Vistas de planimetría de cubierta y terrazas creadas"
    ],
    procedimiento: [
      "Crear la vista de planta de cubierta que muestre el pararrayos y su radio de protección.",
      "Insertar en la vista los elementos del sistema de apantallamiento modelados (punta captadora, bajantes).",
      "Anotar la ubicación de las bajantes y su conexión a la malla de puesta a tierra.",
      "Incluir en la lámina el detalle de la zona de protección calculada.",
      "Verificar que la simbología usada coincide con la leyenda del proyecto.",
      "Revisar que el plano sea coherente con el modelo de apantallamiento."
    ],
    resultadoEsperado: "Plano de apantallamiento generado, mostrando la ubicación del sistema y su conexión con la puesta a tierra, consistente con el modelo.",
    criteriosVerificacion: [
      "El plano muestra la ubicación de la punta captadora y las bajantes modeladas",
      "Cada bajante mostrada en plano tiene indicada su conexión a la malla de puesta a tierra",
      "El plano incluye la zona de protección calculada",
      "La simbología usada coincide con la leyenda del proyecto"
    ],
    notasIngenieria: [
      notaNorma('El sistema de protección contra rayos tiene requisitos propios en el RETIE; el plano debe mostrar captadores, bajantes y su conexión al sistema de puesta a tierra como un conjunto, no como elementos sueltos.', REF.PROTECCION_RAYOS),
      notaCriterio('El sistema de apantallamiento debe representarse de forma consistente con el método de cálculo usado para definir el radio de protección.'),
    ],
    tipsRevit: [
      "Usa un 'Callout' sobre la vista de cubierta para aislar y ampliar la zona del pararrayos sin crear una vista independiente.",
      "Verifica que la familia del pararrayos tenga parámetros de tipo para el radio de protección, de modo que se pueda anotar directamente desde el modelo."
    ]
  },
  {
    plantillaId: "PB-03-10",
    nombreOriginal: "Plano de método electrogeométrico",
    nombre: "Elaborar el plano del método electrogeométrico para el diseño del sistema de apantallamiento",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 4,
    horasEstimadas: 8,
    prioridad: 'Media',
    dependeDe: ["PB-02-11", "PB-03-09"],
    guiaIds: ["M5.6", "M3.4"],
    descripcion: "Documentar gráficamente la aplicación del método electrogeométrico (esfera rodante) usado para definir la zona de protección del sistema de apantallamiento del proyecto.",
    objetivo: "Dejar documentado el sustento gráfico del método de cálculo usado para dimensionar el apantallamiento del proyecto.",
    requisitos: [
      "Sistema de apantallamiento modelado",
      "Cálculo del radio de la esfera rodante disponible",
      "Plano de apantallamiento elaborado"
    ],
    procedimiento: [
      "Crear una vista de dibujo o de detalle dedicada para representar el método electrogeométrico.",
      "Dibujar la sección de la edificación con las alturas relevantes para el cálculo.",
      "Trazar la esfera de radio calculado y su tangencia con los puntos captadores y superficies protegidas.",
      "Anotar el radio utilizado y los puntos o superficies que quedan fuera de la zona de protección, si los hay.",
      "Verificar que las alturas usadas en el gráfico coinciden con las del modelo arquitectónico.",
      "Incluir la referencia cruzada hacia el plano de apantallamiento."
    ],
    resultadoEsperado: "Plano del método electrogeométrico elaborado, sustentando gráficamente el radio de protección aplicado al sistema de apantallamiento.",
    criteriosVerificacion: [
      "El plano muestra la esfera de radio calculado tangente a los puntos captadores",
      "Las alturas representadas coinciden con las del modelo arquitectónico",
      "El radio de la esfera está anotado en el plano",
      "El plano referencia el plano de apantallamiento correspondiente"
    ],
    notasIngenieria: [
      notaNormaVerificar('El radio de la esfera rodante depende del nivel de protección resultante de la evaluación de riesgo del proyecto. El plano documenta el método, pero el valor proviene del estudio, no del dibujo.', REF.PROTECCION_RAYOS),
    ],
    tipsRevit: [
      "Dibuja la esfera con una familia genérica de masa o con un arco de detalle en una 'Vista de dibujo' (Drafting View), ya que Revit no tiene una herramienta paramétrica para el método de la esfera rodante.",
      "Apóyate en una vista de sección del modelo arquitectónico como fondo (underlay) para verificar que las alturas dibujadas sean reales."
    ]
  },
  {
    plantillaId: "PB-03-11",
    nombreOriginal: "Plano de detalles de apantallamiento",
    nombre: "Elaborar el plano de detalles constructivos del sistema de apantallamiento",
    grupo: "03-documentacion",
    subgrupo: "Detalles",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 6,
    prioridad: 'Media',
    dependeDe: ["PB-03-09"],
    guiaIds: ["M3.4", "M5.6"],
    descripcion: "Documentar los detalles constructivos del sistema de apantallamiento (fijación de la punta captadora, bajantes, cajas de inspección y conexión a la malla de puesta a tierra) requeridos para su ejecución en obra.",
    objetivo: "Dejar documentados los detalles constructivos necesarios para ejecutar el sistema de apantallamiento en obra.",
    requisitos: [
      "Sistema de apantallamiento modelado",
      "Caja de puesta a tierra en armarios modelada",
      "Plano de apantallamiento elaborado"
    ],
    procedimiento: [
      "Identificar los puntos del sistema de apantallamiento que requieren detalle constructivo (fijaciones, conexiones, cajas de inspección).",
      "Crear vistas de detalle (Callout) sobre las zonas identificadas en el modelo.",
      "Ajustar el nivel de detalle de la vista a fino y activar los componentes de detalle necesarios.",
      "Anotar materiales, dimensiones y método de fijación en cada detalle.",
      "Verificar que cada detalle referenciado en el plano general de apantallamiento existe en la lámina de detalles.",
      "Revisar la consistencia entre los detalles dibujados y los componentes reales del modelo."
    ],
    resultadoEsperado: "Detalles constructivos del sistema de apantallamiento documentados y referenciados correctamente desde el plano general.",
    criteriosVerificacion: [
      "Cada componente crítico del sistema de apantallamiento tiene un detalle asociado",
      "Los detalles incluyen materiales y dimensiones anotadas",
      "Las referencias de detalle en el plano general apuntan a la lámina correcta",
      "Los detalles son consistentes con los componentes modelados"
    ],
    notasIngenieria: [
      notaNorma('Los detalles de conexión del sistema de protección contra rayos deben ser coherentes con los componentes admitidos para el sistema de puesta a tierra, incluidos conectores y materiales.', REF.SPT_COMPONENTES),
      notaCriterio('Los detalles de conexión a la malla de puesta a tierra deben ser consistentes con el tipo de conector y material especificado para el sistema.'),
    ],
    tipsRevit: [
      "Usa 'Callout' sobre la vista de apantallamiento para generar cada detalle directamente enlazado a la vista de origen.",
      "Activa componentes de detalle 2D con el comando 'Componente de detalle' para representar elementos que no están modelados en 3D (abrazaderas, conectores)."
    ]
  },
  {
    plantillaId: "PB-03-12",
    nombreOriginal: "Plano de red BT",
    nombre: "Elaborar el plano de la red de distribución en baja tensión del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 8,
    prioridad: 'Alta',
    dependeDe: ["PB-02-02"],
    guiaIds: ["M5.2", "M3.1"],
    descripcion: "Documentar en planta la red de baja tensión modelada, desde la subestación o punto de transformación hasta los tableros de distribución, mostrando trazados y canalizaciones.",
    objetivo: "Dejar documentada en plano la red de distribución en baja tensión del proyecto.",
    requisitos: [
      "Redes de baja tensión modeladas",
      "Tubería de salidas modelada",
      "Vistas de planimetría preparadas en los rótulos"
    ],
    procedimiento: [
      "Ubicar la vista de planta del nivel donde se desarrolla la red de baja tensión.",
      "Verificar que las canalizaciones y conductores de baja tensión estén visibles con el grafismo definido para el sistema.",
      "Anotar los calibres y el tipo de canalización de los tramos principales.",
      "Identificar y etiquetar los tableros conectados a la red.",
      "Revisar que el trazado mostrado coincide con el recorrido real modelado.",
      "Incluir la leyenda de simbología de la red de baja tensión en la lámina."
    ],
    resultadoEsperado: "Plano de red de baja tensión generado, mostrando el trazado completo desde el punto de transformación hasta los tableros de distribución.",
    criteriosVerificacion: [
      "El plano muestra el trazado completo de la red de baja tensión modelada",
      "Cada tramo principal tiene anotado su calibre",
      "Todos los tableros conectados a la red están etiquetados",
      "La lámina incluye la leyenda de simbología correspondiente"
    ],
    notasIngenieria: [
      notaNorma('El plano de baja tensión debe reflejar las protecciones de cada alimentador y su coordinación; es el documento que usa el inspector para contrastar lo construido contra lo diseñado.', REF.SOBRECORRIENTES),
      notaCriterio('Los calibres y tipos de canalización mostrados en plano deben coincidir con los definidos en el cálculo de circuitos, no con valores genéricos de plantilla.'),
    ],
    tipsRevit: [
      "Usa un 'Filtro de vista' por parámetro de sistema eléctrico para resaltar únicamente los conductores de baja tensión en la lámina.",
      "Etiqueta los tramos con 'Etiquetar por categoría' enlazado al parámetro de calibre de la familia de conductor."
    ]
  },
  {
    plantillaId: "PB-03-13",
    nombreOriginal: "Plano vertical e isométrico de red BT",
    nombre: "Elaborar el plano vertical e isométrico de la red de distribución en baja tensión del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 8,
    prioridad: 'Media',
    dependeDe: ["PB-03-12"],
    guiaIds: ["M5.2", "M3.4"],
    descripcion: "Documentar el desarrollo vertical y una vista isométrica de la red de baja tensión, mostrando cómo se distribuye entre niveles hasta los tableros finales.",
    objetivo: "Dejar documentado el desarrollo vertical de la red de baja tensión para complementar el plano en planta.",
    requisitos: [
      "Plano de red BT en planta elaborado",
      "Redes de baja tensión modeladas en todos los niveles",
      "Ductos y bandejas verticales modelados"
    ],
    procedimiento: [
      "Crear una vista de sección que atraviese el ducto o shaft por donde se desarrolla la red vertical de baja tensión.",
      "Ajustar la caja de sección (Section Box) para mostrar todos los niveles relevantes.",
      "Crear una vista 3D aislada del sistema de baja tensión y configurarla en proyección isométrica.",
      "Anotar en la vista vertical los niveles y los tableros que se alimentan en cada uno.",
      "Verificar que el recorrido mostrado en la vista isométrica coincide con el modelo real.",
      "Ubicar ambas vistas en una lámina común con su respectiva leyenda."
    ],
    resultadoEsperado: "Plano vertical e isométrico de la red de baja tensión generado, mostrando de forma clara la distribución entre niveles.",
    criteriosVerificacion: [
      "La vista vertical muestra todos los niveles atravesados por la red de baja tensión",
      "Cada nivel mostrado indica el tablero que se alimenta en ese punto",
      "La vista isométrica corresponde al mismo recorrido mostrado en la vista vertical",
      "Ambas vistas están ubicadas en la misma lámina con su leyenda"
    ],
    notasIngenieria: [
      notaNormaVerificar('El isométrico debe mostrar los pasos de losa y sus sellos cortafuego, y las secciones de canalización deben corresponder al porcentaje de ocupación calculado.', REF.CANALIZACIONES),
    ],
    tipsRevit: [
      "Usa 'Vista 3D aislada' con 'Ocultar categorías no relacionadas' para dejar visible solo el sistema de baja tensión en la vista isométrica.",
      "Ajusta la 'Caja de sección' (Section Box) recortándola al eje del shaft para evitar mostrar elementos de otras zonas en la vista vertical."
    ]
  },
  {
    plantillaId: "PB-03-14",
    nombreOriginal: "Plano iluminación y tomas apartamentos (cuadros de carga y detalles de cocina o zona especial)",
    nombre: "Elaborar el plano de iluminación y tomas de apartamentos con cuadro de cargas y detalle de cocina",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 10,
    prioridad: 'Alta',
    dependeDe: ["PB-02-12", "PB-02-09"],
    guiaIds: ["M3.6", "M5.5"],
    descripcion: "Documentar en plano la iluminación y los tomacorrientes de cada tipología de apartamento, incluyendo el cuadro de cargas del tablero de vivienda y el detalle ampliado de la cocina u otra zona especial que lo requiera.",
    objetivo: "Dejar documentado el plano de iluminación y tomas de cada tipología de apartamento con su cuadro de cargas y detalle de zona especial.",
    requisitos: [
      "Tomas normales y trifásicas modeladas en la planta",
      "Circuitos creados por tipología",
      "Tubería de iluminación y de salidas modelada"
    ],
    procedimiento: [
      "Ubicar la vista de planta de la tipología de apartamento a documentar.",
      "Verificar la visibilidad de luminarias, tomas y sus circuitos asociados en la vista.",
      "Insertar el cuadro de cargas (panel schedule) del tablero de la vivienda en la lámina.",
      "Crear un 'Callout' de la zona de cocina o zona especial que requiera detalle ampliado.",
      "Anotar circuitos, interruptores y puntos de la zona ampliada en el detalle.",
      "Verificar que el cuadro de cargas insertado coincide con los circuitos mostrados en planta."
    ],
    resultadoEsperado: "Plano de iluminación y tomas de la tipología de apartamento generado, con su cuadro de cargas y el detalle de la zona especial correspondiente.",
    criteriosVerificacion: [
      "El plano muestra todas las luminarias y tomas modeladas de la tipología",
      "El cuadro de cargas insertado corresponde al tablero real de la vivienda",
      "Existe un detalle ampliado de la cocina o zona especial cuando aplica",
      "Los circuitos mostrados en el detalle coinciden con los del cuadro de cargas"
    ],
    notasIngenieria: [
      notaNormaVerificar('La zona de cocina suele requerir circuitos dedicados para electrodomesticos de alta demanda; confirmar con el diseño de cargas cuáles puntos deben quedar en circuito independiente antes de cerrar el plano.', REF.INSTALACIONES_BASICAS),
      notaNorma('Las tomas de cocina, zonas de lavado y baños requieren protección contra falla de aislamiento; el cuadro de cargas debe evidenciar qué circuitos la llevan.', REF.PROTECCION_AISLAMIENTO),
      notaNorma('Las alturas de montaje y el grado de protección de las tomas representadas deben corresponder a los requisitos del artículo de clavijas y tomacorrientes.', REF.TOMACORRIENTES),
    ],
    tipsRevit: [
      "Inserta el cuadro de cargas con 'Editar tabla de tablero eléctrico' (Edit Panel Schedule) y colócalo en la lámina como una vista de tabla de tablero.",
      "Usa 'Callout' para el detalle de cocina en lugar de una vista independiente, así queda enlazado a la vista de planta general de la tipología."
    ]
  },
  {
    plantillaId: "PB-03-15",
    nombreOriginal: "Plano de red servicios comunes",
    nombre: "Elaborar el plano de la red eléctrica de servicios comunes del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 8,
    prioridad: 'Media',
    dependeDe: ["PB-02-04"],
    guiaIds: ["M5.2", "M3.1"],
    descripcion: "Documentar en plano la red eléctrica que alimenta las áreas de servicios comunes del proyecto (salón social, portería, cuartos técnicos, zonas exteriores comunes), a partir de lo modelado.",
    objetivo: "Dejar documentada en plano la red eléctrica de servicios comunes del proyecto.",
    requisitos: [
      "Redes de servicios comunes modeladas",
      "Circuitos creados por tipología de área común",
      "Vistas de planimetría preparadas en los rótulos"
    ],
    procedimiento: [
      "Ubicar las vistas de planta de las áreas de servicios comunes del proyecto.",
      "Verificar la visibilidad de los circuitos y canalizaciones de servicios comunes en cada vista.",
      "Etiquetar los tableros que alimentan cada área común.",
      "Anotar los circuitos principales que atraviesan zonas compartidas entre áreas comunes.",
      "Revisar que el trazado mostrado coincide con el modelo de servicios comunes.",
      "Incluir la leyenda de simbología correspondiente en cada lámina."
    ],
    resultadoEsperado: "Plano de red de servicios comunes generado, documentando correctamente la alimentación de todas las áreas comunes del proyecto.",
    criteriosVerificacion: [
      "El plano muestra todas las áreas de servicios comunes con red modelada",
      "Cada área común mostrada tiene etiquetado el tablero que la alimenta",
      "El trazado mostrado coincide con el recorrido real modelado",
      "La lámina incluye la leyenda de simbología de servicios comunes"
    ],
    notasIngenieria: [
      notaNorma('Los tableros de zonas comunes accesibles al público tienen requisitos de accesibilidad restringida que el plano debe reflejar en su ubicación y en el detalle del recinto.', REF.TABLEROS_USO_PUBLICO),
      notaCriterio('Las áreas de servicios comunes suelen alimentarse de un tablero general distinto al de las viviendas; verificar que la separación de circuitos en plano sea consistente con esa distribución.'),
    ],
    tipsRevit: [
      "Usa 'Filtros de vista' para diferenciar el sistema de servicios comunes de los circuitos de vivienda en la misma planta.",
      "Agrupa las áreas comunes con 'Áreas y volúmenes' (Area Plan) si necesitas totalizar cargas por zona para la lámina."
    ]
  },
  {
    plantillaId: "PB-03-16",
    nombreOriginal: "Plano de iluminación punto fijo",
    nombre: "Elaborar el plano de iluminación del punto fijo (escaleras y circulaciones verticales) del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 6,
    prioridad: 'Alta',
    dependeDe: ["PB-02-05", "PB-03-04"],
    guiaIds: ["M5.4", "M3.1"],
    descripcion: "Documentar en plano la iluminación del punto fijo del proyecto (caja de escaleras y circulaciones verticales comunes), incluyendo circuitos de emergencia cuando apliquen.",
    objetivo: "Dejar documentado en plano el sistema de iluminación del punto fijo del proyecto.",
    requisitos: [
      "Iluminación de escaleras modelada",
      "Vistas de escaleras creadas",
      "Circuitos de iluminación creados por tipología"
    ],
    procedimiento: [
      "Ubicar las vistas de planta y corte del punto fijo previamente creadas.",
      "Verificar la visibilidad de las luminarias y sus circuitos asociados en cada nivel.",
      "Diferenciar mediante filtro de vista las luminarias de circuito normal y de circuito de emergencia, si el diseño lo contempla.",
      "Anotar el tablero y circuito que alimenta la iluminación de cada nivel del punto fijo.",
      "Verificar que el desarrollo vertical mostrado coincide con el corte del punto fijo.",
      "Incluir la leyenda de simbología de iluminación en la lámina."
    ],
    resultadoEsperado: "Plano de iluminación del punto fijo generado, mostrando de forma clara la distribución de luminarias normales y de emergencia por nivel.",
    criteriosVerificacion: [
      "El plano muestra todas las luminarias modeladas del punto fijo",
      "Las luminarias de emergencia, si existen, están diferenciadas gráficamente de las normales",
      "Cada nivel mostrado tiene anotado el tablero y circuito que lo alimenta",
      "La lámina incluye la leyenda de simbología de iluminación"
    ],
    notasIngenieria: [
      notaNorma('La iluminación de circulaciones verticales comunes forma parte de la ruta de evacuación y debe quedar respaldada por el sistema de emergencia, independiente del alumbrado normal.', REF.SISTEMAS_EMERGENCIA),
      notaNormaVerificar('Los niveles de iluminancia y la uniformidad exigidos al alumbrado de emergencia en rutas de evacuación los fija el RETILAP; confirmar los valores antes de cerrar el plano.', REF.ILUM_EMERGENCIA),
    ],
    tipsRevit: [
      "Reutiliza la vista de corte creada para la tarea de modelado del punto fijo en lugar de generar una nueva, para mantener consistencia entre modelado y documentación.",
      "Usa un 'Filtro de vista' por parámetro de circuito para diferenciar gráficamente iluminación normal y de emergencia sin duplicar familias."
    ]
  },
  {
    plantillaId: "PB-03-17",
    nombreOriginal: "Plano detalles de escaleras y ascensores",
    nombre: "Elaborar el plano de detalles eléctricos de escaleras y ascensores del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Detalles",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 6,
    prioridad: 'Media',
    dependeDe: ["PB-03-04", "PB-02-05"],
    guiaIds: ["M3.4", "M5.4"],
    descripcion: "Documentar los detalles constructivos de las instalaciones eléctricas asociadas a escaleras y ascensores (foso de ascensor, cuarto de máquinas, tomas de mantenimiento) requeridos para su ejecución.",
    objetivo: "Dejar documentados los detalles constructivos de las instalaciones eléctricas de escaleras y ascensores.",
    requisitos: [
      "Iluminación y tomas del foso de ascensor modeladas",
      "Instalaciones eléctricas de escaleras modeladas",
      "Vistas de escaleras creadas"
    ],
    procedimiento: [
      "Identificar los puntos de escaleras y ascensores que requieren detalle constructivo (foso, cuarto de máquinas, tomas de mantenimiento).",
      "Crear vistas de detalle (Callout) sobre cada zona identificada en el modelo.",
      "Ajustar el nivel de detalle de la vista a fino y activar los componentes necesarios.",
      "Anotar alturas de montaje, circuitos y protecciones específicas de cada punto detallado.",
      "Verificar consistencia entre los detalles y los elementos realmente modelados en el foso y cuarto de máquinas.",
      "Referenciar cada detalle desde el plano general correspondiente."
    ],
    resultadoEsperado: "Detalles constructivos de las instalaciones eléctricas de escaleras y ascensores documentados y referenciados desde los planos generales.",
    criteriosVerificacion: [
      "Existe un detalle para el foso de ascensor con sus puntos eléctricos anotados",
      "Existe un detalle para el cuarto de máquinas si el proyecto lo contempla",
      "Los detalles incluyen alturas de montaje y circuito asociado",
      "Las referencias de detalle en los planos generales apuntan a la lámina correcta"
    ],
    notasIngenieria: [
      notaNorma('Ascensores, escaleras y andenes móviles son equipos especiales con requisitos propios de instalación eléctrica, medios de desconexión e iluminación de foso y cuarto de máquinas.', REF.ASCENSORES),
      notaCriterio('La iluminación y tomas del foso de ascensor suelen tener requisitos particulares de montaje del proveedor del equipo; confirmar contra la ficha técnica del ascensor antes de cerrar el detalle.'),
    ],
    tipsRevit: [
      "Usa 'Callout' sobre la vista de sección del foso de ascensor para generar el detalle enlazado directamente al modelo.",
      "Activa 'Componente de detalle' para representar elementos de montaje que no están modelados en 3D dentro del foso."
    ]
  },
  {
    plantillaId: "PB-03-18",
    nombreOriginal: "Plano de fotométricos",
    nombre: "Elaborar el plano de niveles fotométricos de iluminación del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 8,
    prioridad: 'Alta',
    dependeDe: ["PB-02-05"],
    guiaIds: ["M5.4", "M3.1"],
    descripcion: "Documentar en plano los niveles de iluminancia calculados para las áreas del proyecto, incorporando los resultados del estudio fotométrico sobre las vistas de planta correspondientes.",
    objetivo: "Dejar documentados en plano los niveles fotométricos calculados para las áreas del proyecto.",
    requisitos: [
      "Estudio fotométrico del proyecto disponible",
      "Luminarias modeladas en las áreas evaluadas",
      "Vistas de planimetría preparadas en los rótulos"
    ],
    procedimiento: [
      "Recopilar los resultados del estudio fotométrico (curvas isolux o valores de iluminancia por área).",
      "Ubicar la vista de planta del área evaluada.",
      "Incorporar los valores o curvas de iluminancia como anotación o imagen de referencia sobre la vista.",
      "Verificar que la cantidad y ubicación de luminarias mostrada en plano coincide con la usada en el estudio fotométrico.",
      "Anotar el nivel de iluminancia promedio esperado por área.",
      "Incluir la referencia del software o método usado para el cálculo fotométrico en la lámina."
    ],
    resultadoEsperado: "Plano de niveles fotométricos generado, consistente con las luminarias modeladas y con los resultados del estudio fotométrico del proyecto.",
    criteriosVerificacion: [
      "El plano muestra los niveles de iluminancia calculados por área",
      "La cantidad de luminarias mostrada en plano coincide con la usada en el estudio fotométrico",
      "Cada área documentada indica su nivel de iluminancia promedio esperado",
      "La lámina referencia el método o software usado para el cálculo"
    ],
    notasIngenieria: [
      notaNormaVerificar('Los niveles de iluminancia, la uniformidad, el índice de reproducción cromática y el deslumbramiento exigidos por espacio los fija el RETILAP según la tarea visual; el plano documenta el resultado, no lo define.', REF.ILUM_REQUISITOS_INTERIOR),
      notaNorma('El RETILAP admite expresamente la información fotométrica contenida en familias bajo metodología BIM, además de los formatos de matriz de intensidades como .ies: la fotometría de la familia de Revit es un insumo válido si proviene del fabricante.', REF.ILUM_FOTOMETRIAS),
      notaCriterio('Revit no calcula niveles fotométricos con precisión de estudio lumínico; los valores deben provenir de un software especializado externo y solo documentarse sobre el plano.'),
    ],
    tipsRevit: [
      "Importa los resultados del estudio fotométrico como imagen de fondo (Image) sobre la vista de planta en lugar de intentar recalcularlos dentro de Revit.",
      "Verifica el parámetro de flujo luminoso (lumens) de cada familia de luminaria para que sea consistente con el valor usado en el estudio externo."
    ]
  },
  {
    plantillaId: "PB-03-19",
    nombreOriginal: "Plano de redes generales de zonas comunes (equipos de presión, zonas arquitectónicas, eyectores con HVAC)",
    nombre: "Elaborar el plano de redes eléctricas de zonas comunes para equipos de presión y eyectores con HVAC",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 3,
    horasEstimadas: 6,
    prioridad: 'Media',
    dependeDe: ["PB-02-04"],
    guiaIds: ["M5.2", "M6.1"],
    descripcion: "Documentar en plano las redes eléctricas generales de las zonas comunes que alimentan equipos de presión, eyectores y otros equipos coordinados con la disciplina de HVAC, incluyendo su relación con las zonas arquitectónicas donde se ubican.",
    objetivo: "Dejar documentado en plano el sistema eléctrico general de zonas comunes que alimenta equipos de presión y eyectores coordinados con HVAC.",
    requisitos: [
      "Redes de servicios comunes modeladas",
      "Circuitos de fuerza para equipos especiales creados",
      "Coordinación con HVAC de la ubicación de equipos realizada"
    ],
    procedimiento: [
      "Ubicar las vistas de planta de las zonas arquitectónicas donde se encuentran los equipos de presión y eyectores.",
      "Verificar en el modelo vinculado de HVAC la ubicación real de cada equipo a alimentar.",
      "Mostrar en la vista los circuitos y canalizaciones que alimentan cada equipo.",
      "Etiquetar cada equipo con su tablero, circuito y protección asociada.",
      "Revisar que la ubicación mostrada en plano coincide con la del modelo de HVAC vinculado.",
      "Incluir la leyenda de simbología correspondiente en la lámina."
    ],
    resultadoEsperado: "Plano de redes eléctricas generales de zonas comunes generado, documentando correctamente la alimentación de equipos de presión y eyectores coordinados con HVAC.",
    criteriosVerificacion: [
      "El plano muestra todos los equipos de presión y eyectores con alimentación eléctrica modelada",
      "Cada equipo mostrado tiene etiquetado su tablero, circuito y protección",
      "La ubicación de los equipos en plano coincide con el modelo de HVAC vinculado",
      "La lámina incluye la leyenda de simbología correspondiente"
    ],
    notasIngenieria: [
      notaNorma('Los motores y grupos electrógenos tienen requisitos de instalación y protección propios en el RETIE, distintos de los de una carga resistiva.', REF.MOTORES_GRUPOS),
      notaCriterio('Los eyectores y equipos de presión coordinados con HVAC suelen requerir confirmación de potencia final con el proveedor del equipo antes del cierre de circuitos.'),
    ],
    tipsRevit: [
      "Usa 'Copiar/Monitorear' para mantener sincronizada la ubicación de los equipos del modelo de HVAC vinculado.",
      "Filtra por categoría 'Equipo mecánico' en el modelo de HVAC vinculado para ubicar rápidamente los eyectores y equipos de presión."
    ]
  },
  {
    plantillaId: "PB-03-20",
    nombreOriginal: "Plano alumbrado exterior",
    nombre: "Elaborar el plano de alumbrado exterior del proyecto",
    grupo: "03-documentacion",
    subgrupo: "Planos",
    categoria: "Documentación",
    disciplina: "Eléctrica",
    dificultad: 2,
    horasEstimadas: 6,
    prioridad: 'Media',
    dependeDe: [],
    guiaIds: ["M5.4", "M3.1"],
    descripcion: "Documentar en plano el sistema de alumbrado exterior del proyecto (vías internas, zonas comunes exteriores, fachadas), mostrando circuitos, canalizaciones y tablero de control.",
    objetivo: "Dejar documentado en plano el sistema de alumbrado exterior del proyecto.",
    requisitos: [
      "Luminarias exteriores modeladas",
      "Circuitos de alumbrado exterior creados",
      "Vistas de planimetría de zonas exteriores preparadas en los rótulos"
    ],
    procedimiento: [
      "Ubicar la vista de planta general de zonas exteriores del proyecto.",
      "Verificar la visibilidad de las luminarias exteriores y sus canalizaciones en la vista.",
      "Etiquetar el tablero y circuito de control del alumbrado exterior.",
      "Anotar los tramos de canalización enterrada o aérea según corresponda al diseño.",
      "Revisar que el trazado mostrado coincide con el recorrido real modelado.",
      "Incluir la leyenda de simbología de alumbrado exterior en la lámina."
    ],
    resultadoEsperado: "Plano de alumbrado exterior generado, documentando de forma clara la ubicación de luminarias, canalizaciones y el tablero de control.",
    criteriosVerificacion: [
      "El plano muestra todas las luminarias exteriores modeladas",
      "El tablero y circuito de control del alumbrado exterior están etiquetados",
      "Los tramos de canalización mostrados coinciden con el trazado real modelado",
      "La lámina incluye la leyenda de simbología de alumbrado exterior"
    ],
    notasIngenieria: [
      notaNormaVerificar('Los requisitos de iluminación de grandes áreas exteriores, incluidos los niveles y el control de la contaminación lumínica, los fija el RETILAP; confirmarlos antes de cerrar el plano.', REF.ILUM_EXTERIOR),
      notaNorma('Las redes eléctricas que alimentan el alumbrado exterior deben cumplir los requisitos generales de redes de iluminación del RETIE.', REF.REDES_ILUMINACION),
    ],
    tipsRevit: [
      "Usa 'Filtros de vista' para diferenciar el alumbrado exterior del resto de sistemas eléctricos en la planta general.",
      "Etiqueta las canalizaciones enterradas con un tipo de línea distinto configurado en la plantilla de vista para diferenciarlas de las aéreas."
    ]
  }
];
