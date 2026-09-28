/**
 * REVISIÓN EDITORIAL DE LAS FICHAS OLFATIVAS (iteración 5).
 *
 * Qué hace, en una sola pasada y de forma reproducible:
 *
 *   1. Renombra `intensity` → `aromaticIntensity` y lo recarga con la escala
 *      nueva (suave / equilibrada / intensa / envolvente / marcada). La escala
 *      vieja ("alta") describía rendimiento; la nueva describe CARÁCTER.
 *      El valor base sale de aromaticIntensityFromAccords() —mismo criterio
 *      uniforme que usa el autocompletado— y se ajusta a mano sólo donde la
 *      lectura editorial de NOX difiere, con el motivo escrito al lado.
 *
 *   2. Reformula las frases que afirmaban performance no verificada
 *      (estela, proyección, duración, rendimiento). Las notas, los acordes,
 *      las familias, las ocasiones, el clima y el carácter no se tocan.
 *
 * La performance del extracto NOX no se escribe acá ni en ningún otro lado
 * automáticamente: vive en src/data/nox-performance.ts y se carga a mano
 * después de probarlo.
 *
 *   npx tsx scripts/revisar-olfativo.ts [--dry-run]
 */

import { OLFACTORY_PROFILES } from "../src/data/olfactory";
import { OLFACTORY_SOURCES } from "../src/data/olfactory.sources";
// @ts-expect-error — módulo .mjs compartido con los scripts de datos
import { aromaticIntensityFromAccords } from "./lib/fragrantica.mjs";
// @ts-expect-error — módulo .mjs compartido con los scripts de datos
import { writeOlfactoryFiles } from "./lib/emit.mjs";

const DRY = process.argv.includes("--dry-run");

/* ============================ 1. CARÁCTER AROMÁTICO ====================== */

/**
 * Ajustes editoriales sobre el valor derivado. Sólo carácter: ninguno de estos
 * valores habla de duración, proyección ni estela.
 */
const INTENSITY_OVERRIDES: Record<string, [string, string]> = {
  "christian-dior-sauvage-elixir": ["intensa", "la lectura de la ficha es densa y oscura"],
  "christian-dior-dior-homme-intense": ["equilibrada", "es contenido y elegante, no estridente"],
  "chanel-bleu-de-chanel": ["equilibrada", "su virtud es servir para todo, no imponerse"],
  "giorgio-armani-acqua-di-gio-profumo": ["equilibrada", "acuático con sombra, no una composición densa"],
  "paco-rabanne-phantom": ["equilibrada", "limpio y goloso, sin peso"],
  "viktor-rolf-flowerbomb": ["envolvente", "ramo floral redondeado por pachulí y vainilla"],
  "parfums-de-marly-delina": ["marcada", "floral expresivo, de carácter muy marcado"],
  "maison-francis-kurkdjian-baccarat-rouge-540": ["marcada", "perfil ambarado de fuerte personalidad"],
  "lattafa-yara": ["equilibrada", "cremoso y dulce pero suave, sirve de día"]
};

/* ====================== 2. REFORMULACIONES DE REDACCIÓN ================== */

/** feel: texto viejo → texto nuevo. Se reemplaza completo. */
const FEEL_REWRITES: Record<string, string> = {
  "lancome-la-vida-es-bella":
    "Praliné y vainilla sobre un corazón de iris. Es dulce de verdad, cremoso y envolvente.",
  "jean-paul-gaultier-scandal-femenino":
    "Miel y caramelo con gardenia. Es denso, dulce y de carácter muy marcado.",
  "thierry-mugler-alien":
    "Jazmín solar sobre ámbar, con muy pocos ingredientes y un carácter muy marcado. Es un perfume de firma, no de fondo.",
  "parfums-de-marly-delina":
    "Rosa y lichi con una frescura frutal arriba. Es floral, expresivo y con un carácter muy marcado.",
  "maison-francis-kurkdjian-baccarat-rouge-540":
    "Azafrán y madera ambarada con un azúcar casi quemado. Combina una sensación aérea con un perfil ambarado y amaderado de fuerte personalidad.",
  "lattafa-khamrah":
    "Dátiles y canela sobre praliné y vainilla. Es la puerta de entrada al estilo árabe moderno: dulce, especiado, cálido y envolvente.",
  "rasasi-hawas-for-him":
    "Fresco y frutal con un fondo acuático y ambarado. La apertura es liviana y el fondo le da cuerpo.",
  "xerjoff-erba-pura":
    "Un estallido de frutas mediterráneas sobre almizcle y vainilla. Luminoso, adictivo y de carácter muy definido."
};

