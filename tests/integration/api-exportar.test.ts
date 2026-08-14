import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/sesion", () => ({ exigirUsuario: vi.fn() }));

import { GET } from "@/app/api/proyectos/[id]/exportar/route";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import { limpiarFirestore, seedProyecto, usuarioFalso } from "./helpers/proyectos";

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirUsuario).mockResolvedValue(usuarioFalso("ing-1", "ingeniero"));
});

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/proyectos/[id]/exportar", () => {
  it("devuelve 404 si el proyecto no existe", async () => {
    const res = await GET(new Request("http://localhost/api/proyectos/no-existe/exportar"), ctx("no-existe"));
    expect(res.status).toBe(404);
  });

  it("exporta el proyecto con sus tareas en el formato plano v1, con nombre de archivo slugificado", async () => {
    await seedProyecto("p1", "Torre Norte — Fase 2");
    await adminDb.doc("proyectos/p1/tareas/t1").set({ id: "t1", proyectoId: "p1", nombre: "T1", actualizado: 1 });

    const res = await GET(new Request("http://localhost/api/proyectos/p1/exportar"), ctx("p1"));
    const cuerpo = await res.json();

    expect(cuerpo.nombre).toBe("Torre Norte — Fase 2");
    expect(cuerpo.tareas).toHaveLength(1);
    expect(cuerpo.tareas[0].id).toBe("t1");
    const disposition = res.headers.get("content-disposition") ?? "";
    expect(disposition).toMatch(/filename="torre-norte.*fase-2.*\.json"/);
  });
});
