import assert from "node:assert/strict";
import { PRODUCTS } from "../../src/data/products";
import { prepararVistaCatalogoV2, type FilaCatalogoV2 } from "../../src/lib/admin/catalogo-v2-adaptador";

const rows: FilaCatalogoV2[] = PRODUCTS.map(p => ({
  slug: p.slug,
  house: p.house,
  fragrance_name: p.inspiredBy.slice(p.house.length + 1),
  gender: p.gender,
  universe: p.universe,
  origin: p.origin,
  status: "published",
  olfactory: p.olfactory,
  image_path: null,
  inspired_label: p.inspiredLabel,
  data_status: p.dataStatus,
  performance: p.performance
}));
function respaldo(filas: FilaCatalogoV2[] | null, fallo = false) {
  const resultado = prepararVistaCatalogoV2(filas, fallo);
  assert.equal(resultado.fuente, "estatico");
  assert.equal(resultado.products, PRODUCTS, "El respaldo debe conservar la referencia completa al catálogo actual");
  assert.ok(resultado.motivos.length);
}
function alterado(mutacion: (copia: FilaCatalogoV2[]) => void) {
  const copia = rows.map(r => ({ ...r }));
  mutacion(copia);
  respaldo(copia);
}
assert.equal(PRODUCTS.length, 233);
const sano = prepararVistaCatalogoV2(rows, false);
assert.equal(sano.fuente, "v2");
assert.equal(sano.products.length, 233);
assert.deepEqual(sano.products.map(p => p.slug).sort(), PRODUCTS.map(p => p.slug).sort());
respaldo(null);
respaldo(rows, true);
respaldo([]);
alterado(c => c.pop());
alterado(c => c.push({ ...c[0] }));
alterado(c => { c[1] = { ...c[0] }; });
alterado(c => { c[0].slug = "fragancia-no-existente"; });
alterado(c => { c[0].status = "hidden"; });
alterado(c => { c[0].house = "Otra casa"; });
alterado(c => { c[0].fragrance_name = "Otra fragancia"; });
alterado(c => { c[0].gender = "un-género-inválido"; });
alterado(c => { c[0].olfactory = { accords: ["inventado"] }; });
alterado(c => { c[0].inspired_label = "Otra referencia"; });
alterado(c => { c[0].data_status = "pendiente" === c[0].data_status ? "verificado" : "pendiente"; });
alterado(c => { c[0].data_status = "sin-validar"; });
const sinPerformanceFicticia = rows.map(r => ({ ...r, performance: { verified: true, longevity: "muy-alta" } }));
const resultado = prepararVistaCatalogoV2(sinPerformanceFicticia, false);
assert.equal(resultado.fuente, "v2");
assert.deepEqual(resultado.products.map(p => p.performance), PRODUCTS.map(p => p.performance));
console.log("OK: 16 escenarios de respaldo, integridad y performance del adaptador V2.");
