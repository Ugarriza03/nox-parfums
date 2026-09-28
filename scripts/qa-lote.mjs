/**
 * QA DEL LOTE DE VALIDACIÓN (8 casos).
 *
 * El lote no está armado con casos fáciles: cada uno existe para intentar
 * romper el matcher antes de usarlo sobre las 191 pendientes. Este QA corre el
 * CLI real y verifica, además del resultado esperado de cada caso, que las
 * confusiones concretas que preocupan sean IMPOSIBLES, no sólo improbables.
 *
 *   npm run qa:lote
 */

import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TSX_PATH, evalTs, runScript, runTsx } from "./lib/run-tsx.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = mkdtempSync(join(tmpdir(), "nox-lote-"));
const LOTE = join(root, "data/import/lote-validacion-8.json");

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

/** Corre el CLI real. runScript es cross-platform: no depende de `npx` en PATH. */
function correr(args) {
  return runScript("scripts/autocompletar-olfativo.ts", args, { cwd: root });
}

function archivo(nombre, contenido) {
  const ruta = join(tmp, nombre);
  writeFileSync(ruta, JSON.stringify(contenido, null, 2));
  return ruta;
}

/** Extrae el bloque de salida de un producto. */
function bloque(salida, producto) {
  const partes = salida.split(/^· /m);
  return partes.find((p) => p.startsWith(producto)) ?? "";
}

const registros = JSON.parse(readFileSync(LOTE, "utf8"));
const porSlug = Object.fromEntries(registros.map((r) => [r.productSlug, r]));
const sinPerfil = (slug, cambios) => {
  const base = JSON.parse(JSON.stringify(porSlug[slug]));
  delete base.needsReview;
  delete base.reviewReason;
  return { ...base, ...cambios };
};

/* ------------------- estado de los datos antes de todo ------------------- */

const rutas = {
  perfiles: join(root, "src/data/olfactory.ts"),
  fuentes: join(root, "src/data/olfactory.sources.ts"),
  performance: join(root, "src/data/nox-performance.ts"),
  catalogo: join(root, "src/data/catalog.raw.ts"),
  marcas: join(root, "src/data/brands.ts")
};
const antes = Object.fromEntries(
  Object.entries(rutas).map(([k, v]) => [k, readFileSync(v, "utf8")])
);

/* ============ 0. EL EJECUTOR DE SUBPROCESOS ES CROSS-PLATFORM =========== */

console.log("\n0. EJECUCIÓN DE SUBPROCESOS\n" + "─".repeat(70));

check("el CLI de tsx se resuelve dentro del proyecto", Boolean(TSX_PATH), TSX_PATH ?? "no encontrado");
check(
  "se ejecuta con el Node actual, no con un binario del PATH",
  readFileSync(join(root, "scripts/lib/run-tsx.mjs"), "utf8").includes("process.execPath")
);
// Se arma el patrón por partes para que esta misma línea no se detecte a sí misma.
const LLAMADA_NPX = new RegExp(`(execFileSync|spawnSync|spawn|exec)\\(\\s*["']${"np" + "x"}["']`);
const conNpx = ["qa-lote.mjs", "qa-import.mjs", "qa-olfativo.mjs", "lib/run-tsx.mjs"].filter((f) =>
  LLAMADA_NPX.test(readFileSync(join(root, "scripts", f), "utf8"))
);
check("ningún QA invoca npx como binario del sistema", conNpx.length === 0, conNpx.join(", "));
check(
  "no se recurre a shell: true",
  readFileSync(join(root, "scripts/lib/run-tsx.mjs"), "utf8").includes("shell: false")
);

const ok0 = evalTs('console.log("hola");');
check("un subproceso correcto devuelve ok y exit code 0", ok0.ok && ok0.code === 0, `code ${ok0.code}`);
check("stdout se captura", ok0.salida.includes("hola"));

const falla = evalTs('console.error("ruido"); process.exit(3);');
check("un subproceso que falla NO devuelve ok", !falla.ok, `code ${falla.code}`);
check("el exit code se propaga tal cual", falla.code === 3, `code ${falla.code}`);
check("stderr también se captura", falla.salida.includes("ruido"));

const inexistente = runTsx(["scripts/este-script-no-existe.ts"]);
check("un script inexistente falla en vez de pasar en silencio", !inexistente.ok);

