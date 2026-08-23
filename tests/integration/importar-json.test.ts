import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/sesion", () => ({ exigirUsuario: vi.fn() }));

import { importarProyectoJSON } from "@/app/(app)/proyectos/actions";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { Proyecto, Rol, Tarea, Tramite } from "@/types";
import { limpiarFirestore, seedUsuario, usuarioFalso } from "./helpers/proyectos";

/**
 * Prueba importarProyectoJSON contra JSON adversarial: es el punto de entrada que un archivo
 * externo (no una Server Action tipada) puede corromper. Cubre directamente los P1 arreglados
 * antes en esta sesión — fechas inexistentes, porcentaje/estado inconsistente, URL peligrosa en
 * notasIngenieria, responsableUid inventado — para que no puedan volver a colarse sin que un
 * test falle primero.
 */

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirUsuario).mockReset();
});

function comoRol(rol: Rol) {
  vi.mocked(exigirUsuario).mockResolvedValue(usuarioFalso(`${rol}-uid`, rol));
}

async function leerProyectoImportado(): Promise<{ proyecto: Proyecto; tareas: Tarea[] }> {
  const proyectosSnap = await adminDb.collection("proyectos").get();
  const proyectoDoc = proyectosSnap.docs[0];
  const tareasSnap = await proyectoDoc.ref.collection("tareas").get();
  return { proyecto: proyectoDoc.data() as Proyecto, tareas: tareasSnap.docs.map((d) => d.data() as Tarea) };
}

describe("permisos y formato", () => {
  it("un rol sin permiso (usuario) no puede importar", async () => {
    comoRol("usuario");
    await expect(importarProyectoJSON({ nombre: "X", tareas: [] })).rejects.toThrow("No tienes permiso");
  });

  it("rechaza un archivo que no es un objeto", async () => {
    comoRol("admin");
    await expect(importarProyectoJSON("no soy un objeto")).rejects.toThrow("formato esperado");
  });

  it("rechaza un archivo sin nombre o sin tareas[]", async () => {
    comoRol("admin");
    await expect(importarProyectoJSON({ tareas: [] })).rejects.toThrow("formato de proyecto");
    await expect(importarProyectoJSON({ nombre: "X" })).rejects.toThrow("formato de proyecto");
    await expect(importarProyectoJSON({ nombre: "   ", tareas: [] })).rejects.toThrow("formato de proyecto");
  });

  it("rechaza un archivo por encima del máximo de tareas, sin escribir nada", async () => {
    comoRol("admin");
    const tareas = Array.from({ length: 5001 }, () => ({ nombre: "x" }));
    await expect(importarProyectoJSON({ nombre: "Enorme", tareas })).rejects.toThrow("máximo por importación");
    expect((await adminDb.collection("proyectos").get()).size).toBe(0);
  });
});

describe("import limpio de referencia", () => {
  it("crea el proyecto y sus tareas con métricas coherentes", async () => {
    comoRol("admin");
    const { id } = await importarProyectoJSON({
      nombre: "Proyecto importado",
      tareas: [
        { nombre: "Tarea 1", estado: "Sin iniciar", porcentaje: 0 },
        { nombre: "Tarea 2", estado: "Completada", porcentaje: 100 },
      ],
    });

    const { proyecto, tareas } = await leerProyectoImportado();
    expect(proyecto.id).toBe(id);
    expect(tareas).toHaveLength(2);
    expect(proyecto.totalTareas).toBe(2);
    expect(proyecto.tareasCompletadas).toBe(1);
    expect(proyecto.avanceTotal).toBe(50);
  });
});

