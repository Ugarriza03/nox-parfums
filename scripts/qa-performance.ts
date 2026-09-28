/**
 * QA de la separación perfil olfativo / performance NOX.
 *
 * Verifica lo que la iteración 5 dejó como regla estructural:
 *   · La ficha puede hablar libremente de aroma (notas, acordes, familias,
 *     carácter, ocasión, clima).
 *   · La ficha NO afirma duración, horas, proyección ni estela mientras NOX no
 *     lo haya probado.
 *   · El autocompletado no tiene forma de escribir performance.
 *   · Los datos internos de fidelidad y concentración no se publican.
 *
 *   npm run qa:performance
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS, VERIFIED_PRODUCTS, PERFORMANCE_TESTED_PRODUCTS } from "../src/data/products";
import { OLFACTORY_PROFILES } from "../src/data/olfactory";
import { NOX_PERFORMANCE } from "../src/data/nox-performance";
import { INTENSITY_PREFERENCE_OF } from "../src/data/types";
import { recommend, EMPTY_ANSWERS } from "../src/lib/advisor";

let fallas = 0;
function check(nombre: string, ok: boolean, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

function archivosFuente(dir: string, out: string[] = []): string[] {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) archivosFuente(ruta, out);
    else if (/\.(tsx?|css)$/.test(nombre)) out.push(ruta);
  }
  return out;
}

const fuentes = archivosFuente("src");

/**
 * Texto que realmente ve el usuario.
 * Se descartan los comentarios (son documentación interna, no copy) y las
 * líneas de CSS con gradientes, cuyos porcentajes son medidas, no afirmaciones.
 */