/* ========================= 1. LOS 8 CASOS =============================== */

console.log("\n1. RESULTADO DE CADA CASO\n" + "─".repeat(70));

const r = correr(["--source-file", LOTE, "--solo-match", "--force"]);
check("el lote corre completo", r.ok);
check("procesa los 8 registros", /Registros en el archivo: 8/.test(r.salida));
check("identifica 6 y deja 2 para revisar", /Identificadas: 6   ·   Para revisar: 2/.test(r.salida));

const esperado = [
  ["Afnan 9PM", "Afnan", "9 PM", "exact", "identificado", "verified"],
  ["Armaf Mandarin Sky", "Armaf", "Odyssey Mandarin Sky", "exact", "identificado", "candidate"],
  ["Carolina Herrera 212 VIP Men", "Carolina Herrera", "212 VIP Men", "exact", "identificado", "candidate"],
  ["Carolina Herrera 212 VIP", "Carolina Herrera", "212 VIP", "exact", "identificado", "candidate"],
  ["Tom Ford Tobacco Vanilla", "Tom Ford", "Tobacco Vanille", "exact", "identificado", "verified"],
  ["Montale Arabians Tonka", "Montale", "Arabians Tonka", "exact", "identificado", "candidate"],
  ["Louis Vuitton Afternoon Sweet", "Louis Vuitton", "—", "ambiguous", "needsReview", "candidate"],
  ["Versace Eros", "Versace", "—", "ambiguous", "needsReview", "candidate"]
];

for (const [producto, marca, referencia, confianza, estado, fuente] of esperado) {
  const b = bloque(r.salida, producto);
  check(
    `${producto} → ${estado} (${confianza}, fuente ${fuente})`,
    b.includes(`marca detectada    ${marca}`) &&
      b.includes(`perfume detectado  ${referencia}`) &&
      b.includes(`confidence         ${confianza}`) &&
      b.includes(`estado             ${estado}`) &&
      b.includes(`fuente             ${fuente}`),
    b ? "" : "no apareció en la salida"
  );
}

check(
  "ningún caso ambiguo se reportó como exact",
  !/estado             needsReview[\s\S]{0,200}confidence         exact/.test(r.salida) &&
    bloque(r.salida, "Louis Vuitton Afternoon Sweet").includes("confidence         ambiguous") &&
    bloque(r.salida, "Versace Eros").includes("confidence         ambiguous")
);
check(
  "los dos casos dudosos explican el motivo",
  bloque(r.salida, "Louis Vuitton Afternoon Sweet").includes("motivo") &&
    bloque(r.salida, "Versace Eros").includes("motivo")
);
check(
  "ningún caso dudoso escribe información olfativa",
  bloque(r.salida, "Louis Vuitton Afternoon Sweet").includes(
    "¿qué escribe?      NADA — sólo la anotación de revisión"
  ) &&
    bloque(r.salida, "Versace Eros").includes(
      "¿qué escribe?      NADA — sólo la anotación de revisión"
    )
);

/* ================= 2. CONFUSIONES QUE DEBEN SER IMPOSIBLES ============== */

console.log("\n2. CONFUSIONES BLOQUEADAS\n" + "─".repeat(70));

