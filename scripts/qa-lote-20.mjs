/**
 * QA DEL LOTE 20 (20 fragancias investigadas) — modo verificación, sin carga.
 *
 * Este lote agrega tres cosas nuevas al pipeline y hay que probar las tres sin
 * escribir nada:
 *
 *   · una equivalencia de casa (DKNY → Donna-Karan) que valida la URL y NO
 *     cambia el naming público;
 *   · un alias acotado a Givenchy, que no debe existir como alias global;
 *   · 37 notas y 4 acordes nuevos en el diccionario.
 *
 * Y además cierra un bug de verdad: `data-review/revision.json` se reescribía
 * entero en cada corrida, borrando en silencio las revisiones pendientes de los
 * lotes anteriores. Acá se verifica la fusión, regla por regla.
 *
 *   npm run qa:lote20
 */

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScript } from "./lib/run-tsx.mjs";
import {
  BRAND_NAME_ALIASES,
  BRAND_SLUGS,
  NAME_ALIASES,
  NOTE_ES,
  ACCORD_ES,
  normalize,
  translateAccord,
  translateNote
} from "./lib/fragrantica.mjs";
import { mergeRevisionLedger } from "./lib/revision-ledger.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = mkdtempSync(join(tmpdir(), "nox-lote20-"));
const LOTE = join(root, "data/import/lote-20-investigacion.json");

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

const correr = (args) => runScript("scripts/autocompletar-olfativo.ts", args, { cwd: root });
const bloque = (salida, producto) =>
  salida.split(/^· /m).find((p) => p.startsWith(producto)) ?? "";

const crudoLote = readFileSync(LOTE, "utf8");
const registros = JSON.parse(crudoLote);

const rutas = {
  perfiles: join(root, "src/data/olfactory.ts"),
  fuentes: join(root, "src/data/olfactory.sources.ts"),
  performance: join(root, "src/data/nox-performance.ts"),
  catalogo: join(root, "src/data/catalog.raw.ts"),
  precios: join(root, "src/config/pricing.ts"),
  ledger: join(root, "data-review/revision.json")
};
const antes = Object.fromEntries(
  Object.entries(rutas).map(([k, v]) => [k, readFileSync(v, "utf8")])
);

/* ================== 0. IDENTIDAD: CASA Y ALIAS ========================= */

console.log("\n0. IDENTIDAD DE MARCA\n" + "─".repeat(70));

check(
  'BRAND_SLUGS.DKNY === "Donna-Karan"',
  BRAND_SLUGS.DKNY === "Donna-Karan",
  BRAND_SLUGS.DKNY ?? "sin entrada"
);
check(
  'BRAND_SLUGS.Bulgari === "Bvlgari" (ya existía)',
  BRAND_SLUGS.Bulgari === "Bvlgari",
  BRAND_SLUGS.Bulgari ?? ""
);
check(
  "la equivalencia de casa no toca el naming público del catálogo",
  registros.find((r) => r.productSlug === "dkny-be-delicious")?.brand === "DKNY" &&
    !readFileSync(rutas.catalogo, "utf8").includes("Donna-Karan")
);
check(
  'alias acotado: BRAND_NAME_ALIASES.Givenchy["Gentleman Reserve Privée"]',
  BRAND_NAME_ALIASES.Givenchy?.["Gentleman Reserve Privée"] ===
    "Gentleman Eau de Parfum Reserve Privée",
  BRAND_NAME_ALIASES.Givenchy?.["Gentleman Reserve Privée"] ?? "sin entrada"
);
check(
  "ese alias NO existe como alias global",
  NAME_ALIASES["Gentleman Reserve Privée"] === undefined
);
check(
  "los alias de casa anteriores siguen en pie",
  BRAND_NAME_ALIASES["Jean Paul Gaultier"]?.["Le Male Parfum"] === "Le Male Le Parfum" &&
    BRAND_NAME_ALIASES["Al Haramain"]?.["Amber Oud Gold"] === "Amber Oud Gold Edition"
);

