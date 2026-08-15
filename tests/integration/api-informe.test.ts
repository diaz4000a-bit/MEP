import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/sesion", () => ({ exigirUsuario: vi.fn() }));

import { GET } from "@/app/api/informe/[id]/route";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import { fechaBogota, ventanaDelDia } from "@/lib/tiempo";
import { limpiarFirestore, seedProyecto, usuarioFalso } from "./helpers/proyectos";

/**
 * El informe interpola `historial[].p`/`.f` SIN escapar (son números "de confianza"), por eso
 * `sanearHistorial` los fuerza a número al leer — este archivo prueba ese contrato de punta a
 * punta: nombre/zona/responsable SÍ pasan por `esc()` y se escapan, mientras que un historial
 * corrupto (p no numérico) se descarta en vez de colarse crudo en el HTML.
 */

const FECHA = fechaBogota();
const { inicioMs } = ventanaDelDia(FECHA);
const MOMENTO_HOY = inicioMs + 3_600_000; // 1am Bogotá de ese día: siempre dentro de la ventana.

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirUsuario).mockReset();
});

function comoRol(rol: "ingeniero" | "coordinador" | "modelador", uid = `${rol}-uid`) {
  vi.mocked(exigirUsuario).mockResolvedValue(usuarioFalso(uid, rol));
}

