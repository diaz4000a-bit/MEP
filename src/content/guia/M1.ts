import type { Leccion } from '../../types';

export const M1_LECCIONES: Leccion[] = [
  {
    id: 'M1.1',
    titulo: 'Qué es BIM y qué no',
    minutos: 10,
    queEs:
      'BIM (Building Information Modeling) es un proceso de trabajo basado en un modelo 3D paramétrico donde cada elemento eléctrico (tablero, luminaria, canalización, circuito) lleva datos asociados: código, fabricante, sistema, carga. No es simplemente "dibujar en 3D": un modelo con geometría pero sin parámetros correctos ni sistemas eléctricos definidos es solo volumetría, no información. La diferencia está en que el dato vive dentro del elemento, no en un plano aparte.',
    paraQueSirve:
      'Sirve para que la información fluya una sola vez: cantidades, planos, cuadros de carga y detección de interferencias salen del mismo modelo sin reescribirse a mano. Esto reduce errores de coordinación entre disciplinas, acelera cambios (si se mueve un tablero, sus circuitos y su plano se actualizan solos) y da trazabilidad de por qué se tomó cada decisión de diseño.',
    cuandoUsarlo:
      'Se define desde el arranque del proyecto, al configurar la plantilla y los parámetros compartidos; no es algo que se pueda "agregar" al final sobre un modelo ya calcado de CAD. Se aplica siempre que el proyecto requiera coordinación con arquitectura, estructura o HVAC, o cuantificación automática de materiales.',
    procedimiento: [
      'Abrir Revit y diferenciar la plantilla de proyecto arquitectónico de la plantilla MEP eléctrica del estudio.',
      'Verificar que la plantilla cargada incluya los parámetros compartidos eléctricos (circuito, carga conectada, sistema, panel).',
      'Revisar el Navegador de proyecto y confirmar que existen las categorías de sistemas eléctricos: paneles, circuitos, iluminación, tomacorrientes.',
      'Insertar un elemento eléctrico de prueba (por ejemplo una salida de tomacorriente) y revisar en Propiedades que trae parámetros de sistema, no solo geometría.',
      'Comparar ese elemento con un bloque CAD 2D importado y verificar la diferencia de comportamiento: uno reacciona a cambios del modelo, el otro es geometría muerta.',
      'Guardar el archivo con la nomenclatura y ubicación de red definidas por el estudio antes de seguir modelando.',
    ],
    erroresFrecuentes: [
      'Confundir "modelar en 3D" con "hacer BIM": geometría sin parámetros ni sistemas eléctricos definidos no aporta valor de datos.',
      'Importar un CAD 2D como base y calcarlo en 3D sin conectar los elementos a sistemas eléctricos reales.',
      'No cargar los parámetros compartidos desde el inicio, lo que obliga a reprocesar todo el modelo más adelante.',
      'Tratar el modelo como una entrega final en vez de un proceso vivo que se actualiza durante todo el proyecto.',
    ],
    buenasPracticas: [
      'Empezar todo proyecto desde la plantilla del estudio ya configurada con parámetros compartidos eléctricos.',
      'Validar desde el primer día que cada elemento modelado pertenece a un sistema eléctrico, no solo geometría suelta.',
      'Documentar en la memoria del proyecto qué información vive en el modelo y cuál en documentos aparte.',
      'Revisar periódicamente que el modelo siga siendo la fuente única de verdad del proyecto.',
    ],
    ejemploAplicado:
      'La tarea "Configurar la plantilla de proyecto MEP y cargar los parámetros compartidos eléctricos" (PB-01-07) es el punto exacto donde se decide si un proyecto va a ser BIM real o solo dibujo 3D. Al cargar los parámetros compartidos de circuito, carga y sistema desde el arranque, cada tablero y cada salida que se modele después queda conectado a datos reales, y las tablas de planificación y los cuadros de carga podrán generarse automáticamente en vez de digitarse a mano en un plano aparte.',
    tareasRelacionadas: ['PB-01-07'],
  },
  {
    id: 'M1.2',
    titulo: 'Interfaz y navegación en Revit',
    minutos: 12,
    queEs:
      'La interfaz de Revit organiza el trabajo en cinta de opciones (ribbon), Navegador de proyecto, panel de Propiedades y área de dibujo. Para MEP eléctrico las pestañas clave son Sistemas (paneles, circuitos, cableado, conductos) e Insertar (vínculos y familias), y el Navegador de proyecto es donde viven las vistas, familias, worksets y vínculos del proyecto.',
    paraQueSirve:
      'Dominar la interfaz permite moverse rápido entre vistas eléctricas, encontrar familias de tableros o luminarias, ajustar el rango de vista de una planta y aislar categorías para revisar un sistema específico. Sin esto se pierde tiempo real cada día buscando comandos que deberían ser automáticos.',
    cuandoUsarlo:
      'Desde el primer día en cualquier proyecto, y de forma crítica al configurarlo por primera vez, cuando hay que navegar entre decenas de vistas y encontrar rápido tableros, circuitos o familias específicas.',
    procedimiento: [
      'Identificar las pestañas de la cinta relevantes para eléctrico: Sistemas (paneles, circuitos, cableado), Anotar, Vista.',
      'Explorar el Navegador de proyecto y expandir la carpeta de vistas eléctricas del proyecto.',
      'Usar el panel de Propiedades para revisar el rango de vista de una planta eléctrica ya existente.',
      'Practicar atajos de teclado: VG (visibilidad/gráficos), WT (mosaico de ventanas), ZA (zoom a todo).',
      'Usar el selector de disciplina de vista (Eléctrico) en Propiedades para filtrar qué información se muestra.',
      'Insertar un elemento nuevo (por ejemplo un tomacorriente) y ubicar sus parámetros en el panel de Propiedades para editar su circuito.',
    ],
    erroresFrecuentes: [
      'No cambiar la disciplina de la vista a Eléctrico, dejando visible ruido gráfico de otras disciplinas.',
      'No usar el Navegador de proyecto y navegar todo por scroll dentro del área de dibujo.',
      'Desconocer atajos básicos y repetir clics innecesarios en la cinta para comandos de uso diario.',
      'Ignorar el selector de tipo (Type Selector) y modelar con el tipo de familia incorrecto, por ejemplo un tomacorriente sencillo donde correspondía uno doble.',
    ],
    buenasPracticas: [
      'Personalizar la barra de acceso rápido con los comandos eléctricos usados a diario.',
      'Memorizar los 8-10 atajos de teclado que el estudio use para comandos eléctricos frecuentes.',
      'Mantener organizado el Navegador de proyecto con carpetas por disciplina y por nivel.',
      'Usar plantillas de vista en vez de reconfigurar visibilidad manualmente cada vez que se abre una vista.',
    ],
    ejemploAplicado:
      'La tarea "Configurar la plantilla de proyecto MEP y cargar los parámetros compartidos eléctricos" (PB-01-07) es también la primera tarea real donde un modelador nuevo se enfrenta a la interfaz completa: tiene que moverse entre el Navegador de proyecto para revisar la plantilla, la pestaña Gestionar para cargar parámetros compartidos, y la pestaña Sistemas para confirmar que las categorías eléctricas quedaron disponibles. Dominar la navegación antes de esta tarea evita que se pierda tiempo buscando dónde está cada comando en un momento en que ya hay presión de cronograma.',
    tareasRelacionadas: ['PB-01-07'],
  },
  {
    id: 'M1.3',
    titulo: 'Niveles, rejillas y coordenadas compartidas',
    minutos: 16,
    queEs:
      'Los niveles definen las alturas de referencia (pisos) del proyecto, las rejillas marcan los ejes estructurales, y las coordenadas compartidas alinean geométricamente el modelo eléctrico con los vínculos de arquitectura y estructura para que todas las disciplinas "hablen el mismo idioma espacial" dentro y fuera de Revit (por ejemplo al combinar modelos en Navisworks).',
    paraQueSirve:
      'Sin niveles y rejillas correctamente heredados del modelo arquitectónico, los elementos eléctricos quedan mal alojados (hosts incorrectos), las vistas no cortan a la altura que deberían, y la detección de interferencias arroja falsos positivos o negativos porque los modelos no coinciden en el mismo sistema de coordenadas.',
    cuandoUsarlo:
      'Al inicio de cada proyecto, inmediatamente después de vincular el modelo arquitectónico, y cada vez que arquitectura o estructura envían una nueva versión del vínculo con cambios de niveles o ejes.',
    procedimiento: [
      'Vincular el modelo arquitectónico usando coordenadas compartidas ya publicadas, no "Auto - Origen a Origen" salvo que se confirme que ambos archivos comparten origen real.',
      'Copiar/Monitorear los niveles del vínculo arquitectónico (Colaborar > Copiar/Monitorear > Seleccionar vínculo).',
      'Verificar que cada nivel eléctrico corresponda en nombre y elevación al nivel arquitectónico equivalente.',
      'Copiar/Monitorear las rejillas para mantener los mismos ejes estructurales en todas las disciplinas.',
      'Publicar coordenadas compartidas la primera vez que se establece el vínculo (Coordinar > Coordenadas > Publicar coordenadas compartidas).',
      'Verificar en una vista 3D o de sección que el modelo eléctrico y el vínculo arquitectónico coinciden en cota, sin desfase vertical.',
      'Documentar en la bitácora del proyecto la fecha y versión del vínculo usada como referencia de niveles y rejillas.',
    ],
    erroresFrecuentes: [
      'Vincular "Origen a Origen" cuando los archivos no comparten un origen real, generando desfases de decenas de metros entre disciplinas.',
      'No usar Copiar/Monitorear para los niveles y terminar creando niveles eléctricos duplicados y desincronizados del arquitectónico.',
      'Ignorar actualizaciones del vínculo arquitectónico y seguir modelando sobre una versión vieja de niveles y rejillas.',
      'No publicar coordenadas compartidas, causando que cada disciplina tenga su propio origen al combinar los modelos en Navisworks para coordinación.',
    ],
    buenasPracticas: [
      'Usar siempre Copiar/Monitorear para niveles y rejillas en vez de recrearlos manualmente en el archivo eléctrico.',
      'Revisar niveles y rejillas contra el vínculo cada vez que se recibe una entrega nueva de arquitectura o estructura.',
      'Mantener un registro de cuál archivo es la fuente oficial de coordenadas compartidas del proyecto.',
      'Verificar visualmente en 3D que no hay elementos "flotando" fuera de cota antes de avanzar en el modelado.',
    ],
    ejemploAplicado:
      'Esta lección es la base directa de dos tareas del catálogo: "Vincular los modelos arquitectónico y estructural y establecer coordenadas compartidas" (PB-01-08) es donde se publican y fijan las coordenadas que todo el proyecto usará; y "Verificar que los niveles y las rejillas coincidan con el modelo arquitectónico vinculado" (PB-01-10) es el control posterior que confirma que ese vínculo sigue siendo válido cada vez que arquitectura entrega una nueva versión. Sin ejecutar bien la primera, la segunda tarea siempre va a encontrar desfases.',
    tareasRelacionadas: ['PB-01-08', 'PB-01-10'],
  },
  {
    id: 'M1.4',
    titulo: 'Vistas, plantillas de vista y visibilidad',
    minutos: 15,
    queEs:
      'Una vista es una "ventana" configurable sobre el modelo (planta, corte, 3D). Una plantilla de vista es un conjunto guardado de configuraciones de visibilidad y gráficos que se aplica a muchas vistas a la vez para mantenerlas consistentes. La visibilidad controla qué categorías y elementos se muestran, y con qué color, grosor de línea y patrón de relleno.',
    paraQueSirve:
      'Permite generar decenas de láminas de planimetría eléctrica sin configurar cada vista desde cero, garantiza consistencia gráfica entre planos del mismo estudio y evita que información de otras disciplinas contamine el plano eléctrico final.',
    cuandoUsarlo:
      'Al crear cualquier vista nueva que irá a una lámina de entrega, al estandarizar la presentación gráfica del estudio, y cada vez que se necesite aislar una disciplina o sistema eléctrico específico para revisión interna.',
    procedimiento: [
      'Duplicar la vista de planta base y renombrarla según la convención del proyecto, por ejemplo "E-101 Iluminación Piso 1".',
      'Ajustar el rango de vista (View Range) para que corte a la altura correcta de tableros y luminarias.',
      'Aplicar una plantilla de vista eléctrica existente desde Propiedades > Plantilla de vista.',
      'Si no existe la plantilla adecuada, configurar visibilidad/gráficos (VG) por categoría y guardarla como una nueva plantilla de vista.',
      'Verificar que la disciplina de la vista sea Eléctrico y desactivar categorías de arquitectura o estructura que no aportan al plano.',
      'Colocar la vista dentro del rótulo de lámina correspondiente y verificar escala y anotaciones.',
      'Revisar que los cambios posteriores en el modelo se reflejen automáticamente al reabrir la vista.',
    ],
    erroresFrecuentes: [
      'Configurar visibilidad manualmente vista por vista en lugar de usar plantillas de vista, generando planos inconsistentes entre sí.',
      'Dejar el rango de vista por defecto y que la vista corte a una altura que oculta tableros o luminarias de techo.',
      'Sobrescribir una plantilla de vista compartida sin avisar al equipo, rompiendo la consistencia de otros planos ya entregados.',
      'Mezclar en una misma vista sistemas eléctricos que deberían documentarse por separado, como iluminación y fuerza.',
    ],
    buenasPracticas: [
      'Mantener una biblioteca de plantillas de vista del estudio, reutilizable entre proyectos.',
      'Nombrar vistas y plantillas con una convención clara que indique disciplina, sistema y nivel.',
      'Revisar las plantillas de vista después de cada actualización de parámetros compartidos.',
      'No editar visibilidad directamente en la vista final si ya existe una plantilla asignada; editar la plantilla en su lugar.',
    ],
    ejemploAplicado:
      'La tarea "Crear las vistas de planimetría eléctrica y ubicarlas dentro de los rótulos de las láminas" (PB-03-01) depende directamente de aplicar bien esta lección: cada vista de planta eléctrica que se crea ahí necesita el rango de vista correcto y una plantilla de vista ya construida para no perder tiempo configurando visibilidad lámina por lámina. Esas plantillas reutilizables, a su vez, son justamente lo que construye la tarea "Construir la biblioteca de plantillas de vista reutilizables del estudio" (PB-08-02), que convierte este conocimiento en un activo permanente del estudio.',
    tareasRelacionadas: ['PB-03-01', 'PB-08-02'],
  },
  {
    id: 'M1.5',
    titulo: 'Worksets y trabajo colaborativo',
    minutos: 14,
    queEs:
      'Los worksets son subdivisiones lógicas de un modelo central que permiten que varios usuarios trabajen simultáneamente sobre el mismo archivo. Cada usuario "toma prestados" (borrowing) los elementos que edita y sincroniza sus cambios contra el modelo central compartido en la red.',
    paraQueSirve:
      'Sirve para dividir el modelo eléctrico por zonas o sistemas (por ejemplo iluminación, tomacorrientes, media tensión) de modo que varios modeladores trabajen en paralelo sin bloquearse entre sí ni sobrescribir el trabajo de otros.',
    cuandoUsarlo:
      'En cualquier proyecto donde más de una persona edite el mismo modelo central, especialmente en proyectos grandes divididos por bloques o por sistemas eléctricos; se define desde la configuración inicial del proyecto, no después de que varios ya empezaron a modelar.',
    procedimiento: [
      'Habilitar worksharing en el proyecto (Colaborar > Worksets > habilitar).',
      'Crear worksets por criterio lógico, por ejemplo "Iluminación", "Tomacorrientes", "MT-Subestación", "Vínculos".',
      'Asignar cada elemento nuevo al workset correcto según el sistema eléctrico al que pertenece.',
      'Guardar el archivo como modelo central en la ubicación de red definida por el estudio.',
      'Hacer que cada usuario abra una copia local del modelo central, nunca edite el central directamente.',
      'Sincronizar con el central (Synchronize with Central) con frecuencia, dejando un comentario claro de lo que se hizo.',
      'Revisar y liberar (relinquish) los elementos prestados que ya no se están editando.',
      'Auditar periódicamente qué worksets están abiertos o cerrados para optimizar el rendimiento del archivo.',
    ],
    erroresFrecuentes: [
      'Trabajar directamente sobre el modelo central en vez de una copia local, bloqueando el trabajo de todo el equipo.',
      'No sincronizar con frecuencia, acumulando cambios locales que generan conflictos grandes al final del día.',
      'Crear worksets sin criterio claro, por ejemplo uno por persona en vez de uno por sistema, dificultando abrir o cerrar por disciplina.',
      'No liberar elementos prestados al terminar la sesión, dejando bloqueado el trabajo de otros compañeros.',
    ],
    buenasPracticas: [
      'Definir la estructura de worksets antes de que el equipo empiece a modelar, no sobre la marcha.',
      'Sincronizar con el central al menos cada 1-2 horas y siempre antes de cerrar sesión.',
      'Usar nombres de workset que reflejen sistemas eléctricos reales del proyecto, no nombres genéricos.',
      'Cerrar la visibilidad de los worksets que no se necesitan en el momento para mejorar el rendimiento al modelar.',
    ],
    ejemploAplicado:
      'La tarea "Configurar los worksets del proyecto para el trabajo colaborativo del modelo eléctrico" (PB-01-09) es exactamente esta lección aplicada: definir de entrada worksets como "Iluminación", "Tomacorrientes" o "MT-Subestación" permite que, más adelante, distintos modeladores trabajen en paralelo sobre el mismo modelo central sin pisarse el trabajo, algo indispensable en cualquier proyecto con más de un modelador eléctrico asignado.',
    tareasRelacionadas: ['PB-01-09'],
  },
];

export const M1 = {
  id: 'M1',
  nombre: 'Conceptos básicos',
  icon: 'ti-school',
  nivel: 'Básico',
  descripcion:
    'Los fundamentos que todo modelador MEP eléctrico necesita antes de tocar un proyecto real: qué es BIM en la práctica, cómo moverse en la interfaz de Revit, cómo se alinean niveles y coordenadas entre disciplinas, cómo documentar con vistas y plantillas de vista, y cómo trabajar en equipo con worksets sin pisarse el trabajo.',
  lecciones: M1_LECCIONES,
};
