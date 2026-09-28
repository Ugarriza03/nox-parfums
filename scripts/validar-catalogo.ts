/**
 * Valida el catálogo: slugs únicos, datos olfativos enlazados, conteos.
 *   npm run validar
 */
import { PRODUCTS, PRODUCTS_BY_SLUG, TOTAL_PRODUCTS, TOTAL_HOUSES, VERIFIED_PRODUCTS } from "../src/data/products";
import { OLFACTORY_PROFILES } from "../src/data/olfactory";
import { OLFACTORY_SOURCES } from "../src/data/olfactory.sources";

const missing = Object.keys(OLFACTORY_PROFILES).filter((k) => !PRODUCTS_BY_SLUG[k]);
const sinFuente = Object.keys(OLFACTORY_PROFILES).filter((k) => !OLFACTORY_SOURCES[k]);
console.log("Productos totales:", TOTAL_PRODUCTS);
console.log("Casas:", TOTAL_HOUSES);
console.log("Verificados:", VERIFIED_PRODUCTS.length, "de", Object.keys(OLFACTORY_PROFILES).length, "perfiles cargados");
console.log("Perfiles SIN fuente interna:", sinFuente.length ? sinFuente : "ninguno ✓");
console.log("Claves olfativas SIN producto:", missing.length ? missing : "ninguna ✓");
const dup = PRODUCTS.map(p=>p.slug).filter((s,i,a)=>a.indexOf(s)!==i);
console.log("Slugs duplicados:", dup.length ? dup : "ninguno ✓");
console.log("Universos:", JSON.stringify(PRODUCTS.reduce((a:any,p)=>{a[p.universe]=(a[p.universe]||0)+1;return a},{})));
