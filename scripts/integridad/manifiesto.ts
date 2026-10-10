/**
 * MANIFIESTO DE INTEGRIDAD DEL CATÁLOGO — construcción
 *
 * Arma, a partir del catálogo tal como lo ve la web, una descripción
 * determinística de los datos protegidos: identificadores, nombres, casa,
 * género, universo, perfil olfativo, portadas, destacadas y lógica comercial.
 *
 * Determinístico: sin fechas, sin rutas absolutas, claves en orden fijo y
 * hashes sha256 de contenido. Dos corridas sobre el mismo commit producen el
 * mismo archivo byte por byte.
 *
 * No es la futura base de datos ni una copia del catálogo: guarda lo mínimo
 * para detectar cambios accidentales. Las imágenes no se copian; sólo se
 * registra su hash, su tamaño y sus dimensiones.
 *
 * Lo usan:
 *   scripts/integridad/generar-manifiesto.ts   (npm run integridad:generar)
 *   scripts/integridad/verificar-integridad.ts (npm run qa:integridad)
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PRODUCTS, FEATURED_SLUGS } from "../../src/data/products";
import { OLFACTORY_PROFILES } from "../../src/data/olfactory";
import { OLFACTORY_SOURCES } from "../../src/data/olfactory.sources";
import { PRODUCT_ID_REGISTRY } from "../../src/data/product-ids";
import { HOUSE_UNIVERSE } from "../../src/data/brands";
import { coverFor, PORTADAS_ALTERNATIVAS, COVER_SLUGS } from "../../src/components/product/covers";
import {
  RETAIL_BUNDLES,
  RETAIL_PROMO_UNIT_PRICE,
  RETAIL_PROMO_MIN_UNITS,
  MAX_DEFINED_RETAIL_UNITS,
  WHOLESALE_PRICING,
  PERFUMERO_ML,
  giftFor,
  quoteRetail,
  quoteWholesale
} from "../../src/config/pricing";

export const MANIFIESTO_RUTA = "data/integridad/manifiesto-catalogo.json";
export const MANIFIESTO_VERSION = 1;

/* ------------------------------------------------------------------ utils */

