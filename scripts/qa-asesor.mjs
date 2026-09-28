/**
 * QA del flujo del asesor.
 *
 * Tres preguntas obligatorias → pantalla de decisión → refinamiento opcional.
 * Nunca se avanza solo a Intensidad.
 *
 *   npm run qa:asesor
 */

import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// pathToFileURL arma la URL file:// correcta en los tres sistemas. Pegar la
// ruta detrás de "file://" sólo funciona en POSIX: en Windows produce
// file://C:\... , sin la tercera barra y con barras invertidas.
const file = pathToFileURL(resolve(root, "dist-preview/index.html")).href;
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;

const results = [];
const errors = [];
function log(name, ok, detail = "") {
  results.push(ok);
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({ proxy });

async function run(label, width, height) {
  console.log(`\n── ${label} (${width}px) ${"─".repeat(30)}`);
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(`[${label}] ${e.message}`));
  page.on("console", (m) => {
    const ruido = /ERR_TUNNEL_CONNECTION_FAILED|fonts\.(googleapis|gstatic)/;
    if (m.type() === "error" && !ruido.test(m.text())) errors.push(`[${label}] ${m.text()}`);
  });

  // Navegar al mismo hash no recarga la app: hace falta un reload explícito
  // para que el asesor arranque de cero.
  const abrir = async () => {
    await page.goto(`${file}#/asesor`, { waitUntil: "domcontentloaded" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
  };
  const texto = () => page.textContent("body");
  /** {slug, src} de lo que mostró el asesor, para compararlo después contra la ficha. */
  let vistasDelAsesor = [];

  /* ---------------- 1. Progreso sobre 3, no sobre 5 ---------------- */

  await abrir();
  let t = (await texto()) ?? "";
  log("paso 1 se anuncia como 'Paso 1 de 3'", t.includes("Paso 1 de 3"));
  log("no aparece 'Paso 1 de 5'", !t.includes("de 5"));

  /* ---------------- 2. "Intenso y ambarado" ya no existe ---------------- */

  log('la opción "Intenso y ambarado" no existe', !t.includes("Intenso y ambarado"));
  log('existe la opción "Ambarado"', t.includes("Ambarado"));
  log(
    'el hint de Ambarado es el aprobado',
    t.includes("Ámbar, resinas, calidez y profundidad")
  );

  /* ---------------- 3. Las tres preguntas y la pantalla de decisión ---------------- */

  await page.getByText("Dulce y gourmand").click();
  await page.waitForTimeout(450);
  t = (await texto()) ?? "";
  log("tras Aroma pasa a 'Paso 2 de 3'", t.includes("Paso 2 de 3"));

  await page.getByText("Vainilla", { exact: true }).first().click();
  await page.getByText("Continuar").click();
  await page.waitForTimeout(450);
  t = (await texto()) ?? "";
  log("tras Notas pasa a 'Paso 3 de 3'", t.includes("Paso 3 de 3"));

  await page.getByText("Noche y salidas").click();
  await page.waitForTimeout(600);
  t = (await texto()) ?? "";

  log("tras Ocasión aparece la pantalla de decisión", t.includes("Ya tenemos suficiente para orientarte"));
  log("NO avanza solo a Intensidad", !t.includes("¿Qué intensidad preferís?"));
  log("ofrece Ver mis recomendaciones", t.includes("Ver mis recomendaciones"));
  log("ofrece asesoramiento personalizado", t.includes("Quiero asesoramiento personalizado"));
  log("ofrece Afinar un poco más", t.includes("Afinar un poco más"));

  /* ---------------- 4. WhatsApp con las 3 respuestas ---------------- */

  const wa = await page
    .getByRole("link", { name: /Quiero asesoramiento personalizado/ })
    .first()
    .getAttribute("href");
  const msg = decodeURIComponent(wa ?? "");
  log(
    "WhatsApp lleva las 3 respuestas",
    msg.includes("Tipo de aroma: Dulce y gourmand") &&
      msg.includes("Notas que me gustan: Vainilla") &&
      msg.includes("Ocasión: Noche y salidas")
  );
  log(
    "WhatsApp no afirma intensidad ni perfil que no eligió",
    msg.includes("Intensidad: Sin preferencia") && msg.includes("Perfil: Indistinto")
  );

  /* ---------------- 5. Recomendaciones con sólo 3 respuestas ---------------- */

  await page.getByRole("button", { name: /Ver mis recomendaciones/ }).first().click();
  await page.waitForTimeout(600);
  t = (await texto()) ?? "";
  log("muestra recomendaciones con 3 respuestas", t.includes("Esto es lo que te recomendamos"));
  const filas = await page.locator('button[aria-label^="Agregar "][aria-label$="al pedido"]').count();
  log("lista al menos 3 fragancias", filas >= 3, `${filas} filas`);
  log("desde resultados todavía se puede afinar", t.includes("Afinar un poco más"));

  /* --- 5bis. Las tarjetas usan la portada canónica, no la genérica --------
   *
   * Regresión del lote 12: el asesor llamaba directamente al componente de
   * respaldo, así que cada resultado mostraba la composición generada aunque la
   * fragancia tuviera su portada fotográfica. Lo que se comprueba acá es la
   * correspondencia real: la imagen de cada recomendación tiene que ser LA MISMA
   * que la de esa fragancia en su ficha. Se compara el src completo, que en el
   * HTML autónomo es el data URI de la portada, así que dos imágenes distintas
   * no pueden coincidir por casualidad.
   */
  const recomendadas = await page.evaluate(() => {
    const filas = [...document.querySelectorAll('a[href*="/fragancia/"]')]
      .map((a) => a.closest("div"))
      .filter(Boolean);
    const vistas = new Map();
    for (const fila of filas) {
      const link = fila.querySelector('a[href*="/fragancia/"]');
      const img = fila.querySelector("img");
      const svg = fila.querySelector("svg");
      const slug = link?.getAttribute("href")?.split("/fragancia/")[1];
      if (!slug || vistas.has(slug)) continue;
      if (!img && !svg) continue;
      vistas.set(slug, { slug, src: img?.getAttribute("src") ?? null, esRespaldo: !img && !!svg });
    }
    return [...vistas.values()];
  });
  log("se pudieron leer las imágenes de las recomendaciones", recomendadas.length >= 3, `${recomendadas.length} leídas`);
  const conRespaldo = recomendadas.filter((r) => r.esRespaldo || !r.src);
  log(
    "ninguna recomendación cae en la portada genérica",
    conRespaldo.length === 0,
    conRespaldo.map((r) => r.slug).join(", ")
  );
  vistasDelAsesor = recomendadas.filter((r) => r.src);

  /* ---------------- 6. El refinamiento abre Intensidad + Perfil ---------------- */

  await page.getByRole("button", { name: "Afinar un poco más" }).first().click();
  await page.waitForTimeout(600);
  t = (await texto()) ?? "";
  log("Afinar abre Intensidad", t.includes("¿Qué intensidad preferís?"));
  log("el refinamiento se anuncia como paso 1 de 2", t.includes("Paso 1 de 2") && t.includes("Afinando"));

  await page.getByText("Que se note").click();
  await page.waitForTimeout(500);
  t = (await texto()) ?? "";
  log("tras Intensidad sigue Perfil", t.includes("¿Preferís algún perfil?"));

  await page.getByText("Indistinto").click();
  await page.waitForTimeout(700);
  t = (await texto()) ?? "";
  log("tras Perfil muestra recomendaciones afinadas", t.includes("Recomendaciones afinadas"));
  log("ya no ofrece afinar de nuevo", !t.includes("Afinar un poco más"));

  /* ---------------- 7. Volver desde la pantalla de decisión ---------------- */

  await abrir();
  await page.getByText("Fresco y cítrico").click();
  await page.waitForTimeout(400);
  await page.getByText("Continuar").click();
  await page.waitForTimeout(400);
  await page.getByText("Todos los días").click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Volver" }).first().click();
  await page.waitForTimeout(500);
  t = (await texto()) ?? "";
  log("desde la decisión se puede volver a la última pregunta", t.includes("¿Para qué ocasión lo buscás?"));

  /* ---------------- 8. La portada del asesor === la portada de la ficha ------ */

  let comparadas = 0;
  const distintas = [];
  for (const { slug, src } of vistasDelAsesor.slice(0, 5)) {
    await page.goto(`${file}#/fragancia/${slug}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    const enFicha = await page.evaluate(() => {
      const img = [...document.images].find((i) => i.getBoundingClientRect().width > 120);
      return img?.getAttribute("src") ?? null;
    });
    comparadas++;
    if (enFicha !== src) distintas.push(slug);
  }
  log(`la portada del asesor coincide con la de la ficha (${comparadas} comparadas)`,
    comparadas > 0 && distintas.length === 0, distintas.join(", "));

  await context.close();
}

await run("mobile", 390, 844);
await run("desktop", 1440, 900);

await browser.close();

const fallas = results.filter((r) => !r).length;
console.log("\n" + "─".repeat(52));
console.log(`${results.length - fallas}/${results.length} verificaciones OK`);
if (errors.length) {
  console.log(`\nErrores de consola (${errors.length}):`);
  [...new Set(errors)].slice(0, 8).forEach((e) => console.log("  ", e));
}
process.exit(fallas || errors.length ? 1 : 0);