/* ================== 1. DICCIONARIO ===================================== */

console.log("\n1. DICCIONARIO\n" + "─".repeat(70));

for (const [en, es] of [
  ["Blackberry", "Mora"],
  ["Candied Fruits", "Frutas confitadas"],
  ["Honeysuckle", "Madreselva"],
  ["Orris Root", "Raíz de lirio"],
  ["Passionfruit", "Maracuyá"],
  ["Quince", "Membrillo"],
  ["Sugar Cane", "Caña de azúcar"],
  ["White Chocolate", "Chocolate blanco"],
  ["Woodsy Notes", "Notas amaderadas"],
  ["Iso E Super", "Iso E Super"]
]) {
  check(`translateNote("${en}") === "${es}"`, translateNote(en) === es, translateNote(en) ?? "null");
}
check(
  'la marca registrada normaliza: translateNote("Pepperwood™") === "Pepperwood"',
  translateNote("Pepperwood™") === "Pepperwood",
  translateNote("Pepperwood™") ?? "null"
);
for (const [en, es] of [
  ["Chocolate", "Chocolate"],
  ["Rum", "Ron"],
  ["Vodka", "Vodka"],
  ["Whiskey", "Whisky"]
]) {
  check(`translateAccord("${en}") === "${es}"`, translateAccord(en) === es, translateAccord(en) ?? "null");
}

const sinNormalizarNotas = Object.keys(NOTE_ES).filter((k) => normalize(k) !== k);
const sinNormalizarAcordes = Object.keys(ACCORD_ES).filter((k) => normalize(k) !== k);
check(
  "toda clave de NOTE_ES está normalizada (si no, es inalcanzable)",
  sinNormalizarNotas.length === 0,
  sinNormalizarNotas.join(", ")
);
check(
  "toda clave de ACCORD_ES está normalizada",
  sinNormalizarAcordes.length === 0,
  sinNormalizarAcordes.join(", ")
);

// Se miran los VALORES, no el archivo: los comentarios nombran a propósito las
// variantes descartadas y no deben contar como uso.
const valores = Object.values(NOTE_ES);
check(
  "es-AR: frutilla, no fresa",
  translateNote("Strawberry Fizz Candy") === "Caramelo de frutilla" &&
    !valores.some((v) => /\bfresa\b/i.test(v))
);
check(
  "es-AR: sin Chabacano ni Fresón",
  !valores.some((v) => /chabacano|fres[oó]n/i.test(v))
);

// Cobertura real del lote: ninguna nota ni acorde puede quedar sin traducir.
const notasLote = new Set();
const acordesLote = new Set();
for (const r of registros) {
  if (!r.profile) continue;
  for (const k of ["topNotes", "middleNotes", "baseNotes", "mainNotes"]) {
    for (const n of r.profile[k] ?? []) notasLote.add(n);
  }
  for (const a of r.profile.accords ?? []) acordesLote.add(a);
}
const notasHuerfanas = [...notasLote].filter((n) => !translateNote(n));
const acordesHuerfanos = [...acordesLote].filter((a) => !translateAccord(a));
check(
  `las ${notasLote.size} notas del lote están todas en el diccionario`,
  notasHuerfanas.length === 0,
  notasHuerfanas.join(", ")
);
check(
  `los ${acordesLote.size} acordes del lote están todos en el diccionario`,
  acordesHuerfanos.length === 0,
  acordesHuerfanos.join(", ")
);

/* ================== 2. SOLO-MATCH ====================================== */

console.log("\n2. SOLO-MATCH — LOS VEINTE\n" + "─".repeat(70));

const solo = correr(["--source-file", LOTE, "--solo-match", "--force"]);
check("el lote corre completo", solo.ok);
check("procesa los 20 registros", /Registros en el archivo: 20/.test(solo.salida));
check("identifica 16 y deja 4 para revisar", /Identificadas: 16   ·   Para revisar: 4/.test(solo.salida));
check("ningún registro queda huérfano del catálogo", !/sin producto en el catálogo/.test(solo.salida));
check("ningún producto viene repetido en el archivo", !/Productos repetidos/.test(solo.salida));

