/**
 * REGENERAR LA REDACCIÓN AUTOMÁTICA — y sólo esa.
 *
 * Regenera `feel` y `likeIf` ÚNICAMENTE de los perfiles cuya procedencia está
 * marcada con `copy: "auto"`. Todo lo demás queda byte a byte igual: el script
 * lo copia sin tocarlo y verifica al final que así haya sido.
 *
 * Quedan fuera del regenerador, por lo tanto:
 *   · `copy: "editorial"` → redacción aprobada por una persona
 *   · sin campo `copy`    → las 42 fichas históricas ya revisadas
 *
 * Lo que NO cambia, nunca:
 *   notas, acordes, familias, aromaticIntensity, ocasión, clima, procedencia,
 *   la marca `copy` (sigue en "auto" hasta que una persona la apruebe).
 *
 *   npx tsx scripts/redactar-olfativo.ts --dry-run   ver el antes y el después
 *   npx tsx scripts/redactar-olfativo.ts             escribir
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { OLFACTORY_PROFILES } from "../src/data/olfactory";
import { OLFACTORY_SOURCES } from "../src/data/olfactory.sources";
// @ts-expect-error — módulo .mjs compartido con los scripts de datos
import { buildFeel, buildLikeIf } from "./lib/fragrantica.mjs";
// @ts-expect-error — módulo .mjs compartido con los scripts de datos
import { writeOlfactoryFiles } from "./lib/emit.mjs";

const DRY = process.argv.includes("--dry-run");

type Any = Record<string, any>;

const perfiles: Any = {};
const objetivo: string[] = [];
const intactos: string[] = [];

for (const [slug, perfil] of Object.entries(OLFACTORY_PROFILES)) {
  const esAuto = (OLFACTORY_SOURCES as Any)[slug]?.copy === "auto";

  if (!esAuto) {
    // Redacción revisada: se copia tal cual, sin pasar por el generador.
    perfiles[slug] = perfil;
    intactos.push(slug);
    continue;
  }

  objetivo.push(slug);
  const p = perfil as unknown as Any;
  perfiles[slug] = {
    ...p,
    feel: buildFeel({ slug, ...p }),
    // El slug también va acá: es lo que hace estable —y distinta entre
    // fragancias— la elección de apertura en likeIf.
    likeIf: buildLikeIf({ slug, ...p })
  };
}

/* ------------------------- informe antes / después ------------------------ */

console.log("\nREDACCIÓN AUTOMÁTICA\n" + "─".repeat(74));
console.log(`Con copy:"auto"  ${objetivo.length}   ·   revisados (no se tocan)  ${intactos.length}\n`);

for (const slug of objetivo) {
  const viejo = (OLFACTORY_PROFILES as Any)[slug];
  const nuevo = perfiles[slug];
  console.log("· " + slug);
  console.log("  antes   " + (viejo.feel || "—"));
  console.log("  después " + nuevo.feel);
  for (const l of viejo.likeIf ?? []) console.log("    − " + l);
  for (const l of nuevo.likeIf) console.log("    + " + l);
  console.log("");
}

/* --------------------- garantías antes de escribir nada ------------------- */

const huella = (p: Any) =>
  createHash("sha1")
    .update(
      JSON.stringify([
        p.family, p.families, p.accords, p.topNotes, p.middleNotes,
        p.baseNotes, p.mainNotes, p.occasions, p.seasons, p.aromaticIntensity
      ])
    )
    .digest("hex");

const rotos = Object.keys(perfiles).filter(
  (slug) => huella(perfiles[slug]) !== huella((OLFACTORY_PROFILES as Any)[slug])
);
if (rotos.length > 0) {
  throw new Error(`Se alteraron datos olfativos de: ${rotos.join(", ")}. No se escribe nada.`);
}

const cambiados = intactos.filter(
  (slug) => JSON.stringify(perfiles[slug]) !== JSON.stringify((OLFACTORY_PROFILES as Any)[slug])
);
if (cambiados.length > 0) {
  throw new Error(`Se tocó la redacción revisada de: ${cambiados.join(", ")}. No se escribe nada.`);
}

const sinRedaccion = objetivo.filter((slug) => !perfiles[slug].feel);
if (sinRedaccion.length > 0) {
  throw new Error(`El generador no produjo texto para: ${sinRedaccion.join(", ")}.`);
}

if (objetivo.length === 0) {
  console.log("Ningún perfil tiene copy:\"auto\": no hay nada para regenerar.");
}

console.log("─".repeat(74));
console.log(`datos olfativos intactos     ${Object.keys(perfiles).length} perfiles`);
console.log(`redacción revisada intacta   ${intactos.length} perfiles`);
console.log(`redacción regenerada         ${objetivo.length} perfiles`);
console.log(
  objetivo.length > 0
    ? 'marca copy                   sigue en "auto" (pendiente de aprobación)'
    : 'marca copy                   sin cambios'
);
console.log("noxPerformance               NO MODIFICADO");

if (DRY) {
  console.log("\nDry-run: no se escribió ningún archivo.");
} else {
  const PERF = "src/data/nox-performance.ts";
  const antes = createHash("sha1").update(readFileSync(PERF)).digest("hex");
  // Las fuentes se reescriben idénticas: esta pasada no toca procedencia.
  writeOlfactoryFiles(perfiles, OLFACTORY_SOURCES);
  if (createHash("sha1").update(readFileSync(PERF)).digest("hex") !== antes) {
    throw new Error(`${PERF} cambió. No debería pasar nunca.`);
  }
  console.log("\nEscrito: src/data/olfactory.ts");
}
