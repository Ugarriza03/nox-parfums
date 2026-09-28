/**
 * QA DE LA REDACCIÓN AUTOMÁTICA.
 *
 * Dos cosas que tienen que ser ciertas a la vez:
 *   · la redacción revisada a mano no se toca NUNCA, y
 *   · la redacción automática está anclada en las notas verificadas, sin
 *     sensaciones inventadas ni afirmaciones de performance.
 *
 *   npm run qa:redaccion
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADJ_EVIDENCIA,
  adjetivoRespaldado,
  normalize,
  buildFeel,
  buildLikeIf,
  buildLikeIfDetalle
} from "./lib/fragrantica.mjs";
import { runScript } from "./lib/run-tsx.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

const leerObjeto = (archivo, constante) => {
  const src = readFileSync(join(root, archivo), "utf8");
  return JSON.parse(src.slice(src.indexOf("{", src.indexOf(constante)), src.lastIndexOf("};") + 1));
};

const perfiles = leerObjeto("src/data/olfactory.ts", "OLFACTORY_PROFILES");
const fuentes = leerObjeto("src/data/olfactory.sources.ts", "OLFACTORY_SOURCES");

/**
 * Estado del copy, después del cierre del lote 10:
 *   · "auto"       → pendiente de revisión. Lo único que el regenerador toca.
 *   · "editorial"  → aprobado por una persona. Queda congelado.
 *   · sin marca    → las 42 fichas históricas, revisadas antes del campo copy.
 */
const auto = Object.keys(perfiles).filter((s) => fuentes[s]?.copy === "auto");
const editoriales = Object.keys(perfiles).filter((s) => fuentes[s]?.copy === "editorial");
const historicas = Object.keys(perfiles).filter((s) => !fuentes[s]?.copy);
const revisados = [...editoriales, ...historicas];

/** Los perfiles cuyo texto se evalúa: los 8 aprobados en esta tanda. */
const APROBADOS = [
  "al-haramain-amber-oud-gold",
  "ariana-grande-cloud",
  "armaf-mandarin-sky",
  "azzaro-the-most-wanted",
  "christian-dior-hypnotic-poison",
  "jean-paul-gaultier-le-male-parfum",
  "lattafa-yara-elixir",
  "tom-ford-oud-wood"
];
/** Los 16 del lote 20, aprobados como editorial al cerrar el lote. */
const LOTE_20 = [
  "ariana-grande-sweet-like-candy","azzaro-wanted-by-night","britney-spears-fantasy",
  "bulgari-man-in-black","carolina-herrera-212-vip","carolina-herrera-212-vip-men",
  "carolina-herrera-good-girl-blush","dkny-be-delicious",
  "giorgio-armani-stronger-with-you-intensely","givenchy-gentleman-reserve-privee",
  "lattafa-khamrah-qahwa","lattafa-yara-candy","louis-vuitton-imagination",
  "montale-arabians-tonka","tom-ford-noir-extreme","versace-eros-flame"
];

/** Los 20 del lote 3, aprobados como editorial tras su revisión. */
const LOTE_3 = [
  "armani-my-way-intense","carolina-herrera-212-vip-rose","christian-dior-fahrenheit",
  "christian-dior-poison-girl","giorgio-armani-acqua-di-gio-profondo",
  "giorgio-armani-armani-code-profumo","lattafa-amethyst","lattafa-asad-elixir",
  "lattafa-honor-y-gloria","lattafa-yara-tous","parfums-de-marly-haltane",
  "ralph-lauren-polo-black","ralph-lauren-polo-red","thierry-mugler-alien-goddess",
  "thierry-mugler-angel-nova","tom-ford-lost-cherry","tom-ford-ombre-leather",
  "viktor-rolf-bonbon","viktor-rolf-spice-bomb","xerjoff-accento-overdose"
];

/** Los 20 del lote 4, aprobados como editorial tras su revisión. */
const LOTE_4 = [
  "giorgio-armani-armani-code-absolut","hugo-boss-boss-the-scent-elixir",
  "hugo-boss-bottled-elixir","jean-paul-gaultier-divine","jean-paul-gaultier-le-beau",
  "jean-paul-gaultier-scandal-le-parfum","kayali-yum-pistachio","lattafa-asad-bourbon",
  "lattafa-eclaire","lattafa-nebras","lattafa-teriaq","louis-vuitton-nuit-de-feu",
  "louis-vuitton-ombre-nomade","paco-rabanne-invictus-legend",
  "paco-rabanne-invictus-platinum","paco-rabanne-invictus-victory",
  "paco-rabanne-one-million-elixir","paco-rabanne-phantom-parfum",
  "tom-ford-neroli-portofino","tom-ford-soleil-blanc"
];