// La columna "referencia" es el nombre de la fragancia de referencia TAL COMO
// lo declara el archivo, no el naming NOX. Tres casos lo hacen evidente y por
// eso están acá:
//   · DKNY Be Delicious       la referencia repite la casa en el nombre;
//                             coincide por prefijo de marca → normalized.
//   · Bulgari Man In Black    la referencia escribe "In" con mayúscula.
//   · Stronger With You       la referencia va bajo la línea Emporio Armani.
// El catálogo NOX no cambia en ninguno de los tres.
const esperado = [
  ["Ariana Grande Sweet Like Candy", "Sweet Like Candy", "exact", "identificado"],
  ["Armani Si", "— (sin referencia confirmada)", "ambiguous", "needsReview"],
  ["Britney Spears Fantasy", "Fantasy", "exact", "identificado"],
  ["Carolina Herrera 212 VIP", "212 VIP", "exact", "identificado"],
  ["Carolina Herrera Good Girl Blush", "Good Girl Blush", "exact", "identificado"],
  ["Christian Dior J'adore", "— (sin referencia confirmada)", "ambiguous", "needsReview"],
  ["DKNY Be Delicious", "DKNY Be Delicious", "normalized", "identificado"],
  ["Givenchy L'Interdit", "— (sin referencia confirmada)", "ambiguous", "needsReview"],
  ["Azzaro Wanted by Night", "Wanted by Night", "exact", "identificado"],
  ["Bulgari Man in Black", "Man In Black", "exact", "identificado"],
  ["Carolina Herrera 212 VIP Men", "212 VIP Men", "exact", "identificado"],
  ["Giorgio Armani Stronger With You Intensely", "Emporio Armani Stronger With You Intensely", "exact", "identificado"],
  ["Givenchy Gentleman Reserve Privée", "Gentleman Eau de Parfum Reserve Privée", "exact", "identificado"],
  ["Louis Vuitton Imagination", "Imagination", "exact", "identificado"],
  ["Tom Ford Noir Extreme", "Noir Extreme", "exact", "identificado"],
  ["Versace Eros Flame", "Eros Flame", "exact", "identificado"],
  ["Lattafa Yara Candy", "Yara Candy", "exact", "identificado"],
  ["Lattafa Khamrah Qahwa", "Khamrah Qahwa", "exact", "identificado"],
  ["Lattafa Oud for Glory", "— (sin referencia confirmada)", "ambiguous", "needsReview"],
  ["Montale Arabians Tonka", "Arabians Tonka", "exact", "identificado"]
];
check("la tabla esperada cubre los 20 productos", esperado.length === 20, `${esperado.length}`);

for (const [producto, referencia, confianza, estado] of esperado) {
  const b = bloque(solo.salida, producto);
  const ok =
    b.includes(`perfume detectado  ${referencia}`) &&
    b.includes(`confidence         ${confianza}`) &&
    b.includes(`estado             ${estado}`);
  check(
    `${producto} → ${referencia} (${confianza})`,
    ok,
    ok ? "" : b ? "bloque distinto al esperado" : "sin bloque en la salida"
  );
}

// La tabla de arriba no puede inventar nombres de referencia: los 16
// identificados tienen que ser, letra por letra, los referenceName que declara
// el archivo para los registros que NO piden revisión.
const refsArchivo = registros
  .filter((r) => r.needsReview !== true)
  .map((r) => r.referenceName)
  .sort();
const refsEsperadas = esperado
  .filter(([, , , estado]) => estado === "identificado")
  .map(([, referencia]) => referencia)
  .sort();
check(
  "las 16 referencias esperadas son las del archivo de entrada, sin retoques",
  JSON.stringify(refsEsperadas) === JSON.stringify(refsArchivo),
  refsEsperadas.filter((r) => !refsArchivo.includes(r)).join(", ")
);

