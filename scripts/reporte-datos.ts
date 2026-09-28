/**
 * REPORTE DE DATOS
 *
 * Estado real de la carga del catálogo: qué está completo, qué falta y qué
 * quedó marcado para revisión humana. No estima ni redondea para arriba.
 *
 *   npm run datos
 */

import {
  PRODUCTS,
  VERIFIED_PRODUCTS,
  TOTAL_PRODUCTS,
  TOTAL_HOUSES,
  FEATURED_PRODUCTS,
  PERFORMANCE_TESTED_PRODUCTS
} from "../src/data/products";
import { OLFACTORY_SOURCES } from "../src/data/olfactory.sources";
import { OLFACTORY_PROFILES } from "../src/data/olfactory";
import { HOUSE_REVIEW_NOTES, PRODUCT_REVIEW_NOTES } from "../src/data/review-notes";
import { SHIPPING_METHODS } from "../src/config/shipping";
import { WHOLESALE_PRICING, tierRangeLabel, formatARS } from "../src/config/pricing";

const line = (n = 74) => "─".repeat(n);
const pct = (a: number, b: number) => `${((a / b) * 100).toFixed(1)}%`;

console.log(`\n${line()}\nNOX PARFUMS — ESTADO DE LOS DATOS\n${line()}\n`);

/* ------------------------------------------------------------ 1. Catálogo */

console.log("1. CATÁLOGO");
console.log(`   Fragancias:            ${TOTAL_PRODUCTS}`);
console.log(`   Casas de referencia:   ${TOTAL_HOUSES}`);
console.log(`   Destacadas en la home: ${FEATURED_PRODUCTS.length}`);

/* -------------------------------------------------- 2. Información olfativa */

const pending = PRODUCTS.filter((p) => p.dataStatus === "pendiente");
const conFuente = PRODUCTS.filter((p) => Boolean(OLFACTORY_SOURCES[p.slug]?.url));
const sinFuente = VERIFIED_PRODUCTS.filter((p) => !OLFACTORY_SOURCES[p.slug]?.url);
const needsReview = PRODUCTS.filter((p) => OLFACTORY_SOURCES[p.slug]?.needsReview);
const ambiguos = PRODUCTS.filter((p) =>
  ["ambiguous", "not-found"].includes(OLFACTORY_SOURCES[p.slug]?.matchConfidence ?? "")
);
const autoCopy = VERIFIED_PRODUCTS.filter(
  (p) => OLFACTORY_SOURCES[p.slug]?.copy === "auto"
);
const editorialCopy = VERIFIED_PRODUCTS.filter(
  (p) => OLFACTORY_SOURCES[p.slug]?.copy === "editorial"
);
// Las fichas históricas no llevan marca `copy`: se revisaron antes de que
// existiera el campo. No se migran sólo por uniformidad.
const historicas = VERIFIED_PRODUCTS.filter((p) => !OLFACTORY_SOURCES[p.slug]?.copy);

console.log(`\n2. INFORMACIÓN OLFATIVA`);
console.log(`   Con perfil cargado:    ${VERIFIED_PRODUCTS.length} de ${TOTAL_PRODUCTS}   (${pct(VERIFIED_PRODUCTS.length, TOTAL_PRODUCTS)} del catálogo)`);
console.log(`   Pendientes:            ${pending.length}`);
console.log(`   Con URL de fuente:     ${conFuente.length}`);
console.log(`   Perfil SIN fuente:     ${sinFuente.length}${sinFuente.length ? "  ← revisar" : ""}`);
console.log(`   Marcados needsReview:  ${needsReview.length}`);
console.log(`   Match ambiguo o nulo:  ${ambiguos.length}`);
console.log(`   Redacción automática:  ${autoCopy.length}  (pendiente de revisión)`);
console.log(`   Redacción aprobada:    ${editorialCopy.length}  (copy: "editorial")`);
console.log(`   Revisadas históricas:  ${historicas.length}  (sin marca copy, revisadas a mano)`);
console.log(`   Protegidas del regenerador: ${editorialCopy.length + historicas.length} de ${VERIFIED_PRODUCTS.length}`);

console.log(`
   Las ${pending.length} pendientes no muestran notas inventadas: la ficha dice que la
   información está en verificación y ofrece consultar por WhatsApp. El asesor
   sólo recomienda fragancias con perfil cargado.

   Para avanzar:  npm run olfativo -- --limit 20
   Empezá por una muestra chica y revisá antes de seguir.`);

/* --------------------------------- Redacción automática pendiente --------- */

if (autoCopy.length === 0) {
  console.log(`\n   REDACCIÓN AUTOMÁTICA PENDIENTE DE REVISIÓN: ninguna.`);
  console.log(`   ${editorialCopy.length} fichas con redacción aprobada y ${historicas.length} revisadas antes`);
  console.log(`   del campo copy. El regenerador no tiene objetivos.`);
}

