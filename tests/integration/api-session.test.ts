import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { DELETE, POST } from "@/app/api/session/route";
import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import type { Usuario } from "@/types";
import { idTokenDePrueba } from "./helpers/auth-cliente";
import { limpiarFirestore, seedUsuario, usuarioFalso } from "./helpers/proyectos";

/**
 * `cookies()` de next/headers depende del contexto de request de Next.js, que no existe al
 * invocar el Route Handler directo desde un test — se mockea con un jar falso cuyos
 * set()/delete() se pueden inspeccionar (igual razón que next/cache en las Server Actions,
 * y con la ventaja de poder aserto directamente los flags de la cookie: httpOnly, sameSite...).
 * `verifyIdToken` en cambio SÍ corre de verdad contra el emulador de Auth, con un token real
 * obtenido vía el SDK cliente (helpers/auth-cliente.ts) — es la única forma de probar esta
 * ruta sin falsear la pieza que realmente le importa validar.
 */

function jarMockVacio() {
  return { set: vi.fn(), delete: vi.fn(), get: vi.fn() };
}

function postSesion(body: unknown): Request {
  return new Request("http://localhost/api/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(cookies).mockReset();
});

describe("POST /api/session", () => {
  it("token real + cuenta activa: crea la cookie de sesión y actualiza ultimoAcceso", async () => {
    const jar = jarMockVacio();
    vi.mocked(cookies).mockResolvedValue(jar as never);
    const { uid, idToken } = await idTokenDePrueba();
    await seedUsuario({ ...usuarioFalso(uid, "ingeniero"), ultimoAcceso: 1 });

    const res = await POST(postSesion({ idToken }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(jar.set).toHaveBeenCalledWith(
      "sesion",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
    );
    const usuario = (await adminDb.doc(`usuarios/${uid}`).get()).data() as Usuario;
    expect(usuario.ultimoAcceso).toBeGreaterThan(1);
  });

  it("rechaza un cuerpo que no es JSON válido", async () => {
    vi.mocked(cookies).mockResolvedValue(jarMockVacio() as never);
    const res = await POST(postSesion("{esto no es json"));
    expect(res.status).toBe(400);
  });

  it("rechaza si falta idToken", async () => {
    vi.mocked(cookies).mockResolvedValue(jarMockVacio() as never);
    const res = await POST(postSesion({}));
    expect(res.status).toBe(400);
  });

  it("rechaza un idToken inválido (no verificable) con 401, sin reventar con un 500", async () => {
    vi.mocked(cookies).mockResolvedValue(jarMockVacio() as never);
    const res = await POST(postSesion({ idToken: "esto-no-es-un-jwt-real" }));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBeTruthy();
  });

  it("rechaza una cuenta que no está registrada en Firestore", async () => {
    vi.mocked(cookies).mockResolvedValue(jarMockVacio() as never);
    const { idToken } = await idTokenDePrueba();
    // A propósito: no se siembra el doc usuarios/{uid}.

    const res = await POST(postSesion({ idToken }));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("no está registrada");
  });

  it("rechaza una cuenta que todavía no está activa (pendiente de aprobación)", async () => {
    const jar = jarMockVacio();
    vi.mocked(cookies).mockResolvedValue(jar as never);
    const { uid, idToken } = await idTokenDePrueba();
    await seedUsuario({ ...usuarioFalso(uid, "usuario"), activo: false });

    const res = await POST(postSesion({ idToken }));

    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("espera aprobación");
    expect(jar.set).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/session", () => {
  it("borra la cookie de sesión", async () => {
    const jar = jarMockVacio();
    vi.mocked(cookies).mockResolvedValue(jar as never);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(jar.delete).toHaveBeenCalledWith("sesion");
  });
});
