/**
 * QA DEL PRIMER LOTE REAL DE CARGA (10 fragancias investigadas).
 *
 * A diferencia del lote de 8 —que probaba el matcher con identidades— este lote
 * trae datos olfativos reales. Se verifica la identificación, los alias nuevos,
 * el guard de género, el soporte de fichas sin pirámide por etapas, y que los
 * dos casos deliberadamente dudosos no se resuelvan solos.
 *
 *   npm run qa:lote10
 */

import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScript } from "./lib/run-tsx.mjs";
import { NOTE_ES, translateAccord, translateNote } from "./lib/fragrantica.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = mkdtempSync(join(tmpdir(), "nox-lote10-"));
const LOTE = join(root, "data/import/lote-10-investigacion.json");

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

const correr = (args) => runScript("scripts/autocompletar-olfativo.ts", args, { cwd: root });
const archivo = (nombre, contenido) => {
  const ruta = join(tmp, `${nombre.replace(/[^a-z0-9]+/gi, "-").slice(0, 50)}.json`);
  writeFileSync(ruta, JSON.stringify(contenido, null, 2));
  return ruta;
};
const bloque = (salida, producto) =>
  salida.split(/^· /m).find((p) => p.startsWith(producto)) ?? "";

const registros = JSON.parse(readFileSync(LOTE, "utf8"));
const porSlug = Object.fromEntries(registros.map((r) => [r.productSlug, r]));

/** Copia de un registro, sin su declaración de revisión, con cambios encima. */
const variante = (slug, cambios) => {
  const base = JSON.parse(JSON.stringify(porSlug[slug]));
  delete base.needsReview;
  delete base.reviewReason;
  return { ...base, ...cambios };
};

const rutas = {
  perfiles: join(root, "src/data/olfactory.ts"),
  fuentes: join(root, "src/data/olfactory.sources.ts"),
  performance: join(root, "src/data/nox-performance.ts"),
  catalogo: join(root, "src/data/catalog.raw.ts")
};
const antes = Object.fromEntries(
  Object.entries(rutas).map(([k, v]) => [k, readFileSync(v, "utf8")])
);

/* ========================= 0. DICCIONARIO ============================== */

console.log("\n0. TRADUCCIONES\n" + "─".repeat(70));

// Aprobadas para este lote (es-AR).
for (const [en, es] of [
  ["Apricot", "Damasco"],
  ["Whipped Cream", "Crema batida"],
  ["Vanilla Orchid", "Orquídea de vainilla"],
  ["Brazilian Rosewood", "Palo de rosa de Brasil"],
  ["Toffee", "Toffee"],
  ["Oriental Notes", "Notas orientales"],
  ["Strawberry S'mores", "S'mores de frutilla"],
  ["Marigold", "Tagete"]
]) {
  check(`translateNote("${en}") === "${es}"`, translateNote(en) === es, translateNote(en) ?? "null");
}
check(
  'translateAccord("Lactonic") === "Lactónico"',
  translateAccord("Lactonic") === "Lactónico",
  translateAccord("Lactonic") ?? "null"
);
check("Lactonic NO está como nota", translateNote("Lactonic") === null, translateNote("Lactonic") ?? "");

// Las que ya existían: su traducción no cambió, sólo se volvió alcanzable.
for (const [en, es] of [
  ["Lily-of-the-Valley", "Muguet"],
  ["Agarwood (Oud)", "Oud"]
]) {
  check(`translateNote("${en}") === "${es}" (ya existía)`, translateNote(en) === es, translateNote(en) ?? "null");
}

