import type { Leccion } from '../../types';

export const M8_LECCIONES: Leccion[] = [
  {
    id: 'M8.1',
    titulo: 'Dynamo: cuándo sí y cuándo no',
    minutos: 16,
    queEs:
      'Dynamo es la herramienta de programación visual integrada en Revit (pestaña Gestionar > Dynamo) que permite construir rutinas ("grafos") con nodos conectados para leer y escribir datos del modelo sin escribir C#. Cada grafo automatiza una secuencia de pasos que, hechos a mano, se repetirían elemento por elemento: leer un parámetro, aplicar una regla, escribirlo de vuelta en cientos de tableros, circuitos o salidas a la vez.',
    paraQueSirve:
      'Sirve para convertir en segundos una tarea que a mano tomaría horas, siempre que esa tarea sea repetitiva, tenga una regla clara y aplique a un volumen alto de elementos. Ejemplo típico: renombrar y numerar de forma consistente todos los circuitos de un tablero, o de todos los tableros de un proyecto, en un solo clic en vez de editar circuito por circuito.',
    cuandoUsarlo:
      'Se justifica cuando el criterio de la tarea es explícito (una regla de nomenclatura, un rango de numeración, una fórmula) y el volumen de elementos afectados es alto —decenas o cientos—, de modo que el tiempo de construir y probar el grafo es menor que el tiempo de hacerlo a mano. No se justifica cuando la tarea requiere criterio de ingeniería caso por caso (por ejemplo decidir a qué tablero conectar una carga específica), cuando solo se va a ejecutar una vez sobre un puñado de elementos, o cuando todavía no existe una regla clara: automatizar una regla ambigua solo automatiza el error.',
    procedimiento: [
      'Antes de abrir Dynamo, escribir en una frase la regla exacta que se quiere aplicar y contar cuántos elementos del modelo la necesitan.',
      'Estimar el tiempo de hacerlo a mano (elementos × segundos por elemento) contra el tiempo estimado de construir y probar el grafo; si son similares, hacerlo a mano.',
      'Abrir Dynamo desde la pestaña Gestionar y crear un grafo nuevo o partir de uno existente de la biblioteca del estudio.',
      'Usar nodos de selección (Select Model Elements, Categories) para acotar el grafo solo a la categoría y el alcance que corresponde, nunca a "todo el modelo" en el primer intento.',
      'Construir la lógica con nodos estándar (Element.GetParameterValueByName, Element.SetParameterByName) antes de recurrir a un nodo de Python o DesignScript personalizado.',
      'Ejecutar el grafo primero sobre una selección pequeña o un modelo de prueba, y comparar el resultado contra lo que se esperaba a mano.',
      'Solo después de validar el resultado en la muestra, correr el grafo sobre el alcance completo, idealmente con el archivo sincronizado y sin otros usuarios editando esos elementos.',
      'Guardar el grafo con nombre descriptivo en el repositorio de rutinas del estudio, no en una carpeta personal.',
    ],
    erroresFrecuentes: [
      'Invertir más tiempo armando y depurando un grafo que el que hubiera tomado hacer la tarea a mano una sola vez.',
      'Correr un grafo nuevo directamente sobre el modelo central sin probarlo antes en una selección pequeña o una copia.',
      'Automatizar una regla que en realidad no estaba completamente definida, propagando una inconsistencia a cientos de elementos en vez de a unos pocos.',
      'Dejar el conocimiento del grafo atado a una sola persona, sin documentarlo ni guardarlo en un lugar compartido del estudio.',
    ],
    buenasPracticas: [
      'Reservar Dynamo para tareas repetitivas con regla clara y volumen alto; para todo lo demás, seguir modelando a mano.',
      'Probar siempre en una muestra pequeña o en un archivo de prueba antes de ejecutar sobre el modelo central.',
      'Preferir nodos estándar de Dynamo sobre scripts Python personalizados salvo que la lógica realmente lo requiera.',
      'Mantener los grafos versionados y documentados (qué hace, qué parámetros toca, cuándo se usó) en la biblioteca de rutinas del estudio.',
    ],
    ejemploAplicado:
      'La tarea "Crear una rutina Dynamo para renombrar y numerar tableros y circuitos eléctricos automáticamente" (PB-08-01) es el caso de uso donde este criterio se aplica en la práctica: la regla de numeración es explícita (por ejemplo tablero-circuito consecutivo) y el volumen de circuitos en un proyecto mediano supera fácilmente el centenar, por lo que construir y probar el grafo una vez cuesta menos que renombrar circuito por circuito en cada tablero del proyecto, y ese mismo grafo se reutiliza en el siguiente proyecto.',
    tareasRelacionadas: ['PB-08-01'],
  },
  {
    id: 'M8.2',
    titulo: 'Rutinas útiles para MEP eléctrico',
    minutos: 15,
    queEs:
      'Además de renombrar y numerar, hay un puñado de rutinas Dynamo que resuelven tareas recurrentes específicas del flujo eléctrico MEP: extraer y clasificar los warnings del modelo en una tabla exportable, listar parámetros de nomenclatura para detectar duplicados o inconsistencias, o volcar a una hoja de cálculo el estado de circuitos y cargas conectadas para revisión antes de entrega.',
    paraQueSirve:
      'Sirve para convertir controles de calidad que hoy se hacen leyendo uno por uno el diálogo de warnings de Revit, o comparando nombres a simple vista, en un reporte estructurado y repetible: mismo criterio, mismo formato, cada vez que se corre antes de una entrega. Esto reduce el tiempo de QC y, sobre todo, reduce que un duplicado o un warning crítico se escape por cansancio o por revisar rápido al final del proyecto.',
    cuandoUsarlo:
      'Cuando el mismo tipo de revisión se repite en cada entrega del proyecto (auditoría de warnings, chequeo de nomenclatura y duplicados) y el volumen de elementos a revisar hace poco práctico un control 100% visual. No reemplaza el criterio de quien revisa: la rutina extrae y organiza los datos, pero la decisión de qué warning es aceptable y cuál hay que corregir sigue siendo del modelador o del líder de QC.',
    procedimiento: [
      'Definir qué información se necesita extraer del modelo: texto y categoría de los warnings, o nombre y ubicación de los elementos a comparar por nomenclatura.',
      'Usar el nodo de warnings de Dynamo (o el paquete correspondiente disponible en el estudio) para leer los warnings activos del documento.',
      'Agrupar y contar los warnings por tipo para priorizar primero los que afectan más elementos o los que son críticos para eléctrico, por ejemplo elementos duplicados en el mismo lugar.',
      'Para nomenclatura, extraer el parámetro Name o el parámetro compartido de código de todos los elementos de una categoría y buscar valores repetidos con un nodo de agrupación.',
      'Exportar el resultado a Excel o CSV con un nodo de escritura de archivo, en una carpeta compartida del proyecto.',
      'Revisar manualmente la lista exportada y decidir qué corregir directamente en Revit; la rutina no corrige automáticamente, solo detecta.',
      'Volver a correr la misma rutina después de corregir, para confirmar que la lista de pendientes bajó a cero antes de la entrega.',
    ],
    erroresFrecuentes: [
      'Confundir "extraer los warnings" con "resolverlos": la rutina detecta, pero cada warning eléctrico sigue necesitando revisión de criterio.',
      'No agrupar ni priorizar los warnings exportados, entregando una lista de cientos de líneas sin indicar cuáles son urgentes.',
      'Correr la auditoría de nomenclatura una sola vez al final del proyecto en vez de periódicamente, acumulando duplicados difíciles de rastrear.',
      'Construir un grafo distinto cada vez que se necesita este control en lugar de reutilizar y ajustar uno ya probado del estudio.',
    ],
    buenasPracticas: [
      'Correr la rutina de auditoría de warnings y de nomenclatura como parte fija del checklist previo a cada entrega, no solo cuando "se sospecha" un problema.',
      'Guardar el reporte exportado de cada corrida como evidencia de control de calidad del proyecto.',
      'Mantener una sola rutina de auditoría reutilizable por estudio, ajustable por proyecto, en vez de reescribirla cada vez.',
      'Combinar la salida de la rutina con criterio humano: priorizar primero los warnings o duplicados que afectan continuidad eléctrica real.',
    ],
    ejemploAplicado:
      'Estas rutinas son la forma eficiente de resolver dos tareas del catálogo que, hechas a mano, consumen horas al final del proyecto: "Auditar los warnings de Revit del modelo eléctrico antes de la entrega" (PB-05-16), donde una rutina que agrupa y exporta los warnings reemplaza el scroll manual por el diálogo nativo de Revit; y "Revisar la nomenclatura y detectar elementos duplicados en el modelo eléctrico" (PB-05-17), donde extraer y comparar el parámetro de código de cada elemento con Dynamo encuentra duplicados que a simple vista, en un modelo de cientos de tableros y salidas, son casi imposibles de detectar.',
    tareasRelacionadas: ['PB-05-16', 'PB-05-17'],
  },
  {
    id: 'M8.3',
    titulo: 'Plantillas y contenido reutilizable',
    minutos: 14,
    queEs:
      'El contenido reutilizable de un estudio es todo lo que no se vuelve a construir desde cero en cada proyecto: la plantilla de proyecto con sus parámetros compartidos ya cargados, las familias de tableros y dispositivos eléctricos ya parametrizadas, y las plantillas de vista con la visibilidad y gráficos ya resueltos. Es la diferencia entre empezar cada proyecto en cero y empezar cada proyecto desde un punto de partida ya probado.',
    paraQueSirve:
      'Sirve para que la primera semana de cualquier proyecto nuevo no se vaya en resolver problemas que el estudio ya resolvió antes: qué parámetros compartidos usar, cómo se ve una vista de iluminación, qué familia de tablero usar. También asegura consistencia entre proyectos: dos modeladores distintos, en dos proyectos distintos, producen planos con la misma apariencia y el mismo criterio de nomenclatura porque parten de la misma base.',
    cuandoUsarlo:
      'Al arrancar cada proyecto nuevo, siempre desde la plantilla del estudio y no desde un archivo en blanco o desde "el último proyecto parecido" copiado a mano. También cada vez que se resuelve algo por primera vez que probablemente se va a repetir (una plantilla de vista, un tipo de familia, una configuración de parámetros): ese es el momento de subirlo a la biblioteca del estudio en vez de dejarlo enterrado en un solo proyecto.',
    procedimiento: [
      'Antes de crear una plantilla de vista o de contenido nueva, verificar si ya existe algo equivalente en la biblioteca del estudio para no duplicar esfuerzo.',
      'Si no existe, construirla resolviendo bien el caso general (no solo el caso puntual del proyecto actual) para que sirva en el siguiente proyecto también.',
      'Documentar brevemente qué resuelve la plantilla o el contenido nuevo: para qué sistema eléctrico sirve, qué parámetros espera, qué convención de nombres sigue.',
      'Guardar el archivo en la ubicación central de la biblioteca del estudio, no en la carpeta local de un proyecto específico.',
      'Comunicar al equipo que existe contenido nuevo disponible, para que se reutilice en vez de recrearse en paralelo por otro modelador.',
      'Revisar periódicamente la biblioteca para retirar o actualizar plantillas y familias que quedaron obsoletas frente al estándar gráfico actual del estudio.',
    ],
    erroresFrecuentes: [
      'Recrear una plantilla de vista o una familia que ya existe en la biblioteca del estudio por no revisar antes si ya estaba resuelta.',
      'Construir contenido reutilizable pensando solo en el proyecto actual, dejándolo demasiado específico para servir en el siguiente.',
      'Guardar contenido nuevo en la carpeta local del proyecto en vez de subirlo a la biblioteca compartida, perdiéndolo cuando el proyecto se archiva.',
      'Dejar plantillas y familias viejas mezcladas con las vigentes sin ninguna limpieza, obligando a adivinar cuál versión usar.',
    ],
    buenasPracticas: [
      'Tratar cada plantilla de vista, cada familia y cada parámetro compartido como un activo del estudio, no del proyecto donde nació.',
      'Nombrar el contenido reutilizable con una convención clara que indique versión y disciplina.',
      'Revisar la biblioteca de contenido al arrancar cada proyecto, antes de crear nada nuevo desde cero.',
      'Asignar a alguien del equipo la responsabilidad de mantener y depurar la biblioteca periódicamente.',
    ],
    ejemploAplicado:
      'Dos tareas del catálogo son, en la práctica, la construcción de esta biblioteca: "Configurar la plantilla de proyecto MEP y cargar los parámetros compartidos eléctricos" (PB-01-07) resuelve la base de cada proyecto nuevo —parámetros, categorías, disciplina— y "Construir la biblioteca de plantillas de vista reutilizables del estudio" (PB-08-02) resuelve la capa de presentación: una vez existen esas plantillas de vista, cualquier proyecto nuevo aplica visibilidad y gráficos consistentes en un clic en vez de configurar VG vista por vista otra vez.',
    tareasRelacionadas: ['PB-01-07', 'PB-08-02'],
  },
  {
    id: 'M8.4',
    titulo: 'Atajos y hábitos que ahorran horas',
    minutos: 13,
    queEs:
      'Son los hábitos de trabajo dentro de Revit que no requieren Dynamo ni programación: atajos de teclado, uso del selector de tipo con favoritos, copiar/pegar alineado, repetir el último comando, filtros de selección por categoría y uso de tablas de planificación para verificar en vez de contar a ojo. Individualmente ahorran segundos; en una tarea que se repite cientos de veces en un proyecto, se acumulan en horas reales.',
    paraQueSirve:
      'Sirve para que las tareas de modelado más repetitivas del flujo eléctrico —insertar salidas, copiar un patrón de tomacorrientes de una unidad a otra, verificar conexiones de circuito— tomen una fracción del tiempo que toman cuando cada elemento se inserta y configura desde cero con el mouse. No sustituye a Dynamo para volúmenes muy altos, pero cubre el rango intermedio de tareas donde construir un grafo no se justifica pero hacerlo "a lo bruto" tampoco es necesario.',
    cuandoUsarlo:
      'En cualquier tarea de modelado que se repite muchas veces dentro de un mismo proyecto —tipologías de unidad repetidas, patrones de tomas o luminarias que se replican piso por piso— y donde ya existe un elemento bien configurado que sirve de referencia para copiar en vez de crear desde cero cada vez.',
    procedimiento: [
      'Configurar bien el primer elemento de un patrón repetitivo (por ejemplo la primera toma trifásica de una tipología) antes de replicarlo, para no arrastrar un error a las siguientes copias.',
      'Usar Copiar/Pegar alineado (Alinear a la misma ubicación) para replicar ese elemento entre unidades o niveles equivalentes en vez de insertarlo de nuevo cada vez.',
      'Usar el comando Repetir el último comando (tecla Enter o clic derecho) para insertar varias instancias seguidas del mismo tipo sin reabrir el panel de familias cada vez.',
      'Marcar como favoritos en el selector de tipo los tipos de familia eléctricos de uso diario del proyecto actual.',
      'Usar filtros de selección por categoría (Filtro en la barra de estado) para aislar y editar en bloque, por ejemplo, todas las tomas normales de una vista sin arrastrar otras categorías.',
      'Verificar cantidades con una tabla de planificación filtrada por tipo o por nivel en vez de contar elementos a ojo en el plano.',
      'Memorizar los 8-10 atajos de teclado de uso más frecuente del estudio para los comandos eléctricos (circuito, alinear, filtro, tabla de planificación).',
    ],
    erroresFrecuentes: [
      'Insertar cada elemento repetitivo desde el panel de familias en vez de copiar y alinear el que ya quedó bien configurado.',
      'No usar el selector de tipo con favoritos y perder tiempo buscando el mismo tipo de familia una y otra vez en una lista larga.',
      'Contar elementos a ojo en el plano en vez de generar una tabla de planificación filtrada, con el riesgo de contar mal en modelos grandes.',
      'Replicar un elemento mal configurado sin darse cuenta, propagando el mismo error a todas las copias siguientes.',
    ],
    buenasPracticas: [
      'Resolver bien el primer elemento de cualquier patrón repetitivo antes de copiarlo masivamente.',
      'Adoptar como hábito de equipo el mismo set de atajos de teclado, para que cualquiera pueda trabajar rápido en el archivo de cualquier compañero.',
      'Usar tablas de planificación como herramienta de verificación constante, no solo al final del proyecto.',
      'Revisar de vez en cuando si una tarea que se está haciendo "a mano con atajos" ya justifica pasar a una rutina Dynamo por el volumen que alcanzó.',
    ],
    ejemploAplicado:
      'La tarea "Crear las tomas normales y trifásicas en la planta arquitectónica del proyecto" (PB-02-12) es el ejemplo más claro de dónde estos hábitos ahorran horas reales: en un edificio con decenas de unidades repetidas, configurar bien la primera toma y luego copiar/alinear por unidad, apoyado en el selector de tipo con favoritos y en tablas de planificación para verificar cantidades, es notablemente más rápido que insertar cada toma desde cero. La misma técnica se repite en "Crear las tomas normales y trifásicas del cuarto de armarios de medidores" (PB-02-13), donde el patrón cambia de contexto pero el hábito de trabajo es el mismo.',
    tareasRelacionadas: ['PB-02-12', 'PB-02-13'],
  },
];

export const M8 = {
  id: 'M8',
  nombre: 'Automatización',
  icon: 'ti-robot',
  nivel: 'Avanzado',
  descripcion:
    'Herramientas y hábitos para dejar de repetir trabajo manual en cada proyecto: cuándo construir una rutina en Dynamo y cuándo no vale la pena, qué rutinas resuelven controles de calidad recurrentes en eléctrico, cómo construir una biblioteca de plantillas y contenido reutilizable del estudio, y qué atajos y hábitos de modelado ahorran horas sin necesidad de programar nada.',
  lecciones: M8_LECCIONES,
};