check(
  "solo-match no carga datos olfativos",
  !/notas de salida/.test(solo.salida) &&
    (solo.salida.match(/¿qué escribe\?      NADA — modo sólo-match/g) ?? []).length === 16
);

/* ================== 3. LOS CUATRO DUDOSOS NO SE RESUELVEN SOLOS ======== */

console.log("\n3. LAS CUATRO PARADAS DECLARADAS\n" + "─".repeat(70));

const dudosos = [
  "armani-si",
  "christian-dior-jadore",
  "givenchy-linterdit",
  "lattafa-oud-for-glory"
];
for (const slug of dudosos) {
  const r = registros.find((x) => x.productSlug === slug);
  check(
    `${slug} declara needsReview con motivo`,
    r?.needsReview === true && typeof r?.reviewReason === "string" && r.reviewReason.length > 20
  );
  check(`${slug} no trae pirámide cargable`, !r?.profile);
}
check(
  "los cuatro se anotan sin escribir notas",
  (solo.salida.match(/¿qué escribe\?      NADA — sólo la anotación de revisión/g) ?? []).length === 4
);

/* ================== 4. DRY-RUN ========================================= */

console.log("\n4. DRY-RUN\n" + "─".repeat(70));

const dry = correr(["--source-file", LOTE, "--dry-run", "--force"]);
check("el dry-run corre completo", dry.ok);
check("carga 16 y deja 4 para revisar", /Cargadas: 16   ·   Para revisar: 4/.test(dry.salida));
check("no escribe ningún archivo", /dry-run: no se escribió ningún archivo/.test(dry.salida));
check("ninguna nota queda sin traducir", !/sin traducir/i.test(dry.salida));
check(
  "los 16 derivan familia de los acordes",
  (dry.salida.match(/^ {4}familia {12}\S/gm) ?? []).length === 16,
  `${(dry.salida.match(/^ {4}familia {12}\S/gm) ?? []).length}`
);
const ESCALA = ["suave", "equilibrada", "intensa", "envolvente", "marcada"];
const caracteres = [...dry.salida.matchAll(/^ {4}carácter aromático (\S+)/gm)].map((m) => m[1]);
check(
  "los 16 traen carácter aromático de la escala",
  caracteres.length === 16 && caracteres.every((c) => ESCALA.includes(c)),
  `${caracteres.length}: ${[...new Set(caracteres)].join(", ")}`
);
check(
  "el resumen mainNotes nunca queda vacío",
  (dry.salida.match(/^ {4}notas principales {2}\S/gm) ?? []).length === 16
);
check(
  "la familia declarada en el archivo es informativa, no vinculante",
  /profile\.family \(".*"\) es informativo/.test(dry.salida)
);

/* ================== 5. LEDGER DE REVISIONES ============================ */

console.log("\n5. LEDGER ACUMULATIVO (data-review/revision.json)\n" + "─".repeat(70));

const previo = [
  { slug: "chanel-chanel-n-5", producto: "Chanel Chanel N°5", motivo: "vieja" },
  { slug: "parfums-de-marly-layton-exclusif", producto: "PdM Layton Exclusif", motivo: "vieja" }
];

// A — fuera de alcance: lo de otros lotes se preserva intacto.
const soloLote20 = mergeRevisionLedger(previo, [{ slug: "armani-si", motivo: "nueva" }], ["armani-si"]);
check(
  "A · preserva las entradas de lotes anteriores",
  soloLote20.length === 3 && soloLote20.slice(0, 2).every((e, i) => e.motivo === previo[i].motivo)
);

// B — mismo slug: reemplaza, en su posición original.
const reemplazo = mergeRevisionLedger(
  previo,
  [{ slug: "chanel-chanel-n-5", motivo: "nueva" }],
  ["chanel-chanel-n-5"]
);
check(
  "B · un slug que sigue pendiente se reemplaza en su lugar",
  reemplazo.length === 2 && reemplazo[0].slug === "chanel-chanel-n-5" && reemplazo[0].motivo === "nueva"
);