function urlInforme(id: string, params: Record<string, string> = {}): Request {
  const url = new URL(`http://localhost/api/informe/${id}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url);
}
function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/informe/[id]", () => {
  it("devuelve 404 si el proyecto no existe", async () => {
    comoRol("ingeniero");
    const res = await GET(urlInforme("no-existe"), ctx("no-existe"));
    expect(res.status).toBe(404);
  });

  it("sin actividad hoy: el cuerpo lo dice explícitamente, sin reventar", async () => {
    comoRol("ingeniero");
    await seedProyecto("p1", "Torre Norte");

    const res = await GET(urlInforme("p1", { fecha: FECHA }), ctx("p1"));
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(html).toContain("No se registró actividad");
  });

  it("una tarea con avance real hoy aparece en la sección de su responsable, con el nombre escapado (defensa XSS)", async () => {
    comoRol("ingeniero");
    await seedProyecto("p1", "Torre Norte");
    await adminDb.doc("proyectos/p1/tareas/t1").set({
      id: "t1",
      proyectoId: "p1",
      nombre: "Modelar <script>alert(1)</script> tablero",
      zona: "Torre A",
      etapa: "",
      responsable: "Juan Pérez",
      estado: "En progreso",
      porcentaje: 60,
      historial: [
        { f: MOMENTO_HOY - 60_000, p: 0, e: "Sin iniciar" },
        { f: MOMENTO_HOY, p: 60, e: "En progreso" },
      ],
    });

    const res = await GET(urlInforme("p1", { fecha: FECHA }), ctx("p1"));
    const html = await res.text();

    expect(html).toContain("Juan Pérez");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  it("el snapshot de creación (índice 0) no cuenta como actividad aunque su fecha sea hoy", async () => {
    comoRol("ingeniero");
    await seedProyecto("p1", "Torre Norte");
    await adminDb.doc("proyectos/p1/tareas/t1").set({
      id: "t1",
      proyectoId: "p1",
      nombre: "Tarea recién creada hoy",
      responsable: "Ana",
      estado: "Sin iniciar",
      porcentaje: 0,
      historial: [{ f: MOMENTO_HOY, p: 0, e: "Sin iniciar" }],
    });

    const html = await (await GET(urlInforme("p1", { fecha: FECHA }), ctx("p1"))).text();

    // "Ana" sí aparece en el pie ("Sin actividad registrada hoy: Ana") — eso es correcto,
    // tiene una tarea asignada. Lo que prueba la exclusión del índice 0 es que NO se abrió
    // una sección de trabajador con avance para ella.
    expect(html).toContain("No se registró actividad");
    expect(html).not.toContain('class="worker"');
  });

  it("una entrada de historial corrupta (p no numérico) se descarta en vez de aparecer en el HTML", async () => {
    comoRol("ingeniero");
    await seedProyecto("p1", "Torre Norte");
    await adminDb.doc("proyectos/p1/tareas/t1").set({
      id: "t1",
      proyectoId: "p1",
      nombre: "Tarea con historial corrupto",
      responsable: "Carlos",
      estado: "En progreso",
      porcentaje: 50,
      historial: [
        { f: MOMENTO_HOY - 60_000, p: 0, e: "Sin iniciar" },
        { f: MOMENTO_HOY, p: "<img src=x onerror=alert(1)>", e: "En progreso" },
      ],
    });

    const res = await GET(urlInforme("p1", { fecha: FECHA }), ctx("p1"));
    const html = await res.text();

    expect(res.status).toBe(200);
    // El payload malicioso no debe aparecer en ninguna parte — ni crudo ni escapado — porque
    // `sanearHistorial` lo descarta antes de que llegue a construirInformeHTML. "Carlos" sí
    // puede aparecer en el pie ("Sin actividad registrada hoy"), eso es un dato legítimo.
    expect(html).not.toContain("onerror");
    expect(html).not.toContain('class="worker"');
  });

  it("el filtro ?resp= muestra solo la sección de ese responsable", async () => {
    comoRol("ingeniero");
    await seedProyecto("p1", "Torre Norte");
    const historialHoy = [
      { f: MOMENTO_HOY - 60_000, p: 0, e: "Sin iniciar" },
      { f: MOMENTO_HOY, p: 50, e: "En progreso" },
    ];
    await adminDb
      .doc("proyectos/p1/tareas/t1")
      .set({ id: "t1", proyectoId: "p1", nombre: "Tarea A", responsable: "Ana", estado: "En progreso", porcentaje: 50, historial: historialHoy });
    await adminDb
      .doc("proyectos/p1/tareas/t2")
      .set({ id: "t2", proyectoId: "p1", nombre: "Tarea B", responsable: "Beto", estado: "En progreso", porcentaje: 50, historial: historialHoy });

    const html = await (await GET(urlInforme("p1", { fecha: FECHA, resp: "Ana" }), ctx("p1"))).text();

    expect(html).toContain("Ana");
    expect(html).not.toContain("Beto");
  });

  it("un gestor ve la hora de la jornada de otro; alguien sin verJornadasAjenas ve 'sin jornada registrada'", async () => {
    await seedProyecto("p1", "Torre Norte");
    const historialHoy = [
      { f: MOMENTO_HOY - 60_000, p: 0, e: "Sin iniciar" },
      { f: MOMENTO_HOY, p: 50, e: "En progreso" },
    ];
    // La sección de "Otro Ingeniero" solo se pinta si tiene actividad de tarea ese día: la
    // jornada por sí sola no genera una sección, así que hace falta ambas cosas sembradas.
    await adminDb.doc("proyectos/p1/tareas/t1").set({
      id: "t1",
      proyectoId: "p1",
      nombre: "Tarea de otro",
      responsable: "Otro Ingeniero",
      estado: "En progreso",
      porcentaje: 50,
      historial: historialHoy,
    });
    await adminDb.collection("jornadas").add({
      uid: "otro-uid",
      usuarioNombre: "Otro Ingeniero",
      proyectoId: "p1",
      fecha: FECHA,
      entrada: MOMENTO_HOY,
      salida: null,
      duracionMin: null,
      estado: "abierta",
    });

    comoRol("modelador", "yo-uid");
    const htmlSinPermiso = await (await GET(urlInforme("p1", { fecha: FECHA }), ctx("p1"))).text();
    expect(htmlSinPermiso).toContain("Otro Ingeniero"); // la actividad de tarea no es dato reservado
    expect(htmlSinPermiso).toContain("Sin jornada registrada este día"); // pero su jornada sí lo es

    comoRol("coordinador");
    const htmlGestor = await (await GET(urlInforme("p1", { fecha: FECHA }), ctx("p1"))).text();
    expect(htmlGestor).not.toContain("Sin jornada registrada este día");
  });
});
