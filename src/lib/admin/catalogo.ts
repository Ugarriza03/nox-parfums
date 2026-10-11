/**
 * VISTA DEL CATÁLOGO PARA NOX ADMIN — sólo lectura.
 *
 * El panel no modifica el catálogo: toma los 233 productos de los archivos
 * actuales y los identifica por su slug estable (src/data/product-ids.ts).
 * No expone perfiles olfativos ni procedencia: sólo lo necesario para
 * gestionar inventario.
 */

import { PRODUCT_ID_REGISTRY } from "@/data/product-ids";
import { PRODUCTS_BY_SLUG } from "@/data/products";
import { GENDER_LABELS, UNIVERSE_LABELS, type Gender, type Universe } from "@/data/types";

export interface ProductoAdmin {
  slug: string;
  nombre: string;
  marca: string;
  genero: Gender;
  generoEtiqueta: string;
  categoria: Universe;
  categoriaEtiqueta: string;
}

export const PRODUCTOS_ADMIN: readonly ProductoAdmin[] = PRODUCT_ID_REGISTRY.map((entrada) => {
  const producto = PRODUCTS_BY_SLUG[entrada.slug];
  const categoria: Universe = producto?.universe ?? "pendiente";
  return {
    slug: entrada.slug,
    nombre: entrada.name,
    marca: entrada.house,
    genero: entrada.gender,
    generoEtiqueta: GENDER_LABELS[entrada.gender],
    categoria,
    categoriaEtiqueta: UNIVERSE_LABELS[categoria]
  };
});

export const SLUGS_VALIDOS: ReadonlySet<string> = new Set(PRODUCTOS_ADMIN.map((p) => p.slug));

const POR_SLUG = new Map(PRODUCTOS_ADMIN.map((p) => [p.slug, p]));

export function productoAdmin(slug: string): ProductoAdmin | undefined {
  return POR_SLUG.get(slug);
}
