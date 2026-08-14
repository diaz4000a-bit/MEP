import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/sesion", () => ({ exigirUsuario: vi.fn() }));

import {
  actualizarEstadoTarea,
  actualizarTarea,
  actualizarVerificacion,
  crearProyecto,
  crearTarea,
  eliminarTarea,
} from "@/app/(app)/proyectos/actions";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { Proyecto, Rol, Tarea } from "@/types";
import { datosTareaValidos, limpiarFirestore, usuarioFalso } from "./helpers/proyectos";

/**
 * Prueba las 5 acciones "de tarea" de proyectos/actions.ts, con foco en la matriz de permisos
 * por rol: `editarTareaAjena` (admin/coordinador, cualquier campo) vs `editarTareaPropia`
 * (también ingeniero/modelador, pero solo en la tarea de la que son responsables y solo un
 * subconjunto de campos). Ese subconjunto es la parte más fácil de romper sin darse cuenta.
 */

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirUsuario).mockReset();
});

function comoRol(rol: Rol, uid = `${rol}-uid`) {
  const usuario = usuarioFalso(uid, rol);
  vi.mocked(exigirUsuario).mockResolvedValue(usuario);
  return usuario;
}

async function leerProyecto(id: string): Promise<Proyecto> {
  return (await adminDb.doc(`proyectos/${id}`).get()).data() as Proyecto;
}
async function leerTarea(proyectoId: string, tareaId: string): Promise<Tarea> {
  return (await adminDb.doc(`proyectos/${proyectoId}/tareas/${tareaId}`).get()).data() as Tarea;
}
async function idUnicaTarea(proyectoId: string): Promise<string> {
  const snap = await adminDb.collection(`proyectos/${proyectoId}/tareas`).get();
  return snap.docs[0].id;
}

/** Crea un proyecto vacío (como admin) y devuelve su id, sin dejar el rol logueado en admin. */
async function proyectoVacio(): Promise<string> {
  comoRol("admin");
  const { id } = await crearProyecto({ nombre: "P", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" });
  return id;
}

describe("crearTarea", () => {
  it("un admin crea una tarea y las métricas del proyecto se actualizan", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos({ nombre: "Modelar tablero" }));

    const proyecto = await leerProyecto(proyectoId);
    expect(proyecto.totalTareas).toBe(1);
    expect(proyecto.tareasCompletadas).toBe(0);
  });

  it("un rol sin permiso (ingeniero) no puede crear tareas", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("ingeniero");
    await expect(crearTarea(proyectoId, datosTareaValidos())).rejects.toThrow("No tienes permiso");
  });

  it("falla si el proyecto ya no existe", async () => {
    comoRol("admin");
    await expect(crearTarea("proyecto-inexistente", datosTareaValidos())).rejects.toThrow("ya no existe");
  });

  it("rechaza una tarea sin nombre", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await expect(crearTarea(proyectoId, datosTareaValidos({ nombre: "" }))).rejects.toThrow("obligatorio");
  });

  it("una tarea creada 'Completada' se normaliza a 100%, no al porcentaje crudo enviado", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos({ estado: "Completada", porcentaje: 40 }));

    const proyecto = await leerProyecto(proyectoId);
    expect(proyecto.tareasCompletadas).toBe(1);
    expect(proyecto.avanceTotal).toBe(100);
  });
});

