import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/sesion", () => ({ exigirRol: vi.fn() }));

import {
  eliminarTareaCatalogoNueva,
  guardarOverrideCatalogo,
  ocultarTareaCatalogo,
  restaurarCampoCatalogo,
} from "@/app/(app)/plantilla/actions";
import { CATALOGO_TAREAS } from "@/content/catalogo-tareas";
import { exigirRol } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { CatalogoOverride, TareaCatalogo } from "@/types";
import { limpiarFirestore, usuarioFalso } from "./helpers/proyectos";

/**
 * plantilla/actions.ts usa `exigirRol("admin")` directamente, igual que usuarios/actions.ts.
 * `validarTareaCatalogo` (las reglas de contenido) ya tiene su propia suite unitaria en
 * src/lib/catalogo-validacion.test.ts — aquí solo se prueba que la Server Action conecte bien
 * el permiso, las reglas de crear-vs-editar y las restricciones de esNuevo con Firestore real.
 */

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirRol).mockReset();
});

function comoAdmin() {
  vi.mocked(exigirRol).mockResolvedValue(usuarioFalso("admin-uid", "admin"));
}

async function leerOverride(plantillaId: string): Promise<CatalogoOverride | undefined> {
  const snap = await adminDb.doc(`catalogoOverrides/${plantillaId}`).get();
  return snap.exists ? (snap.data() as CatalogoOverride) : undefined;
}

/** Tarea de catálogo mínima válida (pasa validarTareaCatalogo) para probar "crear tarea nueva". */
function tareaNuevaValida(overrides: Partial<TareaCatalogo> = {}): TareaCatalogo {
  return {
    plantillaId: "TEST-01",
    nombreOriginal: "Test",
    nombre: "Tarea de prueba",
    grupo: "01-gestion",
    subgrupo: "Información inicial",
    categoria: "Modelado",
    disciplina: "Eléctrica",
    dificultad: 1,
    horasEstimadas: 1,
    prioridad: "Media",
    dependeDe: [],
    guiaIds: [],
    descripcion: "Descripción",
    objetivo: "Objetivo",
    requisitos: ["Uno"],
    procedimiento: ["Uno"],
    resultadoEsperado: "Resultado",
    criteriosVerificacion: ["Uno"],
    notasIngenieria: [],
    tipsRevit: [],
    ...overrides,
  };
}

describe("guardarOverrideCatalogo", () => {
  it("un rol sin permiso no puede guardar (exigirRol rechaza)", async () => {
    vi.mocked(exigirRol).mockRejectedValue(new Error("No tienes permiso para hacer esto."));
    await expect(guardarOverrideCatalogo("TEST-01", tareaNuevaValida(), { crear: true })).rejects.toThrow(
      "No tienes permiso",
    );
  });

  it("crea una tarea nueva (esNuevo) con un plantillaId que no existe todavía", async () => {
    comoAdmin();
    await guardarOverrideCatalogo("TEST-01", tareaNuevaValida(), { crear: true });

    const override = await leerOverride("TEST-01");
    expect(override?.esNuevo).toBe(true);
    expect(override?.nombre).toBe("Tarea de prueba");
  });

  it("rechaza crear con un plantillaId que ya existe en el catálogo de fábrica", async () => {
    comoAdmin();
    const idExistente = CATALOGO_TAREAS[0].plantillaId;
    await expect(
      guardarOverrideCatalogo(idExistente, tareaNuevaValida({ plantillaId: idExistente }), { crear: true }),
    ).rejects.toThrow("Ya existe una tarea");
  });

  it("editar una tarea de fábrica guarda solo el diff de contenido", async () => {
    comoAdmin();
    const base = CATALOGO_TAREAS[0];
    const resultante: TareaCatalogo = { ...base, nombre: "Nombre editado por el admin" };

    await guardarOverrideCatalogo(base.plantillaId, resultante, { crear: false });

    const override = await leerOverride(base.plantillaId);
    expect(override?.esNuevo).toBe(false);
    expect(override?.nombre).toBe("Nombre editado por el admin");
    // Campos sin cambios respecto a la base de fábrica no se guardan en el override.
    expect(override?.subgrupo).toBeUndefined();
  });

  it("rechaza editar (crear: false) un plantillaId que no existe ni en fábrica ni como override", async () => {
    comoAdmin();
    await expect(
      guardarOverrideCatalogo("no-existe", tareaNuevaValida({ plantillaId: "no-existe" }), { crear: false }),
    ).rejects.toThrow("ya no existe");
  });

  it("rechaza contenido inválido (dificultad fuera de 1-5)", async () => {
    comoAdmin();
    await expect(
      guardarOverrideCatalogo("TEST-01", tareaNuevaValida({ dificultad: 9 as TareaCatalogo["dificultad"] }), {
        crear: true,
      }),
    ).rejects.toThrow("dificultad");
  });
});

describe("restaurarCampoCatalogo", () => {
  it("restaura un campo editado de una tarea de fábrica a su valor original", async () => {
    comoAdmin();
    const base = CATALOGO_TAREAS[0];
    await guardarOverrideCatalogo(base.plantillaId, { ...base, nombre: "Editado" }, { crear: false });
    expect((await leerOverride(base.plantillaId))?.nombre).toBe("Editado");

    await restaurarCampoCatalogo(base.plantillaId, "nombre");

    expect((await leerOverride(base.plantillaId))?.nombre).toBeUndefined();
  });

  it("rechaza un campo que no es de contenido editable", async () => {
    comoAdmin();
    await expect(
      restaurarCampoCatalogo("cualquiera", "campoInventado" as never),
    ).rejects.toThrow("Campo inválido");
  });

  it("rechaza restaurar un campo de una tarea esNuevo (no tiene valor de fábrica)", async () => {
    comoAdmin();
    await guardarOverrideCatalogo("TEST-01", tareaNuevaValida(), { crear: true });

    await expect(restaurarCampoCatalogo("TEST-01", "nombre")).rejects.toThrow("no tiene valor de fábrica");
  });
});

describe("ocultarTareaCatalogo", () => {
  it("oculta y vuelve a mostrar una tarea de fábrica", async () => {
    comoAdmin();
    const plantillaId = CATALOGO_TAREAS[1].plantillaId;

    await ocultarTareaCatalogo(plantillaId, true);
    expect((await leerOverride(plantillaId))?.oculto).toBe(true);

    await ocultarTareaCatalogo(plantillaId, false);
    expect((await leerOverride(plantillaId))?.oculto).toBe(false);
  });
});

describe("eliminarTareaCatalogoNueva", () => {
  it("borra una tarea nueva (esNuevo) creada por el admin", async () => {
    comoAdmin();
    await guardarOverrideCatalogo("TEST-01", tareaNuevaValida(), { crear: true });

    await eliminarTareaCatalogoNueva("TEST-01");

    expect(await leerOverride("TEST-01")).toBeUndefined();
  });

  it("rechaza eliminar una tarea de fábrica (solo se puede ocultar)", async () => {
    comoAdmin();
    const plantillaId = CATALOGO_TAREAS[2].plantillaId;
    await ocultarTareaCatalogo(plantillaId, true); // crea el override, esNuevo:false

    await expect(eliminarTareaCatalogoNueva(plantillaId)).rejects.toThrow("solo ocultar");
  });

  it("rechaza si la tarea ya no existe", async () => {
    comoAdmin();
    await expect(eliminarTareaCatalogoNueva("no-existe")).rejects.toThrow("ya no existe");
  });
});
