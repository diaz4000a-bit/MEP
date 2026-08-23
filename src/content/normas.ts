import type { NotaIngenieria } from '@/types';

/**
 * Registro de la normativa eléctrica colombiana vigente y de los apartes citables
 * desde las notas de ingeniería del catálogo.
 *
 * CONTEXTO IMPORTANTE — el RETIE y el RETILAP fueron reexpedidos el 23 de junio de 2026
 * (Resoluciones 40284 y 40286 de MinEnergía). Ambos pasaron de tener un "Anexo General"
 * con numeración corrida (RETIE 2013: "Art. 20.2") a una estructura de CUATRO LIBROS con
 * numeración `Libro.Título.Artículo` (RETIE 2026: "3.12.1"). Toda cita al articulado
 * anterior quedó obsoleta: no reintroducir referencias del tipo "RETIE Art. 20.2".
 *
 * Los PDF oficiales admiten el fragmento `#page=N` (PDF Open Parameters) y su paginación
 * impresa coincide con la interna, así que cada referencia abre el documento en el aparte
 * citado, no en la portada. Las páginas provienen de la tabla de contenido de cada libro.
 */

export interface Norma {
  id: string;
  nombre: string;
  titulo: string;
  resolucion: string;
  expedida: string;          // 'YYYY-MM-DD'
  emisor: string;
  url: string;
}

/** Referencia citable a un aparte concreto de una norma. */
export interface ReferenciaNorma {
  /** Texto de la fuente tal como se muestra al usuario. */
  fuente: string;
  /** Enlace directo al documento oficial, anclado al aparte citado. */
  url: string;
}

const MINENERGIA_DOCS = 'https://www.minenergia.gov.co/documents';
const RETIE_L1 = `${MINENERGIA_DOCS}/15919/Libro-1-Resolucion-40284-23-06-2026.pdf`;
const RETIE_L2 = `${MINENERGIA_DOCS}/15920/Libro-2-Resolucion-40284-23-06-2026.pdf`;
const RETIE_L3 = `${MINENERGIA_DOCS}/15921/Libro-3-Resolucion-40284-23-06-2026.pdf`;
const RETIE_L4 = `${MINENERGIA_DOCS}/15922/Libro-4-Resolucion-40284-23-06-2026.pdf`;
const RETILAP_L2 = `${MINENERGIA_DOCS}/15907/02-Libro-2-RETILAP-2026.pdf`;
const RETILAP_L3 = `${MINENERGIA_DOCS}/15908/03-Libro-3-RETILAP-2026.pdf`;

const URL_RETIE_LIBRO: Record<string, string> = { L1: RETIE_L1, L2: RETIE_L2, L3: RETIE_L3, L4: RETIE_L4 };
const URL_RETILAP_LIBRO: Record<string, string> = { L2: RETILAP_L2, L3: RETILAP_L3 };

export const NORMAS: Norma[] = [
  {
    id: 'retie',
    nombre: 'RETIE',
    titulo: 'Reglamento Técnico de Instalaciones Eléctricas',
    resolucion: 'Resolución 40284 de 2026',
    expedida: '2026-06-23',
    emisor: 'Ministerio de Minas y Energía',
    url: 'https://www.minenergia.gov.co/es/misional/energia-electrica-2/reglamentos-tecnicos/reglamento-t%C3%A9cnico-de-instalaciones-el%C3%A9ctricas-retie/',
  },
  {
    id: 'retilap',
    nombre: 'RETILAP',
    titulo: 'Reglamento Técnico de Iluminación y Alumbrado Público',
    resolucion: 'Resolución 40286 de 2026',
    expedida: '2026-06-23',
    emisor: 'Ministerio de Minas y Energía',
    url: 'https://www.minenergia.gov.co/es/misional/energia-electrica-2/reglamentos-tecnicos/reglamento-t%C3%A9cnico-de-iluminaci%C3%B3n-y-alumbrado-p%C3%BAblico-retilap/',
  },
  {
    id: 'ntc2050',
    nombre: 'NTC 2050',
    titulo: 'Código Eléctrico Colombiano',
    resolucion: 'NTC 2050 (segunda actualización)',
    expedida: '2020-11-25',
    emisor: 'ICONTEC',
    url: 'https://ebooks.icontec.org/',
  },
];

/** Dominios permitidos en `NotaIngenieria.url`. Cierra la puerta a enlaces arbitrarios. */
export const DOMINIOS_NORMA_PERMITIDOS: readonly string[] = [
  'minenergia.gov.co',
  'www.minenergia.gov.co',
  'ebooks.icontec.org',
  'www.icontec.org',
  // Norma del operador de red. Ver el bloque LK_* mas abajo: aplica solo al territorio
  // de Enel Colombia (Bogota y Cundinamarca).
  'likinormas.enelcol.com.co',
];