/** likeIf: frase vieja → frase nueva, aplicado a todo el archivo. */
const LIKEIF_REWRITES: Record<string, string> = {
  "Querés que dure todo el día": "Buscás un dulce cremoso y envolvente",
  "Querés que dure": "Querés algo cálido y envolvente",
  "Buscás algo que se note": "Buscás un dulce de carácter marcado",
  "Buscás algo con muchísima presencia": "Buscás un perfume de carácter muy marcado",
  "Buscás algo floral con mucha estela": "Buscás un floral expresivo y marcado",
  "Querés muchísima duración": "Buscás un perfil ambarado de mucha personalidad",
  "Buscás mucha duración": "Buscás algo cálido y envolvente",
  "Buscás fresco con mucha duración": "Buscás un fresco con fondo cálido",
  "Querés duración en un perfume fresco": "Querés un frutal de carácter definido",
  "Querés presencia inmediata": "Querés un arranque especiado y cálido",
  "Querés presencia": "Querés un perfil de carácter marcado",
  "Querés algo de mucha presencia": "Querés un frutal-ahumado de carácter marcado",
  "Querés buena relación presencia-precio": "Querés un dulce cálido a buen precio",
  "Querés algo que llame la atención": "Querés algo frontal y juvenil",
  "Te gustan los perfumes que se notan": "Te gustan los perfumes de carácter marcado"
};

/* ================================ PROCESO =============================== */

type Any = Record<string, any>;

const perfiles: Any = {};
let conCaracter = 0;
let feelsReescritos = 0;
let likeIfReescritos = 0;

console.log("\nREVISIÓN OLFATIVA — ITERACIÓN 5\n" + "─".repeat(72));

for (const [slug, perfilOriginal] of Object.entries(OLFACTORY_PROFILES)) {
  const perfil = { ...(perfilOriginal as unknown as Any) };

  /* -- 1. carácter aromático ------------------------------------------- */
  const derivado = aromaticIntensityFromAccords(perfil.accords) as string | null;
  const override = INTENSITY_OVERRIDES[slug];
  const caracter = override ? override[0] : derivado;
  const anterior = perfil.intensity ?? null;

  delete perfil.intensity;

  /* -- 2. redacción ------------------------------------------------------ */
  let feel: string = perfil.feel;
  if (FEEL_REWRITES[slug]) {
    if (feel !== FEEL_REWRITES[slug]) feelsReescritos++;
    feel = FEEL_REWRITES[slug];
  }

  const likeIf: string[] = (perfil.likeIf as string[]).map((frase) => {
    const nueva = LIKEIF_REWRITES[frase];
    if (nueva) likeIfReescritos++;
    return nueva ?? frase;
  });

  // Orden de claves estable, con aromaticIntensity donde estaba intensity.
  perfiles[slug] = {
    family: perfil.family,
    families: perfil.families,
    accords: perfil.accords,
    topNotes: perfil.topNotes,
    middleNotes: perfil.middleNotes,
    baseNotes: perfil.baseNotes,
    mainNotes: perfil.mainNotes,
    occasions: perfil.occasions,
    seasons: perfil.seasons,
    aromaticIntensity: caracter,
    feel,
    likeIf
  };

  if (caracter) conCaracter++;

  const marca = override ? " (editorial)" : "";
  console.log(
    `${slug.padEnd(46)} ${String(anterior ?? "—").padEnd(6)} → ${String(caracter).padEnd(12)}${marca}`
  );
}

console.log("─".repeat(72));
console.log(`perfiles                  ${Object.keys(perfiles).length}`);
console.log(`con carácter aromático    ${conCaracter}`);
console.log(`descripciones reescritas  ${feelsReescritos}`);
console.log(`frases "te puede gustar"  ${likeIfReescritos}`);
console.log("noxPerformance            NO MODIFICADO");

if (DRY) {
  console.log("\nDry-run: no se escribió ningún archivo.");
} else {
  // Las fuentes se reescriben idénticas: esta revisión no toca procedencia.
  writeOlfactoryFiles(perfiles, OLFACTORY_SOURCES);
  console.log("\nEscritos: src/data/olfactory.ts · src/data/olfactory.sources.ts");
}