describe("saneamiento a nivel de proyecto", () => {
  it("acota nombre/cliente/software a 200 caracteres y descarta zonas no-string por encima de 300", async () => {
    comoRol("admin");
    const zonas = [...Array.from({ length: 305 }, (_, i) => `Zona ${i}`), 123, null, {}];
    await importarProyectoJSON({
      nombre: "N".repeat(300),
      cliente: "C".repeat(300),
      software: "S".repeat(300),
      zonas,
      tareas: [],
    });

    const { proyecto } = await leerProyectoImportado();
    expect(proyecto.nombre.length).toBeLessThanOrEqual(200);
    expect(proyecto.cliente.length).toBeLessThanOrEqual(200);
    expect(proyecto.software.length).toBeLessThanOrEqual(200);
    expect(proyecto.zonas).toHaveLength(300);
    expect(proyecto.zonas.every((z) => typeof z === "string")).toBe(true);
  });

  it("descarta una fecha de proyecto inexistente (2026-02-31) en vez de guardarla corrida", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "Con fecha mala",
      fechaInicio: "2026-02-31",
      fechaEntrega: "2026-06-01",
      tareas: [],
    });

    const { proyecto } = await leerProyectoImportado();
    expect(proyecto.fechaInicio).toBe("");
    expect(proyecto.fechaEntrega).toBe("2026-06-01");
  });
});

describe("saneamiento de una tarea corrupta", () => {
  it("categoria/estado/prioridad/grupo inválidos caen al valor por defecto en vez de guardarse tal cual", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "Con campos inválidos",
      tareas: [
        {
          nombre: "Tarea rara",
          categoria: "Categoría inventada",
          estado: "Estado inventado",
          prioridad: "Urgentísima",
          grupo: "grupo-que-no-existe",
        },
      ],
    });

    const { tareas } = await leerProyectoImportado();
    expect(tareas[0].categoria).toBe("Modelado");
    expect(tareas[0].estado).toBe("Sin iniciar");
    expect(tareas[0].prioridad).toBe("Media");
    expect(tareas[0].grupo).not.toBe("grupo-que-no-existe");
  });

  it("descarta una fechaLimite inexistente (2026-13-01) de una tarea", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "X",
      tareas: [{ nombre: "T", fechaLimite: "2026-13-01" }],
    });

    expect((await leerProyectoImportado()).tareas[0].fechaLimite).toBe("");
  });

  it("una tarea 'Completada' con porcentaje crudo distinto de 100 se normaliza a 100", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "X",
      tareas: [{ nombre: "T", estado: "Completada", porcentaje: 10 }],
    });

    const { proyecto, tareas } = await leerProyectoImportado();
    expect(tareas[0].porcentaje).toBe(100);
    expect(proyecto.avanceTotal).toBe(100);
  });

  it("un item que no es un objeto (string suelto) se salta sin romper el resto del import", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "X",
      tareas: ["no soy una tarea", null, { nombre: "Tarea válida" }],
    });

    const { tareas } = await leerProyectoImportado();
    expect(tareas).toHaveLength(1);
    expect(tareas[0].nombre).toBe("Tarea válida");
  });
});

describe("responsableUid", () => {
  it("se descarta si no corresponde a ningún usuario real", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "X",
      tareas: [{ nombre: "T", responsableUid: "uid-inventado" }],
    });

    expect((await leerProyectoImportado()).tareas[0].responsableUid).toBeNull();
  });

  it("se conserva si corresponde a un usuario sembrado de verdad", async () => {
    await seedUsuario(usuarioFalso("ing-real", "ingeniero"));
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "X",
      tareas: [{ nombre: "T", responsableUid: "ing-real" }],
    });

    expect((await leerProyectoImportado()).tareas[0].responsableUid).toBe("ing-real");
  });
});

describe("notasIngenieria", () => {
  it("una URL 'javascript:' se descarta (queda null) pero la nota con texto se conserva", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "X",
      tareas: [
        {
          nombre: "T",
          notasIngenieria: [{ texto: "Ver RETIE 15.2", fuente: "RETIE", url: "javascript:alert(1)", verificar: true }],
        },
      ],
    });

    const notas = (await leerProyectoImportado()).tareas[0].notasIngenieria ?? [];
    expect(notas).toHaveLength(1);
    expect(notas[0].texto).toBe("Ver RETIE 15.2");
    expect(notas[0].url).toBeNull();
  });

  it("una URL http(s) válida se conserva; una nota sin texto se descarta entera", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "X",
      tareas: [
        {
          nombre: "T",
          notasIngenieria: [
            { texto: "Con fuente", fuente: "RETILAP", url: "https://ejemplo.com/norma.pdf#page=5", verificar: false },
            { texto: "", fuente: "Sin texto no cuenta", verificar: false },
          ],
        },
      ],
    });

    const notas = (await leerProyectoImportado()).tareas[0].notasIngenieria ?? [];
    expect(notas).toHaveLength(1);
    expect(notas[0].url).toBe("https://ejemplo.com/norma.pdf#page=5");
  });
});