function retie(libro: 'L1' | 'L2' | 'L3' | 'L4', aparte: string, pagina: number): ReferenciaNorma {
  return {
    fuente: `RETIE (Res. 40284 de 2026) — Libro ${libro.slice(1)}, ${aparte}`,
    url: `${URL_RETIE_LIBRO[libro]}#page=${pagina}`,
  };
}

function retilap(libro: 'L2' | 'L3', aparte: string, pagina: number): ReferenciaNorma {
  return {
    fuente: `RETILAP (Res. 40286 de 2026) — Libro ${libro.slice(1)}, ${aparte}`,
    url: `${URL_RETILAP_LIBRO[libro]}#page=${pagina}`,
  };
}

/**
 * NTC 2050 — Código Eléctrico Colombiano (ICONTEC).
 *
 * El RETIE fija QUÉ hay que cumplir y remite a la NTC 2050 para CÓMO se calcula: calibres,
 * capacidad de corriente, ocupación de canalizaciones, volumen de cajas, cargas por vivienda.
 * Por eso una nota que hable de tablas o de dimensionamiento debe citar el artículo concreto
 * de la NTC, no "RETIE" a secas ni "NTC 2050" a secas — el usuario acaba dando vueltas entre
 * los dos documentos sin llegar al número.
 *
 * La numeración es la del articulado NTC 2050 (Sección-Artículo, p. ej. 210-52) y los títulos
 * están transcritos literalmente de la tabla de contenido de la norma. La `url` es siempre la
 * tienda oficial de ICONTEC: la norma NO es de descarga libre, así que no existe un enlace
 * profundo público al que anclar cada artículo. Lo específico va en `fuente`.
 */
const NTC2050_URL = 'https://ebooks.icontec.org/';

function ntc(aparte: string): ReferenciaNorma {
  return { fuente: `NTC 2050 (Código Eléctrico Colombiano) — ${aparte}`, url: NTC2050_URL };
}

/**
 * Likinormas — normas técnicas del operador de red Enel Colombia (antes Codensa).
 *
 * OJO CON EL ALCANCE: Likinormas es obligatoria en el territorio de Enel Colombia (Bogotá y
 * Cundinamarca). En otras regiones manda la norma del operador de red que atienda el proyecto
 * (Afinia en la costa Caribe, EPM en Antioquia, etc.); el requisito equivalente existe, pero
 * el código de norma NO es el mismo. Por eso cada nota que cite Likinormas dice de quién es.
 *
 * Lo que aporta frente a RETIE/NTC: el detalle constructivo que el reglamento nacional deja
 * abierto y que el OR sí fija — dimensiones de armarios de medidores, ubicación en el hall de
 * acceso, ductos y cajas de acometida, esquemas de medida. Es lo que rechaza una revisión de
 * proyecto en obra residencial.
 *
 * Las URL apuntan al índice de la sección, no a cada ficha: el portal reorganiza sus rutas y
 * un enlace profundo inventado sería peor que uno que sí abre. El código exacto va en `fuente`.
 */
const LIKINORMAS_ACOMETIDAS = 'https://likinormas.enelcol.com.co/normas/acometidas-y-medidores';

function likinormas(codigo: string, titulo: string, url: string = LIKINORMAS_ACOMETIDAS): ReferenciaNorma {
  return { fuente: `Likinormas (Enel Colombia, operador de red) — ${codigo}: ${titulo}`, url };
}

/**
 * Apartes citables. Las páginas salen de la tabla de contenido de cada libro oficial;
 * si MinEnergía reexpide el reglamento hay que revisar este mapa completo, no las 58 tareas.
 */
