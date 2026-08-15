import type { Rol } from '@/types';

export const ETIQUETA_ROL: Record<Rol, string> = {
  admin: 'Admin',
  coordinador: 'Coordinador',
  ingeniero: 'Ingeniero',
  modelador: 'Modelador',
  usuario: 'Usuario',
};

export const ACCIONES = {
  crearProyecto: ['admin', 'coordinador', 'ingeniero', 'modelador'],
  borrarProyecto: ['admin', 'coordinador', 'ingeniero'],
  crearTarea: ['admin', 'coordinador', 'ingeniero', 'modelador'],
  eliminarTarea: ['admin', 'coordinador', 'ingeniero'],
  editarTareaAjena: ['admin', 'coordinador', 'ingeniero', 'modelador'],
  editarTareaPropia: ['admin', 'coordinador', 'ingeniero', 'modelador'],
  verJornadasAjenas: ['admin', 'coordinador', 'ingeniero'],
  gestionarUsuarios: ['admin'],
  gestionarEquipo: ['admin', 'coordinador'],
} satisfies Record<string, Rol[]>;

export function puede(rol: Rol, accion: keyof typeof ACCIONES) {
  return (ACCIONES[accion] as readonly Rol[]).includes(rol);
}
