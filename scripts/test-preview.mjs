/**
 * Prueba de recorrido completo sobre dist-preview/index.html.
 * Verifica que las pantallas rendericen, que el pedido sume precio correcto
 * y que el link de WhatsApp se arme con el mensaje redactado.
 */

import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdirSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// pathToFileURL arma la URL file:// correcta en los tres sistemas. Pegar la
// ruta detrás de "file://" sólo funciona en POSIX: en Windows produce
// file://C:\... , sin la tercera barra y con barras invertidas.
const file = pathToFileURL(resolve(root, "dist-preview/index.html")).href;
const shots = resolve(root, "dist-preview/shots");
mkdirSync(shots, { recursive: true });

const proxy = process.env.HTTPS_PROXY
  ? { server: process.env.HTTPS_PROXY }
  : undefined;

const browser = await chromium.launch({ proxy });
const errors = [];
const results = [];

function log(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function run(label, width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" && !/tailwindcss\.com|Failed to load resource/.test(m.text())) {
      errors.push(`[${label}] ${m.text()}`);
    }
  });
  page.on("pageerror", (e) => errors.push(`[${label}] ${e.message}`));

  const go = async (hash, waitFor) => {
    await page.goto(`${file}${hash}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    if (waitFor) await page.waitForSelector(waitFor, { timeout: 5000 });
  };

  /* ---- Home ---- */
  await go("#/", "h1");
  const h1 = await page.textContent("h1");
  log(`${label} · home renderiza`, /presencia/i.test(h1 ?? ""), h1?.trim().slice(0, 40));
  await page.screenshot({ path: `${shots}/${label}-home.png`, fullPage: false });

  /* ---- Catálogo ---- */
  await go("#/catalogo", "input[type=search]");
  const cards = await page.locator("article").count();
  log(`${label} · catálogo lista productos`, cards >= 20, `${cards} cards`);

  await page.fill("input[type=search]", "sauvage");
  await page.waitForTimeout(500);
  const filtered = await page.locator("article").count();
  log(`${label} · buscador filtra`, filtered > 0 && filtered < cards, `${filtered} resultados`);
  await page.screenshot({ path: `${shots}/${label}-catalogo.png` });

  /* ---- Ficha ---- */
  await go("#/fragancia/christian-dior-sauvage", "h1");
  const detail = await page.textContent("h1");
  const fichaTexto = (await page.textContent("body")) ?? "";
  const hasPerfil =
    fichaTexto.includes("Perfil olfativo") && fichaTexto.includes("Cómo evoluciona");
  const hasNotes = fichaTexto.includes("Ambroxan");
  log(`${label} · ficha de producto`, /Sauvage/i.test(detail ?? ""), detail?.trim());
  log(`${label} · ficha muestra el perfil y las notas`, hasPerfil && hasNotes);
  log(
    `${label} · ficha aclara que es la fragancia de referencia`,
    fichaTexto.includes("Perfil olfativo inspirado en la fragancia de referencia") &&
      fichaTexto.includes("con posibles variaciones propias de nuestra interpretación")
  );
  // innerText = sólo lo que se ve. textContent traería también el bundle inline,
  // donde el bloque de performance existe aunque nunca se renderice.
  const fichaVisible = await page.evaluate(() => document.body.innerText);
  log(
    `${label} · la ficha NO afirma performance sin prueba NOX`,
    !/Probado por NOX|estela|proyecci[oó]n|durante horas|\d+\s?horas/i.test(fichaVisible)
  );
  log(
    `${label} · la ficha NO publica porcentajes internos`,
    !/98\s?%|(?<![\d.])(25|35)\s?%/.test(fichaVisible)
  );
  log(
    `${label} · la ficha NO expone la fuente interna`,
    !/Fragrantica|fragrantica\.com|Fuente:|Verificado el/i.test(fichaTexto)
  );
  await page.screenshot({ path: `${shots}/${label}-ficha.png` });

  /* ---- Agregar al pedido: 2 unidades ---- */
  await page.click("text=Agregar al pedido");
  await page.waitForTimeout(400);
  await go("#/fragancia/chanel-bleu-de-chanel", "h1");
  await page.click("text=Agregar al pedido");
  await page.waitForTimeout(600);

  /* ---- Mi pedido ---- */
  await go("#/mi-pedido", "h1");
  const body = await page.textContent("body");
  const has2 = /2 fragancias elegidas/.test(body ?? "");
  const hasTotal = /33\.990/.test(body ?? "");
  log(`${label} · pedido con 2 unidades`, has2);
  log(`${label} · precio combo de 2 correcto ($33.990)`, hasTotal);

  const wa = await page.getAttribute('a[href*="wa.me"]:has-text("Finalizar")', "href");
  const decoded = decodeURIComponent(wa ?? "");
  const waOk =
    decoded.includes("5491127076746") &&
    decoded.includes("quiero realizar este pedido") &&
    decoded.includes("Inspirado en Christian Dior Sauvage") &&
    decoded.includes("Cantidad total: 2");
  log(`${label} · WhatsApp arma el mensaje`, waOk);
  if (!waOk) console.log("   href:", decoded.slice(0, 240));
  await page.screenshot({ path: `${shots}/${label}-pedido.png` });

  /* ---- Asesor ---- */
  await go("#/asesor", "h1");
  await page.click("text=Dulce y gourmand");
  await page.waitForTimeout(500);
  await page.click("text=Vainilla");
  await page.click("text=Continuar");
  await page.waitForTimeout(500);
  await page.click("text=Noche y salidas");
  await page.waitForTimeout(700);
  const advisorBody = await page.textContent("body");
  log(
    `${label} · asesor llega a la pantalla de decisión con 3 respuestas`,
    /Ya tenemos suficiente para orientarte/.test(advisorBody ?? "")
  );

  await page.getByRole("button", { name: /Ver mis recomendaciones/ }).first().click();
  await page.waitForTimeout(600);
  const recs = await page.locator("text=Inspirado en").count();
  log(`${label} · asesor muestra recomendaciones`, recs >= 3, `${recs} filas`);
  await page.screenshot({ path: `${shots}/${label}-asesor.png` });

  /* ---- Mayoristas ---- */
  await go("#/mayoristas", "h1");
  await page.fill('input[type=search]', "khamrah");
  await page.waitForTimeout(500);
  await page.click("text=+10");
  await page.waitForTimeout(500);
  const wholesaleBody = await page.textContent("body");
  const tierOk = /9\.990/.test(wholesaleBody ?? "") && /99\.900/.test(wholesaleBody ?? "");
  log(`${label} · mayorista calcula 10 × $9.990 = $99.900`, tierOk);
  await page.screenshot({ path: `${shots}/${label}-mayoristas.png` });

  /* ---- Informativas ---- */
  for (const [hash, expect] of [
    ["#/como-comprar", "Cuatro pasos"],
    ["#/envios", "Cómo te llega"],
    ["#/preguntas-frecuentes", "Lo que más nos preguntan"],
    ["#/contacto", "Hablemos"]
  ]) {
    await go(hash, "h1");
    const t = await page.textContent("h1");
    log(`${label} · ${hash}`, (t ?? "").includes(expect), t?.trim());
  }

  /* ---- Sin scroll horizontal ---- */
  await go("#/", "h1");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  log(`${label} · sin scroll horizontal`, overflow <= 1, `${overflow}px`);

  await context.close();
}

await run("mobile", 390, 844);
await run("desktop", 1440, 900);

await browser.close();

console.log("\n────────────────────────────────────");
const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${results.length} verificaciones OK`);
if (errors.length) {
  console.log(`\nErrores de consola (${errors.length}):`);
  [...new Set(errors)].slice(0, 10).forEach((e) => console.log("  ", e));
}
process.exit(failed.length || errors.length ? 1 : 0);
