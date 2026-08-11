import type { Leccion } from '../../types';

export const M6_LECCIONES: Leccion[] = [
  {
    id: 'M6.1',
    titulo: 'Vínculos, coordenadas y control de versiones',
    minutos: 15,
    queEs:
      'Es la práctica de vincular (Revit Link) los modelos de arquitectura y estructura al modelo eléctrico y de establecer coordenadas compartidas (Shared Coordinates) para que todos los modelos federados usen el mismo origen, orientación y elevación reales de proyecto. El control de versiones es la disciplina de saber qué versión de cada vínculo está cargada y cuándo se recargó por última vez.',
    paraQueSirve:
      'Permite que el equipo eléctrico trabaje sobre una base arquitectónica y estructural actualizada sin fusionar archivos, que la geometría de todas las disciplinas coincida en el espacio real del proyecto, y que la detección de interferencias y las cotas de coordinación sean confiables en vez de arbitrarias.',
    cuandoUsarlo:
      'Al iniciar el modelo eléctrico del proyecto (primer vínculo y publicación de coordenadas), y cada vez que arquitectura o estructura entregan una nueva versión de su modelo, siempre antes de correr una detección de interferencias o de llegar a una reunión de coordinación.',
    procedimiento: [
      'Insertar > Vincular Revit y seleccionar el archivo arquitectónico, con posicionamiento "Auto - Por coordenadas compartidas" (o "Origen a origen" solo la primera vez, si todavía no existen coordenadas publicadas en el proyecto).',
      'Repetir el vínculo para el modelo estructural con el mismo criterio de posicionamiento.',
      'Si es el primer vínculo del proyecto y no hay coordenadas compartidas aún, usar Administrar > Coordenadas > Publicar coordenadas para adoptar el sistema del modelo maestro (normalmente arquitectura) en el modelo eléctrico.',
      'Verificar con Administrar > Coordenadas > Reportar coordenadas compartidas que el norte de proyecto, la elevación y el ángulo coinciden entre los tres modelos.',
      'En Administrar > Vínculos Revit, configurar la pestaña "Recargar desde" para que apunte a la ruta central del proyecto (servidor/BIM 360), nunca a una copia local.',
      'Definir el criterio de recarga: manual para vínculos que cambian poco, o verificación obligatoria antes de cada sesión de coordinación.',
      'Registrar en una bitácora (o en los comentarios del vínculo) la fecha y versión de cada recarga, para saber qué versión de arquitectura/estructura respalda cada ronda de clash.',
      'Antes de cualquier ronda de detección de interferencias, recargar todos los vínculos y confirmar que no aparecen elementos huérfanos o "no encontrados" por el cambio de versión.',
    ],
    erroresFrecuentes: [
      'Vincular con "Origen a origen" en cada archivo nuevo, acumulando desalineaciones entre disciplinas.',
      'No publicar coordenadas compartidas al inicio del proyecto, dejando que cada disciplina trabaje con su propio origen interno.',
      'Recargar un vínculo a mitad de una sesión de coordinación en curso, invalidando lo que el equipo estaba revisando.',
      'Dejar la ruta de vínculo apuntando a una copia local en vez de la ubicación central del proyecto, rompiendo la recarga para el resto del equipo.',
      'Ignorar el ángulo de norte de proyecto vs. norte verdadero, lo que descuadra cotas y orientación de tableros y rutas eléctricas.',
    ],
    buenasPracticas: [
      'Definir el modelo arquitectónico como "ancla" de coordenadas compartidas desde el día uno del proyecto.',
      'Recargar vínculos justo antes de cada ronda de coordinación, nunca a mitad de una sesión de trabajo.',
      'Dejar registrada la fecha y versión de cada recarga como referencia para auditar clashes resueltos vs. reaparecidos.',
      'Verificar el reporte de coordenadas compartidas cada vez que se recarga un vínculo, no solo la primera vez.',
      'Usar una convención de nombres para las rutas de vínculo (por ejemplo ARQ_vXX.rvt) que refleje la versión recibida.',
    ],
    ejemploAplicado:
      'La tarea PB-01-08 "Vincular los modelos arquitectónico y estructural y establecer coordenadas compartidas" (grupo Archivos y vínculos) es exactamente este procedimiento: al arrancar el modelo eléctrico, el ingeniero BIM vincula ARQ y EST, publica coordenadas compartidas desde el modelo arquitectónico, verifica el reporte de coordenadas y deja documentada la ruta de recarga compartida antes de empezar a modelar tableros y canalizaciones.',
    tareasRelacionadas: ['PB-01-08'],
  },
  {
    id: 'M6.2',
    titulo: 'Detección de interferencias: criterios y tolerancias',
    minutos: 18,
    queEs:
      'Es el uso del complemento de Detección de interferencias (Colisiones) de Revit para comparar categorías de elementos eléctricos contra arquitectura, estructura y HVAC, definiendo de antemano qué pares de categorías se cruzan y con qué margen de tolerancia un solape se considera un choque real y no ruido.',
    paraQueSirve:
      'Encuentra de forma automática cruces geométricos entre bandejas, tuberías, tableros y luminarias con vigas, muros o ductos de HVAC antes de que se conviertan en problemas de obra, evitando reprocesos costosos y retrasos en la instalación.',
    cuandoUsarlo:
      'Después de cada avance significativo de modelado eléctrico y cada vez que se recargan vínculos actualizados de arquitectura, estructura o HVAC; típicamente antes de cada reunión de coordinación semanal o quincenal.',
    procedimiento: [
      'Ir a Colaborar > Detección de interferencias > Ejecutar detección de interferencias.',
      'En "Categoría de este proyecto" seleccionar las categorías eléctricas relevantes (Bandeja de cables, Conducto, Tubería de canalización eléctrica, Equipo eléctrico, Luminarias).',
      'En "Categoría de <vínculo arquitectónico>" seleccionar Muros, Pisos y Estructura de armazón.',
      'Repetir la selección cruzada contra el vínculo estructural (Columnas, Vigas, Losas) y contra el modelo o vínculo de HVAC (Ductos, Tuberías).',
      'Ejecutar y revisar el informe agrupando por par de categorías, para detectar patrones como bandejas cruzando vigas repetidamente en el mismo nivel.',
      'Definir el criterio de tolerancia del proyecto: descartar cruces menores a la holgura constructiva aceptada y marcarlos como "no aplica" en vez de eliminarlos del informe.',
      'Exportar el informe en HTML y guardarlo con fecha, para poder compararlo con la siguiente ronda y ver qué interferencias persisten.',
      'Volver a ejecutar la detección después de cada recarga de vínculos, para confirmar el cierre real de los clashes marcados como resueltos.',
    ],
    erroresFrecuentes: [
      'Seleccionar todas las categorías del proyecto sin filtrar, generando miles de falsos positivos que ocultan los choques críticos.',
      'No definir una tolerancia de proyecto, tratando cada solape mínimo como un conflicto grave.',
      'Ejecutar la detección sobre vínculos desactualizados, reportando clashes que ya fueron resueltos en la última versión de arquitectura.',
      'Sobrescribir el informe anterior en vez de compararlo con el nuevo, perdiendo trazabilidad de qué se resolvió y qué reapareció.',
      'Enfocarse solo en ARQ/EST y omitir HVAC, dejando pasar cruces bandeja-ducto que son de los más comunes en MEP.',
    ],
    buenasPracticas: [
      'Ejecutar la detección por pares de categorías específicas, nunca "todo contra todo".',
      'Documentar la tolerancia aceptada del proyecto según el tipo de elemento antes de la primera ronda.',
      'Archivar cada informe exportado con fecha y versión de vínculos para comparar rondas sucesivas.',
      'Priorizar primero los cruces contra estructura, por ser los más costosos de resolver en obra.',
      'Repetir la corrida después de cada recarga de vínculos, no solo al final del proyecto.',
    ],
    ejemploAplicado:
      'La tarea PB-04-01 "Ejecutar la detección de interferencias entre la instalación eléctrica y arquitectura, estructura y HVAC" (grupo Detección de interferencias) es literalmente este flujo: correr Colaborar > Detección de interferencias con las categorías eléctricas contra ARQ, EST y HVAC, aplicar el criterio de tolerancia del proyecto y exportar el informe HTML que alimenta la clasificación y priorización de conflictos de la siguiente lección.',
    tareasRelacionadas: ['PB-04-01'],
  },
  {
    id: 'M6.3',
    titulo: 'Priorizar y clasificar conflictos',
    minutos: 16,
    queEs:
      'Es el proceso de tomar el informe crudo de interferencias (o los choques identificados en una reunión de coordinación) y clasificar cada conflicto por severidad, disciplina responsable y estado de resolución, convirtiendo una lista plana de cruces geométricos en una lista de trabajo gestionable.',
    paraQueSirve:
      'Evita que el equipo pierda tiempo resolviendo primero conflictos triviales mientras choques estructurales críticos quedan sin atender; da visibilidad de quién debe resolver qué y permite medir el avance de la coordinación ronda a ronda.',
    cuandoUsarlo:
      'Inmediatamente después de exportar un informe de detección de interferencias, o después de una reunión de coordinación donde se identificaron choques directamente sobre el modelo federado.',
    procedimiento: [
      'Abrir el informe de interferencias exportado y revisar cada grupo de cruces, identificando repeticiones que corresponden al mismo problema físico.',
      'Clasificar cada conflicto por severidad: Alta (choca con estructura o bloquea la instalación), Media (requiere reubicar trayectoria pero es viable) o Baja (solape estético o de holgura menor).',
      'Asignar la disciplina responsable de resolverlo: eléctrico reubica bandeja o tubería, o estructura/arquitectura debe modificar su elemento (pase, nicho, hueco).',
      'Registrar cada conflicto como un ítem individual en el registro de conflictos de la plataforma, con ubicación (nivel/zona), elementos involucrados y severidad.',
      'Marcar como "Bloqueada" toda incidencia cuya resolución dependa de otra disciplina, indicando explícitamente qué se está esperando.',
      'Ordenar la lista de trabajo por severidad y por zona/nivel, para agrupar la corrección de conflictos cercanos geométricamente en una sola sesión de modelado.',
      'Actualizar el estado de cada conflicto (Sin iniciar / En progreso / Resuelto) a medida que se corrige en el modelo.',
      'Volver a correr la detección de interferencias para confirmar el cierre real, y mantener un histórico de conflictos resueltos vs. reaparecidos entre rondas.',
    ],
    erroresFrecuentes: [
      'Tratar todos los conflictos con la misma prioridad, sin distinguir un choque estructural crítico de un solape cosmético.',
      'No agrupar cruces repetitivos del mismo problema físico, inflando artificialmente el conteo de conflictos.',
      'Marcar un conflicto como resuelto en la plataforma sin volver a correr la detección de interferencias para confirmarlo en el modelo.',
      'Asignar la resolución a la disciplina equivocada, generando idas y vueltas innecesarias entre equipos.',
      'No dejar constancia de por qué un conflicto quedó "Bloqueada", perdiendo el contexto de qué se estaba esperando.',
    ],
    buenasPracticas: [
      'Usar una matriz simple de severidad (Alta/Media/Baja) consistente en todo el proyecto, no criterios ad hoc por persona.',
      'Agrupar conflictos por zona y nivel para resolverlos en lotes eficientes de modelado.',
      'Cerrar el ciclo siempre con una nueva corrida de detección de interferencias antes de dar un conflicto por resuelto.',
      'Mantener el registro de conflictos como fuente única de verdad, visible para todas las disciplinas involucradas.',
      'Revisar semanalmente los conflictos en estado "Bloqueada" para desatascar dependencias entre disciplinas.',
    ],
    ejemploAplicado:
      'La tarea PB-04-02 "Registrar y hacer seguimiento a los conflictos detectados en la ronda de coordinación hasta su resolución" (grupo Corrección de conflictos) es exactamente este trabajo: tomar el informe de la tarea PB-04-01, clasificar cada cruce por severidad y disciplina, registrarlo en la plataforma con su estado, y darle seguimiento hasta que una nueva corrida de detección de interferencias confirme que ya no aparece.',
    tareasRelacionadas: ['PB-04-02'],
  },
  {
    id: 'M6.4',
    titulo: 'Del informe de clashes a tareas ejecutables (usa prompt-incidencias.md)',
    minutos: 20,
    queEs:
      'Es el flujo distintivo de la plataforma que convierte un informe PDF de coordinación o clash detection (propio, exportado de Navisworks/Revit, o recibido de otra disciplina) en tareas estructuradas y ejecutables dentro de MEP Manager, usando un prompt de IA predefinido (prompt-incidencias.md) que transforma el PDF en un JSON importable con un esquema fijo.',
    paraQueSirve:
      'Elimina la transcripción manual de decenas de incidencias de un PDF a la plataforma tarea por tarea; estandariza cómo se clasifican categoría, prioridad, estado y fecha límite de cada una, y garantiza que cada incidencia del informe quede trazada con su ID original hasta su resolución.',
    cuandoUsarlo:
      'Cada vez que se recibe un informe de coordinación en PDF con incidencias o clashes numerados y hay que convertirlas en tareas de trabajo asignables dentro del proyecto en la plataforma.',
    procedimiento: [
      'Obtener el PDF del informe de incidencias o coordinación (propio, exportado de Navisworks, o recibido de otra disciplina).',
      'Abrir prompt-incidencias.md y copiar el bloque completo de instrucciones: el esquema JSON exacto, los valores permitidos de categoría/prioridad/estado y las reglas de mapeo.',
      'Pegar ese prompt junto con el PDF adjunto en el asistente de IA y pedir la conversión; el modelo debe leer cada incidencia del PDF y generar un único objeto JSON con un arreglo "tareas" siguiendo el esquema al pie de la letra.',
      'Verificar que la IA aplicó bien las reglas de mapeo: interferencias contra otra disciplina (EST, ARQ, HVAC) van a categoría "Coordinación MEP"; prioridad Alta si es crítica o choca con estructura; estado "Bloqueada" con el campo bloqueadoPor lleno cuando la resolución depende de otra disciplina.',
      'Confirmar que cada tarea generada conserva el ID original de la incidencia del PDF dentro del campo "comentarios", para poder rastrear cualquier tarea hasta su fuente.',
      'Guardar la respuesta de la IA como archivo .json, validando que sea JSON puro y parseable, sin markdown ni texto adicional alrededor.',
      'En la plataforma, ir a Proyectos > Importar JSON, cargar el archivo y revisar que el número de tareas importadas coincida con el número de incidencias listadas en el PDF.',
      'Triar el lote recién importado: reasignar responsable si corresponde, ajustar prioridad o fecha si el criterio automático no encajó, y dejar cada tarea en "Sin iniciar" o "Bloqueada" según corresponda antes de que el equipo empiece a trabajarlas.',
    ],
    erroresFrecuentes: [
      'Pegar el PDF sin el bloque completo del prompt, obteniendo un JSON con campos libres que no calzan con el esquema de importación.',
      'No revisar que la IA haya agrupado en una sola tarea las incidencias repetitivas idénticas (mismo par de elementos, mismo nivel), generando duplicados.',
      'Aceptar el JSON sin verificar que las fechas límite quedaron escalonadas según prioridad (Alta +7 días, Media +14, Baja +21 desde la fecha del informe).',
      'Perder el ID original de la incidencia por no revisar el campo "comentarios", rompiendo la trazabilidad hacia el PDF fuente.',
      'Importar el JSON y no triar después, dejando todas las tareas con el mismo responsable o prioridad por defecto sin ajustarlas al contexto real del proyecto.',
    ],
    buenasPracticas: [
      'Usar siempre prompt-incidencias.md completo y sin modificar su esquema, para que la importación sea consistente entre informes distintos.',
      'Archivar el PDF original junto al .json generado, nombrados con la misma fecha, para poder auditar cualquier tarea hasta su origen.',
      'Comparar el conteo total de incidencias del PDF contra las tareas generadas antes de importar, para detectar omisiones.',
      'Triar el lote inmediatamente después de importar (responsables, prioridades, bloqueos) en vez de dejarlo para después.',
      'Usar el campo "notas" del lote importado para dejar el resumen de disciplinas implicadas y el nombre del informe fuente.',
    ],
    ejemploAplicado:
      'La tarea PB-07-01 "Registrar y triar en la plataforma las incidencias importadas del informe de coordinación" (grupo Incidencias) es precisamente el caso de uso de esta lección: se recibe el PDF de la ronda de coordinación, se convierte con prompt-incidencias.md a un JSON de tareas, se importa vía Proyectos > Importar JSON y el equipo lo tría (responsable, prioridad, bloqueos) para dejarlo listo como carga de trabajo ejecutable.',
    tareasRelacionadas: ['PB-07-01', 'PB-04-02'],
  },
  {
    id: 'M6.5',
    titulo: 'Reuniones de coordinación y trazabilidad',
    minutos: 17,
    queEs:
      'Es la disciplina de conducir reuniones periódicas de coordinación BIM —revisión del modelo federado, informe de interferencias y registro de conflictos e incidencias en vivo— y de mantener trazabilidad de cada conflicto desde que se detecta hasta que se cierra.',
    paraQueSirve:
      'Convierte la coordinación en un proceso recurrente y auditable en vez de un evento aislado; asegura que ningún conflicto se pierda entre rondas y da al equipo y al cliente evidencia clara del avance en la resolución de interferencias.',
    cuandoUsarlo:
      'En cada ciclo de coordinación del proyecto (semanal o quincenal, según el cronograma), especialmente cuando hay varias disciplinas involucradas y conflictos que dependen de decisiones cruzadas entre ellas.',
    procedimiento: [
      'Antes de la reunión, recargar todos los vínculos, correr la detección de interferencias y actualizar el registro de conflictos e incidencias en la plataforma.',
      'Preparar el modelo federado en una vista 3D de navegación con los conflictos de severidad Alta visibles o aislados para revisión directa en la reunión.',
      'Durante la reunión, recorrer la lista priorizada de conflictos con representantes de cada disciplina involucrada, confirmando quién resuelve cada uno y para cuándo.',
      'Registrar en vivo las decisiones tomadas (quién resuelve, plazo, si queda "Bloqueada" y por qué) directamente en la plataforma, no en notas sueltas que haya que transcribir después.',
      'Cerrar cada conflicto resuelto desde la reunión anterior con la evidencia de una nueva corrida de detección de interferencias, no solo con la palabra del responsable.',
      'Actualizar el estado de las tareas de incidencias importadas según lo acordado: Sin iniciar, En progreso o Bloqueada con su campo bloqueadoPor actualizado.',
      'Generar un resumen de la reunión (conflictos abiertos, cerrados, nuevos, bloqueados) y distribuirlo al equipo y, si aplica, al cliente.',
      'Programar la siguiente ronda con una fecha de corte clara para recarga de vínculos, de modo que todas las disciplinas sepan hasta cuándo pueden actualizar su modelo antes de la próxima detección.',
    ],
    erroresFrecuentes: [
      'Llegar a la reunión con un informe de interferencias desactualizado porque no se recargaron los vínculos antes.',
      'Discutir conflictos sin dejar registro escrito de la decisión, perdiendo la trazabilidad para la siguiente ronda.',
      'Cerrar conflictos "de palabra" en la reunión sin verificarlos después con una nueva corrida de detección de interferencias.',
      'No distinguir entre conflictos nuevos, persistentes y reaparecidos, dando una falsa sensación de avance constante.',
      'Dejar las tareas de incidencias importadas sin actualizar su estado tras la reunión, desincronizando la plataforma de lo realmente acordado.',
    ],
    buenasPracticas: [
      'Fijar una cadencia regular de coordinación (por ejemplo semanal) con fecha de corte clara para recarga de vínculos.',
      'Usar el registro de conflictos de la plataforma como acta viva de la reunión, no como resumen posterior.',
      'Verificar todo cierre de conflicto con una corrida de detección de interferencias antes de la siguiente reunión.',
      'Mantener el historial de rondas anteriores accesible para mostrar la tendencia de resolución (abiertos vs. cerrados) al cliente.',
      'Vincular explícitamente cada decisión de reunión con el ID de conflicto o de incidencia importada correspondiente, para trazabilidad completa desde el PDF original hasta el cierre.',
    ],
    ejemploAplicado:
      'Esta lección combina PB-04-02 "Registrar y hacer seguimiento a los conflictos detectados en la ronda de coordinación hasta su resolución" y PB-07-01 "Registrar y triar en la plataforma las incidencias importadas del informe de coordinación": la reunión de coordinación es el punto donde ambos flujos convergen, revisando en vivo tanto los conflictos detectados internamente como las incidencias importadas de informes externos, y dejando trazabilidad de cada decisión hasta el cierre confirmado por una nueva detección de interferencias.',
    tareasRelacionadas: ['PB-04-02', 'PB-07-01'],
  },
];

export const M6 = {
  id: 'M6',
  nombre: 'Coordinación BIM',
  icon: 'ti-affiliate',
  nivel: 'Avanzado',
  descripcion:
    'Vínculos y coordenadas entre disciplinas, detección de interferencias con criterios y tolerancias claros, clasificación de conflictos, y el flujo propio de la plataforma para convertir informes de clashes en tareas ejecutables y trazables hasta su cierre en reuniones de coordinación.',
  lecciones: M6_LECCIONES,
};
