import { adminDb } from "@/lib/firebase/admin";
import type { DatosTarea } from "@/lib/validar";
import type { Proyecto, Rol, Usuario } from "@/types";

/** Borra TODAS las colecciones de nivel superior (y subcolecciones) del emulador. Se llama
 *  en `beforeEach` de cada archivo de prueba para que un test nunca vea datos de otro. */
export async function limpiarFirestore(): Promise<void> {
  const colecciones = await adminDb.listCollections();
  await Promise.all(colecciones.map((c) => adminDb.recursiveDelete(c)));
}

/** `Usuario` mínimo válido para pruebas. `activo` siempre true: `exigirUsuario()` real nunca
 *  devuelve un usuario inactivo (redirige antes) — ese caso es de sesion.ts, no de las actions. */
export function usuarioFalso(uid: string, rol: Rol): Usuario {
  return {
    uid,
    email: `${uid}@test.local`,
    nombre: uid,
    rol,
    activo: true,
    creado: 1,
    ultimoAcceso: 1,
    guiaLeidas: [],
  };
}

export async function seedUsuario(usuario: Usuario): Promise<void> {
  await adminDb.doc(`usuarios/${usuario.uid}`).set(usuario);
}

/** Escribe un `Proyecto` mínimo directo a Firestore (sin pasar por crearProyecto), para
 *  pruebas de otras actions (jornadas, tareas) que solo necesitan que el proyecto exista. */
export async function seedProyecto(id: string, nombre = "Proyecto de prueba"): Promise<void> {
  const proyecto: Proyecto = {
    id,
    nombre,
    cliente: "",
    fechaInicio: "",
    fechaEntrega: "",
    disciplina: "Eléctrica",
    software: "Revit",
    estado: "Sin iniciar",
    notas: "",
    zonas: [],
    creado: Date.now(),
    actualizado: Date.now(),
    totalTareas: 0,
    tareasCompletadas: 0,
    avanceTotal: 0,
  };
  await adminDb.doc(`proyectos/${id}`).set(proyecto);
}

/** `DatosTarea` mínimo válido para `crearTarea`/`actualizarTarea`, sobrescribible por campo. */
export function datosTareaValidos(overrides: Partial<DatosTarea> = {}): DatosTarea {
  return {
    nombre: "Tarea de prueba",
    grupo: null,
    subgrupo: null,
    zona: null,
    etapa: null,
    categoria: "Modelado",
    responsableUid: null,
    responsable: "",
    prioridad: "Media",
    estado: "Sin iniciar",
    porcentaje: 0,
    fechaInicio: "",
    fechaLimite: "",
    horasEstimadas: 0,
    horasReales: 0,
    comentarios: "",
    bloqueadoPor: "",
    ...overrides,
  };
}
