import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/sesion", () => ({ exigirUsuario: vi.fn() }));

import { GET } from "@/app/api/busqueda/route";
import { exigirUsuario } from "@/lib/auth/sesion";
import type { ItemBusqueda } from "@/lib/busqueda";
import { limpiarFirestore, seedProyecto, usuarioFalso } from "./helpers/proyectos";

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirUsuario).mockReset();
});

describe("GET /api/busqueda", () => {
  it("exige sesión antes de construir el índice", async () => {
    vi.mocked(exigirUsuario).mockRejectedValue(new Error("sin sesión"));
    await expect(GET()).rejects.toThrow("sin sesión");
  });

  it("devuelve proyectos, zonas y tareas indexados, con cache-control privado", async () => {
    vi.mocked(exigirUsuario).mockResolvedValue(usuarioFalso("ing-1", "ingeniero"));
    await seedProyecto("p1", "Torre Norte");

    const res = await GET();
    const items = (await res.json()) as ItemBusqueda[];

    expect(res.headers.get("cache-control")).toContain("private");
    expect(items.some((i) => i.tipo === "Proyectos" && i.label === "Torre Norte")).toBe(true);
    // La Guía es contenido estático (GUIA_MODULOS): siempre debe aparecer en el índice.
    expect(items.some((i) => i.tipo === "Guía")).toBe(true);
  });
});
