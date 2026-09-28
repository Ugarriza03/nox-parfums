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
import type { Family, Gender, Occasion, Product, Universe } from "./types";

/* ------------------------------------------------------------------ utils */

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/&/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ------------------------------------------------------------- construcción */

interface Draft {
  house: string;
  name: string;
  gender: Gender;
  origin: "internacional" | "arabe";
  baseSlug: string;
}

function collectDrafts(): Draft[] {
  const drafts: Draft[] = [];
  for (const group of RAW_CATALOG) {
    for (const [house, names] of Object.entries(group.brands)) {
      for (const name of names) {
        drafts.push({
          house,
          name,
          gender: group.gender,
          origin: group.origin,
          baseSlug: slugify(`${house} ${name}`)
        });
      }
    }
  }
  return drafts;
}

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
  const drafts = collectDrafts();

  // Una misma fragancia puede figurar en dos géneros (por ejemplo Light Blue).
  // En ese caso ambas reciben sufijo de género para que el slug sea estable.
  const slugCounts = new Map<string, number>();
  for (const d of drafts) {
    slugCounts.set(d.baseSlug, (slugCounts.get(d.baseSlug) ?? 0) + 1);
  }

  return drafts.map((draft) => {
    const duplicated = (slugCounts.get(draft.baseSlug) ?? 0) > 1;
    const slug = duplicated ? `${draft.baseSlug}-${draft.gender}` : draft.baseSlug;
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
