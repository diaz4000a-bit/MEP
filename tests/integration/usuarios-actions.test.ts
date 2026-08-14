import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/sesion", () => ({ exigirRol: vi.fn() }));

import { actualizarUsuario, eliminarUsuario } from "@/app/(app)/usuarios/actions";
import { exigirRol } from "@/lib/auth/sesion";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { Usuario } from "@/types";
import { limpiarFirestore, seedUsuario, usuarioFalso } from "./helpers/proyectos";

/**
 * usuarios/actions.ts usa `exigirRol("admin")` directamente (no el `exigirUsuario` + `puede()`
 * local del resto de las actions), así que aquí se mockea `exigirRol` en vez de `exigirUsuario`.
 */

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirRol).mockReset();
});

function comoAdmin(uid = "admin-uid") {
  const admin = usuarioFalso(uid, "admin");
  vi.mocked(exigirRol).mockResolvedValue(admin);
  return admin;
}

describe("actualizarUsuario", () => {
  it("un admin activa a otro usuario y le cambia el rol", async () => {
    comoAdmin();
    await seedUsuario(usuarioFalso("user-1", "usuario"));

    await actualizarUsuario("user-1", { rol: "ingeniero", activo: true });

    const snap = await adminDb.doc("usuarios/user-1").get();
    const usuario = snap.data() as Usuario;
    expect(usuario.rol).toBe("ingeniero");
    expect(usuario.activo).toBe(true);
  });

  it("un admin no puede cambiar su propio rol o estado", async () => {
    const admin = comoAdmin();
    await seedUsuario(admin);

    await expect(actualizarUsuario(admin.uid, { rol: "usuario" })).rejects.toThrow(
      "No puedes cambiar tu propio rol o estado",
    );
  });
});

describe("eliminarUsuario", () => {
  it("borra el doc de Firestore y la cuenta de Auth de otro usuario", async () => {
    comoAdmin();
    await seedUsuario(usuarioFalso("user-1", "usuario"));
    await adminAuth.createUser({ uid: "user-1", email: "user-1@test.local" });

    await eliminarUsuario("user-1");

    expect((await adminDb.doc("usuarios/user-1").get()).exists).toBe(false);
    await expect(adminAuth.getUser("user-1")).rejects.toThrow();
  });

  it("no revienta si el usuario ya no existe en Auth (solo quedaba el doc de Firestore)", async () => {
    comoAdmin();
    await seedUsuario(usuarioFalso("user-1", "usuario"));
    // A propósito: nunca se crea en el emulador de Auth, para forzar auth/user-not-found.

    await eliminarUsuario("user-1");

    expect((await adminDb.doc("usuarios/user-1").get()).exists).toBe(false);
  });

  it("un admin no puede eliminar su propia cuenta", async () => {
    const admin = comoAdmin();
    await seedUsuario(admin);

    await expect(eliminarUsuario(admin.uid)).rejects.toThrow("No puedes eliminar tu propia cuenta");
    expect((await adminDb.doc(`usuarios/${admin.uid}`).get()).exists).toBe(true);
  });
});