const cruces = [
  {
    nombre: "Afnan 9PM nunca se atribuye a Armaf",
    registro: sinPerfil("afnan-9pm", { brand: "Armaf" }),
    espera: /marca del archivo \("Armaf"\)/i
  },
  {
    nombre: "Mandarin Sky nunca se atribuye a Afnan",
    registro: sinPerfil("armaf-mandarin-sky", { brand: "Afnan" }),
    espera: /marca del archivo \("Afnan"\)/i
  },
  {
    nombre: "9PM no se resuelve con la variante Night Out",
    registro: sinPerfil("afnan-9pm", { referenceName: "9 PM Night Out" }),
    espera: /variante "9 PM Night Out" ≠ "9PM"/i
  },
  {
    nombre: "212 VIP (femenino) no hereda de 212 VIP Men",
    registro: sinPerfil("carolina-herrera-212-vip", { referenceName: "212 VIP Men" }),
    espera: /variante "212 VIP Men" ≠ "212 VIP"/i
  },
  {
    nombre: "212 VIP Men no hereda de 212 VIP",
    registro: sinPerfil("carolina-herrera-212-vip-men", { referenceName: "212 VIP" }),
    espera: /variante "212 VIP" ≠ "212 VIP Men"/i
  },
  {
    nombre: "212 VIP no se confunde con 212 VIP Black",
    registro: sinPerfil("carolina-herrera-212-vip", { referenceName: "212 VIP Black" }),
    espera: /variante "212 VIP Black" ≠ "212 VIP"/i
  },
  {
    nombre: "212 VIP no se confunde con 212 VIP Rosé",
    registro: sinPerfil("carolina-herrera-212-vip", { referenceName: "212 VIP Rosé" }),
    espera: /variante "212 VIP Rosé" ≠ "212 VIP"/i
  },
  {
    nombre: "Tobacco Vanille no se resuelve con Tobacco Vanille Parfum",
    registro: sinPerfil("tom-ford-tobacco-vanilla", { referenceName: "Tobacco Vanille Parfum" }),
    espera: /variante "Tobacco Vanille Parfum" ≠ "Tobacco Vanilla"/i
  },
  {
    nombre: "Arabians Tonka no se resuelve con Arabians",
    registro: sinPerfil("montale-arabians-tonka", { referenceName: "Arabians" }),
    espera: /variante "Arabians" ≠ "Arabians Tonka"/i
  },
  {
    nombre: "el género de la referencia tiene que coincidir con el del producto",
    registro: sinPerfil("carolina-herrera-212-vip", { referenceGender: "masculino" }),
    espera: /La referencia es masculino y el producto NOX figura como femenino/i
  }
];

for (const caso of cruces) {
  const ruta = archivo(`${caso.nombre.slice(0, 40).replace(/[^a-z0-9]+/gi, "-")}.json`, caso.registro);
  const res = correr(["--source-file", ruta, "--solo-match", "--force"]);
  const bloqueado = caso.espera.test(res.salida);
  check(caso.nombre, bloqueado, bloqueado ? "" : res.salida.slice(-200).trim());
  check(
    `${caso.nombre} → no identifica nada`,
    /Identificadas: 0/.test(res.salida) || !/estado             identificado/.test(res.salida)
  );
}

/* ============ 3. EL IMPORTER NO TOCA CATÁLOGO NI TAXONOMÍA ============== */

console.log("\n3. CATÁLOGO Y TAXONOMÍA\n" + "─".repeat(70));

/** Node no importa .ts: se consulta el catálogo real por tsx. */
const consultaCatalogo = evalTs(
  'import { PRODUCTS } from "./src/data/products"; ' +
    "console.log(JSON.stringify(PRODUCTS.map((p) => ({ slug: p.slug, gender: p.gender, " +
    "universe: p.universe, olfactory: p.olfactory ? true : false }))));",
  { cwd: root }
);
check("se puede consultar el catálogo real desde el QA", consultaCatalogo.ok, consultaCatalogo.ok ? "" : consultaCatalogo.salida.trim());
const PRODUCTS = consultaCatalogo.ok ? JSON.parse(consultaCatalogo.salida) : [];

