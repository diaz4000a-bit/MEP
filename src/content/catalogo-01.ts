import { REF, notaCriterio, notaNorma, notaNormaVerificar } from './normas';
import type { TareaCatalogo } from '../types';

export const CATALOGO_01: TareaCatalogo[] = [
  {
    plantillaId: 'PB-01-01',
    nombreOriginal: 'Definición de subestación',
    nombre: 'Definir la ubicación y el tipo de la subestación eléctrica del proyecto',
    grupo: '01-gestion',
    subgrupo: 'Predimensionamiento',
    categoria: 'Acometidas',
    disciplina: 'Eléctrica',
    dificultad: 3,
    horasEstimadas: 6,
    prioridad: 'Alta',
    dependeDe: ['PB-01-10'],
    guiaIds: ['M5.1'],
    descripcion:
      'Tarea de predimensionamiento que establece los parámetros base de la subestación eléctrica (tipo, ubicación general en el predio y modalidad de conexión) a partir de la carga estimada del proyecto y las restricciones arquitectónicas y urbanísticas. El tipo elegido determina qué artículo del RETIE gobierna el resto del diseño: interior, poste, pedestal o prefabricada son requisitos distintos.',
    objetivo:
      'Fijar la ubicación y el tipo de subestación antes de iniciar el modelado detallado, para que el resto de las tareas de predimensionamiento (transformador, cárcamos, ductos) partan de una base común y para que el área reservada ya contemple las distancias de seguridad exigidas.',
    requisitos: [
      'Carga estimada preliminar del proyecto (área construida, uso y densidad de carga por m²)',
      'Planta arquitectónica de implantación con las restricciones de predio disponibles',
      'Normas del operador de red aplicables a la zona del proyecto',
      'Nivel de tensión de conexión acordado con el operador de red',
    ],
    procedimiento: [
      'Revisar la carga estimada preliminar del proyecto y el área construida por uso para dimensionar la demanda aproximada.',
      'Confirmar con el operador de red el nivel de tensión de conexión, porque de él dependen las distancias de seguridad y el tipo de celda aplicables.',
      'Definir si la subestación será tipo interior, exterior, compacta, pedestal o de poste según la carga estimada y el predio disponible.',
      'Identificar el artículo del RETIE que gobierna el tipo elegido (3.23.2 interior, 3.23.3 poste, 3.23.4 pedestal, 3.23.5 prefabricada) y leer sus requisitos de área antes de dibujar nada.',
      'Ubicar en la planta arquitectónica vinculada un área candidata con acceso vehicular para maniobra de equipos, ventilación y ruta de evacuación.',
      'Descontar del área candidata las distancias de seguridad y los pasillos de operación y mantenimiento; el área útil restante es la que debe alojar los equipos.',
      'Registrar la decisión de tipo, nivel de tensión y ubicación como parámetro compartido de proyecto, no como texto suelto en una vista.',
      'Coordinar la ubicación propuesta con arquitectura y estructura antes de continuar con el resto de tareas de predimensionamiento.',
    ],
    resultadoEsperado:
      'La subestación tiene definidos su tipo, su nivel de tensión, su ubicación general en el predio y las distancias de seguridad que condicionan el área, quedando disponible como referencia para el cálculo del transformador, los cárcamos y los ductos.',
    criteriosVerificacion: [
      'El tipo de subestación (interior, exterior, compacta, pedestal o de poste) está definido y documentado.',
      'El nivel de tensión de conexión está confirmado con el operador de red.',
      'El área reservada descuenta los pasillos de operación y las distancias de seguridad, no solo la huella de los equipos.',
      'La ubicación propuesta cuenta con acceso vehicular para maniobra de equipos.',
      'La ubicación propuesta fue validada con el equipo de arquitectura.',
    ],
    notasIngenieria: [
      notaNorma(
        'Las subestaciones son instalaciones objeto del RETIE y su diseño se rige por los requisitos generales del Título 22 más el artículo específico del tipo elegido en el Título 23.',
        REF.SUBESTACIONES_GENERAL,
      ),
      notaNormaVerificar(
        'El área libre alrededor de los equipos no es una holgura de dibujo: son las distancias mínimas de seguridad para operación y mantenimiento, y dependen del nivel de tensión y de si la subestación es interior o exterior. Confirmar el valor aplicable antes de cerrar el área con arquitectura.',
        REF.SUBESTACIONES_INTERIORES,
      ),
      notaNorma(
        'Las instalaciones de transformación requieren diseño formal con memorias y planos firmados por profesional competente; el modelo BIM es el soporte de ese diseño, no lo sustituye.',
        REF.REQUIEREN_DISENO,
      ),
      notaNorma(
        'La bóveda o el cuarto del transformador, su ventilación y las distancias a materiales combustibles tienen artículo propio en la NTC 2050: el RETIE fija el requisito de seguridad y la NTC el detalle constructivo.',
        REF.NTC_TRANSFORMADORES,
      ),
      notaNormaVerificar(
        'En territorio de Enel Colombia la celda de medida en media tensión es la del operador de red, con dimensiones y esquema fijados por norma: reservar el espacio con esa ficha, no con la geometría del equipo del fabricante. En otra región aplica la norma del operador que atienda el proyecto.',
        REF.LK_CELDA_MEDIDA_MT,
      ),
    ],
    tipsRevit: [
      "Usa un parámetro de proyecto compartido (por ejemplo 'Tipo de subestación' y 'Nivel de tensión') para registrar la decisión y que quede visible en las vistas del equipo.",
      "Crea una vista de planta específica de 'Predimensionamiento MEP' para ubicar las áreas candidatas sin afectar las vistas de documentación final.",
      'Modela las distancias de seguridad como un sólido genérico semitransparente alrededor de cada equipo: así el pasillo de operación choca visiblemente contra un muro en la vista 3D en vez de descubrirse en obra.',
      "Usa la herramienta 'Zona' o un 'Área de Filtro' con relleno de color para delimitar la zona candidata de la subestación en la planta.",
    ],
  },
  {
    plantillaId: 'PB-01-02',
    nombreOriginal: 'Ubicación de espacios técnicos',
    nombre: 'Ubicar los espacios técnicos eléctricos (tableros, medidores, closets) en la planta',
    grupo: '01-gestion',
    subgrupo: 'Predimensionamiento',
    categoria: 'Modelado',
    disciplina: 'Eléctrica',
    dificultad: 2,
    horasEstimadas: 5,
    prioridad: 'Alta',
    dependeDe: ['PB-01-01'],
    guiaIds: ['M2.5', 'M1.3'],
    descripcion:
      'Tarea de predimensionamiento que identifica y ubica en la planta arquitectónica los espacios técnicos eléctricos del proyecto (cuarto de tableros, cuarto de medidores, cuarto de transformador, closets eléctricos por piso) con base en la subestación ya definida y en el espacio de trabajo que el RETIE exige frente a cada tablero.',
    objetivo:
      'Reservar el área y la ubicación de cada espacio técnico eléctrico antes del modelado detallado, evitando reprocesos por falta de espacio de trabajo frente a los tableros o por mala ubicación respecto a las rutas de acometida.',
    requisitos: [
      'Definición del tipo y ubicación de la subestación (PB-01-01)',
      'Planta arquitectónica vinculada con los espacios candidatos disponibles',
      'Número de pisos y unidades del proyecto para estimar closets eléctricos por piso',
      'Dimensiones preliminares de los tableros previstos por espacio',
    ],
    procedimiento: [
      'Listar los espacios técnicos eléctricos requeridos según el tipo de proyecto (cuarto de tableros, cuarto de medidores, closets por piso).',
      'Revisar la planta arquitectónica vinculada y proponer una ubicación para cada espacio técnico cercana a las rutas de acometida verticales.',
      'Para cada espacio, sumar a la profundidad del tablero el espacio de trabajo libre exigido al frente, y la altura y anchura de trabajo mínimas: ese es el rectángulo a reservar, no la huella del tablero.',
      'Verificar que el espacio de trabajo quede libre de tuberías, ductos de HVAC y equipos de otras disciplinas, y que ninguna puerta abra invadiéndolo.',
      'Confirmar que el espacio técnico no se usa como paso de instalaciones ajenas a la eléctrica ni como depósito, condición que el RETIE no admite.',
      'Marcar los espacios técnicos con un área de filtro o una zona en el modelo para dejar constancia de la reserva.',
      'Coordinar con arquitectura la reserva de cada espacio antes de continuar con el modelado de ductos.',
      'Registrar la ubicación aprobada de cada espacio técnico en una tabla de planificación del proyecto.',
    ],
    resultadoEsperado:
      'Todos los espacios técnicos eléctricos requeridos por el proyecto están ubicados en la planta y reservados con arquitectura, con el espacio de trabajo frente a los tableros incluido en la reserva y libre de otras disciplinas.',
    criteriosVerificacion: [
      'Cada espacio técnico eléctrico requerido por el proyecto tiene una ubicación asignada en la planta.',
      'El área reservada incluye el espacio de trabajo libre al frente de cada tablero, no solo su huella.',
      'Ninguna puerta, tubería o ducto de otra disciplina invade el espacio de trabajo reservado.',
      'La reserva de espacios técnicos fue coordinada y aprobada por el equipo de arquitectura.',
      'Los espacios técnicos están ubicados en niveles y rejillas coincidentes con el modelo vinculado.',
    ],
    notasIngenieria: [
      notaNormaVerificar(
        'El área de un cuarto técnico no es la huella de los equipos: el RETIE exige un espacio de trabajo libre al frente de tableros y celdas, con anchura y altura mínimas, cuyo valor depende de la tensión y de si hay partes energizadas expuestas a lado y lado del pasillo. Confirmar la distancia aplicable a cada tablero del proyecto.',
        REF.ESPACIOS_MONTAJE,
      ),
      notaNormaVerificar(
        'El espacio libre de trabajo delante de un tablero —fondo, ancho y altura mínimos según la tensión y según lo que haya al frente— está tabulado en el Art. 110-16 de la NTC 2050. Esa es la medida que hay que exigirle al arquitecto y reservar en el modelo.',
        REF.NTC_ESPACIO_TRABAJO,
      ),
      notaNorma(
        'En obra residencial en territorio de Enel Colombia el armario de medidores va en el hall de acceso, con ubicación, dimensiones y accesibilidad fijadas por norma del operador de red. Es uno de los rechazos más frecuentes en revisión de proyecto.',
        REF.LK_ARMARIO_HALL,
      ),
      notaNormaVerificar(
        'Las dimensiones del armario dependen de cuántas unidades de vivienda alimente: escoger la ficha del armario antes de dibujar el nicho, no después.',
        REF.LK_ARMARIO_MEDIDORES,
      ),
      notaNorma(
        'Los requisitos de instalación de celdas y tableros —accesibilidad, señalización, grado de protección y espacio de operación— están en el artículo de celdas y tableros del RETIE.',
        REF.CELDAS_TABLEROS,
      ),
    ],
    tipsRevit: [
      "Usa la herramienta 'Zona' (Área) en el navegador de proyecto para delimitar cada espacio técnico con un color distintivo por tipo.",
      "Modela el espacio de trabajo frente a cada tablero como un sólido genérico dedicado (por ejemplo 'Espacio de trabajo RETIE') e inclúyelo en la comprobación de interferencias: así una tubería que lo invada aparece como conflicto real, no como un descuido de revisión visual.",
      "Crea un parámetro de ejemplar 'Uso del espacio' para filtrar rápidamente los espacios técnicos eléctricos en las vistas de coordinación.",
      "Usa 'Copiar/Monitorear' para heredar los muros del cuarto técnico definidos en el modelo arquitectónico vinculado y evitar duplicar geometría.",
    ],
  },
  {
    plantillaId: 'PB-01-03',
    nombreOriginal: 'Ubicación de ductos',
    nombre: 'Ubicar los ductos verticales y horizontales de la red eléctrica en la planta',
    grupo: '01-gestion',
    subgrupo: 'Predimensionamiento',
    categoria: 'Ductos y Bandejas',
    disciplina: 'Eléctrica',
    dificultad: 2,
    horasEstimadas: 6,
    prioridad: 'Alta',
    dependeDe: ['PB-01-02'],
    guiaIds: ['M2.5', 'M2.2'],
    descripcion:
      'Tarea de predimensionamiento que define el trazado general y la ubicación de los ductos eléctricos verticales (shafts) y horizontales que conectarán la subestación con los espacios técnicos y los tableros de cada piso.',
    objetivo:
      'Reservar las rutas y las secciones de ducto necesarias antes del modelado detallado de bandejas y tuberías, evitando interferencias con otras disciplinas y dejando margen para el porcentaje de ocupación admisible.',
    requisitos: [
      'Ubicación de la subestación y de los espacios técnicos (PB-01-01, PB-01-02)',
      'Planta arquitectónica vinculada con los shafts o ductos disponibles',
      'Estimación preliminar de la cantidad de circuitos y calibres a distribuir',
      'Criterio de separación entre circuitos de media y baja tensión y de corrientes débiles',
    ],
    procedimiento: [
      'Identificar en la planta arquitectónica los shafts o ductos verticales disponibles cercanos a los espacios técnicos eléctricos.',
      'Trazar la ruta horizontal preliminar entre la subestación y el ducto vertical más cercano.',
      'Estimar la sección requerida del ducto según la cantidad y el calibre de circuitos previstos, respetando el porcentaje máximo de ocupación de la canalización y no su llenado geométrico.',
      'Separar en rutas o compartimentos distintos los circuitos de media tensión, los de baja tensión y los de corrientes débiles, en lugar de compartir un solo ducto.',
      'Verificar que la sección estimada quepa en el shaft disponible dejando espacio para el radio de curvatura de los conductores en los cambios de dirección.',
      'Identificar los puntos donde la canalización atraviesa muros o losas cortafuego y dejarlos marcados: cada paso exigirá un sello cortafuego en el modelado detallado.',
      'Marcar la ruta y la sección del ducto en el modelo con una línea de referencia o un elemento genérico de reserva.',
      'Coordinar la reserva de ductos con las demás disciplinas (hidráulico, HVAC) para evitar interferencias tempranas.',
    ],
    resultadoEsperado:
      'Las rutas y secciones preliminares de los ductos eléctricos quedan reservadas y coordinadas con las demás disciplinas, con la separación entre sistemas resuelta y los pasos cortafuego identificados, listas para el modelado detallado de bandejas y tuberías.',
    criteriosVerificacion: [
      'Cada tramo de ducto identificado tiene una ruta y una sección preliminar asignada.',
      'La sección estimada respeta el porcentaje máximo de ocupación y deja espacio para el radio de curvatura.',
      'Los circuitos de media tensión, baja tensión y corrientes débiles están separados en rutas o compartimentos distintos.',
      'Los cruces de la canalización con muros y losas cortafuego están identificados en el modelo.',
      'La reserva de ductos fue coordinada con al menos las disciplinas hidráulica y de HVAC.',
      'Las rutas de ducto conectan la subestación con los espacios técnicos definidos en PB-01-02.',
    ],
    notasIngenieria: [
      notaNormaVerificar(
        'La sección del ducto la fija el porcentaje máximo de ocupación de la canalización y el radio de curvatura del conductor, no cuántos cables caben geométricamente. El porcentaje aplicable depende del tipo de canalización y del número de conductores; confirmarlo contra el código eléctrico antes de fijar la sección.',
        REF.CANALIZACIONES,
      ),
      notaNorma(
        'Todo paso de canalización a través de un muro o losa con resistencia al fuego debe restituirse con un sello cortafuego; conviene ubicar esos cruces desde el predimensionamiento, cuando todavía se pueden mover.',
        REF.SELLOS_CORTAFUEGO,
      ),
      notaNormaVerificar(
        'El porcentaje máximo de ocupación de la canalización lo fija el Cuadro 1 del Capítulo 9 de la NTC 2050, y el número máximo de conductores por diámetro comercial, los cuadros del Anexo C. El RETIE remite a esos cuadros y no los reproduce: buscarlos ahí, no en el reglamento.',
        REF.NTC_OCUPACION_TUBERIA,
      ),
      notaNormaVerificar(
        'El calibre no se decide por el ducto sino por la capacidad de corriente del conductor, con los factores de corrección por temperatura ambiente y por agrupamiento de más de tres conductores en la misma canalización.',
        REF.NTC_AMPACIDAD,
      ),
      notaNorma(
        'Los ductos y cajas de la acometida en baja tensión los fija la norma del operador de red —diámetro, profundidad de zanja y cajas de inspección—, no el criterio del proyectista.',
        REF.LK_DUCTOS_ACOMETIDA,
      ),
    ],
    tipsRevit: [
      "Usa líneas de modelo o un elemento genérico 'Placeholder de ducto' para reservar la ruta sin comprometerte todavía con una familia de bandeja definitiva.",
      "Activa las categorías 'Bandejas de cable' y 'Conducto' en el navegador de visibilidad para revisar interferencias tempranas con otras disciplinas.",
      'Crea subtipos de bandeja distintos por sistema (MT, BT, corrientes débiles) desde el predimensionamiento: el filtro de vista por tipo hará evidente cualquier circuito que después se cuele en la bandeja equivocada.',
      "Usa el comando 'Recorrido de cable' en modo automático para validar que la ruta preliminar sea físicamente posible antes de fijarla.",
    ],
  },
  {
    plantillaId: 'PB-01-04',
    nombreOriginal: 'Cálculo de transformador',
    nombre: 'Estimar la capacidad preliminar del transformador para dimensionar la subestación',
    grupo: '01-gestion',
    subgrupo: 'Predimensionamiento',
    categoria: 'Acometidas',
    disciplina: 'Eléctrica',
    dificultad: 3,
    horasEstimadas: 5,
    prioridad: 'Alta',
    dependeDe: ['PB-01-01'],
    guiaIds: ['M5.1'],
    descripcion:
      'Cálculo preliminar de la capacidad del transformador a partir de la carga estimada del proyecto, usado únicamente para dimensionar el área y el tipo de subestación en esta etapa temprana. Este valor se recalculará más adelante con las cargas definitivas del proyecto arquitectónico (ver PB-02-16).',
    objetivo:
      'Obtener un valor preliminar de capacidad del transformador en kVA que permita dimensionar el área física de la subestación, dejando explícito que es una estimación y no la memoria de cálculo del diseño.',
    requisitos: [
      'Definición del tipo y ubicación de la subestación (PB-01-01)',
      'Área construida y uso del proyecto por piso',
      'Densidad de carga estimada por tipo de uso (residencial, comercial, etc.)',
      'Criterio de factores de demanda y diversidad acordado con el ingeniero de diseño',
    ],
    procedimiento: [
      'Recopilar el área construida por uso (residencial, comercial, parqueaderos, zonas comunes) del proyecto.',
      'Aplicar la densidad de carga estimada por tipo de uso para obtener la demanda preliminar en kVA.',
      'Sumar la demanda de todos los usos y aplicar los factores de demanda y diversidad que fije el ingeniero de diseño, dejando registrado el criterio de origen de cada factor y no solo su valor.',
      'Añadir las cargas que no escalan con el área y suelen olvidarse en el predimensionamiento: ascensores, bombas, equipos de presión y sistemas contra incendio.',
      'Seleccionar la capacidad comercial de transformador inmediatamente superior al valor calculado.',
      'Verificar que la capacidad seleccionada sea compatible con el tipo y el área de subestación definidos en PB-01-01, incluida la ventilación que exigirá esa potencia.',
      'Registrar el cálculo preliminar y sus supuestos en la memoria de predimensionamiento del proyecto, marcado explícitamente como preliminar.',
    ],
    resultadoEsperado:
      'Existe un valor preliminar de capacidad de transformador en kVA, con sus supuestos y factores documentados, suficiente para confirmar que el área de subestación definida es adecuada, y marcado como no apto para trámite ante el operador de red.',
    criteriosVerificacion: [
      'El cálculo preliminar reporta un valor de capacidad de transformador en kVA con sus supuestos documentados.',
      'Cada factor de demanda y diversidad tiene registrado su criterio de origen, no solo su valor numérico.',
      'Las cargas de ascensores, bombas y sistemas contra incendio están incluidas en la estimación.',
      'La capacidad seleccionada corresponde a un valor comercial estándar de transformador.',
      'La capacidad seleccionada es compatible con el área de subestación definida en PB-01-01.',
      'El cálculo indica explícitamente que es preliminar y que será recalculado con las cargas definitivas.',
    ],
    notasIngenieria: [
      notaNormaVerificar(
        'Los factores de demanda y diversidad no son valores universales: dependen del tipo de proyecto y del criterio del diseñador, y deben quedar justificados en la memoria. Este cálculo es preliminar y debe recalcularse con las cargas reales (ver PB-02-16) antes de emitir cualquier documento para el operador de red.',
        REF.CRITERIOS_DISENO,
      ),
      notaNormaVerificar(
        'Para vivienda multifamiliar la NTC 2050 da dos caminos: el método general (alumbrado general por metro cuadrado con los factores de demanda del Art. 220-11, más los circuitos de pequeños electrodomésticos, estufa y secadora) y el método opcional del Art. 220-32. No se mezclan: elegir uno y dejarlo escrito en la memoria.',
        REF.NTC_OPCIONAL_MULTIFAMILIAR,
      ),
      notaNormaVerificar(
        'La carga de cada unidad de vivienda arranca de los VA por metro cuadrado de alumbrado general; los factores de demanda aplicables están tabulados por rango de carga y por tipo de ocupación.',
        REF.NTC_ALUMBRADO_GENERAL,
      ),
      notaNormaVerificar(
        'La carga total contratada decide la forma de medida —directa o semidirecta— que exige el operador de red, y con ella el tamaño del armario y de la acometida. Confirmarla antes de cerrar la potencia del transformador.',
        REF.LK_FORMA_MEDIDA,
      ),
      notaNorma(
        'Los requisitos de instalación del transformador de potencia y distribución —incluidas las condiciones del sitio de montaje— están en el artículo de transformadores del RETIE.',
        REF.TRANSFORMADORES,
      ),
      notaNorma(
        'La memoria de cálculo definitiva es responsabilidad del diseñador, que debe ser profesional competente y responder por el diseño mediante declaración de cumplimiento; el predimensionamiento hecho por el modelador no lo releva.',
        REF.RESPONSABILIDAD_DISENADOR,
      ),
    ],
    tipsRevit: [
      "Registra el cálculo preliminar y sus supuestos en un parámetro de proyecto compartido 'Capacidad preliminar transformador (kVA)' para que quede trazable en el modelo.",
      'No modeles todavía el equipo físico del transformador en esta tarea: es un cálculo de predimensionamiento, el modelado detallado corresponde a tareas posteriores.',
      'Si el proyecto ya tiene espacios modelados, una tabla de planificación de Espacios con área por uso te da el insumo del cálculo sin exportar a Excel, y se actualiza sola cuando arquitectura cambie el área.',
      "Usa una tabla de planificación de 'Notas clave' o un anejo de proyecto para dejar la memoria de cálculo preliminar junto al modelo.",
    ],
  },
  {
    plantillaId: 'PB-01-05',
    nombreOriginal: 'Cárcamos',
    nombre: 'Definir la ubicación y las dimensiones preliminares de los cárcamos de la subestación',
    grupo: '01-gestion',
    subgrupo: 'Predimensionamiento',
    categoria: 'Modelado',
    disciplina: 'Eléctrica',
    dificultad: 2,
    horasEstimadas: 4,
    prioridad: 'Media',
    dependeDe: ['PB-01-01', 'PB-01-03'],
    guiaIds: ['M2.5', 'M5.1'],
    descripcion:
      'Tarea de predimensionamiento que ubica y dimensiona preliminarmente los cárcamos (canales enterrados) que alojarán los cables de media y baja tensión entre la subestación, el transformador y los tableros generales.',
    objetivo:
      'Reservar la ubicación y las dimensiones preliminares de los cárcamos antes del modelado detallado, garantizando que las rutas de cable queden resueltas bajo piso con la separación entre sistemas y el radio de curvatura respetados.',
    requisitos: [
      'Ubicación de la subestación (PB-01-01) y de las rutas de ductos (PB-01-03)',
      'Cantidad y calibre preliminar de los cables de media y baja tensión a canalizar',
      'Nivel de piso terminado de la subestación y de los espacios técnicos conectados',
      'Radio mínimo de curvatura de los cables de media tensión previstos',
    ],
    procedimiento: [
      'Identificar los tramos entre la subestación, el transformador y los tableros generales que requieren cárcamo.',
      'Estimar el ancho y la profundidad preliminar del cárcamo según la cantidad y el calibre de cables previstos en cada tramo.',
      'Verificar que el ancho permita el radio mínimo de curvatura del cable de media tensión en cada cambio de dirección: es el criterio que suele gobernar la dimensión, más que la sección de los cables.',
      'Separar los cables de media tensión de los de baja tensión mediante compartimentos o distancia, en lugar de tenderlos juntos en el mismo canal.',
      'Trazar la ruta preliminar del cárcamo en la planta, evitando cruces con cimentación o ductos de otras disciplinas.',
      'Verificar la profundidad disponible respecto al nivel de piso terminado y a la cimentación existente.',
      'Prever el drenaje del cárcamo y las tapas registrables: un cárcamo inundado o sellado deja de ser mantenible.',
      'Marcar el cárcamo en el modelo con un elemento genérico de reserva o una línea de referencia con sus dimensiones.',
      'Coordinar la ruta y la profundidad del cárcamo con estructura antes de continuar con el modelado detallado.',
    ],
    resultadoEsperado:
      'Los cárcamos requeridos entre la subestación, el transformador y los tableros generales tienen una ruta y unas dimensiones preliminares definidas, con separación entre sistemas, radio de curvatura y drenaje resueltos, y coordinadas con estructura.',
    criteriosVerificacion: [
      'Cada tramo que requiere cárcamo tiene una ruta preliminar trazada en la planta.',
      'Las dimensiones preliminares (ancho y profundidad) de cada cárcamo están documentadas.',
      'El ancho en los cambios de dirección permite el radio mínimo de curvatura del cable de media tensión.',
      'Los cables de media y baja tensión quedan separados por compartimento o distancia.',
      'El cárcamo tiene drenaje previsto y tapas registrables para mantenimiento.',
      'La ruta del cárcamo no interfiere con la cimentación conocida a esta etapa del proyecto.',
      'La ruta y profundidad del cárcamo fueron coordinadas con el equipo de estructura.',
    ],
    notasIngenieria: [
      notaNormaVerificar(
        'Las dimensiones del cárcamo dependen de la cantidad, el calibre y el radio de curvatura de los cables, y de la separación exigida entre circuitos de media y baja tensión. El radio mínimo de curvatura lo fija el fabricante del cable y suele gobernar el ancho del canal; verificarlo contra la ficha técnica del cable del proyecto.',
        REF.CANALIZACIONES,
      ),
      notaNorma(
        'Los requisitos de las instalaciones subterráneas —profundidad de enterramiento, protección mecánica y separación respecto de otros servicios— están en el Art. 300-5 de la NTC 2050.',
        REF.NTC_SUBTERRANEAS,
      ),
      notaNormaVerificar(
        'El radio mínimo de curvatura dentro del cárcamo no es libre: depende del calibre y del tipo de cable, y forzarlo daña el aislamiento aunque el tendido entre geométricamente.',
        REF.NTC_CURVATURA_CONDUCTORES,
      ),
      notaNorma(
        'Los cárcamos y demás canalizaciones deben permitir la operación y el mantenimiento de la instalación durante toda su vida útil, lo que implica tapas registrables y evacuación de agua.',
        REF.OPERACION_MANTENIMIENTO,
      ),
    ],
    tipsRevit: [
      "Modela el cárcamo como un elemento de 'Piso' o un componente genérico de reserva con parámetros de ancho y profundidad, en lugar de geometría definitiva, en esta etapa preliminar.",
      'Usa una vista de sección rápida en la zona del cárcamo para verificar visualmente que la profundidad propuesta no choca con elementos estructurales vinculados.',
      'Dibuja el radio de curvatura como un arco de línea de modelo en la esquina del cárcamo antes de fijar el ancho: es más rápido que descubrir en obra que el cable no gira.',
      "Activa la disciplina 'Coordinación' en la vista para superponer el modelo estructural vinculado sobre la ruta del cárcamo.",
    ],
  },
  {
    plantillaId: 'PB-01-06',
    nombreOriginal: 'Modelar desfogue de la planta',
    nombre: 'Modelar el sistema de desfogue (ventilación de escape) de la subestación en la planta',
    grupo: '01-gestion',
    subgrupo: 'Predimensionamiento',
    categoria: 'Modelado',
    disciplina: 'Eléctrica',
    dificultad: 2,
    horasEstimadas: 4,
    prioridad: 'Media',
    dependeDe: ['PB-01-01'],
    guiaIds: ['M5.1', 'M2.2'],
    descripcion:
      'Tarea de predimensionamiento que ubica y modela preliminarmente el sistema de desfogue de la subestación (rejillas o ductos de ventilación de escape para disipar el calor del transformador) hacia el exterior de la edificación.',
    objetivo:
      'Garantizar que la subestación cuente con una ruta de ventilación de escape definida desde esta etapa temprana, evitando reprocesos por falta de espacio hacia fachada y asegurando que la ventilación sea cruzada y no un solo punto.',
    requisitos: [
      'Ubicación y tipo de subestación definidos (PB-01-01)',
      'Capacidad preliminar del transformador (PB-01-04) para estimar el caudal de ventilación requerido',
      'Planta arquitectónica vinculada con la fachada o el ducto de ventilación disponible',
      'Pérdidas térmicas del transformador según ficha técnica o valor típico de la capacidad prevista',
    ],
    procedimiento: [
      'Estimar el caudal de aire de desfogue requerido a partir de las pérdidas térmicas del transformador, no de su potencia nominal.',
      'Definir la pareja de aberturas: entrada de aire baja y salida alta, de modo que la ventilación sea cruzada; una sola rejilla no disipa el calor del cuarto.',
      'Identificar en la planta arquitectónica la ruta más corta hacia fachada o hacia un ducto de ventilación vertical.',
      'Ubicar la posición preliminar de cada rejilla o ducto de desfogue en el modelo.',
      'Verificar que las aberturas conserven el grado de protección del cuarto contra ingreso de agua, animales y objetos, y que no comprometan la resistencia al fuego de la envolvente.',
      'Verificar que la ruta propuesta no interfiera con otros elementos arquitectónicos o estructurales conocidos a esta etapa.',
      'Marcar el elemento de desfogue en el modelo con un componente genérico de reserva.',
      'Coordinar la ubicación de la rejilla de desfogue con arquitectura, especialmente si sale a fachada.',
    ],
    resultadoEsperado:
      'El sistema de desfogue de la subestación tiene una ruta y unas aberturas de entrada y salida definidas preliminarmente, coordinadas con arquitectura y compatibles con las pérdidas térmicas del transformador.',
    criteriosVerificacion: [
      'Existe una ruta preliminar trazada entre la subestación y el punto de salida del desfogue.',
      'Hay abertura de entrada baja y de salida alta, no un único punto de ventilación.',
      'La posición de cada rejilla o ducto de desfogue está marcada en el modelo.',
      'Las aberturas conservan el grado de protección y la resistencia al fuego exigidos al cuarto.',
      'La ubicación del desfogue fue coordinada con arquitectura cuando la salida es a fachada.',
      'El caudal estimado de desfogue está documentado y asociado a la capacidad preliminar del transformador.',
    ],
    notasIngenieria: [
      notaNormaVerificar(
        'El caudal de ventilación depende de las pérdidas térmicas del transformador seleccionado, no de su potencia nominal, y debe verificarse con la ficha técnica del fabricante una vez definida la capacidad final.',
        REF.COMPUERTAS_VENTILACION,
      ),
      notaNorma(
        'La ventilación del recinto del transformador tiene artículo propio en la NTC 2050: debe evacuar el calor de las pérdidas sin depender de medios forzados cuando la norma no los exige.',
        REF.NTC_TRANSFORMADOR_VENTILACION,
      ),
      notaNorma(
        'Si el transformador es tipo seco instalado en interior —lo habitual en la subestación de un edificio residencial— aplican además las distancias a materiales combustibles y los requisitos de encerramiento del Art. 450-21.',
        REF.NTC_TRANSFORMADOR_SECO,
      ),
      notaNorma(
        'Las subestaciones de media tensión tipo interior o en edificaciones tienen requisitos propios de ventilación, acceso y resistencia al fuego de la envolvente en el artículo específico del RETIE.',
        REF.SUBESTACION_MT_INTERIOR,
      ),
    ],
    tipsRevit: [
      "Modela la rejilla de desfogue como un componente genérico de reserva de tipo 'Difusor' o 'Rejilla' en esta etapa, sin comprometerte con la familia definitiva de fabricante.",
      'Usa una etiqueta de texto o un parámetro de ejemplar para dejar registrado el caudal estimado junto al elemento de desfogue en el modelo.',
      'Revisa la vista de alzado de la fachada donde sale el desfogue para confirmar que no interfiere con ventanas u otros elementos arquitectónicos.',
      'Coloca las dos aberturas en una misma sección vertical del cuarto para comprobar de un vistazo que hay diferencia de altura suficiente entre entrada y salida.',
    ],
  },
  {
    plantillaId: 'PB-01-07',
    nombreOriginal: '',
    nombre: 'Configurar la plantilla de proyecto MEP y cargar los parámetros compartidos eléctricos',
    grupo: '01-gestion',
    subgrupo: 'Configuración del proyecto',
    categoria: 'Configuración BIM',
    disciplina: 'Eléctrica',
    dificultad: 1,
    horasEstimadas: 3,
    prioridad: 'Alta',
    dependeDe: [],
    guiaIds: ['M1.2', 'M4.2'],
    descripcion:
      'Tarea inicial de configuración BIM que establece la plantilla de proyecto MEP del estudio como punto de partida, carga el archivo de parámetros compartidos eléctricos que usarán todas las familias y anotaciones, y deja preconfigurado el código de colores de conductores que exige el RETIE.',
    objetivo:
      'Dejar el archivo de proyecto listo, con la plantilla, los parámetros compartidos y el código de colores correctos, antes de vincular modelos o empezar a modelar.',
    requisitos: [
      'Plantilla de proyecto MEP del estudio (.rte) actualizada',
      'Archivo de parámetros compartidos (.txt) del estudio con los parámetros eléctricos definidos',
      'Nombre y código del proyecto asignados',
      'Código de colores para conductores según el RETIE vigente',
    ],
    procedimiento: [
      'Crear un proyecto nuevo en Revit a partir de la plantilla de proyecto MEP del estudio.',
      'Guardar el archivo de proyecto con el nombre y la ubicación definidos por la convención de nomenclatura del estudio.',
      'Ir a Gestionar > Parámetros compartidos y cargar el archivo de parámetros compartidos eléctricos del estudio.',
      'Verificar en Gestionar > Parámetros de proyecto que los parámetros eléctricos requeridos estén asociados a las categorías correctas.',
      'Configurar las unidades de proyecto (Gestionar > Unidades de proyecto) según el estándar eléctrico del estudio.',
      'Configurar en los ajustes eléctricos los tipos de conductor, las tensiones y los sistemas de distribución del proyecto, de modo que coincidan con los niveles de tensión normalizados y no con los valores de fábrica de la plantilla.',
      'Definir los estilos de línea o los filtros de vista que materializan el código de colores de conductores, para que la convención normativa quede en la plantilla y no dependa de la memoria de cada modelador.',
      'Guardar el archivo y registrarlo en la ubicación central del proyecto en el servidor o en BIM 360/ACC.',
    ],
    resultadoEsperado:
      'El archivo de proyecto está creado a partir de la plantilla MEP del estudio, con los parámetros compartidos eléctricos cargados, las unidades y tensiones configuradas y el código de colores normativo preconfigurado, listo para vincular modelos y empezar el modelado.',
    criteriosVerificacion: [
      'El proyecto fue creado a partir de la plantilla de proyecto MEP del estudio.',
      'El archivo de parámetros compartidos eléctricos está cargado en el proyecto.',
      'Los parámetros eléctricos requeridos aparecen asociados a las categorías correctas en Parámetros de proyecto.',
      'Las unidades de proyecto están configuradas según el estándar eléctrico del estudio.',
      'Las tensiones y sistemas de distribución configurados corresponden a los niveles normalizados aplicables al proyecto.',
      'El código de colores de conductores está reflejado en los estilos o filtros de la plantilla.',
    ],
    notasIngenieria: [
      notaNorma(
        'El código de colores para conductores de uso eléctrico es obligatorio y está normalizado en el RETIE; dejarlo preconfigurado en la plantilla evita que cada modelador lo interprete a su manera y que la corrección aparezca en la revisión de planos.',
        REF.CODIGO_COLORES,
      ),
      notaNorma(
        'La identificación de los conductores por color y por marcación también está reglada en la NTC 2050: el parámetro de color de la plantilla debe coincidir con lo que exigen las dos normas, no con la costumbre de la oficina.',
        REF.NTC_IDENT_CONDUCTORES,
      ),
      notaNorma(
        'Las tensiones nominales y su agrupación por niveles están clasificadas en el RETIE; los ajustes eléctricos del proyecto deben partir de esa clasificación y no de los valores por defecto de la plantilla de fábrica.',
        REF.NIVELES_TENSION,
      ),
      notaCriterio(
        'Mantener un único archivo de parámetros compartidos versionado por el estudio evita duplicados de GUID entre proyectos y problemas al intercambiar familias entre modelos.',
      ),
    ],
    tipsRevit: [
      'Usa Gestionar > Parámetros compartidos y revisa el archivo .txt en un editor de texto antes de cargarlo para confirmar que no tiene grupos o parámetros duplicados.',
      'Verifica la versión de la plantilla MEP contra el repositorio central del estudio antes de crear el proyecto, para no partir de una plantilla desactualizada.',
      'En Gestionar > Configuración MEP > Configuración eléctrica define los sistemas de distribución del proyecto: si esta tabla queda con los valores de fábrica, cada tablero que coloques heredará una tensión que no existe en el proyecto.',
      'Usa Transferir estándares de proyecto si necesitas traer estilos de objeto o familias de sistema desde otro proyecto ya configurado.',
    ],
    nuevo: true,
  },
  {
    plantillaId: 'PB-01-08',
    nombreOriginal: '',
    nombre: 'Vincular los modelos arquitectónico y estructural y establecer coordenadas compartidas',
    grupo: '01-gestion',
    subgrupo: 'Archivos y vínculos',
    categoria: 'Configuración BIM',
    disciplina: 'Eléctrica',
    dificultad: 2,
    horasEstimadas: 3,
    prioridad: 'Alta',
    dependeDe: ['PB-01-07'],
    guiaIds: ['M1.3', 'M2.4', 'M6.1'],
    descripcion:
      'Tarea de configuración BIM que vincula los modelos de arquitectura y estructura al proyecto eléctrico y establece un sistema de coordenadas compartidas único para que todas las disciplinas trabajen sobre la misma ubicación y orientación.',
    objetivo:
      'Garantizar que el modelo eléctrico esté correctamente posicionado respecto a arquitectura y estructura desde el inicio del proyecto, evitando desfases de coordenadas más adelante.',
    requisitos: [
      'Archivos centrales de arquitectura y estructura publicados y accesibles',
      'Plantilla de proyecto MEP configurada (PB-01-07)',
      'Acuerdo previo con el equipo de arquitectura sobre el punto base del proyecto',
    ],
    procedimiento: [
      "Insertar > Vincular Revit y cargar el modelo arquitectónico usando el posicionamiento 'Auto - Por coordenadas compartidas'.",
      'Repetir el proceso para vincular el modelo estructural con el mismo posicionamiento.',
      'Verificar que el punto base del proyecto y el norte del proyecto coincidan entre los tres modelos (eléctrico, arquitectónico, estructural).',
      'Si es la primera vez que se comparten coordenadas, publicar las coordenadas compartidas desde el modelo arquitectónico y adquirirlas en el modelo eléctrico.',
      'Verificar visualmente en una vista 3D que los tres modelos coinciden en planta sin desfases evidentes.',
      'Comprobar además la coincidencia en altura sobre una sección vertical: un desfase en Z no se ve en planta y desplaza todas las alturas de montaje del proyecto.',
      'Configurar la recarga automática o manual de los vínculos según el flujo de trabajo colaborativo del proyecto.',
    ],
    resultadoEsperado:
      'Los modelos de arquitectura y estructura están vinculados al proyecto eléctrico bajo un sistema de coordenadas compartidas único, con el punto base, el norte y las cotas de nivel coincidentes entre disciplinas.',
    criteriosVerificacion: [
      'El modelo arquitectónico y el modelo estructural están vinculados al proyecto eléctrico.',
      'Los tres modelos comparten el mismo sistema de coordenadas compartidas.',
      'El punto base y el norte de proyecto coinciden entre el modelo eléctrico y los vínculos.',
      'Una vista 3D de verificación muestra los tres modelos alineados sin desfases evidentes.',
      'Una sección vertical confirma que no hay desfase en altura entre el modelo eléctrico y los vínculos.',
    ],
    notasIngenieria: [
      notaNorma(
        'Las alturas de montaje y las distancias de seguridad se miden sobre la edificación real: un desfase de coordenadas entre el modelo eléctrico y el arquitectónico convierte en incorrecta cualquier verificación posterior de distancias hecha sobre el modelo.',
        REF.DISTANCIAS_CONSTRUCCIONES,
      ),
      notaCriterio(
        'Un error en la publicación o adquisición de coordenadas compartidas al inicio del proyecto se propaga a todas las disciplinas y suele ser costoso de corregir después de que el modelado ya avanzó.',
      ),
    ],
    tipsRevit: [
      "Usa el comando 'Copiar/Monitorear' en la pestaña Colaborar sobre el vínculo arquitectónico para heredar niveles y rejillas de forma controlada.",
      "Verifica el posicionamiento del vínculo en Propiedades > Posicionamiento: debe quedar en 'Por coordenadas compartidas', no en 'Origen a origen interno'.",
      'Usa Gestionar > Coordenadas > Publicar coordenadas solo desde el modelo que el equipo haya acordado como referencia, para no generar múltiples sistemas de coordenadas.',
    ],
    nuevo: true,
  },
  {
    plantillaId: 'PB-01-09',
    nombreOriginal: '',
    nombre: 'Configurar los worksets del proyecto para el trabajo colaborativo del modelo eléctrico',
    grupo: '01-gestion',
    subgrupo: 'Configuración del proyecto',
    categoria: 'Configuración BIM',
    disciplina: 'Eléctrica',
    dificultad: 2,
    horasEstimadas: 3,
    prioridad: 'Media',
    dependeDe: ['PB-01-07'],
    guiaIds: ['M1.5'],
    descripcion:
      'Tarea de configuración BIM que habilita la compartición de trabajo del proyecto y define los worksets eléctricos (por sistema o por zona) que permitirán a varios usuarios trabajar simultáneamente sobre el mismo modelo central.',
    objetivo:
      'Dejar el modelo eléctrico habilitado para trabajo colaborativo con una estructura de worksets clara antes de que el equipo empiece a modelar en paralelo, y con los sistemas de seguridad separados de los normales.',
    requisitos: [
      'Plantilla de proyecto MEP configurada (PB-01-07)',
      'Definición del equipo y de las zonas o sistemas que van a modelar en paralelo',
      'Ubicación del archivo central en el servidor o en BIM 360/ACC',
    ],
    procedimiento: [
      'Colaborar > Compartir para habilitar la compartición de trabajo en el proyecto.',
      'Crear los worksets eléctricos necesarios según sistema (media tensión, baja tensión, iluminación, sistemas especiales) o según zona del proyecto.',
      'Separar en worksets distintos los sistemas de seguridad —contra incendio, emergencia, evacuación— de los sistemas normales, porque se documentan, revisan y certifican por separado.',
      'Asignar los vínculos de arquitectura y estructura a sus propios worksets, independientes de los worksets de modelado eléctrico.',
      'Guardar el archivo como modelo central en la ubicación definida para el proyecto.',
      'Asignar a cada miembro del equipo los worksets sobre los que va a trabajar según su rol en el proyecto.',
      'Verificar que cada usuario pueda abrir el modelo central, tomar préstamo de su workset y sincronizar sin errores.',
    ],
    resultadoEsperado:
      'El modelo eléctrico está habilitado para trabajo colaborativo, con worksets definidos por sistema o zona, los sistemas de seguridad aislados de los normales y el archivo central publicado en la ubicación del proyecto.',
    criteriosVerificacion: [
      'La compartición de trabajo está habilitada en el proyecto.',
      'Existen worksets eléctricos definidos por sistema o por zona, distintos de los worksets de los vínculos.',
      'Los sistemas de seguridad y emergencia están en worksets separados de los sistemas normales.',
      'El archivo central está guardado en la ubicación definida del proyecto.',
      'Al menos un usuario adicional al creador pudo abrir el modelo central y sincronizar cambios sin errores.',
    ],
    notasIngenieria: [
      notaNorma(
        'Los sistemas de emergencia deben quedar claramente identificados y separados de los sistemas normales; una estructura de worksets que los mezcla obliga después a reconstruir a mano qué elementos pertenecen al sistema de emergencia.',
        REF.SISTEMAS_EMERGENCIA,
      ),
      notaNorma(
        'La NTC 2050 dedica una sección completa a los sistemas de emergencia —alcance, fuentes, ensayos— y exige mantener su alambrado independiente del alambrado normal. Eso se refleja en el modelo separando los sistemas desde el principio.',
        REF.NTC_EMERGENCIA,
      ),
      notaCriterio(
        'Una estructura de worksets demasiado granular o demasiado genérica dificulta el préstamo de elementos y la sincronización; conviene definirla según cómo se va a dividir realmente el trabajo del equipo.',
      ),
    ],
    tipsRevit: [
      'Usa Colaborar > Worksets para revisar el estado de préstamo de cada workset antes de asignar tareas al equipo.',
      "Configura los vínculos de arquitectura y estructura en modo 'Cerrado y descargado' cuando no se estén editando, para agilizar la apertura del modelo central.",
      'Usa Archivo > Sincronizar con central > Opciones para revisar qué worksets y elementos se van a liberar antes de cada sincronización, evitando bloqueos accidentales.',
    ],
    nuevo: true,
  },
  {
    plantillaId: 'PB-01-10',
    nombreOriginal: '',
    nombre: 'Verificar que los niveles y las rejillas coincidan con el modelo arquitectónico vinculado',
    grupo: '01-gestion',
    subgrupo: 'Parámetros',
    categoria: 'Configuración BIM',
    disciplina: 'Eléctrica',
    dificultad: 1,
    horasEstimadas: 2,
    prioridad: 'Alta',
    dependeDe: ['PB-01-08'],
    guiaIds: ['M1.3'],
    descripcion:
      'Tarea de configuración BIM que verifica y, si es necesario, sincroniza los niveles y las rejillas del modelo eléctrico con los del modelo arquitectónico vinculado, usando Copiar/Monitorear para mantenerlos alineados durante todo el proyecto.',
    objetivo:
      'Garantizar que los niveles y las rejillas del modelo eléctrico coincidan exactamente con los del modelo arquitectónico antes de iniciar el modelado detallado, evitando elementos ubicados en el piso equivocado o a una altura de montaje incorrecta.',
    requisitos: [
      'Modelo arquitectónico vinculado bajo coordenadas compartidas (PB-01-08)',
      'Lista de niveles y rejillas del proyecto arquitectónico',
      'Acceso a la herramienta Copiar/Monitorear en la pestaña Colaborar',
    ],
    procedimiento: [
      'Abrir una vista de alzado o sección donde sean visibles los niveles del modelo arquitectónico vinculado.',
      'Ir a Colaborar > Copiar/Monitorear > Seleccionar vínculo y elegir el modelo arquitectónico.',
      'Usar la opción Copiar para traer los niveles arquitectónicos que se necesiten como referencia en el modelo eléctrico.',
      'Repetir el proceso para las rejillas estructurales o arquitectónicas relevantes al modelado eléctrico.',
      'Verificar que los nombres y las elevaciones de los niveles copiados coincidan exactamente con los del modelo arquitectónico.',
      'Confirmar si los niveles del vínculo están a nivel de piso terminado o de losa estructural, y dejarlo registrado: las alturas de montaje de tomas y tableros se cotan desde piso terminado.',
      'Ejecutar Coordinar Revisión sobre el vínculo para detectar cambios futuros en niveles o rejillas del arquitectónico.',
    ],
    resultadoEsperado:
      'Los niveles y las rejillas del modelo eléctrico coinciden en nombre y elevación con los del modelo arquitectónico vinculado, con la referencia de piso terminado documentada, y quedan monitoreados para detectar cambios futuros.',
    criteriosVerificacion: [
      'Cada nivel del modelo eléctrico tiene un nombre y una elevación idénticos al nivel arquitectónico correspondiente.',
      'Las rejillas relevantes fueron copiadas o verificadas contra el modelo arquitectónico vinculado.',
      'Está documentado si los niveles corresponden a piso terminado o a losa estructural.',
      'Los niveles copiados están monitoreados mediante Copiar/Monitorear.',
      'Coordinar Revisión no reporta niveles o rejillas del vínculo sin resolver.',
    ],
    notasIngenieria: [
      notaNorma(
        'Las alturas de montaje de tomacorrientes, interruptores y tableros se miden desde el piso terminado. Si los niveles del modelo están referidos a losa estructural, toda altura modelada queda desplazada por el espesor del acabado y la verificación contra la norma se hace sobre una cota falsa.',
        REF.ESPACIOS_MONTAJE,
      ),
      notaNormaVerificar(
        'La separación entre tomacorrientes en vivienda no es criterio de oficina: el Art. 210-52 de la NTC 2050 fija que ningún punto del perímetro de pared quede a más de la distancia reglada de una salida. Los niveles del modelo tienen que permitir medir esa distancia sobre la planta real.',
        REF.NTC_TOMAS_VIVIENDA,
      ),
      notaCriterio(
        'Trabajar con niveles creados manualmente en lugar de niveles monitoreados desde el vínculo arquitectónico es una causa frecuente de elementos eléctricos ubicados en el piso equivocado.',
      ),
    ],
    tipsRevit: [
      'Usa Colaborar > Coordinar > Revisar cambios en vínculos periódicamente para detectar si arquitectura movió o renombró un nivel después de la verificación inicial.',
      "Verifica que la opción 'Monitorear' esté activa en las propiedades del nivel copiado; sin ella, Revit no avisará si el nivel de origen cambia.",
      "Compara la tabla de niveles con un anejo de planificación 'Niveles' filtrado por elevación para detectar duplicados o niveles huérfanos rápidamente.",
    ],
    nuevo: true,
  },
];