/** Los 91 del macro-lote final, aprobados como editorial tras su revision. */
const LOTE_MACRO = [
  "afnan-9pm-night-out","al-haramain-amber-oud-dubai-night","amouage-guidance-46",
  "antonio-banderas-blue-seduction","antonio-banderas-icon",
  "antonio-banderas-king-of-seduction","antonio-banderas-power-of-seduction",
  "armani-armani-code","azzaro-azzaro","azzaro-wanted","bharara-bharara-king",
  "cacharel-amor-amor","cacharel-anais-anais","calvin-klein-ck-one",
  "calvin-klein-eternity","calvin-klein-one-shock","calvin-klein-shock",
  "carolina-herrera-212-heroes-masculino","carolina-herrera-212-sexy-femenino",
  "carolina-herrera-bad-boy-dazzling-garden","carolina-herrera-bad-boy-extreme",
  "carolina-herrera-ch-femenino","carolina-herrera-good-girl-glorious-gold",
  "carolina-herrera-good-girl-supreme","carolina-herrera-good-girl-very",
  "carolina-herrera-la-bomba","chanel-allure-sport","christian-dior-poison",
  "davidoff-cool-water-femenino","davidoff-cool-water-masculino",
  "dolce-gabbana-light-blue-femenino","dolce-gabbana-the-one-femenino",
  "dolce-gabbana-the-only-one","giorgio-armani-acqua-di-gio-masculino",
  "giorgio-armani-acqua-di-gioia","giorgio-armani-armani-code",
  "giorgio-armani-because-its-you","givenchy-amarige","givenchy-ange-ou-demon",
  "givenchy-gentleman-only","givenchy-gentleman-society","givenchy-irresistible",
  "givenchy-linterdit-rouge","givenchy-very-irresistible","gucci-guilty-black",
  "hugo-boss-boss-bottled","hugo-boss-bottled-night",
  "issey-miyake-leau-dissey-femenino","j-del-pozo-halloween",
  "jean-paul-gaultier-paradise-garden","jean-paul-gaultier-scandal-gold",
  "jean-paul-gaultier-scandal-pour-homme-absolu","kajal-dahab",
  "kayali-yum-marshmallow","kenzo-amour","kenzo-flower","kenzo-kenzo-homme-night",
  "lancome-tresor-le-nuit","lattafa-mayar-cherry-intense","lattafa-opulent-musk",
  "lattafa-oud-mood","lattafa-sakeena","lattafa-sublime","moschino-toy-2",
  "moschino-toy-2-bubble-gum","moschino-toy-boy","nina-ricci-nina",
  "nina-ricci-ricci-ricci","paco-rabanne-fame","paco-rabanne-fame-parfum",
  "paco-rabanne-invictus-victory-elixir","paco-rabanne-lady-million",
  "paco-rabanne-one-million-lucky","paco-rabanne-pure-xs",
  "paco-rabanne-xs-aphrodisiaque","ralph-lauren-polo","ralph-lauren-polo-sport",
  "ralph-lauren-polo-ultra-blue","ralph-lauren-ralph","ralph-lauren-ralph-blue",
  "shakira-shakira-elixir","shakira-shakira-rock","thierry-mugler-a-men",
  "thierry-mugler-angel","tommy-hilfiger-tommy-girl",
  "valentino-born-in-roma-extradose","valentino-born-in-roma-extradose-donna",
  "valentino-born-in-roma-intense","valentino-purple-melancholia",
  "victorias-secret-bombshell-night","xerjoff-amber-gold"
];

/**
 * LOTE 08 — los cinco que pasaron de copy:"auto" a copy:"editorial" en esa
 * revisión. Tres venían del lote 06 (las identidades que se destrabaron) y dos
 * son las de Dior que cerró el lote 08. Su texto se reescribió a mano contra la
 * fuente: no salió del generador y no tiene por qué coincidir con él. Lo que los
 * protege, como a los demás aprobados, es su baseline.
 */
const LOTE_08 = [
  "christian-dior-dior-homme",
  "christian-dior-jadore",
  "dolce-gabbana-the-one-masculino",
  "giorgio-armani-acqua-di-gio-femenino",
  "issey-miyake-leau-dissey-masculino"
];

/**
 * LOTE 09 — cinco pares de género más. Misma situación que los del 06 y el 08:
 * el nombre del catálogo coincidía con el de su par de la misma casa, la
 * identidad ya estaba verificada en el ledger y lo único que faltaba era la
 * clave de género en el alias. Su texto se reescribió a mano contra la fuente.
 */
const LOTE_09 = [
  "carolina-herrera-212-sexy-masculino",
  "carolina-herrera-ch-masculino",
  "dolce-gabbana-light-blue-masculino",
  "jean-paul-gaultier-scandal-masculino",
  "versace-eros"
];

/**
 * LOTE 10 — las 24 que NOX cerró al definir las variantes que el catálogo no
 * especificaba. Su texto se reescribió a mano contra la fuente de cada una: no
 * salió del generador y no tiene por qué coincidir con él. Lo que los protege,
 * como al resto de los aprobados, es su baseline.
 */
const LOTE_11 = ["lattafa-oud-for-glory", "parfums-de-marly-layton-exclusif"];

const LOTE_10 = [
  "armani-si",
  "carolina-herrera-212-heroes-femenino",
  "carolina-herrera-212-new-york-femenino",
  "carolina-herrera-212-new-york-masculino",
  "carolina-herrera-bad-boy-cobalt",
  "chanel-chanel-n-5",
  "christian-dior-miss-dior",
  "creed-aventus-absolu",
  "creed-aventus-millesime-1849",
  "givenchy-linterdit",
  "guerlain-acqua-alegoria",
  "hugo-boss-hugo-boss",
  "kenzo-kenzo-homme",
  "lancome-la-vida-es-bella-intense",
  "louis-vuitton-afternoon-sweet",
  "memo-paris-iris-leather",
  "paco-rabanne-black-xs",
  "paco-rabanne-invictus-acqua",
  "paco-rabanne-xs-black",
  "tom-ford-costa-azzurra",
  "tom-ford-fucking-fabulous",
  "tommy-hilfiger-tommy-hilfiger",
  "victorias-secret-summer-daze",
  "victorias-secret-very-sexy"
];

const generados = APROBADOS;

/* ==================== 1. La redacción revisada no se toca ================ */

console.log("\n1. LOS REVISADOS NO SE TOCAN\n" + "─".repeat(70));

