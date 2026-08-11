import type { TareaCatalogo } from '../types';

export const CATALOGO_05: TareaCatalogo[] = [
  {
    plantillaId: 'PB-05-01',
    nombreOriginal: 'Tramos',
    nombre: 'Verificar la continuidad eléctrica de los tramos de canalización en el modelo',
    grupo: '05-calidad',
    subgrupo: 'Revisión del modelo',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-14', 'PB-02-15'],
    guiaIds: ['M7.1', 'M2.6'],
    descripcion:
      'Revisión de que cada tramo de tubería o bandeja modelado forme una ruta continua entre su origen y su destino, sin segmentos sueltos ni conexiones faltantes.',
    objetivo:
      'Detectar tramos de canalización eléctrica sin continuidad antes de pasar a documentación, evitando planos con rutas incompletas.',
    requisitos: [
      'Modelo con tubería y bandejas eléctricas modeladas (categorías Conduit / Cable Tray)',
      'Vista 3D o de planta con la disciplina eléctrica aislada',
      'Tabla de planificación de conductos o bandejas creada',
    ],
    procedimiento: [
      'Aislar las categorías "Conductos eléctricos" (Conduit) y "Bandejas de cables" (Cable Tray) en una vista 3D usando Aislar categoría en vista temporal.',
      'Crear o abrir una tabla de planificación de tramos filtrada por el parámetro "Sistema eléctrico".',
      'Recorrer cada tramo desde el tablero o salida de origen hasta el punto final, verificando que no existan segmentos desconectados.',
      'Usar el comando "Resaltar en modelo" sobre cualquier fila de la tabla sin conexión válida para ubicar el tramo.',
      'Corregir o marcar como pendiente cada tramo sin continuidad, dejando comentario en el parámetro de observaciones.',
      'Volver a ejecutar la tabla de planificación tras las correcciones para confirmar que ya no aparecen tramos huérfanos.',
    ],
    resultadoEsperado:
      'Todos los tramos de canalización eléctrica del modelo forman rutas continuas y verificables entre origen y destino, sin segmentos aislados.',
    criteriosVerificacion: [
      'Ningún tramo de conducto o bandeja aparece sin conexión en la tabla de planificación filtrada.',
      'Todos los tramos revisados tienen definido un origen y un destino válidos en el modelo.',
      'La vista 3D aislada no muestra segmentos de canalización flotantes o desconectados.',
      'Los tramos corregidos quedan documentados con comentario en el parámetro de observaciones.',
    ],
    notasIngenieria: [
      {
        texto: 'La continuidad de canalización es un criterio de control interno, no una comprobación normativa directa.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa Vista > Aislar categoría temporalmente para mostrar solo Conductos eléctricos y Bandejas de cables.',
      'Crea una tabla de planificación con el campo "Sistema eléctrico" para agrupar tramos por circuito.',
      'Usa clic derecho > Resaltar en modelo desde una fila de la tabla para ubicar el elemento rápidamente.',
    ],
  },
  {
    plantillaId: 'PB-05-02',
    nombreOriginal: 'Sistema',
    nombre: 'Verificar la consistencia y conectividad de los sistemas eléctricos definidos en el modelo',
    grupo: '05-calidad',
    subgrupo: 'Revisión del modelo',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-02-09', 'PB-02-10'],
    guiaIds: ['M7.1', 'M2.1'],
    descripcion:
      'Revisión de que cada sistema eléctrico (circuito) creado en Revit esté correctamente cerrado, con todos sus componentes asignados al panel correspondiente y sin advertencias de sistema abierto.',
    objetivo:
      'Confirmar que los sistemas eléctricos del modelo son coherentes y están listos para generar diagramas unifilares y cuadros de carga sin errores.',
    requisitos: [
      'Circuitos eléctricos creados para todas las salidas y equipos',
      'Paneles o tableros modelados con sus circuitos asignados',
      'Vista de Sistemas eléctricos habilitada en el navegador de proyecto',
    ],
    procedimiento: [
      'Abrir el navegador de sistemas en la pestaña Sistemas > Eléctrico y expandir cada panel.',
      'Revisar que cada circuito listado tenga todos sus elementos asignados y ninguno marcado como "sin circuito".',
      'Usar el comando "Verificar sistema" (Check Circuit) sobre cada circuito para detectar advertencias de sistema abierto.',
      'Filtrar los elementos eléctricos por el parámetro "Panel" vacío para localizar equipos sin sistema asignado.',
      'Corregir la asignación de circuito en los elementos huérfanos usando la ventana de propiedades.',
      'Confirmar que el conteo de circuitos por panel coincide con el número de salidas físicas modeladas.',
    ],
    resultadoEsperado:
      'Todos los sistemas eléctricos del modelo están correctamente cerrados, con cada elemento asignado a un circuito y panel válidos, sin advertencias de sistema abierto.',
    criteriosVerificacion: [
      'Ningún elemento eléctrico aparece con el parámetro "Panel" vacío.',
      'El comando Verificar sistema no reporta advertencias de circuito abierto en ningún circuito revisado.',
      'El número de circuitos por panel coincide con el número de salidas modeladas para ese panel.',
      'Todos los circuitos tienen definida su carga y fase correctamente.',
    ],
    notasIngenieria: [
      {
        texto: 'Esta verificación es un control de modelado interno; no corresponde a una norma específica.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa Sistemas > Eléctrico > Explorador de sistemas para navegar por panel y circuito.',
      'Selecciona un circuito y usa el botón "Verificar sistema" en la cinta contextual para detectar errores.',
      'Crea una tabla de planificación de "Dispositivos eléctricos" con el campo Panel para encontrar elementos sin asignar.',
    ],
  },
  {
    plantillaId: 'PB-05-03',
    nombreOriginal: 'Conexión de tableros a urbanismo',
    nombre: 'Verificar la conexión de los tableros eléctricos con la red de urbanismo del proyecto',
    grupo: '05-calidad',
    subgrupo: 'Revisión del modelo',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-02-02', 'PB-02-04'],
    guiaIds: ['M7.1', 'M5.2'],
    descripcion:
      'Revisión de que cada tablero de distribución modelado tenga su alimentación trazada hasta la red de baja tensión de urbanismo (zonas comunes exteriores), sin tramos faltantes.',
    objetivo:
      'Asegurar que la alimentación de los tableros hacia la red de urbanismo esté completa y modelada antes de generar los planos de red de servicios comunes.',
    requisitos: [
      'Redes de baja tensión y de servicios comunes modeladas',
      'Tableros de distribución ubicados en el modelo',
      'Vista de sitio o urbanismo vinculada al modelo eléctrico',
    ],
    procedimiento: [
      'Abrir la vista de planta general de urbanismo con el modelo eléctrico vinculado visible.',
      'Seleccionar cada tablero de distribución y trazar visualmente su alimentador hasta el punto de conexión en la red de urbanismo.',
      'Verificar en el parámetro "Alimentado desde" de cada tablero que el origen corresponda al circuito o subtablero correcto.',
      'Usar una sección o vista 3D para confirmar que el conducto de alimentación no queda interrumpido al cruzar límites de zona.',
      'Marcar en una tabla de seguimiento los tableros cuya conexión a urbanismo no pudo verificarse en el modelo.',
      'Corregir el trazado de los alimentadores pendientes y repetir la verificación visual.',
    ],
    resultadoEsperado:
      'Todos los tableros de distribución quedan con su alimentación trazada y verificada hasta la red de urbanismo del proyecto, sin interrupciones.',
    criteriosVerificacion: [
      'Cada tablero tiene definido un origen de alimentación válido hacia la red de urbanismo.',
      'No existen tramos de alimentador interrumpidos entre el tablero y la red de urbanismo en la vista 3D.',
      'La tabla de seguimiento no contiene tableros pendientes de verificación al cierre de la revisión.',
      'El parámetro "Alimentado desde" coincide con el circuito de origen mostrado en el diagrama unifilar.',
    ],
    notasIngenieria: [
      {
        texto: 'Verificación de trazabilidad de alimentadores a nivel de modelo; no sustituye el cálculo de caída de tensión.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa Copiar/Monitorear o un vínculo visible para superponer el modelo de urbanismo sobre el eléctrico.',
      'Revisa el parámetro "Alimentado desde" en las propiedades de instancia del tablero.',
      'Crea una sección rápida a lo largo del recorrido del alimentador para confirmar continuidad física.',
    ],
  },
  {
    plantillaId: 'PB-05-04',
    nombreOriginal: 'Cable por cajas y tableros',
    nombre: 'Verificar el enrutamiento del cableado a través de cajas y tableros eléctricos',
    grupo: '05-calidad',
    subgrupo: 'Revisión del modelo',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-09', 'PB-02-14'],
    guiaIds: ['M7.1', 'M5.3'],
    descripcion:
      'Revisión de que los conductores representados en los circuitos recorran efectivamente las cajas de paso y lleguen al tablero correcto, sin saltos ni cruces indebidos.',
    objetivo:
      'Confirmar que el recorrido de cableado por cajas y tableros es coherente con el diagrama unifilar antes de emitir planos definitivos.',
    requisitos: [
      'Circuitos eléctricos creados con su recorrido de conductos definido',
      'Cajas de paso modeladas en los cambios de dirección',
      'Diagrama unifilar preliminar generado',
    ],
    procedimiento: [
      'Seleccionar cada circuito en el navegador de sistemas eléctricos y activar "Mostrar recorrido de conductos".',
      'Recorrer visualmente el trayecto del circuito verificando que pase por las cajas de paso modeladas en cada cambio de dirección.',
      'Confirmar en el diagrama unifilar que el tablero de llegada coincide con el definido en el parámetro "Panel" del circuito.',
      'Revisar en planta que no existan cruces de cableado entre circuitos de distinto tablero dentro de una misma caja.',
      'Anotar en una lista de chequeo las cajas con recorrido incompleto o inconsistente.',
      'Corregir el recorrido del circuito en el modelo y repetir la verificación sobre las cajas anotadas.',
    ],
    resultadoEsperado:
      'El cableado de todos los circuitos recorre las cajas de paso y llega al tablero correcto según lo definido en el diagrama unifilar.',
    criteriosVerificacion: [
      'Cada circuito revisado pasa por las cajas de paso modeladas en sus cambios de dirección.',
      'El tablero de llegada del circuito coincide con el parámetro "Panel" asignado.',
      'No se identifican cruces de cableado entre circuitos de distinto tablero en una misma caja.',
      'La lista de chequeo queda sin cajas pendientes de verificación al cierre de la revisión.',
    ],
    notasIngenieria: [
      {
        texto: 'Control de coherencia entre modelo y diagrama unifilar; no reemplaza el cálculo de calibre de conductor.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Selecciona el circuito y usa "Mostrar recorrido de conductos" en la cinta Sistemas eléctricos.',
      'Compara visualmente contra el diagrama unifilar generado con el comando Crear diagrama del sistema.',
      'Usa el parámetro "Panel" en la ventana de propiedades del circuito para confirmar el tablero de llegada.',
    ],
  },
  {
    plantillaId: 'PB-05-05',
    nombreOriginal: 'Acometida',
    nombre: 'Verificar que la acometida modelada corresponda a los requisitos de diseño del proyecto',
    grupo: '05-calidad',
    subgrupo: 'Revisión del modelo',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-01-01', 'PB-02-01'],
    guiaIds: ['M7.1', 'M5.1'],
    descripcion:
      'Revisión de que el trazado, calibre y punto de conexión de la acometida modelada (media o baja tensión, según el proyecto) coincidan con lo definido en el predimensionamiento y las memorias de cálculo.',
    objetivo:
      'Confirmar que la acometida modelada es consistente con el punto de conexión del operador de red y con la capacidad calculada para el proyecto.',
    requisitos: [
      'Definición de subestación y cálculo de transformador realizados',
      'Redes de media o baja tensión modeladas',
      'Memorias de cálculo de acometida disponibles',
    ],
    procedimiento: [
      'Abrir la vista de planta de acometida y ubicar el punto de conexión con la red del operador.',
      'Comparar el trazado modelado contra el punto de conexión definido en la tarea de definición de subestación.',
      'Verificar que el calibre y tipo de conductor asignado en los parámetros del elemento coincidan con la memoria de cálculo.',
      'Confirmar que la acometida llega físicamente hasta el equipo de medida o la subestación sin interrupciones en el modelo.',
      'Registrar cualquier discrepancia entre el modelo y la memoria de cálculo en una lista de observaciones.',
      'Ajustar el modelo o solicitar corrección de la memoria según corresponda y repetir la verificación.',
    ],
    resultadoEsperado:
      'La acometida modelada coincide en trazado, calibre y punto de conexión con lo definido en el predimensionamiento y las memorias de cálculo del proyecto.',
    criteriosVerificacion: [
      'El punto de conexión modelado coincide con el definido en la tarea de definición de subestación.',
      'El calibre de conductor asignado en el modelo coincide con el valor de la memoria de cálculo.',
      'La acometida llega sin interrupciones hasta el equipo de medida o la subestación en el modelo 3D.',
      'No quedan discrepancias sin resolver en la lista de observaciones al cierre de la revisión.',
    ],
    notasIngenieria: [
      {
        texto:
          'La acometida es un elemento normado por RETIE, pero esta tarea es un control de coherencia entre modelo y memoria de cálculo, no una verificación normativa exhaustiva.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa el parámetro "Tipo de conductor" en las propiedades de instancia para comparar contra la memoria de cálculo.',
      'Superpone el vínculo de urbanismo para confirmar visualmente el punto de conexión con el operador de red.',
      'Usa una tabla de planificación de acometidas filtrada por circuito para revisar calibres en bloque.',
    ],
  },
  {
    plantillaId: 'PB-05-06',
    nombreOriginal: 'Revisión de que las salidas de comunicaciones tengan salida eléctrica',
    nombre: 'Verificar que cada salida de comunicaciones tenga asociada una salida eléctrica cercana',
    grupo: '05-calidad',
    subgrupo: 'Revisión del modelo',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-03', 'PB-02-12'],
    guiaIds: ['M7.1', 'M5.5'],
    descripcion:
      'Revisión cruzada entre las salidas de datos/comunicaciones y las salidas eléctricas modeladas, para confirmar que todo punto de comunicaciones cuenta con alimentación eléctrica cercana.',
    objetivo:
      'Evitar puntos de comunicaciones sin alimentación eléctrica que impidan la instalación de equipos activos (routers, switches, cámaras, etc.).',
    requisitos: [
      'Salidas de comunicaciones modeladas o vinculadas desde la disciplina de datos',
      'Propuesta de salidas eléctricas completa',
      'Vista de planta con ambas disciplinas visibles',
    ],
    procedimiento: [
      'Activar en la vista de planta la visibilidad de las categorías de salidas de comunicaciones y de salidas eléctricas.',
      'Crear una tabla de planificación de dispositivos de comunicaciones con columnas de ubicación (Nivel, coordenadas).',
      'Recorrer cada punto de comunicaciones y verificar visualmente que exista una salida eléctrica dentro del mismo mueble o pared.',
      'Marcar en la tabla los puntos de comunicaciones sin salida eléctrica cercana identificada.',
      'Coordinar con el modelador la incorporación de las salidas eléctricas faltantes.',
      'Repetir la revisión tras la corrección para confirmar el cierre de todos los puntos marcados.',
    ],
    resultadoEsperado:
      'Todo punto de comunicaciones modelado cuenta con una salida eléctrica cercana disponible para alimentar el equipo activo correspondiente.',
    criteriosVerificacion: [
      'Cada salida de comunicaciones tiene al menos una salida eléctrica dentro del mismo espacio o mueble.',
      'La tabla de seguimiento no contiene puntos de comunicaciones pendientes al cierre de la revisión.',
      'No existen salidas eléctricas duplicadas asignadas al mismo punto de comunicaciones por error.',
      'La ubicación de las salidas eléctricas asociadas coincide con la altura y muro definidos para el punto de datos.',
    ],
    notasIngenieria: [
      {
        texto: 'Buena práctica de coordinación interna entre disciplinas eléctrica y de comunicaciones, sin referencia normativa específica.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa Filtros de vista para colorear por separado las categorías Datos y Tomacorrientes.',
      'Crea una tabla de planificación con el parámetro "Nivel" y coordenadas para cruzar ambas disciplinas.',
      'Usa la herramienta Medir para confirmar la distancia entre el punto de datos y la salida eléctrica más cercana.',
    ],
  },
  {
    plantillaId: 'PB-05-07',
    nombreOriginal: 'Revisión de toma en PAU',
    nombre: 'Verificar la existencia de toma eléctrica dedicada en el Punto de Acceso al Usuario (PAU)',
    grupo: '05-calidad',
    subgrupo: 'Revisión del modelo',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-03', 'PB-02-12'],
    guiaIds: ['M7.1', 'M5.5'],
    descripcion:
      'Revisión de que el gabinete o punto de acceso al usuario (PAU) de telecomunicaciones tenga modelada su toma eléctrica dedicada requerida para los equipos activos.',
    objetivo:
      'Confirmar que todo PAU del proyecto cuenta con alimentación eléctrica modelada antes de la entrega de planos de comunicaciones.',
    requisitos: [
      'Ubicación de gabinetes PAU definida en el modelo o en los planos de comunicaciones',
      'Propuesta de salidas eléctricas completa',
    ],
    procedimiento: [
      'Ubicar en el modelo o en el plano de comunicaciones vinculado cada gabinete PAU del proyecto.',
      'Verificar en la vista de planta que exista una salida eléctrica dedicada dentro o junto al gabinete PAU.',
      'Confirmar que la toma esté asignada a un circuito independiente y no compartido con otras cargas no relacionadas.',
      'Registrar en una lista de chequeo los PAU sin toma eléctrica identificada.',
      'Coordinar la incorporación de las tomas faltantes con el equipo de modelado.',
      'Repetir la verificación tras la corrección hasta cerrar todos los PAU de la lista.',
    ],
    resultadoEsperado:
      'Todos los gabinetes PAU del proyecto cuentan con una toma eléctrica dedicada modelada y asignada a un circuito independiente.',
    criteriosVerificacion: [
      'Cada gabinete PAU tiene al menos una toma eléctrica dedicada dentro de su ubicación.',
      'La toma asociada a cada PAU está asignada a un circuito propio, no compartido con cargas ajenas al PAU.',
      'La lista de chequeo no contiene PAU pendientes al cierre de la revisión.',
      'La ubicación de la toma coincide con la altura y posición definidas para el gabinete PAU.',
    ],
    notasIngenieria: [
      {
        texto: 'Requisito operativo de los proveedores de telecomunicaciones; no se cita norma específica sin confirmarla con el proyecto.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Filtra la vista por la categoría del gabinete PAU si está modelado como familia propia.',
      'Revisa el parámetro "Panel" y "Circuito" de la toma asociada al PAU para confirmar independencia de carga.',
      'Usa una tabla de planificación de tomacorrientes con un parámetro compartido "Uso" para marcar cuáles alimentan un PAU.',
    ],
  },
  {
    plantillaId: 'PB-05-08',
    nombreOriginal: 'Revisar ductos',
    nombre: 'Verificar dimensiones y trazado de los ductos eléctricos frente al diseño',
    grupo: '05-calidad',
    subgrupo: 'Revisión del modelo',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-01-03', 'PB-02-14'],
    guiaIds: ['M7.1', 'M2.6'],
    descripcion:
      'Revisión de que los ductos y bandejas eléctricas modelados mantengan las dimensiones, pendientes y rutas definidas en el predimensionamiento del proyecto.',
    objetivo:
      'Confirmar que los ductos modelados son consistentes con la ubicación y capacidad definidas antes de coordinar con otras disciplinas.',
    requisitos: [
      'Ubicación de ductos definida en el predimensionamiento',
      'Ductos y bandejas modelados en el proyecto',
      'Tabla de planificación de ductos disponible',
    ],
    procedimiento: [
      'Crear una tabla de planificación de la categoría "Bandejas de cables" o "Conductos" con columnas de ancho, alto y nivel.',
      'Comparar cada fila contra las dimensiones definidas en la tarea de ubicación de ductos del predimensionamiento.',
      'Revisar en una vista 3D que el trazado de cada ducto siga la ruta prevista sin desviaciones no justificadas.',
      'Verificar que las pendientes o cambios de nivel de los ductos horizontales sean consistentes con el diseño arquitectónico.',
      'Marcar en la tabla los ductos con dimensión o trazado no conforme.',
      'Corregir los ductos marcados y volver a generar la tabla para confirmar el cierre de las observaciones.',
    ],
    resultadoEsperado:
      'Todos los ductos eléctricos modelados cumplen con las dimensiones y el trazado definidos en el predimensionamiento del proyecto.',
    criteriosVerificacion: [
      'Las dimensiones de cada ducto en la tabla de planificación coinciden con las definidas en el predimensionamiento.',
      'El trazado de cada ducto en la vista 3D sigue la ruta prevista sin desviaciones no documentadas.',
      'No quedan ductos marcados como no conformes al cierre de la revisión.',
      'La tabla de planificación no muestra ductos sin nivel o sistema asignado.',
    ],
    notasIngenieria: [
      {
        texto: 'Control dimensional interno del modelo frente al predimensionamiento del proyecto.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Crea una tabla de planificación de la categoría Bandejas de cables con los campos Ancho, Alto y Nivel.',
      'Usa una sección 3D a lo largo del recorrido del ducto para verificar pendientes.',
      'Aplica un filtro de vista por parámetro "Comprobado" para marcar visualmente los ductos ya revisados.',
    ],
  },
  {
    plantillaId: 'PB-05-09',
    nombreOriginal: 'Validar letreros emergencia con toma retroiluminada',
    nombre: 'Validar la alimentación eléctrica de los letreros de emergencia retroiluminados',
    grupo: '05-calidad',
    subgrupo: 'Revisión de planos',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-15', 'PB-03-16'],
    guiaIds: ['M7.5', 'M5.4'],
    descripcion:
      'Revisión de que cada letrero de emergencia retroiluminado mostrado en planos tenga su punto de alimentación eléctrica modelado y asignado al circuito correcto.',
    objetivo:
      'Confirmar que la señalización de emergencia retroiluminada cuenta con alimentación eléctrica antes de la emisión de planos, dado su rol en la seguridad de evacuación.',
    requisitos: [
      'Plano de iluminación con letreros de emergencia ubicados',
      'Tubería de iluminación modelada',
      'Listado de rutas de evacuación del proyecto arquitectónico',
    ],
    procedimiento: [
      'Abrir el plano de iluminación y ubicar cada letrero de emergencia retroiluminado indicado en la planimetría.',
      'Verificar en el modelo que exista una salida eléctrica o punto de conexión asociado a cada letrero.',
      'Confirmar que el circuito asignado a cada letrero corresponde al circuito de iluminación de emergencia definido.',
      'Contrastar la ubicación de los letreros contra las rutas de evacuación del proyecto arquitectónico.',
      'Registrar en una lista de chequeo los letreros sin alimentación o con circuito incorrecto.',
      'Corregir las asignaciones pendientes y repetir la validación hasta cerrar la lista.',
    ],
    resultadoEsperado:
      'Todos los letreros de emergencia retroiluminados cuentan con alimentación eléctrica modelada y asignada al circuito de emergencia correspondiente.',
    criteriosVerificacion: [
      'Cada letrero de emergencia tiene una salida eléctrica asociada en el modelo.',
      'El circuito asignado a cada letrero corresponde al circuito de iluminación de emergencia definido para el proyecto.',
      'La ubicación de los letreros coincide con las rutas de evacuación del proyecto arquitectónico.',
      'La lista de chequeo no contiene letreros pendientes al cierre de la validación.',
    ],
    notasIngenieria: [
      {
        texto:
          'La señalización de emergencia es un elemento de seguridad de vida contemplado por RETIE; se recomienda que el ingeniero de proyecto confirme el circuito y la norma aplicable exacta antes de cerrar la tarea.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Filtra la vista de iluminación por el parámetro "Tipo de familia" para aislar los letreros de emergencia.',
      'Revisa el parámetro "Panel" y "Circuito" de cada letrero en la ventana de propiedades.',
      'Superpone el plano de rutas de evacuación como vínculo CAD para contrastar ubicaciones.',
    ],
  },
  {
    plantillaId: 'PB-05-10',
    nombreOriginal: 'Validar toma electroimán en control de acceso',
    nombre: 'Validar la toma eléctrica del electroimán en cada punto de control de acceso',
    grupo: '05-calidad',
    subgrupo: 'Revisión de planos',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-03', 'PB-02-12'],
    guiaIds: ['M7.5', 'M5.5'],
    descripcion:
      'Revisión de que cada punto de control de acceso con cerradura electromagnética tenga modelada su toma eléctrica dedicada con la ubicación y circuito correctos.',
    objetivo:
      'Confirmar que los puntos de control de acceso cuentan con alimentación eléctrica adecuada para el electroimán antes de emitir los planos definitivos.',
    requisitos: [
      'Listado de puntos de control de acceso del proyecto',
      'Propuesta de salidas eléctricas completa',
    ],
    procedimiento: [
      'Ubicar en el plano arquitectónico o de seguridad cada punto de control de acceso con electroimán.',
      'Verificar en el modelo eléctrico que exista una toma o punto de conexión dedicado junto al marco de la puerta.',
      'Confirmar que la toma esté a la altura y distancia adecuadas respecto al electroimán según el detalle de montaje.',
      'Revisar que el circuito asignado sea independiente de cargas no relacionadas con seguridad.',
      'Registrar en una lista de chequeo los puntos sin toma identificada o con circuito incorrecto.',
      'Coordinar la corrección con el equipo de modelado y repetir la validación.',
    ],
    resultadoEsperado:
      'Todos los puntos de control de acceso con electroimán cuentan con toma eléctrica dedicada, correctamente ubicada y asignada a un circuito independiente.',
    criteriosVerificacion: [
      'Cada punto de control de acceso tiene una toma eléctrica dedicada modelada.',
      'La ubicación de la toma coincide con la altura y distancia definidas en el detalle de montaje.',
      'El circuito asignado a la toma es independiente de cargas ajenas al sistema de control de acceso.',
      'La lista de chequeo no contiene puntos pendientes al cierre de la validación.',
    ],
    notasIngenieria: [
      {
        texto: 'Requisito funcional coordinado con el diseño de seguridad electrónica del proyecto, sin norma eléctrica específica asociada.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa el parámetro compartido "Uso" en la familia de tomacorriente para marcar las destinadas a control de acceso.',
      'Filtra por categoría de puertas con el parámetro "Control de acceso" activado, si el modelo arquitectónico lo define.',
      'Verifica la altura de montaje con una sección o con el parámetro "Elevación desde nivel" del elemento.',
    ],
  },
  {
    plantillaId: 'PB-05-11',
    nombreOriginal: 'Validar puntos para talanqueras y puntos de acceso',
    nombre: 'Validar los puntos eléctricos para talanqueras y accesos vehiculares o peatonales',
    grupo: '05-calidad',
    subgrupo: 'Revisión de planos',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-03', 'PB-02-12'],
    guiaIds: ['M7.5', 'M5.5'],
    descripcion:
      'Revisión de que cada talanquera y punto de acceso vehicular o peatonal del proyecto tenga su punto eléctrico de alimentación modelado en la ubicación correcta.',
    objetivo:
      'Confirmar que los equipos de control de accesos (talanqueras, torniquetes) cuentan con alimentación eléctrica antes de la entrega de planos.',
    requisitos: [
      'Listado de talanqueras y puntos de acceso del proyecto de seguridad',
      'Propuesta de salidas eléctricas completa',
    ],
    procedimiento: [
      'Ubicar en el plano de seguridad o arquitectónico cada talanquera y punto de acceso definido para el proyecto.',
      'Verificar en el modelo eléctrico que exista un punto de alimentación junto a la base o caseta de cada talanquera.',
      'Confirmar que el circuito asignado corresponde a la carga esperada del motor de la talanquera.',
      'Revisar que la distancia entre el punto eléctrico y el equipo no exceda la longitud de cable prevista en el detalle de instalación.',
      'Registrar en una lista de chequeo los puntos sin alimentación identificada.',
      'Coordinar la corrección con el equipo de modelado y repetir la validación hasta cerrar la lista.',
    ],
    resultadoEsperado:
      'Todas las talanqueras y puntos de acceso del proyecto cuentan con punto eléctrico de alimentación modelado en la ubicación correcta.',
    criteriosVerificacion: [
      'Cada talanquera o punto de acceso tiene un punto eléctrico de alimentación asociado en el modelo.',
      'El circuito asignado corresponde a la carga esperada del equipo (talanquera o torniquete).',
      'La distancia entre el punto eléctrico y el equipo no excede la longitud de cable prevista.',
      'La lista de chequeo no contiene puntos pendientes al cierre de la validación.',
    ],
    notasIngenieria: [
      {
        texto: 'Coordinación funcional con el proyecto de seguridad electrónica; sin norma eléctrica específica asociada.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Vincula el plano de seguridad como CAD para ubicar con precisión cada talanquera.',
      'Usa la herramienta Medir entre el punto eléctrico y el eje de la talanquera para validar la distancia.',
      'Filtra las tomas por el parámetro "Uso: Seguridad" si el estudio lo tiene definido como parámetro compartido.',
    ],
  },
  {
    plantillaId: 'PB-05-12',
    nombreOriginal: 'Validar puntos motores puertas vehiculares',
    nombre: 'Validar los puntos eléctricos de alimentación de los motores de puertas vehiculares',
    grupo: '05-calidad',
    subgrupo: 'Revisión de planos',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-03', 'PB-02-12'],
    guiaIds: ['M7.5', 'M5.5'],
    descripcion:
      'Revisión de que cada motor de puerta vehicular (portón corredizo, basculante o enrollable) tenga su punto eléctrico de alimentación modelado y dimensionado según la carga del motor.',
    objetivo:
      'Confirmar que los motores de puertas vehiculares cuentan con alimentación eléctrica adecuada antes de emitir los planos definitivos.',
    requisitos: [
      'Listado de puertas vehiculares con motorización del proyecto',
      'Propuesta de salidas eléctricas completa',
      'Ficha técnica o carga estimada de los motores',
    ],
    procedimiento: [
      'Ubicar en el plano arquitectónico cada puerta vehicular motorizada del proyecto.',
      'Verificar en el modelo eléctrico que exista un punto de alimentación junto a la caseta o base del motor.',
      'Confirmar que el circuito asignado soporta la carga estimada del motor según la ficha técnica disponible.',
      'Revisar que el calibre de conductor y la protección del circuito sean coherentes con la corriente de arranque del motor.',
      'Registrar en una lista de chequeo los puntos sin alimentación identificada o con circuito subdimensionado.',
      'Coordinar la corrección con el equipo de modelado y cálculo, y repetir la validación.',
    ],
    resultadoEsperado:
      'Todos los motores de puertas vehiculares del proyecto cuentan con punto eléctrico de alimentación modelado y dimensionado correctamente.',
    criteriosVerificacion: [
      'Cada motor de puerta vehicular tiene un punto eléctrico de alimentación asociado en el modelo.',
      'El circuito asignado soporta la carga estimada del motor según la ficha técnica.',
      'El calibre de conductor y la protección asignados son coherentes con la corriente de arranque del motor.',
      'La lista de chequeo no contiene puntos pendientes al cierre de la validación.',
    ],
    notasIngenieria: [
      {
        texto: 'El dimensionamiento definitivo del circuito depende de la ficha técnica real del motor suministrado por el proveedor.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Revisa el parámetro "Carga aparente" del circuito asignado al motor y compáralo con la ficha técnica.',
      'Usa una tabla de planificación de circuitos filtrada por "Uso: Motor vehicular" para revisión en bloque.',
      'Verifica la protección del circuito en el panel schedule del tablero correspondiente.',
    ],
  },
  {
    plantillaId: 'PB-05-13',
    nombreOriginal: 'Validar puntos de CV',
    nombre: 'Validar los puntos eléctricos de alimentación del circuito cerrado de televisión (CCTV)',
    grupo: '05-calidad',
    subgrupo: 'Revisión de planos',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-03', 'PB-02-12'],
    guiaIds: ['M7.5', 'M5.5'],
    descripcion:
      'Revisión de que cada cámara y equipo del circuito cerrado de televisión (CCTV) del proyecto tenga su punto eléctrico de alimentación modelado en la ubicación correcta.',
    objetivo:
      'Confirmar que los puntos del sistema de CCTV cuentan con alimentación eléctrica antes de la entrega de planos, coordinados con el proyecto de seguridad electrónica.',
    requisitos: [
      'Listado de cámaras y equipos de CCTV del proyecto de seguridad',
      'Propuesta de salidas eléctricas completa',
    ],
    procedimiento: [
      'Ubicar en el plano de seguridad electrónica cada cámara y equipo del sistema de CCTV.',
      'Verificar en el modelo eléctrico que exista un punto de alimentación cercano a cada cámara o gabinete de video.',
      'Confirmar que el circuito asignado a cada punto es independiente de cargas no relacionadas con seguridad.',
      'Revisar que la ubicación de la toma sea consistente con la altura de montaje de la cámara o el rack de video.',
      'Registrar en una lista de chequeo los puntos sin alimentación identificada.',
      'Coordinar la corrección con el equipo de modelado y repetir la validación hasta cerrar la lista.',
    ],
    resultadoEsperado:
      'Todos los puntos del sistema de CCTV cuentan con alimentación eléctrica modelada en la ubicación correcta y en circuito independiente.',
    criteriosVerificacion: [
      'Cada cámara o equipo de CCTV tiene un punto eléctrico de alimentación asociado en el modelo.',
      'El circuito asignado a cada punto es independiente de cargas ajenas al sistema de seguridad.',
      'La ubicación de la toma coincide con la altura de montaje definida para cámaras o racks de video.',
      'La lista de chequeo no contiene puntos pendientes al cierre de la validación.',
    ],
    notasIngenieria: [
      {
        texto: 'Coordinación funcional con el proyecto de seguridad electrónica (CCTV); sin norma eléctrica específica asociada.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Vincula el plano de seguridad electrónica como CAD para ubicar con precisión cada cámara.',
      'Usa el parámetro compartido "Uso: CCTV" en las tomas para filtrarlas en una tabla de planificación.',
      'Revisa la altura de montaje con el parámetro "Elevación desde nivel" de la toma asociada.',
    ],
  },
  {
    plantillaId: 'PB-05-14',
    nombreOriginal: 'Validar punto de iluminación para letrero del proyecto',
    nombre: 'Validar el punto de iluminación asignado al letrero o valla del proyecto',
    grupo: '05-calidad',
    subgrupo: 'Revisión de planos',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 1,
    dependeDe: ['PB-02-10', 'PB-03-20'],
    guiaIds: ['M7.5', 'M5.4'],
    descripcion:
      'Revisión de que el letrero o valla identificativa del proyecto tenga modelado su punto de iluminación exterior con el circuito y control correctos.',
    objetivo:
      'Confirmar que la iluminación del letrero del proyecto está correctamente modelada antes de emitir el plano de alumbrado exterior.',
    requisitos: [
      'Ubicación del letrero definida en el proyecto arquitectónico',
      'Redes de servicios comunes o alumbrado exterior modeladas',
    ],
    procedimiento: [
      'Ubicar en el plano de alumbrado exterior el letrero o valla identificativa del proyecto.',
      'Verificar que exista un punto de iluminación exterior asignado específicamente al letrero.',
      'Confirmar que el circuito del punto de iluminación esté vinculado al control de alumbrado exterior (fotocelda o reloj) del proyecto.',
      'Revisar que la posición y orientación del punto de luz sea adecuada para iluminar la superficie del letrero.',
      'Registrar cualquier inconsistencia encontrada en una lista de chequeo.',
      'Corregir la asignación pendiente y repetir la validación.',
    ],
    resultadoEsperado:
      'El letrero del proyecto cuenta con un punto de iluminación exterior modelado, correctamente circuitado y controlado.',
    criteriosVerificacion: [
      'Existe al menos un punto de iluminación asignado específicamente al letrero del proyecto.',
      'El circuito del punto de iluminación está vinculado al control de alumbrado exterior del proyecto.',
      'La posición del punto de luz es consistente con la orientación de la superficie del letrero.',
      'No quedan inconsistencias abiertas en la lista de chequeo al cierre de la validación.',
    ],
    notasIngenieria: [
      {
        texto: 'Verificación funcional de diseño; no corresponde a un requisito normativo específico.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Filtra la vista de alumbrado exterior por el parámetro "Uso: Señalización" si está definido como parámetro compartido.',
      'Revisa el circuito del punto de luz en el panel schedule del tablero de alumbrado exterior.',
      'Usa una vista 3D para confirmar la orientación del artefacto respecto al letrero.',
    ],
  },
  {
    plantillaId: 'PB-05-15',
    nombreOriginal: 'Validar punto de iluminación de dirección',
    nombre: 'Validar el punto de iluminación de la señalización de dirección o nomenclatura del proyecto',
    grupo: '05-calidad',
    subgrupo: 'Revisión de planos',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 1,
    dependeDe: ['PB-02-10', 'PB-03-20'],
    guiaIds: ['M7.5', 'M5.4'],
    descripcion:
      'Revisión de que la señalización de dirección o nomenclatura del proyecto (placa de identificación, número de dirección) tenga modelado su punto de iluminación con el circuito correcto.',
    objetivo:
      'Confirmar que la señalización de dirección del proyecto cuenta con iluminación modelada antes de emitir el plano de alumbrado exterior.',
    requisitos: [
      'Ubicación de la señalización de dirección definida en el proyecto arquitectónico',
      'Redes de alumbrado exterior modeladas',
    ],
    procedimiento: [
      'Ubicar en el plano de alumbrado exterior la señalización de dirección o nomenclatura del proyecto.',
      'Verificar que exista un punto de iluminación exterior asignado a dicha señalización.',
      'Confirmar que el circuito del punto de iluminación esté vinculado al control de alumbrado exterior del proyecto.',
      'Revisar que la posición del punto de luz sea adecuada para hacer visible la nomenclatura en horario nocturno.',
      'Registrar cualquier inconsistencia encontrada en una lista de chequeo.',
      'Corregir la asignación pendiente y repetir la validación.',
    ],
    resultadoEsperado:
      'La señalización de dirección del proyecto cuenta con un punto de iluminación exterior modelado y correctamente circuitado.',
    criteriosVerificacion: [
      'Existe al menos un punto de iluminación asignado a la señalización de dirección del proyecto.',
      'El circuito del punto de iluminación está vinculado al control de alumbrado exterior del proyecto.',
      'La posición del punto de luz permite visibilidad nocturna de la nomenclatura.',
      'No quedan inconsistencias abiertas en la lista de chequeo al cierre de la validación.',
    ],
    notasIngenieria: [
      {
        texto: 'Verificación funcional de diseño; no corresponde a un requisito normativo específico.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Filtra la vista de alumbrado exterior por el parámetro "Uso: Nomenclatura" si está definido como parámetro compartido.',
      'Revisa el circuito del punto de luz en el panel schedule del tablero de alumbrado exterior.',
      'Usa una vista 3D nocturna (renderizado con iluminación) para confirmar la visibilidad de la señalización.',
    ],
  },
  {
    plantillaId: 'PB-05-16',
    nombreOriginal: '',
    nombre: 'Auditar los warnings de Revit del modelo eléctrico antes de la entrega',
    grupo: '05-calidad',
    subgrupo: 'Duplicados y warnings',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-02-09'],
    guiaIds: ['M7.2', 'M7.1'],
    descripcion:
      'Revisión sistemática del panel de warnings de Revit del modelo eléctrico para identificar, clasificar y resolver advertencias críticas antes de la entrega.',
    objetivo:
      'Reducir el número de warnings del modelo eléctrico a los estrictamente aceptables, evitando que advertencias críticas (elementos duplicados, sistemas incompletos, elementos fuera de vínculo) lleguen a la entrega.',
    requisitos: [
      'Modelo eléctrico con todas las disciplinas propias modeladas',
      'Acceso a la pestaña Administrar > Revisar advertencias',
    ],
    procedimiento: [
      'Abrir Administrar > Revisar advertencias y exportar la lista completa de warnings a un archivo HTML.',
      'Clasificar las advertencias por tipo: elementos duplicados, sistemas eléctricos incompletos, elementos fuera de posición, referencias circulares.',
      'Priorizar y resolver primero las advertencias críticas para el sistema eléctrico (circuitos abiertos, elementos superpuestos).',
      'Usar el botón "Mostrar" de cada advertencia para ubicar el elemento en el modelo y corregirlo.',
      'Volver a exportar la lista de warnings tras las correcciones y comparar contra el conteo inicial.',
      'Documentar en una nota de entrega las advertencias restantes que se consideran aceptables y su justificación.',
    ],
    resultadoEsperado:
      'El modelo eléctrico llega a la entrega con el menor número posible de warnings, sin advertencias críticas sin resolver ni sin justificar.',
    criteriosVerificacion: [
      'El listado exportado de warnings no contiene advertencias de sistema eléctrico incompleto sin resolver.',
      'No existen advertencias de elementos duplicados sin revisar en la categoría eléctrica.',
      'Toda advertencia restante en la entrega final está documentada con su justificación en la nota de entrega.',
      'El conteo total de warnings del modelo eléctrico disminuyó respecto a la exportación inicial.',
    ],
    notasIngenieria: [
      {
        texto: 'Auditoría de calidad interna del modelo; no corresponde a un requisito normativo.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa Administrar > Revisar advertencias y el botón "Exportar" para generar el listado en HTML.',
      'Selecciona una advertencia y usa "Mostrar" para resaltar el elemento afectado en el modelo.',
      'Filtra el listado exportado por palabras clave como "duplicad" o "eléctrico" para priorizar la revisión.',
    ],
    nuevo: true,
  },
  {
    plantillaId: 'PB-05-17',
    nombreOriginal: '',
    nombre: 'Revisar la nomenclatura y detectar elementos duplicados en el modelo eléctrico',
    grupo: '05-calidad',
    subgrupo: 'Nomenclatura',
    categoria: 'Revisión y QC',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-03-01'],
    guiaIds: ['M7.3', 'M7.4'],
    descripcion:
      'Revisión de que los nombres de tipos, familias, vistas y hojas del modelo eléctrico sigan el estándar de nomenclatura del estudio, y detección de elementos duplicados mediante tablas de planificación.',
    objetivo:
      'Garantizar consistencia de nomenclatura y eliminar elementos duplicados antes de la entrega, para facilitar la lectura del modelo y evitar errores en cuantificaciones.',
    requisitos: [
      'Estándar de nomenclatura del estudio definido',
      'Modelo eléctrico con familias, vistas y hojas creadas',
      'Tablas de planificación de elementos eléctricos disponibles',
    ],
    procedimiento: [
      'Crear una tabla de planificación de tipos de familia eléctrica ordenada alfabéticamente por nombre.',
      'Comparar los nombres contra el estándar de nomenclatura del estudio y marcar los que no cumplen el formato.',
      'Usar una tabla de planificación de elementos por coordenadas para ubicar elementos superpuestos en la misma posición.',
      'Verificar los nombres de vistas y hojas en el navegador de proyecto contra la convención definida para el proyecto.',
      'Corregir los nombres no conformes usando el comando Renombrar y eliminar los elementos duplicados confirmados.',
      'Volver a generar las tablas de planificación para confirmar que la nomenclatura y los duplicados quedaron resueltos.',
    ],
    resultadoEsperado:
      'El modelo eléctrico tiene nomenclatura consistente en familias, tipos, vistas y hojas, y no contiene elementos duplicados en la misma ubicación.',
    criteriosVerificacion: [
      'Todos los nombres de tipos de familia eléctrica revisados cumplen el estándar de nomenclatura del estudio.',
      'No se identifican elementos eléctricos duplicados en la misma coordenada y nivel.',
      'Los nombres de vistas y hojas siguen la convención definida para el proyecto.',
      'Las tablas de planificación regeneradas no muestran observaciones pendientes de nomenclatura o duplicados.',
    ],
    notasIngenieria: [
      {
        texto: 'Estándar de nomenclatura definido internamente por el estudio; no corresponde a una norma externa.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa una tabla de planificación de "Familias y tipos" con el campo Nombre para revisar en bloque.',
      'Selecciona elementos superpuestos con "Seleccionar todas las instancias en el modelo" para confirmar duplicados.',
      'Usa el comando Renombrar (F2) sobre vistas y hojas en el navegador de proyecto para corregir la nomenclatura.',
    ],
    nuevo: true,
  },
];