// Regresión: ninguna clave del diccionario puede quedar sin normalizar, porque
// translateNote normaliza la entrada y nunca la encontraría.
const libDicc = readFileSync(join(root, "scripts/lib/fragrantica.mjs"), "utf8");
check(
  "ninguna clave de NOTE_ES conserva guiones o paréntesis",
  !/NOTE_ES = \{[\s\S]*?\n\};/.exec(libDicc)?.[0].match(/"[a-z0-9 ]*[-()][^"]*":/),
  (/NOTE_ES = \{[\s\S]*?\n\};/.exec(libDicc)?.[0].match(/"[a-z0-9 ]*[-()][^"]*":/) ?? [""])[0]
);
// Se miran los VALORES del diccionario, no el archivo: los comentarios nombran
// las variantes descartadas a propósito y no deben contar como uso.
const valores = Object.values(NOTE_ES);
check(
  "el español rioplatense se respeta: Damasco, no Chabacano",
  translateNote("Apricot") === "Damasco" && !valores.some((v) => /chabacano/i.test(v))
);
check(
  "frutilla, no fresa",
  translateNote("Strawberry S'mores").includes("frutilla") &&
    !valores.some((v) => /\bfresa\b/i.test(v))
);

/* ===================== 1. IDENTIFICACIÓN DE LOS DIEZ ==================== */

console.log("\n1. SOLO-MATCH — LOS DIEZ\n" + "─".repeat(70));

const solo = correr(["--source-file", LOTE, "--solo-match", "--force"]);
check("el lote corre completo", solo.ok);
check("procesa los 10 registros", /Registros en el archivo: 10/.test(solo.salida));
check("identifica 8 y deja 2 para revisar", /Identificadas: 8   ·   Para revisar: 2/.test(solo.salida));

const esperado = [
  ["Ariana Grande Cloud", "Cloud", "exact", "identificado"],
  ["Chanel Chanel N°5", "— (sin referencia confirmada)", "ambiguous", "needsReview"],
  ["Christian Dior Hypnotic Poison", "Hypnotic Poison", "exact", "identificado"],
  ["Azzaro The Most Wanted", "The Most Wanted", "exact", "identificado"],
  ["Jean Paul Gaultier Le Male Parfum", "Le Male Le Parfum", "exact", "identificado"],
  ["Tom Ford Oud Wood", "Oud Wood", "exact", "identificado"],
  ["Parfums de Marly Layton Exclusif", "— (sin referencia confirmada)", "ambiguous", "needsReview"],
  ["Lattafa Yara Elixir", "Yara Elixir", "exact", "identificado"],
  ["Armaf Mandarin Sky", "Odyssey Mandarin Sky", "exact", "identificado"],
  ["Al Haramain Amber Oud Gold", "Amber Oud Gold Edition", "exact", "identificado"]
];

for (const [producto, referencia, confianza, estado] of esperado) {
  const b = bloque(solo.salida, producto);
  check(
    `${producto} → ${referencia} (${confianza})`,
    b.includes(`perfume detectado  ${referencia}`) &&
      b.includes(`confidence         ${confianza}`) &&
      b.includes(`estado             ${estado}`),
    b ? "" : "no apareció en la salida"
  );
}

/* ========================= 2. ALIAS BRAND-SCOPED ======================== */

console.log("\n2. ALIAS\n" + "─".repeat(70));

const lib = readFileSync(join(root, "scripts/lib/fragrantica.mjs"), "utf8");
check(
  "el alias Le Male Parfum está acotado a Jean Paul Gaultier",
  /"Jean Paul Gaultier": \{[\s\S]{0,300}"Le Male Parfum": "Le Male Le Parfum"/.test(lib)
);
check(
  "el alias Amber Oud Gold está acotado a Al Haramain",
  /"Al Haramain": \{[\s\S]{0,200}"Amber Oud Gold": "Amber Oud Gold Edition"/.test(lib)
);
check(
  "Mandarin Sky → Odyssey Mandarin Sky sigue vigente",
  /"Mandarin Sky": "Odyssey Mandarin Sky"/.test(lib)
);

const crudoLote = JSON.stringify(registros);
check(
  "el naming público NOX no cambia: Le Male Parfum",
  readFileSync(join(root, "src/data/catalog.raw.ts"), "utf8").includes('"Le Male Parfum"')
);
check(
  "el naming público NOX no cambia: Amber Oud Gold",
  readFileSync(join(root, "src/data/catalog.raw.ts"), "utf8").includes('"Amber Oud Gold"')
);
check(
  "el naming público NOX no cambia: Mandarin Sky",
  readFileSync(join(root, "src/data/catalog.raw.ts"), "utf8").includes('"Mandarin Sky"')
);

/* ===================== 3. VARIANTES QUE NO DEBEN CRUZARSE =============== */

console.log("\n3. VARIANTES BLOQUEADAS\n" + "─".repeat(70));

const cruces = [
  ["Cloud no resuelve Cloud Intense", "ariana-grande-cloud", { referenceName: "Cloud Intense" }],
  ["Hypnotic Poison no resuelve Hypnotic Poison Eau de Parfum", "christian-dior-hypnotic-poison", { referenceName: "Hypnotic Poison Eau de Parfum" }],
  ["The Most Wanted no resuelve The Most Wanted Parfum", "azzaro-the-most-wanted", { referenceName: "The Most Wanted Parfum" }],
  ["Le Male Parfum no resuelve Le Male", "jean-paul-gaultier-le-male-parfum", { referenceName: "Le Male" }],
  ["Le Male Parfum no resuelve Le Male Elixir", "jean-paul-gaultier-le-male-parfum", { referenceName: "Le Male Elixir" }],
  ["Le Male Parfum no resuelve Ultra Male", "jean-paul-gaultier-le-male-parfum", { referenceName: "Ultra Male" }],
  ["Oud Wood no resuelve Oud Wood Intense", "tom-ford-oud-wood", { referenceName: "Oud Wood Intense" }],
  ["Yara Elixir no resuelve Yara", "lattafa-yara-elixir", { referenceName: "Yara" }],
  ["Yara Elixir no resuelve Yara Candy", "lattafa-yara-elixir", { referenceName: "Yara Candy" }],
  ["Yara Elixir no resuelve Yara Tous", "lattafa-yara-elixir", { referenceName: "Yara Tous" }],
  ["Layton Exclusif no resuelve Layton", "parfums-de-marly-layton-exclusif", { referenceName: "Layton" }],
  ["Amber Oud Gold no resuelve Amber Oud", "al-haramain-amber-oud-gold", { referenceName: "Amber Oud" }],
  ["Mandarin Sky no resuelve Odyssey Mandarin Sky Elixir", "armaf-mandarin-sky", { referenceName: "Odyssey Mandarin Sky Elixir" }]
];

for (const [nombre, slug, cambios] of cruces) {
  const res = correr(["--source-file", archivo(nombre, variante(slug, cambios)), "--solo-match", "--force"]);
  const bloqueado = /no coincide con|≠/.test(res.salida) && /Identificadas: 0/.test(res.salida);
  check(nombre, bloqueado, bloqueado ? "" : res.salida.slice(-200).trim());
}

/* ======================= 4. GUARD DE GÉNERO ============================= */

console.log("\n4. referenceGender\n" + "─".repeat(70));

// Compatibles: unisex nunca contradice.
const compatibles = [
  ["unisex de referencia con producto masculino", "tom-ford-oud-wood", "unisex"],
  ["unisex de referencia con producto femenino", "lattafa-yara-elixir", "unisex"],
  ["unisex de referencia con producto unisex", "al-haramain-amber-oud-gold", "unisex"],
  ["masculino con masculino", "azzaro-the-most-wanted", "masculino"],
  ["femenino con femenino", "ariana-grande-cloud", "femenino"],
  ["cualquier referencia con producto unisex", "al-haramain-amber-oud-gold", "masculino"]
];
for (const [nombre, slug, genero] of compatibles) {
  const res = correr([
    "--source-file",
    archivo(`compat-${nombre}`, variante(slug, { referenceGender: genero })),
    "--solo-match",
    "--force"
  ]);
  const ok = /Identificadas: 1/.test(res.salida);
  check(`compatible: ${nombre}`, ok, ok ? "" : res.salida.slice(-160).trim());
}

// Contradicciones reales: sólo masculino↔femenino.
const contradicciones = [
  ["referencia masculina con producto femenino", "ariana-grande-cloud", "masculino"],
  ["referencia femenina con producto masculino", "azzaro-the-most-wanted", "femenino"]
];
for (const [nombre, slug, genero] of contradicciones) {
  const res = correr([
    "--source-file",
    archivo(`conflicto-${nombre}`, variante(slug, { referenceGender: genero })),
    "--solo-match",
    "--force"
  ]);
  check(
    `bloquea: ${nombre}`,
    /La referencia es .* y el producto NOX figura como/.test(res.salida) &&
      /Identificadas: 0/.test(res.salida)
  );
}

check(
  "el guard trata unisex como compatible en el código",
  /referenceGender !== "unisex" &&[\s\S]{0,60}product\.gender !== "unisex"/.test(
    readFileSync(join(root, "scripts/lib/import-olfativo.mjs"), "utf8")
  )
);
check(
  "el guard no toca el género comercial del producto",
  !/product\.gender\s*=/.test(readFileSync(join(root, "scripts/lib/import-olfativo.mjs"), "utf8"))
);

/* ============= 5. DRY-RUN: DATOS, PIRÁMIDE Y CASOS DUDOSOS ============== */

console.log("\n5. DRY-RUN\n" + "─".repeat(70));

const dry = correr(["--source-file", LOTE, "--dry-run", "--force"]);
check("el dry-run corre completo", dry.ok);
check("resuelve datos para 8", /Cargadas: 8/.test(dry.salida));
check("sólo quedan los 2 needsReview deliberados", /Para revisar: 2/.test(dry.salida));
check(
  "ninguna nota queda sin traducir",
  !/sin traducir/.test(dry.salida),
  (dry.salida.match(/sin traducir *(.*)/g) ?? []).join(" | ")
);
check("no escribe ningún archivo", /no se escribió ningún archivo/.test(dry.salida));

for (const [producto, esperados] of [
  ["Ariana Grande Cloud", [
    "notas de salida    Lavanda, Pera, Bergamota",
    "notas de corazón   Crema batida, Coco, Praliné, Orquídea de vainilla",
    "notas de fondo     Almizcle, Notas amaderadas",
    "Lactónico"
  ]],
  ["Christian Dior Hypnotic Poison", [
    "notas de salida    Coco, Ciruela, Damasco",
    "notas de corazón   Palo de rosa de Brasil, Jazmín, Nardo, Alcaravea, Rosa, Muguet",
    "notas de fondo     Vainilla, Almendra, Sándalo, Almizcle"
  ]],
  ["Azzaro The Most Wanted", [
    "notas de salida    Cardamomo",
    "notas de corazón   Toffee",
    "notas de fondo     Amberwood"
  ]],
  ["Jean Paul Gaultier Le Male Parfum", [
    "notas de salida    Cardamomo",
    "notas de corazón   Lavanda, Iris",
    "notas de fondo     Vainilla, Notas orientales, Notas amaderadas"
  ]],
  ["Lattafa Yara Elixir", [
    "notas de salida    S'mores de frutilla, Grosella negra",
    "notas de corazón   Jazmín, Azahar",
    "notas de fondo     Vainilla, Caramelo, Ámbar, Almizcle"
  ]],
  ["Armaf Mandarin Sky", [
    "notas de salida    Mandarina, Naranja, Azafrán, Salvia",
    "notas de corazón   Caramelo, Haba tonka, Tagete",
    "notas de fondo     Ambroxan, Cedro, Vetiver"
  ]],
  ["Al Haramain Amber Oud Gold", [
    "notas de salida    Bergamota, Notas verdes",
    "notas de corazón   Melón, Ananá, Ámbar, Acorde gourmand",
    "notas de fondo     Vainilla, Almizcle, Notas amaderadas"
  ]]
]) {
  const b = bloque(dry.salida, producto);
  check(
    `${producto} traduce sus notas`,
    esperados.every((e) => b.includes(e)),
    esperados.find((e) => !b.includes(e)) ?? ""
  );
}

const oud = bloque(dry.salida, "Tom Ford Oud Wood");
check("Oud Wood se acepta sin pirámide por etapas", oud.includes("confidence         exact"));
check("Oud Wood no inventa etapas", /notas de salida    —/.test(oud) && /notas de fondo     —/.test(oud));
check("Oud Wood avisa que la fuente no separa la pirámide", oud.includes("no separa la pirámide por etapas"));
check("Oud Wood deriva familia y carácter desde los acordes", /familia            amaderado/.test(oud) && /carácter aromático marcada/.test(oud));
const OUD_EN = [
  "Agarwood (Oud)", "Brazilian Rosewood", "Cardamom", "Sandalwood", "Sichuan Pepper",
  "Vanilla", "Vetiver", "Tonka Bean", "Amber"
];
const OUD_ES = [
  "Oud", "Palo de rosa de Brasil", "Cardamomo", "Sándalo", "Pimienta de Sichuan",
  "Vainilla", "Vetiver", "Haba tonka", "Ámbar"
];

check(
  "las notas principales de Oud Wood se traducen completas",
  OUD_EN.every((n) => translateNote(n) !== null),
  OUD_EN.filter((n) => !translateNote(n)).join(", ")
);

/* --- Lo que el dry-run REALMENTE escribiría, no sólo lo que se traduce --- */

/** Lee el valor de una línea del bloque, sin la anotación entre paréntesis. */
const campo = (b, etiqueta) => {
  const m = b.match(new RegExp(`${etiqueta} +(.+)`));
  return m ? m[1].replace(/\s{2,}\(.*\)\s*$/, "").trim() : "";
};

const oudMain = campo(oud, "notas principales");
const oudLista = oudMain ? oudMain.split(", ") : [];

check("Oud Wood conserva las 9 notas principales", oudLista.length === 9, `${oudLista.length}`);
check("las 9 son exactamente las aprobadas y en orden", oudLista.join(" | ") === OUD_ES.join(" | "), oudMain);
check("ninguna nota principal está duplicada", new Set(oudLista).size === oudLista.length);
check("el dry-run aclara que vienen declaradas por la fuente", oud.includes("(declaradas por la fuente)"));
for (const nota of ["Vainilla", "Vetiver", "Haba tonka", "Ámbar", "Pimienta de Sichuan"]) {
  check(`"${nota}" no se pierde por el recorte`, oudLista.includes(nota));
}
check(
  "una lista declarada no se recorta a 5",
  oudLista.length > 5 && !/notas principales +([^,]+, ){4}[^,(]+ {2}\(declaradas/.test(oud)
);

/* --- El resumen derivado no cambió: sigue acotado --- */

for (const [producto, esperado] of [
  ["Ariana Grande Cloud", "Lavanda, Crema batida, Almizcle, Notas amaderadas"],
  ["Christian Dior Hypnotic Poison", "Coco, Palo de rosa de Brasil, Vainilla, Almendra"],
  ["Azzaro The Most Wanted", "Cardamomo, Toffee, Amberwood"],
  ["Lattafa Yara Elixir", "S'mores de frutilla, Jazmín, Vainilla, Caramelo"],
  ["Armaf Mandarin Sky", "Mandarina, Caramelo, Ambroxan, Cedro"]
]) {
  const b = bloque(dry.salida, producto);
  const valor = campo(b, "notas principales");
  check(`${producto} conserva el resumen derivado`, valor === esperado, valor);
  check(`${producto} se marca como resumen derivado`, b.includes("(resumen derivado)"));
  check(`${producto} no supera las 5 del resumen`, valor.split(", ").length <= 5);
}

check(
  "el código distingue declaradas de derivadas y sólo recorta el resumen",
  /declaradas\.length > 0\s*\?\s*declaradas\s*:\s*sinRepetir\(\[[\s\S]{0,120}\)\.slice\(0, 5\)/.test(
    readFileSync(join(root, "scripts/autocompletar-olfativo.ts"), "utf8")
  )
);

for (const producto of ["Chanel Chanel N°5", "Parfums de Marly Layton Exclusif"]) {
  const b = bloque(dry.salida, producto);
  check(`${producto} sigue en needsReview`, b.includes("estado             needsReview"));
  check(`${producto} no escribe datos`, b.includes("¿qué escribe?      NADA — sólo la anotación de revisión"));
  check(`${producto} explica el motivo`, b.includes("motivo"));
  check(`${producto} no reporta confidence exact`, !b.includes("confidence         exact"));
}

check(
  "ninguna referencia dudosa se resolvió sola",
  !/perfume detectado  Chanel N°5 Eau de Parfum/.test(dry.salida) &&
    !/perfume detectado  Layton\b(?! Exclusif)/.test(dry.salida)
);
check(
  "no se usó --rewrite-copy",
  !dry.salida.includes("regenerada desde los acordes")
);

/* ====================== 6. PERFORMANCE Y ESCRITURAS ==================== */

console.log("\n6. PERFORMANCE Y ESCRITURAS\n" + "─".repeat(70));

check(
  "los diez declaran noxPerformance NO MODIFICADO",
  (dry.salida.match(/noxPerformance     NO MODIFICADO/g) ?? []).length === 10
);
check("la corrida cierra confirmando la guardia", /noxPerformance: NO MODIFICADO/.test(dry.salida));
check(
  "el lote no trae ningún campo de performance",
  !/longevity|projection|sillage|performanceIntensity|testedAt|duraci|proyecc|estela/i.test(crudoLote)
);
check(
  "el lote no trae texto editorial de terceros",
  !/"description"|"reviews"|"votes"|"rating"/.test(crudoLote)
);
for (const [clave, ruta] of Object.entries(rutas)) {
  check(`ninguna corrida modificó ${ruta.split("/").pop()}`, readFileSync(ruta, "utf8") === antes[clave]);
}

rmSync(tmp, { recursive: true, force: true });

console.log("\n" + "─".repeat(70));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