// C — resuelto: se elimina.
const resuelto = mergeRevisionLedger(previo, [], ["chanel-chanel-n-5"]);
check(
  "C · un slug procesado y resuelto se elimina",
  resuelto.length === 1 && resuelto[0].slug === "parfums-de-marly-layton-exclusif"
);

// D — entrada sin slug: no se puede decidir, se preserva.
const huerfana = mergeRevisionLedger([{ motivo: "sin slug" }, ...previo], [], ["chanel-chanel-n-5"]);
check("D · una entrada sin slug se preserva", huerfana.some((e) => e.motivo === "sin slug"));

// E — deduplicado: un slug, una entrada.
const dup = mergeRevisionLedger([], [{ slug: "z", motivo: "1" }, { slug: "z", motivo: "2" }], ["z"]);
check("E · un slug ocupa una sola entrada (gana la última)", dup.length === 1 && dup[0].motivo === "2");

// F — orden estable.
const orden = mergeRevisionLedger(
  previo,
  [{ slug: "armani-si", motivo: "n" }, { slug: "chanel-chanel-n-5", motivo: "n" }],
  ["chanel-chanel-n-5", "parfums-de-marly-layton-exclusif", "armani-si"]
);
check(
  "F · las preservadas van primero y las nuevas al final",
  JSON.stringify(orden.map((e) => e.slug)) === JSON.stringify(["chanel-chanel-n-5", "armani-si"])
);

// G — idempotencia.
const nuevas = [{ slug: "chanel-chanel-n-5", motivo: "n" }];
const p1 = mergeRevisionLedger(previo, nuevas, ["chanel-chanel-n-5"]);
const p2 = mergeRevisionLedger(p1, nuevas, ["chanel-chanel-n-5"]);
check("G · volver a correr lo mismo deja el ledger igual", JSON.stringify(p1) === JSON.stringify(p2));

check(
  "sin alcance y sin novedades, el ledger no se toca",
  JSON.stringify(mergeRevisionLedger(previo, [], [])) === JSON.stringify(previo)
);

// Regresión del bug: el ledger ya no se escribe pisando todo.
const cli = readFileSync(join(root, "scripts/autocompletar-olfativo.ts"), "utf8");
check(
  "el CLI ya no escribe el ledger sin fusionar",
  !/writeFileSync\(\s*"data-review\/revision\.json",\s*JSON\.stringify\(revision/.test(cli)
);
check("el CLI usa mergeRevisionLedger", /mergeRevisionLedger\(ledgerPrevio, revision, procesados\)/.test(cli));
check(
  "el alcance de la corrida se registra producto por producto",
  /procesados\.add\(product\.slug\)/.test(cli)
);

/* ================== 6. NADA SE ESCRIBIÓ, NADA DE PERFORMANCE =========== */

console.log("\n6. PERFORMANCE Y ESCRITURAS\n" + "─".repeat(70));

check(
  "los veinte declaran noxPerformance NO MODIFICADO",
  (dry.salida.match(/noxPerformance     NO MODIFICADO/g) ?? []).length === 20,
  `${(dry.salida.match(/noxPerformance     NO MODIFICADO/g) ?? []).length}`
);
check("la corrida cierra confirmando la guardia", /noxPerformance: NO MODIFICADO/.test(dry.salida));
check(
  "el lote no trae ningún campo de performance",
  !/longevity|projection|sillage|performanceIntensity|testedAt|duraci|proyecc|estela/i.test(crudoLote)
);
check(
  "el lote no trae texto editorial de terceros",
  !/"description"|"reviews"|"votes"|"rating"|"pros"|"cons"/.test(crudoLote)
);
check("el lote no declara redacción propia (feel / likeIf)", !/"feel"|"likeIf"/.test(crudoLote));
for (const [clave, ruta] of Object.entries(rutas)) {
  check(`ninguna corrida modificó ${ruta.split("/").pop()}`, readFileSync(ruta, "utf8") === antes[clave]);
}

rmSync(tmp, { recursive: true, force: true });

console.log("\n" + "─".repeat(70));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
