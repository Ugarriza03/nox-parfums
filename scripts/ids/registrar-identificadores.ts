/**
 * REGISTRO DE IDENTIFICADORES — alta de productos nuevos
 *
 *   npm run ids:registrar             agrega al registro los productos nuevos
 *   npm run ids:registrar -- --check  sólo verifica; sale con código 1 si hay
 *                                     productos sin registrar (lo usa el QA)
 *
 * Nunca modifica una entrada existente: sólo agrega al final las fragancias
 * de catalog.raw.ts que todavía no tienen slug congelado, con el slug que les
 * asignó assignStableSlugs(). Escribe src/data/product-ids.ts con formato
 * estable para que el diff sea legible.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { RAW_CATALOG } from "../../src/data/catalog.raw";
import { PRODUCT_ID_REGISTRY } from "../../src/data/product-ids";
import {
  assignStableSlugs,
  collectDrafts,
  type RegisteredProductId
} from "../../src/data/product-identity";

const CHECK = process.argv.includes("--check");
// Como el resto de los scripts del proyecto, se corre desde la raíz (npm run).
const ARCHIVO = resolve("src/data/product-ids.ts");

const asignados = assignStableSlugs(collectDrafts(RAW_CATALOG), PRODUCT_ID_REGISTRY);
const nuevos = asignados.filter((d) => !d.registered);

if (nuevos.length === 0) {
  console.log(`✓ Los ${asignados.length} productos tienen identificador registrado.`);
  process.exit(0);
}

console.log(`${nuevos.length} producto(s) sin identificador registrado:`);
for (const d of nuevos) console.log(`  · ${d.house} ${d.name} (${d.gender}) → ${d.slug}`);

if (CHECK) {
  console.log("✗ Registralos con: npm run ids:registrar");
  process.exit(1);
}

const registro: RegisteredProductId[] = [
  ...PRODUCT_ID_REGISTRY,
  ...nuevos.map(({ slug, house, name, gender, origin }) => ({ slug, house, name, gender, origin }))
];

writeFileSync(ARCHIVO, emitirRegistro(registro));
console.log(`✓ Registro actualizado: ${registro.length} entradas.`);

function emitirRegistro(entradas: RegisteredProductId[]): string {
  const filas = entradas
    .map(
      (e) =>
        `  { slug: ${JSON.stringify(e.slug)}, house: ${JSON.stringify(e.house)}, ` +
        `name: ${JSON.stringify(e.name)}, gender: ${JSON.stringify(e.gender)}, ` +
        `origin: ${JSON.stringify(e.origin)} }`
    )
    .join(",\n");

  return `/**
 * REGISTRO DE IDENTIFICADORES DE PRODUCTO — slugs congelados
 *
 * Cada fragancia del catálogo maestro tiene acá su slug definitivo. El slug es
 * también el id del producto, la URL pública (/fragancia/<slug>), la clave de
 * su perfil olfativo, de su portada y de los pedidos guardados en el navegador.
 *
 * Reglas:
 *   · No editar un slug existente. Cambiarlo rompe la URL, la portada, el
 *     perfil y los pedidos guardados.
 *   · Para renombrar una fragancia: cambiar casa/nombre en catalog.raw.ts Y en
 *     su entrada de acá, conservando el slug.
 *   · Las fragancias nuevas se agregan con \`npm run ids:registrar\`; nunca a mano
 *     salvo que el slug calculado choque con uno existente.
 *
 * Lógica de asignación: src/data/product-identity.ts.
 * Prueba de regresión: npm run qa:ids.
 */

import type { RegisteredProductId } from "./product-identity";

export const PRODUCT_ID_REGISTRY: readonly RegisteredProductId[] = [
${filas}
];
`;
}