if (autoCopy.length > 0) {
  console.log(`\n   REDACCIÓN AUTOMÁTICA PENDIENTE DE REVISIÓN (${autoCopy.length})`);
  console.log(`   Generada desde las notas verificadas. Cuando le des el visto bueno,`);
  console.log(`   se marca como editorial en src/data/olfactory.sources.ts (copy: "editorial").`);
  for (const p of autoCopy) {
    const perfil = OLFACTORY_PROFILES[p.slug];
    console.log(`\n     · ${p.inspiredBy}`);
    console.log(`       feel:   ${perfil?.feel ?? "—"}`);
    for (const linea of perfil?.likeIf ?? []) console.log(`       likeIf: ${linea}`);
  }
  console.log("");
}

/* ------------------------------------------------------- Matches a revisar */

if (needsReview.length > 0 || ambiguos.length > 0) {
  console.log(`\n   MATCHES PARA REVISAR A MANO`);
  const todos = [...new Set([...needsReview, ...ambiguos])];
  for (const p of todos.slice(0, 40)) {
    const s = OLFACTORY_SOURCES[p.slug];
    console.log(`\n     · ${p.inspiredBy}`);
    console.log(`       confianza: ${s?.matchConfidence ?? "—"}`);
    if (s?.matchedName) console.log(`       referencia: ${s.matchedName}`);
    if (s?.note) console.log(`       ${s.note}`);
    if (s?.candidates?.length) console.log(`       candidatos: ${s.candidates.join(" | ")}`);
  }
  if (todos.length > 40) console.log(`\n     … y ${todos.length - 40} más.`);
}

/* --------------------------------------------- Pendientes por casa */

const byHouse = new Map<string, number>();
for (const p of pending) byHouse.set(p.house, (byHouse.get(p.house) ?? 0) + 1);
const top = [...byHouse.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

console.log(`\n   CASAS CON MÁS PENDIENTES`);
for (const [house, count] of top) {
  console.log(`     · ${house.padEnd(30)} ${String(count).padStart(3)}`);
}

/* -------------------------------------------------- 3. Universo sin definir */

const unclassified = PRODUCTS.filter((p) => p.universe === "pendiente");
console.log(`\n3. CLASIFICACIÓN DE UNIVERSO (diseñador / nicho)`);
if (unclassified.length === 0) {
  console.log("   Todo clasificado.");
} else {
  const houses = [...new Set(unclassified.map((p) => p.house))];
  console.log(`   Sin clasificar: ${unclassified.length} fragancias de ${houses.join(", ")}`);
  console.log("   Se edita en src/data/brands.ts → HOUSE_UNIVERSE");
}

/* ------------------------------------------------------ 4. Escala mayorista */

console.log(`\n4. ESCALA MAYORISTA (por rangos, aplicada al pedido completo)`);
for (const tier of WHOLESALE_PRICING) {
  console.log(`   ${tierRangeLabel(tier).padEnd(12)} unidades → ${formatARS(tier.unitPrice)} c/u`);
}
console.log("   Verificar con: npm run qa:mayoristas");

/* ----------------------------------------------------- 5. A revisar con vos */

console.log(`\n5. A REVISAR CON VOS`);
for (const [house, note] of Object.entries(HOUSE_REVIEW_NOTES)) {
  console.log(`\n   [${house}]\n   ${note}`);
}
for (const [key, note] of Object.entries(PRODUCT_REVIEW_NOTES)) {
  console.log(`\n   [${key}]\n   ${note}`);
}

/* ------------------------------------------------------- 6. Sin definir */

const missingShipping = SHIPPING_METHODS.filter((m) => !m.cost || !m.eta);
console.log(`\n\n6. DATOS OPERATIVOS SIN DEFINIR`);
console.log(`
   · Costos y plazos de envío: ${missingShipping.length} de ${SHIPPING_METHODS.length} modalidades sin tarifa
     ni plazo. La web lo dice explícitamente en lugar de inventar un número.
     Se completan en src/config/shipping.ts (campos cost / eta).

   · Precio minorista de 5 a 9 unidades: sin regla confirmada. La web invita a
     coordinar por WhatsApp. Se define en src/config/pricing.ts.

   · Reseñas de clientes: ninguna cargada y ninguna inventada.

   · Performance del extracto NOX (duración, proyección, estela): ${PERFORMANCE_TESTED_PRODUCTS.length} de ${PRODUCTS.length}
     fragancias probadas. Hasta que NOX las pruebe, la ficha no afirma nada al
     respecto. Se cargan a mano en src/data/nox-performance.ts con
     verified: true; ninguna fuente externa puede escribir ahí.

   · Fotografía de producto: ninguna fragancia tiene foto (image: null).
     Mientras tanto se genera la composición por familia olfativa.
`);

console.log(line());
console.log("");