export const REF = {
  // --- RETIE Libro 3 — Instalaciones ---
  RESPONSABILIDAD_DISENADOR: retie('L3', 'Título 2, Art. 3.2.3 (Responsabilidad del diseñador)', 16),
  REQUIEREN_DISENO: retie('L3', 'Título 3, Art. 3.3.1 (Instalaciones que requieren diseño)', 17),
  ESQUEMA_CONSTRUCTIVO: retie('L3', 'Título 3, Art. 3.3.2 (Instalaciones que requieren esquema constructivo)', 19),
  CRITERIOS_DISENO: retie('L3', 'Título 3, Art. 3.3.3 (Criterios particulares de diseño)', 20),
  ESPACIOS_MONTAJE: retie('L3', 'Título 4 (Espacios para montaje de equipos y distancias mínimas de seguridad)', 24),
  CODIGO_COLORES: retie('L3', 'Título 5 (Código de colores para conductores de uso eléctrico)', 26),
  OPERACION_MANTENIMIENTO: retie('L3', 'Título 6 (Operación y mantenimiento de instalaciones eléctricas)', 27),
  PROTECCIONES_GENERAL: retie('L3', 'Título 8, Art. 3.8.1 (Requisitos generales de las protecciones)', 29),
  NIVELES_TENSION: retie('L3', 'Título 9 (Clasificación de los niveles de tensión)', 30),
  DISTANCIAS_SEGURIDAD: retie('L3', 'Título 10 (Distancias de seguridad)', 31),
  DISTANCIAS_CONSTRUCCIONES: retie('L3', 'Título 10, Art. 3.10.1 (Distancias mínimas en zonas con construcciones)', 32),
  CAMPOS_ELECTROMAGNETICOS: retie('L3', 'Título 11 (Campos electromagnéticos)', 40),
  SPT_GENERAL: retie('L3', 'Título 12, Art. 3.12.1 (Requisitos generales del sistema de puesta a tierra)', 42),
  SPT_COMPONENTES: retie('L3', 'Título 12, Art. 3.12.2 (Componentes de los sistemas de puesta a tierra)', 44),
  SPT_RESISTENCIA: retie('L3', 'Título 12, Art. 3.12.3 (Valores de referencia de resistencia de puesta a tierra)', 47),
  SPT_MEDICIONES: retie('L3', 'Título 12, Art. 3.12.4 (Mediciones para sistemas de puesta a tierra)', 48),
  PROTECCION_RAYOS: retie('L3', 'Título 13, Art. 3.13.1 (Protección contra rayos)', 52),
  REDES_ILUMINACION: retie('L3', 'Título 14, Art. 3.14.1 (Redes eléctricas de sistemas de iluminación)', 56),
  BOVEDAS: retie('L3', 'Título 17, Art. 3.17.4 (Bóvedas)', 69),
  CAJAS_CONDULETAS: retie('L3', 'Título 17, Art. 3.17.5 (Cajas y conduletas)', 69),
  CANALIZACIONES: retie('L3', 'Título 17, Art. 3.17.6 (Canalizaciones y bandejas portacables)', 70),
  CARGADORES_VE: retie('L3', 'Título 17, Art. 3.17.7 (Cargadores de baterías para vehículos eléctricos)', 77),
  CELDAS_TABLEROS: retie('L3', 'Título 17, Art. 3.17.8 (Celdas y tableros)', 79),
  TOMACORRIENTES: retie('L3', 'Título 17, Art. 3.17.10 (Clavijas y tomacorrientes)', 82),
  COMPUERTAS_VENTILACION: retie('L3', 'Título 17, Art. 3.17.11 (Compuertas de ventilación)', 83),
  CONDUCTORES_AISLADOS: retie('L3', 'Título 17, Art. 3.17.13 (Conductores aislados)', 84),
  DPS: retie('L3', 'Título 17, Art. 3.17.14 (Dispositivos de protección contra sobretensiones – DPS)', 87),
  ELEMENTOS_CONEXION: retie('L3', 'Título 17, Art. 3.17.16 (Elementos de conexión)', 89),
  EQUIPOS_MEDIA_TENSION: retie('L3', 'Título 17, Art. 3.17.17 (Equipos de media tensión)', 90),
  INTERRUPTORES_BT: retie('L3', 'Título 17, Art. 3.17.19 (Interruptores automáticos de baja tensión)', 91),
  MOTORES_GRUPOS: retie('L3', 'Título 17, Art. 3.17.22 (Motores, generadores eléctricos y grupos electrógenos)', 93),
  PANELES_SOLARES: retie('L3', 'Título 17, Art. 3.17.23 (Paneles solares fotovoltaicos)', 94),
  PUERTAS_CORTAFUEGO: retie('L3', 'Título 17, Art. 3.17.24 (Puertas cortafuego)', 97),
  SELLOS_CORTAFUEGO: retie('L3', 'Título 17, Art. 3.17.26 (Sellos cortafuego)', 99),
  TRANSFERENCIAS: retie('L3', 'Título 17, Art. 3.17.27 (Transferencias automáticas y sus sistemas de control)', 99),
  TRANSFORMADORES: retie('L3', 'Título 17, Art. 3.17.28 (Transformadores de potencia y distribución)', 99),
  UPS: retie('L3', 'Título 17, Art. 3.17.29 (Unidades de potencia ininterrumpida – UPS)', 102),
  SERVIDUMBRES: retie('L3', 'Título 19, Art. 3.19.1 (Zonas de servidumbre)', 109),
  REDES_DISTRIBUCION: retie('L3', 'Título 20 (Requisitos generales de redes de distribución)', 119),
  SPT_DISTRIBUCION: retie('L3', 'Título 20, Art. 3.20.3 (Puestas a tierra de redes de distribución)', 121),
  TABLEROS_USO_PUBLICO: retie('L3', 'Título 20, Art. 3.20.7 (Tableros de distribución en espacios de uso público)', 127),
  SUBESTACIONES_GENERAL: retie('L3', 'Título 22 (Requisitos generales de subestaciones)', 130),
  SUBESTACIONES_EXTERIORES: retie('L3', 'Título 22, Art. 3.22.1 (Distancias de seguridad en subestaciones exteriores)', 132),
  SUBESTACIONES_INTERIORES: retie('L3', 'Título 22, Art. 3.22.2 (Distancias de seguridad en subestaciones interiores)', 136),
  SUBESTACION_MT_INTERIOR: retie('L3', 'Título 23, Art. 3.23.2 (Subestaciones de media tensión tipo interior o en edificaciones)', 137),
  SUBESTACION_POSTE: retie('L3', 'Título 23, Art. 3.23.3 (Subestaciones tipo poste)', 139),
  SUBESTACION_PEDESTAL: retie('L3', 'Título 23, Art. 3.23.4 (Subestaciones tipo pedestal o tipo jardín)', 140),
  SUBESTACION_PREFABRICADA: retie('L3', 'Título 23, Art. 3.23.5 (Cuartos de subestación paquetizadas o prefabricados)', 140),
  NORMAS_TECNICAS: retie('L3', 'Título 24 (Aplicación de normas técnicas)', 142),
  RCT: retie('L3', 'Título 25 (Régimen de conexión a tierra – RCT)', 142),
  ACOMETIDAS: retie('L3', 'Título 26 (Acometidas)', 143),
  PROTECCION_USO_FINAL: retie('L3', 'Título 27 (Protección de las instalaciones de uso final)', 145),
  PROTECCION_AISLAMIENTO: retie('L3', 'Título 27, Art. 3.27.2 (Medidas de protección contra falla de aislamiento)', 145),
  SOBRECORRIENTES: retie('L3', 'Título 27, Art. 3.27.3 (Protecciones contra sobrecorrientes)', 146),
  INSTALACIONES_BASICAS: retie('L3', 'Título 28, Art. 3.28.1 (Instalaciones básicas)', 147),
  INSTALACIONES_ESPECIALES: retie('L3', 'Título 28, Art. 3.28.3 (Instalaciones especiales)', 150),
  ALTA_CONCENTRACION: retie('L3', 'Título 28, Art. 3.28.3.3 (Sitios con alta concentración de personas)', 150),
  EQUIPOS_ESPECIALES: retie('L3', 'Título 28, Art. 3.28.4 (Instalación de equipos especiales)', 162),
  ASCENSORES: retie('L3', 'Título 28, Art. 3.28.4.2 (Ascensores, escaleras y andenes móviles)', 162),
  BOMBAS_INCENDIO: retie('L3', 'Título 28, Art. 3.28.4.7 (Bombas contra incendio)', 162),
  SISTEMAS_EMERGENCIA: retie('L3', 'Título 28, Art. 3.28.4.8 (Sistemas de emergencia)', 162),

  // --- RETIE Libro 4 — Evaluación de la conformidad ---
  INSPECCION_CERTIFICACION: retie('L4', 'Título 3, Art. 4.3.1 (Inspección con fines de certificación)', 24),
  CERTIFICACION_PLENA: retie('L4', 'Título 3, Art. 4.3.2 (Instalaciones que requieren Certificación Plena)', 27),
  REVISION_INSTALACIONES: retie('L4', 'Título 3, Art. 4.3.4 (Revisión de las instalaciones)', 31),
  DECLARACION_CUMPLIMIENTO: retie('L4', 'Título 3, Art. 4.3.6 (Formatos de la declaración de cumplimiento)', 33),
  DICTAMEN_INSPECCION: retie('L4', 'Título 3, Art. 4.3.7 (Formatos para dictamen de inspección)', 37),

  // --- RETIE Libro 2 — Productos ---
  PRODUCTOS_RETIE: {
    fuente: 'RETIE (Res. 40284 de 2026) — Libro 2 (Productos objeto del RETIE)',
    url: RETIE_L2,
  },

  // --- RETILAP Libro 3 — Instalaciones de sistemas de iluminación ---
  ILUM_CONSIDERACIONES: retilap('L3', 'Título 1, Art. 3.1.1 (Consideraciones generales)', 4),
  ILUM_FOTOMETRIAS: retilap('L3', 'Título 1, Art. 3.1.2 (Fotometrías y matriz de intensidades)', 5),
  ILUM_ASPECTOS_PREVIOS: retilap('L3', 'Título 1, Art. 3.1.3 (Aspectos previos del proyecto de iluminación)', 6),
  ILUM_FASES: retilap('L3', 'Título 1, Art. 3.1.4 (Fases para la realización de un proyecto de iluminación)', 9),
  ILUM_CRITERIOS_INTERIOR: retilap('L3', 'Título 2, Art. 3.2.1 (Criterios para proyecto de iluminación interior)', 12),
  ILUM_REQUISITOS_INTERIOR: retilap('L3', 'Título 2, Art. 3.2.2 (Requisitos de iluminación interior)', 22),
  ILUM_CALCULOS: retilap('L3', 'Título 2, Art. 3.2.3 (Cálculos para iluminación interior)', 50),
  ILUM_EMERGENCIA: retilap('L3', 'Título 2, Art. 3.2.4 (Iluminación de emergencia)', 51),
  ILUM_EFICIENCIA: retilap('L3', 'Título 2, Art. 3.2.5 (Eficiencia energética en iluminación interior)', 62),
  ILUM_CONTROL: retilap('L3', 'Título 2, Art. 3.2.6 (Eficiencia energética mediante control del alumbrado)', 64),
  ILUM_EXTERIOR: retilap('L3', 'Título 4, Art. 3.4.1 (Iluminación de grandes áreas en espacios exteriores)', 112),
  ILUM_PRODUCTOS: {
    fuente: 'RETILAP (Res. 40286 de 2026) — Libro 2 (Productos objeto del RETILAP)',
    url: RETILAP_L2,
  },

  // --- NTC 2050 — Capítulo 1: generalidades ---
  NTC_ESPACIO_TRABAJO: ntc('Art. 110-16 (Espacio alrededor de los equipos eléctricos, para 600 V nominales o menos)'),
  NTC_ROTULADO: ntc('Art. 110-21 (Rotulado)'),
  NTC_IDENT_DESCONEXION: ntc('Art. 110-22 (Identificación de los medios de desconexión)'),
  NTC_CONEXIONES: ntc('Art. 110-14 (Conexiones eléctricas)'),

  // --- NTC 2050 — Sección 210: circuitos ramales (el núcleo de la vivienda) ---
  NTC_CIRCUITOS_RAMALES: ntc('Sección 210 (Circuitos ramales)'),
  NTC_GFCI: ntc('Art. 210-8 (Protección de las personas mediante interruptores de circuito por falla a tierra)'),
  NTC_CALIBRE_RAMAL: ntc('Art. 210-19 (Conductores: capacidad de corriente y sección transversal mínima)'),
  NTC_PROTECCION_RAMAL: ntc('Art. 210-20 (Protección contra sobrecorriente)'),
  NTC_CARGAS_PERMISIBLES: ntc('Art. 210-23 (Cargas permisibles)'),
  NTC_RAMALES_ZONAS_COMUNES: ntc('Art. 210-25 (Circuitos ramales para zonas comunes)'),
  NTC_TOMAS_VIVIENDA: ntc('Art. 210-52 (Salidas de tomacorriente en unidades de vivienda)'),
  NTC_TOMAS_EQUIPOS: ntc('Art. 210-63 (Salidas para equipos de calefacción, congelador y aire acondicionado)'),
  NTC_SALIDAS_ALUMBRADO: ntc('Art. 210-70 (Salidas necesarias para alumbrado)'),

  // --- NTC 2050 — Sección 220: cálculo de cargas ---
  NTC_CALCULO_RAMALES: ntc('Art. 220-3 (Cálculo de los circuitos ramales)'),
  NTC_RAMALES_NECESARIOS: ntc('Art. 220-4 (Circuitos ramales necesarios)'),
  NTC_ALUMBRADO_GENERAL: ntc('Art. 220-11 (Alumbrado general: factores de demanda)'),
  NTC_PEQUENOS_ELECTRO: ntc('Art. 220-16 (Cargas para pequeños electrodomésticos, planchado y lavandería en unidades de vivienda)'),
  NTC_ARTEFACTOS_VIVIENDA: ntc('Art. 220-17 (Carga para artefactos en unidades de vivienda)'),
  NTC_SECADORAS: ntc('Art. 220-18 (Secadoras eléctricas de ropa en unidades de vivienda)'),
  NTC_ESTUFAS: ntc('Art. 220-19 (Estufas eléctricas y otros artefactos de cocina en unidades de vivienda)'),
  NTC_NEUTRO_ALIMENTADOR: ntc('Art. 220-22 (Carga del neutro del alimentador)'),
  NTC_OPCIONAL_VIVIENDA: ntc('Art. 220-30 (Cálculos opcionales: unidades de vivienda)'),
  NTC_OPCIONAL_MULTIFAMILIAR: ntc('Art. 220-32 (Cálculos opcionales en viviendas multifamiliares)'),
  NTC_OPCIONAL_BIFAMILIAR: ntc('Art. 220-33 (Cálculo opcional para viviendas bifamiliares)'),
  NTC_OPCIONAL_OR: ntc('Art. 220-37 (Cálculo opcional en viviendas multifamiliares o grupos de viviendas según la reglamentación de las empresas locales de energía)'),
  // --- NTC 2050 — Secciones 225/230: exteriores y acometidas ---
  NTC_EXTERIORES: ntc('Sección 225 (Circuitos ramales y alimentadores exteriores)'),
  NTC_ACOMETIDAS: ntc('Sección 230 (Acometidas)'),
  NTC_ACOMETIDA_SUBTERRANEA: ntc('Art. 230-31 (Acometida subterránea: calibre y capacidad de corriente)'),
  NTC_DESCONEXION_ACOMETIDA: ntc('Art. 230-70 (Medios de desconexión de la acometida: generalidades)'),
  NTC_MAX_DESCONEXIONES: ntc('Art. 230-71 (Número máximo de medios de desconexión)'),
  NTC_CAPACIDAD_DESCONEXION: ntc('Art. 230-79 (Capacidad nominal del equipo de desconexión)'),

  // --- NTC 2050 — Secciones 240/250/280: protecciones, tierras y sobretensiones ---
  NTC_SOBRECORRIENTE: ntc('Sección 240 (Protección contra sobrecorriente)'),
  NTC_PROTECCION_CONDUCTORES: ntc('Art. 240-3 (Protección de los conductores)'),
  NTC_CORRIENTES_NORMALIZADAS: ntc('Art. 240-6 (Corrientes nominales normalizadas)'),
  NTC_PUESTA_TIERRA: ntc('Sección 250 (Puesta a tierra)'),
  NTC_CAMINO_TIERRA: ntc('Art. 250-51 (Camino efectivo de puesta a tierra)'),
  NTC_EQUIPOTENCIAL: ntc('Art. 250-79 (Puentes de conexión equipotencial principal y de equipos)'),
  NTC_ELECTRODO: ntc('Art. 250-81 (Instalación del electrodo de puesta a tierra del sistema)'),
  NTC_ELECTRODOS_FABRICADOS: ntc('Art. 250-83 (Electrodos fabricados y otros electrodos)'),
  NTC_RESISTENCIA_ELECTRODO: ntc('Art. 250-84 (Resistencia de los electrodos fabricados)'),
  NTC_CALIBRE_ELECTRODO: ntc('Art. 250-94 (Calibre del conductor del electrodo de puesta a tierra en instalaciones de corriente alterna)'),
  NTC_CALIBRE_TIERRA_EQUIPOS: ntc('Art. 250-95 (Calibre de los conductores de puesta a tierra de los equipos)'),
  NTC_TIERRA_TOMA_CAJA: ntc('Art. 250-74 (Conexión del terminal de puesta a tierra de un tomacorriente a una caja)'),
  NTC_TIERRA_PARARRAYOS: ntc('Art. 250-86 (Uso de la puesta a tierra de pararrayos)'),
  NTC_DPS: ntc('Sección 280 (Descargadores de sobretensiones)'),
  NTC_DPS_UBICACION: ntc('Art. 280-11 (Ubicación de los descargadores de sobretensiones)'),
  // --- NTC 2050 — Capítulo 3: métodos y materiales de las instalaciones ---
  NTC_METODOS_ALAMBRADO: ntc('Sección 300 (Métodos de alambrado)'),
  NTC_DANOS_FISICOS: ntc('Art. 300-4 (Protección contra daños físicos)'),
  NTC_SUBTERRANEAS: ntc('Art. 300-5 (Instalaciones subterráneas)'),
  NTC_CUANDO_CAJA: ntc('Art. 300-15 (Cajas, conduletas o accesorios: cuándo son necesarios)'),
  NTC_NUM_CONDUCTORES_CANALIZACION: ntc('Art. 300-17 (Número y tamaño de los conductores en una canalización)'),
  NTC_PROPAGACION_FUEGO: ntc('Art. 300-21 (Propagación del fuego o de los productos de combustión)'),
  NTC_PLENUM: ntc('Art. 300-22 (Alambrado en ductos, cámaras de aire y otros espacios de circulación de aire)'),
  NTC_PROVISIONALES: ntc('Sección 305 (Instalaciones provisionales)'),
  NTC_CONDUCTORES: ntc('Sección 310 (Conductores para instalaciones en general)'),
  NTC_CALIBRE_MINIMO: ntc('Art. 310-5 (Calibre mínimo de los conductores)'),
  NTC_IDENT_CONDUCTORES: ntc('Art. 310-12 (Identificación de los conductores)'),
  NTC_AMPACIDAD: ntc('Art. 310-15 (Capacidad de corriente)'),
  NTC_BANDEJAS: ntc('Sección 318 (Bandejas portacables)'),
  NTC_BANDEJAS_INSTALACION: ntc('Art. 318-6 (Bandejas portacables: instalación)'),
  NTC_BANDEJAS_TIERRA: ntc('Art. 318-7 (Bandejas portacables: puesta a tierra)'),
  NTC_BANDEJAS_NUM_CABLES: ntc('Art. 318-9 (Número de cables multiconductores para 2 000 V nominales o menos en bandejas portacables)'),
  NTC_IMC: ntc('Sección 345 (Tubo conduit metálico intermedio – NTC 169, Tipo IMC)'),
  NTC_CONDUIT_RIGIDO: ntc('Sección 346 (Tubo conduit metálico rígido – NTC 171)'),
  NTC_PVC: ntc('Sección 347 (Tubo conduit rígido no metálico)'),
  NTC_EMT: ntc('Sección 348 (Tubería eléctrica metálica – NTC 105, Tipo EMT)'),
  NTC_OCUPACION_TUBERIA: ntc('Capítulo 9, Cuadro 1 y Anexo C (porcentaje de ocupación y número máximo de conductores por tubería)'),
  NTC_CAJAS: ntc('Sección 370 (Cajas de salida, de dispositivos, de paso y de empalmes, conduletas y sus accesorios)'),
  NTC_VOLUMEN_CAJAS: ntc('Art. 370-16 (Número de conductores en las cajas de salida, de dispositivos y de empalmes y en las conduletas)'),
  NTC_CAJAS_PASO: ntc('Art. 370-28 (Cajas de paso y de unión)'),
  NTC_CAJAS_ACCESIBLES: ntc('Art. 370-29 (Conduletas, cajas de empalmes, de paso y de salida que deben ser accesibles)'),
  NTC_ARMARIOS: ntc('Sección 373 (Armarios, cajas de corte y tableros de medidores enchufables)'),
  NTC_CURVATURA_CONDUCTORES: ntc('Art. 373-6 (Curvatura de los conductores)'),
  NTC_INTERRUPTORES: ntc('Sección 380 (Interruptores)'),
  NTC_TABLEROS: ntc('Sección 384 (Cuadros de distribución y paneles de distribución)'),
  NTC_PANEL_ALUMBRADO: ntc('Art. 384-14 (Panel de distribución para circuito ramal de alumbrado y artefactos)'),
  NTC_MAX_CIRCUITOS_TABLERO: ntc('Art. 384-15 (Número de dispositivos de protección contra sobrecorriente en un panel de distribución)'),
  NTC_TABLERO_PROTECCION: ntc('Art. 384-16 (Paneles de distribución: protección contra sobrecorriente)'),
  NTC_TABLERO_TIERRA: ntc('Art. 384-20 (Puesta a tierra de los paneles de distribución)'),
  NTC_TABLERO_DISTANCIAS: ntc('Art. 384-36 (Distancias mínimas)'),
  // --- NTC 2050 — Capítulo 4: equipos para uso general ---
  NTC_ALUMBRADO_APARATOS: ntc('Sección 410 (Aparatos de alumbrado, portabombillas, bombillas y tomacorrientes)'),
  NTC_ALUMBRADO_ROPEROS: ntc('Art. 410-8 (Aparatos de alumbrado en roperos)'),
  NTC_TOMAS_CAPACIDAD: ntc('Art. 410-56 (Tomacorrientes: capacidad nominal y tipo)'),
  NTC_TOMAS_HUMEDOS: ntc('Art. 410-57 (Tomacorrientes en lugares húmedos o mojados)'),
  NTC_TOMAS_POLO_TIERRA: ntc('Art. 410-58 (Tomacorrientes, adaptadores, conectores y clavijas del tipo con polo a tierra)'),
  NTC_ARTEFACTOS: ntc('Sección 422 (Artefactos eléctricos)'),
  NTC_CALEFACCION: ntc('Sección 424 (Equipos eléctricos fijos para calefacción de ambiente)'),
  NTC_MOTORES: ntc('Sección 430 (Motores, circuitos de motores y controladores)'),
  NTC_AIRE_ACONDICIONADO: ntc('Sección 440 (Equipos de aire acondicionado y refrigeración)'),
  NTC_GENERADORES: ntc('Sección 445 (Generadores)'),
  NTC_TRANSFORMADORES: ntc('Sección 450 (Transformadores y bóvedas para transformadores)'),
  NTC_TRANSFORMADOR_PROTECCION: ntc('Art. 450-3 (Transformadores: protección contra sobrecorriente)'),
  NTC_TRANSFORMADOR_VENTILACION: ntc('Art. 450-9 (Transformadores: ventilación)'),
  NTC_TRANSFORMADOR_SECO: ntc('Art. 450-21 (Transformadores tipo seco instalados en interiores)'),

  // --- NTC 2050 — Capítulos 6 y 7: equipos y condiciones especiales ---
  NTC_ASCENSORES: ntc('Sección 620 (Ascensores, montacargas, escaleras y pasillos mecánicos)'),
  NTC_CARGA_VE: ntc('Sección 625 (Equipos para sistemas de carga de vehículos eléctricos)'),
  NTC_PISCINAS: ntc('Sección 680 (Piscinas, fuentes e instalaciones similares)'),
  NTC_PISCINAS_GFCI: ntc('Art. 680-5 (Piscinas: transformadores e interruptores de circuito por falla a tierra)'),
  NTC_PISCINAS_TOMAS: ntc('Art. 680-6 (Piscinas: tomacorrientes, aparatos de alumbrado, salidas para alumbrado, interruptores y ventiladores)'),
  NTC_FOTOVOLTAICO: ntc('Sección 690 (Sistemas solares fotovoltaicos)'),
  NTC_BOMBAS_INCENDIO: ntc('Sección 695 (Bombas contra incendios)'),
  NTC_EMERGENCIA: ntc('Sección 700 (Sistemas de emergencia)'),
  NTC_RESERVA_REQUERIDA: ntc('Sección 701 (Sistemas de reserva legalmente requeridos)'),
  NTC_RESERVA_OPCIONAL: ntc('Sección 702 (Sistemas de reserva opcionales)'),
  NTC_CLASE_1_2_3: ntc('Sección 725 (Circuitos Clase 1, Clase 2 y Clase 3 de control remoto, de señalización y de potencia limitada)'),
  NTC_ALARMA_INCENDIO: ntc('Sección 760 (Sistemas de alarma contraincendios)'),
  NTC_FIBRA_OPTICA: ntc('Sección 770 (Cables y canalizaciones de fibra óptica)'),
  NTC_COMUNICACIONES: ntc('Artículo 800 (Circuitos de comunicaciones)'),
  NTC_TV: ntc('Artículo 820 (Sistemas de distribución de antenas colectivas de radio y TV)'),
  // --- Likinormas (Enel Colombia) — acometidas y medidores en obra residencial ---
  LK_GENERALIDADES_ACOMETIDAS: likinormas('Generalidades 7.2', 'Acometidas eléctricas'),
  LK_GENERALIDADES_CAJAS: likinormas('Generalidades 7.3', 'Cajas, armarios y celdas'),
  LK_GENERALIDADES_MEDIDORES: likinormas('Generalidades 7.4', 'Medidores de energía eléctrica'),
  LK_FORMA_MEDIDA: likinormas('Generalidades 7.4.2', 'Formas para medir la energía según carga contratada'),
  LK_SISTEMAS_EMERGENCIA: likinormas('Generalidades 7.6', 'Sistemas de emergencia instalados por el cliente'),
  LK_UNIFILAR_ACOMETIDAS: likinormas('AE200', 'Diagrama unifilar para acometidas y tableros'),
  LK_ACOMETIDA_SUBTERRANEA: likinormas('AE229', 'Acometida subterránea de baja tensión'),
  LK_MAX_CONDUCTORES_TUBO: likinormas('AE235', 'Número máximo de conductores monopolares de B.T. por tubo'),
  LK_DUCTOS_ACOMETIDA: likinormas('AE237', 'Canalizaciones, ductos y cajas. Acometidas subterráneas de baja tensión'),
  LK_SOPORTE_DUCTERIA_SOTANO: likinormas('AE288', 'Detalles para soporte de ductería en sótanos'),
  LK_PROVISIONAL_OBRA: likinormas('AE290', 'Acometidas para provisional de obras'),
  LK_CAJAS_ARMARIOS_CELDAS: likinormas('AE300', 'Cajas, armarios y celdas para instalación de medidores'),
  LK_ARMARIO_HALL: likinormas('AE307', 'Ubicación de armario de medidores en hall de acceso'),
  LK_ARMARIO_MEDIDORES: likinormas('AE308', 'Armario de medidores. Especificaciones generales'),
  LK_CAJA_PROTECCION_ACOMETIDA: likinormas('AE310', 'Caja para protección de acometida'),
  LK_TABLERO_GENERAL_ACOMETIDAS: likinormas('AE311', 'Tablero general de acometidas'),
  LK_MEDIDA_SEMIDIRECTA: likinormas('AE314', 'Medición semidirecta'),
  LK_CELDA_MEDIDA_MT: likinormas('AE324', 'Celdas de medida en 11,4 kV, 13,2 kV y 34,5 kV'),
  LK_TRANSFERENCIA_ARMARIO: likinormas('AE604', 'Transferencia de planta de emergencia después del armario de medidores'),
  LK_BOMBA_INCENDIO: likinormas('AE607', 'Bomba contra incendios'),
} as const satisfies Record<string, ReferenciaNorma>;

export type ClaveReferencia = keyof typeof REF;

/**
 * Nota respaldada por una norma: se muestra con la fuente enlazada y sin aviso.
 * Usar solo cuando el enunciado sale del reglamento, no del criterio del proyecto.
 */
export function notaNorma(texto: string, ref: ReferenciaNorma): NotaIngenieria {
  return { texto, fuente: ref.fuente, url: ref.url, verificar: false };
}

/**
 * Nota que cita la norma PERO cuyo valor concreto depende del diseño del proyecto
 * (calibres, resistencia de puesta a tierra, niveles de iluminancia, factores de demanda).
 * Se muestra con la fuente enlazada Y con el aviso de verificar: el reglamento fija el
 * requisito, no el número que va en el modelo.
 */
export function notaNormaVerificar(texto: string, ref: ReferenciaNorma): NotaIngenieria {
  return { texto, fuente: ref.fuente, url: ref.url, verificar: true };
}

/** Nota sin respaldo normativo: criterio de oficina o del diseñador. Siempre con aviso. */
export function notaCriterio(texto: string): NotaIngenieria {
  return { texto, fuente: null, url: null, verificar: true };
}
