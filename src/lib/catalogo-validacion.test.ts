import { describe, expect, it } from "vitest";
import { validarTareaCatalogo, type ContextoValidacionCatalogo } from "./catalogo-validacion";
import type { Categoria, TareaCatalogo } from "@/types";

const CATEGORIAS: Categoria[] = ["Modelado", "Documentación"];

const CONTEXTO: ContextoValidacionCatalogo = {
  grupos: [
    { id: "02-modelado", n: 2, nombre: "Modelado", icon: "ti-box", subgrupos: ["Iluminación", "Tomacorrientes y fuerza"] },
  ],
  categorias: CATEGORIAS,
  leccionesIds: new Set(["M1.1", "M2.3"]),
};

function tareaValida(overrides: Partial<TareaCatalogo> = {}): TareaCatalogo {
  return {
    plantillaId: "PB-02-01",
    nombreOriginal: "Modelar iluminación",
    nombre: "Modelar iluminación",
    grupo: "02-modelado",
    subgrupo: "Iluminación",
    categoria: "Modelado",
    disciplina: "Eléctrica",
    dificultad: 2,
    horasEstimadas: 4,
    prioridad: "Media",
    dependeDe: [],
    guiaIds: ["M1.1"],
    descripcion: "Descripción de prueba",
    objetivo: "Objetivo de prueba",
    requisitos: ["Requisito 1"],
    procedimiento: ["Paso 1"],
    resultadoEsperado: "Resultado de prueba",
    criteriosVerificacion: ["Criterio 1"],
    notasIngenieria: [],
    tipsRevit: [],
    ...overrides,
  };
}

const URL_RETIE_SPT =
  "https://www.minenergia.gov.co/documents/15921/Libro-3-Resolucion-40284-23-06-2026.pdf#page=42";

