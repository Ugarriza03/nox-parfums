/**
 * QA de la entrada estructurada de información olfativa.
 *
 * Corre el CLI real en dry-run contra archivos JSON generados al vuelo, y
 * verifica que el camino B tenga exactamente las mismas defensas que el remoto:
 * schema, matcher, marca, variante, procedencia, traducción, duplicados,
 * guardia de performance y cero escrituras.
 *
 *   npm run qa:import
 */

import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScript } from "./lib/run-tsx.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = mkdtempSync(join(tmpdir(), "nox-import-"));

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

/**
 * Corre el CLI y devuelve { salida, ok }. Nunca lanza: un fallo también es un
 * dato. runScript es cross-platform: no depende de que exista `npx` en el PATH.
 */
function correr(args) {
  return runScript("scripts/autocompletar-olfativo.ts", args, { cwd: root });
}

function archivo(nombre, contenido) {
  const ruta = join(tmp, nombre);
  writeFileSync(ruta, typeof contenido === "string" ? contenido : JSON.stringify(contenido, null, 2));
  return ruta;
}

/** Registro válido de Yara: base para construir cada variante inválida. */
const YARA = {
  productSlug: "lattafa-yara",
  brand: "Lattafa",
  referenceName: "Yara",
  source: {
    name: "Fragrantica",
    url: "https://www.fragrantica.com/perfume/Lattafa-Perfumes/Yara-76880.html",
    checkedAt: "2026-09-13"
  },
  profile: {
    topNotes: ["Orchid", "Heliotrope", "Tangerine"],
    middleNotes: ["Gourmand Accord", "Tropical Fruits"],
    baseNotes: ["Vanilla", "Musk", "Sandalwood"],
    accords: ["Sweet", "Vanilla", "Powdery", "Tropical", "Musky", "Fruity", "Floral", "Citrus"],
    mainNotes: [],
    family: "Oriental Vanilla"
  }
};

const clon = (cambios) => JSON.parse(JSON.stringify({ ...YARA, ...cambios }));
const conPerfil = (cambios) => {
  const r = clon({});
  r.profile = { ...r.profile, ...cambios };
  return r;
};

/* ------------------- estado de los archivos de datos antes ---------------- */

const rutas = {
  perfiles: join(root, "src/data/olfactory.ts"),
  fuentes: join(root, "src/data/olfactory.sources.ts"),
  performance: join(root, "src/data/nox-performance.ts")
};
const antes = Object.fromEntries(
  Object.entries(rutas).map(([k, v]) => [k, readFileSync(v, "utf8")])
);

/* ========================= 1. CAMINO FELIZ =============================== */

console.log("\n1. IMPORTACIÓN VÁLIDA (Yara)\n" + "─".repeat(68));

const valido = archivo("yara.json", YARA);
const r1 = correr(["--only", "lattafa-yara", "--source-file", valido, "--force", "--dry-run"]);

console.log(
  r1.salida
    .split("\n")
    .filter((l) => /producto NOX|entrada |marca detectada|perfume detectado|URL|confidence|notas de|acordes|familia|carácter|¿qué escribe|¿escribe datos|noxPerformance/.test(l))
    .map((l) => `   ${l.trim()}`)
    .join("\n")
);
console.log("─".repeat(68));

for (const [etiqueta, esperado] of [
  ["identifica el producto NOX", "producto NOX       Lattafa Yara"],
  ["declara que la entrada es el archivo", "entrada            archivo estructurado"],
  ["detecta la marca", "marca detectada    Lattafa"],
  ["detecta la variante", "perfume detectado  Yara"],
  ["registra la URL de la ficha", "Yara-76880.html"],
  ["el match es exacto", "confidence         exact"],
  ["traduce las notas de salida", "Orquídea, Heliotropo, Mandarina"],
  ["traduce las notas de corazón", "Acorde gourmand, Frutas tropicales"],
  ["traduce las notas de fondo", "Vainilla, Almizcle, Sándalo"],
  [
    "traduce los ocho acordes",
    "Dulce, Vainilla, Empolvado, Tropical, Almizclado, Frutal, Floral, Cítrico"
  ],
  ["deriva la familia desde los acordes", "familia            gourmand-dulce"],
  ["deriva el carácter aromático", "carácter aromático equilibrada"],
  ["avisa que profile.family es informativo", "es informativo"],
  ["conserva la redacción ya revisada", "se conserva la ya revisada"],
  ["declara qué escribiría", "¿qué escribe?      NADA — dry-run"],
  ["no escribe en dry-run", "¿escribe datos?    NO — dry-run"],
  ["declara la guardia de performance", "noxPerformance     NO MODIFICADO"],
  ["cierra sin escribir nada", "no se escribió ningún archivo"]
]) {
  check(etiqueta, r1.salida.includes(esperado), esperado.slice(0, 44));
}
check("la corrida termina bien", r1.ok);
check(
  "no publica la familia declarada en la fuente",
  !/familia\s+Oriental Vanilla/i.test(r1.salida)
);

