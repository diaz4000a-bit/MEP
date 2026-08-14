import { expect, test } from "@playwright/test";
import { ADMIN_E2E, PASSWORD_E2E } from "./fixtures/usuarios";
import { login } from "./helpers";

/**
 * Cambia estado y porcentaje de una tarea desde su ficha, ejercitando los widgets custom de
 * @base-ui/react (Select y Slider) que ningún otro spec tocaba todavía.
 */
const PROYECTO = {
  nombre: "Proyecto E2E Estado",
  tareas: [{ nombre: "Tarea E2E Estado", estado: "Sin iniciar", porcentaje: 0 }],
};

test("cambiar estado y porcentaje de una tarea persiste tras recargar", async ({ page }) => {
  await login(page, ADMIN_E2E.email, PASSWORD_E2E);
  await page.goto("/proyectos");

  await page.locator('input[type="file"]').setInputFiles({
    name: "estado.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(PROYECTO)),
  });
  await expect(page.getByText('Proyecto "Proyecto E2E Estado" importado.')).toBeVisible({ timeout: 10_000 });
  await page.waitForURL(/\/proyectos\/[^/]+$/, { timeout: 10_000 });

  await page.getByRole("link", { name: "Tarea E2E Estado" }).click();
  await page.waitForURL(/\/proyectos\/[^/]+\/tarea\/[^/]+$/, { timeout: 10_000 });

  // Select custom (@base-ui/react): el trigger no expone un nombre accesible (no hay
  // aria-labelledby resuelto), así que se localiza por landmark: BarraJornada vive en el
  // header, fuera de <main>, y el combobox de estado es el único dentro de <main>.
  const estadoCombobox = page.getByRole("main").getByRole("combobox");
  await estadoCombobox.click();
  await page.getByRole("option", { name: "En progreso" }).click();

  // Slider custom (@base-ui/react): el thumb visible envuelve un <input type="range"> real
  // para accesibilidad, así que el teclado estándar (Home + ArrowRight, paso=5) funciona
  // igual que en cualquier input de rango nativo.
  const slider = page.getByRole("slider");
  await slider.focus();
  await slider.press("Home");
  for (let i = 0; i < 8; i++) await slider.press("ArrowRight");
  await expect(page.getByText("40%").first()).toBeVisible();

  await page.getByRole("button", { name: "Guardar estado" }).click();
  await expect(page.getByText("Estado actualizado.")).toBeVisible({ timeout: 10_000 });

  // Recarga para confirmar que quedó escrito en Firestore, no solo en el estado local. Tras
  // guardar, "40%" también aparece en el avance del proyecto (barra lateral) y en el
  // historial de la tarea, así que se usa `.first()` en vez de exigir un único match.
  await page.reload();
  await expect(estadoCombobox).toContainText("En progreso");
  await expect(page.getByText("40%").first()).toBeVisible();
});