describe("actualizarTarea", () => {
  it("editarTareaAjena (admin) puede reasignar responsable, prioridad y fechas", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos({ nombre: "Original", prioridad: "Baja" }));
    const tareaId = await idUnicaTarea(proyectoId);

    await actualizarTarea(
      proyectoId,
      tareaId,
      datosTareaValidos({ nombre: "Renombrada", prioridad: "Alta", responsable: "Juan" }),
    );

    const tarea = await leerTarea(proyectoId, tareaId);
    expect(tarea.nombre).toBe("Renombrada");
    expect(tarea.prioridad).toBe("Alta");
    expect(tarea.responsable).toBe("Juan");
  });

  it("editarTareaPropia (ingeniero dueño) solo puede tocar estado/porcentaje/horas/comentarios/bloqueo — el resto se ignora", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(
      proyectoId,
      datosTareaValidos({ nombre: "Original", prioridad: "Baja", responsableUid: "ing-1" }),
    );
    const tareaId = await idUnicaTarea(proyectoId);

    comoRol("ingeniero", "ing-1");
    await actualizarTarea(
      proyectoId,
      tareaId,
      datosTareaValidos({
        nombre: "Intento de renombrar",
        prioridad: "Alta",
        responsable: "Otro",
        porcentaje: 50,
        estado: "En progreso",
        comentarios: "avanzando",
      }),
    );

    const tarea = await leerTarea(proyectoId, tareaId);
    // Campos fuera del subconjunto permitido: se conservan intactos.
    expect(tarea.nombre).toBe("Original");
    expect(tarea.prioridad).toBe("Baja");
    expect(tarea.responsable).toBe("");
    // Campos del subconjunto permitido: sí se actualizan.
    expect(tarea.porcentaje).toBe(50);
    expect(tarea.estado).toBe("En progreso");
    expect(tarea.comentarios).toBe("avanzando");
  });

  it("un ingeniero que NO es el responsable no puede editar la tarea de otro", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos({ responsableUid: "ing-1" }));
    const tareaId = await idUnicaTarea(proyectoId);

    comoRol("ingeniero", "ing-2");
    await expect(actualizarTarea(proyectoId, tareaId, datosTareaValidos({ porcentaje: 10 }))).rejects.toThrow(
      "No tienes permiso",
    );
  });

  it("el rol 'usuario' no puede editar ni siquiera la tarea de la que es responsable (no tiene editarTareaPropia)", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos({ responsableUid: "user-1" }));
    const tareaId = await idUnicaTarea(proyectoId);

    comoRol("usuario", "user-1");
    await expect(actualizarTarea(proyectoId, tareaId, datosTareaValidos({ porcentaje: 10 }))).rejects.toThrow(
      "No tienes permiso",
    );
  });
});

describe("actualizarEstadoTarea", () => {
  it("el dueño (editarTareaPropia) puede cambiar estado y porcentaje de su propia tarea, y 'Completada' fija fechaCompletada", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos({ responsableUid: "mod-1" }));
    const tareaId = await idUnicaTarea(proyectoId);

    comoRol("modelador", "mod-1");
    await actualizarEstadoTarea(proyectoId, tareaId, "Completada", 80);

    const tarea = await leerTarea(proyectoId, tareaId);
    expect(tarea.estado).toBe("Completada");
    expect(tarea.porcentaje).toBe(100); // validarEstadoYPorcentaje normaliza Completada -> 100
    expect(tarea.fechaCompletada).not.toBe("");
  });

  it("quien no es dueño ni tiene editarTareaAjena no puede cambiar el estado", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos({ responsableUid: "mod-1" }));
    const tareaId = await idUnicaTarea(proyectoId);

    comoRol("modelador", "otro-modelador");
    await expect(actualizarEstadoTarea(proyectoId, tareaId, "En progreso", 20)).rejects.toThrow("No tienes permiso");
  });
});

describe("actualizarVerificacion", () => {
  it("el dueño guarda la verificación; índices fuera de rango se descartan", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos({ responsableUid: "ing-1" }));
    const tareaId = await idUnicaTarea(proyectoId);

    comoRol("ingeniero", "ing-1");
    await actualizarVerificacion(proyectoId, tareaId, { 0: true, 1: false, 999: true } as Record<number, boolean>);

    const tarea = await leerTarea(proyectoId, tareaId);
    expect(tarea.verificacion).toEqual({ 0: true, 1: false });
  });

  it("quien no tiene permiso no puede guardar la verificación", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos({ responsableUid: "ing-1" }));
    const tareaId = await idUnicaTarea(proyectoId);

    comoRol("ingeniero", "otro-ingeniero");
    await expect(actualizarVerificacion(proyectoId, tareaId, { 0: true })).rejects.toThrow("No tienes permiso");
  });
});

describe("eliminarTarea", () => {
  it("un admin borra la tarea y las métricas del proyecto bajan", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos());
    const tareaId = await idUnicaTarea(proyectoId);

    await eliminarTarea(proyectoId, tareaId);

    expect((await adminDb.doc(`proyectos/${proyectoId}/tareas/${tareaId}`).get()).exists).toBe(false);
    expect((await leerProyecto(proyectoId)).totalTareas).toBe(0);
  });

  it("un rol sin permiso (ingeniero) no puede borrar tareas", async () => {
    const proyectoId = await proyectoVacio();
    comoRol("admin");
    await crearTarea(proyectoId, datosTareaValidos());
    const tareaId = await idUnicaTarea(proyectoId);

    comoRol("ingeniero");
    await expect(eliminarTarea(proyectoId, tareaId)).rejects.toThrow("No tienes permiso");
  });
});
