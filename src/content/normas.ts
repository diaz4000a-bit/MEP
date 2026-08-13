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

  // --- NTC 2050 ---
  NTC2050: {
    fuente: 'NTC 2050 — Código Eléctrico Colombiano (ICONTEC)',
    url: 'https://ebooks.icontec.org/',
  },
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
