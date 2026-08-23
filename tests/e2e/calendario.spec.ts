import { expect, test } from "@playwright/test";
import { ADMIN_E2E, PASSWORD_E2E } from "./fixtures/usuarios";
import { esperarHidratacionProyectos, login } from "./helpers";

/**
 * Comprueba que la fecha de entrega de un proyecto aparece en las cuatro vistas del
 * calendario. Las fechas son de 2030 a propósito: así este proyecto es el único con
 * eventos en ese año y las aserciones no dependen de lo que hayan sembrado otros specs
 * en el mismo emulador.
 */
const PROYECTO = {
  nombre: "Proyecto E2E Calendario",
  fechaInicio: "2030-09-02",
  fechaEntrega: "2030-09-30",
  tareas: [{ nombre: "Tarea E2E Calendario", estado: "En progreso", porcentaje: 40, fechaLimite: "2030-09-16" }],
};

test("el calendario muestra la entrega del proyecto en día, semana, mes y año", async ({ page }) => {
  await login(page, ADMIN_E2E.email, PASSWORD_E2E);
  await page.goto("/proyectos");

  await esperarHidratacionProyectos(page);

  await page.locator('input[type="file"]').setInputFiles({
    name: "calendario.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(PROYECTO)),
  });
  await expect(page.getByText('Proyecto "Proyecto E2E Calendario" importado.')).toBeVisible({ timeout: 10_000 });
  await page.waitForURL(/\/proyectos\/[^/]+$/, { timeout: 10_000 });

  // El enlace del menú lateral es la "pestaña" que pidió el usuario.
  await page.getByRole("link", { name: "Calendario", exact: true }).click();
  await page.waitForURL(/\/calendario/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Calendario", exact: true })).toBeVisible();

  // Mes: la entrega cae el 30 de septiembre de 2030.
  await page.goto("/calendario?vista=mes&fecha=2030-09-30");
  await expect(page.getByRole("heading", { name: "Septiembre de 2030" })).toBeVisible();
  await expect(page.getByRole("main").getByText("Proyecto E2E Calendario").first()).toBeVisible();

  // Día: se conserva el ancla al cambiar de pestaña, así que cae en el día de la entrega.
  await page.getByRole("tab", { name: "Día" }).click();
  await expect(page.getByRole("heading", { name: /30 de septiembre de 2030/ })).toBeVisible();
  await expect(page.getByText("Entrega de proyecto")).toBeVisible();

  // Semana: la del 30 de septiembre incluye la entrega.
  await page.getByRole("tab", { name: "Semana" }).click();
  await expect(page.getByRole("main").getByText("Proyecto E2E Calendario").first()).toBeVisible();

  // Año: los 12 meses más el resumen de entregas del año.
  await page.getByRole("tab", { name: "Año" }).click();
  await expect(page.getByRole("heading", { name: "Entregas de 2030" })).toBeVisible();
  // Scope a <main>: el menú lateral también tiene un enlace con el nombre del proyecto.
  await expect(page.getByRole("main").getByRole("link", { name: "Proyecto E2E Calendario" })).toBeVisible();

  // El filtro por tipo apaga las tareas sin tocar las entregas.
  await page.goto("/calendario?vista=mes&fecha=2030-09-16");
  await expect(page.getByRole("main").getByText("Tarea E2E Calendario").first()).toBeVisible();
  await page.getByRole("button", { name: "Tareas" }).click();
  await expect(page.getByRole("main").getByText("Tarea E2E Calendario")).toHaveCount(0);
});
