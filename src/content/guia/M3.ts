import type { Leccion } from '../../types';

export const M3_LECCIONES: Leccion[] = [
  {
    id: 'M3.1',
    titulo: 'De modelo a plano: el flujo correcto',
    minutos: 15,
    queEs:
      'Es el flujo de trabajo modelo → vista → lámina en Revit: las vistas de planta, sección y detalle se generan a partir del modelo BIM y luego se colocan dentro de rótulos (Title Blocks) en láminas (Sheets) para producir los planos de entrega. No es dibujar líneas 2D sueltas encima de una planta, sino configurar cómo el modelo se "recorta" y se presenta.',
    paraQueSirve:
      'Garantiza que cada plano entregado sea siempre un reflejo fiel y actualizado del modelo eléctrico, evitando duplicar trabajo de dibujo manual. Cuando el modelo cambia (se mueve un tablero, se corrige un circuito), el cambio se propaga automáticamente a todas las vistas y láminas donde ese elemento aparece.',
    cuandoUsarlo:
      'Al iniciar la fase de documentación de un proyecto ya modelado, cuando hay que generar la primera tanda de planos eléctricos, o cuando se necesita reorganizar el sistema de vistas y láminas de un proyecto en curso porque creció el alcance.',
    procedimiento: [
      'Verificar que el modelo eléctrico esté completo y sin warnings críticos antes de crear vistas de documentación.',
      'Duplicar la vista de planta base como "Duplicar" o "Dependiente" según si la planta se va a segmentar en varias láminas.',
      'Aplicar la plantilla de vista (View Template) correspondiente para fijar visibilidad de categorías, escala y grafismo de forma consistente.',
      'Ajustar el Crop Region y el Annotation Crop para mostrar en la vista solo lo que corresponde a esa lámina.',
      'Seleccionar el rótulo (Title Block) del proyecto y arrastrar la vista dentro del Sheet correspondiente.',
      'Verificar escala, orientación de norte y numeración de la lámina según el estándar de numeración del proyecto.',
      'Bloquear la posición de la vista dentro del viewport para que no se desplace al reordenar el layout de la lámina.',
      'Actualizar la tabla de índice de planos (Sheet List schedule) para que refleje la nueva lámina creada.',
    ],
    erroresFrecuentes: [
      'Dibujar anotaciones o líneas de detalle directamente sobre la vista de planta en lugar de resolverlas en el modelo, generando desincronización con la realidad del proyecto.',
      'Colocar la misma vista en más de una lámina sin duplicarla primero, lo que Revit no permite y obliga a duplicar tarde y mal.',
      'No aplicar una plantilla de vista, dejando que cada vista tenga visibilidad, escala y grafismo distintos dentro del mismo set de planos.',
      'No bloquear el Crop Region antes de ajustar escalas, provocando que el recorte cambie y descuadre el contenido dentro de la lámina.',
    ],
    buenasPracticas: [
      'Definir la convención de nombres de vistas y láminas antes de generar el primer plano del proyecto.',
      'Usar vistas dependientes para dividir plantas grandes en varias láminas conservando sincronización total con el modelo.',
      'Mantener un catálogo de plantillas de vista por tipo y escala (planta general, planta de detalle, unifilar) reutilizable entre proyectos.',
      'Revisar periódicamente el Sheet List schedule para detectar láminas huérfanas, duplicadas o sin vista asignada.',
    ],
    ejemploAplicado:
      'En la tarea "Generar la planimetría eléctrica general del proyecto a partir del modelo" (PB-03-08) se aplica este flujo completo: se parte del modelo eléctrico ya coordinado, se generan las vistas de planta por nivel, se les aplica la plantilla de vista del estudio, se recortan y se colocan dentro de los rótulos de las láminas de entrega, en lugar de redibujar la planta desde cero en 2D.',
    tareasRelacionadas: ['PB-03-08', 'PB-03-01'],
  },
  {
    id: 'M3.2',
    titulo: 'Plantillas de vista y filtros',
    minutos: 15,
    queEs:
      'Las plantillas de vista (View Templates) son configuraciones guardadas de visibilidad/gráficos, escala y nivel de detalle que se aplican a una vista de una sola vez. Los filtros de vista (Filters) son reglas basadas en parámetros de los elementos (por ejemplo, nivel de tensión o tipo de circuito) que permiten resaltar, colorear u ocultar elementos dentro de una vista o plantilla.',
    paraQueSirve:
      'Estandarizan la apariencia de los planos entre vistas y entre proyectos, reducen drásticamente el tiempo de configuración manual vista por vista, y aseguran que todo el equipo del estudio entregue planos con el mismo lenguaje gráfico.',
    cuandoUsarlo:
      'Al configurar el set de plantillas de un proyecto nuevo, al construir la biblioteca reutilizable de plantillas del estudio, o cuando se necesita diferenciar visualmente elementos según un criterio técnico, como distinguir circuitos de media tensión de los de baja tensión dentro de la misma vista.',
    procedimiento: [
      'Identificar los tipos de vista recurrentes del estudio (planta general, planta de tablero, unifilar, detalle) y qué grafismo requiere cada uno.',
      'Configurar una vista de referencia ajustando Visibility/Graphics Overrides (VV) por categoría y subcategoría de elementos eléctricos.',
      'Crear filtros basados en parámetros de tipo o ejemplar (por ejemplo "Voltaje = 13.2kV") y asignarles reglas de override de línea, color o patrón.',
      'Guardar la configuración como View Template desde View > View Templates > Create Template from View.',
      'Definir explícitamente qué parámetros quedan controlados por la plantilla ("incluidos") y cuáles se dejan libres para ajuste puntual en cada vista.',
      'Aplicar la plantilla a al menos dos vistas distintas y validar que el resultado sea consistente antes de escalarla al resto del proyecto.',
      'Guardar las plantillas y filtros dentro del archivo de plantilla de proyecto (.rte) del estudio para reutilizarlos en proyectos futuros.',
    ],
    erroresFrecuentes: [
      'Bloquear demasiados parámetros dentro de la plantilla, impidiendo ajustes legítimos que cada vista necesita puntualmente.',
      'Crear filtros redundantes o con reglas contradictorias entre sí, que producen resultados de grafismo inconsistentes.',
      'No documentar qué controla cada plantilla, obligando a rehacer el trabajo de análisis cada vez que cambia el equipo del proyecto.',
      'Aplicar una plantilla y luego sobreescribir manualmente el grafismo de una vista puntual, rompiendo la estandarización sin que nadie lo note.',
    ],
    buenasPracticas: [
      'Nombrar plantillas y filtros con una convención clara, por ejemplo "disciplina_tipo_escala".',
      'Mantener una plantilla maestra versionada dentro del archivo de plantilla de proyecto del estudio.',
      'Basar los filtros en parámetros compartidos consistentes en todas las familias eléctricas, no en parámetros de tipo aislados.',
      'Auditar y depurar filtros y plantillas no usados de forma periódica para no acumular deuda de configuración.',
    ],
    ejemploAplicado:
      'La tarea "Construir la biblioteca de plantillas de vista reutilizables del estudio" (PB-08-02) consiste exactamente en esto: se definen plantillas separadas para planta de iluminación, planta de tomas y fuerza, y unifilar, cada una con sus propios filtros de categoría y overrides, listas para aplicarse en cualquier proyecto nuevo del estudio.',
    tareasRelacionadas: ['PB-08-02', 'PB-03-08'],
  },
  {
    id: 'M3.3',
    titulo: 'Rótulos, etiquetas y parámetros de anotación',
    minutos: 15,
    queEs:
      'Las etiquetas (Tags) leen y muestran en el plano el valor de un parámetro del elemento (número de circuito, calibre de conductor, potencia) de forma automática y vinculada al modelo, a diferencia de un texto libre (Text Note) escrito a mano. Detrás de cada etiqueta hay un parámetro compartido, de tipo o de ejemplar que alimenta el "Label" dentro de la familia de etiqueta.',
    paraQueSirve:
      'Permite comunicar en el plano datos técnicos críticos (calibre, circuito, carga en VA) de forma automática y siempre sincronizada con el modelo, eliminando el riesgo de que el texto en el plano quede desactualizado respecto al elemento real.',
    cuandoUsarlo:
      'Al documentar circuitos, calibres de conductor o tableros en planos de distribución que deben mostrar valores técnicos trazables al modelo, por ejemplo al anotar un plano de red de baja tensión con los calibres y números de circuito de cada tramo.',
    procedimiento: [
      'Verificar que el parámetro que se quiere mostrar exista como parámetro compartido y esté correctamente asociado a la familia del conector, circuito o tablero.',
      'Crear o editar la familia de etiqueta (Tag family) e insertar el Label con el parámetro correspondiente.',
      'Cargar la etiqueta en el proyecto y usar "Tag All Not Tagged" o etiquetar manualmente elemento por elemento.',
      'Configurar el formato del parámetro (unidades, redondeo) en Project Units para que la etiqueta muestre el valor con el formato esperado.',
      'Ajustar el leader (línea de referencia) y la orientación de cada etiqueta para que sea legible a la escala real del plano.',
      'Verificar que la etiqueta se actualice dinámicamente probando un cambio real de calibre o número de circuito en el modelo.',
      'Revisar zonas densas de anotación y reubicar etiquetas superpuestas manualmente sin desvincularlas del elemento que representan.',
    ],
    erroresFrecuentes: [
      'Usar Text Note en lugar de una etiqueta paramétrica, lo que rompe la sincronización con el modelo apenas cambia el valor real.',
      'Etiquetar con un parámetro que no está definido en todas las instancias del proyecto, dejando etiquetas vacías o con signos de interrogación.',
      'No unificar el parámetro compartido entre familias distintas, obligando a mantener etiquetas separadas por cada tipo de familia.',
      'Dejar etiquetas superpuestas o fuera del Crop Region, invisibles al momento de imprimir o exportar el plano final.',
    ],
    buenasPracticas: [
      'Centralizar los parámetros de anotación en un único archivo de parámetros compartidos del estudio.',
      'Probar cada etiqueta con valores extremos (número largo, texto largo) para detectar desbordes antes de la entrega.',
      'Activar "Tag on Placement" al modelar circuitos y equipos para no dejar elementos sin etiquetar.',
      'Mantener una biblioteca de familias de etiqueta estándar del estudio, coherente con la gestión de familias descrita en el módulo M4.',
    ],
    ejemploAplicado:
      'En la tarea "Elaborar el plano de la red de distribución en baja tensión del proyecto" (PB-03-12), cada tramo de la red se anota con etiquetas paramétricas que muestran el calibre del conductor y el número de circuito, tomados directamente de los parámetros compartidos del modelo, no escritos a mano.',
    tareasRelacionadas: ['PB-03-12', 'PB-03-14'],
  },
  {
    id: 'M3.4',
    titulo: 'Detalles y vistas de detalle',
    minutos: 15,
    queEs:
      'Los detalles constructivos en Revit se documentan con Detail Views o Callouts (vistas que recortan y amplían una zona del modelo 3D con alto nivel de detalle) o con Drafting Views (vistas 2D puras, sin vínculo al modelo 3D, dibujadas desde cero). Ambas sirven para mostrar información constructiva que no es práctico modelar en 3D a esa escala.',
    paraQueSirve:
      'Permite documentar información constructiva de alto detalle -anclajes, secciones de ductos, conexiones a tierra- que la planta general no puede mostrar con claridad, cumpliendo requisitos normativos y de obra sin saturar el plano general.',
    cuandoUsarlo:
      'Al documentar detalles constructivos de sistemas especiales como apantallamiento o puesta a tierra, o de zonas con alta densidad de instalaciones como cuartos técnicos, escaleras o cuartos de máquinas de ascensores, que requieren mayor nivel de detalle que la planta general.',
    procedimiento: [
      'Determinar si el detalle requiere un corte real del modelo 3D (Callout / Detail View) o es puramente esquemático (Drafting View).',
      'Si es un Callout, crearlo desde la vista de planta o sección padre con la escala apropiada, típicamente 1:10 o 1:20.',
      'Ajustar el Detail Level a "Fine" y configurar Visibility/Graphics para mostrar solo las categorías relevantes a ese detalle.',
      'Complementar con componentes 2D -Detail Lines, Detail Components, Filled Regions- lo que el modelo 3D no resuelve por sí solo.',
      'Anotar el detalle con etiquetas, notas y dimensiones específicas de esa vista.',
      'Vincular el Callout a la vista padre para que quien lea la planta pueda ubicar el detalle correspondiente.',
      'Colocar el detalle en la lámina correspondiente y verificar que la referencia cruzada muestre el número correcto de lámina y detalle.',
    ],
    erroresFrecuentes: [
      'Dibujar el detalle completo como Drafting View cuando podía derivarse del modelo real, perdiendo trazabilidad ante cualquier cambio posterior.',
      'Olvidar vincular el Callout a la vista padre, dejando referencias "huérfanas" que confunden en obra.',
      'Sobrecargar el detalle con información no esencial, dificultando su lectura rápida en campo.',
      'No ajustar la escala del detalle al nivel de zoom real usado en la lámina, generando anotaciones desproporcionadas respecto al dibujo.',
    ],
    buenasPracticas: [
      'Mantener una biblioteca de Drafting Views típicos reutilizables entre proyectos, por ejemplo el detalle estándar de puesta a tierra.',
      'Usar Detail Groups para detalles que se repiten en varias ubicaciones del mismo proyecto.',
      'Diferenciar claramente en el nombre de la vista si es un Callout derivado del modelo o un Drafting View independiente.',
      'Revisar que toda referencia cruzada (callout tag) apunte a una lámina realmente publicada, no a una vista huérfana sin colocar.',
    ],
    ejemploAplicado:
      'La tarea "Elaborar el plano de detalles constructivos del sistema de apantallamiento" (PB-03-11) requiere exactamente este trabajo: se crean Callouts y Drafting Views para mostrar el anclaje del conductor de bajada, la conexión al electrodo de puesta a tierra y la arqueta de inspección, referenciados desde la planta general de apantallamiento.',
    tareasRelacionadas: ['PB-03-11', 'PB-03-17'],
  },
  {
    id: 'M3.5',
    titulo: 'Tablas de planificación y cuantificaciones',
    minutos: 16,
    queEs:
      'Las Schedules (tablas de planificación) son tablas generadas directamente desde el modelo que extraen parámetros de los elementos -equipos, circuitos, tableros- para listarlos, contarlos o calcular valores agregados, como un panel schedule o un listado de equipos.',
    paraQueSirve:
      'Automatiza los cómputos de cantidades y los listados técnicos directamente desde el modelo, garantizando que los conteos y valores de carga se mantengan sincronizados cuando el modelo cambia, en lugar de recontar manualmente con el riesgo de error que eso implica.',
    cuandoUsarlo:
      'Al necesitar un cómputo de cantidades para compras, al verificar cargas conectadas o de demanda para el dimensionamiento de un transformador, o al producir cuadros de tablero (panel schedules) para la documentación eléctrica.',
    procedimiento: [
      'Definir qué categoría de elemento se va a cuantificar (Electrical Equipment, Electrical Fixtures, Circuits) y qué campos se necesitan.',
      'Crear la tabla desde View > Schedules > Schedule/Quantities seleccionando la categoría correspondiente.',
      'Agregar los campos (Fields) requeridos: parámetros de tipo, de ejemplar y campos calculados.',
      'Configurar filtros de la tabla para limitar el resultado a un nivel, fase o sistema específico.',
      'Configurar el ordenamiento y agrupamiento (Sorting/Grouping) con totales, para obtener subtotales por tablero, nivel o tipo de carga.',
      'Agregar campos calculados (Calculated Value) cuando se necesite, por ejemplo sumar cargas conectadas o aplicar un factor de demanda.',
      'Formatear la tabla -encabezados, ancho de columnas- para que sea legible al exportarla o colocarla en una lámina.',
      'Colocar la tabla en la lámina y validar que se actualice al modificar cantidades o cargas en el modelo, probando con un cambio real.',
    ],
    erroresFrecuentes: [
      'Confundir la Schedule con una hoja de cálculo exportada y editar valores directamente en la tabla en lugar de corregir el modelo.',
      'Olvidar aplicar el filtro de fase, mezclando en el conteo elementos demolidos o de fases futuras del proyecto.',
      'No usar campos calculados para el factor de demanda, obligando a recalcularlo manualmente fuera de Revit y perdiendo trazabilidad.',
      'Dejar la tabla sin agrupar por tablero o nivel, dificultando la verificación de totales durante la revisión.',
    ],
    buenasPracticas: [
      'Guardar tablas de planificación estándar como schedule templates dentro del archivo de plantilla del estudio.',
      'Validar la tabla contra un cálculo manual de muestra antes de confiar en ella para dimensionar equipos.',
      'Usar nombres de parámetros consistentes entre familias para que la misma schedule funcione en distintos proyectos sin reconfigurarla.',
      'Revisar la tabla después de cualquier cambio masivo en el modelo -importaciones, copiar/monitorear- para detectar inconsistencias.',
    ],
    ejemploAplicado:
      'La tarea "Recalcular y verificar la capacidad definitiva del transformador con las cargas del proyecto arquitectónico" (PB-02-16) depende de esto: se construye una tabla de planificación de cargas conectadas por tablero, con un campo calculado que aplica el factor de demanda, y ese resultado alimenta directamente el cálculo de capacidad del transformador.',
    tareasRelacionadas: ['PB-02-16', 'PB-03-03'],
  },
  {
    id: 'M3.6',
    titulo: 'Diagramas unifilares y cuadros de carga',
    minutos: 18,
    queEs:
      'El diagrama unifilar es una representación esquemática de la jerarquía de distribución eléctrica (media tensión, baja tensión, tableros) sin fidelidad geométrica al modelo, generalmente resuelta como Drafting View organizada según la lógica de los Electrical Systems del proyecto. El cuadro de cargas es la tabla que lista, por circuito, la carga conectada y de demanda de cada tablero.',
    paraQueSirve:
      'Comunica de forma clara la topología y jerarquía eléctrica del proyecto -desde la acometida o subestación hasta cada tablero final- para revisión, trámites y construcción, complementando las plantas geométricas con una vista lógica del sistema.',
    cuandoUsarlo:
      'Al documentar el esquema general de distribución de un proyecto (media tensión, baja tensión, tableros) o cuando una planta o tablero necesita un cuadro de cargas que muestre las cargas conectadas y de demanda por circuito.',
    procedimiento: [
      'Levantar la jerarquía real de distribución desde el modelo: origen (subestación o acometida), tableros intermedios y tableros finales.',
      'Definir el enfoque de representación del unifilar: Drafting View esquemático organizado manualmente respetando la jerarquía de los Electrical Systems del modelo.',
      'Dibujar el diagrama respetando fielmente los circuitos y sistemas eléctricos definidos en el modelo, no una interpretación aparte.',
      'Anotar cada tablero con su identificación, capacidad y tipo de alimentación (MT/BT), usando etiquetas ligadas a parámetros reales del panel.',
      'Insertar el panel schedule (tabla de planificación de tableros) asociado a cada tablero para mostrar el cuadro de cargas por circuito.',
      'Verificar que la suma de cargas del cuadro de cargas coincida con la carga total mostrada en el diagrama unifilar.',
      'Formatear el panel schedule -columnas, factor de demanda, fases- según el estándar del estudio y los requisitos RETIE aplicables.',
      'Colocar el diagrama unifilar y los cuadros de carga en sus láminas correspondientes y referenciarlos cruzadamente con las plantas.',
    ],
    erroresFrecuentes: [
      'Dejar que el diagrama unifilar quede desincronizado del modelo real de circuitos después de cambios posteriores en los tableros.',
      'Que el cuadro de cargas tenga totales que no cuadran con el diagrama unifilar por usar fuentes de datos distintas para cada uno.',
      'Omitir el factor de demanda y mostrar solo la carga conectada, lo que produce dimensionamientos erróneos aguas abajo del proyecto.',
      'No indicar con claridad el tipo de corriente y nivel de tensión (MT/BT) en el diagrama, generando ambigüedad en su interpretación.',
    ],
    buenasPracticas: [
      'Mantener el diagrama unifilar como reflejo directo de los Electrical Systems del modelo, no como un dibujo independiente y aparte.',
      'Estandarizar la plantilla de panel schedule del estudio para todos los proyectos: mismas columnas, mismo orden de fases.',
      'Cruzar el cuadro de cargas contra el cálculo de capacidad del transformador antes de entregar la documentación.',
      'Documentar explícitamente el factor de demanda usado por tipo de carga, citando la norma aplicada (RETIE u otra vigente).',
    ],
    ejemploAplicado:
      'La tarea "Elaborar los diagramas unifilares de media tensión, baja tensión y tableros del proyecto" (PB-03-03) es el caso directo: se construye el unifilar completo desde la subestación hasta cada tablero final, con el cuadro de cargas embebido en cada panel schedule, complementado con la tarea "Elaborar el plano de iluminación y tomas de apartamentos con cuadro de cargas y detalle de cocina" (PB-03-14), que exige el mismo tipo de cuadro de cargas a nivel de apartamento.',
    tareasRelacionadas: ['PB-03-03', 'PB-03-14'],
  },
];

export const M3 = {
  id: 'M3',
  nombre: 'Documentación',
  icon: 'ti-file-description',
  nivel: 'Intermedio',
  descripcion:
    'Del modelo eléctrico coordinado a los planos de entrega: el flujo modelo-vista-lámina, plantillas de vista y filtros, etiquetas paramétricas, vistas de detalle, tablas de planificación y cuantificaciones, y la documentación de diagramas unifilares con sus cuadros de carga.',
  lecciones: M3_LECCIONES,
};
