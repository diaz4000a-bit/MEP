import type { Rol } from '@/types';

export const ACCIONES = {
  crearProyecto: ['admin', 'coordinador'],
  borrarProyecto: ['admin', 'coordinador'],
  editarTareaAjena: ['admin', 'coordinador'],
  editarTareaPropia: ['admin', 'coordinador', 'ingeniero', 'modelador'],
  verJornadasAjenas: ['admin', 'coordinador'],
  gestionarUsuarios: ['admin'],
} satisfies Record<string, Rol[]>;

export function puede(rol: Rol, accion: keyof typeof ACCIONES) {
  return (ACCIONES[accion] as readonly Rol[]).includes(rol);
}
