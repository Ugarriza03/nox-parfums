/**
 * CATÁLOGO DERIVADO
 *
 * Expande el catálogo maestro (catalog.raw.ts) en objetos Product completos,
 * cruzándolo con la clasificación de universo (brands.ts) y los datos
 * olfativos verificados (olfactory.ts).
 *
 * Esta es la capa que consume toda la app. Cuando el catálogo migre a una base
 * de datos o un CMS, sólo hay que reemplazar la fuente de `RAW_CATALOG`
 * manteniendo la forma de `Product`.
 */

import { RAW_CATALOG } from "./catalog.raw";
import { HOUSE_UNIVERSE } from "./brands";
import { OLFACTORY_PROFILES } from "./olfactory";
import { getPerformance } from "./nox-performance";
import { PRODUCT_ID_REGISTRY } from "./product-ids";
import {
  assignStableSlugs,
  collectDrafts,
  slugify,
  type Draft
} from "./product-identity";
import type { Family, Occasion, Product, Universe } from "./types";

/* ------------------------------------------------------------- identidad */

// El slug ya no se calcula acá: sale del registro congelado (product-ids.ts)
// a través de product-identity.ts. `slugify` se re-exporta para no romper a
// quien lo importaba desde este módulo.
export { slugify };

/**
 * PRECEDENCIA DE UNIVERSO COMERCIAL — una sola regla, en un solo lugar.
 *
 *   1. Clasificación explícita de la casa en HOUSE_UNIVERSE. Gana siempre.
 *   2. Si la casa no está clasificada, el `origin` del catálogo maestro actúa
 *      como respaldo: origin "arabe" → universo "arabe".
 *   3. Si no hay ninguna de las dos, queda "pendiente".
 *
 * Por qué en este orden: `origin` describe de qué bloque del catálogo maestro
 * salió la fragancia —es procedencia, dato histórico—, mientras HOUSE_UNIVERSE
 * es la decisión comercial de NOX sobre cómo se navega la marca. Cuando existe
 * una decisión comercial explícita, la procedencia no puede pisarla: Montale y
 * Xerjoff son casas de nicho aunque hayan entrado por el bloque Árabes.
 *
 * El catálogo maestro NO se reorganiza por esto: `origin` sigue diciendo la
 * verdad sobre de dónde salió cada fragancia, y la clasificación comercial vive
 * en un solo lugar (brands.ts). Duplicar el dato en los dos archivos sería
 * tener dos fuentes de verdad que pueden divergir.
 */
function resolveUniverse(draft: Draft): Universe {
  const comercial = HOUSE_UNIVERSE[draft.house];
  if (comercial && comercial !== "pendiente") return comercial;
  if (draft.origin === "arabe") return "arabe";
  return "pendiente";
}

function buildProducts(): Product[] {
  // Cada fragancia recibe el slug de su entrada en el registro. Un homónimo
  // nuevo (otro género) ya no puede renombrar a los existentes: ver
  // product-identity.ts y la prueba npm run qa:ids.
  const drafts = assignStableSlugs(collectDrafts(RAW_CATALOG), PRODUCT_ID_REGISTRY);

  return drafts.map((draft) => {
    const slug = draft.slug;
    const olfactory = OLFACTORY_PROFILES[slug] ?? null;

    return {
      id: slug,
      slug,
      inspiredBy: `${draft.house} ${draft.name}`,
      house: draft.house,
      inspiredLabel: `Inspirado en ${draft.house} ${draft.name}`,
      gender: draft.gender,
      origin: draft.origin,
      universe: resolveUniverse(draft),
      olfactory,
      // Capa aparte: sin prueba NOX queda verified:false y la ficha no afirma
      // nada de duración, proyección ni estela.
      performance: getPerformance(slug),
      dataStatus: olfactory ? "verificado" : "pendiente",
      image: null
    } satisfies Product;
  });
}

export const PRODUCTS: Product[] = buildProducts();

export const PRODUCTS_BY_SLUG: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.slug, p])
);

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS_BY_SLUG[slug];
}

/* --------------------------------------------------------------- selección */

/**
 * Fragancias destacadas de la home.
 * Se eligen a mano entre las que tienen información olfativa verificada,
 * buscando cubrir perfiles distintos. Editar libremente.
 */
export const FEATURED_SLUGS = [
  "christian-dior-sauvage",
  "carolina-herrera-good-girl",
  "lattafa-khamrah",
  "chanel-bleu-de-chanel",
  "maison-francis-kurkdjian-baccarat-rouge-540",
  "yves-saint-laurent-black-opium"
];

export const FEATURED_PRODUCTS: Product[] = FEATURED_SLUGS.map(
  (slug) => PRODUCTS_BY_SLUG[slug]
).filter(Boolean);

/** Productos con perfil verificado: son los que puede recomendar el asesor. */
export const VERIFIED_PRODUCTS = PRODUCTS.filter((p) => p.olfactory !== null);

/** Productos con performance PROBADA POR NOX. Hoy es un subconjunto vacío. */
export const PERFORMANCE_TESTED_PRODUCTS = PRODUCTS.filter((p) => p.performance.verified);

/* ------------------------------------------------------------ agregaciones */

export function countBy<T extends string>(
  items: Product[],
  pick: (p: Product) => T | T[]
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const value = pick(item);
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}

export const UNIVERSE_COUNTS = countBy(PRODUCTS, (p) => p.universe);
export const GENDER_COUNTS = countBy(PRODUCTS, (p) => p.gender);
export const FAMILY_COUNTS = countBy(
  VERIFIED_PRODUCTS,
  (p) => (p.olfactory?.families ?? []) as Family[]
);
export const OCCASION_COUNTS = countBy(
  VERIFIED_PRODUCTS,
  (p) => (p.olfactory?.occasions ?? []) as Occasion[]
);

/** Todas las notas verificadas del catálogo, ordenadas y sin repetir. */
export const ALL_NOTES: string[] = Array.from(
  new Set(
    VERIFIED_PRODUCTS.flatMap((p) => [
      ...(p.olfactory?.topNotes ?? []),
      ...(p.olfactory?.middleNotes ?? []),
      ...(p.olfactory?.baseNotes ?? [])
    ])
  )
).sort((a, b) => a.localeCompare(b, "es"));

export const TOTAL_PRODUCTS = PRODUCTS.length;
export const TOTAL_HOUSES = new Set(PRODUCTS.map((p) => p.house)).size;
