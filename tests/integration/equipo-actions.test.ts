import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/sesion", () => ({ exigirUsuario: vi.fn() }));

import { agregarResponsable, quitarResponsable } from "@/app/(app)/equipo/actions";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { Rol } from "@/types";
import { limpiarFirestore, usuarioFalso } from "./helpers/proyectos";

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirUsuario).mockReset();
});

function comoRol(rol: Rol) {
  vi.mocked(exigirUsuario).mockResolvedValue(usuarioFalso(`${rol}-uid`, rol));
}

async function membersLegacy(): Promise<string[]> {
  const snap = await adminDb.doc("config/equipo").get();
  return (snap.data()?.membersLegacy as string[] | undefined) ?? [];
}

describe("agregarResponsable", () => {
  it("un gestor (coordinador) agrega un responsable nuevo", async () => {
    comoRol("coordinador");
    await agregarResponsable("Juan Pérez");
    expect(await membersLegacy()).toContain("Juan Pérez");
  });

  it("rechaza un nombre vacío o en blanco", async () => {
    comoRol("admin");
    await expect(agregarResponsable("   ")).rejects.toThrow("no puede estar vacío");
  });

  it("rechaza un responsable duplicado", async () => {
    comoRol("admin");
    await agregarResponsable("Juan Pérez");
    await expect(agregarResponsable("Juan Pérez")).rejects.toThrow("ya existe");
  });

  it("un rol sin gestionarEquipo (ingeniero) no puede agregar responsables", async () => {
    comoRol("ingeniero");
    await expect(agregarResponsable("X")).rejects.toThrow("No tienes permiso");
  });
});

describe("quitarResponsable", () => {
  it("un gestor quita un responsable existente", async () => {
    comoRol("admin");
    await agregarResponsable("Juan Pérez");

    await quitarResponsable("Juan Pérez");

    expect(await membersLegacy()).not.toContain("Juan Pérez");
  });

  it("un rol sin gestionarEquipo no puede quitar responsables", async () => {
    comoRol("admin");
    await agregarResponsable("Juan Pérez");

    comoRol("modelador");
    await expect(quitarResponsable("Juan Pérez")).rejects.toThrow("No tienes permiso");
  });
});
