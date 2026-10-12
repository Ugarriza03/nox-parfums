/**
 * QA sin base de datos para la semilla de NOX Admin V2.
 * Compara el JSON generado con los 233 productos actuales, campo por campo.
 * Ejecutar:
 *   npx tsx scripts/admin/preparar-semilla-catalogo-v2.ts --out /tmp/nox-v2-seed.json
 *   npx tsx scripts/admin/qa-semilla-catalogo-v2.ts /tmp/nox-v2-seed.json
 */
import { readFileSync } from "node:fs";
import { PRODUCTS } from "../../src/data/products";

function fail(message: string): never {
  throw new Error("QA semilla V2: " + message);
}
const path = process.argv[2];
if (!path) fail("Indicar la ruta del JSON de semilla");
const raw: unknown = JSON.parse(readFileSync(path, "utf8"));
if (!Array.isArray(raw)) fail("La semilla debe ser un array");
if (PRODUCTS.length !== 233 || raw.length !== 233) {
  fail(`Conteo distinto de 233: origen=${PRODUCTS.length}, semilla=${raw.length}`);
}
const bySlug = new Map<string, Record<string, unknown>>();
for (const row of raw) {
  if (!row || typeof row !== "object" || Array.isArray(row)) fail("Fila invalida");
  const item = row as Record<string, unknown>;
  if (typeof item.slug !== "string" || bySlug.has(item.slug)) fail("Slug invalido o duplicado");
  bySlug.set(item.slug, item);
}
let profiles = 0;
for (const product of PRODUCTS) {
  const row = bySlug.get(product.slug);
  if (!row) fail(`Falta slug: ${product.slug}`);
  const expected = {
    slug: product.slug,
    house: product.house,
    fragrance_name: product.inspiredBy.slice(product.house.length + 1),
    gender: product.gender,
    universe: product.universe,
    origin: product.origin,
    olfactory: product.olfactory,
    image_path: null,
    status: "published"
  };
  if (JSON.stringify(row) !== JSON.stringify(expected)) {
    fail(`Datos alterados en ${product.slug}`);
  }
  if (product.olfactory !== null) profiles++;
}
console.log(`OK: 233/233 fragancias, 233 slugs unicos, ${profiles} perfiles preservados.`);
console.log("Sin conexiones a Supabase ni escrituras de inventario.");
