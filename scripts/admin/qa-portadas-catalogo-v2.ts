/**
 * Inventario verificable de portadas actuales. No sube ni altera imágenes.
 * npx tsx scripts/admin/qa-portadas-catalogo-v2.ts
 * --out ruta.json crea manifiesto local con hashes SHA-256, sin sobrescribir.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS } from "../../src/data/products";
import { COVER_SLUGS, PORTADAS_ALTERNATIVAS, TOTAL_COVERS, coverFor } from "../../src/components/product/covers";

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error("Portadas V2: " + message);
}
const slugs = new Set(PRODUCTS.map(p => p.slug));
assert(PRODUCTS.length === 233 && slugs.size === 233, "Catálogo base distinto de 233");
assert(COVER_SLUGS.length === 233 && TOTAL_COVERS === 233, "No hay exactamente 233 portadas principales");
assert(new Set(COVER_SLUGS).size === 233, "Portadas duplicadas");
const assets: { slug: string; role: "principal" | "alternativa"; path: string; bytes: number; sha256: string }[] = [];
function check(slug: string, role: "principal" | "alternativa", url: string) {
  assert(slugs.has(slug), "Portada huérfana: " + slug);
  assert(/^\/products\/covers\/(?:alt\/)?[a-z0-9-]+\.webp$/.test(url), "Ruta insegura: " + url);
  assert(role === "alternativa" || url === `/products/covers/${slug}.webp`, "Portada principal mal asociada: " + slug);
  const file = join(process.cwd(), "public", url.slice(1));
  assert(existsSync(file) && statSync(file).isFile(), "Falta archivo: " + url);
  const bytes = readFileSync(file);
  assert(bytes.length > 0, "Imagen vacía: " + url);
  assert(bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP", "Formato WebP inválido: " + url);
  assets.push({ slug, role, path: url, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
}
for (const product of PRODUCTS) {
  const url = coverFor(product);
  assert(url !== null, "Sin portada: " + product.slug);
  check(product.slug, "principal", url);
}
for (const [slug, url] of Object.entries(PORTADAS_ALTERNATIVAS)) check(slug, "alternativa", url);
assert(assets.filter(a => a.role === "alternativa").length === 6, "Cantidad de alternativas distinta de 6");
assert(new Set(assets.map(a => a.path)).size === assets.length, "Rutas repetidas");
const out = process.argv.indexOf("--out");
if (out !== -1) {
  const path = process.argv[out + 1];
  assert(path && !path.startsWith("--"), "Falta ruta para --out");
  writeFileSync(path, JSON.stringify({ schema: 1, main: 233, alternatives: 6, assets }, null, 2) + "\n", { flag: "wx" });
}
console.log(`OK: 233 portadas principales y 6 alternativas verificadas (239 archivos, SHA-256).`);
console.log("No se modificaron archivos, catálogo, Storage ni Supabase.");
