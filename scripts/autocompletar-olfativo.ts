/**
 * AUTOCOMPLETADO DE INFORMACIÓN OLFATIVA
 *
 * Dos caminos de entrada, un solo pipeline:
 *
 *   A) FUENTE REMOTA
 *      producto NOX → marca de referencia → índice real de esa casa →
 *      match de variante validado → ficha → datos estructurados
 *
 *   B) ENTRADA ESTRUCTURADA  (--source-file archivo.json)
 *      producto NOX → registro del archivo → validación de schema →
 *      match de variante validado → datos estructurados
 *
 * Desde ahí en adelante los dos caminos son el MISMO código: normalización,
 * traducción, familia, carácter aromático, schema y guardias. No hay dos
 * sistemas de datos.
 *
 * Cuando la fuente remota devuelve 403 u otro error, el producto queda
 * needsReview y se usa el camino B. No se implementa ningún bypass: ni proxies,
 * ni rotación de IP, ni headless, ni cookies de sesión ajenas.
 *
 * Reglas duras:
 *   · El match se valida contra la lista REAL de fragancias de esa casa.
 *     Nunca se busca por texto libre.
 *   · Si el match no es exacto o normalizado → no se autocompleta:
 *     queda needsReview con los candidatos anotados.
 *   · Si la ficha no devuelve notas → no se inventa nada: needsReview.
 *   · Si alguna nota no está en el diccionario → se conserva el original y
 *     el producto queda needsReview (no se traduce a ojo).
 *   · No se copia texto editorial de la fuente. La redacción es propia.
 *   · GUARDIA DURA: este script puede escribir olfactoryProfile
 *     (notas, acordes, familias, carácter aromático) y NUNCA noxPerformance.
 *     La duración, la proyección y la estela del extracto NOX se miden, no se
 *     deducen: viven en src/data/nox-performance.ts y este script las deja
 *     intactas. Hay un chequeo de integridad al cerrar la corrida.
 *
 * Uso:
 *   npm run olfativo -- --limit 20            cargar 20 pendientes
 *   npm run olfativo -- --brand "Lattafa"     una sola casa
 *   npm run olfativo -- --only lattafa-yara   fragancias puntuales
 *   npm run olfativo -- --dry-run             no escribe, sólo informa
 *   npm run olfativo -- --force               recarga las ya cargadas
 *   npm run olfativo -- --rewrite-copy        además regenera la redacción
 *   npm run olfativo -- --solo-match          prueba el matcher sin datos olfativos
 *   npm run olfativo -- --only lattafa-yara --source-file data/import/yara.json --dry-run
 *                                             entrada estructurada (un registro o un lote)
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PRODUCTS } from "../src/data/products";
import { OLFACTORY_PROFILES } from "../src/data/olfactory";
import { OLFACTORY_SOURCES } from "../src/data/olfactory.sources";
import {
  BRAND_SLUGS,
  PRODUCT_BRAND_OVERRIDES,
  aromaticIntensityFromAccords,
  buildFeel,
  buildLikeIf,
  familiesFromAccords,
  matchVariant,
  parseDesignerIndex,
  parsePerfumePage,
  translateAccord,
  translateNote
} from "./lib/fragrantica.mjs";
import { writeOlfactoryFiles } from "./lib/emit.mjs";
// @ts-expect-error — módulo .mjs compartido con los scripts de datos
import {
  indexImportRecords,
  readImportFile,
  validateImportRecord
} from "./lib/import-olfativo.mjs";
// @ts-expect-error — módulo .mjs compartido con los scripts de datos
import { mergeRevisionLedger, resumirMerge } from "./lib/revision-ledger.mjs";

/* ------------------------------------------------------------------ args -- */

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const value = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const list = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) return [];
  const out: string[] = [];
  for (let j = i + 1; j < argv.length && !argv[j].startsWith("--"); j++) out.push(argv[j]);
  return out;
};

