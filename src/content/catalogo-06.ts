import type { TareaCatalogo } from '../types';

export const CATALOGO_06: TareaCatalogo[] = [
  {
    plantillaId: 'PB-06-01',
    nombreOriginal: 'Plano de media tensión, desde punto de conexión hasta SE',
    nombre: 'Documentar el plano de media tensión desde el punto de conexión hasta la subestación',
    grupo: '06-entregables',
    subgrupo: 'Entregables Operador de Red',
    categoria: 'Documentación',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-02-01', 'PB-01-01'],
    guiaIds: ['M5.1', 'M3.1'],
    descripcion:
      'Genera el plano de planta que muestra el recorrido completo de la red de media tensión, desde el punto de conexión del Operador de Red hasta la subestación del proyecto, listo para el paquete de entrega OR.',
    objetivo: 'Producir el plano de media tensión requerido por el Operador de Red para el trámite de conexión.',
    requisitos: [
      'Modelado de las redes de media tensión terminado (PB-02-01)',
      'Definición de subestación aprobada (PB-01-01)',
      'Plantilla de vista de planos OR configurada',
    ],
    procedimiento: [
      'Duplicar la vista de planta del nivel correspondiente y renombrarla según la convención de planos OR.',
      'Aplicar la plantilla de vista "Media Tensión - OR" para fijar visibilidad de disciplinas y escala.',
      'Activar la categoría "Conductores eléctricos" y "Tubería" filtradas por el sistema de media tensión.',
      'Anotar el recorrido con etiquetas de calibre, tipo de conductor y longitud de tramo.',
      'Insertar la vista en la lámina del paquete OR y completar el cajetín con los datos del proyecto.',
      'Verificar que el punto de conexión del Operador de Red esté referenciado con su coordenada real.',
    ],
    resultadoEsperado:
      'Plano de planta de media tensión insertado en la lámina del paquete OR, con el recorrido completo desde el punto de conexión hasta la subestación anotado y acotado.',
    criteriosVerificacion: [
      'La vista muestra el recorrido completo de la red de MT sin interrupciones entre el punto de conexión y la subestación.',
      'Todos los tramos de conductor tienen etiqueta de calibre y longitud visible.',
      'La lámina tiene cajetín completo con número de plano, escala y fecha.',
      'El punto de conexión coincide con la coordenada entregada por el Operador de Red.',
    ],
    notasIngenieria: [
      {
        texto:
          'Los entregables para el Operador de Red en Colombia deben ajustarse a los requisitos de subestaciones del RETIE; verificar el listado de planos exigido por el operador local antes de radicar.',
        fuente: 'RETIE',
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa 'Duplicar vista > Con detallado' para no perder las anotaciones al crear la vista OR a partir de la vista de trabajo.",
      'Filtra por el parámetro de sistema eléctrico en el Panel de Filtros de vista para aislar únicamente los circuitos de media tensión.',
      "Usa el comando 'Etiquetar todo' (Anotar > Etiquetar > Etiquetar todo no etiquetados) para acelerar el etiquetado de calibres.",
    ],
  },
  {
    plantillaId: 'PB-06-02',
    nombreOriginal: 'Plano detalles ingreso redes de MT (cortes y vistas isométricas)',
    nombre: 'Documentar los detalles de ingreso de las redes de media tensión con cortes e isométricos',
    grupo: '06-entregables',
    subgrupo: 'Entregables Operador de Red',
    categoria: 'Documentación',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-06-01', 'PB-02-01'],
    guiaIds: ['M3.4', 'M5.1'],
    descripcion:
      'Elabora los planos de detalle del punto de ingreso de las redes de media tensión al predio, incluyendo cortes constructivos y vistas isométricas para el paquete de entrega OR.',
    objetivo: 'Documentar gráficamente el detalle constructivo de ingreso de MT exigido por el Operador de Red.',
    requisitos: [
      'Plano de media tensión terminado (PB-06-01)',
      'Modelado de redes de media tensión (PB-02-01)',
    ],
    procedimiento: [
      'Crear una vista de callout sobre el punto de ingreso de la red de MT en la planta general.',
      'Generar un corte (Sección) en el punto de cruce de vía o ingreso al predio.',
      'Crear una vista 3D aislada del tramo de ingreso y ajustar el cuadro de sección para obtener la vista isométrica.',
      'Aplicar la plantilla de vista de detalles y activar las anotaciones de profundidad de zanja y capas de relleno.',
      'Insertar corte e isométrico en la misma lámina de detalles y añadir notas constructivas.',
      'Revisar que las cotas de profundidad y separación de la zanja coincidan con el modelo.',
    ],
    resultadoEsperado:
      'Lámina de detalles de ingreso de MT con corte constructivo e isométrico, acotada y anotada, lista para el paquete OR.',
    criteriosVerificacion: [
      'El corte muestra la profundidad real de la zanja de MT según el modelo.',
      'La vista isométrica está aislada sin elementos de otras disciplinas visibles.',
      'Existen notas constructivas de capas de relleno y señalización de la zanja.',
      'El callout en planta referencia correctamente la lámina de detalle.',
    ],
    notasIngenieria: [
      {
        texto:
          'Las profundidades y señalización de zanjas de MT suelen estar sujetas a los requisitos del Operador de Red y al RETIE para instalaciones de media tensión; confirmar el detalle tipo vigente con el operador antes de radicar.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa el comando 'Cuadro de sección' en la vista 3D y gira el ViewCube a la posición isométrica estándar (SO) antes de bloquear la vista.",
      "Activa 'Aislar elementos temporalmente' para depurar la vista 3D antes de convertirla en vista permanente.",
      "Usa 'Vista de detalle callout' (Ver > Detalle) en lugar de un callout normal para tener control de escala independiente.",
    ],
  },
  {
    plantillaId: 'PB-06-03',
    nombreOriginal: 'Plano de cuarto de subestación (planta, cortes e isométricos)',
    nombre: 'Documentar el plano del cuarto de subestación en planta, cortes e isométricos',
    grupo: '06-entregables',
    subgrupo: 'Entregables Operador de Red',
    categoria: 'Documentación',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-01-01', 'PB-02-01', 'PB-01-02'],
    guiaIds: ['M5.1', 'M3.1'],
    descripcion:
      'Documenta el cuarto de subestación completo con vista en planta, cortes e isométricos, cumpliendo el listado de planos exigido por el Operador de Red.',
    objetivo:
      'Entregar el plano del cuarto de subestación con la información gráfica que exige el Operador de Red para su revisión y aprobación.',
    requisitos: [
      'Definición de subestación (PB-01-01)',
      'Modelado de redes de media tensión (PB-02-01)',
      'Ubicación de espacios técnicos (PB-01-02)',
    ],
    procedimiento: [
      'Duplicar la vista de planta del nivel de la subestación y renombrarla como plano de cuarto de subestación.',
      'Configurar el rango de vista para mostrar equipos, transformador y accesos del cuarto.',
      'Crear dos cortes transversales que atraviesen el transformador y las celdas de MT.',
      'Generar una vista 3D isométrica del cuarto con el cuadro de sección limitado al recinto.',
      'Anotar dimensiones mínimas de circulación, altura libre y distancias de seguridad a equipos.',
      'Insertar planta, cortes e isométrico en la lámina y completar el cajetín del paquete OR.',
      'Verificar contra el modelo que puertas, rejillas de ventilación y fosos estén representados.',
    ],
    resultadoEsperado:
      'Lámina del cuarto de subestación con planta, cortes e isométricos, dimensionada y lista para revisión del Operador de Red.',
    criteriosVerificacion: [
      'La planta muestra transformador, celdas de MT, tablero de BT y accesos del cuarto.',
      'Los dos cortes atraviesan el transformador y las celdas de MT.',
      'La vista isométrica está limitada al recinto de la subestación sin elementos externos.',
      'Las distancias de seguridad y circulación están acotadas en la lámina.',
      'El cajetín de la lámina está completo con datos del proyecto.',
    ],
    notasIngenieria: [
      {
        texto:
          'El diseño y las distancias de seguridad del cuarto de subestación deben cumplir los requisitos de subestaciones eléctricas del RETIE; verificar los valores exactos vigentes con el ingeniero eléctrico responsable antes de radicar el entregable.',
        fuente: 'RETIE',
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa 'Rango de vista' (Propiedades de vista > Extensión de vista) para recortar el nivel superior del cuarto y evitar que la losa de entrepiso oculte el transformador.",
      "Nombra los cortes con el prefijo 'SE-' para agruparlos en el navegador de proyecto junto a la planta de subestación.",
      "Usa 'Etiquetas de categoría de espacio' para verificar que el área libre de circulación cumple el mínimo definido en el proyecto.",
    ],
  },
  {
    plantillaId: 'PB-06-04',
    nombreOriginal: 'Modelo de dámper',
    nombre: 'Modelar el dámper de ventilación de la subestación para el entregable del operador de red',
    grupo: '06-entregables',
    subgrupo: 'Entregables Operador de Red',
    categoria: 'Modelado',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-02-17', 'PB-01-01'],
    guiaIds: ['M5.1', 'M2.1'],
    descripcion:
      'Modela el dámper de ventilación de la subestación con las dimensiones calculadas, integrándolo al modelo del cuarto de subestación para el entregable del Operador de Red.',
    objetivo: 'Incorporar al modelo BIM el dámper de ventilación dimensionado para la subestación.',
    requisitos: [
      'Cálculo del dámper terminado (PB-02-17)',
      'Definición de subestación (PB-01-01)',
    ],
    procedimiento: [
      'Cargar o crear la familia de dámper con parámetros de ancho, alto y tipo de lámina.',
      'Ubicar la familia en el muro o losa del cuarto de subestación según el cálculo de ventilación.',
      'Asignar los parámetros de dimensión calculados en PB-02-17 al ejemplar insertado.',
      'Verificar la orientación del dámper respecto al flujo de aire de entrada y salida.',
      'Alojar el elemento (host) correctamente al muro o losa para que se mueva con la estructura.',
      'Revisar interferencias del dámper con ductos, bandejas o estructura cercana.',
    ],
    resultadoEsperado:
      'Dámper de ventilación modelado en el cuarto de subestación, con las dimensiones del cálculo y correctamente alojado al elemento anfitrión.',
    criteriosVerificacion: [
      'El dámper está insertado en el modelo con las dimensiones exactas del cálculo PB-02-17.',
      'El elemento está alojado a un muro o losa y se mueve al desplazar el anfitrión.',
      'No existen interferencias entre el dámper y otros elementos MEP en el modelo.',
      'La orientación del dámper corresponde al sentido de ventilación definido en el cálculo.',
    ],
    notasIngenieria: [
      {
        texto:
          'La ventilación de cuartos de subestación con transformadores tipo seco u ONAN suele estar sujeta a los requisitos de ventilación del RETIE para subestaciones; confirmar el criterio de dimensionamiento aplicado en PB-02-17 antes de dar por válido el modelo.',
        fuente: 'RETIE',
        verificar: true,
      },
    ],
    tipsRevit: [
      'Usa una familia basada en cara (Face-based) o alojada en muro según el detalle constructivo real del dámper.',
      "Verifica el parámetro 'Anfitrión' del elemento en Propiedades para confirmar que quedó alojado y no flotando en el espacio.",
      "Corre 'Verificación de interferencias' (Colaborar > Verificar interferencias) entre la categoría del dámper y Ductos/Estructura antes de cerrar la tarea.",
    ],
  },
  {
    plantillaId: 'PB-06-05',
    nombreOriginal: 'Modelo de cárcamos y fosos de aceite',
    nombre: 'Modelar los cárcamos y fosos de aceite de la subestación para el entregable del operador de red',
    grupo: '06-entregables',
    subgrupo: 'Entregables Operador de Red',
    categoria: 'Modelado',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-01-05', 'PB-01-01'],
    guiaIds: ['M5.1', 'M2.1'],
    descripcion:
      'Modela los cárcamos de cableado y los fosos de recolección de aceite del transformador en el cuarto de subestación, según las dimensiones predimensionadas.',
    objetivo:
      'Incorporar al modelo BIM los cárcamos y fosos de aceite requeridos para el entregable de subestación al Operador de Red.',
    requisitos: [
      'Cárcamos predimensionados (PB-01-05)',
      'Definición de subestación (PB-01-01)',
    ],
    procedimiento: [
      'Modelar los cárcamos como elementos de piso rebajado (Losa) o familia de cárcamo con las dimensiones predimensionadas.',
      'Ubicar el trazado de los cárcamos siguiendo el recorrido de cables de media y baja tensión dentro del cuarto.',
      'Modelar el foso de aceite bajo el transformador con la capacidad de retención definida en el proyecto.',
      'Asignar los materiales de acabado (rejilla, tapa, grava) a cada elemento según la especificación.',
      'Verificar que la profundidad de los cárcamos permita el radio de curvatura de los conductores alojados.',
      'Revisar interferencias entre cárcamos, foso de aceite y la cimentación del cuarto de subestación.',
    ],
    resultadoEsperado:
      'Cárcamos y foso de aceite modelados en el cuarto de subestación, con dimensiones y materiales correctos, sin interferencias con la cimentación.',
    criteriosVerificacion: [
      'Los cárcamos siguen el recorrido de cableado planificado dentro del cuarto de subestación.',
      'El foso de aceite está ubicado bajo el transformador con la capacidad de retención definida.',
      'Los elementos tienen asignados los materiales de acabado especificados.',
      'No hay interferencias entre cárcamos, foso de aceite y elementos estructurales.',
    ],
    notasIngenieria: [
      {
        texto:
          'La capacidad de retención de aceite del foso bajo el transformador suele estar sujeta a los requisitos de subestaciones del RETIE; verificar el volumen mínimo exigido con el ingeniero eléctrico antes de fijar las dimensiones definitivas.',
        fuente: 'RETIE',
        verificar: true,
      },
    ],
    tipsRevit: [
      "Modela el cárcamo como una familia de piso por tramo (Suelo) con función 'Rebajado' para que quede asociado al nivel del cuarto de subestación.",
      "Usa el parámetro 'Compensación desde el nivel' en Propiedades del piso para fijar la profundidad exacta del cárcamo.",
      "Corre 'Verificación de interferencias' entre la categoría Suelos y Cimentación antes de cerrar la tarea.",
    ],
  },
  {
    plantillaId: 'PB-06-06',
    nombreOriginal: 'Plano de SPT (planta, cortes e isométricos)',
    nombre: 'Documentar el plano del sistema de puesta a tierra en planta, cortes e isométricos',
    grupo: '06-entregables',
    subgrupo: 'Entregables Operador de Red',
    categoria: 'Documentación',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-02-08', 'PB-02-07'],
    guiaIds: ['M5.6', 'M3.1'],
    descripcion:
      'Documenta el sistema de puesta a tierra (SPT) del proyecto con vista en planta, cortes e isométricos para el paquete de entrega al Operador de Red.',
    objetivo: 'Producir el plano del sistema de puesta a tierra exigido en el paquete de entregables OR.',
    requisitos: [
      'Malla de puesta a tierra modelada (PB-02-08)',
      'Caja de puesta a tierra en armarios modelada (PB-02-07)',
    ],
    procedimiento: [
      'Duplicar la vista de planta del nivel donde se ubica la malla de puesta a tierra y renombrarla como plano de SPT.',
      'Activar la categoría "Sistema de puesta a tierra" o la disciplina correspondiente en la plantilla de vista.',
      'Anotar los electrodos, conductores de malla y puntos de medición con sus etiquetas de calibre.',
      'Crear un corte que muestre la profundidad de enterramiento de la malla y las cajas de inspección.',
      'Generar una vista isométrica del recorrido de la malla y sus conexiones a la caja de puesta a tierra de armarios.',
      'Insertar planta, corte e isométrico en la lámina y completar el cajetín del paquete OR.',
    ],
    resultadoEsperado:
      'Lámina del sistema de puesta a tierra con planta, corte e isométrico, anotada con calibres y profundidades, lista para el paquete OR.',
    criteriosVerificacion: [
      'La planta muestra el trazado completo de la malla de puesta a tierra y sus electrodos.',
      'El corte indica la profundidad de enterramiento de la malla.',
      'La vista isométrica muestra la conexión entre la malla y la caja de puesta a tierra de armarios.',
      'Todos los conductores de la malla tienen etiqueta de calibre visible.',
    ],
    notasIngenieria: [
      {
        texto:
          'El diseño del sistema de puesta a tierra está sujeto a los requisitos de puesta a tierra del RETIE; verificar el valor de resistencia de puesta a tierra exigido y la profundidad mínima de enterramiento con el ingeniero eléctrico antes de radicar el entregable.',
        fuente: 'RETIE',
        verificar: true,
      },
    ],
    tipsRevit: [
      "Modela los conductores de la malla como 'Conductores eléctricos' con el sistema clasificado como 'Puesta a tierra' para poder filtrarlos por disciplina en la plantilla de vista.",
      "Usa 'Rango de vista' con el corte inferior extendido por debajo del nivel de piso para que la malla enterrada sea visible en planta.",
      'Etiqueta la profundidad de enterramiento con una cota de elevación (Elevation Spot) en el corte.',
    ],
  },
  {
    plantillaId: 'PB-06-07',
    nombreOriginal: 'Plano de baja tensión desde SE hasta armarios medidores (plantas, cortes e isométricos)',
    nombre: 'Documentar la red de baja tensión desde la subestación hasta los armarios de medidores',
    grupo: '06-entregables',
    subgrupo: 'Entregables Operador de Red',
    categoria: 'Documentación',
    disciplina: 'Eléctrica',
    dificultad: 3,
    dependeDe: ['PB-02-02', 'PB-01-01'],
    guiaIds: ['M5.2', 'M3.1'],
    descripcion:
      'Documenta la red de baja tensión desde la subestación hasta los armarios de medidores, con vistas de planta, cortes e isométricos para el paquete de entrega OR.',
    objetivo:
      'Producir el plano de distribución de baja tensión entre subestación y armarios de medidores exigido por el Operador de Red.',
    requisitos: [
      'Modelado de redes de baja tensión (PB-02-02)',
      'Definición de subestación (PB-01-01)',
    ],
    procedimiento: [
      'Duplicar las vistas de planta de los niveles por donde transcurre la red de BT hasta los armarios de medidores.',
      'Aplicar la plantilla de vista "Baja Tensión - OR" y filtrar por el sistema de distribución BT.',
      'Anotar los tramos con calibre de conductor, tipo de canalización y longitud.',
      'Crear cortes verticales que muestren el recorrido de la acometida BT entre niveles hasta los armarios.',
      'Generar una vista isométrica del tramo vertical de BT con las derivaciones a cada armario medidor.',
      'Insertar plantas, cortes e isométrico en las láminas del paquete OR y completar los cajetines.',
      'Verificar que cada armario medidor quede identificado con su número de circuito de origen.',
    ],
    resultadoEsperado:
      'Láminas de baja tensión desde subestación hasta armarios medidores, con plantas, cortes e isométricos completos y anotados, listas para el paquete OR.',
    criteriosVerificacion: [
      'Las plantas muestran el recorrido completo de BT desde la subestación hasta cada armario medidor.',
      'Los cortes verticales muestran el tramo vertical de la acometida BT entre niveles.',
      'La vista isométrica muestra las derivaciones a cada armario medidor identificadas.',
      'Cada tramo de conductor tiene etiqueta de calibre y tipo de canalización.',
      'Cada armario medidor tiene asociado su número de circuito de origen.',
    ],
    notasIngenieria: [
      {
        texto:
          'La distribución de baja tensión hasta los armarios de medidores está sujeta a los requisitos de acometidas del RETIE y a las normas particulares del Operador de Red; verificar el listado de planos y el criterio de identificación de circuitos exigido antes de radicar.',
        fuente: 'RETIE',
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa el comando 'Copiar/Monitorear' en la pestaña Colaborar para mantener alineadas las plantas de BT con los niveles del arquitectónico vinculado.",
      "Agrupa las vistas verticales del tramo de acometida usando una vista 3D con 'Cuadro de sección' limitado al ducto vertical de acometidas.",
      "Usa el parámetro compartido 'Número de circuito' en la familia de armario medidor para que aparezca en la etiqueta de la vista.",
    ],
  },
  {
    plantillaId: 'PB-06-08',
    nombreOriginal: '',
    nombre: 'Exportar el paquete de planos del entregable a PDF y DWG para su radicación',
    grupo: '06-entregables',
    subgrupo: 'Exportaciones',
    categoria: 'Documentación',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-06-01', 'PB-06-03', 'PB-06-07'],
    guiaIds: ['M3.1', 'M9.4'],
    descripcion:
      'Exporta el conjunto completo de planos del entregable del Operador de Red a formatos PDF y DWG, con la nomenclatura y organización exigida para la radicación.',
    objetivo: 'Generar los archivos PDF y DWG del paquete de entregables OR listos para radicar.',
    requisitos: [
      'Planos del paquete OR terminados (PB-06-01 a PB-06-07)',
      'Conjunto de láminas organizado en un set de impresión',
    ],
    procedimiento: [
      'Crear un "Conjunto de láminas" (Sheet Set) con todas las láminas del paquete de entrega OR.',
      'Configurar la exportación a PDF combinando todas las láminas en un solo archivo con la numeración correcta.',
      'Revisar la configuración de exportación DWG (versión de AutoCAD, capas por categoría) según el estándar del Operador de Red.',
      'Exportar el conjunto de láminas a DWG, un archivo por lámina, con la nomenclatura acordada.',
      'Verificar que los PDF y DWG exportados abran sin errores y conserven textos y cotas legibles.',
      'Archivar los exportados en la carpeta de entrega del proyecto con control de versión.',
    ],
    resultadoEsperado:
      'Archivos PDF y DWG de todas las láminas del paquete OR exportados, nombrados según el estándar acordado y archivados en la carpeta de entrega.',
    criteriosVerificacion: [
      'Existe un PDF combinado con todas las láminas del paquete OR en el orden correcto.',
      'Existe un archivo DWG por cada lámina exportada, sin geometría faltante.',
      'Los archivos exportados abren sin errores en un visor externo.',
      'La nomenclatura de los archivos exportados coincide con el estándar de nombres del proyecto.',
    ],
    notasIngenieria: [
      {
        texto:
          'Cada Operador de Red puede exigir un estándar propio de nomenclatura y capas DWG para la radicación de planos; confirmar el estándar vigente con el operador antes de exportar el paquete final.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa 'Exportar > PDF' con la opción 'Combinar varias hojas en un archivo' para generar el PDF único del conjunto de láminas.",
      "En 'Exportar > Opciones > Exportar a DWG/DXF', configura las asignaciones de capas por categoría antes de exportar para cumplir el estándar del operador.",
      "Usa un 'Conjunto de láminas' (Ver > Hojas) para reutilizar la misma selección de láminas en cada exportación sin volver a seleccionarlas manualmente.",
    ],
    nuevo: true,
  },
  {
    plantillaId: 'PB-06-09',
    nombreOriginal: '',
    nombre: 'Publicar el paquete de entrega final y registrar el acta de entrega firmada',
    grupo: '06-entregables',
    subgrupo: 'Entrega al cliente',
    categoria: 'Entrega',
    disciplina: 'Eléctrica',
    dificultad: 2,
    dependeDe: ['PB-06-08'],
    guiaIds: ['M9.4', 'M9.3'],
    descripcion:
      'Publica el paquete de entrega final del proyecto en la plataforma y registra el acta de entrega firmada por el cliente y el Operador de Red.',
    objetivo: 'Cerrar formalmente la entrega del paquete OR con el acta firmada y el archivo publicado.',
    requisitos: [
      'Exportaciones PDF y DWG del paquete OR terminadas (PB-06-08)',
      'Acta de entrega en formato acordado con el cliente',
    ],
    procedimiento: [
      'Subir los archivos PDF y DWG exportados a la carpeta o plataforma de entrega del proyecto.',
      'Completar el acta de entrega con el listado de planos, versión y fecha de radicación.',
      'Enviar el acta al cliente y al Operador de Red para firma de recibido.',
      'Registrar la respuesta firmada (física o digital) en la plataforma de seguimiento del proyecto.',
      'Marcar el estado del paquete de entrega como "Publicado" en la plataforma de gestión.',
      'Notificar al equipo del proyecto el cierre de la entrega con el enlace al acta firmada.',
    ],
    resultadoEsperado:
      'Paquete de entrega publicado en la plataforma con el acta de entrega firmada y registrada, y el estado del entregable marcado como cerrado.',
    criteriosVerificacion: [
      'Los archivos del paquete OR están publicados en la carpeta o plataforma de entrega.',
      'El acta de entrega contiene el listado completo de planos con versión y fecha.',
      'El acta de entrega está firmada por el cliente o el Operador de Red.',
      'El estado del entregable en la plataforma de gestión está marcado como publicado.',
    ],
    notasIngenieria: [
      {
        texto:
          'El formato y los requisitos del acta de entrega ante el Operador de Red pueden variar según el operador y el municipio; verificar el formato exigido antes de radicar el cierre.',
        fuente: null,
        verificar: true,
      },
    ],
    tipsRevit: [
      "Usa un parámetro compartido de 'Estado de entrega' en la hoja de proyecto o en un panel de control externo a Revit para reflejar el cierre del paquete.",
      "Mantén el archivo central de Revit sincronizado y crea un 'Archivo de respaldo' (Guardar como > Opciones > Hacer un respaldo) inmediatamente después de publicar la entrega final.",
      "Exporta un 'Registro de revisiones' de la lámina (Revisiones en la lámina) para adjuntarlo como respaldo del acta de entrega.",
    ],
    nuevo: true,
  },
];
