/**
 * Verifica que ninguna pantalla tenga scroll horizontal en mobile (390px).
 *   npm run test:layout
 */
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// La raíz sale de la ubicación de este archivo, no del directorio desde el que
// se lo invoque. pathToFileURL arma la URL file:// correcta en los tres
// sistemas: en Windows produce file:///C:/... en vez de pegar la ruta con
// barras invertidas detrás de "file://".
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = pathToFileURL(resolve(root, "dist-preview/index.html")).href;
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(file + "#/fragancia/christian-dior-sauvage", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.click("text=Agregar al pedido");
await page.waitForTimeout(300);
for (const hash of ["#/", "#/catalogo", "#/asesor", "#/mi-pedido", "#/mayoristas", "#/como-comprar", "#/envios", "#/preguntas-frecuentes", "#/contacto", "#/fragancia/lattafa-khamrah"]) {
  await page.goto(file + hash, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  const info = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const bad = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 0) {
        bad.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 70), right: Math.round(r.right), w: Math.round(r.width) });
      }
    });
    return { overflow: document.documentElement.scrollWidth - vw, bad: bad.slice(0, 4) };
  });
  console.log(hash, "overflow:", info.overflow);
  info.bad.forEach((b) => console.log("   ", b.tag, "w=" + b.w, "right=" + b.right, "|", b.cls));
}
await browser.close();
