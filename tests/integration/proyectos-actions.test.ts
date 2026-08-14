import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/sesion", () => ({ exigirUsuario: vi.fn() }));

import {
  agregarZona,
  crearProyecto,
  crearProyectoDesdeplantilla,
  eliminarProyecto,
  eliminarZona,
  guardarNotasProyecto,
} from "@/app/(app)/proyectos/actions";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { Proyecto, Rol, Tarea } from "@/types";
import { limpiarFirestore, usuarioFalso } from "./helpers/proyectos";

/**
 * Prueba proyectos/actions.ts (las 6 acciones "de proyecto") contra el emulador real de
 * Firestore. `exigirUsuario` se mockea para poder fijar el rol logueado por test — la
 * verificación de cookie/sesión en sí es responsabilidad de sesion.ts, no de estas actions.
 * `next/cache` se mockea porque `revalidatePath` no funciona fuera de un request de Next.js.
 */

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirUsuario).mockReset();
});

function comoRol(rol: Rol) {
  const usuario = usuarioFalso(`${rol}-uid`, rol);
  vi.mocked(exigirUsuario).mockResolvedValue(usuario);
  return usuario;
}

async function leerProyecto(id: string): Promise<Proyecto> {
  const snap = await adminDb.doc(`proyectos/${id}`).get();
  return snap.data() as Proyecto;
}
async function leerTareas(proyectoId: string): Promise<Tarea[]> {
  const snap = await adminDb.collection(`proyectos/${proyectoId}/tareas`).get();
  return snap.docs.map((d) => d.data() as Tarea);
}

