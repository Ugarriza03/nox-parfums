/**
 * Regresión: después de registrar el inventario inicial, el formulario tiene
 * que pasar solo al modo de movimientos (sin F5) y no permitir una segunda
 * carga inicial.
 *
 * Arma con esbuild el FormularioMovimiento REAL dentro de una página que
 * reproduce la estructura de /admin/inventario/[slug], con la acción del
 * servidor reemplazada por una simulación con las reglas de la función SQL
 * (scripts/admin/formulario/). Lo recorre en Chromium con Playwright.
 * No necesita Supabase ni el build de Next.
 *
 *   npm run test:admin:formulario
 */

import { build } from "esbuild";
import { chromium } from "playwright";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dir = mkdtempSync(join(tmpdir(), "nox-formulario-"));

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

const salida = await build({
  entryPoints: [resolve(raiz, "scripts/admin/formulario/pagina-prueba.tsx")],
  bundle: true,
  format: "iife",
  jsx: "automatic",
  tsconfig: resolve(raiz, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"development"' },
  alias: { "@/app/admin/acciones": resolve(raiz, "scripts/admin/formulario/acciones-simuladas.ts") },
  write: false,
  logLevel: "warning"
});
writeFileSync(join(dir, "app.js"), salida.outputFiles[0].text);
writeFileSync(join(dir, "index.html"), '<!doctype html><meta charset="utf-8"><div id="raiz"></div><script src="app.js"></script>');
const url = (slug) => `${pathToFileURL(join(dir, "index.html")).href}?slug=${slug}`;

const browser = await chromium.launch();
const errores = [];

async function abrir(slug) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  await page.goto(url(slug));
  await page.waitForFunction(() => !document.querySelector('button[type="submit"]')?.disabled);
  return page;
}

const boton = (page) => page.locator('button[type="submit"]');
const ayuda = (page) => page.locator("form > p").first();
const texto = (page, cual) => page.locator(`[data-prueba="${cual}"]`).innerText();
const envios = (page) => page.evaluate(() => window.__db.envios);
const movimientos = (page) => page.evaluate(() => window.__db.movimientos.map((m) => m.tipo));

async function enviar(page, { tipo, cantidad, motivo = "" }) {
  if (tipo) await page.locator(`label:has(input[value="${tipo}"])`).click();
  await page.fill('input[name="cantidad"]', String(cantidad));
  await page.fill('input[name="motivo"]', motivo);
  await boton(page).click();
  await page.waitForFunction(() => document.querySelector('button[type="submit"]')?.textContent !== "Registrando…");
  await page.waitForTimeout(50);
}

