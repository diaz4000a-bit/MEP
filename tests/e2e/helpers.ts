import { expect, type Page } from "@playwright/test";

/** Inicia sesión por la UI real (no bypass): confirma que login + cookie de sesión funcionan
 *  de punta a punta, no solo que /api/session responde bien en aislamiento. */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
}

/**
 * Espera a que /proyectos haya hidratado. El `onChange` del input de importar es un handler
 * de React: si se sueltan los ficheros antes de que React monte, el evento se pierde en
 * silencio y el import nunca ocurre (falla intermitente que aparece cuando la página trae
 * más datos y tarda más en hidratar). Abrir y cerrar el diálogo prueba que ya es interactiva.
 */
export async function esperarHidratacionProyectos(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Nuevo proyecto" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
