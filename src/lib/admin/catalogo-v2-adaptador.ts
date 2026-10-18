/**
 * Adaptador de lectura para probar el catálogo V2 SIN activar el storefront.
 * No se importa en páginas públicas ni se usa service_role.
 */
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/data/types";

function jsonEstable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(jsonEstable).join(",")}]`;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj).sort().map(k => `${JSON.stringify(k)}:${jsonEstable(obj[k])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export type FilaCatalogoV2 = {
  slug: string;
  house: string;
  fragrance_name: string;
  gender: string;
  universe: string;
  origin: string;
  status: string;
  olfactory: unknown;
  image_path: string | null;
  inspired_label: string | null;
  data_status: string | null;
  performance: unknown;
};

export type ResultadoVistaV2 = {
  products: Product[];
  fuente: "v2" | "estatico";
  motivos: string[];
};

/**
 * No publica borradores. Si la base no es coherente con los 233 históricos,
 * vuelve al catálogo estático completo, sin una mezcla silenciosa.
 * La lectura de productos nuevos se habilitará en una fase posterior, cuando
 * el storefront pueda resolver sus imágenes, SEO y rutas.
 */
export function prepararVistaCatalogoV2(
  filas: FilaCatalogoV2[] | null,
  errorLectura: boolean
): ResultadoVistaV2 {
  const respaldo = (motivo: string): ResultadoVistaV2 => ({
    products: PRODUCTS, fuente: "estatico", motivos: [motivo]
  });
  if (errorLectura || !filas) return respaldo("Supabase no disponible");
  if (filas.length !== PRODUCTS.length) return respaldo("Cantidad distinta de 233");
  const base = new Map(PRODUCTS.map(p => [p.slug, p]));
  const slugs = new Set<string>();
  const adaptados: Product[] = [];
  for (const fila of filas) {
    if (slugs.has(fila.slug)) return respaldo("Identificador duplicado");
    slugs.add(fila.slug);
    const anterior = base.get(fila.slug);
    if (!anterior || fila.status !== "published") return respaldo("Identidad o publicación incompleta");
    if (fila.gender !== anterior.gender || fila.origin !== anterior.origin ||
        fila.universe !== anterior.universe || fila.house !== anterior.house ||
        `${fila.house} ${fila.fragrance_name}` !== anterior.inspiredBy)
      return respaldo("Campos de identidad distintos");
    if (fila.data_status !== "verificado" && fila.data_status !== "pendiente")
      return respaldo("Estado de datos inválido");
    if (jsonEstable(fila.olfactory) !== jsonEstable(anterior.olfactory))
      return respaldo("Perfil olfativo distinto");
    if (fila.inspired_label !== anterior.inspiredLabel)
      return respaldo("Referencia de inspiración distinta");
    if (fila.data_status !== anterior.dataStatus)
      return respaldo("Estado de verificación distinto");
    // La performance del extracto NOX jamás se afirma por datos no auditados.
    // En esta etapa se conserva el valor validado del catálogo estático.
    adaptados.push({
      ...anterior,
      house: fila.house,
      inspiredBy: `${fila.house} ${fila.fragrance_name}`,
      inspiredLabel: fila.inspired_label || `Inspirado en ${fila.house} ${fila.fragrance_name}`,
      gender: anterior.gender,
      universe: anterior.universe,
      origin: anterior.origin,
      olfactory: fila.olfactory as Product["olfactory"],
      dataStatus: fila.data_status,
      performance: anterior.performance,
      // Storage privado no tiene URL pública: conservar portada local hasta
      // completar el mecanismo de publicación de assets.
      image: anterior.image
    });
  }
  if (slugs.size !== PRODUCTS.length) return respaldo("Identificadores incompletos");
  return { products: adaptados, fuente: "v2", motivos: [] };
}