// CIERRE DE LA ETAPA DE CARGA MASIVA.
//
// Los 91 del macro-lote final pasaron de copy:"auto" a copy:"editorial" tras su
// revisión. Ya no queda redacción automática pendiente: los 202 perfiles están
// congelados y el regenerador se queda sin objetivos. Esa es ahora la invariante
// que este archivo vigila.
check('copy:"auto" === 0 — no queda redacción pendiente', auto.length === 0, `${auto.length}`);
check('hay exactamente 191 con copy:"editorial"', editoriales.length === 191, `${editoriales.length}`);
check(
  "los 191 editoriales son los 8 de la primera tanda y los lotes 20, 3, 4, el macro-lote, el 08, el 09, el 10 y el 11",
  JSON.stringify([...editoriales].sort()) ===
    JSON.stringify([...APROBADOS, ...LOTE_20, ...LOTE_3, ...LOTE_4, ...LOTE_MACRO, ...LOTE_08, ...LOTE_09, ...LOTE_10, ...LOTE_11].sort()),
  editoriales.sort().join(", ")
);
check("hay 42 fichas históricas revisadas", historicas.length === 42, `${historicas.length}`);
check("los 233 perfiles quedan protegidos del regenerador", revisados.length === 233, `${revisados.length}`);
check(
  "los 233 perfiles son intocables: protegidos === perfiles",
  Object.keys(perfiles).length === 233 && revisados.length === Object.keys(perfiles).length,
  `${Object.keys(perfiles).length} perfiles · ${revisados.length} protegidos`
);

// Correr el regenerador en dry-run no puede proponer un cambio en los revisados.
const dry = runScript("scripts/redactar-olfativo.ts", ["--dry-run"], { cwd: root });
check("el regenerador corre", dry.ok, dry.ok ? "" : dry.salida.slice(-300));
check("declara los 233 intactos", /redacción revisada intacta +233/.test(dry.salida));
check(
  "el regenerador se queda con 0 objetivos",
  /redacción regenerada +0/.test(dry.salida),
  (dry.salida.match(/redacción regenerada.*/) ?? ["sin línea"])[0]
);
check(
  "lo declara en el encabezado",
  /Con copy:"auto" +0 +· +revisados \(no se tocan\) +233/.test(dry.salida),
  (dry.salida.match(/Con copy:"auto".*/) ?? ["sin línea de encabezado"])[0]
);
check(
  "lo dice explícitamente",
  /Ningún perfil tiene copy:"auto": no hay nada para regenerar/.test(dry.salida)
);
check("no toca la performance", /noxPerformance +NO MODIFICADO/.test(dry.salida));
check("en dry-run no escribe", /no se escribió ningún archivo/.test(dry.salida));

// Ninguno de los revisados aparece en el informe de cambios del regenerador.
const informados = [...dry.salida.matchAll(/^· (.+)$/gm)].map((m) => m[1]);
// Lo esencial no es que el informe venga vacío, sino que NINGUNO de los 202
// revisados aparezca en él. El regenerador puede proponer cambios sobre los que
// estén en copy:"auto"; sobre los protegidos, nunca.
const protegidosTocados = informados.filter((s) => revisados.includes(s));
check(
  "el regenerador no propone tocar ninguno de los 233 protegidos",
  protegidosTocados.length === 0,
  protegidosTocados.join(", ")
);
check(
  "todo lo que propone está en copy:\"auto\"",
  informados.every((s) => auto.includes(s)),
  informados.filter((s) => !auto.includes(s)).join(", ")
);
check(
  "ninguno de los 8 editoriales entra al regenerador",
  !informados.some((s) => editoriales.includes(s))
);

// El generador, aplicado a una ficha histórica, daría OTRO texto: prueba de que
// el filtro por copy es lo único que la protege, y de que funciona.
// (Los 8 editoriales salieron del generador y quedaron congelados al aprobarlos.
//  NO tienen que seguir coincidiendo con él: lo que se les exige es conservar su
//  baseline, y eso se verifica en la sección 7.)
const ejemplo = historicas.find((s) => perfiles[s].topNotes.length > 0);
check(
  "una ficha histórica conserva su texto propio, distinto del que generaría el sistema",
  perfiles[ejemplo].feel !== buildFeel({ slug: ejemplo, ...perfiles[ejemplo] }),
  ejemplo
);
check(
  "ninguna ficha histórica coincide por casualidad con el generador",
  historicas.filter((s) => perfiles[s].feel === buildFeel({ slug: s, ...perfiles[s] })).length === 0
);

/* ============= 2. Los datos olfativos no se movieron ==================== */

console.log("\n2. LOS DATOS NO SE MOVIERON\n" + "─".repeat(70));

const CAMPOS = ["family", "families", "accords", "topNotes", "middleNotes", "baseNotes",
  "mainNotes", "occasions", "seasons", "aromaticIntensity"];

check(
  "todos los perfiles conservan sus campos de datos",
  Object.values(perfiles).every((p) => CAMPOS.every((c) => c in p))
);
check(
  "Oud Wood sigue sin pirámide inventada",
  perfiles["tom-ford-oud-wood"].topNotes.length === 0 &&
    perfiles["tom-ford-oud-wood"].middleNotes.length === 0 &&
    perfiles["tom-ford-oud-wood"].baseNotes.length === 0
);
check("Oud Wood conserva sus 9 notas principales", perfiles["tom-ford-oud-wood"].mainNotes.length === 9);
check(
  "ningún perfil tiene campos de performance",
  !Object.values(perfiles).some((p) =>
    ["longevity", "projection", "sillage", "performanceIntensity", "testedAt"].some((k) => k in p)
  )
);

/* =================== 3. La redacción no afirma performance ============== */

console.log("\n3. SIN AFIRMACIONES DE PERFORMANCE\n" + "─".repeat(70));

const textos = Object.entries(perfiles).map(([slug, p]) => [slug, `${p.feel} ${(p.likeIf ?? []).join(" ")}`]);

