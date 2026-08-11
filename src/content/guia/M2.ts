import type { Leccion } from '../../types';

export const M2_LECCIONES: Leccion[] = [
  {
    id: 'M2.1',
    titulo: 'Sistemas eléctricos en Revit',
    minutos: 16,
    queEs:
      'Un sistema eléctrico en Revit es la agrupación lógica de un panel (tablero), sus circuitos y los equipos conectados a cada circuito, definida por un "Electrical System Type" (Power, Lighting, Data, etc.). Es la capa de datos que existe por encima de la geometría: dos luminarias pueden estar modeladas una junto a otra y no pertenecer al mismo sistema si no comparten circuito. Revit usa esta estructura para calcular cargas, generar cuadros de carga y validar continuidad.',
    paraQueSirve:
      'Sirve para que el modelo no sea solo dibujo sino una base de datos eléctrica: permite generar automáticamente panel schedules, detectar salidas sin circuito asignado, calcular la carga conectada por tablero y trazar el recorrido eléctrico real de la energía desde la acometida hasta cada toma o luminaria. Sin sistemas bien definidos, la documentación de cuadros de carga y diagramas unifilares tiene que hacerse a mano, con alto riesgo de error.',
    cuandoUsarlo:
      'Se usa desde el momento en que existen tableros modelados y salidas eléctricas (tomas, luminarias, equipos) que deben alimentarse desde ellos. Es obligatorio antes de generar cualquier cuadro de carga o diagrama unifilar, y debe revisarse cada vez que se agregan o mueven salidas en el proyecto.',
    procedimiento: [
      'Modelar primero el tablero (panel) como Electrical Equipment con su family cargada y sus parámetros de distribución (voltaje, fases, número de polos) configurados.',
      'Modelar las salidas (tomas, luminarias, equipos) con conectores eléctricos habilitados en la family.',
      'Seleccionar las salidas que pertenecen al mismo circuito y usar "Power" o "Lighting" > "Create Circuit" desde la pestaña Systems.',
      'Asignar el circuito recién creado a un panel disponible desde Electrical Panel Properties o arrastrándolo en el Panel Schedule.',
      'Verificar en el circuito el tipo de carga, el número de polos y el breaker asociado para que coincida con el diseño.',
      'Repetir el proceso por cada tipología de circuito (iluminación, tomas normales, fuerza) manteniendo un criterio uniforme de agrupación.',
      'Revisar en la vista de sistema (System Browser) que no queden elementos eléctricos sin circuito (aparecen como "Unassigned").',
      'Documentar el criterio de circuitación en la memoria del proyecto para que otros modeladores lo repliquen igual.',
    ],
    erroresFrecuentes: [
      'Modelar tomas o luminarias sin crear el circuito correspondiente, dejando el System Browser lleno de elementos "Unassigned".',
      'Mezclar en un mismo circuito salidas de distinta naturaleza (iluminación y tomacorriente) sin que el diseño eléctrico lo contemple.',
      'Crear el circuito antes de tener el tablero modelado, generando circuitos "flotantes" sin panel asignado.',
      'No verificar que el voltaje y la fase del circuito coincidan con los del panel, lo que genera advertencias silenciosas.',
      'Duplicar circuitos al seleccionar dos veces el mismo grupo de elementos por error.',
    ],
    buenasPracticas: [
      'Definir de entrada una convención de nombres y numeración de circuitos (por bloque, por nivel, por tipo de uso) antes de empezar a circuitar.',
      'Circuitar por tipología de unidad repetitiva primero (un apartamento tipo, por ejemplo) y replicar el patrón, no circuito por circuito improvisado.',
      'Revisar el System Browser al final de cada sesión de modelado, no solo al final del proyecto.',
      'Mantener el balanceo de fases en mente desde que se crea el circuito, no como corrección tardía.',
      'Usar parámetros compartidos consistentes para que el panel schedule generado automáticamente sea legible sin retrabajo manual.',
    ],
    ejemploAplicado:
      'La tarea PB-02-09 "Crear un circuito eléctrico representativo por cada tipología de unidad del proyecto" es la aplicación directa de esta lección: por cada tipo de apartamento o local se modelan sus salidas y se agrupan en circuitos de iluminación y de tomas siguiendo el procedimiento anterior, de forma que ese circuito sirva como plantilla replicable para todas las unidades del mismo tipo en el proyecto.',
    tareasRelacionadas: ['PB-02-09', 'PB-02-10'],
  },
  {
    id: 'M2.2',
    titulo: 'Modelado limpio: reglas base',
    minutos: 14,
    queEs:
      'El "modelado limpio" es el conjunto de reglas de disciplina que evitan que el modelo eléctrico se vuelva frágil: usar el tipo de familia correcto para cada elemento, no forzar geometría con líneas de detalle en vez de elementos reales, respetar los sistemas y clasificaciones de Revit (categoría, sistema de canalización) y evitar duplicados o elementos fuera de su workset. No es una cuestión estética, es lo que determina si el modelo se puede cuantificar, documentar y coordinar sin errores.',
    paraQueSirve:
      'Sirve para que el modelo sea confiable como fuente única de verdad: las tablas de planificación, los cuadros de carga, los planos y las detecciones de interferencias dependen de que cada elemento esté bien clasificado y conectado. Un modelo "sucio" produce cuantificaciones erróneas, tuberías que no continúan eléctricamente y clashes falsos o no detectados.',
    cuandoUsarlo:
      'Se aplica en todo momento del modelado, pero es especialmente crítico al iniciar un proyecto (definir el estándar) y en tareas de canalización, donde es fácil "resolver visualmente" un tramo con una línea de detalle en lugar de un conduit real conectado.',
    procedimiento: [
      'Antes de modelar, confirmar que la plantilla de proyecto y los parámetros compartidos eléctricos están cargados (ver PB-01-07).',
      'Usar siempre elementos de sistema o familias cargadas del sistema, nunca líneas de detalle, para representar canalización, cableado o equipos.',
      'Conectar cada tramo de conduit físicamente a sus cajas o equipos usando los conectores, no solo alineándolo visualmente.',
      'Verificar que cada elemento quede en el workset correcto según la convención del proyecto (por disciplina o por zona).',
      'Evitar mover elementos con "Move" arrastrando libremente sin snap; usar los puntos de conexión para no romper la continuidad eléctrica.',
      'Ejecutar Warnings periódicamente (Manage > Warnings) para detectar elementos identical duplicated o desconectados apenas aparecen.',
      'Nombrar tipos de familia y sistemas siguiendo la convención del estudio (ver M9) para que el modelo sea legible para cualquier miembro del equipo.',
    ],
    erroresFrecuentes: [
      'Dibujar canalización con líneas de detalle o líneas de modelo en lugar de conduit real, lo que rompe cualquier cuantificación o continuidad.',
      'Dejar tramos de tubería "cerca" de una caja pero no conectados, generando falsos positivos o negativos en la validación de continuidad.',
      'Modelar el mismo elemento dos veces al copiar/pegar sin revisar duplicados (ver M7.3).',
      'Ignorar los warnings de Revit acumulados durante semanas, haciendo que la limpieza final sea inabordable.',
      'Cambiar el workset de un elemento sin criterio, dificultando la coordinación y el control de visibilidad por disciplina.',
    ],
    buenasPracticas: [
      'Adoptar y documentar un estándar de modelado del estudio (nombres, worksets, niveles de detalle) antes de iniciar el proyecto.',
      'Revisar continuidad y warnings de forma incremental, no solo al final (ver M2.6 y M7.2).',
      'Usar snap a conectores siempre que se una canalización a una caja, tablero o equipo.',
      'Preferir familias del sistema estándar de la biblioteca del estudio en vez de crear variantes ad hoc para el mismo propósito.',
      'Hacer una revisión cruzada rápida (peer check) de un tramo modelado por otra persona antes de darlo por cerrado.',
    ],
    ejemploAplicado:
      'La tarea PB-02-14 "Modelar la tubería de canalización eléctrica para las salidas de tomacorriente y fuerza" es el caso de uso típico de esta lección: cada tramo de conduit debe modelarse como elemento de sistema real, conectado físicamente entre caja y caja, evitando líneas de detalle, para que la tarea de calidad PB-05-01 (verificar continuidad) no encuentre tramos sueltos.',
    tareasRelacionadas: ['PB-02-14', 'PB-05-01'],
  },
  {
    id: 'M2.3',
    titulo: 'Elementos hospedados vs. no hospedados',
    minutos: 15,
    queEs:
      'Un elemento "hospedado" (host-based) necesita un anfitrión geométrico para existir: una luminaria de techo hospedada en una losa, un tomacorriente hospedado en un muro. Un elemento "no hospedado" o "face-based / workplane-based" se coloca libremente en el espacio o sobre cualquier cara sin depender de una categoría de host específica, lo que le da flexibilidad en geometrías atípicas como fosos, ductos o superficies inclinadas.',
    paraQueSirve:
      'Elegir el tipo correcto evita dos problemas opuestos: familias hospedadas que "desaparecen" o generan error cuando el host se borra o cambia, y familias no hospedadas que quedan flotando sin relación real con la arquitectura, dificultando la coordinación. La elección correcta también determina qué tan fácil es reubicar el elemento cuando el modelo arquitectónico cambia.',
    cuandoUsarlo:
      'Se evalúa cada vez que se carga o se crea una family eléctrica nueva, y especialmente en zonas con geometría no estándar —fosos de ascensor, cuartos técnicos, fachadas— donde una family hospedada en muro o piso puede no encontrar una cara válida y falla al insertarse.',
    procedimiento: [
      'Identificar el contexto geométrico del elemento antes de elegir la family: ¿existe siempre un muro, piso o techo confiable como anfitrión?',
      'Si el contexto es irregular o cambiante (fosos, ductos, superficies curvas), preferir una family basada en cara (face-based) o basada en punto (point-based/workplane-based).',
      'Al insertar una family hospedada, verificar en la barra de opciones que el host detectado es el correcto antes de hacer clic (Revit a veces detecta el host equivocado en vistas 3D).',
      'Para familias face-based, usar "Place on Face" y confirmar la orientación de la cara (normal) para que el elemento no quede insertado al revés.',
      'Verificar tras la inserción que el elemento se mueve junto con su host al desplazar la geometría de referencia (test rápido de asociatividad).',
      'Documentar en la biblioteca de familias del estudio qué tipo de hosting usa cada family eléctrica, para que el equipo no tenga que probarlo cada vez.',
    ],
    erroresFrecuentes: [
      'Usar una family hospedada en piso para un elemento que en realidad va en una superficie inclinada o irregular, provocando errores de inserción o elementos mal orientados.',
      'No darse cuenta de que al borrar o modificar el host, Revit borra o deja huérfano al elemento hospedado sin aviso claro.',
      'Insertar una family face-based sobre la cara equivocada (frontal en vez de posterior) por no verificar la normal de la superficie.',
      'Mezclar en el mismo proyecto dos familias equivalentes, una hospedada y otra no, para el mismo propósito, generando inconsistencia en cuantificación y filtros.',
      'Asumir que un elemento no hospedado no necesita relación con la arquitectura y dejarlo desalineado del punto real de instalación.',
    ],
    buenasPracticas: [
      'Mantener en la biblioteca del estudio una sola versión estándar (hospedada o no) por tipo de elemento eléctrico, evitando duplicidad de criterios.',
      'Usar familias face-based para elementos en geometrías no estandarizadas por el arquitecto (fosos, ductos, cárcamos).',
      'Verificar la orientación de la normal antes de insertar cualquier family basada en cara.',
      'Probar la asociatividad host-elemento moviendo el host de prueba antes de replicar el patrón en todo el proyecto.',
      'Anotar en la documentación interna qué tipo de hosting requiere cada family crítica del catálogo eléctrico.',
    ],
    ejemploAplicado:
      'La tarea PB-02-05 "Modelar la iluminación y las tomas eléctricas del foso del ascensor" es el ejemplo directo: el foso no tiene una superficie estándar predecible como un piso típico, así que la luminaria y la toma deben modelarse con familias face-based ancladas a las caras reales del foso (muros o losa de fondo) para que se comporten correctamente si la geometría del foso cambia.',
    tareasRelacionadas: ['PB-02-05'],
  },
  {
    id: 'M2.4',
    titulo: 'Copiar/monitorear elementos vinculados',
    minutos: 17,
    queEs:
      'Copiar/Monitorear (Copy/Monitor) es la herramienta de Revit que permite traer al modelo eléctrico elementos de referencia de un modelo vinculado (niveles, rejillas, muros) manteniendo un vínculo de seguimiento: si el elemento original cambia en el modelo de origen, Revit avisa con un warning de coordinación en el modelo eléctrico. Es la base técnica de la coordinación entre disciplinas antes de cualquier detección de interferencias.',
    paraQueSirve:
      'Sirve para que el equipo eléctrico trabaje sobre niveles y rejillas idénticos a los del arquitecto o estructural, sin necesidad de redibujarlos manualmente, y para detectar automáticamente cuándo el modelo de referencia cambió y el eléctrico quedó desactualizado. Sin esto, cualquier cambio de nivel en arquitectura pasa desapercibido hasta que aparece como error en obra o en la coordinación.',
    cuandoUsarlo:
      'Se ejecuta al iniciar el proyecto, inmediatamente después de vincular los modelos de arquitectura y estructura, y se revisa cada vez que llega una nueva entrega (nueva versión) del modelo vinculado, antes de seguir modelando sobre niveles o rejillas potencialmente desactualizados.',
    procedimiento: [
      'Vincular el modelo arquitectónico (y estructural si aplica) con Link Revit, usando "Auto - Origin to Origin" o el criterio de coordenadas compartidas acordado con el proyecto.',
      'Verificar y ajustar las coordenadas compartidas para que el modelo eléctrico y el vinculado compartan el mismo sistema de referencia.',
      'Ir a Collaborate > Copy/Monitor > Select Link y elegir el modelo vinculado como fuente.',
      'Usar "Copy" para traer niveles y rejillas al modelo eléctrico manteniendo el monitoreo activo.',
      'Configurar en Copy/Monitor Options qué tipos de nivel/rejilla del modelo eléctrico corresponden a cada tipo del modelo de origen.',
      'Verificar tras la copia que los niveles resultantes tengan la misma elevación y nombre de referencia que el original.',
      'Revisar periódicamente Collaborate > Coordination Review para resolver los warnings quegenera cuando el modelo de origen cambia.',
      'Documentar la fecha y versión del modelo vinculado usado, para trazabilidad ante cambios futuros.',
    ],
    erroresFrecuentes: [
      'Vincular el modelo con "Origin to Origin" cuando el proyecto exige coordenadas compartidas, desalineando toda la geometría eléctrica respecto a la real.',
      'Copiar niveles y rejillas manualmente (redibujándolos) en vez de usar Copy/Monitor, perdiendo la alerta automática ante cambios futuros.',
      'Ignorar los warnings de Coordination Review durante meses, acumulando desincronización entre el eléctrico y el modelo de origen.',
      'No verificar que el archivo vinculado esté actualizado a la última versión antes de continuar modelando sobre él.',
      'Recargar el vínculo sin revisar antes qué cambió, arrastrando errores geométricos silenciosos al modelo eléctrico.',
    ],
    buenasPracticas: [
      'Fijar con el resto de disciplinas un único origen de coordenadas compartidas desde el inicio del proyecto.',
      'Revisar Coordination Review como parte de la rutina semanal, no solo cuando hay un problema visible.',
      'Mantener un registro de versiones de los modelos vinculados (fecha de recepción, autor, cambios principales).',
      'No modelar directamente sobre elementos de otra disciplina sin haberlos copiado/monitoreado primero.',
      'Comunicar a las otras disciplinas cuándo un cambio en su modelo generó desincronización relevante en el eléctrico.',
    ],
    ejemploAplicado:
      'La tarea PB-01-08 "Vincular los modelos arquitectónico y estructural y establecer coordenadas compartidas" es el punto de partida obligatorio de esta lección: solo después de vincular correctamente y fijar coordenadas compartidas tiene sentido ejecutar Copy/Monitor sobre niveles y rejillas, lo cual se valida después en la tarea PB-01-10 "Verificar que los niveles y las rejillas coincidan con el modelo arquitectónico vinculado".',
    tareasRelacionadas: ['PB-01-08', 'PB-01-10'],
  },
  {
    id: 'M2.5',
    titulo: 'Modelado por zonas y por niveles',
    minutos: 15,
    queEs:
      'Modelar "por zonas y por niveles" es la estrategia de dividir el alcance eléctrico de un proyecto grande en unidades manejables —por bloque, por torre, por nivel repetitivo o por zona funcional (comunes, parqueaderos, apartamentos)— en lugar de abordar todo el edificio como una sola masa indiferenciada. Es una técnica de gestión del modelo tanto como de modelado: afecta cómo se organizan worksets, vistas y el orden de avance del trabajo.',
    paraQueSirve:
      'Sirve para hacer manejable un proyecto de escala real, permitir que varias personas trabajen en paralelo sin chocar, y sobre todo para aprovechar la repetitividad típica de proyectos MEP eléctrico: un ramal vertical modelado correctamente en una zona de gabinetes de medidores se puede replicar en zonas equivalentes en vez de modelarse desde cero cada vez.',
    cuandoUsarlo:
      'Se aplica desde la planeación del proyecto, al definir worksets y el plan de avance, y es especialmente relevante en elementos verticales que atraviesan niveles (ramales, ductos, apantallamiento) donde el orden de modelado nivel por nivel evita inconsistencias de continuidad entre plantas.',
    procedimiento: [
      'Dividir el alcance del proyecto en zonas lógicas (bloques, torres, tipologías de nivel) antes de empezar a modelar, en coordinación con el resto del equipo.',
      'Definir worksets alineados con esas zonas para permitir trabajo colaborativo sin bloqueos innecesarios.',
      'Identificar los elementos verticales que atraviesan varios niveles (ramales de medidores, bajantes de apantallamiento) y planear su modelado nivel por nivel, de abajo hacia arriba.',
      'Modelar primero una unidad tipo completa de la zona (un nivel repetitivo, un apartamento tipo) y validarla por completo antes de replicarla.',
      'Usar "Select All Instances" o grupos de modelo para replicar la unidad validada en zonas equivalentes, ajustando solo lo que cambie.',
      'Verificar en cada nivel que el ramal vertical se conecta correctamente con el nivel inferior y superior (continuidad entre plantas).',
      'Revisar visibilidad por zona con plantillas de vista específicas para controlar qué worksets y niveles se muestran en cada vista de trabajo.',
    ],
    erroresFrecuentes: [
      'Empezar a modelar sin haber definido zonas ni worksets, generando un modelo monolítico difícil de dividir después.',
      'Replicar una unidad tipo antes de que esté completamente validada, propagando el mismo error a todas las copias.',
      'Modelar un ramal vertical de arriba hacia abajo sin verificar la continuidad real entre niveles, dejando tramos descolgados.',
      'No ajustar las particularidades reales de cada zona al replicar (ej. un nivel con geometría distinta) y dejar elementos fuera de lugar.',
      'Usar worksets que no corresponden a la división real de zonas, complicando la coordinación y el control de visibilidad.',
    ],
    buenasPracticas: [
      'Acordar la división en zonas con el resto de la disciplina y con el líder de proyecto antes de iniciar el modelado masivo.',
      'Validar completamente una unidad tipo (con su propia revisión de calidad) antes de replicarla al resto del proyecto.',
      'Modelar los elementos verticales en el orden físico real (de la fuente de alimentación hacia arriba o hacia abajo, según el sistema).',
      'Mantener nomenclatura de niveles y zonas consistente con la usada por arquitectura y estructura.',
      'Revisar la continuidad entre niveles como parte del cierre de cada zona, no solo al final del proyecto completo.',
    ],
    ejemploAplicado:
      'La tarea PB-02-06 "Modelar el ramal vertical de alimentación a las tomas de los gabinetes de medidores" ejemplifica esta lección: es un elemento que atraviesa múltiples niveles y zonas del edificio, así que debe modelarse nivel por nivel siguiendo la zonificación acordada, verificando la continuidad entre plantas antes de dar por cerrada cada zona.',
    tareasRelacionadas: ['PB-02-06', 'PB-03-04'],
  },
  {
    id: 'M2.6',
    titulo: 'Errores de modelado que se pagan en documentación',
    minutos: 16,
    queEs:
      'Son los errores de modelado que no se notan durante el modelado mismo, pero que se manifiestan como defectos costosos cuando se genera la documentación: cuadros de carga que no cuadran, diagramas unifilares con tramos faltantes, cuantificaciones erróneas en tablas de planificación, o planos con elementos duplicados. La raíz casi siempre está en decisiones tomadas semanas antes, en el modelado.',
    paraQueSirve:
      'Entender esta lección sirve para anticipar el costo real de un atajo en modelado: lo que parece ahorrar tiempo al modelar (no conectar un tramo, no circuitar una salida, duplicar un elemento por descuido) se convierte en horas de retrabajo cuando la documentación —que depende directamente del modelo— sale mal y hay que rastrear el origen del error hacia atrás.',
    cuandoUsarlo:
      'Se aplica como criterio de revisión constante durante el modelado, no solo al final: cada vez que se cierra una zona o un sistema, vale la pena preguntarse qué documento depende de esos datos y si el modelo realmente los soporta, antes de pasar a la siguiente tarea.',
    procedimiento: [
      'Antes de dar por cerrado un tramo de canalización, verificar su continuidad eléctrica real (conectores unidos, no solo proximidad visual).',
      'Ejecutar una verificación de continuidad de tramos de canalización de forma periódica, no solo antes de entregar.',
      'Revisar que cada salida modelada tenga un circuito asignado y que ese circuito esté en el panel correcto, antes de generar cuadros de carga.',
      'Correlacionar cada elemento crítico (breaker, circuito, salida) con el sistema al que pertenece usando el System Browser.',
      'Auditar duplicados y elementos huérfanos antes de generar tablas de planificación, porque un elemento duplicado infla la cuantificación.',
      'Generar una vista o tabla de planificación de prueba temprano en el proyecto (no solo al final) para detectar si el modelo realmente produce datos coherentes.',
      'Documentar y comunicar al equipo cualquier patrón de error recurrente encontrado, para corregirlo en la raíz y no caso por caso.',
    ],
    erroresFrecuentes: [
      'Dar por cerrada una zona sin haber verificado la continuidad eléctrica real de sus tramos de canalización.',
      'Descubrir en la generación del cuadro de carga que hay salidas sin circuito, obligando a devolverse al modelado a mitad de la documentación.',
      'Generar diagramas unifilares antes de auditar duplicados, arrastrando elementos fantasma al diagrama final.',
      'Asumir que "se ve bien" en 3D significa que el modelo está eléctricamente correcto, sin usar herramientas de verificación de continuidad.',
      'Postergar la revisión de calidad al final del proyecto, cuando corregir el modelo implica rehacer documentación ya avanzada.',
    ],
    buenasPracticas: [
      'Adoptar la verificación de continuidad como parte del flujo normal de cierre de cada tramo, no como una tarea aparte al final.',
      'Generar vistas y tablas de planificación de prueba tempranamente para detectar inconsistencias antes de que se acumulen.',
      'Tratar cada warning de Revit relacionado con conectividad como una alerta a resolver de inmediato, no a ignorar.',
      'Coordinar con quien genera la documentación qué datos del modelo son críticos, para priorizar su verificación en el modelado.',
      'Mantener una checklist de verificación de modelo (ver M7.1) que se ejecute antes de cada hito de documentación, no solo antes de la entrega final.',
    ],
    ejemploAplicado:
      'La tarea PB-05-01 "Verificar la continuidad eléctrica de los tramos de canalización en el modelo" es exactamente la contención de este problema: es la tarea de calidad que detecta, antes de llegar a documentación, los tramos de conduit que quedaron visualmente cerca pero no conectados eléctricamente, evitando que ese defecto de modelado aparezca después como un diagrama unifilar o un cuadro de carga incorrecto.',
    tareasRelacionadas: ['PB-05-01', 'PB-05-02'],
  },
];

export const M2 = {
  id: 'M2',
  nombre: 'Modelado',
  icon: 'ti-box',
  nivel: 'Básico',
  descripcion:
    'Fundamentos y disciplina de modelado eléctrico en Revit: cómo estructurar sistemas y circuitos, mantener el modelo limpio, elegir correctamente entre elementos hospedados y no hospedados, coordinar con modelos vinculados mediante Copiar/Monitorear, organizar el trabajo por zonas y niveles, y evitar los errores de modelado que terminan pagándose caro en la documentación.',
  lecciones: M2_LECCIONES,
};