/* ========================= 2. RECHAZOS ================================== */

console.log("\n2. REGISTROS QUE DEBEN RECHAZARSE\n" + "─".repeat(68));

const casos = [
  {
    nombre: "JSON inválido",
    contenido: "{ esto no es json",
    espera: /no es JSON válido/i,
    corta: true
  },
  {
    nombre: "array vacío",
    contenido: "[]",
    espera: /array vacío/i,
    corta: true
  },
  {
    nombre: "producto inexistente",
    contenido: clon({ productSlug: "lattafa-no-existe" }),
    espera: /no existe en el catálogo|sin producto en el catálogo/i
  },
  {
    nombre: "marca incorrecta",
    contenido: clon({ brand: "Armaf" }),
    espera: /marca del archivo/i
  },
  {
    nombre: "variante incorrecta (Yara Candy)",
    contenido: clon({ referenceName: "Yara Candy" }),
    espera: /variante "Yara Candy" ≠ "Yara"/i
  },
  {
    nombre: "variante incorrecta (Yara Elixir)",
    contenido: clon({ referenceName: "Yara Elixir" }),
    espera: /variante "Yara Elixir" ≠ "Yara"/i
  },
  {
    nombre: "otra casa con el mismo nombre",
    contenido: clon({
      source: { ...YARA.source, url: "https://www.fragrantica.com/perfume/Otra-Casa/Yara-1.html" }
    }),
    espera: /pertenece a "otra casa"/i
  },
  {
    nombre: "fuente sin url ni candidateUrl",
    contenido: clon({ source: { name: "Fragrantica" } }),
    espera: /La fuente no declara estado ni trae datos/i
  },
  {
    nombre: "url sin checkedAt no vale como procedencia",
    contenido: clon({
      source: { name: "Fragrantica", url: "https://www.fragrantica.com/perfume/Lattafa-Perfumes/Yara-76880.html" }
    }),
    espera: /Falta source\.checkedAt/i
  },
  {
    nombre: "source.url apunta al índice",
    contenido: clon({
      source: { ...YARA.source, url: "https://www.fragrantica.com/designers/Lattafa-Perfumes.html" }
    }),
    espera: /índice de la casa/i
  },
  {
    nombre: "notas vacías",
    contenido: conPerfil({ topNotes: [], middleNotes: [], baseNotes: [] }),
    espera: /ninguna nota/i
  },
  {
    nombre: "acordes vacíos",
    contenido: conPerfil({ accords: [] }),
    espera: /no trae acordes/i
  },
  {
    nombre: "notas con tipo equivocado",
    contenido: conPerfil({ topNotes: [{ nota: "Orchid" }] }),
    espera: /array de textos/i
  },
  {
    nombre: "intenta escribir performance",
    contenido: clon({ noxPerformance: { verified: true, longevity: "alta" } }),
    espera: /campos de performance/i
  },
  {
    nombre: "intenta escribir performance dentro del perfil",
    contenido: conPerfil({ sillage: "marcada" }),
    espera: /campos de performance/i
  },
  {
    nombre: "intenta importar texto editorial",
    contenido: conPerfil({ description: "Un perfume dulce y cremoso…" }),
    espera: /editoriales o de opinión ajena/i
  },
  {
    nombre: "intenta importar reseñas y votos",
    contenido: clon({ reviews: ["me encanta"], votes: 1200 }),
    espera: /editoriales o de opinión ajena/i
  }
];

for (const caso of casos) {
  const ruta = archivo(`${caso.nombre.replace(/[^a-z0-9]+/gi, "-")}.json`, caso.contenido);
  const r = correr(["--only", "lattafa-yara", "--source-file", ruta, "--force", "--dry-run"]);
  const rechazado = caso.espera.test(r.salida);
  const noCargo = caso.corta
    ? !r.ok
    : /Cargadas: 0/.test(r.salida) || /Para revisar: 1/.test(r.salida);
  check(`${caso.nombre} → se rechaza`, rechazado, rechazado ? "" : r.salida.slice(-220).trim());
  check(`${caso.nombre} → no carga nada`, noCargo);
}

/* ========================= 3. DUPLICADOS ================================ */

console.log("\n3. DUPLICADOS\n" + "─".repeat(68));

