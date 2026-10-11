/**
 * QA de catálogo y copy.
 *
 * Verifica atribución de marcas, distinción de variantes homónimas y que no
 * hayan vuelto frases que el cliente pidió sacar.
 *
 *   npm run qa:catalogo
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { PRODUCTS, PRODUCTS_BY_SLUG, TOTAL_PRODUCTS } from "../src/data/products";
import { OLFACTORY_PROFILES } from "../src/data/olfactory";
import { HOUSE_UNIVERSE } from "../src/data/brands";

let fallas = 0;
function check(nombre: string, ok: boolean, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

/* ===================== 1. Atribución Afnan / Armaf ====================== */

console.log("\n1. ATRIBUCIÓN DE MARCAS\n" + "─".repeat(64));

const porNombre = (nombre: string) =>
  PRODUCTS.find((p) => p.inspiredBy.endsWith(nombre) && p.gender === "masculino");

for (const [nombre, casaEsperada] of [
  ["9PM", "Afnan"],
  ["9PM Night Out", "Afnan"],
  ["Club de Nuit", "Armaf"],
  ["Mandarin Sky", "Armaf"]
] as const) {
  const p = PRODUCTS.find((x) => x.inspiredBy === `${casaEsperada} ${nombre}`);
  check(`${nombre} → ${casaEsperada}`, Boolean(p), p ? `slug ${p.slug}` : "NO EXISTE");
}

check(
  "ningún producto quedó huérfano bajo la casa vieja",
  !PRODUCTS.some((p) => p.house === "Armaf" && /9PM/i.test(p.inspiredBy))
);
check("el catálogo conserva 233 fragancias", TOTAL_PRODUCTS === 233, `${TOTAL_PRODUCTS}`);

/* =================== 2. Datos olfativos no se perdieron ================= */

console.log("\n2. DATOS OLFATIVOS TRAS LA MIGRACIÓN\n" + "─".repeat(64));

check(
  "9PM conserva su perfil bajo la clave nueva",
  Boolean(OLFACTORY_PROFILES["afnan-9pm"]),
  "afnan-9pm"
);
check("no quedó la clave vieja armaf-9pm", !OLFACTORY_PROFILES["armaf-9pm"]);
check("Club de Nuit conserva su perfil", Boolean(OLFACTORY_PROFILES["armaf-club-de-nuit"]));

const huerfanas = Object.keys(OLFACTORY_PROFILES).filter((k) => !PRODUCTS_BY_SLUG[k]);
check("ningún perfil apunta a un producto inexistente", huerfanas.length === 0, huerfanas.join(", "));

/* ======================= 3. 212 VIP femenino / masculino =============== */

console.log("\n3. 212 VIP\n" + "─".repeat(64));

const vipFem = PRODUCTS_BY_SLUG["carolina-herrera-212-vip"];
const vipMasc = PRODUCTS_BY_SLUG["carolina-herrera-212-vip-men"];

check("femenino existe como 212 VIP", vipFem?.gender === "femenino", vipFem?.inspiredBy);
check(
  "masculino existe como 212 VIP Men",
  vipMasc?.gender === "masculino" && vipMasc.inspiredBy.endsWith("212 VIP Men"),
  vipMasc?.inspiredBy
);
check("son slugs distintos", vipFem?.slug !== vipMasc?.slug);
// El lote 20 cargó los dos. Lo que importaba no era que estuvieran vacíos sino
// que no se contaminaran entre sí: son fragancias distintas y sus perfiles
// tienen que serlo también.
const perfVipFem = OLFACTORY_PROFILES[vipFem?.slug ?? ""] as Record<string, unknown> | undefined;
const perfVipMasc = OLFACTORY_PROFILES[vipMasc?.slug ?? ""] as Record<string, unknown> | undefined;
check(
  "no comparten información olfativa",
  !perfVipFem ||
    !perfVipMasc ||
    (JSON.stringify(perfVipFem) !== JSON.stringify(perfVipMasc) &&
      !(perfVipFem.mainNotes as string[]).some((n) => (perfVipMasc.mainNotes as string[]).includes(n))),
  perfVipFem && perfVipMasc ? "ambos cargados, sin notas principales en común" : "alguno sigue pendiente"
);
check(
  "ya no hay sufijo de género en 212 VIP",
  !PRODUCTS.some((p) => p.slug.startsWith("carolina-herrera-212-vip-") && /-(femenino|masculino)$/.test(p.slug))
);

/* ==================== 3bis. Todo el catálogo clasificado ================ */