try {
  /* ---------------------------------------------- 1. caso reportado */
  console.log("\n1. CARGA INICIAL CON 0 UNIDADES (ariana-grande-cloud)\n" + "─".repeat(66));
  let page = await abrir("ariana-grande-cloud");
  check("antes: botón «Registrar carga inicial»", (await boton(page).innerText()) === "Registrar carga inicial");

  await enviar(page, { cantidad: 0, motivo: "Conteo físico: no hay unidades" });

  check("se mantiene la confirmación", /Carga inicial registrado\. Stock propio: 0 → 0\./.test(await page.locator('[role="status"]').innerText()));
  check("título «Registrar movimiento»", (await texto(page, "titulo")) === "Registrar movimiento");
  check("aparecen Ingreso, Egreso y Ajuste por recuento", (await page.locator('input[name="tipo"][type="radio"]').count()) === 3);
  check("Ingreso queda seleccionado", await page.locator('input[value="ingreso"]').isChecked());
  const textoBoton = await boton(page).innerText();
  check("el botón pasa a «Registrar ingreso» sin recargar", textoBoton === "Registrar ingreso", textoBoton);
  const textoAyuda = await ayuda(page).innerText();
  check("desaparece la explicación de la carga inicial", !/Primer registro/.test(textoAyuda) && /entran al stock propio/.test(textoAyuda), textoAyuda);
  check("motivo opcional para ingreso", /\(opcional\)/.test(await page.locator('label[for^="motivo-"]').innerText()));
  check("botón habilitado", await boton(page).isEnabled());
  check("stock 0 y una sola carga inicial en el historial", (await texto(page, "stock")) === "0" && JSON.stringify(await movimientos(page)) === '["carga_inicial"]');

  /* ---------------------------------------------- 2. movimientos */
  console.log("\n2. INGRESO, EGRESO Y AJUSTE DESPUÉS DE LA CARGA\n" + "─".repeat(66));
  await enviar(page, { cantidad: 4 });
  check("ingreso 4 → stock 4", (await texto(page, "stock")) === "4" && /Ingreso registrado\. Stock propio: 0 → 4/.test(await page.locator('[role="status"]').innerText()));

  await page.locator('label:has(input[value="egreso"])').click();
  check("egreso: botón y ayuda correctos", (await boton(page).innerText()) === "Registrar egreso" && /salen del stock propio/.test(await ayuda(page).innerText()));
  await enviar(page, { tipo: "egreso", cantidad: 9 });
  check("egreso mayor al stock se rechaza", /No hay stock propio suficiente/.test(await page.locator('[role="alert"]').innerText()) && (await texto(page, "stock")) === "4");
  await enviar(page, { tipo: "egreso", cantidad: 1 });
  check("egreso 1 → stock 3", (await texto(page, "stock")) === "3");

  await page.locator('label:has(input[value="ajuste"])').click();
  check(
    "ajuste: «Stock real contado» y motivo obligatorio",
    (await page.locator('label[for^="cantidad-"]').innerText()) === "Stock real contado" &&
      /\(obligatorio\)/.test(await page.locator('label[for^="motivo-"]').innerText()) &&
      (await boton(page).innerText()) === "Registrar ajuste por recuento"
  );
  await enviar(page, { tipo: "ajuste", cantidad: 7, motivo: "Recuento" });
  check("ajuste a 7 → stock 7", (await texto(page, "stock")) === "7");
  check(
    "historial: carga, ingreso, egreso, ajuste (el egreso rechazado no se guarda)",
    JSON.stringify(await movimientos(page)) === '["carga_inicial","ingreso","egreso","ajuste"]'
  );
  await page.close();

  /* ---------------------------------------------- 3. sin doble carga */
  console.log("\n3. NO SE PUEDE REGISTRAR DOS VECES LA CARGA INICIAL\n" + "─".repeat(66));
  page = await abrir("afnan-9pm");
  await page.evaluate(() => (window.__retrasarRefresco = true));
  await page.fill('input[name="cantidad"]', "2");
  await page.fill('input[name="motivo"]', "Conteo físico");
  await boton(page).dblclick();
  await page.waitForSelector('[role="status"]');
  check("doble clic: un solo envío", (await envios(page)) === 1, `envíos: ${await envios(page)}`);
  check(
    "confirmada la carga y antes de que llegue la página nueva, el botón queda deshabilitado",
    (await boton(page).isDisabled()) && (await texto(page, "titulo")) === "Registrar inventario inicial"
  );
  await page.fill('input[name="cantidad"]', "5");
  await page.fill('input[name="motivo"]', "Otra vez");
  await page.press('input[name="cantidad"]', "Enter");
  await page.waitForTimeout(300);
  check("Enter con el botón deshabilitado no envía otra carga", (await envios(page)) === 1 && (await movimientos(page)).length === 1, `envíos: ${await envios(page)}`);
  await page.evaluate(() => window.__refrescar());
  await page.waitForTimeout(50);
  check("al llegar los datos nuevos pasa a «Registrar ingreso» y se habilita", (await boton(page).innerText()) === "Registrar ingreso" && (await boton(page).isEnabled()));
  await page.close();

  check("sin errores de consola ni de React", errores.length === 0, errores.slice(0, 2).join(" | "));
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}

console.log("\n" + "─".repeat(66));
if (fallas) {
  console.log(`${fallas} fallas`);
  process.exit(1);
}
console.log("Formulario de movimientos: todo OK");