async function leerTramitesImportados(): Promise<Tramite[]> {
  const proyectosSnap = await adminDb.collection("proyectos").get();
  const tramitesSnap = await proyectosSnap.docs[0].ref.collection("tramites").get();
  return tramitesSnap.docs.map((d) => d.data() as Tramite);
}

describe("trámites importados", () => {
  it("un archivo de la v1 sin tramites[] entra con la cartera vacía", async () => {
    comoRol("admin");
    await importarProyectoJSON({ nombre: "Legado", tareas: [{ nombre: "T1" }] });

    const { proyecto } = await leerProyectoImportado();
    expect(await leerTramitesImportados()).toEqual([]);
    expect(proyecto.totalTramites).toBe(0);
    expect(proyecto.proximoVencimiento).toBe("");
  });

  it("crea la subcolección y deja las métricas del proyecto cuadradas", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "Con trámites",
      tareas: [],
      tramites: [
        { nombre: "Disponibilidad", estado: "Radicado", fechaRadicacion: "2026-07-01", fechaLimite: "2026-09-30" },
        { nombre: "RETIE", estado: "Rechazado", fechaRadicacion: "2026-06-01" },
        { nombre: "Bomberos", estado: "Sin iniciar" },
      ],
    });

    const tramites = await leerTramitesImportados();
    const { proyecto } = await leerProyectoImportado();
    expect(tramites).toHaveLength(3);
    expect(proyecto.totalTramites).toBe(3);
    expect(proyecto.tramitesAbiertos).toBe(2); // el rechazado está cerrado
    expect(proyecto.tramitesRechazados).toBe(1);
    expect(proyecto.tramitesEnAlerta).toBe(1); // "Bomberos", abierto y sin fecha
    expect(proyecto.proximoVencimiento).toBe("2026-09-30");
  });

  it("degrada un estado radicado que llega sin fecha de radicación", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "Incoherente",
      tareas: [],
      // El archivo afirma que está aprobado pero no dice cuándo se radicó.
      tramites: [{ nombre: "Sin fecha", estado: "Aprobado", fechaResolucion: "2026-05-03" }],
    });

    const [tramite] = await leerTramitesImportados();
    expect(tramite.estado).toBe("En preparación");
    // Al dejar de estar cerrado, la fecha de resolución no puede sobrevivir.
    expect(tramite.fechaResolucion).toBe("");
  });

  it("cae a la lista blanca con un tipo y un estado inventados", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "Basura",
      tareas: [],
      tramites: [{ nombre: "Raro", tipo: "Licencia intergaláctica", estado: "Traspapelado" }],
    });

    const [tramite] = await leerTramitesImportados();
    expect(tramite.tipo).toBe("Otro");
    expect(tramite.estado).toBe("Sin iniciar");
  });

  it("descarta fechas inexistentes, costos negativos y responsableUid inventado", async () => {
    comoRol("admin");
    await importarProyectoJSON({
      nombre: "Adversarial",
      tareas: [],
      tramites: [
        {
          nombre: "Sucio",
          estado: "Radicado",
          fechaRadicacion: "2026-07-01",
          fechaLimite: "2026-02-31", // no existe: new Date la normalizaría al 3 de marzo
          costo: -5000,
          responsableUid: "uid-que-no-existe",
          historial: [{ f: "no soy número", e: "Radicado" }],
        },
      ],
    });

    const [tramite] = await leerTramitesImportados();
    expect(tramite.fechaLimite).toBe("");
    expect(tramite.costo).toBe(0);
    expect(tramite.responsableUid).toBeNull();
    expect(tramite.historial).toEqual([]);
  });

  it("rechaza un archivo por encima del máximo de trámites, sin escribir nada", async () => {
    comoRol("admin");
    const tramites = Array.from({ length: 501 }, () => ({ nombre: "x" }));
    await expect(importarProyectoJSON({ nombre: "Enorme", tareas: [], tramites })).rejects.toThrow(
      "máximo por importación",
    );
    expect((await adminDb.collection("proyectos").get()).size).toBe(0);
  });
});
