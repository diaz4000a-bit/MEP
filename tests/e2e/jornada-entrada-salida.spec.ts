import { expect, test } from "@playwright/test";
import { ADMIN_E2E, PASSWORD_E2E } from "./fixtures/usuarios";
import { esperarHidratacionProyectos, login } from "./helpers";

/**
 * Registra entrada y salida de jornada desde la barra global (BarraJornada, presente en toda
 * página de (app)), ejercitando su Select custom de proyecto — el otro flujo deferido junto
 * con el cambio de estado de tarea.
 */
const PROYECTO = { nombre: "Proyecto E2E Jornada", tareas: [] };

test("registrar entrada y salida de jornada actualiza la barra en tiempo real", async ({ page }) => {
  await login(page, ADMIN_E2E.email, PASSWORD_E2E);
  await page.goto("/proyectos");
  await esperarHidratacionProyectos(page);

  await page.locator('input[type="file"]').setInputFiles({
    name: "jornada.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(PROYECTO)),
  });
  await expect(page.getByText('Proyecto "Proyecto E2E Jornada" importado.')).toBeVisible({ timeout: 10_000 });

  // El combobox de proyecto de BarraJornada arranca en `proyectos[0]`, que puede no ser el
  // que acabamos de crear si otro spec ya importó uno antes (mismo emulador, misma corrida).
  // Se selecciona explícitamente por nombre en vez de asumir el valor por defecto.
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Proyecto E2E Jornada" }).click();

  await page.getByRole("button", { name: "Registrar entrada" }).click();
  await expect(page.getByText("En jornada")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Registrar salida" })).toBeVisible();

  await page.getByRole("button", { name: "Registrar salida" }).click();
  await expect(page.getByRole("button", { name: "Registrar entrada" })).toBeVisible({ timeout: 10_000 });
});
