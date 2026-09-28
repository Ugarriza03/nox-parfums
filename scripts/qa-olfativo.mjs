/**
 * QA del pipeline de autocompletado, sin red.
 *
 * Siembra una caché con páginas de prueba y corre el autocompletado real en
 * dry-run. Verifica el recorrido completo: índice de casa → match de variante →
 * parseo → traducción → familia → y que NO escriba nada.
 *
 *   npm run qa:olfativo
 */

import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScript } from "./lib/run-tsx.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = mkdtempSync(join(tmpdir(), "nox-olfativo-"));

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

/** Mismo esquema de nombre que usa el script. */
const rutaCache = (url) =>
  join(cache, `${url.replace(/[^a-z0-9]+/gi, "_").slice(-160)}.html`);

const INDEX = "https://www.fragrantica.com/designers/Lattafa-Perfumes.html";
const FICHA = "https://www.fragrantica.com/perfume/Lattafa-Perfumes/Yara-76880.html";

writeFileSync(
  rutaCache(INDEX),
  `<div class="grid">
    <a href="/perfume/Lattafa-Perfumes/Yara-76880.html"><span>Yara</span></a>
    <a href="/perfume/Lattafa-Perfumes/Yara-Candy-95752.html">Yara Candy</a>
    <a href="/perfume/Lattafa-Perfumes/Yara-Tous-83320.html">Yara Tous</a>
    <a href="/perfume/Lattafa-Perfumes/Yara-Elixir-117615.html">Yara Elixir</a>
    <a href="/perfume/Lattafa-Perfumes/Khamrah-75805.html">Khamrah</a>
    <a href="/designers/Lattafa-Perfumes.html">Lattafa Perfumes</a>
  </div>`
);

writeFileSync(
  rutaCache(FICHA),
  `<h1>Yara Lattafa Perfumes for women</h1>
  <div itemprop="brand" content="Lattafa Perfumes"></div>
  <p>Top notes are Orchid, Heliotrope and Tangerine; middle notes are Gourmand Accord and
  Tropical Fruits; base notes are Vanilla, Musk and Sandalwood.</p>
  <div class="accord-bar" style="width:100%">Sweet</div>
  <div class="accord-bar" style="width:90%">Vanilla</div>
  <div class="accord-bar" style="width:70%">Powdery</div>
  <div class="accord-bar" style="width:60%">Tropical</div>
  <div class="accord-bar" style="width:50%">Musky</div>`
);

/* --------------------- Estado de los archivos antes -------------------- */

const perfiles = join(root, "src/data/olfactory.ts");
const fuentes = join(root, "src/data/olfactory.sources.ts");
const performance = join(root, "src/data/nox-performance.ts");
const revision = join(root, "data-review/revision.json");
const leer = (ruta) => (existsSync(ruta) ? readFileSync(ruta, "utf8") : null);
const antes = [
  readFileSync(perfiles, "utf8"),
  readFileSync(fuentes, "utf8"),
  readFileSync(performance, "utf8"),
  leer(revision)
];

/* ----------------------------- Corrida --------------------------------- */

console.log("\nQA — PIPELINE OLFATIVO (dry-run, sin red)\n" + "─".repeat(64));

// runScript corre tsx con el Node actual: no depende de `npx` en el PATH, que
// en Windows se llama npx.cmd y hace fallar el subproceso con ENOENT.
const corrida = runScript(
  "scripts/autocompletar-olfativo.ts",
  ["--only", "lattafa-yara", "--force", "--dry-run"],
  { cwd: root, env: { NOX_CACHE_DIR: cache } }
);
check("el pipeline corre sin errores", corrida.ok, corrida.ok ? "" : corrida.salida.trim());
const salida = corrida.salida;

console.log(salida.trim().split("\n").map((l) => `   ${l}`).join("\n"));
console.log("─".repeat(64));

/* ----------------------------- Checks ---------------------------------- */

for (const [etiqueta, esperado] of [
  ["informa el producto NOX", "producto NOX       Lattafa Yara"],
  ["informa la marca detectada", "marca detectada    Lattafa"],
  ["informa el perfume detectado", "perfume detectado  Yara"],
  ["informa la URL consultada", FICHA],
  ["informa la confianza del match", "confidence         exact"],
  ["informa notas de salida traducidas", "Orquídea, Heliotropo, Mandarina"],
  ["informa notas de corazón traducidas", "Acorde gourmand, Frutas tropicales"],
  ["informa notas de fondo traducidas", "Vainilla, Almizcle, Sándalo"],
  ["informa los acordes traducidos", "Dulce, Vainilla, Empolvado, Tropical, Almizclado"],
  ["deriva la familia olfativa", "familia            gourmand-dulce"],
  ["informa el carácter aromático", "carácter aromático envolvente"],
  ["declara qué campos escribiría", "¿qué escribe?      NADA — dry-run"],
  ["avisa que no escribe", "¿escribe datos?    NO — dry-run"],
  ["declara que no toca la performance NOX", "noxPerformance     NO MODIFICADO"],
  ["cierra diciendo que no escribió nada", "no se escribió ningún archivo"],
  ["cierra confirmando la guardia de performance", "noxPerformance: NO MODIFICADO"]
]) {
  check(etiqueta, salida.includes(esperado), esperado.slice(0, 46));
}

check(
  "no eligió una variante parecida (Yara Candy / Tous / Elixir)",
  !/perfume detectado\s+Yara (Candy|Tous|Elixir)/.test(salida)
);

/* ------------------- El dry-run no tocó ningún archivo ------------------ */

const despues = [
  readFileSync(perfiles, "utf8"),
  readFileSync(fuentes, "utf8"),
  readFileSync(performance, "utf8"),
  leer(revision)
];
check("dry-run no modificó olfactory.ts", antes[0] === despues[0]);
check("dry-run no modificó olfactory.sources.ts", antes[1] === despues[1]);
check("el autocompletado no tocó nox-performance.ts", antes[2] === despues[2]);
check(
  "el perfil propuesto no incluye ningún campo de performance",
  !/\b(longevity|projection|sillage|performanceIntensity|testedAt)\b/.test(salida)
);
// La cola puede existir por una carga real anterior: lo que se verifica es que
// el dry-run no la haya tocado, no que el archivo no exista.
check("dry-run no modificó la cola de revisión", antes[3] === despues[3]);

rmSync(cache, { recursive: true, force: true });

console.log("\n" + "─".repeat(64));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
