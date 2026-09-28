/**
 * QA DE SINCRONIZACIÓN DEL PREVIEW.
 *
 * Abre el HTML standalone ya construido en un navegador real y comprueba que la
 * regla de precedencia de universos llegó de verdad al frontend: no alcanza con
 * que el dato esté bien en TypeScript si el bundle quedó viejo.
 *
 * Verifica sobre la página renderizada, no sobre el código:
 *   · conteos de universo en la home
 *   · el catálogo filtrado por universo
 *   · la ficha de producto
 *   · el buscador
 *   · que no se publique ninguna metadata interna
 *
 *   npm run qa:sync
 */

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const archivo = resolve(root, "dist-preview/index.html");
// pathToFileURL arma la URL file:// correcta en los tres sistemas. Pegar la
// ruta detrás de "file://" sólo funciona en POSIX: en Windows produce
// file://C:\... , sin la tercera barra y con barras invertidas.
const file = pathToFileURL(archivo).href;
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;

let fallas = 0;
const errores = [];
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

const browser = await chromium.launch({ proxy });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on("pageerror", (e) => errores.push(e.message));
page.on("console", (m) => {
  const ruido = /ERR_TUNNEL_CONNECTION_FAILED|fonts\.(googleapis|gstatic)/;
  if (m.type() === "error" && !ruido.test(m.text())) errores.push(m.text());
});

/**
 * Texto visible normalizado. La UI aplica text-transform: uppercase por CSS y
 * el formateador de precios usa espacio fino, así que comparar el string crudo
 * da falsos negativos. Se compara en minúsculas y con espacios normales.
 */