const LIMIT = Number(value("limit") ?? 0) || Infinity;
const ONLY = list("only");
const BRAND = value("brand");
const DRY = flag("dry-run") || argv.includes("--solo-match");
const FORCE = flag("force");
const DELAY = Number(value("delay") ?? 1500);
/** Archivo JSON con información olfativa estructurada (camino B). */
const SOURCE_FILE = value("source-file");
/**
 * Por defecto, recargar una fragancia ya cargada NO pisa la redacción ni la
 * ocasión/clima que se revisaron a mano: sólo actualiza notas, acordes, familia
 * y carácter. Con --rewrite-copy se regenera también la redacción automática.
 */
const REWRITE_COPY = flag("rewrite-copy");
/**
 * Sólo-match: valida identidad, marca, variante y URL y corre el matcher, sin
 * exigir datos olfativos. Sirve para probar el matcher contra un lote antes de
 * tener las notas. Nunca escribe: implica dry-run.
 */
const SOLO_MATCH = flag("solo-match");

const BASE = "https://www.fragrantica.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";
/**
 * Caché de páginas ya consultadas. Se puede redirigir con NOX_CACHE_DIR, que es
 * lo que usa el test offline del pipeline (scripts/qa-olfativo.mjs).
 */
const CACHE = process.env.NOX_CACHE_DIR ?? ".cache/referencia";

/* ----------------------------------------------------------------- fetch -- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function cachePath(url: string): string {
  return `${CACHE}/${url.replace(/[^a-z0-9]+/gi, "_").slice(-160)}.html`;
}

async function getHtml(url: string): Promise<string | null> {
  mkdirSync(CACHE, { recursive: true });
  const file = cachePath(url);
  if (existsSync(file)) return readFileSync(file, "utf8");

  await sleep(DELAY);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" }
    });
    if (!res.ok) {
      console.log(`    · HTTP ${res.status} en ${url}`);
      return null;
    }
    const html = await res.text();
    // En dry-run no se escribe nada en disco, ni siquiera la caché.
    if (!DRY) writeFileSync(file, html);
    return html;
  } catch (error) {
    console.log(`    · red: ${(error as Error).message}`);
    return null;
  }
}

/* ----------------------------------------------------------------- índice -- */

const indexCache = new Map<string, { name: string; url: string }[]>();

async function designerIndex(house: string, override?: string) {
  const brand = override ?? house;
  const slug =
    (BRAND_SLUGS as Record<string, string>)[brand] ?? brand.replace(/[^A-Za-z0-9]+/g, "-");
  if (indexCache.has(slug)) return { slug, brand, entries: indexCache.get(slug)! };

  const html = await getHtml(`${BASE}/designers/${slug}.html`);
  const entries = html ? parseDesignerIndex(html) : [];
  indexCache.set(slug, entries);
  return { slug, brand, entries };
}

/* --------------------------------------------------- entrada estructurada -- */

/** Registros del archivo JSON, indexados por productSlug. Vacío sin --source-file. */
let IMPORTS = new Map<string, Record<string, unknown>>();
let IMPORTS_REPETIDOS: string[] = [];

if (SOURCE_FILE) {
  // Un JSON roto o vacío corta acá: es un error del operador, no un needsReview.
  const registros = readImportFile(SOURCE_FILE) as Record<string, unknown>[];
  const { porSlug, repetidos } = indexImportRecords(registros);
  IMPORTS = porSlug;
  IMPORTS_REPETIDOS = repetidos;
}

/* ------------------------------------------------------------- selección -- */

let targets = PRODUCTS.filter((p) => (FORCE ? true : !OLFACTORY_PROFILES[p.slug]));
if (ONLY.length > 0) targets = PRODUCTS.filter((p) => ONLY.includes(p.slug));
else if (BRAND) targets = targets.filter((p) => p.house === BRAND);

// Con archivo de entrada, el archivo manda: sólo se procesan sus productos.
if (SOURCE_FILE) {
  const delArchivo = [...IMPORTS.keys()];
  targets =
    ONLY.length > 0
      ? targets.filter((p) => IMPORTS.has(p.slug))
      : PRODUCTS.filter((p) => delArchivo.includes(p.slug));
}

targets = targets.slice(0, LIMIT === Infinity ? undefined : LIMIT);

