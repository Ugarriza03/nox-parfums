/**
 * BÚSQUEDA Y FILTRADO DEL CATÁLOGO
 * Cliente-side sobre datos locales. Al migrar a base de datos, esta función
 * se reemplaza por una consulta manteniendo la misma firma.
 */

import { PRODUCTS } from "@/data/products";
import type { Family, Gender, Occasion, Product, Universe } from "@/data/types";

export type SortKey = "relevancia" | "casa" | "verificados";

export interface CatalogFilters {
  query: string;
  universe: Universe | "todos";
  gender: Gender | "todos";
  /** Filtros avanzados: la arquitectura ya los soporta, la UI los muestra
   *  sólo cuando hay suficientes productos verificados para que sean útiles. */
  family: Family | "todas";
  occasion: Occasion | "todas";
  onlyVerified: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  query: "",
  universe: "todos",
  gender: "todos",
  family: "todas",
  occasion: "todas",
  onlyVerified: false,
  sort: "relevancia"
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function searchableText(product: Product): string {
  const notes = product.olfactory
    ? [
        ...product.olfactory.topNotes,
        ...product.olfactory.middleNotes,
        ...product.olfactory.baseNotes,
        ...product.olfactory.accords
      ].join(" ")
    : "";
  return normalize(`${product.inspiredBy} ${product.house} ${notes}`);
}

export function filterCatalog(
  filters: CatalogFilters,
  source: Product[] = PRODUCTS
): Product[] {
  const q = normalize(filters.query);
  const terms = q.split(/\s+/).filter(Boolean);

  const result = source.filter((product) => {
    if (filters.universe !== "todos" && product.universe !== filters.universe) return false;
    if (filters.gender !== "todos" && product.gender !== filters.gender) return false;
    if (filters.onlyVerified && product.dataStatus !== "verificado") return false;

    if (filters.family !== "todas") {
      if (!product.olfactory?.families.includes(filters.family)) return false;
    }
    if (filters.occasion !== "todas") {
      if (!product.olfactory?.occasions.includes(filters.occasion)) return false;
    }

    if (terms.length > 0) {
      const haystack = searchableText(product);
      if (!terms.every((t) => haystack.includes(t))) return false;
    }

    return true;
  });

  return sortCatalog(result, filters.sort, terms);
}

function sortCatalog(items: Product[], sort: SortKey, terms: string[]): Product[] {
  const byName = (a: Product, b: Product) =>
    a.inspiredBy.localeCompare(b.inspiredBy, "es");

  if (sort === "casa") {
    return [...items].sort(
      (a, b) => a.house.localeCompare(b.house, "es") || byName(a, b)
    );
  }

  if (sort === "verificados") {
    return [...items].sort((a, b) => {
      const av = a.dataStatus === "verificado" ? 0 : 1;
      const bv = b.dataStatus === "verificado" ? 0 : 1;
      return av - bv || byName(a, b);
    });
  }

  // Relevancia: coincidencia al principio del nombre primero, luego verificados.
  return [...items].sort((a, b) => {
    if (terms.length > 0) {
      const an = normalize(a.inspiredBy).startsWith(terms[0]) ? 0 : 1;
      const bn = normalize(b.inspiredBy).startsWith(terms[0]) ? 0 : 1;
      if (an !== bn) return an - bn;
    }
    const av = a.dataStatus === "verificado" ? 0 : 1;
    const bv = b.dataStatus === "verificado" ? 0 : 1;
    return av - bv || byName(a, b);
  });
}

/** Fragancias relacionadas para la ficha de producto. */
export function relatedProducts(product: Product, limit = 4): Product[] {
  const families = product.olfactory?.families ?? [];

  const scored = PRODUCTS.filter((p) => p.slug !== product.slug).map((candidate) => {
    let score = 0;
    if (candidate.house === product.house) score += 2;
    if (candidate.gender === product.gender) score += 1;
    if (candidate.universe === product.universe) score += 1;

    const shared = (candidate.olfactory?.families ?? []).filter((f) => families.includes(f));
    score += shared.length * 4;

    if (candidate.dataStatus === "verificado") score += 1;
    return { candidate, score };
  });

  return scored
    .filter((s) => s.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.candidate);
}
