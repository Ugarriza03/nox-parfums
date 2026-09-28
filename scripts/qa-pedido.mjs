/**
 * QA de edición rápida del pedido y sincronización global.
 * Catálogo · Ficha · Asesor · Mi pedido comparten el mismo estado.
 *
 *   npm run qa:pedido
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

const NAME = "Christian Dior Sauvage";
const SLUG = "christian-dior-sauvage";

const results = [];
const errors = [];
function log(name, ok, detail = "") {
  results.push(ok);
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({ proxy });

async function run(label, width, height) {
  console.log(`\n── ${label} (${width}px) ${"─".repeat(34)}`);
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(`[${label}] ${e.message}`));
  page.on("console", (m) => {
    // Las tipografías de Google están bloqueadas en el entorno de CI de este
    // sandbox; ese fallo no es del código y se ignora.
    const ruido = /ERR_TUNNEL_CONNECTION_FAILED|fonts\.(googleapis|gstatic)/;
    if (m.type() === "error" && !ruido.test(m.text())) errors.push(`[${label}] ${m.text()}`);
  });

  const go = async (hash) => {
    await page.goto(`${file}${hash}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
  };

  // Cantidad que muestra el badge del header (estado global)
  const headerCount = () =>
    page.locator("header a[href='#/mi-pedido'] span").last().textContent();

  const addBtn = () => page.getByLabel(`Agregar ${NAME} al pedido`).first();
  const plusBtn = () => page.getByLabel(`Agregar una unidad de ${NAME}`).first();
  const minusBtn = () => page.getByLabel(`Quitar una unidad de ${NAME}`).first();
  const trashBtn = () => page.getByLabel(`Quitar ${NAME} del pedido`).first();

  /* ========================= 1. CATÁLOGO ========================= */

  await go("#/catalogo");
  await page.fill("input[type=search]", "sauvage");
  await page.waitForTimeout(500);

  log("catálogo · estado inicial muestra Agregar", (await addBtn().count()) === 1);

  await addBtn().click();
  await page.waitForTimeout(350);
  log("catálogo · al agregar aparece el stepper en 1", (await headerCount()) === "1");
  log(
    "catálogo · NO redirige a Mi pedido",
    page.url().includes("#/catalogo"),
    page.url().split("#")[1]
  );

  await plusBtn().click();
  await page.waitForTimeout(300);
  log("catálogo · + suma a 2", (await headerCount()) === "2");

  await plusBtn().click();
  await page.waitForTimeout(300);
  log("catálogo · + suma a 3", (await headerCount()) === "3");

  await minusBtn().click();
  await page.waitForTimeout(300);
  log("catálogo · − resta a 2", (await headerCount()) === "2");

  /* ===================== 2. SINCRONIZACIÓN → FICHA ===================== */

  await go(`#/fragancia/${SLUG}`);
  log("ficha · hereda la cantidad del catálogo (2)", (await headerCount()) === "2");
  log("ficha · muestra el bloque Cantidad", (await page.getByText("Cantidad", { exact: true }).count()) > 0);

  await plusBtn().click();
  await page.waitForTimeout(300);
  log("ficha · + suma a 3", (await headerCount()) === "3");

  await minusBtn().click();
  await page.waitForTimeout(300);
  log("ficha · − resta a 2", (await headerCount()) === "2");

  /* ================== 3. VUELTA AL CATÁLOGO Y MI PEDIDO ================== */

  await go("#/catalogo");
  await page.fill("input[type=search]", "sauvage");
  await page.waitForTimeout(500);
  log("catálogo · refleja el cambio hecho en la ficha (2)", (await headerCount()) === "2");

  await go("#/mi-pedido");
  const bodyPedido = await page.textContent("body");
  log("mi pedido · refleja 2 unidades", /2 fragancias elegidas/.test(bodyPedido ?? ""));
  log("mi pedido · precio del combo de 2", /33\.990/.test(bodyPedido ?? ""));

  /* ================ 4. QUITAR DESDE LA FICHA, SIN Mi pedido ============== */

  await go(`#/fragancia/${SLUG}`);
  await page.getByRole("button", { name: `Quitar ${NAME} del pedido` }).first().click();
  await page.waitForTimeout(350);
  log("ficha · quitar deja el pedido vacío", (await headerCount()) === "0");
  log("ficha · vuelve al estado Agregar", (await addBtn().count()) === 1);

  await go("#/mi-pedido");
  const vacio = await page.textContent("body");
  log("mi pedido · quedó vacío tras quitar desde la ficha", /Todavía no elegiste nada/.test(vacio ?? ""));

  /* ============ 5. − EN 1 QUITA EL PRODUCTO (desde el catálogo) ========== */

  await go("#/catalogo");
  await page.fill("input[type=search]", "sauvage");
  await page.waitForTimeout(500);
  await addBtn().click();
  await page.waitForTimeout(350);
  await trashBtn().click();
  await page.waitForTimeout(350);
  log("catálogo · en 1, el control de restar quita el producto", (await headerCount()) === "0");
  log("catálogo · vuelve a Agregar", (await addBtn().count()) === 1);

  /* ====== 5bis. MI PEDIDO · PORTADAS REALES, EDICIÓN Y TOTALES ======
   *
   * Regresión del lote 13. Mi pedido llamaba directamente a FragranceVisual,
   * el componente de respaldo, así que las miniaturas mostraban siempre la
   * composición generada aunque la fragancia tuviera su foto. Ahora pasa por
   * ProductCover, el punto único de decisión (slug -> coverFor() -> PORTADAS).
   * El test no conoce ninguna tabla de imágenes: lee lo que la página terminó
   * mostrando y lo compara contra la ficha y la card del catálogo.
   *
   * El pedido llega vacío del bloque 5 y se devuelve vacío al bloque 6.
   */

  const agregarDesdeCatalogo = async (busqueda) => {
    await go("#/catalogo");
    await page.fill("input[type=search]", busqueda);
    await page.waitForTimeout(500);
    const btn = page.locator('button[aria-label^="Agregar "][aria-label$="al pedido"]').first();
    const nombre = (await btn.getAttribute("aria-label"))
      ?.replace(/^Agregar /, "")
      .replace(/ al pedido$/, "");
    await btn.click();
    await page.waitForTimeout(350);
    return nombre;
  };

  const elegidas = [];
  for (const busqueda of ["sauvage", "khamrah", "good girl"]) {
    elegidas.push(await agregarDesdeCatalogo(busqueda));
  }
  log(
    "mi pedido · se cargaron 3 fragancias distintas desde el catálogo",
    new Set(elegidas).size === 3 && (await headerCount()) === "3",
    elegidas.join(" · ")
  );

  await go("#/mi-pedido");

  const miniaturas = await page.evaluate(() =>
    [...document.querySelectorAll("li")]
      .map((li) => {
        // La miniatura es el enlace a la ficha que contiene la imagen; el
        // botón de quitar también tiene un <svg>, por eso no se mira el <li>
        // entero sino ese enlace.
        const cont = [...li.querySelectorAll('a[href*="/fragancia/"]')].find((a) =>
          a.querySelector("img, svg")
        );
        if (!cont) return null;
        const img = cont.querySelector("img");
        return {
          slug: cont.getAttribute("href").split("/fragancia/")[1],
          src: img?.getAttribute("src") ?? null,
          esRespaldo: !img && Boolean(cont.querySelector("svg"))
        };
      })
      .filter(Boolean)
  );

  log("mi pedido · hay una miniatura por línea", miniaturas.length === 3, `${miniaturas.length} leídas`);
  const sinFoto = miniaturas.filter((m) => m.esRespaldo || !m.src);
  log(
    "mi pedido · ninguna fragancia con portada cae en la composición genérica",
    sinFoto.length === 0,
    sinFoto.map((m) => m.slug).join(", ")
  );
  log(
    "mi pedido · cada línea muestra su propia portada, no la misma repetida",
    new Set(miniaturas.map((m) => m.src)).size === miniaturas.length
  );

  const conFoto = miniaturas.filter((m) => m.src);
  const distintasDeLaFicha = [];
  for (const { slug, src } of conFoto) {
    await page.goto(`${file}#/fragancia/${slug}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    const enFicha = await page.evaluate(() => {
      const img = [...document.images].find((i) => i.getBoundingClientRect().width > 120);
      return img?.getAttribute("src") ?? null;
    });
    if (enFicha !== src) distintasDeLaFicha.push(slug);
  }
  log(
    `mi pedido · la portada coincide con la de la ficha (${conFoto.length} comparadas)`,
    conFoto.length === 3 && distintasDeLaFicha.length === 0,
    distintasDeLaFicha.join(", ")
  );

  // El catálogo pagina, así que se lo filtra con las mismas búsquedas que se
  // usaron para cargar el pedido en vez de leer el listado completo.
  const enCatalogo = {};
  for (const busqueda of ["sauvage", "khamrah", "good girl"]) {
    await go("#/catalogo");
    await page.fill("input[type=search]", busqueda);
    await page.waitForTimeout(600);
    const parcial = await page.evaluate(() => {
      const mapa = {};
      for (const a of document.querySelectorAll('a[href*="/fragancia/"]')) {
        const img = a.querySelector("img");
        if (!img) continue;
        const slug = a.getAttribute("href").split("/fragancia/")[1];
        if (!(slug in mapa)) mapa[slug] = img.getAttribute("src");
      }
      return mapa;
    });
    Object.assign(enCatalogo, parcial);
  }
  const enAmbas = conFoto.filter((m) => enCatalogo[m.slug]);
  const distintasDelCatalogo = enAmbas.filter((m) => enCatalogo[m.slug] !== m.src);
  log(
    `mi pedido · la portada coincide con la card del catálogo (${enAmbas.length} comparadas)`,
    conFoto.length === 3 && enAmbas.length === conFoto.length && distintasDelCatalogo.length === 0,
    distintasDelCatalogo.map((m) => m.slug).join(", ")
  );

  /* -- edición, precios y mensaje de WhatsApp desde la propia página -- */

  await go("#/mi-pedido");
  const grupo = (nombre) => page.getByRole("group", { name: `Cantidad de ${nombre}` }).first();
  const masDe = (nombre) => grupo(nombre).getByRole("button", { name: "Agregar 1" });
  const menosDe = (nombre) => grupo(nombre).getByRole("button", { name: "Quitar 1" });

  const cuerpo3 = (await page.textContent("body")) ?? "";
  log("mi pedido · 3 unidades cotizan 47.990", /47\.990/.test(cuerpo3));

  const leerWhatsApp = async () => {
    const href = await page
      .getByRole("link", { name: /Finalizar pedido por WhatsApp/ })
      .first()
      .getAttribute("href");
    return { href, mensaje: decodeURIComponent((href ?? "").split("text=")[1] ?? "") };
  };

  const wa3 = await leerWhatsApp();
  log(
    "mi pedido · el mensaje de WhatsApp lleva las 3 líneas, el total y el regalo",
    Boolean(wa3.href?.includes("wa.me")) &&
      (wa3.mensaje.match(/^1x /gm) ?? []).length === 3 &&
      wa3.mensaje.includes("Cantidad total: 3") &&
      /Total: .*47\.990/.test(wa3.mensaje) &&
      /Incluye de regalo: \d/.test(wa3.mensaje)
  );

  await masDe(elegidas[0]).click();
  await page.waitForTimeout(400);
  log("mi pedido · + suma una unidad a la línea", (await headerCount()) === "4");
  log("mi pedido · 4 unidades recotizan a 57.470", /57\.470/.test((await page.textContent("body")) ?? ""));

  await menosDe(elegidas[0]).click();
  await page.waitForTimeout(400);
  log(
    "mi pedido · − devuelve la línea a 1 y el total a 47.990",
    (await headerCount()) === "3" && /47\.990/.test((await page.textContent("body")) ?? "")
  );

  await masDe(elegidas[0]).click();
  await page.waitForTimeout(300);
  await masDe(elegidas[0]).click();
  await page.waitForTimeout(450);
  const cuerpo5 = (await page.textContent("body")) ?? "";
  log(
    "mi pedido · 5 unidades entran en la promoción por cantidad",
    (await headerCount()) === "5" &&
      /69\.950/.test(cuerpo5) &&
      /Desde 5 unidades,/.test(cuerpo5) &&
      /Promoción válida de 5 a 9 unidades/.test(cuerpo5)
  );
  const wa5 = await leerWhatsApp();
  log(
    "mi pedido · el mensaje de WhatsApp refleja la promoción",
    wa5.mensaje.includes("Cantidad total: 5") &&
      /Precio por unidad: .*13\.990/.test(wa5.mensaje) &&
      /Total: .*69\.950/.test(wa5.mensaje)
  );

  const miniaturasTrasEditar = await page.locator('li a[href*="/fragancia/"] img').count();
  log(
    "mi pedido · las portadas siguen siendo fotos después de editar cantidades",
    miniaturasTrasEditar >= 3,
    `${miniaturasTrasEditar} imágenes`
  );

  await page.getByRole("button", { name: `Quitar ${elegidas[2]} del pedido` }).first().click();
  await page.waitForTimeout(450);
  log(
    "mi pedido · quitar una línea la saca del pedido",
    (await headerCount()) === "4" &&
      (await page.getByRole("group", { name: `Cantidad de ${elegidas[2]}` }).count()) === 0
  );

  await page.getByRole("button", { name: "Vaciar pedido" }).click();
  await page.waitForTimeout(450);
  log(
    "mi pedido · vaciar deja el pedido vacío",
    (await headerCount()) === "0" &&
      /Todavía no elegiste nada/.test((await page.textContent("body")) ?? "")
  );

  /* ========================== 6. ASESOR ========================== */

  await go("#/asesor");
  await page.getByText("Dulce y gourmand").click();
  await page.waitForTimeout(450);
  await page.getByText("Vainilla", { exact: true }).first().click();
  await page.getByText("Continuar").click();
  await page.waitForTimeout(450);
  await page.getByText("Noche y salidas").click();
  await page.waitForTimeout(600);
  // Tras la tercera pregunta aparece la pantalla de decisión.
  await page.getByRole("button", { name: /Ver mis recomendaciones/ }).first().click();
  await page.waitForTimeout(600);

  const firstAdd = page.locator('button[aria-label^="Agregar "][aria-label$="al pedido"]').first();
  const recName = (await firstAdd.getAttribute("aria-label"))
    ?.replace(/^Agregar /, "")
    .replace(/ al pedido$/, "");
  log("asesor · recomendación con control de agregar", Boolean(recName), recName ?? "");

  await firstAdd.click();
  await page.waitForTimeout(350);
  log("asesor · agrega desde la recomendación", (await headerCount()) === "1");
  log("asesor · NO redirige a Mi pedido", page.url().includes("#/asesor"));

  await page.getByLabel(`Agregar una unidad de ${recName}`).first().click();
  await page.waitForTimeout(300);
  log("asesor · + suma a 2", (await headerCount()) === "2");

  await page.getByLabel(`Quitar una unidad de ${recName}`).first().click();
  await page.waitForTimeout(300);
  log("asesor · − resta a 1", (await headerCount()) === "1");

  await page.getByRole("button", { name: `Quitar ${recName} del pedido` }).first().click();
  await page.waitForTimeout(350);
  log("asesor · quitar vacía el pedido", (await headerCount()) === "0");

  /* ============ 7. MAYORISTAS: ESCALONES SOBRE LA UI REAL ============ */

  await go("#/mayoristas");
  await page.fill("input[type=search]", "khamrah");
  await page.waitForTimeout(500);

  const sumar = async (n) => {
    const botones = { 10: "+10", 5: "+5", 1: "+1" };
    await page.getByRole("button", { name: botones[n], exact: true }).first().click();
    await page.waitForTimeout(250);
  };

  // 9 unidades: por debajo del mínimo
  await sumar(5);
  await sumar(1);
  await sumar(1);
  await sumar(1);
  await sumar(1);
  let texto = await page.textContent("body");
  log("mayorista · 9 unidades avisa cuánto falta", /Te falta 1 unidad para alcanzar el mínimo/.test(texto ?? ""));
  const enviarDisabled = await page
    .getByRole("button", { name: /Enviar pedido mayorista/ })
    .first()
    .isDisabled();
  log("mayorista · 9 unidades NO puede finalizar", enviarDisabled);
  log(
    "mayorista · 9 unidades mantiene Consultar por WhatsApp",
    (await page.getByRole("link", { name: /Consultar por WhatsApp/ }).count()) > 0
  );

  // Tramos: 10 → 12 → 20 → 30
  const tramo = async (objetivo, unitario, total, etiqueta) => {
    const actual = Number((await page.textContent("body"))?.match(/Unidades\s*([\d.]+)/)?.[1] ?? 0);
    let faltan = objetivo - actual;
    while (faltan >= 10) { await sumar(10); faltan -= 10; }
    while (faltan >= 5) { await sumar(5); faltan -= 5; }
    while (faltan >= 1) { await sumar(1); faltan -= 1; }
    await page.waitForTimeout(350);
    const t = (await page.textContent("body")) ?? "";
    const okUnit = t.includes(unitario);
    const okTotal = t.includes(total);
    log(`mayorista · ${objetivo} unidades → ${unitario} c/u`, okUnit && okTotal, etiqueta);
  };

  await tramo(10, "9.990", "99.900", "total 99.900");
  await tramo(12, "9.990", "119.880", "sigue en el tramo 10–19");
  await tramo(20, "9.490", "189.800", "el escalón aplica a las 20, no sólo a la extra");
  await tramo(30, "8.990", "269.700", "tramo 30–49");

  texto = await page.textContent("body");
  log(
    "mayorista · avisa cuánto falta para el próximo escalón",
    /Sumando \d+ unidades más accedés al precio de/.test(texto ?? "")
  );
  const enviarOk = await page
    .getByRole("link", { name: /Enviar pedido mayorista/ })
    .first()
    .getAttribute("href");
  log(
    "mayorista · desde el mínimo el envío queda habilitado con precio en el mensaje",
    Boolean(enviarOk?.includes("wa.me")) && decodeURIComponent(enviarOk ?? "").includes("8.990"),
    "link con precio unitario"
  );

  /* ==================== 8. SIN SALTOS NI DESBORDE ==================== */

  await go("#/catalogo");
  await page.waitForTimeout(400);
  const card = page.locator("article").first();
  const before = (await card.boundingBox())?.height ?? 0;
  await card.locator('button[aria-label^="Agregar "]').first().click();
  await page.waitForTimeout(400);
  const after = (await card.boundingBox())?.height ?? 0;
  log("catálogo · la card no cambia de alto al agregar", Math.abs(after - before) < 2, `${before} → ${after}`);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  log("catálogo · sin scroll horizontal con el stepper activo", overflow <= 1, `${overflow}px`);

  await context.close();
}

await run("mobile", 390, 844);
await run("mobile grande", 430, 932);
await run("desktop", 1440, 900);

await browser.close();

const fallas = results.filter((r) => !r).length;
console.log("\n" + "─".repeat(56));
console.log(`${results.length - fallas}/${results.length} verificaciones OK`);
if (errors.length) {
  console.log(`\nErrores de consola (${errors.length}):`);
  [...new Set(errors)].slice(0, 8).forEach((e) => console.log("  ", e));
}
process.exit(fallas || errors.length ? 1 : 0);
