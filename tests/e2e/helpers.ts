import type { Page } from "@playwright/test";

/** Inicia sesión por la UI real (no bypass): confirma que login + cookie de sesión funcionan
 *  de punta a punta, no solo que /api/session responde bien en aislamiento. */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
}