console.log("\n3bis. UNIVERSOS\n" + "─".repeat(64));

const sinClasificar = PRODUCTS.filter((p) => p.universe === "pendiente");
check(
  "ningún producto quedó sin universo",
  sinClasificar.length === 0,
  sinClasificar.length ? sinClasificar.map((p) => `${p.inspiredBy} (${p.slug})`).join(", ") : "0 pendientes"
);

const porUniverso = {
  disenador: PRODUCTS.filter((p) => p.universe === "disenador").length,
  nicho: PRODUCTS.filter((p) => p.universe === "nicho").length,
  arabe: PRODUCTS.filter((p) => p.universe === "arabe").length
};
const suma = porUniverso.disenador + porUniverso.nicho + porUniverso.arabe;
console.log(
  `   Diseñador ${porUniverso.disenador} · Nicho ${porUniverso.nicho} · Árabes ${porUniverso.arabe}`
);
check(
  "la suma de universos iguala el total del catálogo",
  suma === PRODUCTS.length,
  `${suma} = ${PRODUCTS.length}`
);

const ESPERADO = { disenador: 179, nicho: 23, arabe: 31 } as const;
for (const [universo, cantidad] of Object.entries(ESPERADO)) {
  check(
    `${universo}: ${cantidad}`,
    porUniverso[universo as keyof typeof porUniverso] === cantidad,
    `${porUniverso[universo as keyof typeof porUniverso]}`
  );
}

/* ---- Precedencia: la clasificación comercial gana al origin del bloque ---- */

console.log("\n3ter. PRECEDENCIA DE UNIVERSO\n" + "─".repeat(64));

// Montale y Xerjoff entran por el bloque Árabes del catálogo maestro, pero
// HOUSE_UNIVERSE las declara nicho. La decisión comercial manda.
const porOrigenArabe = PRODUCTS.filter((p) => p.origin === "arabe");
for (const [casa, universo] of [
  ["Montale", "nicho"],
  ["Xerjoff", "nicho"]
] as const) {
  const dela = PRODUCTS.filter((p) => p.house === casa);
  check(
    `${casa} → ${universo} pese a venir del bloque árabe`,
    dela.length > 0 &&
      dela.every((p) => p.universe === universo) &&
      dela.some((p) => p.origin === "arabe"),
    dela.map((p) => `${p.inspiredBy}: ${p.universe} (origin ${p.origin})`).join(" · ")
  );
}

check(
  "el origin raw no pisa ninguna clasificación explícita de HOUSE_UNIVERSE",
  porOrigenArabe
    .filter((p) => HOUSE_UNIVERSE[p.house])
    .every((p) => p.universe === HOUSE_UNIVERSE[p.house]),
  porOrigenArabe
    .filter((p) => HOUSE_UNIVERSE[p.house] && p.universe !== HOUSE_UNIVERSE[p.house])
    .map((p) => p.inspiredBy)
    .join(", ") || "ninguna discrepancia"
);

// Las casas árabes sin clasificación explícita siguen resolviéndose por origin.
for (const casa of [
  "Afnan",
  "Armaf",
  "Lattafa",
  "Rasasi",
  "Al Haramain",
  "Bharara",
  "Kajal",
  "Kayali"
]) {
  const dela = PRODUCTS.filter((p) => p.house === casa);
  if (dela.length === 0) continue;
  check(
    `${casa} sigue en Árabes (sin clasificación explícita)`,
    !HOUSE_UNIVERSE[casa] && dela.every((p) => p.universe === "arabe"),
    `${dela.length} fragancias`
  );
}

const lv = PRODUCTS.filter((p) => p.house === "Louis Vuitton");
check(
  "Louis Vuitton clasificado como diseñador",
  lv.length > 0 && lv.every((p) => p.universe === "disenador"),
  `${lv.length} fragancias`
);

/* ============================== 4. Copy ================================ */

console.log("\n4. COPY\n" + "─".repeat(64));

function archivosFuente(dir: string, out: string[] = []): string[] {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) archivosFuente(ruta, out);
    else if (/\.(tsx?|css)$/.test(nombre)) out.push(ruta);
  }
  return out;
}

const fuentes = archivosFuente("src");
const buscar = (patron: RegExp) =>
  fuentes.filter((f) => patron.test(readFileSync(f, "utf8")));

