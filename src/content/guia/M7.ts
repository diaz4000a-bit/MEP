import type { Leccion } from '../../types';

export const M7_LECCIONES: Leccion[] = [
  {
    id: 'M7.1',
    titulo: 'Checklist de revisión del modelo',
    minutos: 14,
    queEs:
      'Un checklist de revisión del modelo es una lista estructurada de verificaciones que se ejecuta antes de considerar el modelo eléctrico listo para coordinación o entrega. No es una inspección visual improvisada: agrupa controles concretos de continuidad eléctrica, conectividad de sistemas, warnings de Revit, nomenclatura y duplicados, y calidad de los planos derivados, en el mismo orden cada vez. En el catálogo de MEP Manager este bloque de controles corresponde al grupo 05-calidad, que reúne desde validaciones de continuidad (PB-05-01) hasta la auditoría de warnings (PB-05-16) y nomenclatura (PB-05-17).',
    paraQueSirve:
      'Sirve para que la calidad del modelo no dependa de la memoria o el criterio individual del modelador de turno. Un checklist repetible convierte el QC en un proceso auditable: cualquier persona del equipo puede ejecutarlo, queda registro de qué se revisó y cuándo, y se detectan errores de coordinación antes de que lleguen a una entrega o a una reunión con otras disciplinas.',
    cuandoUsarlo:
      'Antes de marcar cualquier hito de avance como completado, antes de enviar el modelo a coordinación con arquitectura o estructura, y siempre antes de una entrega parcial o final. También conviene correrlo después de cambios grandes, como una reestructuración de tableros o una actualización masiva de parámetros compartidos.',
    procedimiento: [
      'Definir las categorías del checklist alineadas con el grupo 05-calidad: continuidad eléctrica, conectividad de sistemas, warnings, nomenclatura/duplicados y planos.',
      'Recorrer el modelo por sistema eléctrico (tableros, circuitos, iluminación, tomacorrientes, comunicaciones), no por vista, para no dejar elementos fuera del rango visible de una vista activa.',
      'Ejecutar la comprobación de sistemas eléctricos sobre cada panel para confirmar que no quedan circuitos abiertos ni cargas sin asignar.',
      'Revisar el panel de warnings de Revit y clasificar cada advertencia según si afecta datos eléctricos o es solo ruido gráfico.',
      'Correr una revisión de nomenclatura contra la convención de tableros y circuitos definida por el estudio.',
      'Aislar visualmente los elementos sin conexión a un sistema (huérfanos) usando filtros de vista temporales.',
      'Registrar los hallazgos del checklist en una tabla o lista compartida, indicando responsable y fecha de corrección.',
      'Repetir el checklist completo en cada hito de avance relevante, no solo una vez al final del proyecto.',
    ],
    erroresFrecuentes: [
      'Ejecutar el checklist una sola vez, justo antes de la entrega, cuando ya no hay tiempo real de corregir lo que aparezca.',
      'Revisar por vista en lugar de por sistema, dejando fuera elementos que ninguna vista muestra completos.',
      'No dejar registro escrito de los hallazgos, lo que obliga a repetir la revisión completa cada vez por falta de trazabilidad.',
      'Delegar todo el QC en la misma persona que modeló, sin una segunda mirada que detecte lo que el modelador ya no ve.',
    ],
    buenasPracticas: [
      'Convertir el checklist en una tabla de planificación reutilizable entre proyectos, no en una lista mental.',
      'Ejecutarlo en hitos intermedios definidos desde el cronograma, no solo al cierre del proyecto.',
      'Asignar el rol de revisor de QC a alguien distinto de quien modeló esa parte del sistema.',
      'Guardar el histórico de checklists ejecutados como evidencia de control de calidad ante el cliente o el estudio.',
    ],
    ejemploAplicado:
      'La tarea "Verificar la consistencia y conectividad de los sistemas eléctricos definidos en el modelo" (PB-05-02) es el punto de entrada natural de cualquier checklist de revisión: antes de mirar warnings, nomenclatura o planos, hay que confirmar que los sistemas eléctricos del modelo (tableros, circuitos, cableado) están completos y bien conectados entre sí. Ejecutar esta tarea como primer paso del checklist evita perder tiempo revisando detalles finos sobre un modelo que todavía tiene sistemas incompletos o mal enlazados.',
    tareasRelacionadas: ['PB-05-02'],
  },
  {
    id: 'M7.2',
    titulo: 'Warnings de Revit: cuáles importan',
    minutos: 13,
    queEs:
      'Los warnings son los mensajes de advertencia que Revit genera automáticamente cuando detecta situaciones que el software considera anómalas: elementos superpuestos, referencias circulares, líneas de sistema desconectadas, uniones fallidas, entre otras. No todos pesan igual: algunos son ruido cosmético que no afecta la información del modelo, y otros son síntomas directos de un sistema eléctrico mal definido, como un circuito que Revit no logra resolver o un cable sin ambos extremos conectados.',
    paraQueSirve:
      'Aprender a leer y priorizar warnings permite invertir el tiempo de QC en lo que realmente afecta la calidad del modelo eléctrico y sus entregables, en lugar de perseguir cada advertencia por igual. También sirve como indicador temprano de errores de modelado que todavía no son visibles en planta, como duplicados exactos o desconexiones que solo Revit detecta internamente.',
    cuandoUsarlo:
      'De forma periódica durante el modelado, no solo al final, y de forma obligatoria antes de cualquier entrega, como parte del checklist de revisión del modelo. Es especialmente crítico revisar warnings después de operaciones masivas como copiar/pegar entre niveles, importar familias externas o fusionar worksets.',
    procedimiento: [
      'Abrir el panel de revisión de warnings (Gestionar > Warnings) y exportar o copiar la lista completa para tener un registro del estado inicial.',
      'Clasificar los warnings en dos grupos: los que involucran categorías eléctricas (paneles, circuitos, cableado, conductos) y los que no.',
      'Priorizar los warnings eléctricos que mencionan elementos duplicados, elementos superpuestos exactamente o sistemas no resueltos.',
      'Usar el botón "Mostrar" de cada warning para ubicar el elemento en el modelo y entender la causa real, no solo el mensaje.',
      'Corregir primero los warnings que afectan datos (conectividad, duplicados) y dejar para el final los puramente gráficos si no impactan la entrega.',
      'Volver a generar la lista de warnings después de las correcciones para confirmar que no aparecieron nuevos por efecto de los cambios.',
      'Documentar los warnings que se decide dejar sin corregir, con la justificación de por qué no afectan el modelo ni la entrega.',
    ],
    erroresFrecuentes: [
      'Ignorar el panel de warnings por completo hasta el día de la entrega, cuando ya no hay margen de tiempo para investigarlos uno por uno.',
      'Tratar todos los warnings como igual de urgentes, perdiendo tiempo en advertencias cosméticas mientras un warning de sistema eléctrico no resuelto queda sin corregir.',
      'Corregir un warning "a ciegas" sin usar "Mostrar" para entender la causa real, lo que a veces genera un elemento oculto o mal ubicado en vez de resolver el problema.',
      'No volver a revisar la lista de warnings después de corregir, asumiendo que las correcciones no generaron warnings nuevos.',
    ],
    buenasPracticas: [
      'Revisar warnings con frecuencia durante el modelado, no acumularlos para el final del proyecto.',
      'Mantener un registro de warnings aceptados conscientemente, con la razón documentada, para no re-investigarlos cada vez.',
      'Priorizar siempre los warnings que mencionan categorías o sistemas eléctricos sobre los puramente geométricos de otras disciplinas.',
      'Incluir la revisión de warnings como paso fijo del checklist de QC antes de cualquier entrega.',
    ],
    ejemploAplicado:
      'La tarea "Auditar los warnings de Revit del modelo eléctrico antes de la entrega" (PB-05-16) es exactamente esta lección convertida en tarea de catálogo: exportar la lista completa de warnings, separar los que involucran categorías eléctricas de los que no, y resolver o justificar cada uno antes de radicar el paquete de entrega. Un modelo que llega a esta tarea sin haber revisado warnings durante el modelado normalmente arrastra decenas de advertencias acumuladas, lo que convierte una auditoría que debería tomar minutos en una investigación de horas.',
    tareasRelacionadas: ['PB-05-16'],
  },
  {
    id: 'M7.3',
    titulo: 'Elementos duplicados y huérfanos',
    minutos: 15,
    queEs:
      'Los elementos duplicados son dos o más instancias del mismo componente eléctrico (una salida, un tablero, un tramo de bandeja) ubicadas exactamente en el mismo punto del modelo, generalmente producto de un copiar/pegar mal controlado o de una sincronización con conflictos. Los elementos huérfanos son lo opuesto: circuitos sin tablero asignado, cables sin uno de sus extremos conectado, o tags/anotaciones que apuntan a un elemento que ya no existe. Ambos son invisibles en una vista normal y solo aparecen al filtrar o auditar el modelo deliberadamente.',
    paraQueSirve:
      'Detectar duplicados y huérfanos evita que las cantidades de materiales salgan infladas (dos tomacorrientes contados donde físicamente hay uno), que los cuadros de carga incluyan circuitos fantasma, y que la coordinación con otras disciplinas arroje falsos conflictos por geometría superpuesta que en realidad es el mismo elemento repetido.',
    cuandoUsarlo:
      'Después de cualquier operación de copiar/pegar entre vistas o niveles, después de fusionar cambios de varios worksets, y como paso obligatorio del checklist de revisión antes de generar cuadros de carga, cantidades o planos de entrega.',
    procedimiento: [
      'Usar una tabla de planificación de todos los elementos eléctricos de una categoría (por ejemplo tomacorrientes) y ordenarla por ubicación (coordenadas X, Y, Z) para detectar coincidencias exactas.',
      'Aplicar el comando de selección por categoría en una vista 3D y aislar los elementos, buscando visualmente superposiciones que delaten duplicados.',
      'Revisar los paneles de distribución y confirmar que cada circuito asignado corresponde a una carga real modelada, no a un circuito creado y luego borrado en el elemento pero no en el panel.',
      'Filtrar cables y conductos que no tengan ambos extremos conectados a un elemento válido (origen y destino).',
      'Revisar anotaciones y etiquetas (tags) huérfanas que quedaron ancladas a un elemento eliminado.',
      'Eliminar los duplicados confirmados, dejando una sola instancia real por elemento físico existente.',
      'Reasignar o eliminar los circuitos y cables huérfanos según corresponda al diseño real del proyecto.',
      'Volver a correr el checklist de continuidad después de las correcciones para confirmar que no se rompió ningún circuito válido en el proceso.',
    ],
    erroresFrecuentes: [
      'Confundir "elementos superpuestos visualmente similares" con duplicados reales sin verificar coordenadas exactas antes de borrar nada.',
      'Borrar un elemento duplicado sin revisar primero si tiene un circuito o un cable asociado que también quedaría huérfano.',
      'No revisar tags y anotaciones después de eliminar elementos, dejando etiquetas "flotando" sin referencia en los planos.',
      'Dejar la detección de duplicados solo para el final del proyecto, cuando ya se generaron cuadros de carga o cantidades con datos inflados.',
    ],
    buenasPracticas: [
      'Revisar duplicados y huérfanos después de cada operación masiva de copiar/pegar o de sincronización con conflictos resueltos.',
      'Usar tablas de planificación ordenadas por ubicación como método sistemático, no solo inspección visual en 3D.',
      'Verificar el circuito o cable asociado antes de eliminar cualquier elemento sospechoso de ser duplicado.',
      'Incluir esta revisión como paso fijo del checklist de QC antes de generar cuadros de carga o cantidades para el cliente.',
    ],
    ejemploAplicado:
      'La tarea "Revisar la nomenclatura y detectar elementos duplicados en el modelo eléctrico" (PB-05-17) es donde esta lección se aplica directamente en su componente de duplicados: ordenar los elementos eléctricos por ubicación, confirmar coincidencias exactas y eliminar las instancias repetidas antes de que contaminen cuadros de carga o cantidades. Un modelo que llega a esta tarea sin haber revisado huérfanos primero corre el riesgo de que, al eliminar un duplicado, se rompa un circuito que en realidad dependía de esa instancia.',
    tareasRelacionadas: ['PB-05-17'],
  },
  {
    id: 'M7.4',
    titulo: 'Nomenclatura y consistencia de datos',
    minutos: 14,
    queEs:
      'La nomenclatura es la convención de nombres que identifica de forma única cada tablero, circuito, tipo de familia y vista del proyecto (por ejemplo "TAB-P1-01" para un tablero de piso 1). La consistencia de datos es que los parámetros compartidos eléctricos (carga conectada, sistema, panel, circuito) estén llenos con el mismo criterio en todo el modelo, sin variaciones de formato, mayúsculas o unidades entre elementos que deberían ser comparables.',
    paraQueSirve:
      'Una nomenclatura y unos datos consistentes son lo que permite que las tablas de planificación, los cuadros de carga y los planos se puedan leer, filtrar y ordenar de forma confiable. Sin esto, dos tableros funcionalmente iguales pueden aparecer con nombres distintos en el plano y en la tabla de cantidades, y un cuadro de carga puede sumar mal porque un parámetro de carga se llenó en una unidad diferente en un elemento aislado.',
    cuandoUsarlo:
      'Desde que se cargan los parámetros compartidos al inicio del proyecto, y de forma sistemática como paso del checklist de QC antes de generar cuadros de carga, planimetría o cualquier entregable que dependa de datos ordenados por nombre o categoría.',
    procedimiento: [
      'Confirmar la convención de nomenclatura vigente del estudio para tableros, circuitos y vistas eléctricas.',
      'Generar una tabla de planificación con todos los tableros y circuitos del proyecto, ordenada alfabéticamente por nombre.',
      'Revisar visualmente la tabla buscando inconsistencias de formato: mayúsculas/minúsculas mezcladas, guiones faltantes, numeración no correlativa.',
      'Verificar que los parámetros compartidos de carga y sistema estén llenos con el mismo criterio de unidades en todos los elementos comparables.',
      'Corregir en bloque, desde la misma tabla de planificación, los valores que no siguen la convención, en vez de editarlos elemento por elemento en el modelo.',
      'Revisar que los nombres en el modelo coincidan exactamente con los usados en los planos y en los cuadros de carga generados.',
      'Dejar la tabla corregida como referencia de nomenclatura vigente para el resto del equipo del proyecto.',
    ],
    erroresFrecuentes: [
      'Dejar que cada modelador use su propio criterio de nombres para tableros o circuitos sin una convención escrita y compartida.',
      'Corregir nomenclatura elemento por elemento en el modelo en vez de usar tablas de planificación para editar en bloque.',
      'Mezclar unidades o formatos en el parámetro de carga conectada, lo que rompe la suma automática de los cuadros de carga.',
      'No verificar que el nombre visible en el plano coincide con el del modelo, generando confusión en obra o en coordinación.',
    ],
    buenasPracticas: [
      'Definir y documentar la convención de nomenclatura del estudio antes de empezar a modelar, no sobre la marcha.',
      'Usar tablas de planificación como herramienta principal de auditoría y corrección masiva de nombres y parámetros.',
      'Revisar consistencia de datos cada vez que se recibe una entrega parcial de otro modelador o de otro estudio.',
      'Tratar la nomenclatura como parte del checklist de QC, no como un detalle estético de última hora.',
    ],
    ejemploAplicado:
      'La tarea "Revisar la nomenclatura y detectar elementos duplicados en el modelo eléctrico" (PB-05-17) es también donde se aplica el componente de nomenclatura de esta lección: usar una tabla de planificación ordenada para detectar tableros o circuitos con nombres inconsistentes, y corregirlos en bloque antes de que lleguen a un cuadro de carga o a un plano de entrega. Esta consistencia depende directamente de que los parámetros compartidos se hayan cargado bien desde el inicio, en la tarea "Configurar la plantilla de proyecto MEP y cargar los parámetros compartidos eléctricos" (PB-01-07): sin esa base, no hay convención de nomenclatura que se pueda auditar de forma confiable.',
    tareasRelacionadas: ['PB-05-17', 'PB-01-07'],
  },
  {
    id: 'M7.5',
    titulo: 'Revisión de planos antes de entregar',
    minutos: 16,
    queEs:
      'La revisión de planos antes de entregar es el último control de calidad sobre las láminas que van a salir del proyecto: que cada vista muestre lo que debe mostrar, que las escalas y leyendas sean correctas, que los cuadros de carga coincidan con el modelo actual (no con una versión anterior), y que el paquete completo esté armado según lo que pide la radicación. Es distinta de revisar el modelo: un modelo correcto puede producir planos incorrectos si la vista, la plantilla de vista o la lámina tienen un error propio.',
    paraQueSirve:
      'Sirve como el filtro final antes de que un error llegue al cliente, a la interventoría o a obra. Un plano con una leyenda desactualizada, una escala mal configurada o un cuadro de carga que no refleja el último cambio del modelo genera confusión costosa una vez que el paquete ya salió, mucho más difícil de corregir que un ajuste hecho antes de exportar.',
    cuandoUsarlo:
      'Siempre antes de exportar o radicar cualquier paquete de planos, ya sea una entrega parcial o final, y después de cualquier cambio grande en el modelo que pueda haber afectado vistas, cuadros de carga o rótulos ya diagramados.',
    procedimiento: [
      'Actualizar todas las vistas y tablas de planificación del set de láminas antes de revisar, para no evaluar información desactualizada.',
      'Recorrer lámina por lámina verificando que el rótulo tenga el número, título y escala correctos según el índice de planos del proyecto.',
      'Confirmar que las leyendas de simbología eléctrica coinciden con los símbolos realmente usados en esa lámina.',
      'Verificar que los cuadros de carga y demás tablas insertadas en las láminas reflejan el estado actual del modelo, no una versión congelada de una revisión anterior.',
      'Revisar que no queden elementos de otras disciplinas visibles por error de plantilla de vista o visibilidad mal configurada.',
      'Comparar el índice de planos contra el paquete real que se va a exportar, confirmando que no falta ni sobra ninguna lámina.',
      'Exportar una copia de revisión (PDF) y hacer una lectura final fuera de Revit, donde los errores de composición suelen notarse más fácil que dentro del software.',
      'Dejar registro de quién revisó el paquete y en qué fecha, como evidencia de control de calidad previo a la radicación.',
    ],
    erroresFrecuentes: [
      'Exportar el paquete de planos sin actualizar antes las vistas y tablas, arrastrando información de una versión anterior del modelo.',
      'Revisar solo la geometría del plano y no los cuadros de carga o las leyendas, que son donde más aparecen datos desactualizados.',
      'No comparar el índice de planos contra el paquete exportado, dejando láminas faltantes o duplicadas en la entrega final.',
      'Saltarse la lectura final en PDF y confiar solo en la vista dentro de Revit, donde ciertos errores de composición de lámina no se notan igual.',
    ],
    buenasPracticas: [
      'Actualizar todas las vistas y tablas antes de iniciar cualquier revisión de planos, sin excepción.',
      'Usar una copia exportada a PDF para la lectura final, en vez de revisar únicamente dentro de Revit.',
      'Mantener un índice de planos vivo que se compare siempre contra el paquete real antes de exportar.',
      'Documentar quién revisó y aprobó el paquete antes de la radicación, como parte del historial de calidad del proyecto.',
    ],
    ejemploAplicado:
      'La tarea "Exportar el paquete de planos del entregable a PDF y DWG para su radicación" (PB-06-08) es el punto donde esta lección se vuelve obligatoria: antes de generar los archivos finales hay que confirmar que cada lámina, cuadro de carga y leyenda reflejan el estado real y actualizado del modelo, no una versión de trabajo intermedia. Ese control de calidad es lo que sostiene después la tarea "Publicar el paquete de entrega final y registrar el acta de entrega firmada" (PB-06-09): un acta de entrega firmada sobre un paquete de planos con errores traslada el problema de calidad al cliente o a la interventoría, en un punto donde ya es mucho más costoso corregirlo.',
    tareasRelacionadas: ['PB-06-08', 'PB-06-09'],
  },
];

export const M7 = {
  id: 'M7',
  nombre: 'Revisión y QC',
  icon: 'ti-checklist',
  nivel: 'Avanzado',
  descripcion:
    'Los controles de calidad que separan un modelo terminado de un modelo listo para coordinar o entregar: cómo armar un checklist de revisión sistemático, qué warnings de Revit conviene resolver y cuáles no son urgentes, cómo detectar elementos duplicados y huérfanos antes de que contaminen cantidades o cuadros de carga, cómo mantener nomenclatura y datos consistentes en todo el modelo, y cómo revisar los planos a fondo antes de radicar cualquier entrega.',
  lecciones: M7_LECCIONES,
};
