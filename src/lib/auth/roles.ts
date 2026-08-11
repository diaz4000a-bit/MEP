import type { Rol } from '@/types';

export const ETIQUETA_ROL: Record<Rol, string> = {
  admin: 'Admin',
  coordinador: 'Coordinador',
  ingeniero: 'Ingeniero',
  modelador: 'Modelador',
  usuario: 'Usuario',
};

export const ACCIONES = {
  crearProyecto: ['admin', 'coordinador'],
  borrarProyecto: ['admin', 'coordinador'],
  crearTarea: ['admin', 'coordinador'],
  eliminarTarea: ['admin', 'coordinador'],
  editarTareaAjena: ['admin', 'coordinador'],
  editarTareaPropia: ['admin', 'coordinador', 'ingeniero', 'modelador'],
  verJornadasAjenas: ['admin', 'coordinador'],
  gestionarUsuarios: ['admin'],
  gestionarEquipo: ['admin', 'coordinador'],
} satisfies Record<string, Rol[]>;

export function puede(rol: Rol, accion: keyof typeof ACCIONES) {
  return (ACCIONES[accion] as readonly Rol[]).includes(rol);
}