for (const [etiqueta, patron] of [
  ["dura / duración", /\bdura\b|duraci[oó]n/i],
  ["horas", /\bhoras?\b/i],
  ["proyecta / proyección", /proyect/i],
  ["estela", /estela/i],
  ["rinde / rendimiento", /rinde|rendimiento/i]
]) {
  const hits = textos.filter(([, t]) => patron.test(t)).map(([s]) => s);
  check(`"${etiqueta}" → 0 apariciones en feel/likeIf`, hits.length === 0, hits.join(", "));
}

/* ============ 4. Nada de sensaciones que las notas no respaldan ========= */

console.log("\n4. SIN SALTOS EDITORIALES\n" + "─".repeat(70));

const textoAuto = generados.map((s) => [s, `${perfiles[s].feel} ${perfiles[s].likeIf.join(" ")}`]);
const tieneNota = (slug, re) =>
  [...perfiles[slug].topNotes, ...perfiles[slug].middleNotes, ...perfiles[slug].baseNotes,
   ...perfiles[slug].mainNotes, ...perfiles[slug].accords].some((n) => re.test(n));

for (const [etiqueta, patron, respaldo] of [
  ["frescura marina", /marin/i, /marin/i],
  ["barbería", /barber[ií]a/i, /barber/i],
  ["maderas secas", /maderas? secas?/i, /madera seca/i],
  ["goloso", /golos/i, /golos/i],
  ["liviano", /livian/i, /livian/i],
  ["potente", /potent/i, /potent/i]
]) {
  const sinRespaldo = textoAuto.filter(([s, t]) => patron.test(t) && !tieneNota(s, respaldo));
  check(`"${etiqueta}" no aparece sin respaldo en las notas`, sinRespaldo.length === 0,
    sinRespaldo.map(([s]) => s).join(", "));
}

check(
  "el generador ya no usa plantillas de sensación por familia",
  !readFileSync(join(root, "scripts/lib/fragrantica.mjs"), "utf8").includes("FEEL_PHRASES")
);
check(
  'Amber Oud Gold no dice "marina" ni "liviano"',
  !/marin|livian/i.test(`${perfiles["al-haramain-amber-oud-gold"].feel} ${perfiles["al-haramain-amber-oud-gold"].likeIf.join(" ")}`)
);

/* ============== 5. La redacción está anclada en las notas =============== */

console.log("\n5. ANCLAJE EN LAS NOTAS\n" + "─".repeat(70));

const sinTilde = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

for (const slug of generados) {
  const p = perfiles[slug];
  const feel = sinTilde(p.feel);
  const hayPiramide = p.topNotes.length > 0;
  const primeras = hayPiramide
    ? [p.topNotes[0], p.middleNotes[0], p.baseNotes[0]].filter(Boolean)
    : p.mainNotes.slice(0, 3);
  check(
    `${slug}: el feel nombra sus notas verificadas`,
    primeras.every((n) => feel.includes(sinTilde(n))),
    primeras.filter((n) => !feel.includes(sinTilde(n))).join(", ")
  );
  if (hayPiramide) {
    const iTop = feel.indexOf(sinTilde(p.topNotes[0]));
    const iBase = feel.indexOf(sinTilde(p.baseNotes[0]));
    check(`${slug}: respeta el orden salida → fondo`, iTop >= 0 && iBase > iTop, `${iTop} / ${iBase}`);
  }
  check(`${slug}: el likeIf trae 2 o 3 líneas`, p.likeIf.length >= 2 && p.likeIf.length <= 3, `${p.likeIf.length}`);
  check(
    `${slug}: el likeIf no es sólo una familia genérica`,
    p.likeIf.some((l) => primeras.some((n) => sinTilde(l).includes(sinTilde(n)))),
    p.likeIf.join(" | ")
  );
}

check(
  "Oud Wood no narra una evolución que la fuente no da",
  !/abre|arranca|empieza|salida|corazón|fondo|termina|cierra/i.test(perfiles["tom-ford-oud-wood"].feel),
  perfiles["tom-ford-oud-wood"].feel
);

/* ================= 6. Los textos no se repiten entre perfumes =========== */

console.log("\n6. SIN TEXTOS REPETIDOS\n" + "─".repeat(70));

const feels = Object.values(perfiles).map((p) => p.feel).filter(Boolean);
check("ningún feel se repite entre fragancias", new Set(feels).size === feels.length,
  `${feels.length - new Set(feels).size} repetidos`);

const feelsAuto = generados.map((s) => perfiles[s].feel);
check("los 8 aprobados tienen textos distintos entre sí", new Set(feelsAuto).size === 8);
check(
  "usan más de una estructura de frase",
  new Set(feelsAuto.map((f) => f.split(" ").slice(0, 2).join(" "))).size >= 3,
  [...new Set(feelsAuto.map((f) => f.split(" ").slice(0, 2).join(" ")))].join(" | ")
);

const todosLikeIf = generados.flatMap((s) => perfiles[s].likeIf);
check(
  "las líneas de likeIf no son todas iguales",
  new Set(todosLikeIf).size >= todosLikeIf.length - 2,
  `${todosLikeIf.length - new Set(todosLikeIf).size} repetidas`
);

/* ============ 5bis. Cada línea de likeIf usa evidencia propia =========== */

console.log("\n5bis. EVIDENCIA SIN SUPERPOSICIÓN\n" + "─".repeat(70));

/**
 * Se recorre el copy AUTOMÁTICO, no el aprobado.
 *
 * Antes esta sección recorría los 8 editoriales y exigía que su likeIf guardado
 * siguiera saliendo igual del generador. Misma premisa equivocada que en la
 * sección 7: un texto congelado no tiene por qué seguir a una versión futura del
 * generador. Los protegidos los cuida su baseline; la propiedad de "cada línea
 * con evidencia propia" se verifica donde el generador manda, que es copy:"auto".
 */
