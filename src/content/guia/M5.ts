import type { Leccion } from '../../types';

export const M5_LECCIONES: Leccion[] = [
  {
    id: 'M5.1',
    titulo: 'Acometidas, subestación y media tensión',
    minutos: 22,
    queEs:
      'La acometida es el tramo de red que conecta el punto de entrega del Operador de Red (OR) con la subestación del proyecto, y la subestación es el conjunto de equipos (transformador, celdas, protecciones) que reduce la media tensión (MT, típicamente 11.4 kV o 13.2 kV en Colombia) a baja tensión utilizable en el edificio. En Revit este conjunto se modela como una combinación de familias de equipo (transformador, celdas), espacios técnicos (cuarto de subestación, cárcamos) y canalización de MT con su sistema eléctrico propio.',
    paraQueSirve:
      'Modelar correctamente la acometida y la subestación permite calcular con precisión la capacidad del transformador, definir el trazado y las dimensiones de ductos de MT, y cumplir los requisitos técnicos que exige el OR para aprobar la conexión y los del RETIE para la parte de seguridad. También es la base para todo el diagrama unifilar de MT del proyecto.',
    cuandoUsarlo:
      'Se usa primero en predimensionamiento, cuando aún no hay diseño arquitectónico definitivo pero ya se conoce el área construida aproximada, para reservar el espacio técnico y estimar el transformador. Se retoma en modelado definitivo cuando ya existe el listado de cargas real del proyecto, para recalcular la capacidad del transformador y trazar la red de MT con precisión.',
    procedimiento: [
      'Revisar el modelo arquitectónico vinculado y ubicar el espacio destinado a la subestación (cuarto técnico interior o celda pad-mounted exterior) respetando los retiros mínimos que exige el OR.',
      'Insertar la familia de subestación/transformador en el nivel correspondiente, configurando parámetros compartidos de potencia (kVA) y tensión primaria/secundaria.',
      'Calcular la carga preliminar del proyecto (área construida x factor de demanda, o número de unidades x carga unitaria normativa) para dimensionar el transformador de forma preliminar.',
      'Trazar el recorrido de la red de MT desde el punto de conexión del OR (poste, cámara o red subterránea) hasta la subestación, usando tubería/bandeja asignada al sistema eléctrico de media tensión.',
      'Asignar el sistema eléctrico de MT a los conductores con su nivel de tensión de sistema propio, distinto del de baja tensión, para que no se mezclen en reportes.',
      'Modelar cárcamos, fosos de aceite (si el transformador es sumergido) y el sistema de desfogue o ventilación de escape según el tipo de equipo elegido.',
      'Recalcular la capacidad definitiva del transformador una vez se tenga el listado de cargas completo del proyecto arquitectónico.',
      'Documentar el diagrama unifilar de media tensión como base para los planos de entrega al OR.',
    ],
    erroresFrecuentes: [
      'Ubicar la subestación sin verificar retiros mínimos del OR o distancias de seguridad a muros y estructuras vecinas.',
      'No diferenciar el nivel de tensión de sistema (MT vs. BT) al crear el circuito eléctrico, lo que arruina los reportes de cargas.',
      'Subdimensionar el transformador por omitir el factor de demanda o el crecimiento futuro previsto del proyecto.',
      'Omitir el sistema de desfogue o los cárcamos que exige el entregable del operador de red, generando reprocesos en documentación.',
    ],
    buenasPracticas: [
      'Confirmar con el OR local el nivel de tensión estándar de la zona (11.4 kV o 13.2 kV) antes de modelar cualquier equipo.',
      'Usar parámetros compartidos para la capacidad del transformador de modo que aparezcan automáticamente en tablas de planificación.',
      'Modelar cárcamos y fosos como elementos independientes vinculados a la subestación para facilitar cambios sin rehacer el conjunto completo.',
      'Coordinar con estructura el peso y el punto de anclaje del transformador antes de fijar la ubicación definitiva de la subestación.',
    ],
    ejemploAplicado:
      'La tarea PB-01-01 "Definir la ubicación y el tipo de la subestación eléctrica del proyecto" es exactamente el punto de partida de esta lección: sin resolver primero dónde y de qué tipo será la subestación, no se puede continuar con PB-01-04 "Estimar la capacidad preliminar del transformador" ni con PB-02-01 "Modelar la red de media tensión desde el punto de conexión del OR hasta la subestación", que es el ejercicio completo de trazado descrito en el procedimiento.',
    tareasRelacionadas: ['PB-01-01', 'PB-01-04', 'PB-02-01'],
  },
  {
    id: 'M5.2',
    titulo: 'Distribución en baja tensión y tableros',
    minutos: 20,
    queEs:
      'La red de baja tensión (BT, 208V/120V trifásico en el estándar colombiano) es el conjunto de alimentadores que llevan la energía desde el secundario del transformador hasta los tableros generales y subtableros de cada bloque o torre del proyecto. En Revit se modela como una jerarquía de tableros (paneles) conectados entre sí por circuitos de tipo alimentador, cada uno con su propia canalización.',
    paraQueSirve:
      'Sirve para definir la topología completa de distribución antes de entrar en el detalle de circuitos ramales: cuántos tableros existen, cómo se alimentan entre sí, y qué capacidad de interruptor principal necesita cada uno. Es la base para verificar caída de tensión en alimentadores largos y para que los panel schedules del proyecto tengan sentido jerárquico.',
    cuandoUsarlo:
      'Se usa una vez definida la subestación y conocido el número de bloques o torres del proyecto, antes de circuitar salidas individuales. También se retoma cada vez que se agrega una zona de servicios comunes (bombas, ascensores, iluminación exterior) que necesita su propio punto de alimentación.',
    procedimiento: [
      'Ubicar los tableros generales y subtableros por bloque en el modelo, tomando como referencia los cuartos técnicos del modelo arquitectónico vinculado.',
      'Crear el sistema eléctrico de tipo alimentador entre la subestación o tablero general y cada subtablero, respetando la jerarquía real del proyecto.',
      'Definir en cada tablero sus parámetros clave: tipo de instalación (superficial o embutido), capacidad del interruptor principal y número de circuitos disponibles.',
      'Enrutar la canalización de los alimentadores de BT respetando los trayectos verticales definidos en predimensionamiento (ductos eléctricos).',
      'Asignar longitudes reales de recorrido a cada alimentador (no aproximadas) para que Revit calcule correctamente la caída de tensión.',
      'Revisar el panel schedule preliminar de cada tablero general para validar que la carga conectada no supere la capacidad del interruptor.',
      'Modelar la alimentación de las zonas de servicios comunes (bombas, ascensores, iluminación de zonas comunes) conectándolas al tablero que corresponda.',
    ],
    erroresFrecuentes: [
      'Conectar subtableros sin definir el sistema eléctrico jerárquico correspondiente, lo que genera circuitos "sin asignar" en el panel schedule.',
      'No verificar la caída de tensión en alimentadores largos (torres altas), obligando a recalibrar el conductor en fases avanzadas del proyecto.',
      'Sobrecargar un tablero general asignándole más subtableros de los que su interruptor principal realmente soporta.',
      'Omitir la alimentación de servicios comunes al calcular la carga total del tablero general, subestimando la demanda real.',
    ],
    buenasPracticas: [
      'Nombrar los tableros con una nomenclatura consistente (TG-01, TB-P01, etc.) desde el inicio para que los panel schedules sean legibles.',
      'Modelar primero la topología completa de tableros y solo después entrar al detalle de circuitos ramales.',
      'Usar un filtro o workset específico para la red de BT que permita aislarla visualmente durante coordinación con otras disciplinas.',
      'Verificar los calibres de conductor contra la memoria de cálculo eléctrico y RETIE antes de fijarlos en el modelo.',
    ],
    ejemploAplicado:
      'Esta lección corresponde directamente a la tarea PB-02-02 "Modelar la red de distribución en baja tensión desde la subestación hasta los tableros de cada bloque", complementada con PB-02-04 "Modelar las redes eléctricas de alimentación de las zonas de servicios comunes del proyecto", que exige exactamente la jerarquía tablero general → subtableros descrita en el procedimiento.',
    tareasRelacionadas: ['PB-02-02', 'PB-02-04'],
  },
  {
    id: 'M5.3',
    titulo: 'Circuitos, panel schedules y balanceo',
    minutos: 24,
    queEs:
      'Un circuito eléctrico ramal agrupa las salidas conectadas a un mismo breaker en un tablero; el panel schedule es la tabla que resume todos los circuitos de ese tablero (carga en VA, fase asignada, capacidad del breaker); y el balanceo de fases es la distribución equilibrada de las cargas entre las tres fases (A, B, C) de un sistema trifásico.',
    paraQueSirve:
      'Circuitar correctamente permite verificar que ningún circuito supere la capacidad de su breaker, y balancear las fases evita que una fase quede sobrecargada mientras otras trabajan por debajo de su capacidad, lo que reduce el estrés sobre el neutro y mejora la calidad de energía entregada al edificio.',
    cuandoUsarlo:
      'Se usa después de tener modeladas las salidas eléctricas y definidos los tableros, cuando se necesita agrupar salidas en circuitos ramales por tipología de unidad y asignarles breaker y fase dentro del tablero correspondiente.',
    procedimiento: [
      'Seleccionar las salidas eléctricas de una tipología representativa (por ejemplo, apartamento tipo 1) y crear el circuito eléctrico con el comando de circuito de potencia de Revit.',
      'Asignar el circuito al tablero correspondiente, verificando que el nivel de tensión del sistema coincida (120V o 208V según el tipo de carga).',
      'Revisar la carga total del circuito en VA contra el límite del breaker asignado, dejando el margen de seguridad habitual (por ejemplo, 80% de la capacidad nominal).',
      'Repetir el proceso para cada tipología representativa del proyecto, sin necesidad de circuitar unidad por unidad cuando son idénticas.',
      'Abrir el panel schedule del tablero y revisar la columna de fase (A/B/C) que Revit asigna automáticamente a cada circuito.',
      'Balancear manualmente moviendo circuitos entre fases cuando el desbalance entre ellas supere un rango razonable (del orden de 10-15%).',
      'Ubicar físicamente los breakers dentro del gabinete del tablero y verificar que la posición coincida con el circuito modelado.',
      'Exportar el panel schedule final hacia la documentación del cuadro de cargas del proyecto.',
    ],
    erroresFrecuentes: [
      'Dejar que Revit asigne las fases automáticamente sin revisar el balanceo real, generando tableros con una fase sobrecargada respecto a las otras.',
      'Circuitar salidas de distinto nivel de tensión (120V y 208V) dentro de un mismo circuito.',
      'No actualizar el panel schedule después de mover o reubicar salidas, dejando cargas desactualizadas en la tabla.',
      'Confundir un circuito ramal con un alimentador al momento de calcular la caída de tensión, aplicando criterios que no corresponden.',
      'Asignar un breaker de capacidad incorrecta respecto a la carga real acumulada del circuito.',
    ],
    buenasPracticas: [
      'Definir y respetar una convención de numeración de fases (impares/pares por fase) consistente en todo el proyecto.',
      'Revisar el panel schedule después de cada cambio de tipología para detectar desbalance de fases de forma temprana.',
      'Definir un circuito "tipo" por tipología y replicarlo, en lugar de recrearlo manualmente cada vez.',
      'Documentar el criterio de balanceo de fases usado en la memoria de cálculo, para trazabilidad ante interventoría.',
    ],
    ejemploAplicado:
      'El núcleo de esta lección son dos tareas consecutivas del catálogo: PB-02-09 "Crear un circuito eléctrico representativo por cada tipología de unidad del proyecto" (pasos 1 a 4 del procedimiento) y PB-02-10 "Ubicar los interruptores (breakers) en los tableros y verificar su conexión con las salidas asociadas", que es exactamente donde se ejecuta el balanceo de fases de los pasos 5 a 7.',
    tareasRelacionadas: ['PB-02-09', 'PB-02-10'],
  },
  {
    id: 'M5.4',
    titulo: 'Iluminación y control',
    minutos: 20,
    queEs:
      'El sistema de iluminación en Revit MEP se compone de luminarias modeladas como familias con parámetros fotométricos (archivo IES del fabricante), agrupadas en circuitos de iluminación y asociadas a un punto de control (interruptor simple, conmutado, sensor de movimiento o dimmer).',
    paraQueSirve:
      'Permite verificar que los niveles de iluminancia (lux) de cada espacio cumplan el uso previsto, coordinar el tipo de control de encendido con el diseño arquitectónico, y documentar planos de iluminación con su cuadro de cargas correspondiente.',
    cuandoUsarlo:
      'Se usa al modelar zonas específicas con requisitos propios de iluminación (foso de ascensor, punto fijo de escaleras, iluminación exterior) y al preparar la documentación de planos de iluminación por planta.',
    procedimiento: [
      'Insertar las familias de luminarias con su archivo fotométrico IES real asociado en el espacio correspondiente del modelo.',
      'Verificar que el nivel de iluminancia (lux) del espacio cumpla con el uso previsto según la norma aplicable, apoyándose en herramientas de análisis de iluminación.',
      'Crear el circuito de iluminación agrupando las luminarias que comparten el mismo ambiente y el mismo punto de control.',
      'Modelar el punto de control (interruptor, sensor de movimiento o dimmer) y asociarlo lógicamente a su grupo de luminarias.',
      'Enrutar la canalización de iluminación por techo o losa, evitando cruces con ductos de HVAC o elementos estructurales.',
      'Modelar la iluminación de zonas especiales, como el foso del ascensor, que exige tanto luminaria como tomacorriente según la norma de ascensores.',
      'Generar la vista de planta de iluminación con su cuadro de cargas y ubicarla dentro de la lámina correspondiente.',
      'Para iluminación exterior, verificar postes o proyectores y asignarles un circuito independiente con fotocelda o control horario.',
    ],
    erroresFrecuentes: [
      'Usar luminarias sin archivo IES real del fabricante, lo que invalida cualquier cálculo posterior de niveles fotométricos.',
      'Circuitar iluminación y tomacorrientes en un mismo circuito por descuido, mezclando cargas de naturaleza distinta.',
      'Olvidar la iluminación de emergencia o señalización en escaleras y punto fijo, exigida en la documentación de entrega.',
      'No coordinar la posición de sensores de movimiento con mobiliario o puertas que puedan bloquear su cobertura real.',
      'Omitir el control horario o la fotocelda en los circuitos de iluminación exterior.',
    ],
    buenasPracticas: [
      'Mantener una biblioteca de luminarias con archivos IES verificados por el fabricante, gestionada como contenido reutilizable del estudio.',
      'Agrupar los circuitos de iluminación por ambiente de control real, no solo por cercanía física entre luminarias.',
      'Verificar los niveles de iluminancia con la herramienta de análisis antes de fijar la cantidad definitiva de luminarias.',
      'Documentar el criterio de control (encendido simple, conmutado, sensores, dimming) en la memoria descriptiva del proyecto.',
    ],
    ejemploAplicado:
      'La tarea PB-02-05 "Modelar la iluminación y las tomas eléctricas del foso del ascensor" es el ejercicio de modelado completo de esta lección (pasos 1 a 6), y su resultado se documenta más adelante en tareas como PB-03-16 "Elaborar el plano de iluminación del punto fijo" y PB-03-20 "Elaborar el plano de alumbrado exterior del proyecto".',
    tareasRelacionadas: ['PB-02-05', 'PB-03-16', 'PB-03-20'],
  },
  {
    id: 'M5.5',
    titulo: 'Tomacorrientes y circuitos de fuerza',
    minutos: 18,
    queEs:
      'Los tomacorrientes normales (120V) y las tomas de fuerza o trifásicas (208V) son las salidas eléctricas para alimentar equipos y electrodomésticos; su ubicación responde tanto al layout de mobiliario de la planta arquitectónica como a normas de accesibilidad, incluido el Punto de Acceso al Usuario (PAU) cuando el proyecto lo exige.',
    paraQueSirve:
      'Permite ubicar las salidas de forma coherente con el diseño arquitectónico (cocina, lavandería, equipos especiales), definir con precisión cuáles son normales y cuáles trifásicas, y garantizar que cada zona tenga la cobertura de tomas que exige el código.',
    cuandoUsarlo:
      'Se usa primero en predimensionamiento, al proponer la ubicación de salidas sobre la planta arquitectónica sin mobiliario definitivo, y se retoma en modelado definitivo cuando ya está confirmado el layout de mobiliario y equipos.',
    procedimiento: [
      'Revisar la planta arquitectónica vinculada e identificar el mobiliario fijo o los equipos que requieren alimentación eléctrica (cocina, lavadora, aire acondicionado).',
      'Proponer la ubicación de salidas normales sobre los muros respetando las distancias mínimas normativas entre tomas y la altura de instalación.',
      'Insertar la familia de tomacorriente correspondiente: normal (120V) para uso general o trifásica/fuerza (208V) para el equipo específico que se está alimentando.',
      'Verificar la toma dedicada del Punto de Acceso al Usuario (PAU) cuando el tipo de proyecto lo exige.',
      'Circuitar las tomas agrupándolas por ambiente y por tipo de tensión, sin mezclarlas con circuitos de iluminación.',
      'Modelar la canalización de tomacorrientes y fuerza coordinando su trayecto con cielo raso o piso técnico.',
      'Verificar que cada salida de comunicaciones tenga asociada una salida eléctrica cercana, según el criterio de coordinación del proyecto.',
      'Validar el conteo final de salidas contra el cuadro de cargas de la tipología correspondiente.',
    ],
    erroresFrecuentes: [
      'Confundir tomacorriente normal con toma trifásica o de fuerza, usando la familia incorrecta para el equipo a alimentar.',
      'No dejar la toma dedicada del PAU cuando la norma del proyecto lo exige explícitamente.',
      'Ubicar tomas antes de que el mobiliario esté definido, generando reproceso cuando cambia el layout arquitectónico.',
      'Circuitar tomas de alta demanda (cocina) junto con tomas normales de habitaciones sin separar su capacidad.',
      'Olvidar la coordinación entre toma eléctrica y toma de comunicaciones en puestos de trabajo o zonas técnicas.',
    ],
    buenasPracticas: [
      'Usar una familia paramétrica única de tomacorriente que cambie de tipo (normal/trifásica) por parámetro, en lugar de manejar familias distintas.',
      'Revisar las distancias normativas de separación entre tomas antes de insertarlas masivamente en el modelo.',
      'Coordinar con arquitectura el mobiliario fijo antes de circuitar las tomas de forma definitiva.',
      'Mantener el conteo de salidas trazable en una tabla de planificación para compararlo contra el cuadro de cargas.',
    ],
    ejemploAplicado:
      'Esta lección sigue el flujo real de dos tareas del catálogo: primero PB-02-03 "Proponer la ubicación de las salidas de tomacorriente y fuerza en la planta arquitectónica" (predimensionamiento, pasos 1-2), y después PB-02-12 "Crear las tomas normales y trifásicas en la planta arquitectónica del proyecto" (modelado definitivo, pasos 3-8).',
    tareasRelacionadas: ['PB-02-03', 'PB-02-12'],
  },
  {
    id: 'M5.6',
    titulo: 'Puesta a tierra, apantallamiento y sistemas especiales',
    minutos: 25,
    queEs:
      'La puesta a tierra es el sistema (malla de conductor desnudo, varillas tipo copperweld, cajas de inspección) que conduce las corrientes de falla al suelo para proteger personas y equipos; el apantallamiento o sistema de pararrayos protege la edificación contra descargas atmosféricas, y su cobertura se calcula con el método electrogeométrico exigido por el RETIE.',
    paraQueSirve:
      'La puesta a tierra evita que una falla eléctrica se convierta en un riesgo para las personas o dañe equipos, mientras que el apantallamiento define, mediante el radio de protección de cada punta captadora, qué zonas de la cubierta quedan efectivamente protegidas ante una descarga atmosférica.',
    cuandoUsarlo:
      'Se modela en la fase de modelado definitivo: la malla de tierra y las cajas de inspección se resuelven junto con la subestación y los armarios de medidores, mientras que el apantallamiento se calcula y documenta cuando ya se conoce la geometría final de cubierta del edificio.',
    procedimiento: [
      'Modelar la malla de puesta a tierra de la subestación (conductor desnudo, varillas copperweld) según el diseño de resistencia de puesta a tierra calculado en la memoria eléctrica.',
      'Insertar las cajas de inspección de puesta a tierra en los puntos definidos: subestación, armarios de medidores y tableros principales.',
      'Conectar el sistema de puesta a tierra a la estructura metálica del edificio y a los tableros, respetando el esquema de conexión definido en el diseño.',
      'Aplicar el método electrogeométrico: definir la altura de las puntas captadoras y verificar que la esfera rodante cubra toda la edificación sin dejar zonas desprotegidas.',
      'Modelar el sistema de apantallamiento (puntas tipo Franklin, bajantes, conductores de bajada) conectado a la malla de tierra, independiente o común según el diseño.',
      'Verificar la continuidad eléctrica del recorrido completo, desde la punta captadora hasta el electrodo de puesta a tierra, sin tramos flotantes.',
      'Documentar el plano de puesta a tierra (planta, cortes e isométrico) y el plano del método electrogeométrico para el entregable.',
      'Incluir en la memoria RETIE el valor objetivo de resistencia de puesta a tierra (típicamente ≤10 ohm) y el criterio de diseño aplicado.',
    ],
    erroresFrecuentes: [
      'Modelar el apantallamiento sin aplicar realmente el método electrogeométrico, dejando zonas del edificio fuera del radio de protección.',
      'No verificar la continuidad eléctrica del bajante hasta el electrodo, dejando tramos "flotantes" en el modelo que no se detectan a simple vista.',
      'Mezclar la tierra de la subestación con la tierra de sistemas especiales (datos) sin verificar si el diseño exige separación.',
      'Omitir cajas de inspección accesibles, necesarias para la medición periódica de resistencia de puesta a tierra.',
      'Reutilizar alturas de puntas captadoras de otro proyecto sin recalcular el radio de protección real del edificio actual.',
    ],
    buenasPracticas: [
      'Verificar el nivel ceráunico de la zona del proyecto para definir el nivel de protección exigido por RETIE antes de dimensionar el apantallamiento.',
      'Modelar la malla de tierra como sistema independiente para poder auditar su continuidad con las herramientas de revisión del modelo.',
      'Coordinar con estructura los puntos de anclaje de bajantes y puntas captadoras sobre cubierta.',
      'Dejar registro isométrico de las cajas de inspección de puesta a tierra para el entregable al operador de red.',
    ],
    ejemploAplicado:
      'Esta lección integra tres tareas del catálogo que suelen resolverse juntas: PB-02-08 "Modelar la malla de puesta a tierra de la subestación" y PB-02-07 "Modelar la caja de puesta a tierra en los armarios de medidores" cubren la parte de puesta a tierra (pasos 1-3), mientras que PB-02-11 "Modelar el sistema de apantallamiento (pararrayos) de la edificación" es el ejercicio completo del método electrogeométrico descrito en los pasos 4-6.',
    tareasRelacionadas: ['PB-02-08', 'PB-02-07', 'PB-02-11'],
  },
];

export const M5 = {
  id: 'M5',
  nombre: 'Instalaciones',
  icon: 'ti-bolt',
  nivel: 'Avanzado',
  descripcion:
    'El módulo central de ingeniería eléctrica de la guía: acometida y subestación en media tensión, distribución en baja tensión y tableros, circuitos con panel schedules y balanceo de fases, iluminación y control, tomacorrientes y fuerza, y puesta a tierra con apantallamiento. Cada lección está anclada a tareas reales del catálogo de la plataforma para que el aprendizaje se aplique directamente sobre proyectos MEP eléctricos con criterios técnicos vigentes en Colombia (RETIE, requisitos del Operador de Red).',
  lecciones: M5_LECCIONES,
};