console.log(`\nAUTOCOMPLETADO OLFATIVO`);
console.log("─".repeat(66));
console.log(`Entrada: ${SOURCE_FILE ? `archivo estructurado (${SOURCE_FILE})` : "fuente remota"}`);
if (SOLO_MATCH) console.log("Modo: sólo-match (verifica identificación, no carga datos, no escribe)");
if (SOURCE_FILE) {
  console.log(`Registros en el archivo: ${IMPORTS.size}`);
  const huerfanos = [...IMPORTS.keys()].filter((slug) => !PRODUCTS.some((p) => p.slug === slug));
  if (huerfanos.length > 0) {
    console.log(`Registros sin producto en el catálogo: ${huerfanos.join(", ")}  ← se rechazan`);
  }
  if (IMPORTS_REPETIDOS.length > 0) {
    console.log(`Productos repetidos en el archivo: ${IMPORTS_REPETIDOS.join(", ")}  ← se usa el primero`);
  }
}
console.log(`Objetivo: ${targets.length} fragancias${DRY ? "  (dry-run: no escribe)" : ""}`);
console.log(`Ya cargadas: ${Object.keys(OLFACTORY_PROFILES).length} / ${PRODUCTS.length}\n`);

/* ------------------------------------------------------------- resultado -- */

async function main() {

  const profiles: Record<string, unknown> = { ...OLFACTORY_PROFILES };
  const sources: Record<string, unknown> = { ...OLFACTORY_SOURCES };
  const revision: Record<string, unknown>[] = [];
  // Alcance de ESTA corrida: todo producto que llegó a evaluarse, haya quedado
  // pendiente o no. El ledger sólo puede borrar entradas de slugs de acá.
  const procesados = new Set<string>();
  const hoy = new Date().toISOString().slice(0, 10);

  let cargadas = 0;
  let paraRevisar = 0;

  for (const product of targets) {
    procesados.add(product.slug);
    const nombre = product.inspiredBy;
    const reviewKey = `${product.house} — ${nombre.replace(`${product.house} `, "")}`;
    const override = (PRODUCT_BRAND_OVERRIDES as Record<string, string>)[reviewKey];

    process.stdout.write(`· ${nombre}\n`);

    const nombreSinCasa = nombre.replace(`${product.house} `, "");

    /** Datos estructurados listos para el tramo común del pipeline. */
    let brand = "";
    let ref: { name: string; url: string } | null = null;
    let confidence = "not-found";
    let parsed: {
      topNotes: string[];
      middleNotes: string[];
      baseNotes: string[];
      accords: string[];
      mainNotes?: string[];
    } | null = null;
    let origen: "remoto" | "archivo" = SOURCE_FILE ? "archivo" : "remoto";
    let checkedAt = hoy;
    let notaFuente = "";
    let nombreFuente = "Fragrantica";
    let fuenteEsCandidata = false;
    let urlCandidataRegistro = "";
    let avisos: string[] = [];

    /* ============================ CAMINO B: archivo ===================== */

    if (SOURCE_FILE) {
      const registro = IMPORTS.get(product.slug);

      if (!registro) {
        paraRevisar++;
        revision.push({
          slug: product.slug,
          producto: nombre,
          motivo: "el archivo de entrada no trae un registro para este producto"
        });
        console.log("    → sin registro en el archivo de entrada · needsReview");
        continue;
      }

      const marcaEsperada = override ?? product.house;
      const validado = validateImportRecord(registro, product, {
        marcaEsperada,
        soloMatch: SOLO_MATCH
      });

      if (validado.errores.length > 0) {
        paraRevisar++;
        sources[product.slug] = {
          name: (registro.source as { name?: string })?.name ?? "Entrada estructurada",
          url: (registro.source as { url?: string })?.url ?? "",
          checkedAt: hoy,
          status: "secondary",
          matchedBrand: validado.brand ?? "",
          matchedName: "",
          matchConfidence: "not-found",
          needsReview: true,
          note: `Registro rechazado: ${validado.errores.join(" ")}`
        };
        revision.push({
          slug: product.slug,
          producto: nombre,
          motivo: "registro de importación inválido",
          detalle: validado.errores
        });
        console.log(`    → registro inválido · needsReview`);
        for (const e of validado.errores) console.log(`       · ${e}`);
        continue;
      }

      brand = validado.brand;
      avisos = validado.avisos;

      // Una URL candidata sirve para identificar y para dejar anotado por dónde
      // seguir, pero NO es procedencia: nunca ocupa el campo url del registro.
      const urlCandidata = validado.source.candidateUrl ?? "";
      const urlComprobada = validado.source.url ?? "";
      const urlParaMatch = urlComprobada || urlCandidata;
      const fuenteCandidata = validado.source.status === "candidate";

      // El operador declaró que no pudo determinar la referencia, o el género de
      // la ficha contradice al del producto. En los dos casos el sistema se
      // DETIENE: queda anotado y no se carga una sola nota.
      const motivoParada = validado.declaraRevision
        ? validado.razonDeclarada
        : validado.conflictoGenero;

      if (motivoParada) {
        paraRevisar++;
        sources[product.slug] = {
          name: validado.source.name,
          url: urlComprobada,
          ...(urlCandidata ? { candidateUrl: urlCandidata } : {}),
          urlStatus: fuenteCandidata ? "candidate" : "verified",
          checkedAt: validado.source.checkedAt ?? null,
          status: "secondary",
          matchedBrand: validado.brand,
          matchedName: "",
          matchConfidence: "ambiguous",
          needsReview: true,
          intake: "archivo",
          note: motivoParada
        };
        revision.push({
          slug: product.slug,
          producto: nombre,
          motivo: validado.declaraRevision
            ? "declarado para revisión en el archivo"
            : "el género de la referencia no coincide con el del producto",
          detalle: [motivoParada]
        });
        console.log("");
        console.log(`    ${"producto NOX".padEnd(18)} ${nombre}`);
        console.log(`    ${"entrada".padEnd(18)} archivo estructurado (${SOURCE_FILE})`);
        console.log(`    ${"marca detectada".padEnd(18)} ${validado.brand}`);
        console.log(`    ${"perfume detectado".padEnd(18)} — (sin referencia confirmada)`);
        console.log(
          `    ${(fuenteCandidata ? "URL candidata" : "URL").padEnd(18)} ${urlParaMatch || "—"}`
        );
        console.log(
          `    ${"fuente".padEnd(18)} ${fuenteCandidata ? "candidate — no cuenta como procedencia" : "verified"}`
        );
        console.log(`    ${"confidence".padEnd(18)} ambiguous`);
        console.log(`    ${"estado".padEnd(18)} needsReview`);
        console.log(`    ${"motivo".padEnd(18)} ${motivoParada}`);
        console.log(`    ${"¿qué escribe?".padEnd(18)} NADA — sólo la anotación de revisión`);
        console.log(`    ${"noxPerformance".padEnd(18)} NO MODIFICADO`);
        console.log("");
        continue;
      }

      checkedAt = validado.source.checkedAt ?? hoy;
      nombreFuente = validado.source.name;
      notaFuente = validado.note ?? "";

      // MISMO matcher que el camino remoto: la variante declarada tiene que
      // coincidir con la del catálogo. "Yara Candy" no pasa por "Yara".
      // El género del producto se pasa para que, cuando la casa use el mismo
      // nombre en masculino y femenino, el alias correcto sea el de ese género
      // y no pueda tocar al otro producto. Sin entrada en la tabla no cambia nada.
      const match = matchVariant(
        nombreSinCasa,
        brand,
        [{ name: validado.referenceName, url: urlParaMatch }],
        product.gender
      );

      if (!match.candidate) {
        paraRevisar++;
        sources[product.slug] = {
          name: validado.source.name,
          url: urlComprobada,
          ...(urlCandidata ? { candidateUrl: urlCandidata } : {}),
          urlStatus: fuenteCandidata ? "candidate" : "verified",
          checkedAt,
          status: "secondary",
          matchedBrand: brand,
          matchedName: "",
          matchConfidence: match.confidence,
          needsReview: true,
          candidates: [validado.referenceName],
          note:
            `La variante del archivo ("${validado.referenceName}") no coincide con ` +
            `"${nombreSinCasa}". No se cargó ninguna nota.`
        };
        revision.push({
          slug: product.slug,
          producto: nombre,
          motivo: `variante del archivo no coincide (${match.confidence})`,
          detalle: [validado.referenceName]
        });
        console.log(
          `    → variante "${validado.referenceName}" ≠ "${nombreSinCasa}" · ${match.confidence} · needsReview`
        );
        continue;
      }

      ref = match.candidate as { name: string; url: string };
      confidence = match.confidence;
      parsed = validado.parsed;
      fuenteEsCandidata = fuenteCandidata;
      urlCandidataRegistro = urlCandidata;

      // Identificación correcta, pero la fuente todavía no se comprobó: no se
      // cargan notas atribuidas a una URL que nadie abrió.
      if (!SOLO_MATCH && fuenteCandidata) {
        paraRevisar++;
        sources[product.slug] = {
          name: validado.source.name,
          url: "",
          candidateUrl: urlCandidata,
          urlStatus: "candidate",
          checkedAt: null,
          status: "secondary",
          matchedBrand: brand,
          matchedName: ref.name,
          matchConfidence: confidence,
          needsReview: true,
          intake: "archivo",
          note:
            "La referencia se identificó, pero la URL es candidata y no está comprobada. " +
            "No se cargan notas hasta confirmarla (source.status verified + checkedAt)."
        };
        revision.push({
          slug: product.slug,
          producto: nombre,
          motivo: "fuente candidata sin comprobar",
          detalle: [urlCandidata]
        });
        console.log("");
        console.log(`    ${"producto NOX".padEnd(18)} ${nombre}`);
        console.log(`    ${"marca detectada".padEnd(18)} ${brand}`);
        console.log(`    ${"perfume detectado".padEnd(18)} ${ref.name}`);
        console.log(`    ${"URL candidata".padEnd(18)} ${urlCandidata}`);
        console.log(`    ${"fuente".padEnd(18)} candidate — no cuenta como procedencia`);
        console.log(`    ${"confidence".padEnd(18)} ${confidence}`);
        console.log(`    ${"estado".padEnd(18)} needsReview`);
        console.log(`    ${"¿qué escribe?".padEnd(18)} NADA — falta comprobar la fuente`);
        console.log(`    ${"noxPerformance".padEnd(18)} NO MODIFICADO`);
        console.log("");
        continue;
      }

      if (SOLO_MATCH) {
        cargadas++;
        console.log("");
        console.log(`    ${"producto NOX".padEnd(18)} ${nombre}`);
        console.log(`    ${"entrada".padEnd(18)} archivo estructurado (${SOURCE_FILE})`);
        console.log(`    ${"marca detectada".padEnd(18)} ${brand}`);
        console.log(`    ${"perfume detectado".padEnd(18)} ${ref.name}`);
        console.log(
          `    ${(fuenteCandidata ? "URL candidata" : "URL").padEnd(18)} ${ref.url || "—"}`
        );
        console.log(
          `    ${"fuente".padEnd(18)} ${fuenteCandidata ? "candidate — no cuenta como procedencia" : "verified"}`
        );
        console.log(`    ${"confidence".padEnd(18)} ${confidence}`);
        console.log(`    ${"estado".padEnd(18)} identificado`);
        if (validado.referenceGender) {
          console.log(`    ${"género referencia".padEnd(18)} ${validado.referenceGender} · coincide con el producto`);
        }
        console.log(`    ${"datos olfativos".padEnd(18)} pendientes — este modo sólo verifica la identificación`);
        console.log(`    ${"¿qué escribe?".padEnd(18)} NADA — modo sólo-match`);
        console.log(`    ${"noxPerformance".padEnd(18)} NO MODIFICADO`);
        console.log("");
        continue;
      }
    }

    /* ============================ CAMINO A: remoto ====================== */

    if (!SOURCE_FILE) {
      const indice = await designerIndex(product.house, override);
      brand = indice.brand;

      if (indice.entries.length === 0) {
        paraRevisar++;
        const registro = {
          name: "Fragrantica",
          url: `${BASE}/designers/${indice.slug}.html`,
          checkedAt: hoy,
          status: "secondary" as const,
          matchedBrand: brand,
          matchedName: "",
          matchConfidence: "not-found" as const,
          needsReview: true,
          note:
            `No se pudo leer el índice de la casa (${indice.slug}). ` +
            "Si la fuente respondió 403, usar --source-file con los datos estructurados."
        };
        sources[product.slug] = registro;
        revision.push({ slug: product.slug, producto: nombre, motivo: registro.note });
        console.log(`    → índice de casa no disponible · needsReview`);
        console.log(`       Alternativa sin evadir nada: --source-file <archivo.json>`);
        continue;
      }

      const match = matchVariant(nombreSinCasa, brand, indice.entries, product.gender);

      if (!match.candidate) {
        paraRevisar++;
        sources[product.slug] = {
          name: "Fragrantica",
          url: `${BASE}/designers/${indice.slug}.html`,
          checkedAt: hoy,
          status: "secondary",
          matchedBrand: brand,
          matchedName: "",
          matchConfidence: match.confidence,
          needsReview: true,
          candidates: match.candidates,
          note: "Match no concluyente: no se cargó ninguna nota."
        };
        revision.push({
          slug: product.slug,
          producto: nombre,
          motivo: `match ${match.confidence}`,
          candidatos: match.candidates
        });
        console.log(`    → ${match.confidence} · candidatos: ${match.candidates.join(" | ") || "—"}`);
        continue;
      }

      ref = match.candidate as { name: string; url: string };
      confidence = match.confidence;

      const html = await getHtml(ref.url);
      parsed = html ? parsePerfumePage(html) : null;

      if (!parsed) {
        paraRevisar++;
        sources[product.slug] = {
          name: "Fragrantica",
          url: ref.url,
          checkedAt: hoy,
          status: "secondary",
          matchedBrand: brand,
          matchedName: ref.name,
          matchConfidence: confidence,
          needsReview: true,
          note: "El match fue correcto pero no se pudieron extraer notas de la ficha."
        };
        revision.push({ slug: product.slug, producto: nombre, motivo: "ficha sin notas legibles" });
        console.log(`    → ${ref.name} · sin notas legibles · needsReview`);
        continue;
      }
    }

    if (!ref || !parsed) continue; // inalcanzable: los caminos ya hicieron continue

    /* --- traducción: lo que no está en el diccionario no se traduce a ojo --- */
    const sinTraducir: string[] = [];
    const tr = (notes: string[]) =>
      notes.map((n) => {
        const es = translateNote(n);
        if (!es) sinTraducir.push(n);
        return es ?? n;
      });

    const topNotes = tr(parsed.topNotes);
    const middleNotes = tr(parsed.middleNotes);
    const baseNotes = tr(parsed.baseNotes);

    const accords = parsed.accords.map((a: string) => {
      const es = translateAccord(a);
      if (!es) sinTraducir.push(a);
      return es ?? a;
    });

    const families = familiesFromAccords(parsed.accords);
    const caracter = aromaticIntensityFromAccords(parsed.accords) as string | null;

    const sinRepetir = (notas: string[]) =>
      notas.filter(Boolean).filter((n, i, a) => a.indexOf(n) === i);

    /**
     * NOTAS PRINCIPALES — dos casos distintos, a propósito.
     *
     *   · DECLARADAS por la fuente: son dato, no resumen. Se traducen, se
     *     deduplican y se conservan TODAS, en el orden en que vinieron. No se
     *     recortan: descartar dato de origen por una decisión de presentación
     *     sería perder información que después no se puede recuperar.
     *   · DERIVADAS de la pirámide cuando la fuente no las declara: ahí sí es
     *     un resumen que arma NOX, y mantiene el tope histórico de 5.
     *
     * Cuántas se muestran es problema de la UI: ProductCard ya recorta a 3.
     */
    const declaradas = sinRepetir(tr(parsed.mainNotes ?? []));
    const mainNotes =
      declaradas.length > 0
        ? declaradas
        : sinRepetir([topNotes[0], middleNotes[0], baseNotes[0], baseNotes[1]]).slice(0, 5);

    // Lo que ya estaba cargado y revisado a mano no se pisa en una recarga.
    const previo = (OLFACTORY_PROFILES as Record<string, {
      occasions?: unknown[];
      seasons?: unknown[];
      feel?: string;
      likeIf?: string[];
    }>)[product.slug];
    const conservaCopy = Boolean(previo) && !REWRITE_COPY;

    profiles[product.slug] = {
      family: families[0] ?? null,
      families,
      accords,
      topNotes,
      middleNotes,
      baseNotes,
      mainNotes,
      // Ocasión y clima no se derivan de la fuente: quedan vacíos hasta que
      // alguien los cargue con criterio, y una recarga no los borra.
      occasions: previo?.occasions ?? [],
      seasons: previo?.seasons ?? [],
      // Carácter aromático: derivado de los acordes con criterio uniforme.
      // Es CÓMO SE PERCIBE la composición, no cuánto dura ni cuánto proyecta.
      aromaticIntensity: caracter,
      feel:
        conservaCopy && previo?.feel
          ? previo.feel
          : buildFeel({ slug: product.slug, topNotes, middleNotes, baseNotes, mainNotes, accords, families }),
      likeIf:
        conservaCopy && previo?.likeIf?.length
          ? previo.likeIf
          : buildLikeIf({ slug: product.slug, topNotes, middleNotes, baseNotes, mainNotes, accords, families })
    };

    const necesitaRevision = sinTraducir.length > 0 || families.length === 0;
    const notas = [
      ...(sinTraducir.length > 0
        ? [`Sin traducción: ${[...new Set(sinTraducir)].join(", ")}`]
        : []),
      ...(families.length === 0
        ? ["No se pudo derivar la familia olfativa desde los acordes."]
        : []),
      ...avisos,
      ...(notaFuente ? [notaFuente] : [])
    ];
    sources[product.slug] = {
      // El nombre de la fuente sale del archivo cuando la entrada es
      // estructurada; la procedencia se registra igual en los dos caminos.
      name: origen === "archivo" ? nombreFuente : "Fragrantica",
      url: fuenteEsCandidata ? "" : ref.url,
      ...(urlCandidataRegistro ? { candidateUrl: urlCandidataRegistro } : {}),
      urlStatus: fuenteEsCandidata ? "candidate" : "verified",
      checkedAt,
      status: "secondary",
      matchedBrand: brand,
      matchedName: ref.name,
      matchConfidence: confidence,
      needsReview: necesitaRevision,
      /** "remoto" = leído por el script · "archivo" = entrada estructurada validada. */
      intake: origen,
      ...(notas.length > 0 ? { note: notas.join(" ") } : {}),
      // La redacción sensorial se compuso automáticamente desde los acordes:
      // conviene pasarle el ojo editorial de NOX.
      copy: "auto"
    };

    cargadas++;
    if (necesitaRevision) {
      paraRevisar++;
      revision.push({
        slug: product.slug,
        producto: nombre,
        motivo: sinTraducir.length ? "notas sin traducir" : "familia no derivable",
        detalle: [...new Set(sinTraducir)]
      });
    }

      const linea = (etiqueta: string, valor: string) =>
      console.log(`    ${etiqueta.padEnd(18)} ${valor || "—"}`);

    console.log("");
    linea("producto NOX", nombre);
    linea("entrada", origen === "archivo" ? `archivo estructurado (${SOURCE_FILE})` : "fuente remota");
    linea("marca detectada", brand);
    linea("perfume detectado", ref.name);
    linea("URL", ref.url);
    linea("confidence", confidence);
    linea("notas de salida", topNotes.join(", "));
    linea("notas de corazón", middleNotes.join(", "));
    linea("notas de fondo", baseNotes.join(", "));
    linea(
      "notas principales",
      `${mainNotes.join(", ")}${declaradas.length > 0 ? "  (declaradas por la fuente)" : "  (resumen derivado)"}`
    );
    linea("acordes", accords.join(", "));
    linea("familia", families.join(" · "));
    linea("carácter aromático", caracter ?? "— (no inferible desde los acordes)");
    if (previo) {
      linea(
        "redacción",
        conservaCopy
          ? "se conserva la ya revisada (usar --rewrite-copy para regenerarla)"
          : "regenerada desde los acordes (--rewrite-copy)"
      );
    }
    if (sinTraducir.length > 0) {
      linea("sin traducir", [...new Set(sinTraducir)].join(", "));
    }
    for (const aviso of avisos) linea("aviso", aviso);
    linea(
      "¿qué escribe?",
      DRY
        ? "NADA — dry-run"
        : conservaCopy
          ? "olfactoryProfile: notas, acordes, familias y carácter (conserva redacción, ocasión y clima)"
          : "olfactoryProfile (notas, acordes, familias, carácter, redacción) + procedencia"
    );
    linea(
      "¿escribe datos?",
      DRY
        ? "NO — dry-run"
        : necesitaRevision
          ? "sí, pero queda needsReview"
          : "sí"
    );
    linea("noxPerformance", "NO MODIFICADO");
    console.log("");
  }

  /* -------------------------------------------------- guardia de performance */

  // Ningún perfil puede llevar campos de performance. Si alguna vez alguien
  // agrega un parser que los devuelva, la corrida se corta acá.
  const PROHIBIDOS = [
    "noxPerformance",
    "performance",
    "longevity",
    "projection",
    "sillage",
    "performanceIntensity",
    "testedAt",
    "duracion",
    "duration"
  ];
  for (const [slug, perfil] of Object.entries(profiles)) {
    const invasores = Object.keys(perfil as Record<string, unknown>).filter((k) =>
      PROHIBIDOS.includes(k)
    );
    if (invasores.length > 0) {
      throw new Error(
        `El perfil de ${slug} intentó escribir performance (${invasores.join(", ")}). ` +
          "La performance NOX se mide y vive en src/data/nox-performance.ts."
      );
    }
  }

  const PERF_FILE = "src/data/nox-performance.ts";
  const hashPerf = () => createHash("sha1").update(readFileSync(PERF_FILE)).digest("hex");
  const perfAntes = hashPerf();

  /* ------------------------------------------------------------- escritura -- */

  console.log("\n" + "─".repeat(66));
  console.log(
    SOLO_MATCH
      ? `Identificadas: ${cargadas}   ·   Para revisar: ${paraRevisar}`
      : `Cargadas: ${cargadas}   ·   Para revisar: ${paraRevisar}`
  );

  if (DRY) {
    console.log("\ndry-run: no se escribió ningún archivo.");
  } else {
    writeOlfactoryFiles(profiles, sources);
    mkdirSync("data-review", { recursive: true });

    // El ledger es acumulativo: esta corrida sólo puede tocar los slugs que
    // procesó. Lo de otros lotes se preserva. Ver scripts/lib/revision-ledger.mjs.
    const LEDGER = "data-review/revision.json";
    let ledgerPrevio: Record<string, unknown>[] = [];
    if (existsSync(LEDGER)) {
      try {
        const leido = JSON.parse(readFileSync(LEDGER, "utf8"));
        if (!Array.isArray(leido)) {
          throw new Error(`${LEDGER} no contiene un array. No se escribe el ledger.`);
        }
        ledgerPrevio = leido;
      } catch (error) {
        throw new Error(
          `No se pudo leer ${LEDGER} (${(error as Error).message}). ` +
            "Se aborta antes de sobrescribir revisiones pendientes."
        );
      }
    }

    const ledger = mergeRevisionLedger(ledgerPrevio, revision, procesados);
    const resumen = resumirMerge(ledgerPrevio, ledger);
    const fueraDeAlcance = ledgerPrevio.filter(
      (e) => typeof e?.slug === "string" && !procesados.has(e.slug as string)
    ).length;

    writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
    console.log("\nEscrito:");
    console.log("  src/data/olfactory.ts");
    console.log("  src/data/olfactory.sources.ts");
    console.log(`  ${LEDGER}  (${ledger.length} entradas)`);
    console.log(`    previas conservadas fuera de este lote   ${fueraDeAlcance}`);
    console.log(`    actualizadas / nuevas de este lote       ${resumen.agregadas.length + resumen.preservadas.length}`);
    console.log(
      `    resueltas (se eliminan del ledger)       ${resumen.resueltas.length}` +
        (resumen.resueltas.length > 0 ? `  → ${resumen.resueltas.join(", ")}` : "")
    );
    console.log("\nRevisá con:  npm run datos");
  }

  if (hashPerf() !== perfAntes) {
    throw new Error(`${PERF_FILE} cambió durante el autocompletado. No debería pasar nunca.`);
  }
  console.log("\nnoxPerformance: NO MODIFICADO");
}

main().catch((error) => {
  console.error("\nFalló el autocompletado:", (error as Error).message);
  process.exit(1);
});
