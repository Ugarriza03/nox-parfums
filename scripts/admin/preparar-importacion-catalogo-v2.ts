/**
 * Genera un SQL de IMPORTACION CONTROLADA a partir de la semilla validada.
 * No conecta a Supabase ni ejecuta SQL. Por defecto el SQL termina en ROLLBACK.
 *
 * Uso:
 *   npx tsx scripts/admin/preparar-semilla-catalogo-v2.ts --out /tmp/nox-v2-seed.json
 *   npx tsx scripts/admin/qa-semilla-catalogo-v2.ts /tmp/nox-v2-seed.json
 *   npx tsx scripts/admin/preparar-importacion-catalogo-v2.ts /tmp/nox-v2-seed.json --out /tmp/nox-v2-import-preview.sql
 *
 * Requiere un catálogo V2 VACIO: nunca sobrescribe borradores ni productos editados.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { PRODUCTS } from "../../src/data/products";

type Row = {
  slug: string; house: string; fragrance_name: string;
  gender: string; universe: string; origin: string;
  olfactory: unknown; image_path: null; status: "published";
  inspired_label: string; data_status: string; performance: unknown; description: null;
};

function fail(message: string): never { throw new Error("Importación V2: " + message); }
const file = process.argv[2];
const index = process.argv.indexOf("--out");
const output = index === -1 ? null : process.argv[index + 1];
if (!file || file.startsWith("--")) fail("Indicar JSON de semilla como primer argumento");
if (!output || output.startsWith("--")) fail("Indicar --out ruta.sql; nunca se escribe en Supabase");
if (file === output) fail("El archivo de salida no puede reemplazar la semilla");
const data: unknown = JSON.parse(readFileSync(file, "utf8"));
if (!Array.isArray(data) || data.length !== 233 || PRODUCTS.length !== 233) fail("Se requieren exactamente 233 filas");
const original = new Map(PRODUCTS.map(p => [p.slug, p]));
const slugs = new Set<string>();
const rows: Row[] = [];
for (const item of data) {
  if (!item || typeof item !== "object" || Array.isArray(item)) fail("Fila inválida");
  const r = item as Row;
  if (typeof r.slug !== "string" || slugs.has(r.slug) || !original.has(r.slug)) fail("Slug desconocido o duplicado");
  const p = original.get(r.slug)!;
  const expected: Row = {
    slug: p.slug, house: p.house, fragrance_name: p.inspiredBy.slice(p.house.length + 1),
    gender: p.gender, universe: p.universe, origin: p.origin,
    olfactory: p.olfactory, image_path: null,
    inspired_label: p.inspiredLabel, data_status: p.dataStatus,
    performance: p.performance, description: null, status: "published"
  };
  if (JSON.stringify(r) !== JSON.stringify(expected)) fail("Paridad incorrecta: " + r.slug);
  slugs.add(r.slug);
  rows.push(r);
}
const quote = (v: string): string => "'" + v.replace(/'/g, "''") + "'";
const values = rows.map(r => "(" + [
  quote(r.slug), quote(r.house), quote(r.fragrance_name), quote(r.gender),
  quote(r.universe), quote(r.origin), r.olfactory === null ? "NULL" : quote(JSON.stringify(r.olfactory)) + "::jsonb",
  "NULL", quote(r.inspired_label), quote(r.data_status),
  quote(JSON.stringify(r.performance)) + "::jsonb", "NULL", quote("published")
].join(", ") + ")").join(",\n");
const sql = `-- NOX V2: VISTA PREVIA SOLAMENTE. NO EJECUTAR EN PRODUCCION.
-- Requiere las migraciones V2 y una base de pruebas con catalog_products vacia.
-- NO altera inventory_items, movimientos, imágenes ni catálogo público.
-- No genera entradas ficticias en el historial administrativo.
BEGIN;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.catalog_products) <> 0 THEN
    RAISE EXCEPTION 'Importación bloqueada: el catálogo V2 no está vacío';
  END IF;
END $$;
INSERT INTO public.catalog_products
  (slug, house, fragrance_name, gender, universe, origin, olfactory, image_path, inspired_label, data_status, performance, description, status)
VALUES
${values};
DO $$ BEGIN
  IF (SELECT count(*) FROM public.catalog_products) <> 233 OR
     (SELECT count(*) FROM public.catalog_products WHERE status='published') <> 233 THEN
    RAISE EXCEPTION 'Paridad de importación fallida: deben existir 233 publicados';
  END IF;
END $$;
-- Revisión humana obligatoria: este archivo NUNCA confirma escrituras.
ROLLBACK;
`;
writeFileSync(output, sql, { flag: "wx" });
console.log("OK: vista previa SQL generada para 233 fragancias; ROLLBACK obligatorio.");
console.log("No se conectó a Supabase ni se modificó producción.");