describe("validarTareaCatalogo", () => {
  it("no reporta errores para una tarea completa y consistente", () => {
    const mapa = new Map<string, TareaCatalogo>();
    expect(validarTareaCatalogo(tareaValida(), mapa, CONTEXTO)).toEqual([]);
  });

  it("acepta una nota con fuente y enlace a un dominio normativo permitido", () => {
    const tarea = tareaValida({
      notasIngenieria: [
        { texto: "El SPT debe ser equipotencial.", fuente: "RETIE Libro 3, Art. 3.12.1", url: URL_RETIE_SPT, verificar: false },
      ],
    });
    expect(validarTareaCatalogo(tarea, new Map(), CONTEXTO)).toEqual([]);
  });

  it("rechaza horasEstimadas no positivas o por encima del tope", () => {
    const cero = validarTareaCatalogo(tareaValida({ horasEstimadas: 0 }), new Map(), CONTEXTO);
    expect(cero).toContain("horasEstimadas debe ser un número mayor que 0");

    const excesivas = validarTareaCatalogo(tareaValida({ horasEstimadas: 41 }), new Map(), CONTEXTO);
    expect(excesivas).toContain("horasEstimadas no puede superar 40 h: divide la tarea");
  });

  it("rechaza una prioridad que no es uno de los tres valores válidos", () => {
    const errores = validarTareaCatalogo(
      tareaValida({ prioridad: "Urgente" as TareaCatalogo["prioridad"] }),
      new Map(),
      CONTEXTO,
    );
    expect(errores).toContain('prioridad "Urgente" no es un valor válido');
  });

  it("rechaza una url de nota que no usa https", () => {
    const tarea = tareaValida({
      notasIngenieria: [
        { texto: "Nota", fuente: "RETIE", url: "http://www.minenergia.gov.co/doc.pdf", verificar: false },
      ],
    });
    expect(validarTareaCatalogo(tarea, new Map(), CONTEXTO)).toContain("notasIngenieria[0].url debe usar https");
  });

  it("rechaza una url de nota que apunta a un dominio no normativo", () => {
    const tarea = tareaValida({
      notasIngenieria: [
        { texto: "Nota", fuente: "RETIE", url: "https://ejemplo.com/retie.pdf", verificar: false },
      ],
    });
    expect(validarTareaCatalogo(tarea, new Map(), CONTEXTO)).toContain(
      'notasIngenieria[0].url apunta a "ejemplo.com", que no es una fuente normativa permitida',
    );
  });

  it("rechaza una nota con enlace pero sin fuente citada", () => {
    const tarea = tareaValida({
      notasIngenieria: [{ texto: "Nota", fuente: null, url: URL_RETIE_SPT, verificar: true }],
    });
    expect(validarTareaCatalogo(tarea, new Map(), CONTEXTO)).toContain("notasIngenieria[0] tiene url pero no fuente");
  });

  it("reporta campos de texto y arrays obligatorios vacíos", () => {
    const t = tareaValida({ descripcion: "  ", requisitos: [] });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain('campo "descripcion" vacío');
    expect(errores).toContain('campo "requisitos" vacío');
  });

  it("reporta dependeDe que referencia un plantillaId inexistente", () => {
    const t = tareaValida({ dependeDe: ["PB-99-99"] });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain('dependeDe referencia "PB-99-99", que no existe en el catálogo');
  });

  it("no reporta error cuando dependeDe apunta a una tarea presente en el mapa", () => {
    const dep = tareaValida({ plantillaId: "PB-02-00", dependeDe: [] });
    const t = tareaValida({ dependeDe: ["PB-02-00"] });
    const mapa = new Map([[dep.plantillaId, dep]]);
    expect(validarTareaCatalogo(t, mapa, CONTEXTO)).toEqual([]);
  });

  it("detecta un ciclo directo en dependeDe", () => {
    const t = tareaValida({ plantillaId: "PB-02-01", dependeDe: ["PB-02-01"] });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores.some((e) => e.startsWith("ciclo en dependeDe"))).toBe(true);
  });

  it("detecta un ciclo indirecto via el mapa", () => {
    const a = tareaValida({ plantillaId: "PB-A", dependeDe: ["PB-B"] });
    const b = tareaValida({ plantillaId: "PB-B", dependeDe: ["PB-A"] });
    const mapa = new Map([[b.plantillaId, b]]);
    const errores = validarTareaCatalogo(a, mapa, CONTEXTO);
    expect(errores.some((e) => e.startsWith("ciclo en dependeDe"))).toBe(true);
  });

  it("reporta guiaIds inexistente en LECCIONES", () => {
    const t = tareaValida({ guiaIds: ["M9.9"] });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain('guiaIds referencia "M9.9", que no existe en LECCIONES');
  });

  it("reporta grupo inexistente y subgrupo inválido para su grupo", () => {
    const t = tareaValida({ grupo: "07-seguimiento" as TareaCatalogo["grupo"] });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain('grupo "07-seguimiento" no existe en GRUPOS');

    const t2 = tareaValida({ subgrupo: "Subgrupo inexistente" });
    const errores2 = validarTareaCatalogo(t2, new Map(), CONTEXTO);
    expect(errores2).toContain('subgrupo "Subgrupo inexistente" no existe en el grupo "02-modelado"');
  });

  it("reporta categoria fuera de la lista válida", () => {
    const t = tareaValida({ categoria: "Entrega" as TareaCatalogo["categoria"] });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain('categoria "Entrega" no es un valor válido');
  });

  it("exige verificar:true cuando una nota de ingenieria no tiene fuente", () => {
    const t = tareaValida({ notasIngenieria: [{ texto: "Nota", fuente: null, verificar: false }] });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain("notasIngenieria[0] tiene fuente null pero verificar no es true");
  });

  it("acepta una nota sin fuente si verificar es true", () => {
    const t = tareaValida({ notasIngenieria: [{ texto: "Nota", fuente: null, verificar: true }] });
    expect(validarTareaCatalogo(t, new Map(), CONTEXTO)).toEqual([]);
  });

  it("rechaza un plantillaId con caracteres fuera de letras/números/-/_", () => {
    const t = tareaValida({ plantillaId: "PB 02/01" });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain('plantillaId solo puede tener letras, números, "-" y "_"');
  });

  it("rechaza dificultad fuera de 1-5 o no entera", () => {
    expect(validarTareaCatalogo(tareaValida({ dificultad: 0 as TareaCatalogo["dificultad"] }), new Map(), CONTEXTO)).toContain(
      "dificultad debe ser un número entero entre 1 y 5",
    );
    expect(validarTareaCatalogo(tareaValida({ dificultad: 6 as TareaCatalogo["dificultad"] }), new Map(), CONTEXTO)).toContain(
      "dificultad debe ser un número entero entre 1 y 5",
    );
  });

  it("rechaza un array con elementos que no son string (dato corrupto)", () => {
    // @ts-expect-error - simula un payload malformado que llega a una Server Action
    const t = tareaValida({ requisitos: [{ no: "es un string" }] });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain('campo "requisitos" debe ser una lista de texto');
  });

  it("rechaza notasIngenieria que no es un array, sin lanzar excepción", () => {
    // @ts-expect-error - simula un payload malformado que llega a una Server Action
    const t = tareaValida({ notasIngenieria: "no es un array" });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain('campo "notasIngenieria" debe ser una lista');
  });

  it("rechaza una nota con forma inválida sin lanzar excepción", () => {
    // @ts-expect-error - simula un payload malformado que llega a una Server Action
    const t = tareaValida({ notasIngenieria: [{ texto: 123, verificar: "si" }] });
    const errores = validarTareaCatalogo(t, new Map(), CONTEXTO);
    expect(errores).toContain("notasIngenieria[0] tiene forma inválida");
  });
});
