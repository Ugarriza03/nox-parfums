import assert from "node:assert/strict";
import { PRODUCTS } from "../../src/data/products";
import { obtenerCatalogoTienda, obtenerProductoTienda, catalogoV2Activado } from "../../src/lib/catalogo-tienda";

const env = { NOX_CATALOGO_V2_TIENDA: "true", NOX_SUPABASE_URL: "https://example.supabase.co", NOX_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" };
const filas = PRODUCTS.map(p => ({
  slug: p.slug, house: p.house, fragrance_name: p.inspiredBy.slice(p.house.length + 1),
  gender: p.gender, universe: p.universe, origin: p.origin, status: "published",
  olfactory: p.olfactory, image_path: null, inspired_label: p.inspiredLabel,
  data_status: p.dataStatus, performance: p.performance
}));
let solicitudes = 0;
const respuesta = (data: unknown, status = 200): typeof fetch =>
  (async (_url: RequestInfo | URL, init?: RequestInit) => {
    solicitudes++;
    assert.equal(init?.method, "POST");
    return { ok: status === 200, status, json: async () => data } as Response;
  }) as typeof fetch;
const respaldo = async (data: unknown, status = 200) => {
  const result = await obtenerCatalogoTienda(env, respuesta(data, status));
  assert.equal(result.fuente, "estatico");
  assert.equal(result.products, PRODUCTS);
};
async function main() {
assert.equal(catalogoV2Activado({}), false);
assert.equal(catalogoV2Activado(env), true);
const sinFlag = await obtenerCatalogoTienda({}, respuesta(filas));
assert.equal(sinFlag.fuente, "estatico");
assert.equal(solicitudes, 0, "Sin flag no debe haber solicitudes");
assert.equal((await obtenerCatalogoTienda({ NOX_CATALOGO_V2_TIENDA: "true" }, respuesta(filas))).fuente, "estatico");
const sano = await obtenerCatalogoTienda(env, respuesta(filas));
assert.equal(sano.fuente, "v2");
assert.equal(sano.products.length, 233);
const ficha = await obtenerProductoTienda(PRODUCTS[0].slug, env, respuesta(filas));
assert.equal(ficha.product?.slug, PRODUCTS[0].slug);
assert.equal(ficha.fuente, "v2");
await respaldo(filas, 500);
await respaldo(null);
await respaldo({});
await respaldo([]);
await respaldo(filas.slice(1));
await respaldo([...filas, filas[0]]);
await respaldo(filas.map((f, i) => i === 0 ? { ...f, status: "draft" } : f));
await respaldo(filas.map((f, i) => i === 0 ? { ...f, slug: "inexistente" } : f));
await respaldo(filas.map((f, i) => i === 0 ? { ...f, house: "alterada" } : f));
await respaldo(filas.map((f, i) => i === 0 ? { ...f, olfactory: {} } : f));
await respaldo(filas.map((f, i) => i === 0 ? { ...f, inspired_label: "alterada" } : f));
await respaldo(filas.map((f, i) => i === 0 ? { ...f, data_status: "otro" } : f));
await respaldo(filas.map((f, i) => i === 0 ? { ...f, gender: 5 } : f));
const fallo = await obtenerCatalogoTienda(env, (async () => { throw Error("red caída"); }) as typeof fetch);
assert.equal(fallo.fuente, "estatico");
assert.equal(fallo.products, PRODUCTS);
console.log("OK: 20 verificaciones de flag, lectura pública, ficha y respaldo estático.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
