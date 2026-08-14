import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/sesion", () => ({ exigirUsuario: vi.fn() }));

import { marcarLeccionLeida } from "@/app/(app)/guia/actions";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { Usuario } from "@/types";
import { limpiarFirestore, seedUsuario, usuarioFalso } from "./helpers/proyectos";

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirUsuario).mockReset();
});

describe("marcarLeccionLeida", () => {
  it("marca una lección como leída para el usuario logueado", async () => {
    const usuario = usuarioFalso("ing-1", "ingeniero");
    await seedUsuario(usuario);
    vi.mocked(exigirUsuario).mockResolvedValue(usuario);

    await marcarLeccionLeida("M1.1", true);

    const snap = await adminDb.doc("usuarios/ing-1").get();
    expect((snap.data() as Usuario).guiaLeidas).toContain("M1.1");
  });

  it("desmarca una lección leída", async () => {
    const usuario = usuarioFalso("ing-1", "ingeniero");
    await seedUsuario(usuario);
    vi.mocked(exigirUsuario).mockResolvedValue(usuario);
    await marcarLeccionLeida("M1.1", true);

    await marcarLeccionLeida("M1.1", false);

    const snap = await adminDb.doc("usuarios/ing-1").get();
    expect((snap.data() as Usuario).guiaLeidas).not.toContain("M1.1");
  });
});