for (const [etiqueta, patron] of [
  ["NOX elabora fragancias propias", /NOX elabora/i],
  ["cómo trabajan nuestros revendedores", /nuestros revendedores/i],
  ["elaboramos / fabricamos / formulamos", /\b(elaboramos|fabricamos|formulamos)\b/i],
  ["fragancias propias", /fragancias propias/i],
  ["más concentrada", /m[aá]s concentrada/i],
  ["concentrada de/dentro de la perfumería", /concentrada (de|dentro de) la perfumer/i],
  ["formato que hacemos / trabajamos", /formato que (hacemos|trabajamos)/i],
  ["Para empezar por algún lado", /Para empezar por alg[uú]n lado/i],
  ["Dulces, especiados y con mucha estela", /Dulces, especiados y con mucha estela/i],
  ["Los perfumes que reconocés apenas los sentís", /reconoc[eé]s apenas los sent/i],
  ["Composiciones menos masivas", /menos masivas/i]
] as const) {
  const hits = buscar(patron);
  check(`"${etiqueta}" → 0 apariciones`, hits.length === 0, hits.join(", "));
}

const footer = readFileSync("src/components/layout/Footer.tsx", "utf8");
check(
  "el footer usa la redacción aprobada",
  footer.includes("NOX ofrece fragancias inspiradas en perfumes reconocidos")
);

const mayoristas = readFileSync("src/app/(tienda)/mayoristas/WholesaleClient.tsx", "utf8");
check(
  "mayoristas usa la redacción aprobada",
  mayoristas.includes("te explicamos cómo funciona la compra")
);

const home = readFileSync("src/components/home/Sections.tsx", "utf8");
const faq = readFileSync("src/config/faq.ts", "utf8");
check(
  "la home usa la redacción aprobada de Extrait de Parfum",
  home.includes("Nuestros extractos se presentan como Extrait de Parfum en 60 ml")
);
check(
  "la FAQ usa la misma redacción",
  faq.includes("Nuestros extractos se presentan como Extrait de Parfum en 60 ml")
);
check("la home usa el título aprobado de la selección", home.includes("Una selección para descubrir NOX"));
check(
  "los universos usan la redacción aprobada",
  home.includes("Referencias de grandes casas internacionales") &&
    home.includes("identidad olfativa más particular") &&
    home.includes("perfumería árabe")
);

const asesor = readFileSync("src/app/(tienda)/asesor/AdvisorClient.tsx", "utf8");
check('"Intenso y ambarado" no existe en el asesor', !asesor.includes("Intenso y ambarado"));
check(
  'el asesor usa "Ambarado" con el hint aprobado',
  asesor.includes('label: "Ambarado"') && asesor.includes("Ámbar, resinas, calidez y profundidad")
);

/* ============== 5. La fuente interna no llega al frontend =============== */

console.log("\n5. CAPA INTERNA\n" + "─".repeat(64));

// Las rutas vienen de join(), que usa "\" en Windows y "/" en POSIX. Estas
// comparaciones se escriben con "/", así que la ruta se normaliza antes de
// comparar: sin esto, en Windows el filtro no excluye src/data/ y la capa
// interna se cuela entre los componentes, dando falsos positivos.
const enPosix = (ruta: string) => ruta.split(sep).join("/");

const componentes = fuentes.filter((f) => !enPosix(f).includes("src/data/"));
const filtra = componentes.filter((f) => /olfactory\.sources/.test(readFileSync(f, "utf8")));
check(
  "ningún componente importa olfactory.sources",
  filtra.length === 0,
  filtra.join(", ")
);
const menciones = componentes.filter((f) => /Fragrantica/i.test(readFileSync(f, "utf8")));
check("ningún componente menciona la fuente", menciones.length === 0, menciones.join(", "));

// Las notas de revisión son texto de trabajo interno: mismo aislamiento.
const sinComentarios = (archivo: string) =>
  readFileSync(archivo, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");

const conNotas = fuentes
  .filter((f) => !enPosix(f).includes("src/data/review-notes.ts"))
  .filter((f) => /review-notes|REVIEW_NOTES|reviewNote/.test(sinComentarios(f)));
check(
  "ningún archivo de src importa las notas de revisión",
  conNotas.length === 0,
  conNotas.join(", ")
);
check(
  "Product ya no expone reviewNote",
  !/reviewNote/.test(readFileSync("src/data/types.ts", "utf8"))
);
check(
  "las notas de revisión siguen existiendo para el equipo",
  /HOUSE_REVIEW_NOTES/.test(readFileSync("src/data/review-notes.ts", "utf8")) &&
    /PRODUCT_REVIEW_NOTES/.test(readFileSync("src/data/review-notes.ts", "utf8"))
);

console.log("\n" + "─".repeat(64));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
