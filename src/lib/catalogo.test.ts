import { describe, expect, it } from "vitest";
import { aplicarOverride, diffContenidoCatalogo, mergeCatalogo, tareaCatalogoDesdeOverride } from "./catalogo";
import type { CatalogoOverride, TareaCatalogo } from "@/types";

function tarea(overrides: Partial<TareaCatalogo> = {}): TareaCatalogo {
  return {
    plantillaId: "PB-01-01",
    nombreOriginal: "Original",
    nombre: "Nombre de fábrica",
    grupo: "01-gestion",
    subgrupo: "Información inicial",
    categoria: "Modelado",
    disciplina: "Eléctrica",
    dificultad: 2,
    horasEstimadas: 4,
    prioridad: "Media",
    dependeDe: [],
    guiaIds: [],
    descripcion: "Descripción de fábrica",
    objetivo: "Objetivo de fábrica",
    requisitos: ["Requisito de fábrica"],
    procedimiento: ["Paso de fábrica"],
    resultadoEsperado: "Resultado de fábrica",
    criteriosVerificacion: ["Criterio de fábrica"],
    notasIngenieria: [],
    tipsRevit: [],
    ...overrides,
  };
}

function override(overrides: Partial<CatalogoOverride> = {}): CatalogoOverride {
  return {
    plantillaId: "PB-01-01",
    oculto: false,
    esNuevo: false,
    actualizado: 1000,
    actualizadoPor: "uid-admin",
    ...overrides,
  };
}

describe("aplicarOverride", () => {
  it("devuelve la base intacta cuando no hay override", () => {
    const base = tarea();
    expect(aplicarOverride(base)).toEqual(base);
  });

  it("un campo presente en el override gana sobre la base", () => {
    const base = tarea();
    const resultado = aplicarOverride(base, override({ nombre: "Nombre editado" }));
    expect(resultado.nombre).toBe("Nombre editado");
  });

  it("los campos ausentes en el override conservan el valor de fábrica", () => {
    const base = tarea();
    const resultado = aplicarOverride(base, override({ nombre: "Nombre editado" }));
    expect(resultado.descripcion).toBe(base.descripcion);
    expect(resultado.plantillaId).toBe(base.plantillaId);
  });
});

describe("tareaCatalogoDesdeOverride", () => {
  it("construye una tarea completa a partir de un override esNuevo", () => {
    const o = override({
      esNuevo: true,
      nombre: "Tarea custom",
      grupo: "02-modelado",
      subgrupo: "Iluminación",
      categoria: "Iluminación",
      disciplina: "Eléctrica",
      descripcion: "Descripción custom",
      objetivo: "Objetivo custom",
      requisitos: ["R1"],
      procedimiento: ["P1"],
      resultadoEsperado: "Resultado custom",
      criteriosVerificacion: ["C1"],
    });
    const resultado = tareaCatalogoDesdeOverride(o);
    expect(resultado.plantillaId).toBe("PB-01-01");
    expect(resultado.nombre).toBe("Tarea custom");
    expect(resultado.nuevo).toBe(true);
  });
});

describe("mergeCatalogo", () => {
  it("sin overrides, devuelve la base sin cambios", () => {
    const base = [tarea()];
    expect(mergeCatalogo(base, new Map())).toEqual(base);
  });

  it("aplica el override de una tarea existente", () => {
    const base = [tarea()];
    const overrides = new Map([["PB-01-01", override({ nombre: "Editado" })]]);
    const resultado = mergeCatalogo(base, overrides);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).toBe("Editado");
  });

  it("filtra las tareas marcadas oculto", () => {
    const base = [tarea(), tarea({ plantillaId: "PB-01-02" })];
    const overrides = new Map([["PB-01-01", override({ oculto: true })]]);
    const resultado = mergeCatalogo(base, overrides);
    expect(resultado.map((t) => t.plantillaId)).toEqual(["PB-01-02"]);
  });

  it("agrega las tareas esNuevo al final de la lista", () => {
    const base = [tarea()];
    const overrides = new Map([
      [
        "PB-99-01",
        override({
          plantillaId: "PB-99-01",
          esNuevo: true,
          nombre: "Tarea nueva",
          descripcion: "Desc",
          objetivo: "Obj",
          resultadoEsperado: "Res",
          requisitos: ["R"],
          procedimiento: ["P"],
          criteriosVerificacion: ["C"],
        }),
      ],
    ]);
    const resultado = mergeCatalogo(base, overrides);
    expect(resultado.map((t) => t.plantillaId)).toEqual(["PB-01-01", "PB-99-01"]);
  });

  it("una tarea esNuevo marcada oculto no aparece", () => {
    const overrides = new Map([
      ["PB-99-01", override({ plantillaId: "PB-99-01", esNuevo: true, oculto: true, nombre: "Nueva oculta" })],
    ]);
    expect(mergeCatalogo([], overrides)).toEqual([]);
  });
});

describe("diffContenidoCatalogo", () => {
  it("sin diferencias, todos los campos van a sinCambios y cambios queda vacío", () => {
    const base = tarea();
    const { cambios, sinCambios } = diffContenidoCatalogo(base, base);
    expect(cambios).toEqual({});
    expect(sinCambios).toContain("nombre");
    expect(sinCambios).toContain("requisitos");
  });

  it("un campo escalar y uno array distintos van a cambios; el resto a sinCambios", () => {
    const base = tarea();
    const resultante = tarea({ nombre: "Editado", requisitos: ["Nuevo requisito"] });
    const { cambios, sinCambios } = diffContenidoCatalogo(resultante, base);
    expect(cambios).toEqual({ nombre: "Editado", requisitos: ["Nuevo requisito"] });
    expect(sinCambios).not.toContain("nombre");
    expect(sinCambios).not.toContain("requisitos");
    expect(sinCambios).toContain("descripcion");
  });
});
