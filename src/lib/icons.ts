import {
  IconAffiliate,
  IconAward,
  IconBolt,
  IconBox,
  IconChecklist,
  IconChevronRight,
  IconClipboardList,
  IconClockHour4,
  IconFileDescription,
  IconFolders,
  IconLayoutDashboard,
  IconMenu2,
  IconPackageExport,
  IconPuzzle,
  IconRobot,
  IconSchool,
  IconSearch,
  IconSettingsCog,
  IconShieldCheck,
  IconTimelineEvent,
  IconUserCog,
  IconUsers,
  IconWand,
  IconX,
  type Icon,
} from '@tabler/icons-react';

/**
 * Los datos de contenido (grupos, módulos de la guía) guardan el ícono como
 * string 'ti-xxx', heredado de las clases del webfont Tabler que usaba la v1.
 * Este mapa es la única traducción de esos strings a componentes reales —
 * imports explícitos, no `import *`, para que el bundler pueda hacer tree-shaking.
 */
export const ICONOS: Record<string, Icon> = {
  'ti-affiliate': IconAffiliate,
  'ti-award': IconAward,
  'ti-bolt': IconBolt,
  'ti-box': IconBox,
  'ti-checklist': IconChecklist,
  'ti-chevron-right': IconChevronRight,
  'ti-clipboard-list': IconClipboardList,
  'ti-clock-hour-4': IconClockHour4,
  'ti-file-description': IconFileDescription,
  'ti-folders': IconFolders,
  'ti-layout-dashboard': IconLayoutDashboard,
  'ti-menu-2': IconMenu2,
  'ti-package-export': IconPackageExport,
  'ti-puzzle': IconPuzzle,
  'ti-robot': IconRobot,
  'ti-school': IconSchool,
  'ti-search': IconSearch,
  'ti-settings-cog': IconSettingsCog,
  'ti-shield-check': IconShieldCheck,
  'ti-timeline-event': IconTimelineEvent,
  'ti-user-cog': IconUserCog,
  'ti-users': IconUsers,
  'ti-wand': IconWand,
  'ti-x': IconX,
};

export function icono(nombre: string): Icon {
  return ICONOS[nombre] ?? IconBox;
}