for (const [clave, ruta] of Object.entries(rutas)) {
  check(
    `el lote no modificó ${ruta.split("/").pop()}`,
    readFileSync(ruta, "utf8") === antes[clave]
  );
}
check(
  "el importer no puede escribir universe ni el nombre público",
  !/universe|inspiredBy|catalog\.raw/.test(
    readFileSync(join(root, "scripts/lib/import-olfativo.mjs"), "utf8")
  )
);
check(
  "el importer sólo emite olfactory.ts y olfactory.sources.ts",
  (readFileSync(join(root, "scripts/lib/emit.mjs"), "utf8").match(/writeFileSync\(/g) ?? []).length === 2
);
check(
  "Tobacco Vanilla conserva su nombre público en el catálogo",
  readFileSync(rutas.catalogo, "utf8").includes('"Tobacco Vanilla"') &&
    !readFileSync(rutas.catalogo, "utf8").includes('"Tobacco Vanille"')
);
check(
  "el alias Tobacco Vanilla → Tobacco Vanille vive sólo en el pipeline",
  readFileSync(join(root, "scripts/lib/fragrantica.mjs"), "utf8").includes(
    '"Tobacco Vanilla": "Tobacco Vanille"'
  )
);
check(
  "Montale sigue clasificada como nicho a nivel casa",
  readFileSync(rutas.marcas, "utf8").includes('Montale: "nicho"')
);

{
  const tonka = PRODUCTS.find((p) => p.slug === "montale-arabians-tonka");
  check(
    "Montale Arabians Tonka es nicho aunque su origin sea árabe",
    tonka?.universe === "nicho",
    `universe ${tonka?.universe}`
  );
  for (const slug of ["xerjoff-accento-overdose", "xerjoff-amber-gold", "xerjoff-erba-pura"]) {
    const x = PRODUCTS.find((p) => p.slug === slug);
    check(`${slug} es nicho`, x?.universe === "nicho", `universe ${x?.universe}`);
  }
  const universos = {
    disenador: PRODUCTS.filter((p) => p.universe === "disenador").length,
    nicho: PRODUCTS.filter((p) => p.universe === "nicho").length,
    arabe: PRODUCTS.filter((p) => p.universe === "arabe").length
  };
  check("233 · 179 · 23 · 31 · 0 pendientes",
    PRODUCTS.length === 233 &&
      universos.disenador === 179 &&
      universos.nicho === 23 &&
      universos.arabe === 31 &&
      PRODUCTS.every((p) => p.universe !== "pendiente"),
    `${universos.disenador} · ${universos.nicho} · ${universos.arabe}`
  );
  // Correr el lote no puede cambiar la clasificación de nadie.
  const consultaDespues = evalTs(
    'import { PRODUCTS } from "./src/data/products"; ' +
      "console.log(JSON.stringify(PRODUCTS.map((p) => p.universe)));",
    { cwd: root }
  );
  const despues = consultaDespues.ok ? JSON.parse(consultaDespues.salida) : [];
  check(
    "importar el lote no movió ningún universo",
    JSON.stringify(despues) === JSON.stringify(PRODUCTS.map((p) => p.universe))
  );
  const vipF = PRODUCTS.find((p) => p.slug === "carolina-herrera-212-vip");
  const vipM = PRODUCTS.find((p) => p.slug === "carolina-herrera-212-vip-men");
  check("212 VIP y 212 VIP Men son dos productos distintos", vipF?.slug !== vipM?.slug);
  check("212 VIP es femenino y 212 VIP Men masculino", vipF?.gender === "femenino" && vipM?.gender === "masculino");
  // Los dos quedaron cargados con el lote 20. Acá `olfactory` viaja como
  // booleano (línea 229), así que lo que se verifica es que cada uno tenga su
  // propia ficha; que los contenidos no se contaminen lo comprueba qa:catalogo,
  // que sí lee los perfiles completos.
  check(
    "212 VIP y 212 VIP Men tienen cada uno su ficha olfativa",
    vipF?.olfactory === true && vipM?.olfactory === true
  );
}

/* ================== 3bis. ESTADOS DE LA FUENTE ========================== */

console.log("\n3bis. FUENTE VERIFICADA VS. CANDIDATA\n" + "─".repeat(70));

const verificadas = registros.filter((x) => x.source?.status === "verified");
const candidatas = registros.filter((x) => x.source?.status === "candidate");

check("el lote declara el estado de todas las fuentes", verificadas.length + candidatas.length === 8);
check(
  "toda fuente verificada trae url y checkedAt",
  verificadas.every((x) => x.source.url && x.source.checkedAt),
  `${verificadas.length} verificadas`
);
check(
  "ninguna candidata ocupa source.url ni checkedAt",
  candidatas.every((x) => !x.source.url && !x.source.checkedAt && x.source.candidateUrl),
  `${candidatas.length} candidatas`
);
check(
  "la salida distingue candidata de comprobada",
  (r.salida.match(/fuente             candidate — no cuenta como procedencia/g) ?? []).length ===
    candidatas.length
);

const fuentesRotas = [
  {
    nombre: "una url sin checkedAt no pasa como verificada",
    registro: sinPerfil("afnan-9pm", {
      source: { name: "Fragrantica", url: "https://www.fragrantica.com/perfume/Afnan/9pm-65414.html" }
    }),
    espera: /Falta source\.checkedAt/i
  },
  {
    nombre: "una candidata no puede traer source.url",
    registro: sinPerfil("afnan-9pm", {
      source: {
        name: "Fragrantica",
        status: "candidate",
        url: "https://www.fragrantica.com/perfume/Afnan/9pm-65414.html",
        candidateUrl: "https://www.fragrantica.com/perfume/Afnan/9pm-65414.html"
      }
    }),
    espera: /no puede traer source\.url/i
  },
  {
    nombre: "una candidata no puede traer checkedAt",
    registro: sinPerfil("afnan-9pm", {
      source: {
        name: "Fragrantica",
        status: "candidate",
        checkedAt: "2026-09-13",
        candidateUrl: "https://www.fragrantica.com/perfume/Afnan/9pm-65414.html"
      }
    }),
    espera: /no puede traer checkedAt/i
  },
  {
    nombre: "una candidata sin candidateUrl se rechaza",
    registro: sinPerfil("afnan-9pm", { source: { name: "Fragrantica", status: "candidate" } }),
    espera: /candidata sin source\.candidateUrl/i
  },
  {
    nombre: "una candidateUrl de otra casa se rechaza igual que una url",
    registro: sinPerfil("afnan-9pm", {
      source: {
        name: "Fragrantica",
        status: "candidate",
        candidateUrl: "https://www.fragrantica.com/perfume/Armaf/9pm-1.html"
      }
    }),
    espera: /candidateUrl pertenece a "armaf"/i
  }
];

for (const caso of fuentesRotas) {
  const ruta = archivo(`fuente-${caso.nombre.slice(0, 30).replace(/[^a-z0-9]+/gi, "-")}.json`, caso.registro);
  const res = correr(["--source-file", ruta, "--solo-match", "--force"]);
  check(caso.nombre, caso.espera.test(res.salida), res.salida.slice(-180).trim());
}

// Una fuente candidata identifica, pero no habilita cargar notas.
const conNotas = {
  ...sinPerfil("armaf-mandarin-sky", {}),
  profile: {
    topNotes: ["Bergamot"],
    middleNotes: ["Jasmine"],
    baseNotes: ["Amber"],
    accords: ["Citrus", "Sweet"]
  }
};
const resCandidata = correr([
  "--source-file",
  archivo("candidata-con-notas.json", conNotas),
  "--force",
  "--dry-run"
]);
check(
  "una fuente candidata no habilita cargar notas",
  /falta comprobar la fuente/i.test(resCandidata.salida) &&
    /Cargadas: 0/.test(resCandidata.salida)
);
check(
  "y lo dice sin perder la identificación",
  /perfume detectado  Odyssey Mandarin Sky/.test(resCandidata.salida) &&
    /confidence         exact/.test(resCandidata.salida)
);
check(
  "la candidateUrl nunca se guarda como url de origen",
  !/\n\s+URL                https/.test(bloque(resCandidata.salida, "Armaf Mandarin Sky"))
);
check(
  "ninguna candidateUrl llega al bundle público",
  !readFileSync(join(root, "dist-preview/index.html"), "utf8").includes("candidateUrl")
);

/* ==================== 4. PERFORMANCE Y ESCRITURAS ====================== */

console.log("\n4. PERFORMANCE Y ESCRITURAS\n" + "─".repeat(70));

check(
  "los 8 declaran noxPerformance NO MODIFICADO",
  (r.salida.match(/noxPerformance     NO MODIFICADO/g) ?? []).length === 8
);
check("la corrida cierra confirmando la guardia", /noxPerformance: NO MODIFICADO/.test(r.salida));
check("el modo sólo-match nunca escribe", /no se escribió ningún archivo/.test(r.salida));
check(
  "ningún registro del lote trae campos de performance",
  !JSON.stringify(registros).match(/longevity|projection|sillage|performanceIntensity|testedAt/)
);
check(
  "ningún registro del lote trae texto editorial de terceros",
  !JSON.stringify(registros).match(/"description"|"reviews"|"votes"|"rating"/)
);
check(
  "no se usó --rewrite-copy",
  !r.salida.includes("regenerada desde los acordes")
);

rmSync(tmp, { recursive: true, force: true });

console.log("\n" + "─".repeat(70));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
