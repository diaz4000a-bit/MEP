import { expect, test } from "@playwright/test";
import { ADMIN_E2E, PASSWORD_E2E } from "./fixtures/usuarios";
import { login } from "./helpers";

/**
 * Sube un JSON deliberadamente corrupto por la UI real de "Importar JSON" y confirma que la
 * app lo sanea en vez de reventar o guardarlo tal cual — la misma clase de bug que los P1
 * arreglados antes en esta sesión (fecha inexistente, url 'javascript:' en notasIngenieria,
 * porcentaje/estado inconsistente, responsableUid inventado, zonas sin acotar).
 */
const PROYECTO_CORRUPTO = {
  nombre: "Proyecto E2E Corrupto",
  fechaInicio: "2026-02-31", // fecha inexistente: debe descartarse, no reventar el import
  zonas: Array.from({ length: 310 }, (_, i) => `Zona ${i}`), // por encima del tope de 300
  tareas: [
    {
      nombre: "Tarea corrupta",
      estado: "Completada",
      porcentaje: 10, // debe normalizarse a 100, no quedar inconsistente con el estado
      responsableUid: "uid-inventado", // no corresponde a ningún usuario real: debe descartarse
      notasIngenieria: [
        { texto: "Nota con URL peligrosa", fuente: "RETIE", url: "javascript:alert(1)", verificar: true },
      ],
    },
  ],
};

test("importar un JSON corrupto sanea los datos en vez de reventar", async ({ page }) => {
  await login(page, ADMIN_E2E.email, PASSWORD_E2E);
  await page.goto("/proyectos");

  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "corrupto.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(PROYECTO_CORRUPTO)),
    });

  await expect(page.getByText('Proyecto "Proyecto E2E Corrupto" importado.')).toBeVisible({ timeout: 10_000 });
  await page.waitForURL(/\/proyectos\/[^/]+$/, { timeout: 10_000 });

  await expect(page.getByRole("heading", { name: "Proyecto E2E Corrupto" })).toBeVisible();
  // El porcentaje llegó normalizado a 100 (no el 10 crudo del archivo) hasta la fila de la tabla.
  await expect(page.locator("tr", { hasText: "Tarea corrupta" })).toContainText("100%");
});
