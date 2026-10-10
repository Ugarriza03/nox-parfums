/**
 * GENERAR EL MANIFIESTO DE INTEGRIDAD — npm run integridad:generar
 *
 * Escribe data/integridad/manifiesto-catalogo.json desde el catálogo actual.
 * Sólo lee los datos de origen; nunca los modifica.
 *
 * Cuándo correrlo: únicamente cuando un cambio en el catálogo, las portadas o
 * la lógica comercial es intencional y está aprobado. El diff del manifiesto
 * en el pull request es la constancia de qué cambió.
 *
 *   npm run integridad:generar -- --stdout   imprime sin escribir
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { construirManifiesto, serializar, MANIFIESTO_RUTA } from "./manifiesto";

const manifiesto = construirManifiesto();
const texto = serializar(manifiesto);

if (process.argv.includes("--stdout")) {
  process.stdout.write(texto);
} else {
  mkdirSync(dirname(MANIFIESTO_RUTA), { recursive: true });
  writeFileSync(MANIFIESTO_RUTA, texto);
  const t = manifiesto.totales;
  console.log(
    `✓ ${MANIFIESTO_RUTA}: ${t.productos} productos, ${t.perfilesOlfativos} perfiles, ` +
      `${t.portadas} portadas, ${t.destacadas} destacadas.`
  );
}