for (const slug of auto) {
  const detalle = buildLikeIfDetalle({ slug, ...perfiles[slug] });
  check(
    `${slug}: el detalle coincide con el generador`,
    JSON.stringify(detalle.map((c) => c.texto)) ===
      JSON.stringify(buildLikeIf({ slug, ...perfiles[slug] }))
  );

  // La prueba real: sobre el RESULTADO, no sobre la lista de candidatos.
  const vistas = new Map();
  const repetidas = [];
  detalle.forEach((c, i) => {
    for (const k of c.claves) {
      if (vistas.has(k)) repetidas.push(`${k} (líneas ${vistas.get(k) + 1} y ${i + 1})`);
      else vistas.set(k, i);
    }
  });
  check(`${slug}: 0 evidencias compartidas entre líneas`, repetidas.length === 0, repetidas.join(", "));
}

// Los tres casos concretos que se detectaron en la V2.
for (const [slug, evidencia] of [
  ["ariana-grande-cloud", "crema batida"],
  ["christian-dior-hypnotic-poison", "palo de rosa de Brasil"],
  ["lattafa-yara-elixir", "jazmín"]
]) {
  const veces = perfiles[slug].likeIf.filter((l) => sinTilde(l).includes(sinTilde(evidencia))).length;
  check(`${slug}: "${evidencia}" aparece en una sola línea como máximo`, veces <= 1, `${veces} líneas`);
}

check(
  "el filtro de deduplicación descarta con UNA evidencia repetida",
  /claves\.some\(\(k\) => usadas\.has\(k\)\)/.test(
    readFileSync(join(root, "scripts/lib/fragrantica.mjs"), "utf8")
  )
);
check(
  "no se fuerzan tres líneas: el tope es 3, no el mínimo",
  generados.every((s) => perfiles[s].likeIf.length >= 2 && perfiles[s].likeIf.length <= 3)
);

/* ========== 5ter. Las familias globales no se atribuyen a una etapa ====== */

console.log("\n5ter. FAMILIAS GLOBALES SIN TEMPORALIDAD\n" + "─".repeat(70));

const libTxt = readFileSync(join(root, "scripts/lib/fragrantica.mjs"), "utf8");
const bloqueCierres = libTxt.match(/const CIERRES = \[[\s\S]*?\n\];/)?.[0] ?? "";

check("existe el bloque de cierres", bloqueCierres.length > 0);
check(
  'el cierre "fondo-familia" fue eliminado',
  !/necesita: "fondo-familia"/.test(libTxt) && !/c\.necesita === "fondo-familia"/.test(libTxt)
);
check('ya no existe el cierre "El cruce final es"', !libTxt.includes("El cruce final es"));

// Ningún cierre que se alimente sólo de familias puede hablar de etapas.
const lineasCierre = bloqueCierres.split("\n").filter((l) => l.includes("necesita:"));
const temporalesEnFamilias = lineasCierre.filter(
  (l) => /necesita: "familias/.test(l) && /final|fondo|salida|coraz[oó]n|termina|cierra/i.test(l)
);
check(
  "ningún cierre de familias usa salida/corazón/fondo/final",
  temporalesEnFamilias.length === 0,
  temporalesEnFamilias.join(" | ")
);

check(
  "Mandarin Sky no atribuye sus familias al final",
  !/cruce final|final es cítrico/i.test(perfiles["armaf-mandarin-sky"].feel),
  perfiles["armaf-mandarin-sky"].feel
);

/* ===== 5quater. Sin pirámide: ninguna palabra de estructura temporal ===== */

console.log("\n5quater. SIN PIRÁMIDE, SIN ETAPAS\n" + "─".repeat(70));

const bloqueSinPiramide = libTxt.match(/ESTRUCTURAS_SIN_PIRAMIDE = \[[\s\S]*?\n\];/)?.[0] ?? "";
check("existe el bloque de plantillas sin pirámide", bloqueSinPiramide.length > 0);

for (const palabra of ["salida", "corazón", "centro", "fondo", "final", "abre", "termina", "evoluciona"]) {
  const plantillas = bloqueSinPiramide
    .split("\n")
    .filter((l) => l.includes("=>") && new RegExp(`\\b${palabra}`, "i").test(l));
  check(`ninguna plantilla sin pirámide usa "${palabra}"`, plantillas.length === 0, plantillas.join(" | "));
}

const sinPiramide = generados.filter((s) => perfiles[s].topNotes.length === 0);
for (const slug of sinPiramide) {
  const texto = `${perfiles[slug].feel} ${perfiles[slug].likeIf.join(" ")}`;
  check(
    `${slug}: su copy no menciona etapas`,
    !/\b(salida|coraz[oó]n|en el centro|fondo|al final|abre|termina|evoluciona)\b/i.test(texto),
    texto.slice(0, 90)
  );
}

/* ================= 6bis. Naturalidad: guardrails heurísticos ============ */

console.log("\n6bis. NATURALIDAD\n" + "─".repeat(70));

const feelsA = generados.map((s) => perfiles[s].feel);
const lineasA = generados.map((s) => perfiles[s].likeIf);

check(
  'ningún feel usa la construcción "se vuelve <nota>"',
  !feelsA.some((f) => /se vuelve\s+[a-záéíóúñ]/i.test(f)),
  feelsA.filter((f) => /se vuelve\s+[a-záéíóúñ]/i.test(f)).join(" | ")
);

const conConjunto = feelsA.filter((f) => f.includes("El conjunto es")).length;
check(
  '"El conjunto es" aparece en 40% o menos de los automáticos',
  conConjunto / feelsA.length <= 0.4,
  `${conConjunto}/${feelsA.length}`
);

