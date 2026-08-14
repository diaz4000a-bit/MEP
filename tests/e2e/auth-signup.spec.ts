import { expect, test } from "@playwright/test";
import { ADMIN_E2E, PASSWORD_E2E } from "./fixtures/usuarios";
import { login } from "./helpers";

test("alta nueva queda pendiente, un admin la activa, y entonces el login funciona", async ({ browser, page }) => {
  const correoNuevo = `nuevo-${Date.now()}@e2e.test`;

  // 1) Alta por la UI real.
  await page.goto("/login");
  await page.getByRole("button", { name: "Crear una cuenta nueva" }).click();
  await page.getByLabel("Nombre").fill("Ingeniero Nuevo E2E");
  await page.getByLabel("Correo").fill(correoNuevo);
  await page.getByLabel("Contraseña").fill(PASSWORD_E2E);
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page.getByText("Tu cuenta espera aprobación")).toBeVisible({ timeout: 10_000 });

  // 2) Un admin (contexto de navegador aparte, sesión propia) la aprueba desde /usuarios.
  const contextoAdmin = await browser.newContext();
  const paginaAdmin = await contextoAdmin.newPage();
  await login(paginaAdmin, ADMIN_E2E.email, PASSWORD_E2E);
  await paginaAdmin.goto("/usuarios");
  const fila = paginaAdmin.locator("tr", { hasText: correoNuevo });
  await expect(fila).toBeVisible();
  await fila.getByRole("switch").click();
  await expect(fila.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await contextoAdmin.close();

  // 3) Con la cuenta ya activa, el mismo login que antes fallaba silenciosamente ahora entra.
  await page.goto("/login");
  await page.getByLabel("Correo").fill(correoNuevo);
  await page.getByLabel("Contraseña").fill(PASSWORD_E2E);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
});
