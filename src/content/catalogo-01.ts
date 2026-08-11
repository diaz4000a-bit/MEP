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
    dependeDe: ['PB-01-10'],
    guiaIds: ['M5.1'],
    descripcion:
      'Tarea de predimensionamiento que establece los parámetros base de la subestación eléctrica (tipo, ubicación general en el predio y modalidad de conexión) a partir de la carga estimada del proyecto y las restricciones arquitectónicas y urbanísticas.',
    objetivo:
      'Fijar la ubicación y el tipo de subestación antes de iniciar el modelado detallado, para que el resto de las tareas de predimensionamiento (transformador, cárcamos, ductos) partan de una base común.',
    requisitos: [
      'Carga estimada preliminar del proyecto (área construida, uso y densidad de carga por m²)',
      'Planta arquitectónica de implantación con las restricciones de predio disponibles',
      'Normas del operador de red aplicables a la zona del proyecto',
    ],
    procedimiento: [
      'Revisar la carga estimada preliminar del proyecto y el área construida por uso para dimensionar la demanda aproximada.',
      'Definir si la subestación será tipo interior, exterior, compacta o de poste según la carga estimada y el predio disponible.',
      'Ubicar en la planta arquitectónica vinculada un área candidata para la subestación con acceso vehicular y ventilación.',
      'Verificar con el operador de red local los requisitos de acceso, área mínima y distancias de seguridad para el tipo elegido.',
      'Registrar la decisión de ubicación y tipo de subestación como nota de proyecto o parámetro compartido en el modelo.',
      'Coordinar la ubicación propuesta con el equipo de arquitectura antes de continuar con el resto de tareas de predimensionamiento.',
    ],
    resultadoEsperado:
      'La subestación tiene definidos su tipo, su ubicación general en el predio y las restricciones de acceso, quedando disponible como referencia para el cálculo del transformador, los cárcamos y los ductos.',
    criteriosVerificacion: [
      'El tipo de subestación (interior, exterior, compacta o de poste) está definido y documentado.',
      'La ubicación propuesta cuenta con acceso vehicular para maniobra de equipos.',
      'La ubicación propuesta fue validada con el equipo de arquitectura.',
      'Los requisitos del operador de red para el tipo de subestación elegido fueron consultados.',
    ],
    notasIngenieria: [
      {
        texto:
          'El diseño y la ubicación de la subestación deben cumplir los requisitos del RETIE y del operador de red local; estos requisitos varían según el nivel de tensión y la modalidad de conexión.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa un parámetro de proyecto compartido (por ejemplo 'Tipo de subestación') para registrar la decisión y que quede visible en las vistas del equipo.",
      "Crea una vista de planta específica de 'Predimensionamiento MEP' para ubicar las áreas candidatas sin afectar las vistas de documentación final.",
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
    dependeDe: ['PB-01-01'],
    guiaIds: ['M2.5', 'M1.3'],
    descripcion:
      'Tarea de predimensionamiento que identifica y ubica en la planta arquitectónica los espacios técnicos eléctricos del proyecto (cuarto de tableros, cuarto de medidores, cuarto de transformador, closets eléctricos por piso) con base en la subestación ya definida.',
    objetivo:
      'Reservar el área y la ubicación de cada espacio técnico eléctrico antes del modelado detallado, evitando reprocesos por falta de espacio o mala ubicación respecto a las rutas de acometida.',
    requisitos: [
      'Definición del tipo y ubicación de la subestación (PB-01-01)',
      'Planta arquitectónica vinculada con los espacios candidatos disponibles',
      'Número de pisos y unidades del proyecto para estimar closets eléctricos por piso',
    ],
    procedimiento: [
      'Listar los espacios técnicos eléctricos requeridos según el tipo de proyecto (cuarto de tableros, cuarto de medidores, closets por piso).',
      'Revisar la planta arquitectónica vinculada y proponer una ubicación para cada espacio técnico cercana a las rutas de acometida verticales.',
      'Verificar que el área disponible en cada espacio propuesto cumpla con el área mínima requerida por equipo a instalar.',
      'Marcar los espacios técnicos con un área de filtro o una zona en el modelo para dejar constancia de la reserva.',
      'Coordinar con arquitectura la reserva de cada espacio antes de continuar con el modelado de ductos.',
      'Registrar la ubicación aprobada de cada espacio técnico en una tabla de seguimiento del proyecto.',
    ],
    resultadoEsperado:
      'Todos los espacios técnicos eléctricos requeridos por el proyecto están ubicados en la planta y reservados con arquitectura, listos para el modelado detallado de tableros y ductos.',
    criteriosVerificacion: [
      'Cada espacio técnico eléctrico requerido por el proyecto tiene una ubicación asignada en la planta.',
      'El área de cada espacio técnico ubicado cumple el área mínima requerida por los equipos que va a alojar.',
      'La reserva de espacios técnicos fue coordinada y aprobada por el equipo de arquitectura.',
      'Los espacios técnicos están ubicados en niveles y rejillas coincidentes con el modelo vinculado.',
    ],
    notasIngenieria: [
      {
        texto:
          'El área mínima de los cuartos técnicos eléctricos depende de los equipos a instalar y de las distancias de seguridad; no existe un valor único aplicable a todos los proyectos.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa la herramienta 'Zona' (Área) en el navegador de proyecto para delimitar cada espacio técnico con un color distintivo por tipo.",
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
    dependeDe: ['PB-01-02'],
    guiaIds: ['M2.5', 'M2.2'],
    descripcion:
      'Tarea de predimensionamiento que define el trazado general y la ubicación de los ductos eléctricos verticales (shafts) y horizontales que conectarán la subestación con los espacios técnicos y los tableros de cada piso.',
    objetivo:
      'Reservar las rutas y las secciones de ducto necesarias antes del modelado detallado de bandejas y tuberías, evitando interferencias con otras disciplinas.',
    requisitos: [
      'Ubicación de la subestación y de los espacios técnicos (PB-01-01, PB-01-02)',
      'Planta arquitectónica vinculada con los shafts o ductos disponibles',
      'Estimación preliminar de la cantidad de circuitos y calibres a distribuir',
    ],
    procedimiento: [
      'Identificar en la planta arquitectónica los shafts o ductos verticales disponibles cercanos a los espacios técnicos eléctricos.',
      'Trazar la ruta horizontal preliminar entre la subestación y el ducto vertical más cercano.',
      'Estimar la sección requerida del ducto según la cantidad de circuitos y calibres previstos para ese tramo.',
      'Verificar que la sección estimada quepa en el shaft o ducto disponible en la planta arquitectónica.',
      'Marcar la ruta y la sección del ducto en el modelo con una línea de referencia o un elemento genérico de reserva.',
      'Coordinar la reserva de ductos con las demás disciplinas (hidráulico, HVAC) para evitar interferencias tempranas.',
    ],
    resultadoEsperado:
      'Las rutas y secciones preliminares de los ductos eléctricos quedan reservadas y coordinadas con las demás disciplinas, listas para el modelado detallado de bandejas y tuberías.',
    criteriosVerificacion: [
      'Cada tramo de ducto identificado tiene una ruta y una sección preliminar asignada.',
      'La sección estimada de cada ducto cabe dentro del shaft o espacio disponible en la planta arquitectónica.',
      'La reserva de ductos fue coordinada con al menos las disciplinas hidráulica y de HVAC.',
      'Las rutas de ducto conectan la subestación con los espacios técnicos definidos en PB-01-02.',
    ],
    notasIngenieria: [
      {
        texto:
          'El dimensionamiento preliminar de ductos debe dejar una holgura para crecimiento de circuitos y para el radio de curvatura de los conductores; el valor exacto depende del calibre y la cantidad de circuitos de cada proyecto.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa líneas de modelo o un elemento genérico 'Placeholder de ducto' para reservar la ruta sin comprometerte todavía con una familia de bandeja definitiva.",
      "Activa las categorías 'Bandejas de cable' y 'Conducto' en el navegador de visibilidad para revisar interferencias tempranas con otras disciplinas.",
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
    dependeDe: ['PB-01-01'],
    guiaIds: ['M5.1'],
    descripcion:
      'Cálculo preliminar de la capacidad del transformador a partir de la carga estimada del proyecto, usado únicamente para dimensionar el área y el tipo de subestación en esta etapa temprana. Este valor se recalculará más adelante con las cargas definitivas del proyecto arquitectónico (ver PB-02-16).',
    objetivo:
      'Obtener un valor preliminar de capacidad del transformador en kVA que permita dimensionar el área física de la subestación.',
    requisitos: [
      'Definición del tipo y ubicación de la subestación (PB-01-01)',
      'Área construida y uso del proyecto por piso',
      'Densidad de carga estimada por tipo de uso (residencial, comercial, etc.)',
    ],
    procedimiento: [
      'Recopilar el área construida por uso (residencial, comercial, parqueaderos, zonas comunes) del proyecto.',
      'Aplicar la densidad de carga estimada por tipo de uso para obtener la demanda preliminar en kVA.',
      'Sumar la demanda de todos los usos y aplicar un factor de diversidad preliminar razonable para el tipo de proyecto.',
      'Seleccionar la capacidad comercial de transformador inmediatamente superior al valor calculado.',
      'Verificar que la capacidad seleccionada sea compatible con el tipo y el área de subestación definidos en PB-01-01.',
      'Registrar el cálculo preliminar y sus supuestos en la memoria de predimensionamiento del proyecto.',
    ],
    resultadoEsperado:
      'Existe un valor preliminar de capacidad de transformador en kVA, con sus supuestos documentados, suficiente para confirmar que el área de subestación definida es adecuada.',
    criteriosVerificacion: [
      'El cálculo preliminar reporta un valor de capacidad de transformador en kVA con sus supuestos documentados.',
      'La capacidad seleccionada corresponde a un valor comercial estándar de transformador.',
      'La capacidad seleccionada es compatible con el área de subestación definida en PB-01-01.',
      'El cálculo indica explícitamente que es preliminar y que será recalculado con las cargas definitivas.',
    ],
    notasIngenieria: [
      {
        texto:
          'Este cálculo es preliminar y se basa en densidades de carga estimadas por uso; debe recalcularse con las cargas reales del proyecto arquitectónico (ver PB-02-16) antes de emitir cualquier documento para el operador de red.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Registra el cálculo preliminar y sus supuestos en un parámetro de proyecto compartido 'Capacidad preliminar transformador (kVA)' para que quede trazable en el modelo.",
      'No modeles todavía el equipo físico del transformador en esta tarea: es un cálculo de predimensionamiento, el modelado detallado corresponde a tareas posteriores.',
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
    dependeDe: ['PB-01-01', 'PB-01-03'],
    guiaIds: ['M2.5', 'M5.1'],
    descripcion:
      'Tarea de predimensionamiento que ubica y dimensiona preliminarmente los cárcamos (canales enterrados) que alojarán los cables de media y baja tensión entre la subestación, el transformador y los tableros generales.',
    objetivo:
      'Reservar la ubicación y las dimensiones preliminares de los cárcamos antes del modelado detallado, garantizando que las rutas de cable queden correctamente resueltas bajo piso.',
    requisitos: [
      'Ubicación de la subestación (PB-01-01) y de las rutas de ductos (PB-01-03)',
      'Cantidad y calibre preliminar de los cables de media y baja tensión a canalizar',
      'Nivel de piso terminado de la subestación y de los espacios técnicos conectados',
    ],
    procedimiento: [
      'Identificar los tramos entre la subestación, el transformador y los tableros generales que requieren cárcamo.',
      'Estimar el ancho y la profundidad preliminar del cárcamo según la cantidad y el calibre de cables previstos en cada tramo.',
      'Trazar la ruta preliminar del cárcamo en la planta, evitando cruces con cimentación o ductos de otras disciplinas.',
      'Verificar la profundidad disponible respecto al nivel de piso terminado y a la cimentación existente.',
      'Marcar el cárcamo en el modelo con un elemento genérico de reserva o una línea de referencia con sus dimensiones.',
      'Coordinar la ruta y la profundidad del cárcamo con estructura antes de continuar con el modelado detallado.',
    ],
    resultadoEsperado:
      'Los cárcamos requeridos entre la subestación, el transformador y los tableros generales tienen una ruta y unas dimensiones preliminares definidas y coordinadas con estructura.',
    criteriosVerificacion: [
      'Cada tramo que requiere cárcamo tiene una ruta preliminar trazada en la planta.',
      'Las dimensiones preliminares (ancho y profundidad) de cada cárcamo están documentadas.',
      'La ruta del cárcamo no interfiere con la cimentación conocida a esta etapa del proyecto.',
      'La ruta y profundidad del cárcamo fueron coordinadas con el equipo de estructura.',
    ],
    notasIngenieria: [
      {
        texto:
          'Las dimensiones del cárcamo dependen de la cantidad, el calibre y el radio de curvatura de los cables a instalar, así como de la separación mínima entre circuitos de media y baja tensión; estos valores deben verificarse para cada proyecto.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Modela el cárcamo como un elemento de 'Piso' o un componente genérico de reserva con parámetros de ancho y profundidad, en lugar de geometría definitiva, en esta etapa preliminar.",
      'Usa una vista de sección rápida en la zona del cárcamo para verificar visualmente que la profundidad propuesta no choca con elementos estructurales vinculados.',
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
    dependeDe: ['PB-01-01'],
    guiaIds: ['M5.1', 'M2.2'],
    descripcion:
      'Tarea de predimensionamiento que ubica y modela preliminarmente el sistema de desfogue de la subestación (rejillas o ductos de ventilación de escape para disipar el calor del transformador) hacia el exterior de la edificación.',
    objetivo:
      'Garantizar que la subestación cuente con una ruta de ventilación de escape definida desde esta etapa temprana, evitando reprocesos por falta de espacio hacia fachada.',
    requisitos: [
      'Ubicación y tipo de subestación definidos (PB-01-01)',
      'Capacidad preliminar del transformador (PB-01-04) para estimar el caudal de ventilación requerido',
      'Planta arquitectónica vinculada con la fachada o el ducto de ventilación disponible',
    ],
    procedimiento: [
      'Estimar el caudal de aire de desfogue requerido según la capacidad preliminar del transformador.',
      'Identificar en la planta arquitectónica la ruta más corta hacia fachada o hacia un ducto de ventilación vertical.',
      'Ubicar la posición preliminar de la rejilla o el ducto de desfogue en el modelo.',
      'Verificar que la ruta propuesta no interfiera con otros elementos arquitectónicos o estructurales conocidos a esta etapa.',
      'Marcar el elemento de desfogue en el modelo con un componente genérico de reserva.',
      'Coordinar la ubicación de la rejilla de desfogue con arquitectura, especialmente si sale a fachada.',
    ],
    resultadoEsperado:
      'El sistema de desfogue de la subestación tiene una ruta y una ubicación preliminar definida, coordinada con arquitectura y compatible con la capacidad del transformador.',
    criteriosVerificacion: [
      'Existe una ruta preliminar trazada entre la subestación y el punto de salida del desfogue.',
      'La posición de la rejilla o ducto de desfogue está marcada en el modelo.',
      'La ubicación del desfogue fue coordinada con arquitectura cuando la salida es a fachada.',
      'El caudal estimado de desfogue está documentado y asociado a la capacidad preliminar del transformador.',
    ],
    notasIngenieria: [
      {
        texto:
          'El caudal de ventilación de desfogue depende de las pérdidas térmicas del transformador seleccionado y debe verificarse con la ficha técnica del fabricante una vez definida la capacidad final.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Modela la rejilla de desfogue como un componente genérico de reserva de tipo 'Difusor' o 'Rejilla' en esta etapa, sin comprometerte con la familia definitiva de fabricante.",
      'Usa una etiqueta de texto o un parámetro de ejemplar para dejar registrado el caudal estimado junto al elemento de desfogue en el modelo.',
      'Revisa la vista de alzado de la fachada donde sale el desfogue para confirmar que no interfiere con ventanas u otros elementos arquitectónicos.',
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
    dependeDe: [],
    guiaIds: ['M1.2', 'M4.2'],
    descripcion:
      'Tarea inicial de configuración BIM que establece la plantilla de proyecto MEP del estudio como punto de partida y carga el archivo de parámetros compartidos eléctricos que usarán todas las familias y anotaciones del proyecto.',
    objetivo:
      'Dejar el archivo de proyecto listo, con la plantilla y los parámetros compartidos correctos, antes de vincular modelos o empezar a modelar.',
    requisitos: [
      'Plantilla de proyecto MEP del estudio (.rte) actualizada',
      'Archivo de parámetros compartidos (.txt) del estudio con los parámetros eléctricos definidos',
      'Nombre y código del proyecto asignados',
    ],
    procedimiento: [
      'Crear un proyecto nuevo en Revit a partir de la plantilla de proyecto MEP del estudio.',
      'Guardar el archivo de proyecto con el nombre y la ubicación definidos por la convención de nomenclatura del estudio.',
      'Ir a Gestionar > Parámetros compartidos y cargar el archivo de parámetros compartidos eléctricos del estudio.',
      'Verificar en Gestionar > Parámetros de proyecto que los parámetros eléctricos requeridos estén asociados a las categorías correctas.',
      'Configurar las unidades de proyecto (Gestionar > Unidades de proyecto) según el estándar eléctrico del estudio.',
      'Guardar el archivo y registrarlo en la ubicación central del proyecto en el servidor o en BIM 360/ACC.',
    ],
    resultadoEsperado:
      'El archivo de proyecto está creado a partir de la plantilla MEP del estudio, con los parámetros compartidos eléctricos cargados y las unidades configuradas, listo para vincular modelos y empezar el modelado.',
    criteriosVerificacion: [
      'El proyecto fue creado a partir de la plantilla de proyecto MEP del estudio.',
      'El archivo de parámetros compartidos eléctricos está cargado en el proyecto.',
      'Los parámetros eléctricos requeridos aparecen asociados a las categorías correctas en Parámetros de proyecto.',
      'Las unidades de proyecto están configuradas según el estándar eléctrico del estudio.',
    ],
    notasIngenieria: [
      {
        texto:
          'Mantener un único archivo de parámetros compartidos versionado por el estudio evita duplicados de GUID entre proyectos y problemas al intercambiar familias entre modelos.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa Gestionar > Parámetros compartidos y revisa el archivo .txt en un editor de texto antes de cargarlo para confirmar que no tiene grupos o parámetros duplicados.',
      'Verifica la versión de la plantilla MEP contra el repositorio central del estudio antes de crear el proyecto, para no partir de una plantilla desactualizada.',
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
      'Configurar la recarga automática o manual de los vínculos según el flujo de trabajo colaborativo del proyecto.',
    ],
    resultadoEsperado:
      'Los modelos de arquitectura y estructura están vinculados al proyecto eléctrico bajo un sistema de coordenadas compartidas único, con el punto base y el norte de proyecto coincidentes entre disciplinas.',
    criteriosVerificacion: [
      'El modelo arquitectónico y el modelo estructural están vinculados al proyecto eléctrico.',
      'Los tres modelos comparten el mismo sistema de coordenadas compartidas.',
      'El punto base y el norte de proyecto coinciden entre el modelo eléctrico y los vínculos.',
      'Una vista 3D de verificación muestra los tres modelos alineados sin desfases evidentes.',
    ],
    notasIngenieria: [
      {
        texto:
          'Un error en la publicación o adquisición de coordenadas compartidas al inicio del proyecto se propaga a todas las disciplinas y suele ser costoso de corregir después de que el modelado ya avanzó.',
        fuente: null,
        verificar: true,
      },
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
    dependeDe: ['PB-01-07'],
    guiaIds: ['M1.5'],
    descripcion:
      'Tarea de configuración BIM que habilita la compartición de trabajo del proyecto y define los worksets eléctricos (por sistema o por zona) que permitirán a varios usuarios trabajar simultáneamente sobre el mismo modelo central.',
    objetivo:
      'Dejar el modelo eléctrico habilitado para trabajo colaborativo con una estructura de worksets clara antes de que el equipo empiece a modelar en paralelo.',
    requisitos: [
      'Plantilla de proyecto MEP configurada (PB-01-07)',
      'Definición del equipo y de las zonas o sistemas que van a modelar en paralelo',
      'Ubicación del archivo central en el servidor o en BIM 360/ACC',
    ],
    procedimiento: [
      'Colaborar > Compartir para habilitar la compartición de trabajo en el proyecto.',
      'Crear los worksets eléctricos necesarios según sistema (media tensión, baja tensión, iluminación, sistemas especiales) o según zona del proyecto.',
      'Asignar los vínculos de arquitectura y estructura a sus propios worksets, independientes de los worksets de modelado eléctrico.',
      'Guardar el archivo como modelo central en la ubicación definida para el proyecto.',
      'Asignar a cada miembro del equipo los worksets sobre los que va a trabajar según su rol en el proyecto.',
      'Verificar que cada usuario pueda abrir el modelo central, tomar préstamo de su workset y sincronizar sin errores.',
    ],
    resultadoEsperado:
      'El modelo eléctrico está habilitado para trabajo colaborativo, con worksets definidos por sistema o zona y con el archivo central publicado en la ubicación del proyecto.',
    criteriosVerificacion: [
      'La compartición de trabajo está habilitada en el proyecto.',
      'Existen worksets eléctricos definidos por sistema o por zona, distintos de los worksets de los vínculos.',
      'El archivo central está guardado en la ubicación definida del proyecto.',
      'Al menos un usuario adicional al creador pudo abrir el modelo central y sincronizar cambios sin errores.',
    ],
    notasIngenieria: [
      {
        texto:
          'Una estructura de worksets demasiado granular o demasiado genérica dificulta el préstamo de elementos y la sincronización; conviene definirla según cómo se va a dividir realmente el trabajo del equipo.',
        fuente: null,
        verificar: true,
      },
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
    dependeDe: ['PB-01-08'],
    guiaIds: ['M1.3'],
    descripcion:
      'Tarea de configuración BIM que verifica y, si es necesario, sincroniza los niveles y las rejillas del modelo eléctrico con los del modelo arquitectónico vinculado, usando Copiar/Monitorear para mantenerlos alineados durante todo el proyecto.',
    objetivo:
      'Garantizar que los niveles y las rejillas del modelo eléctrico coincidan exactamente con los del modelo arquitectónico antes de iniciar el modelado detallado, evitando elementos ubicados en el piso equivocado.',
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
      'Ejecutar Coordinar Revisión sobre el vínculo para detectar cambios futuros en niveles o rejillas del arquitectónico.',
    ],
    resultadoEsperado:
      'Los niveles y las rejillas del modelo eléctrico coinciden en nombre y elevación con los del modelo arquitectónico vinculado, y quedan monitoreados para detectar cambios futuros.',
    criteriosVerificacion: [
      'Cada nivel del modelo eléctrico tiene un nombre y una elevación idénticos al nivel arquitectónico correspondiente.',
      'Las rejillas relevantes fueron copiadas o verificadas contra el modelo arquitectónico vinculado.',
      'Los niveles copiados están monitoreados mediante Copiar/Monitorear.',
      'Coordinar Revisión no reporta niveles o rejillas del vínculo sin resolver.',
    ],
    notasIngenieria: [
      {
        texto:
          'Trabajar con niveles creados manualmente en lugar de niveles monitoreados desde el vínculo arquitectónico es una causa frecuente de elementos eléctricos ubicados en el piso equivocado.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa Colaborar > Coordinar > Revisar cambios en vínculos periódicamente para detectar si arquitectura movió o renombró un nivel después de la verificación inicial.',
      "Verifica que la opción 'Monitorear' esté activa en las propiedades del nivel copiado; sin ella, Revit no avisará si el nivel de origen cambia.",
      "Compara la tabla de niveles con un anejo de planificación 'Niveles' filtrado por elevación para detectar duplicados o niveles huérfanos rápidamente.",
    ],
    nuevo: true,
  },
];