const cierres = feelsA.map((f) => f.split(". ").pop());
check(
  "los cierres no son todos iguales",
  new Set(cierres).size >= Math.ceil(feelsA.length / 2),
  `${new Set(cierres).size} distintos de ${cierres.length}`
);

const aperturasFeel = feelsA.map((f) => f.split(" ").slice(0, 2).join(" ").toLowerCase());
check(
  "los feel no arrancan todos igual",
  new Set(aperturasFeel).size >= Math.ceil(feelsA.length / 2),
  [...new Set(aperturasFeel)].join(" | ")
);

const todas = lineasA.flat();
const cabeceras = todas.map((l) => l.split(" ").slice(0, 3).join(" ").toLowerCase());
const masRepetida = Math.max(...[...new Set(cabeceras)].map((c) => cabeceras.filter((x) => x === c).length));
check(
  "menos del 50% de las líneas de likeIf comparten cabecera",
  masRepetida / todas.length < 0.5,
  `${masRepetida}/${todas.length}`
);

check("ninguna línea de likeIf se repite entre productos", new Set(todas).size === todas.length,
  `${todas.length - new Set(todas).size} repetidas`);

// Dentro de un mismo producto, dos líneas no pueden apoyarse en la misma pareja
// de familias: sería decir lo mismo dos veces.
const ADJ = ["cítrico", "acuático", "aromático", "amaderado", "especiado", "floral", "dulce", "ambarado", "ahumado"];
for (const slug of generados) {
  const firmas = perfiles[slug].likeIf.map((l) =>
    ADJ.filter((a) => sinTilde(l).includes(sinTilde(a))).sort().join("+")
  ).filter((f) => f.includes("+"));
  check(`${slug}: no repite la misma pareja de familias en dos líneas`,
    new Set(firmas).size === firmas.length, firmas.join(" | "));
}