function textoVisible(archivo: string): string {
  return readFileSync(archivo, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
    .split("\n")
    .filter((linea) => !/gradient\(|%\)|\bwidth:|\bheight:/.test(linea))
    .join("\n");
}

const VISIBLE = fuentes.map((f) => [f, textoVisible(f)] as const);
const buscarVisible = (patron: RegExp) => VISIBLE.filter(([, t]) => patron.test(t)).map(([f]) => f);

/* ============ 1. La estructura quedó separada de verdad ================== */

console.log("\n1. ESTRUCTURA\n" + "─".repeat(66));

check(
  "todo producto trae un registro de performance",
  PRODUCTS.every((p) => p.performance !== undefined && typeof p.performance.verified === "boolean"),
  `${PRODUCTS.length} productos`
);
check(
  "ninguna performance está verificada todavía",
  PRODUCTS.every((p) => p.performance.verified === false),
  `${PERFORMANCE_TESTED_PRODUCTS.length} probadas por NOX`
);
check("el store de performance arranca vacío", Object.keys(NOX_PERFORMANCE).length === 0);

const perfiles = Object.entries(OLFACTORY_PROFILES);
const CAMPOS_PROHIBIDOS = [
  "longevity",
  "projection",
  "sillage",
  "performanceIntensity",
  "testedAt",
  "verified",
  "intensity"
];
const contaminados = perfiles.filter(([, p]) =>
  Object.keys(p as unknown as Record<string, unknown>).some((k) => CAMPOS_PROHIBIDOS.includes(k))
);
check(
  "ningún perfil olfativo tiene campos de performance",
  contaminados.length === 0,
  contaminados.map(([s]) => s).join(", ")
);
check(
  "todos los perfiles migraron a aromaticIntensity",
  perfiles.every(([, p]) => "aromaticIntensity" in (p as object)),
  `${perfiles.length} perfiles`
);

const ESCALA = ["suave", "equilibrada", "intensa", "envolvente", "marcada"];
const fueraDeEscala = perfiles.filter(
  ([, p]) => p.aromaticIntensity && !ESCALA.includes(p.aromaticIntensity)
);
check(
  "el carácter aromático usa la escala nueva",
  fueraDeEscala.length === 0,
  fueraDeEscala.map(([s]) => s).join(", ")
);

/* ============ 2. La ficha no afirma performance no verificada ============ */

console.log("\n2. COPY DE PERFORMANCE\n" + "─".repeat(66));

for (const [etiqueta, patron] of [
  ["horas concretas de duración", /\b\d{1,2}\s?(horas|hs)\b/i],
  ["dura todo el día", /dura\s+(todo\s+el\s+d[ií]a|much)/i],
  ["duración garantizada / asegurada", /(duraci[oó]n|horas)[^.]{0,24}(garantizad|asegurad)/i],
  ["proyecta más que el original", /proyecta[^.]{0,30}original/i],
  ["mucha estela", /mucha estela/i],
  ["mucha duración", /much[ao]s? duraci[oó]n/i],
  ["rinde muchísimo", /rinde much/i],
  ["promesa de proyección", /(proyecci[oó]n|proyecta)\s+(que|durante|much)/i]
] as const) {
  const hits = buscarVisible(patron);
  check(`"${etiqueta}" → 0 apariciones visibles`, hits.length === 0, hits.join(", "));
}

const ficha = textoVisible("src/components/product/ProductDetail.tsx");
check(
  "la ficha usa la aclaración aprobada de fidelidad",
  ficha.includes("NOX reproduce de") && ficha.includes("forma muy fiel su identidad aromática")
);
check(
  "la etapa final ya no promete horas",
  !/queda cerca tuyo durante horas/.test(ficha)
);
check(
  "el bloque de performance está condicionado a performance.verified",
  /product\.performance\.verified && \(/.test(readFileSync("src/components/product/ProductDetail.tsx", "utf8"))
);

/* ============ 3. Los datos internos no se publican ======================= */

console.log("\n3. DATOS INTERNOS\n" + "─".repeat(66));

for (const [etiqueta, patron] of [
  ["98% de similitud / fidelidad", /(?<![\d.])98\s?%/],
  ["25% o 35% de esencia", /(?<![\d.])(25|35)\s?%/],
  ["rango 25-35", /25\s?[-–a]\s?35/],
  ["porcentaje de esencia", /(esencia|concentraci[oó]n)[^.]{0,20}\d{1,3}\s?%/i]
] as const) {
  const hits = buscarVisible(patron);
  check(`"${etiqueta}" → 0 apariciones`, hits.length === 0, hits.join(", "));
}

for (const [etiqueta, patron] of [
  ["idéntico al original", /id[eé]ntic[oa]s?\s+(al|a la|a los)/i],
  ["100% igual", /100\s?%\s*(igual|id[eé]ntic)/i],
  ["exactamente igual", /exactamente igual/i]
] as const) {
  const hits = buscarVisible(patron);
  check(`"${etiqueta}" → 0 apariciones`, hits.length === 0, hits.join(", "));
}

const homeTxt = textoVisible("src/components/home/Sections.tsx");
check(
  "la home usa copy de fidelidad aprobado",
  homeTxt.includes("Inspiraciones de alta fidelidad en formato Extrait de Parfum")
);
check(
  "la ficha usa copy de fidelidad aprobado",
  ficha.includes("Inspiración de alta fidelidad aromática")
);

/* ============ 4. El asesor sigue funcionando ============================= */

console.log("\n4. ASESOR\n" + "─".repeat(66));

const base = { ...EMPTY_ANSWERS, family: "gourmand-dulce" as const };

const sinPreferencia = recommend(base, 5);
check("recomienda sin preguntar por intensidad", sinPreferencia.length > 0, `${sinPreferencia.length} resultados`);

const marcada = recommend({ ...base, intensity: "marcada" }, 5);
const discreta = recommend({ ...base, intensity: "discreta" }, 5);
check("responde a 'que se note'", marcada.length > 0, marcada[0]?.product.inspiredBy);
check("responde a 'discreta'", discreta.length > 0, discreta[0]?.product.inspiredBy);
check(
  "el carácter aromático cambia el orden del resultado",
  marcada[0]?.product.slug !== sinPreferencia[0]?.product.slug ||
    marcada[0]?.score !== sinPreferencia[0]?.score
);

/* -- la pregunta de refinamiento habla de carácter, no de proyección -- */

const asesorTxt = textoVisible("src/app/asesor/AdvisorClient.tsx");
check('la pregunta ya no dice "¿Cuánta presencia querés?"', !asesorTxt.includes("Cuánta presencia querés"));
check('la pregunta es "¿Qué intensidad preferís?"', asesorTxt.includes("¿Qué intensidad preferís?"));
check('el hint "Presente sin invadir" ya no existe', !asesorTxt.includes("Presente sin invadir"));
for (const [etiqueta, opcion, hint] of [
  ["Discreta", 'label: "Discreta"', 'hint: "Perfil suave y contenido"'],
  ["Equilibrada", 'label: "Equilibrada"', 'hint: "Carácter definido, sin ser dominante"'],
  ["Que se note", 'label: "Que se note"', 'hint: "Carácter marcado e intenso"'],
  ["Me da igual", 'label: "Me da igual"', 'hint: ""']
] as const) {
  check(`opción ${etiqueta} con su hint`, asesorTxt.includes(opcion) && asesorTxt.includes(hint));
}
check(
  "la pregunta sigue siendo opcional",
  asesorTxt.includes("Opcional. Si no lo tenés claro, seguí de largo.") &&
    asesorTxt.includes("Saltear")
);
check(
  "la respuesta sigue alimentando aromaticIntensity y no performance",
  /o\.aromaticIntensity/.test(readFileSync("src/lib/advisor.ts", "utf8"))
);

const conCaracter = VERIFIED_PRODUCTS.filter((p) => p.olfactory?.aromaticIntensity);
check(
  "el asesor tiene carácter cargado para cruzar",
  conCaracter.length === VERIFIED_PRODUCTS.length,
  `${conCaracter.length}/${VERIFIED_PRODUCTS.length}`
);
check(
  "cada carácter mapea a una preferencia del asesor",
  conCaracter.every((p) => Boolean(INTENSITY_PREFERENCE_OF[p.olfactory!.aromaticIntensity!]))
);

const motivos = [...marcada, ...discreta, ...sinPreferencia].flatMap((r) => r.reasons);
check(
  "ningún motivo del asesor habla de duración o proyección",
  !motivos.some((m) => /dura|horas|proyec|estela/i.test(m)),
  motivos.filter((m) => /dura|horas|proyec|estela/i.test(m)).join(" | ")
);
check(
  "sin performance probada, nadie recibe el bonus por performance",
  !motivos.some((m) => /probado por NOX/i.test(m))
);

/* ============ 5. El catálogo no se movió ================================ */

console.log("\n5. CATÁLOGO INTACTO\n" + "─".repeat(66));

const universos = {
  disenador: PRODUCTS.filter((p) => p.universe === "disenador").length,
  nicho: PRODUCTS.filter((p) => p.universe === "nicho").length,
  arabe: PRODUCTS.filter((p) => p.universe === "arabe").length
};
check("233 fragancias", PRODUCTS.length === 233, `${PRODUCTS.length}`);
check("179 diseñador", universos.disenador === 179, `${universos.disenador}`);
check("23 nicho", universos.nicho === 23, `${universos.nicho}`);
check("31 árabes", universos.arabe === 31, `${universos.arabe}`);
check("0 pendientes", PRODUCTS.every((p) => p.universe !== "pendiente"));
// Actualizado tras el macro-lote final: 106 + 91 = 197.
// Lote 06: +3 al cerrarse tres identidades que estaban trabadas (The One for
// Men, L'Eau d'Issey Pour Homme y Acqua di Gio pour Femme). 197 + 3 = 200.
// Lote 08: +2 al cerrarse las dos últimas de Dior (Dior Homme Original y
// J'adore Eau de Toilette). 200 + 2 = 202.
// Este contador sigue al catálogo: se actualiza cuando entra un perfil nuevo
// por el camino legítimo, nunca para tapar una carga que falló.
// Lote 09: +5 al cerrarse cinco pares de género (212 Sexy Men, CH Men, Light
// Blue pour Homme, Scandal Pour Homme y Eros Pour Femme). 202 + 5 = 207.
// Lote 10: +24 al resolver NOX las variantes que el catálogo no especificaba.
// 207 + 24 = 231. Quedan 2 sin perfil, documentados en revision.json.
// Lote 11: +2 al elegir NOX la composicion de Oud for Glory y la fuente de
// Layton Exclusif. 231 + 2 = 233: el catalogo completo tiene perfil olfativo.
check("233 perfiles olfativos", perfiles.length === 233, `${perfiles.length}`);
check(
  "0 fragancias siguen pendientes de perfil",
  PRODUCTS.length - VERIFIED_PRODUCTS.length === 0,
  `${PRODUCTS.length - VERIFIED_PRODUCTS.length}`
);

console.log("\n" + "─".repeat(66));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