/** JSON con claves ordenadas: el hash no depende del orden de escritura. */
export function canonico(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(",")}]`;
  if (valor && typeof valor === "object") {
    const obj = valor as Record<string, unknown>;
    return `{${Object.keys(obj)
      .sort()
      .filter((k) => obj[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${canonico(obj[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(valor);
}

export const sha256 = (dato: string | Buffer) => createHash("sha256").update(dato).digest("hex");

/** Ancho y alto de un WebP (VP8, VP8L o VP8X), leyendo sólo la cabecera. */
export function dimensionesWebp(buf: Buffer): { ancho: number; alto: number } | null {
  if (buf.length < 30 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return { ancho: 1 + buf.readUIntLE(24, 3), alto: 1 + buf.readUIntLE(27, 3) };
  }
  if (chunk === "VP8 ") {
    return { ancho: buf.readUInt16LE(26) & 0x3fff, alto: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { ancho: (b & 0x3fff) + 1, alto: ((b >> 14) & 0x3fff) + 1 };
  }
  return null;
}

export interface Archivo {
  ruta: string;
  existe: boolean;
  bytes: number | null;
  sha256: string | null;
  ancho: number | null;
  alto: number | null;
}

/** Ruta pública ("/products/…") → descripción del archivo en public/. */
export function describirArchivo(rutaPublica: string): Archivo {
  const fisica = join("public", rutaPublica.replace(/^\//, ""));
  if (!existsSync(fisica)) {
    return { ruta: rutaPublica, existe: false, bytes: null, sha256: null, ancho: null, alto: null };
  }
  const buf = readFileSync(fisica);
  const dim = dimensionesWebp(buf);
  return {
    ruta: rutaPublica,
    existe: true,
    bytes: buf.length,
    sha256: sha256(buf),
    ancho: dim?.ancho ?? null,
    alto: dim?.alto ?? null
  };
}

/* -------------------------------------------------------------- manifiesto */

export interface ProductoManifiesto {
  slug: string;
  id: string;
  casa: string;
  nombre: string;
  inspiradoEn: string;
  genero: string;
  origen: string;
  universo: string;
  dataStatus: string;
  perfilOlfativo: { clave: string; existe: boolean; sha256: string | null };
  procedencia: { existe: boolean; sha256: string | null };
  performanceVerificada: boolean;
  portada: Archivo;
  portadaPreview: { ruta: string; existe: boolean; sha256: string | null };
  destacada: number | null;
}

export interface Manifiesto {
  version: number;
  descripcion: string;
  totales: {
    productos: number;
    casas: number;
    perfilesOlfativos: number;
    procedencias: number;
    portadas: number;
    portadasAlternativas: number;
    destacadas: number;
    porUniverso: Record<string, number>;
    porGenero: Record<string, number>;
  };
  sha256: {
    registroIdentificadores: string;
    perfilesOlfativos: string;
    procedencias: string;
    clasificacionCasas: string;
    comercial: string;
  };
  comercial: Record<string, unknown>;
  destacadas: string[];
  portadasAlternativas: { slug: string; archivo: Archivo }[];
  productos: ProductoManifiesto[];
}

function contar(valores: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const v of [...valores].sort()) out[v] = (out[v] ?? 0) + 1;
  return out;
}

/** Lógica comercial evaluada (no el texto del archivo): precios, promos y regalos. */
function resumenComercial(): Record<string, unknown> {
  const unidades = Array.from({ length: 13 }, (_, i) => i);
  return {
    minorista: {
      combos: RETAIL_BUNDLES.map((b) => ({ unidades: b.units, total: b.total })),
      promoPrecioUnitario: RETAIL_PROMO_UNIT_PRICE,
      promoDesde: RETAIL_PROMO_MIN_UNITS,
      ultimaCantidadMinorista: MAX_DEFINED_RETAIL_UNITS,
      cotizaciones: unidades.map((u) => {
        const q = quoteRetail(u);
        return { unidades: u, estado: q.status, total: q.total };
      })
    },
    regalos: { perfumeroMl: PERFUMERO_ML, porUnidades: unidades.map((u) => giftFor(u)) },
    mayorista: {
      escala: WHOLESALE_PRICING.map((t) => ({ desde: t.minUnits, hasta: t.maxUnits, precioUnitario: t.unitPrice })),
      cotizaciones: [9, 10, 19, 20, 29, 30, 49, 50, 99, 100, 299, 300, 499, 500, 1000].map((u) => {
        const q = quoteWholesale(u);
        return { unidades: u, precioUnitario: q.unitPrice, total: q.total, habilitado: q.canCheckout };
      })
    }
  };
}

export function construirManifiesto(): Manifiesto {
  const registro = new Map(PRODUCT_ID_REGISTRY.map((e) => [e.slug, e]));

  const productos: ProductoManifiesto[] = PRODUCTS.map((p) => {
    const entrada = registro.get(p.slug);
    const perfil = OLFACTORY_PROFILES[p.slug];
    const fuente = OLFACTORY_SOURCES[p.slug];
    const ruta = coverFor(p);
    const rutaPreview = `/products/covers/preview/${p.slug}.webp`;
    const preview = describirArchivo(rutaPreview);
    const pos = FEATURED_SLUGS.indexOf(p.slug);
    return {
      slug: p.slug,
      id: p.id,
      casa: p.house,
      nombre: entrada?.name ?? "(sin registro)",
      inspiradoEn: p.inspiredBy,
      genero: p.gender,
      origen: p.origin,
      universo: p.universe,
      dataStatus: p.dataStatus,
      perfilOlfativo: {
        clave: p.slug,
        existe: Boolean(perfil) && p.olfactory === perfil,
        sha256: perfil ? sha256(canonico(perfil)) : null
      },
      procedencia: { existe: Boolean(fuente), sha256: fuente ? sha256(canonico(fuente)) : null },
      performanceVerificada: p.performance.verified,
      portada: ruta
        ? describirArchivo(ruta)
        : { ruta: "(sin portada)", existe: false, bytes: null, sha256: null, ancho: null, alto: null },
      portadaPreview: { ruta: rutaPreview, existe: preview.existe, sha256: preview.sha256 },
      destacada: pos === -1 ? null : pos
    };
  });

  const comercial = resumenComercial();

  return {
    version: MANIFIESTO_VERSION,
    descripcion:
      "Referencia de integridad del catálogo NOX. Generado por npm run integridad:generar; " +
      "verificado por npm run qa:integridad. No editar a mano.",
    totales: {
      productos: PRODUCTS.length,
      casas: new Set(PRODUCTS.map((p) => p.house)).size,
      perfilesOlfativos: Object.keys(OLFACTORY_PROFILES).length,
      procedencias: Object.keys(OLFACTORY_SOURCES).length,
      portadas: COVER_SLUGS.length,
      portadasAlternativas: Object.keys(PORTADAS_ALTERNATIVAS).length,
      destacadas: FEATURED_SLUGS.length,
      porUniverso: contar(PRODUCTS.map((p) => p.universe)),
      porGenero: contar(PRODUCTS.map((p) => p.gender))
    },
    sha256: {
      registroIdentificadores: sha256(canonico(PRODUCT_ID_REGISTRY)),
      perfilesOlfativos: sha256(canonico(OLFACTORY_PROFILES)),
      procedencias: sha256(canonico(OLFACTORY_SOURCES)),
      clasificacionCasas: sha256(canonico(HOUSE_UNIVERSE)),
      comercial: sha256(canonico(comercial))
    },
    comercial,
    destacadas: [...FEATURED_SLUGS],
    portadasAlternativas: Object.keys(PORTADAS_ALTERNATIVAS)
      .sort()
      .map((slug) => ({ slug, archivo: describirArchivo(PORTADAS_ALTERNATIVAS[slug]) })),
    productos
  };
}

export function serializar(m: Manifiesto): string {
  return JSON.stringify(m, null, 2) + "\n";
}
