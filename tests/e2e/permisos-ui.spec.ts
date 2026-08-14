import { expect, test } from "@playwright/test";
import { PASSWORD_E2E, USUARIO_E2E } from "./fixtures/usuarios";
import { login } from "./helpers";

test("un usuario sin permiso de crearProyecto no ve los botones de admin y no puede entrar a /usuarios", async ({
  page,
}) => {
  await login(page, USUARIO_E2E.email, PASSWORD_E2E);

  await page.goto("/proyectos");
  await expect(page.getByRole("button", { name: "Nuevo proyecto" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Importar JSON" })).toHaveCount(0);

  // exigirRol("admin") en usuarios/page.tsx redirige a /dashboard para cualquier otro rol.
  await page.goto("/usuarios");
  await page.waitForURL((url) => url.pathname === "/dashboard", { timeout: 10_000 });
});