check(
  "el generador ofrece al menos 10 estructuras con pirámide",
  (readFileSync(join(root, "scripts/lib/fragrantica.mjs"), "utf8")
    .match(/const ESTRUCTURAS = \[[\s\S]*?\n\];/)?.[0].match(/\(t, m, b\) =>/g) ?? []).length >= 10
);
check(
  "y al menos 5 sin pirámide",
  (readFileSync(join(root, "scripts/lib/fragrantica.mjs"), "utf8")
    .match(/ESTRUCTURAS_SIN_PIRAMIDE = \[[\s\S]*?\n\];/)?.[0].match(/\(p, r\) =>/g) ?? []).length >= 5
);
check(
  "y al menos 8 aperturas distintas para likeIf",
  (readFileSync(join(root, "scripts/lib/fragrantica.mjs"), "utf8")
    .match(/const APERTURAS = \{[\s\S]*?\n\};/)?.[0].match(/=>\s*`/g) ?? []).length >= 8
);

/* ================== 7. El generador es determinista ==================== */

console.log("\n7. DETERMINISMO\n" + "─".repeat(70));

check(
  "regenerar dos veces da el mismo texto",
  generados.every((s) => buildFeel({ slug: s, ...perfiles[s] }) === buildFeel({ slug: s, ...perfiles[s] }))
);

/**
 * QUÉ TIENE QUE COINCIDIR CON EL GENERADOR, Y QUÉ NO.
 *
 * El check anterior exigía que los perfiles APROBADOS siguieran coincidiendo
 * con lo que el generador produce hoy. La premisa estaba mal: un perfil
 * copy:"editorial" está congelado justamente para NO seguir al generador. Cada
 * vez que el generador mejore, un texto aprobado dejaría de "coincidir" sin que
 * nada se haya roto. Lo mismo vale para las 42 históricas escritas a mano.
 *
 * La regla correcta separa los dos mundos:
 *   · copy:"auto"          debe coincidir con el generador actual;
 *   · editorial/histórico  debe conservar su baseline y quedar fuera del
 *                          alcance del regenerador.
 *
 * Esto NO tapa ningún problema de contenido: que un texto aprobado no siga al
 * generador es normal; que afirme algo sin evidencia es un problema aparte, y
 * lo vigilan los checks de evidencia de la sección 8.
 */
check(
  "no queda ningún copy:\"auto\" pendiente de alinear con el generador",
  auto.length === 0,
  `${auto.length}`
);
const desalineadosAuto = auto.filter(
  (s) =>
    perfiles[s].feel !== buildFeel({ slug: s, ...perfiles[s] }) ||
    JSON.stringify(perfiles[s].likeIf) !== JSON.stringify(buildLikeIf({ slug: s, ...perfiles[s] }))
);
check(
  'los copy:"auto" coinciden con el generador actual',
  desalineadosAuto.length === 0,
  desalineadosAuto.join(", ")
);

// Los protegidos se comparan contra SU baseline, no contra el generador.
const huellaCopy = (s) =>
  createHash("sha1").update(JSON.stringify([perfiles[s].feel, perfiles[s].likeIf])).digest("hex");
const BASELINE_PROTEGIDOS = JSON.parse(
  readFileSync(join(root, "data-review/baseline-copy-protegido.json"), "utf8")
);
const movidos = revisados.filter((s) => BASELINE_PROTEGIDOS[s] !== huellaCopy(s));
const faltantes = revisados.filter((s) => !(s in BASELINE_PROTEGIDOS));
check(
  `los ${revisados.length} protegidos conservan su baseline aprobado`,
  movidos.length === 0 && faltantes.length === 0,
  [...movidos, ...faltantes.map((s) => `${s} (sin baseline)`)].join(", ")
);
check(
  "el baseline cubre exactamente a los protegidos",
  Object.keys(BASELINE_PROTEGIDOS).length === revisados.length,
  `${Object.keys(BASELINE_PROTEGIDOS).length} vs ${revisados.length}`
);

/* ============ 8. REGLA DE EVIDENCIA: family no autoriza vocabulario ====== */

console.log("\n8. EVIDENCIA DE LOS DESCRIPTORES\n" + "─".repeat(70));

/* -- 8a. La tabla de evidencia sólo acepta acordes, nunca notas -- */

for (const [descriptor, acorde, esperado] of [
  ["dulce", "Vainilla", false],
  ["dulce", "Frutal", false],
  ["dulce", "Caramelo", false],
  ["dulce", "Miel", false],
  ["cítrico", "Fresco", false],
  ["floral", "Iris", false],
  ["floral", "Violeta", false],
  ["ambarado", "Vainilla", false],
  ["ahumado", "Tabaco", false],
  ["acuático", "Ozónico", false],
  ["dulce", "Dulce", true],
  ["cítrico", "Cítrico", true],
  ["especiado", "Especiado cálido", true],
  ["especiado", "Especiado fresco", true],
  ["floral", "Floral blanco", true],
  ["floral", "Floral amarillo", true],
  ["ambarado", "Ámbar", true],
  ["amaderado", "Amaderado", true],
  ["acuático", "Acuático", true],
  ["aromático", "Aromático", true]
]) {
  check(
    `"${acorde}" ${esperado ? "SÍ" : "NO"} respalda "${descriptor}"`,
    adjetivoRespaldado(descriptor, [acorde]) === esperado
  );
}
check(
  "un descriptor fuera de la tabla nunca se verbaliza (falla cerrado)",
  adjetivoRespaldado("mineral", ["Mineral"]) === false &&
    adjetivoRespaldado("barbería", ["Aromático"]) === false
);
check(
  "la tabla de evidencia no creció con notas",
  Object.values(ADJ_EVIDENCIA).flat().every((a) =>
    ["citrico", "acuatico", "marino", "aromatico", "amaderado", "especiado",
     "especiado calido", "especiado fresco", "especiado suave", "floral",
     "floral blanco", "floral amarillo", "dulce", "ambar", "ahumado"].includes(a)
  ),
  [...new Set(Object.values(ADJ_EVIDENCIA).flat())].join(", ")
);

/* -- 8b. La regla general, sobre TODO el copy generado -- */

const DESCRIPTORES = Object.keys(ADJ_EVIDENCIA);
/**
 * Busca descriptores como TOKENS, después de consumir los nombres de notas y
 * acordes del propio perfil. Sin esto, "cumarina" daría "marina" y la nota
 * "Notas amaderadas" contaría como si afirmara la familia amaderado.
 */
const descriptoresDe = (texto, p) => {
  let resto = " " + normalize(texto) + " ";
  const frases = [...(p.topNotes ?? []), ...(p.middleNotes ?? []), ...(p.baseNotes ?? []),
    ...(p.mainNotes ?? []), ...(p.accords ?? [])]
    .map((x) => normalize(x))
    .filter(Boolean)
    .sort((a, b) => b.split(" ").length - a.split(" ").length || b.length - a.length);
  for (const f of frases) {
    resto = resto.replace(new RegExp(`(?<=\\s)${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s)`, "g"), " · ");
  }
  const tokens = new Set(resto.split(/\s+/).filter(Boolean));
  return DESCRIPTORES.filter((d) => tokens.has(normalize(d)));
};

/**
 * Se evalúa el copy GUARDADO de los 66, no sólo lo que produciría el generador.
 *
 * Con copy:"auto" en 0, recorrer `auto` dejaría estos checks vacuamente verdes.
 * Ahora que los 66 están congelados, la invariante que importa es que ningún
 * texto publicado —generado o escrito a mano— afirme un descriptor sin acorde.
 * Se verifica además contra el generador, que debe cumplir la misma regla.
 */
const EXCEPCION_NEGACION = new Set([
  // "Buscás algo distinto a lo cítrico": niega el descriptor, no lo afirma.
  "carolina-herrera-212-vip-black:likeIf[3]:cítrico"
]);

const sinRespaldoFeel = [];
const sinRespaldoLike = [];
for (const slug of Object.keys(perfiles)) {
  const p = perfiles[slug];
  for (const d of descriptoresDe(p.feel ?? "", p)) {
    if (!adjetivoRespaldado(d, p.accords)) sinRespaldoFeel.push(`${slug}:${d}`);
  }
  (p.likeIf ?? []).forEach((linea, i) => {
    for (const d of descriptoresDe(linea, p)) {
      const clave = `${slug}:likeIf[${i + 1}]:${d}`;
      if (!adjetivoRespaldado(d, p.accords) && !EXCEPCION_NEGACION.has(clave)) {
        sinRespaldoLike.push(clave);
      }
    }
  });
}
check(
  `ningún feel publicado verbaliza un descriptor sin acorde (${Object.keys(perfiles).length} perfiles)`,
  sinRespaldoFeel.length === 0,
  sinRespaldoFeel.join(", ")
);
check(
  `ningún likeIf publicado verbaliza un descriptor sin acorde (${Object.keys(perfiles).length} perfiles)`,
  sinRespaldoLike.length === 0,
  sinRespaldoLike.join(", ")
);
check(
  "la única excepción es una negación, y sigue siendo una negación",
  /distinto a lo cítrico/.test(perfiles["carolina-herrera-212-vip-black"].likeIf[2]),
  perfiles["carolina-herrera-212-vip-black"].likeIf[2]
);

// El generador tiene que cumplir la misma regla aunque hoy no tenga objetivos.
const generadorSinRespaldo = [];
for (const slug of Object.keys(perfiles)) {
  const p = perfiles[slug];
  if (p.topNotes.length === 0 && (p.mainNotes ?? []).length === 0) continue;
  for (const d of descriptoresDe(buildFeel({ slug, ...p }), p)) {
    if (!adjetivoRespaldado(d, p.accords)) generadorSinRespaldo.push(`${slug}:feel:${d}`);
  }
  for (const linea of buildLikeIf({ slug, ...p })) {
    for (const d of descriptoresDe(linea, p)) {
      if (!adjetivoRespaldado(d, p.accords)) generadorSinRespaldo.push(`${slug}:likeIf:${d}`);
    }
  }
}
check(
  "el generador tampoco produciría un descriptor sin acorde para ninguno de los 66",
  generadorSinRespaldo.length === 0,
  generadorSinRespaldo.join(", ")
);

/* -- 8c. Regresiones concretas del lote 20 -- */

// Sobre lo GUARDADO: es lo que el usuario lee.
const generado = (slug) => ({ feel: perfiles[slug].feel, likeIf: perfiles[slug].likeIf ?? [] });

const fantasy = generado("britney-spears-fantasy");
check(
  "Fantasy no verbaliza \"cítrico\" (no tiene acorde Cítrico)",
  !descriptoresDe(fantasy.feel, perfiles["britney-spears-fantasy"]).includes("cítrico") &&
    !fantasy.likeIf.some((l) =>
      descriptoresDe(l, perfiles["britney-spears-fantasy"]).includes("cítrico"))
);
check(
  "Fantasy conserva sus families",
  JSON.stringify(perfiles["britney-spears-fantasy"].families) ===
    JSON.stringify(["gourmand-dulce", "citrico-fresco"])
);

const delicious = generado("dkny-be-delicious");
check(
  "Be Delicious no verbaliza \"dulce\" (no tiene acorde Dulce)",
  !descriptoresDe(delicious.feel, perfiles["dkny-be-delicious"]).includes("dulce") &&
    !delicious.likeIf.some((l) => descriptoresDe(l, perfiles["dkny-be-delicious"]).includes("dulce"))
);
check(
  "Be Delicious conserva sus families",
  JSON.stringify(perfiles["dkny-be-delicious"].families) ===
    JSON.stringify(["citrico-fresco", "gourmand-dulce", "acuatico"])
);

const givenchy = generado("givenchy-gentleman-reserve-privee");
check(
  "Gentleman Reserve Privée no verbaliza \"floral\" en feel ni en likeIf",
  !descriptoresDe(givenchy.feel, perfiles["givenchy-gentleman-reserve-privee"]).includes("floral") &&
    !givenchy.likeIf.some((l) =>
      descriptoresDe(l, perfiles["givenchy-gentleman-reserve-privee"]).includes("floral"))
);
check(
  "Gentleman Reserve Privée conserva sus families",
  JSON.stringify(perfiles["givenchy-gentleman-reserve-privee"].families) ===
    JSON.stringify(["amaderado", "floral", "ambarado-intenso"])
);

/* -- 8d. Fallar cerrado: descartar el candidato, no rellenar -- */

const conteos = Object.keys(perfiles).map((s) => (perfiles[s].likeIf ?? []).length);
check(
  `ningún producto pasa de 3 líneas de likeIf (${conteos.length} perfiles)`,
  conteos.length === 233 && conteos.every((n) => n <= 3),
  `máximo ${Math.max(...conteos)}`
);
check(
  "ningún producto queda sin likeIf",
  conteos.length === 233 && conteos.every((n) => n >= 1),
  `mínimo ${Math.min(...conteos)}`
);
/**
 * Dos líneas es un resultado válido: no se recicla evidencia para llegar a tres.
 *
 * Se mide sobre los 191 editoriales, que son los perfiles cuyo texto publicado
 * SALIÓ del generador. Las 42 históricas están escritas a mano y su copy nunca
 * pasó por acá, así que exigirle al generador un resultado limpio sobre sus
 * datos mediría algo que no se publica. (Phantom y Libre, por ejemplo, repiten
 * "Lavanda" en salida y corazón, y el candidato de transición junta las dos;
 * su texto real no usa esa línea.)
 */
/**
 * Excepción documentada y ACOTADA AL DATO, no al producto.
 *
 * La ficha de Halloween declara "Violet" en salida Y en corazón, así que el
 * candidato de transición que arma el generador junta las dos y recicla la
 * misma evidencia. Ese candidato NO se publicó: las tres líneas aprobadas usan
 * otra evidencia. Es la misma situación que Phantom y Libre con "Lavanda", que
 * quedan fuera por ser históricas y NO se agregan acá.
 *
 * La excepción tolera exactamente una clave repetida y exactamente esa
 * multiplicidad. Cualquier otra clave duplicada, o la misma con otra cantidad,
 * vuelve a romper el test. No es una autorización por slug.
 */
const DEDUP_DATO_REPETIDO = new Map([
  ["j-del-pozo-halloween", new Map([["violeta", 2]])]
]);
const dedupRoto = editoriales.filter((s) => {
  const p = perfiles[s];
  if (p.topNotes.length === 0 && (p.mainNotes ?? []).length === 0) return false;
  const claves = buildLikeIfDetalle({ slug: s, ...p }).flatMap((c) => c.claves ?? []);
  const conteo = new Map();
  for (const k of claves) conteo.set(k, (conteo.get(k) ?? 0) + 1);
  const repetidas = [...conteo].filter(([, n]) => n > 1);
  if (repetidas.length === 0) return false;
  const permitidas = DEDUP_DATO_REPETIDO.get(s);
  if (!permitidas) return true;
  // Toda clave repetida tiene que estar autorizada Y con esa cantidad exacta.
  return !repetidas.every(([k, n]) => permitidas.get(k) === n);
});
check(
  `la deduplicación estricta de evidencia sigue en pie (${editoriales.length} editoriales)`,
  dedupRoto.length === 0 && editoriales.length === 191,
  dedupRoto.join(", ")
);

console.log("\n" + "─".repeat(70));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