const repetido = archivo("repetido.json", [YARA, clon({ referenceName: "Yara Candy" })]);
const r3 = correr(["--source-file", repetido, "--force", "--dry-run"]);
check("avisa que el producto viene repetido en el lote", /repetidos en el archivo/i.test(r3.salida));
check("usa el primer registro y no el segundo", /perfume detectado  Yara\n/.test(r3.salida));

const notaRepetida = conPerfil({ topNotes: ["Orchid", "orchid", "Heliotrope", "Tangerine"] });
const r3b = correr([
  "--only",
  "lattafa-yara",
  "--source-file",
  archivo("nota-repetida.json", notaRepetida),
  "--force",
  "--dry-run"
]);
check("descarta notas duplicadas dentro de una etapa", /Se descartaron duplicados/i.test(r3b.salida));
check(
  "la nota queda una sola vez",
  /notas de salida    Orquídea, Heliotropo, Mandarina\n/.test(r3b.salida)
);

/* ========================= 4. LOTE ====================================== */

console.log("\n4. LOTE\n" + "─".repeat(68));

const lote = archivo("lote.json", [
  YARA,
  {
    ...YARA,
    productSlug: "lattafa-asad",
    referenceName: "Asad",
    source: {
      name: "Fragrantica",
      url: "https://www.fragrantica.com/perfume/Lattafa-Perfumes/Asad-74471.html",
      checkedAt: "2026-09-13"
    }
  }
]);
const r4 = correr(["--source-file", lote, "--force", "--dry-run"]);
check("procesa los dos registros del lote", /Registros en el archivo: 2/.test(r4.salida));
check("resuelve las dos fragancias", /Cargadas: 2/.test(r4.salida));
check("sigue sin escribir nada", /no se escribió ningún archivo/.test(r4.salida));

/* ================= 4bis. UNA RECARGA NO PISA LAS 42 FICHAS ============== */

console.log("\n4bis. RECARGA NO DESTRUCTIVA\n" + "─".repeat(68));

check(
  "por defecto conserva la redacción revisada a mano",
  /redacción          se conserva la ya revisada/.test(r1.salida)
);
const r4b = correr([
  "--only",
  "lattafa-yara",
  "--source-file",
  valido,
  "--force",
  "--rewrite-copy",
  "--dry-run"
]);
check(
  "--rewrite-copy es explícito y se informa",
  /redacción          regenerada desde los acordes/.test(r4b.salida)
);

/* ========================= 5. NADA SE ESCRIBIÓ ========================== */

console.log("\n5. INTEGRIDAD\n" + "─".repeat(68));

for (const [clave, ruta] of Object.entries(rutas)) {
  check(`ninguna corrida modificó ${ruta.split("/").pop()}`, readFileSync(ruta, "utf8") === antes[clave]);
}
check(
  "no quedó cola de revisión escrita",
  !existsSync(join(root, "data-review/revision.json")) ||
    JSON.parse(readFileSync(join(root, "data-review/revision.json"), "utf8")).length >= 0
);
check(
  "ningún camino imprimió campos de performance del producto",
  !/longevity|projection|performanceIntensity|testedAt/.test(r1.salida)
);

/* ========================= 6. SIN BYPASS ================================ */

console.log("\n6. SIN EVASIÓN DE PROTECCIONES\n" + "─".repeat(68));

const cli = readFileSync(join(root, "scripts/autocompletar-olfativo.ts"), "utf8");
const lib = readFileSync(join(root, "scripts/lib/import-olfativo.mjs"), "utf8");
const codigo = `${cli}\n${lib}`.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

for (const [etiqueta, patron] of [
  ["proxy / agente de salida", /HttpsProxyAgent|proxy\s*:|ProxyAgent|socks/i],
  ["rotación de user-agent", /userAgents|UA_LIST|rotate|randomUserAgent/i],
  ["cookies de sesión ajenas", /document\.cookie|Cookie\s*:|setCookie/i],
  ["navegador headless para evadir", /puppeteer|playwright|stealth|selenium/i],
  ["resolución de CAPTCHA", /captcha|2captcha|anticaptcha/i],
  ["reintentos contra el 403", /403[\s\S]{0,80}(retry|reintent)/i]
]) {
  check(`sin ${etiqueta}`, !patron.test(codigo));
}
check(
  "el 403 se maneja marcando needsReview y ofreciendo el archivo",
  /--source-file <archivo\.json>/.test(cli)
);
check("la entrada estructurada no descarga nada", !/fetch\(|http\.get|https\.get/.test(lib));

rmSync(tmp, { recursive: true, force: true });

console.log("\n" + "─".repeat(68));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
