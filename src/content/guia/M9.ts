import type { Leccion } from '../../types';

export const M9_LECCIONES: Leccion[] = [
  {
    id: 'M9.1',
    titulo: 'Flujo de trabajo profesional de principio a fin',
    minutos: 20,
    queEs:
      'Un flujo de trabajo profesional en un proyecto MEP eléctrico es la cadena ordenada de decisiones y entregables que va desde la definición inicial del proyecto (subestación, plantilla, worksets) pasando por modelado, documentación, coordinación, control de calidad, empaquetado de entrega y seguimiento de pendientes — no una secuencia aleatoria de tareas resueltas según van apareciendo. En el catálogo de MEP Manager esa cadena es literalmente el conjunto de grupos de tareas (gestión, modelado, documentación, coordinación, calidad, entregables, seguimiento), y ejecutarlos desordenados o saltarse pasos produce reprocesos más caros que hacerlos bien la primera vez.',
    paraQueSirve:
      'Sirve para que un modelador o coordinador sepa en qué punto del proyecto está parado en cualquier momento, qué tareas dependen de cuáles, y qué se puede paralelizar frente a qué es estrictamente secuencial (no se puede coordinar interferencias sin haber modelado, ni exportar planos sin haber pasado control de calidad). Un flujo claro también permite que cualquier persona del equipo, no solo quien empezó el proyecto, entienda el estado real y continúe el trabajo sin perder contexto.',
    cuandoUsarlo:
      'Se define en la reunión de arranque del proyecto y se revisa cada vez que se cierra una fase importante (diseño esquemático, diseño de detalle, coordinación, entrega); es especialmente crítico cuando el proyecto cambia de responsable a mitad de camino, porque ahí es donde más se pierde la trazabilidad de qué se hizo y por qué.',
    procedimiento: [
      'Mapear el proyecto completo contra los grupos del catálogo de tareas (gestión, modelado, documentación, coordinación, calidad, entregables, seguimiento) antes de empezar a modelar.',
      'Identificar en la etapa de gestión las decisiones que condicionan todo lo demás, como la ubicación y el tipo de la subestación eléctrica.',
      'Secuenciar el modelado de manera que dependa de una base de coordenadas y niveles ya validada, nunca al revés.',
      'Programar las rondas de coordinación y detección de interferencias antes de congelar la documentación de entrega.',
      'Dejar la auditoría de calidad (warnings, verificación de cargas, chequeo de nomenclatura) como filtro obligatorio antes de exportar cualquier paquete de entrega.',
      'Cerrar cada fase con un entregable formal y un registro de seguimiento de pendientes, no con un "ya quedó" verbal.',
      'Revisar al inicio de cada semana qué tareas del catálogo están abiertas, cuáles bloquean a otras, y reordenar el trabajo del equipo en consecuencia.',
    ],
    erroresFrecuentes: [
      'Empezar a modelar sistemas eléctricos antes de que las decisiones de gestión (ubicación de subestación, plantilla, worksets) estén cerradas, obligando a rehacer trabajo cuando esas decisiones cambian.',
      'Saltarse la coordinación y llegar directo a documentación de entrega, descubriendo interferencias graves después de que los planos ya se radicaron.',
      'Tratar cada tarea del catálogo como un compartimento aislado en vez de parte de una cadena con dependencias reales.',
      'No dejar registro de en qué fase quedó el proyecto al hacer una transición de responsable, forzando a la persona nueva a reconstruir el contexto desde cero.',
    ],
    buenasPracticas: [
      'Usar el catálogo de tareas de MEP Manager como mapa de flujo, no solo como lista de pendientes sueltos.',
      'Cerrar formalmente cada fase antes de abrir la siguiente, incluso si la presión de cronograma empuja a adelantar trabajo.',
      'Mantener visible en todo momento qué tarea es la que bloquea el avance del resto del equipo.',
      'Revisar el flujo completo del proyecto, no solo la tarea del día, al menos una vez por semana.',
    ],
    ejemploAplicado:
      'La tarea "Definir la ubicación y el tipo de la subestación eléctrica del proyecto" (PB-01-01) es el primer eslabón real de cualquier proyecto eléctrico: de esa decisión dependen la ruta de media tensión, la capacidad del transformador y hasta la distribución de tableros aguas abajo. En el otro extremo de la misma cadena está "Publicar el paquete de entrega final y registrar el acta de entrega firmada" (PB-06-09), el cierre formal que confirma que todo lo decidido en PB-01-01 se ejecutó, coordinó y verificó correctamente. Un profesional que entiende el flujo de principio a fin sabe que ninguna de las tareas intermedias — modelado, documentación, coordinación, calidad — tiene sentido si no se leen como pasos entre esos dos extremos, no como trabajo aislado.',
    tareasRelacionadas: ['PB-01-01', 'PB-06-09'],
  },
  {
    id: 'M9.2',
    titulo: 'Gestión del tiempo y estimación de tareas',
    minutos: 16,
    queEs:
      'Gestionar el tiempo en un proyecto MEP eléctrico es asignar a cada tarea del catálogo una duración realista y una prioridad según su impacto en el cronograma general, en vez de tratar todas las tareas como si tomaran lo mismo o pudieran resolverse "cuando haya tiempo". Estimar bien implica reconocer que no todas las incidencias o tareas pesan igual: una interferencia crítica en la ruta de media tensión no consume el mismo tiempo ni tiene la misma urgencia que un ajuste menor de nomenclatura.',
    paraQueSirve:
      'Sirve para comprometerse con fechas de entrega que realmente se puedan cumplir, para priorizar qué se resuelve primero cuando hay más pendientes de los que el equipo puede atender en el día, y para detectar a tiempo cuando una tarea se está tomando mucho más de lo estimado y necesita apoyo o replanificación antes de que arrastre el resto del cronograma.',
    cuandoUsarlo:
      'Al planificar cada fase del proyecto y asignar tareas al equipo, y de forma continua cada vez que llega un lote nuevo de incidencias o pendientes que hay que triar y ubicar dentro del cronograma existente, por ejemplo después de una ronda de coordinación.',
    procedimiento: [
      'Revisar el volumen y la naturaleza de las tareas o incidencias pendientes antes de asignar fechas de compromiso.',
      'Clasificar cada pendiente por severidad e impacto real en el proyecto, no solo por orden de llegada.',
      'Estimar el tiempo de resolución de cada tarea con base en casos similares ya resueltos en el proyecto o en proyectos anteriores.',
      'Asignar responsable y fecha límite a cada tarea priorizada, dejando explícito cuáles bloquean a otras.',
      'Registrar en la plataforma el estado de avance real de cada tarea, no solo al cierre sino durante su ejecución.',
      'Comparar periódicamente el tiempo estimado contra el tiempo real invertido para ajustar futuras estimaciones.',
      'Escalar a tiempo las tareas que se estén desviando significativamente de su estimación, en vez de esperar a la fecha límite para reportarlo.',
    ],
    erroresFrecuentes: [
      'Tratar todas las incidencias importadas de un informe de coordinación con la misma prioridad, sin triarlas por severidad real.',
      'Estimar tiempos "a ojo" sin revisar el historial de tareas similares ya resueltas en el proyecto.',
      'No registrar el avance real de las tareas en la plataforma, perdiendo visibilidad de cuáles se están atrasando.',
      'Descubrir que una tarea está muy retrasada solo hasta la fecha límite, en vez de detectarlo con margen para reaccionar.',
    ],
    buenasPracticas: [
      'Triar cada lote de incidencias nuevas apenas ingresa, asignando severidad y responsable antes de que se acumulen sin dueño.',
      'Usar el historial de tareas resueltas como referencia para estimar tiempos de tareas similares futuras.',
      'Mantener actualizado el estado de avance de las tareas en la plataforma en vez de reportarlo solo verbalmente.',
      'Revisar semanalmente qué tareas están corriendo por encima de su estimación y actuar antes de que afecten la entrega.',
    ],
    ejemploAplicado:
      'La tarea "Registrar y triar en la plataforma las incidencias importadas del informe de coordinación" (PB-07-01) es donde la gestión del tiempo se vuelve concreta: cuando llega un informe de coordinación con decenas de conflictos detectados, no se pueden resolver todos el mismo día, así que hay que triarlos por severidad e impacto, estimar cuánto toma resolver cada tipo y asignarlos con fechas realistas. Un mal triage aquí — tratar una interferencia crítica de canalización igual que un ajuste cosmético de anotación — es lo que después hace que un proyecto llegue tarde a su entrega sin que nadie lo haya visto venir a tiempo.',
    tareasRelacionadas: ['PB-07-01'],
  },
  {
    id: 'M9.3',
    titulo: 'Comunicación técnica y documentación de decisiones',
    minutos: 18,
    queEs:
      'La comunicación técnica es la manera formal y trazable en que un equipo de proyecto deja registro de qué se decidió, por qué, quién lo decidió y con qué respaldo, en vez de resolver desacuerdos o criterios de diseño solo de palabra en una llamada o un pasillo. Documentar decisiones significa que la memoria descriptiva, los registros de coordinación y las especificaciones técnicas reflejan el razonamiento real detrás del modelo, no solo el resultado final.',
    paraQueSirve:
      'Sirve para que cualquier persona — otro modelador, el cliente, un revisor externo o el propio equipo meses después — pueda entender por qué el proyecto quedó como quedó sin tener que preguntarle a la persona que lo diseñó. También protege al estudio: si un conflicto de coordinación quedó registrado con su resolución y responsable, no hay ambigüedad después sobre quién aprobó qué cambio.',
    cuandoUsarlo:
      'Cada vez que se toma una decisión de diseño que se aparta de un criterio general o que afecta a otra disciplina, durante las rondas de coordinación cuando aparecen conflictos que hay que resolver y dejar constancia, y al redactar los documentos formales del proyecto que el cliente o un tercero van a leer.',
    procedimiento: [
      'Registrar cada conflicto de coordinación detectado con su descripción, disciplinas involucradas y evidencia (captura, vista, elemento).',
      'Asignar responsable y plazo de resolución a cada conflicto registrado, no dejarlo abierto sin dueño.',
      'Dejar constancia explícita de la decisión tomada para cerrar el conflicto y de quién la aprobó.',
      'Redactar la memoria descriptiva base del proyecto reflejando los criterios generales de diseño realmente aplicados, no una plantilla genérica sin ajustar.',
      'Revisar que las especificaciones técnicas y la memoria sean consistentes entre sí y con lo que efectivamente está modelado.',
      'Mantener un historial consultable de decisiones para que no se repitan discusiones ya cerradas.',
      'Compartir con el equipo y, cuando aplique, con el cliente, un resumen claro de las decisiones relevantes tomadas en cada fase.',
    ],
    erroresFrecuentes: [
      'Resolver un conflicto de coordinación en una reunión verbal y no dejar registro escrito de la decisión ni de quién la tomó.',
      'Redactar la memoria descriptiva copiando una plantilla genérica sin ajustarla a los criterios reales aplicados en ese proyecto.',
      'Dejar conflictos de coordinación sin responsable ni fecha de resolución, haciendo que se olviden hasta que vuelven a aparecer en una ronda posterior.',
      'Que la documentación formal del proyecto no coincida con lo que realmente está modelado, generando desconfianza en revisiones externas.',
    ],
    buenasPracticas: [
      'Registrar toda decisión técnica relevante en el mismo momento en que se toma, no de memoria días después.',
      'Usar el registro de conflictos de coordinación como bitácora oficial de decisiones entre disciplinas.',
      'Revisar la memoria descriptiva y las especificaciones técnicas contra el modelo real antes de darlas por cerradas.',
      'Comunicar de forma proactiva al cliente los cambios de criterio relevantes, no esperar a que los descubra en la entrega final.',
    ],
    ejemploAplicado:
      'La tarea "Registrar y hacer seguimiento a los conflictos detectados en la ronda de coordinación hasta su resolución" (PB-04-02) es comunicación técnica en su forma más literal: cada conflicto entre eléctrico y arquitectura, estructura o HVAC queda documentado con su estado, su responsable y la decisión que lo cerró, así que nadie tiene que reconstruir de memoria por qué una canalización terminó en una ruta distinta a la original. Esa misma disciplina de documentar decisiones sostiene la tarea "Redactar la memoria descriptiva base del proyecto eléctrico con los criterios generales de diseño" (PB-03-02), donde esas decisiones ya resueltas se consolidan en el documento formal que el cliente y los revisores externos van a leer.',
    tareasRelacionadas: ['PB-04-02', 'PB-03-02'],
  },
  {
    id: 'M9.4',
    titulo: 'Entrega al cliente y cierre de proyecto',
    minutos: 18,
    queEs:
      'El cierre de proyecto es la fase donde el modelo y su documentación dejan de ser un trabajo en curso y se convierten en un paquete formal de entrega: planos exportados en los formatos que el cliente necesita, un acta que deja constancia de qué se entregó y cuándo, y un archivo del proyecto que queda como referencia. No es "enviar los archivos por correo": es un proceso con verificación previa y un registro formal de que la entrega ocurrió.',
    paraQueSirve:
      'Sirve para proteger al estudio y al cliente por igual: al cliente le garantiza que recibe un paquete completo, verificado y en los formatos que puede usar (PDF para revisión, DWG para quien trabaje en CAD); al estudio le da respaldo formal, mediante el acta firmada, de que el alcance comprometido se entregó en una fecha específica, lo cual es la base para cerrar facturación o iniciar una siguiente fase contractual.',
    cuandoUsarlo:
      'Al final de cada hito contractual del proyecto (diseño esquemático, diseño de detalle, entrega para construcción) y, de forma definitiva, al cierre completo del proyecto, siempre después de que el modelo pasó los controles de calidad y coordinación previos.',
    procedimiento: [
      'Confirmar que el modelo pasó los controles de calidad y coordinación acordados antes de generar cualquier archivo de entrega.',
      'Definir con el cliente o el contrato qué formatos y qué contenido debe incluir el paquete de entrega.',
      'Exportar el paquete de planos a PDF y DWG asegurando que la nomenclatura y la organización de archivos sigan la convención acordada.',
      'Revisar el paquete exportado abriendo los archivos finales, no solo confiando en que la exportación salió bien.',
      'Publicar el paquete de entrega final en el canal acordado con el cliente.',
      'Redactar y hacer firmar el acta de entrega, dejando constancia de fecha, alcance entregado y responsables.',
      'Archivar una copia completa del paquete entregado junto con el acta firmada como respaldo del estudio.',
    ],
    erroresFrecuentes: [
      'Exportar y enviar el paquete de entrega sin haber pasado antes por la auditoría de calidad del modelo, arrastrando errores al cliente.',
      'Enviar los archivos sin generar ni firmar un acta de entrega, dejando la fecha y el alcance real sin respaldo formal.',
      'Descubrir errores de exportación (láminas faltantes, capas mal configuradas en el DWG) después de que el cliente ya abrió los archivos.',
      'No archivar una copia del paquete exacto que se entregó, complicando cualquier reclamo o consulta posterior sobre qué se envió.',
    ],
    buenasPracticas: [
      'Nunca exportar el paquete final sin confirmar antes que el modelo pasó su control de calidad.',
      'Abrir y revisar personalmente los archivos exportados antes de publicarlos, como lo haría el cliente al recibirlos.',
      'Formalizar cada entrega con un acta firmada, sin importar el tamaño del hito o la confianza con el cliente.',
      'Mantener un archivo ordenado de todas las entregas históricas del proyecto con su acta correspondiente.',
    ],
    ejemploAplicado:
      'El cierre de un hito de proyecto combina dos tareas del catálogo en secuencia directa: "Exportar el paquete de planos del entregable a PDF y DWG para su radicación" (PB-06-08) es donde se generan los archivos finales que el cliente va a usar, y "Publicar el paquete de entrega final y registrar el acta de entrega firmada" (PB-06-09) es donde esa entrega se formaliza con un respaldo documental firmado. Saltarse la revisión entre estas dos tareas — exportar y publicar sin verificar el contenido — es la causa más común de que un cliente reciba un paquete incompleto y el estudio se entere solo cuando ya es tarde para corregirlo sin fricción.',
    tareasRelacionadas: ['PB-06-08', 'PB-06-09'],
  },
];

export const M9 = {
  id: 'M9',
  nombre: 'Buenas prácticas',
  icon: 'ti-award',
  nivel: 'Avanzado',
  descripcion:
    'Un módulo transversal que no enseña una herramienta de Revit sino cómo ejecutar un proyecto MEP eléctrico completo como profesional: seguir el flujo de trabajo de principio a fin sin saltarse fases, estimar y gestionar bien el tiempo de las tareas y las incidencias, documentar y comunicar las decisiones técnicas de forma trazable, y cerrar cada entrega con el rigor formal que protege tanto al cliente como al estudio.',
  lecciones: M9_LECCIONES,
};
