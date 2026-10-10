/**
 * VERIFICAR LA INTEGRIDAD DEL CATÁLOGO — npm run qa:integridad
 *
 * Compara el catálogo actual contra data/integridad/manifiesto-catalogo.json
 * y falla (exit 1) ante cualquier diferencia no regenerada:
 *
 *   · slugs cambiados, productos eliminados, nuevos o duplicados
 *   · cambios de nombre, casa, género, origen o universo
 *   · perfiles olfativos faltantes, desenganchados o modificados
 *   · portadas faltantes, movidas, reemplazadas o con otras dimensiones
 *   · destacadas que cambian o apuntan a un producto inexistente
 *   · cambios en precios, promociones o regalos
 *
 * Además verifica invariantes que no dependen del manifiesto (slugs únicos,
 * cada producto con perfil y portada existente).
 *
 * Un cambio intencional y aprobado se registra regenerando el manifiesto
 * (npm run integridad:generar) y commiteando el diff junto con el cambio.
 */

import { existsSync, readFileSync } from "node:fs";
import { construirManifiesto, serializar, MANIFIESTO_RUTA, type Manifiesto } from "./manifiesto";
import { compararManifiestos } from "./comparar";

if (!existsSync(MANIFIESTO_RUTA)) {
  console.log(`✗ No existe ${MANIFIESTO_RUTA}. Generalo con: npm run integridad:generar`);
  process.exit(1);
}

const esperado = JSON.parse(readFileSync(MANIFIESTO_RUTA, "utf8")) as Manifiesto;
const actual = construirManifiesto();
const problemas = compararManifiestos(esperado, actual);

/* -------------------------------------------------------------- reporte */

const t = actual.totales;
const categorias = Object.keys(problemas);
const resumen = [
  `productos ${t.productos}`,
  `perfiles ${actual.productos.filter((p) => p.perfilOlfativo.existe).length}`,
  `portadas ${actual.productos.filter((p) => p.portada.existe).length}`,
  `destacadas ${t.destacadas}`
].join(" · ");

if (categorias.length === 0) {
  // Coincidencia byte a byte: además de lo anterior, nada más se movió.
  const identico = serializar(actual) === readFileSync(MANIFIESTO_RUTA, "utf8");
  console.log(`✓ Integridad del catálogo OK — ${resumen}`);
  console.log(`✓ ${t.productos} slugs, ${t.productos} perfiles y ${t.productos} portadas coinciden con el manifiesto`);
  console.log(`✓ precios, promociones y regalos sin cambios`);
  console.log(`${identico ? "✓" : "✗"} manifiesto idéntico byte a byte`);
  process.exit(identico ? 0 : 1);
}

console.log(`✗ Integridad del catálogo: ${categorias.length} tipo(s) de problema — ${resumen}\n`);
for (const c of categorias) {
  const lista = problemas[c];
  console.log(`✗ ${c} (${lista.length})`);
  for (const d of lista.slice(0, 25)) console.log(`    · ${d}`);
  if (lista.length > 25) console.log(`    · … y ${lista.length - 25} más`);
}
console.log(
  "\nSi el cambio es intencional y está aprobado: npm run integridad:generar y commitear el manifiesto."
);
process.exit(1);