describe("crearProyecto", () => {
  it("un coordinador crea un proyecto con los valores iniciales correctos", async () => {
    comoRol("coordinador");
    const { id } = await crearProyecto({
      nombre: "Torre Norte",
      cliente: "Cliente X",
      fechaInicio: "2026-01-01",
      fechaEntrega: "2026-06-01",
      software: "Revit",
    });

    const proyecto = await leerProyecto(id);
    expect(proyecto.nombre).toBe("Torre Norte");
    expect(proyecto.estado).toBe("Sin iniciar");
    expect(proyecto.totalTareas).toBe(0);
    expect(proyecto.tareasCompletadas).toBe(0);
    expect(proyecto.avanceTotal).toBe(0);
    expect(proyecto.zonas).toEqual(["Torre A", "Torre B", "Comunal", "Portería", "Urbanismo"]);
  });

  it("un rol sin permiso (usuario) no puede crear proyectos", async () => {
    comoRol("usuario");
    await expect(
      crearProyecto({ nombre: "X", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" }),
    ).rejects.toThrow("No tienes permiso");
  });

  it("rechaza un proyecto sin nombre", async () => {
    comoRol("admin");
    await expect(
      crearProyecto({ nombre: "", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" }),
    ).rejects.toThrow("obligatorio");
  });

  it("rechaza fecha de entrega anterior a la fecha de inicio", async () => {
    comoRol("admin");
    await expect(
      crearProyecto({
        nombre: "X",
        cliente: "",
        fechaInicio: "2026-06-01",
        fechaEntrega: "2026-01-01",
        software: "",
      }),
    ).rejects.toThrow("no puede ser anterior");
  });
});

describe("crearProyectoDesdeplantilla", () => {
  it("crea el proyecto y su subcolección de tareas de la plantilla base, con las métricas coherentes", async () => {
    comoRol("admin");
    const { id } = await crearProyectoDesdeplantilla({
      nombre: "Desde plantilla",
      cliente: "",
      fechaInicio: "",
      fechaEntrega: "",
      software: "",
    });

    const proyecto = await leerProyecto(id);
    const tareas = await leerTareas(id);

    expect(tareas.length).toBeGreaterThan(0);
    expect(proyecto.totalTareas).toBe(tareas.length);
    // La plantilla arranca con todo en "Sin iniciar" / 0%: avance y completadas en cero.
    expect(proyecto.tareasCompletadas).toBe(0);
    expect(proyecto.avanceTotal).toBe(0);
    expect(tareas.every((t) => t.proyectoId === id)).toBe(true);
  });

  it("un rol sin permiso (ingeniero) no puede crear desde plantilla", async () => {
    comoRol("ingeniero");
    await expect(
      crearProyectoDesdeplantilla({ nombre: "X", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" }),
    ).rejects.toThrow("No tienes permiso");
  });
});

describe("eliminarProyecto", () => {
  it("un admin borra el proyecto y toda su subcolección de tareas", async () => {
    comoRol("admin");
    const { id } = await crearProyectoDesdeplantilla({
      nombre: "A borrar",
      cliente: "",
      fechaInicio: "",
      fechaEntrega: "",
      software: "",
    });
    expect((await leerTareas(id)).length).toBeGreaterThan(0);

    await eliminarProyecto(id);

    expect((await adminDb.doc(`proyectos/${id}`).get()).exists).toBe(false);
    expect(await leerTareas(id)).toEqual([]);
  });

  it("un rol sin permiso (ingeniero) no puede borrar proyectos", async () => {
    comoRol("admin");
    const { id } = await crearProyecto({ nombre: "X", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" });

    comoRol("ingeniero");
    await expect(eliminarProyecto(id)).rejects.toThrow("No tienes permiso");
    expect((await adminDb.doc(`proyectos/${id}`).get()).exists).toBe(true);
  });
});

describe("guardarNotasProyecto", () => {
  it("cualquier miembro activo del equipo (p.ej. modelador) puede guardar notas", async () => {
    comoRol("admin");
    const { id } = await crearProyecto({ nombre: "X", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" });

    comoRol("modelador");
    await guardarNotasProyecto(id, "Notas de obra");

    expect((await leerProyecto(id)).notas).toBe("Notas de obra");
  });

  it("rechaza notas por encima del máximo de caracteres", async () => {
    comoRol("admin");
    const { id } = await crearProyecto({ nombre: "X", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" });

    await expect(guardarNotasProyecto(id, "x".repeat(20_001))).rejects.toThrow("máximo");
  });

  it("un rol sin permiso (usuario) no puede guardar notas", async () => {
    comoRol("admin");
    const { id } = await crearProyecto({ nombre: "X", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" });

    comoRol("usuario");
    await expect(guardarNotasProyecto(id, "hola")).rejects.toThrow("No tienes permiso");
  });
});

describe("agregarZona", () => {
  it("agrega una zona nueva a la lista del proyecto", async () => {
    comoRol("admin");
    const { id } = await crearProyecto({ nombre: "X", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" });

    await agregarZona(id, "Sótano 2");

    expect((await leerProyecto(id)).zonas).toContain("Sótano 2");
  });

  it("rechaza una zona duplicada (comparación insensible a mayúsculas)", async () => {
    comoRol("admin");
    const { id } = await crearProyecto({ nombre: "X", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" });

    await expect(agregarZona(id, "torre a")).rejects.toThrow("ya existe");
  });

  it("rechaza un nombre de zona vacío o en blanco", async () => {
    comoRol("admin");
    const { id } = await crearProyecto({ nombre: "X", cliente: "", fechaInicio: "", fechaEntrega: "", software: "" });

    await expect(agregarZona(id, "   ")).rejects.toThrow("obligatorio");
  });
});

describe("eliminarZona", () => {
  it("quita la zona del proyecto y desasigna esa zona en las tareas que la tenían", async () => {
    comoRol("admin");
    const { id } = await crearProyectoDesdeplantilla({
      nombre: "Con zonas",
      cliente: "",
      fechaInicio: "",
      fechaEntrega: "",
      software: "",
    });
    const [primera] = await leerTareas(id);
    await adminDb.doc(`proyectos/${id}/tareas/${primera.id}`).update({ zona: "Torre A" });

    await eliminarZona(id, "Torre A");

    expect((await leerProyecto(id)).zonas).not.toContain("Torre A");
    const tareaActualizada = (await leerTareas(id)).find((t) => t.id === primera.id)!;
    expect(tareaActualizada.zona).toBeNull();
  });
});