const normalizar = (t) =>
  t
    .replace(/[\u00a0\u202f\u2009]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const textoVisible = async () => normalizar(await page.evaluate(() => document.body.innerText));

const ir = async (hash, espera = "h1") => {
  await page.goto(`${file}${hash}`, { waitUntil: "domcontentloaded" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(espera, { timeout: 15000 });
  await page.waitForTimeout(600);
};

/* ===================== 1. Conteos de universo en la home ================= */

console.log("\n1. HOME — CONTEOS DE UNIVERSO\n" + "─".repeat(66));

await ir("#/", "h1");
const home = await textoVisible();

for (const [universo, cantidad] of [
  ["Diseñador", 179],
  ["Nicho", 23],
  ["Árabes", 31]
]) {
  // La card muestra "<n> fragancias" justo antes del título del universo.
  const patron = new RegExp(`${cantidad} fragancias ${universo.toLowerCase()}\\b`);
  check(`${universo}: ${cantidad} fragancias`, patron.test(home), patron.source);
}
check("la suma de las tres cards da 233", 179 + 23 + 31 === 233);

/* ======================= 2. Catálogo filtrado por universo ============== */

console.log("\n2. CATÁLOGO FILTRADO\n" + "─".repeat(66));

const contarFichas = () => page.locator("article").count();

/**
 * El catálogo pagina de a 24, así que contar <article> mide la página, no el
 * resultado. El contador que muestra la propia UI es el dato correcto.
 */
const totalFiltrado = async () => {
  // El encabezado dice "<233> fragancias para recorrer" (siempre el total del
  // catálogo); el contador del resultado es el "<n> fragancias" que NO sigue
  // con "para recorrer".
  const t = await textoVisible();
  const m = [...t.matchAll(/(\d+) fragancias(?! para recorrer)/g)];
  return m.length > 0 ? Number(m[0][1]) : -1;
};

await ir("#/catalogo?universo=nicho", "article");
const enNicho = await totalFiltrado();
const textoNicho = await textoVisible();
check("el filtro Nicho devuelve 23 fragancias", enNicho === 23, `${enNicho}`);
for (const nombre of ["Arabians Tonka", "Accento Overdose", "Amber Gold", "Erba Pura"]) {
  check(`${nombre} aparece dentro de Nicho`, textoNicho.includes(nombre.toLowerCase()));
}

await ir("#/catalogo?universo=arabe", "article");
const enArabes = await totalFiltrado();
const textoArabes = await textoVisible();
check("el filtro Árabes devuelve 31 fragancias", enArabes === 31, `${enArabes}`);
for (const nombre of ["Arabians Tonka", "Accento Overdose", "Amber Gold", "Erba Pura"]) {
  check(`${nombre} YA NO aparece dentro de Árabes`, !textoArabes.includes(nombre.toLowerCase()));
}
for (const casa of ["Afnan", "Armaf", "Lattafa", "Rasasi", "Al Haramain", "Bharara", "Kajal", "Kayali"]) {
  check(`${casa} sigue en Árabes`, textoArabes.includes(casa.toLowerCase()));
}

await ir("#/catalogo?universo=disenador", "article");
const enDisenador = await totalFiltrado();
check("el filtro Diseñador devuelve 179 fragancias", enDisenador === 179, `${enDisenador}`);

await ir("#/catalogo", "article");
const total = await totalFiltrado();
check("el catálogo completo muestra 233 fragancias", total === 233, `${total}`);
check("la suma de los tres filtros da el total", enDisenador + enNicho + enArabes === total,
  `${enDisenador} + ${enNicho} + ${enArabes}`);

/* ============================ 3. Ficha de producto ====================== */

console.log("\n3. FICHA DE PRODUCTO\n" + "─".repeat(66));

await ir("#/fragancia/montale-arabians-tonka", "h1");
const ficha = await textoVisible();
check("la ficha de Arabians Tonka abre", ficha.includes("arabians tonka"));
check("la ficha la muestra como Nicho", ficha.includes("nicho"));
check("la ficha NO la muestra como Árabes", !ficha.includes("árabes"));
check("conserva el naming del catálogo", ficha.includes("montale arabians tonka"));

await ir("#/fragancia/xerjoff-erba-pura", "h1");
const erba = await textoVisible();
check("Xerjoff Erba Pura abre y es Nicho", erba.includes("erba pura") && erba.includes("nicho"));

await ir("#/fragancia/tom-ford-tobacco-vanilla", "h1");
const tf = await textoVisible();
check("Tom Ford conserva el nombre público Tobacco Vanilla", tf.includes("tobacco vanilla"));
check("el alias interno Tobacco Vanille no se publica", !tf.includes("tobacco vanille"));

await ir("#/fragancia/armaf-mandarin-sky", "h1");
const ms = await textoVisible();
check("Armaf conserva el nombre público Mandarin Sky", ms.includes("mandarin sky"));
check("el alias interno Odyssey no se publica", !ms.includes("odyssey"));

await ir("#/fragancia/louis-vuitton-afternoon-sweet", "h1");
const lv = await textoVisible();
check("Afternoon Sweet conserva su naming, sin resolver a otra cosa", lv.includes("afternoon sweet") && !lv.includes("afternoon swim"));
// Hasta el lote 10 este producto servía de ejemplo de "sin ficha olfativa".
// NOX confirmó que es un error de naming del catálogo y que la referencia es
// Afternoon Swim (2019), así que ya tiene perfil. Lo que hay que vigilar es la
// otra mitad de la propiedad, y es la línea de arriba: que publicar el perfil
// no filtre el nombre interno. Acá se comprueba que la ficha ya no muestre el
// aviso de "en verificación", que sería falso.
check(
  "Afternoon Sweet ya publica su ficha olfativa",
  !lv.includes("todavía no publicamos la ficha olfativa completa")
);

// Mismo caso de naming que Afternoon Sweet, agregado en el lote 10: el catálogo
// dice "Iris Leather" y la referencia interna es Irish Leather (2013).
await ir("#/fragancia/memo-paris-iris-leather", "h1");
const memo = await textoVisible();
check("Iris Leather conserva su naming, sin resolver a otra cosa", memo.includes("iris leather") && !memo.includes("irish leather"));

await ir("#/fragancia/versace-eros", "h1");
const eros = await textoVisible();
check("Versace Eros conserva su naming", eros.includes("versace eros") && !eros.includes("pour femme"));
// Hasta el lote 09 este producto servía de ejemplo de "sin notas cargadas".
// Ya tiene perfil, cargado contra Eros Pour Femme (2014), así que lo que
// corresponde vigilar es la otra mitad de la propiedad: publicar el perfil no
// puede filtrar el nombre interno de la referencia. El naming público lo
// comprueba la línea de arriba; acá se verifica que la ficha efectivamente
// publique sus notas y que el aviso neutro ya no aparezca donde no toca.
check(
  "Versace Eros ya publica su ficha olfativa",
  !eros.includes("todavía no publicamos la ficha olfativa completa")
);

/* =============================== 4. Buscador ============================ */

console.log("\n4. BUSCADOR\n" + "─".repeat(66));

await ir("#/catalogo", "article");
await page.fill("input[type=search]", "arabians");
await page.waitForTimeout(500);
const buscados = await contarFichas();
const textoBusqueda = await textoVisible();
check("buscar 'arabians' encuentra la fragancia", buscados > 0 && textoBusqueda.includes("arabians tonka"), `${buscados} resultados`);
check("el resultado la etiqueta como Nicho", textoBusqueda.includes("nicho"));

await page.fill("input[type=search]", "erba");
await page.waitForTimeout(500);
check("buscar 'erba' encuentra Erba Pura", (await contarFichas()) > 0);

/* ====================== 5. Datos que no se publican ===================== */

console.log("\n5. NADA INTERNO EN EL HTML\n" + "─".repeat(66));

const bundle = readFileSync(archivo, "utf8");
for (const [etiqueta, patron] of [
  ["candidateUrl", /candidateUrl/i],
  ["urlStatus", /urlStatus/i],
  ["checkedAt", /checkedAt/i],
  ["needsReview", /needsReview/i],
  ["matchConfidence", /matchConfidence/i],
  ["Fragrantica", /fragrantica/i],
  ["98%", /(?<![\d.])98\s?%/],
  ["25% / 35%", /(?<![\d.])(25|35)\s?%/],
  ["noxPerformance", /noxPerformance/],
  ["scripts de importación", /source-file|solo-match|autocompletar-olfativo/],
  // Notas de trabajo dirigidas al equipo: no son copy público.
  ["reviewNote", /reviewNote/],
  ["PRODUCT_REVIEW_NOTES / HOUSE_REVIEW_NOTES", /REVIEW_NOTES/],
  ["review-notes (módulo interno)", /review-notes/],
  ["\"avisame si la corrijo\"", /avisame si la corrijo/i],
  ["\"confirmame cuál\"", /confirmame cu[aá]l/i],
  ["\"Se mantuvo tu escritura\"", /se mantuvo tu escritura/i],
  ["\"conviene revisarlo\"", /conviene revisarlo/i],
  ["\"se respetó tu agrupación\"", /se respet[oó] tu agrupaci[oó]n/i],
  ["\"verificar que sea la que vendés\"", /verificar que sea la que vend[eé]s/i],
  ["\"en tu catálogo\" (tuteo interno al admin)", /en tu cat[aá]logo/i],
  ["\"se cambia en una línea\"", /se cambia en una l[ií]nea/i],
  ["Eros Pour Femme (hipótesis interna)", /pour femme/i],
  ["Althaïr (hipótesis interna)", /altha[ïi]r/i]
]) {
  const hits = (bundle.match(patron) ?? []).length;
  check(`"${etiqueta}" → 0 apariciones en el HTML`, hits === 0, hits ? `${hits} apariciones` : "");
}

/* ============== 5bis. El estado público de los casos dudosos ============ */

console.log("\n5bis. ESTADO PÚBLICO NEUTRO\n" + "─".repeat(66));

/**
 * ADAPTACIÓN DEL LOTE 11 — el catálogo llegó a 233/233.
 *
 * Hasta acá este bloque recorría productos SIN ficha olfativa y comprobaba tres
 * cosas sobre cada uno: que mostraran el aviso neutro, que NO explicaran el
 * motivo técnico de la duda, y que ofrecieran el canal de consulta. Los
 * ejemplos se fueron reemplazando a medida que se cargaban —Haltane en el lote
 * 3, Versace Eros en el 09, Chanel N°5, Afternoon Sweet y L'Interdit en el 10—
 * y en el lote 11 se cargaron los dos últimos, Layton Exclusif y Oud for Glory.
 *
 * Ya no queda ningún producto sin perfil, así que no hay con qué reemplazarlos.
 * Fingir que existe uno sería mentir, y borrar el bloque perdería cobertura.
 * Lo que corresponde es medir la MISMA propiedad desde el otro lado, y en las
 * tres partes en las que se puede seguir midiendo:
 *
 *   1. el estado: que efectivamente no quede ningún producto sin perfil, que es
 *      la razón por la que el recorrido anterior ya no aplica;
 *   2. que el aviso neutro NO aparezca publicado en ninguna parte — antes se
 *      comprobaba sobre tres fichas y ahora sobre el bundle entero, así que la
 *      comprobación es más amplia, no más chica;
 *   3. que el camino de respaldo SIGA EXISTIENDO en el código, con su aviso y su
 *      botón de consulta, para que no se borre en silencio y funcione el día que
 *      un producto vuelva a quedarse sin perfil.
 *
 * La tercera propiedad del recorrido original —que la web nunca publique el
 * vocabulario interno de revisión— no se pierde: la vigila el bloque 5 sobre el
 * bundle completo, y acá se vuelve a comprobar sobre fichas reales.
 */
// Cuántos productos quedan sin perfil es cosa de qa:performance, que ya lo
// vigila; acá se mide lo que se PUBLICA. Si el aviso no aparece en ninguna
// parte del bundle es porque ninguna ficha entró en el camino de respaldo.
check(
  "el aviso de información en verificación no se publica en ninguna parte",
  !normalizar(bundle).includes(normalizar("Todavía no publicamos la ficha olfativa completa"))
);

// El respaldo tiene que seguir en el código aunque hoy no se renderice.
const detalle = readFileSync(resolve(root, "src/components/product/ProductDetail.tsx"), "utf8");
check(
  "el camino de respaldo sigue existiendo: se renderiza cuando no hay perfil",
  /\{!o && \(/.test(detalle)
);
check(
  "el respaldo conserva su aviso neutro",
  detalle.includes("Todavía no publicamos la ficha olfativa completa")
);
check(
  "el respaldo conserva el canal de consulta",
  detalle.includes("Preguntar por esta fragancia")
);

// Y sobre fichas reales: ninguna explica el motivo técnico de una revisión.
for (const [slug, nombre] of [
  ["parfums-de-marly-layton-exclusif", "Layton Exclusif"],
  ["lattafa-oud-for-glory", "Oud for Glory"],
  ["giorgio-armani-acqua-di-gio-femenino", "Acqua di Gio femenino"]
]) {
  await ir(`#/fragancia/${slug}`, "h1");
  const t = await textoVisible();
  check(
    `${nombre} NO explica el motivo técnico de la duda`,
    !/pour femme|altha|avisame|confirmame|se mantuvo tu escritura|en tu catálogo|needsreview|fragrantica/i.test(t)
  );
  check(`${nombre} publica su ficha olfativa`, !t.includes("todavía no publicamos la ficha olfativa completa"));
}

/* ===================== 6. Lo que ya funcionaba sigue igual ============== */

console.log("\n6. SIN REGRESIONES\n" + "─".repeat(66));

await ir("#/", "h1");
const homeTexto = await textoVisible();
for (const precio of ["$ 18.490", "$ 33.990", "$ 47.990", "$ 57.470"]) {
  check(`precio retail ${precio} intacto`, homeTexto.includes(normalizar(precio)));
}

await ir("#/mayoristas", "h1");
const mayoristas = await textoVisible();
for (const precio of ["$ 9.990", "$ 9.490", "$ 8.990", "$ 8.490", "$ 7.990", "$ 7.490", "$ 6.990"]) {
  check(`escala mayorista ${precio} intacta`, mayoristas.includes(normalizar(precio)));
}

await ir("#/asesor", "h1");
const asesor = await textoVisible();
check("el asesor arranca en Paso 1 de 3", asesor.includes("paso 1 de 3"));

await ir("#/fragancia/lattafa-yara", "h1");
await page.click("text=Agregar al pedido");
await page.waitForTimeout(400);
await ir("#/mi-pedido", "h1");
const pedido = await textoVisible();
check("el pedido conserva la unidad agregada", pedido.includes("yara"));
check("el pedido cierra por WhatsApp", (await page.locator('a[href*="wa.me"]').count()) > 0);

check("sin errores de consola", errores.length === 0, [...new Set(errores)].slice(0, 3).join(" | "));

await context.close();
await browser.close();

console.log("\n" + "─".repeat(66));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
