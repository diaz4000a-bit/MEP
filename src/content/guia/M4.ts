import type { Leccion } from '../../types';

export const M4_LECCIONES: Leccion[] = [
  {
    id: 'M4.1',
    titulo: 'Tipos de familia y cuándo usar cada uno',
    minutos: 15,
    queEs:
      'Revit clasifica todo el contenido en tres categorías: familias de sistema (viven dentro del proyecto y no se pueden guardar como .rfa, como conduit, bandejas o tipos de nivel), familias cargables (archivos .rfa externos como luminarias, tomacorrientes, tableros o transformadores que se cargan desde una biblioteca) y familias in-place (geometría única modelada directamente en el proyecto, sin reutilización). Dentro de las cargables existen subtipos por anfitrión: basadas en cara (face-based), en techo, en pared o independientes (no hospedadas).',
    paraQueSirve:
      'Elegir el tipo correcto de familia determina si un elemento puede reportar cargas eléctricas, aparecer en tablas de cuantificación, conectarse a un circuito o simplemente servir de referencia visual. Un error de clasificación —por ejemplo modelar un tablero como in-place— rompe el cómputo de cargas, los unifilares automáticos y la exportación a IFC.',
    cuandoUsarlo:
      'Usa familias de sistema para todo lo continuo y paramétrico por naturaleza (conduit, cable tray, bus duct). Usa familias cargables para cualquier equipo o dispositivo discreto definido por catálogo de fabricante (luminarias, tomas, tableros, transformadores, motores). Reserva in-place solo para geometría de sitio única que jamás se repetirá, porque no se puede compartir entre proyectos ni versionar en biblioteca.',
    procedimiento: [
      'Antes de modelar, identifica si el elemento tiene comportamiento paramétrico repetible (candidato a familia cargable) o es continuo/lineal (familia de sistema).',
      'Si es cargable, busca primero en la biblioteca del estudio o del fabricante antes de crear una familia nueva.',
      'Verifica la categoría de Revit asignada a la familia (Iluminación, Dispositivos eléctricos, Equipo eléctrico), porque de eso depende en qué tablas y unifilares aparece.',
      'Define si necesita anfitrión: basada en cara para dispositivos empotrados en muro/techo, basada en piso/techo, o independiente para equipos de piso como tableros.',
      'Carga la familia al proyecto con Insertar > Cargar familia y verifica que los parámetros de conexión eléctrica queden asociados.',
      'Ubica el elemento y confirma en Propiedades que el parámetro de anfitrión corresponde al elemento arquitectónico correcto.',
      'Revisa una vista 3D de comprobación para confirmar que la orientación y el anfitrión no generen advertencias de "elemento fuera del anfitrión".',
    ],
    erroresFrecuentes: [
      'Modelar tomacorrientes o luminarias como in-place "porque es más rápido", perdiendo la posibilidad de reutilizarlos y de que aparezcan en cómputos.',
      'Cargar una familia basada en cara sobre una superficie que luego se elimina o se reemplaza, dejando el dispositivo huérfano.',
      'Usar una familia de otro fabricante o categoría solo porque geométricamente se ve igual, generando errores en el cómputo de cargas por categoría equivocada.',
      'No revisar si el proyecto ya tiene cargada una versión de esa familia, generando duplicados con sufijos "2", "3".',
    ],
    buenasPracticas: [
      'Mantener una biblioteca del estudio con nomenclatura estándar por categoría eléctrica (LUM_, TOM_, TAB_) para no adivinar cuál familia usar.',
      'Preferir familias basadas en cara para dispositivos en espacios confinados como el foso del ascensor o ductos verticales, porque siguen el muro aunque este se edite.',
      'Auditar antes de la entrega que no queden familias in-place eléctricas en el modelo (se listan en el explorador de proyecto bajo "Familias").',
      'Versionar las familias cargables con número de revisión en el nombre del archivo .rfa antes de subirlas a la biblioteca compartida.',
    ],
    ejemploAplicado:
      'En la tarea PB-02-05 ("Modelar la iluminación y las tomas eléctricas del foso del ascensor"), el foso es un espacio confinado donde las luminarias suelen anclarse a la cara del muro estructural o de cortina del ducto de ascensor: ahí es obligatorio usar una familia cargable basada en cara en vez de una independiente, porque solo esta se reubica automáticamente si el diseño del foso cambia de profundidad. Las tomas de mantenimiento del foso, en cambio, se resuelven con familias basadas en pared estándar del catálogo eléctrico del estudio.',
    tareasRelacionadas: ['PB-02-05'],
  },
  {
    id: 'M4.2',
    titulo: 'Parámetros de tipo, de ejemplar y compartidos',
    minutos: 15,
    queEs:
      'Los parámetros de tipo son valores que comparten todas las instancias de un mismo tipo de familia (ej. la potencia nominal de un modelo de luminaria); los parámetros de ejemplar varían elemento por elemento (ej. el circuito asignado o la sala); los parámetros compartidos se definen en un archivo .txt externo al proyecto, son reutilizables entre familias y categorías distintas, y son los únicos que pueden aparecer en tablas de planificación multi-categoría y en etiquetas.',
    paraQueSirve:
      'Esta clasificación decide qué información puede filtrarse, programarse o exportarse. Un dato que debería variar por unidad —como el circuito— pero está mal definido como parámetro de tipo terminará igual en todos los ejemplares de ese tipo, corrompiendo el cuadro de cargas. Los parámetros compartidos son indispensables cuando el mismo dato (ej. "Código RETIE" o "Circuito") debe verse en categorías distintas —luminarias, tomas, tableros— dentro de la misma tabla.',
    cuandoUsarlo:
      'Usa parámetro de tipo para atributos de catálogo del fabricante (voltaje nominal, potencia, IP). Usa parámetro de ejemplar para lo que depende de la ubicación o el circuito (nivel, sala, circuito eléctrico, fase). Usa parámetro compartido en cuanto necesites que ese dato cruce categorías en una misma tabla de planificación o etiqueta, o que se mantenga estable si la familia se reconstruye.',
    procedimiento: [
      'Antes de crear un parámetro, decide su alcance: ¿varía por elemento o es fijo por tipo? Eso define type vs instance.',
      'Si el dato debe aparecer en tablas que combinan categorías (luminarias + tomas + tableros), créalo como parámetro compartido en Administrar > Parámetros compartidos.',
      'Organiza el archivo de parámetros compartidos por grupos lógicos (Eléctrico_Circuitos, Eléctrico_RETIE) para que el .txt no se vuelva ilegible.',
      'Carga el archivo de parámetros compartidos en la plantilla del proyecto antes de que el equipo empiece a modelar, no a mitad de proyecto.',
      'Al agregar el parámetro a una familia o categoría del proyecto, asigna el grupo de parámetros correcto (Datos eléctricos, Datos de identidad) para que aparezca ordenado en Propiedades.',
      'Verifica con "Tipos de familia" dentro del editor de familias qué parámetros quedaron marcados como Type vs Instance antes de guardar la .rfa.',
      'Prueba el parámetro en una tabla de planificación multi-categoría para confirmar que efectivamente se comparte entre las familias eléctricas involucradas.',
    ],
    erroresFrecuentes: [
      'Definir "Circuito" como parámetro de tipo: todas las tomas de ese tipo terminan mostrando el mismo circuito aunque estén en tableros distintos.',
      'Crear el mismo dato como parámetro de proyecto en un archivo y como parámetro compartido en otro, generando dos columnas distintas con el mismo nombre visual en las tablas.',
      'No versionar el archivo de parámetros compartidos: cada disciplina termina con una copia local distinta y las tablas dejan de cruzar entre proyectos.',
      'Cambiar el GUID del parámetro compartido al recrear el archivo, lo que rompe la vinculación con datos ya llenados en proyectos existentes.',
    ],
    buenasPracticas: [
      'Guardar el archivo de parámetros compartidos en la misma ubicación de red que la plantilla de proyecto y referenciarlo siempre desde ahí, nunca desde una copia local.',
      'Documentar qué parámetro es compartido, de tipo o de ejemplar, y en qué grupo de parámetros vive.',
      'Bloquear la edición del archivo de parámetros compartidos a una sola persona responsable (BIM manager) para evitar GUIDs duplicados.',
      'Revisar antes de cada entrega que los parámetros de ejemplar críticos (circuito, panel, fase) efectivamente varíen entre elementos.',
    ],
    ejemploAplicado:
      'La tarea PB-01-07 ("Configurar la plantilla de proyecto MEP y cargar los parámetros compartidos eléctricos") es exactamente este procedimiento: al preparar la plantilla del estudio se carga el archivo de parámetros compartidos con los campos eléctricos estándar (circuito, panel, fase, código RETIE) y se decide, para cada uno, si se agrega como parámetro de tipo o de ejemplar en las categorías de luminarias, tomas, tableros y equipos, antes de que cualquier proyectista empiece a modelar.',
    tareasRelacionadas: ['PB-01-07'],
  },
  {
    id: 'M4.3',
    titulo: 'Crear una familia eléctrica desde cero',
    minutos: 25,
    queEs:
      'Es el proceso de construir un archivo .rfa nuevo desde una plantilla de familia (.rft) apropiada a su categoría y comportamiento de anfitrión, definiendo geometría paramétrica, parámetros de tipo/ejemplar, y —en equipos eléctricos— los conectores eléctricos que permiten que Revit reconozca el elemento dentro de un circuito.',
    paraQueSirve:
      'Cuando ningún fabricante ni biblioteca (incluida la del estudio) tiene el equipo específico que exige el proyecto, crear la familia a la medida es la única forma de que ese equipo participe en cómputos de carga, circuitos, tablas y detección de interferencias como cualquier otro componente eléctrico nativo de Revit.',
    cuandoUsarlo:
      'Úsalo cuando el equipo es específico del proyecto o del operador de red (dámper, celda de media tensión, gabinete a medida) y no existe en catálogo, o cuando la geometría genérica disponible no representa correctamente el tamaño real para efectos de interferencias y despieces.',
    procedimiento: [
      'Elige la plantilla .rft correcta según el comportamiento del equipo: basada en piso para equipo de subestación, basada en cara para dispositivos murales, genérica métrica para equipo independiente.',
      'Define la categoría de Revit de la nueva familia (Equipo eléctrico, Equipo mecánico), porque de ahí dependen los filtros, tablas y símbolos en unifilar.',
      'Modela la geometría de referencia (extrusiones, barridos) usando planos de referencia y acota con dimensiones paramétricas, no con valores fijos.',
      'Crea los parámetros de tipo para las variantes dimensionales (ej. distintos anchos de dámper) y asócialos a las dimensiones del sketch con fórmulas si aplica.',
      'Agrega los conectores eléctricos (Insertar > Conector eléctrico) en la cara real por donde entra la alimentación, y configura su sistema, potencia, voltaje y número de polos.',
      'Define los parámetros compartidos necesarios para que el equipo cruce en tablas junto con otras categorías (circuito, código RETIE, fabricante).',
      'Prueba la familia cargándola en un proyecto vacío: verifica que el conector permita crear un circuito y que las variantes de tipo cambien la geometría sin errores.',
      'Guarda la .rfa con la nomenclatura del estudio y súbela a la biblioteca central para que quede disponible a todo el equipo.',
    ],
    erroresFrecuentes: [
      'Omitir el conector eléctrico: la familia se ve correcta pero Revit no la deja asociar a un circuito ni calcular su carga.',
      'Modelar la geometría con medidas fijas en vez de paramétricas, obligando a crear una familia nueva por cada tamaño en vez de un solo family con tipos.',
      'Ubicar el conector en un punto que no corresponde a la entrada real de alimentación, generando trayectorias de circuito absurdas en el unifilar automático.',
      'No probar la familia en un proyecto antes de subirla a la biblioteca, propagando el error a todos los proyectos que la usen después.',
    ],
    buenasPracticas: [
      'Empezar siempre desde la plantilla .rft más cercana al comportamiento real del equipo, nunca desde la plantilla genérica "por costumbre".',
      'Nombrar los parámetros igual que en el catálogo del fabricante o del operador de red, para que documentación no tenga que traducir términos.',
      'Incluir en la familia los parámetros compartidos definidos centralmente (ver M4.2) desde el primer momento, no agregarlos después.',
      'Documentar en las notas del tipo (Type Comments) la fuente de la ficha técnica que justificó las dimensiones y la carga eléctrica.',
    ],
    ejemploAplicado:
      'La tarea PB-06-04 ("Modelar el dámper de ventilación de la subestación para el entregable del operador de red") normalmente no tiene equivalente exacto en las bibliotecas genéricas de Revit ni en el catálogo estándar del estudio, porque sus dimensiones dependen del cálculo de ventilación de cada subestación (ver PB-02-17, "Calcular las dimensiones del dámper de ventilación de la subestación"). Por eso se resuelve creando una familia paramétrica desde una plantilla basada en piso o en cara, con parámetros de tipo para el ancho y alto del dámper ya calculados, de modo que la misma familia sirva para las distintas subestaciones del proyecto sin duplicar archivos .rfa.',
    tareasRelacionadas: ['PB-06-04', 'PB-02-17'],
  },
  {
    id: 'M4.4',
    titulo: 'Conectores eléctricos y su configuración',
    minutos: 15,
    queEs:
      'El conector eléctrico es el objeto dentro de una familia que declara ante Revit que ese elemento puede alimentarse o alimentar: define el sistema (Power, Data, Fire Alarm...), la carga (potencia, tensión, factor de potencia, número de polos) y el punto y dirección físicos por donde "sale" la conexión. Sin conector, un elemento con apariencia de tomacorriente o luminaria es, para Revit, geometría inerte sin comportamiento eléctrico.',
    paraQueSirve:
      'Los conectores son el mecanismo que permite crear circuitos, generar automáticamente los diagramas unifilares, calcular la carga total por tablero y validar la continuidad eléctrica del modelo. Toda la cadena de tareas de distribución y de tablas de cuantificación depende de que cada dispositivo tenga su conector bien configurado.',
    cuandoUsarlo:
      'Revísalo cada vez que cargues una familia eléctrica nueva antes de darla por buena para el proyecto, y cada vez que Revit no te deje seleccionar un elemento al crear un circuito —síntoma casi seguro de conector ausente o mal orientado.',
    procedimiento: [
      'Selecciona el elemento y confirma en Propiedades que tiene parámetros eléctricos (Carga aparente, Tensión, Número de polos); si no aparecen, la familia no tiene conector.',
      'Si necesitas revisar o editar el conector, abre la familia en el editor y selecciona el Electrical Connector en el visor 3D.',
      'En los parámetros del conector, configura el sistema eléctrico (Power Balanced, Power Unbalanced) según si el equipo es monofásico o trifásico balanceado.',
      'Define la carga (Apparent Load) y la tensión (Voltage) del conector, enlazándolas a parámetros de tipo si el equipo tiene variantes de potencia.',
      'Verifica la dirección de la flecha del conector: debe apuntar hacia afuera del equipo, en el sentido físico real del cable de alimentación.',
      'Vuelve al proyecto y selecciona el elemento con la herramienta "Crear circuito eléctrico" para confirmar que Revit reconoce el conector y permite asignarlo a un panel.',
      'Revisa en el Panel Schedule que la carga del circuito recién creado coincide con el valor esperado del conector.',
    ],
    erroresFrecuentes: [
      'Confundir Power Balanced con Power Unbalanced en equipos trifásicos, lo que distorsiona el balanceo de fases del tablero.',
      'Dejar la carga del conector en el valor por defecto de la plantilla (a menudo 0 o un placeholder) y que el cuadro de cargas final quede subestimado.',
      'Tener dos conectores eléctricos en la misma familia (por copiar geometría de otra) generando circuitos duplicados o ambiguos.',
      'No sincronizar el parámetro de carga del conector con el parámetro de tipo visible en Propiedades, de modo que al cambiar uno el otro queda desactualizado.',
    ],
    buenasPracticas: [
      'Validar el conector de toda familia nueva creando un circuito de prueba antes de subirla a la biblioteca del estudio (ver M4.3).',
      'Mantener consistencia de unidades y factor de potencia por categoría (todas las luminarias LED del estudio con el mismo FP salvo justificación).',
      'Nombrar el sistema eléctrico del conector igual en todas las familias de una misma categoría para que los filtros de circuitos no se fragmenten.',
      'Revisar los conectores al recibir familias de fabricantes externos, porque suelen traer cargas o tensiones de catálogo de otro país.',
    ],
    ejemploAplicado:
      'La tarea PB-02-09 ("Crear un circuito eléctrico representativo por cada tipología de unidad del proyecto") depende enteramente de que cada toma, luminaria y salida de fuerza de la unidad —incluidas las tomas normales y trifásicas de PB-02-12— tenga su conector eléctrico bien configurado: si un solo dispositivo del recorrido no tiene conector o tiene la carga en cero, el circuito no se puede cerrar hacia el tablero o el cuadro de cargas de esa tipología queda mal calculado, obligando a revisar familia por familia antes de repetir el circuito en las demás tipologías.',
    tareasRelacionadas: ['PB-02-09', 'PB-02-12'],
  },
  {
    id: 'M4.5',
    titulo: 'Gestión y biblioteca de familias del estudio',
    minutos: 18,
    queEs:
      'Es la disciplina de mantener un repositorio central, versionado y con nomenclatura estándar de todas las familias eléctricas (luminarias, tomas, tableros, equipos) y de los parámetros compartidos asociados, de modo que todos los proyectos del estudio consuman las mismas familias validadas en vez de que cada proyectista cree las suyas.',
    paraQueSirve:
      'Evita duplicación de contenido, familias inconsistentes entre proyectos, errores de cómputo por versiones distintas del mismo equipo, y reduce el tiempo de arranque de un proyecto nuevo porque la plantilla ya trae cargado lo esencial.',
    cuandoUsarlo:
      'Constrúyela y mantenla de forma continua, no solo al inicio: cada vez que se crea una familia nueva (ver M4.3) o se resuelve un caso especial, esa familia debería terminar en la biblioteca central, con su ficha de validación, en vez de quedar suelta en un solo proyecto.',
    procedimiento: [
      'Define una estructura de carpetas única en la red o en el gestor documental (por categoría: Luminarias, Tomas y fuerza, Tableros, Equipo eléctrico, Puesta a tierra).',
      'Establece una convención de nombres de archivo y de tipos dentro de cada familia (prefijo de categoría + fabricante + variante).',
      'Antes de aceptar una familia nueva en la biblioteca, valida que tenga conectores eléctricos correctos (ver M4.4) y los parámetros compartidos estándar del estudio (ver M4.2).',
      'Versiona cada familia con número de revisión en metadatos o en el nombre, y mantén un registro de cambios para que los proyectos en curso sepan si deben actualizar.',
      'Integra la biblioteca a la plantilla de proyecto MEP para que los elementos más usados (tomas normales, luminarias básicas) vengan precargados desde el día uno.',
      'Automatiza con Dynamo, cuando sea posible, la actualización masiva de familias ya colocadas en proyectos activos cuando se publique una nueva versión en biblioteca.',
      'Audita periódicamente los proyectos cerrados para rescatar familias bien resueltas y promoverlas a la biblioteca oficial.',
    ],
    erroresFrecuentes: [
      'Dejar que cada proyecto mantenga su propia copia local de las familias, generando decenas de versiones distintas del mismo tomacorriente en el estudio.',
      'Promover una familia a la biblioteca sin validar sus conectores o parámetros compartidos, propagando un error a todos los proyectos futuros.',
      'No versionar los cambios, de modo que actualizar una familia en biblioteca rompe silenciosamente proyectos que dependían del comportamiento anterior.',
      'Mezclar en la misma carpeta familias de fabricante (sujetas a catálogo externo) con familias genéricas del estudio, dificultando saber cuáles se pueden editar libremente.',
    ],
    buenasPracticas: [
      'Asignar un responsable (BIM manager o similar) que apruebe qué entra a la biblioteca oficial, igual que se hace con las plantillas de vista reutilizables.',
      'Documentar cada familia de la biblioteca con una ficha mínima: categoría, fuente o fabricante, parámetros compartidos incluidos, fecha de validación.',
      'Sincronizar la biblioteca de familias con el mismo repositorio donde vive el archivo de parámetros compartidos, para que ambos evolucionen juntos.',
      'Revisar la biblioteca antes de iniciar cada proyecto nuevo y cargar solo lo que aplica a ese tipo de proyecto, evitando plantillas infladas con contenido irrelevante.',
    ],
    ejemploAplicado:
      'La tarea PB-08-02 ("Construir la biblioteca de plantillas de vista reutilizables del estudio") es la contraparte, dentro del mismo grupo de automatización, de lo que esta lección propone para familias: así como el estudio centraliza y versiona sus plantillas de vista para que ningún proyecto reinvente sus filtros y su grafismo, la biblioteca de familias eléctricas centraliza y versiona el contenido paramétrico que luego se carga en cada plantilla de proyecto (ver PB-01-07), evitando que cada proyectista modele su propio tomacorriente o su propio tablero desde cero.',
    tareasRelacionadas: ['PB-08-02', 'PB-01-07'],
  },
];

export const M4 = {
  id: 'M4',
  nombre: 'Familias y parámetros',
  icon: 'ti-puzzle',
  nivel: 'Intermedio',
  descripcion:
    'Cómo funcionan por dentro las familias de Revit y sus parámetros aplicados a proyectos MEP eléctricos: qué tipo de familia usar en cada caso, cómo distinguir parámetros de tipo, de ejemplar y compartidos, cómo construir una familia eléctrica paramétrica desde cero con sus conectores, y cómo gobernar la biblioteca de familias del estudio para que todos los proyectos partan del mismo contenido validado.',
  lecciones: M4_LECCIONES,
};
