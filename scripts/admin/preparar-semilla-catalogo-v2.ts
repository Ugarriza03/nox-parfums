/**
 * NOX Admin V2: prepara semilla JSON del catalogo existente SIN escribir en Supabase.
 * Ejecutar: npx tsx scripts/admin/preparar-semilla-catalogo-v2.ts
 * Opcional: --out ruta.json (solo genera un archivo local).
 */
import { writeFileSync } from "node:fs";
import { PRODUCTS } from "../../src/data/products";
import type { Product } from "../../src/data/types";

type SeedRow = {
  slug: string;
  house: string;
  fragrance_name: string;
  gender: Product["gender"];
  universe: Product["universe"];
  origin: Product["origin"];
  olfactory: Product["olfactory"];
  image_path: string | null;
  inspired_label: string;
  data_status: Product["dataStatus"];
  performance: Product["performance"];
  description: null;
  status: "published";
};

const EXPECTED = 233;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function prepare(): SeedRow[] {
  assert(PRODUCTS.length === EXPECTED,
    `Se esperaban ${EXPECTED} fragancias, hay ${PRODUCTS.length}`);
  const seen = new Set<string>();
  return PRODUCTS.map((product) => {
    assert(SLUG_PATTERN.test(product.slug) && product.slug.length <= 120,
      `Slug invalido: ${product.slug}`);
    assert(!seen.has(product.slug), `Slug duplicado: ${product.slug}`);
    seen.add(product.slug);
    assert(product.id === product.slug, `ID inconsistente: ${product.slug}`);
    assert(product.inspiredBy.startsWith(product.house + " "),
      `Nombre no coincide con la marca: ${product.slug}`);
    const fragrance_name = product.inspiredBy.slice(product.house.length + 1);
    assert(fragrance_name.trim().length > 0, `Nombre vacio: ${product.slug}`);
    assert(["masculino", "femenino", "unisex"].includes(product.gender),
      `Genero invalido: ${product.slug}`);
    assert(["disenador", "nicho", "arabe", "pendiente"].includes(product.universe),
      `Universo invalido: ${product.slug}`);
    assert(["internacional", "arabe"].includes(product.origin),
      `Origen invalido: ${product.slug}`);
    // Las portadas actuales estan en archivos locales, NO en Supabase Storage.
    // Se migraran por separado, con validacion de integridad de imagenes.
    return {
      slug: product.slug,
      house: product.house,
      fragrance_name,
      gender: product.gender,
      universe: product.universe,
      origin: product.origin,
      olfactory: product.olfactory,
      image_path: null,
      inspired_label: product.inspiredLabel,
      data_status: product.dataStatus,
      performance: product.performance,
      description: null,
      status: "published"
    };
  });
}

const rows = prepare();
const json = JSON.stringify(rows, null, 2) + "\n";
const outIndex = process.argv.indexOf("--out");
if (outIndex !== -1) {
  const output = process.argv[outIndex + 1];
  assert(Boolean(output) && !output.startsWith("--"), "Falta ruta despues de --out");
  writeFileSync(output, json, { flag: "wx" });
  console.log(`Semilla local creada: ${output}`);
}
console.log(`OK: ${rows.length} fragancias, ${new Set(rows.map(p => p.slug)).size} slugs unicos.`);
console.log(`Perfiles olfativos: ${rows.filter(p => p.olfactory !== null).length}.`);
console.log("Sin escritura en Supabase, sin cambios de inventario, sin publicacion real.");
