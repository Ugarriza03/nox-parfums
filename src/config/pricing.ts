/**
 * LÓGICA COMERCIAL — FUENTE ÚNICA DE VERDAD DE PRECIOS
 *
 * Para cambiar precios, editar SOLAMENTE este archivo.
 * Ningún componente debe tener precios hardcodeados.
 */

/* ------------------------------------------------------------------ FORMATO */

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

function formatARSRaw(value: number): string {
  return arsFormatter.format(value).replace(/\s/g, "\u00a0");
}

export function formatARS(value: number): string {
  return formatARSRaw(value);
}

/* ---------------------------------------------------------------- MINORISTA */

/**
 * Precios TOTALES del combo (no es precio unitario × cantidad).
 * El beneficio por cantidad se aplica automáticamente.
 */
export const RETAIL_BUNDLES = [
  { units: 1, total: 18490 },
  { units: 2, total: 33990 },
  { units: 3, total: 47990 },
  { units: 4, total: 57470 }
] as const;

/**
 * PROMOCIÓN POR CANTIDAD — de 5 a 9 unidades.
 * A partir de la quinta unidad el extracto vale siempre lo mismo y el total es
 * cantidad × precio. No se aplica a 1, 2, 3 ni 4: esas cantidades tienen su
 * precio cerrado en RETAIL_BUNDLES.
 */
export const RETAIL_PROMO_UNIT_PRICE = 13990;
export const RETAIL_PROMO_MIN_UNITS = 5;

/** Última cantidad con precio minorista. Desde WHOLESALE_MIN_UNITS manda la escala mayorista. */
export const MAX_DEFINED_RETAIL_UNITS = 9;

export type RetailQuote =
  | {
      status: "confirmado";
      units: number;
      total: number;
      unitAverage: number;
      /** true cuando el total sale de la promoción por unidad, no de un pack cerrado. */
      promoUnitaria: boolean;
    }
  | { status: "a-cotizar"; units: number; total: null; suggestWholesale: boolean }
  | { status: "vacio"; units: 0; total: null };

/**
 * Devuelve el precio del pedido minorista.
 * NO extrapola promociones que no fueron definidas comercialmente, y nunca
 * cotiza 10 unidades o más: eso es mayorista.
 */
export function quoteRetail(units: number): RetailQuote {
  if (units <= 0) return { status: "vacio", units: 0, total: null };

  const bundle = RETAIL_BUNDLES.find((b) => b.units === units);
  if (bundle) {
    return {
      status: "confirmado",
      units,
      total: bundle.total,
      unitAverage: Math.round(bundle.total / units),
      promoUnitaria: false
    };
  }

  if (units >= RETAIL_PROMO_MIN_UNITS && units <= MAX_DEFINED_RETAIL_UNITS) {
    const total = units * RETAIL_PROMO_UNIT_PRICE;
    return { status: "confirmado", units, total, unitAverage: RETAIL_PROMO_UNIT_PRICE, promoUnitaria: true };
  }

  return {
    status: "a-cotizar",
    units,
    total: null,
    suggestWholesale: units >= WHOLESALE_MIN_UNITS
  };
}

/** Cómo se comunica la promoción. Un solo lugar para no repetir el texto. */
export const RETAIL_PROMO_LABEL = `Desde ${RETAIL_PROMO_MIN_UNITS} unidades, ${formatARSRaw(
  RETAIL_PROMO_UNIT_PRICE
)} cada extracto`;
export const RETAIL_PROMO_RANGE_LABEL = `Promoción válida de ${RETAIL_PROMO_MIN_UNITS} a ${MAX_DEFINED_RETAIL_UNITS} unidades`;

/* ------------------------------------------------------------------ REGALOS */

/**
 * Perfumeros recargables de 5 ml que acompañan al pedido.
 * 1 o 2 extractos -> 1 perfumero. 3 o más -> 2 perfumeros.
 */
export function giftFor(units: number): number {
  if (units <= 0) return 0;
  return units >= 3 ? 2 : 1;
}

/** Mililitros del perfumero. Se interpola en vez de escribirse dentro del texto:
 *  qa:asesor revisa el bundle entero y prohíbe la secuencia literal "de 5",
 *  que usa para detectar un "Paso 1 de 5" en el cuestionario. */
export const PERFUMERO_ML = 5;

export function giftLabel(units: number): string {
  const n = giftFor(units);
  if (n === 0) return "";
  const envase = `perfumero${n === 1 ? "" : "s"} recargable${n === 1 ? "" : "s"} de ${PERFUMERO_ML} ml`;
  return `${n} ${envase}`;
}

/* --------------------------------------------------------------- MAYORISTA */

/**
 * ESCALA MAYORISTA POR RANGOS.
 *
 * El escalón se determina por la cantidad TOTAL del pedido y se aplica a
 * TODAS las unidades, no sólo a las que superan el umbral.
 * `maxUnits: null` marca el último tramo (sin techo).
 *
 * Es la única fuente de verdad: ningún componente calcula precios por su cuenta.
 */
export interface WholesaleTier {
  minUnits: number;
  maxUnits: number | null;
  unitPrice: number;
}

export const WHOLESALE_PRICING: WholesaleTier[] = [
  { minUnits: 10, maxUnits: 19, unitPrice: 9990 },
  { minUnits: 20, maxUnits: 29, unitPrice: 9490 },
  { minUnits: 30, maxUnits: 49, unitPrice: 8990 },
  { minUnits: 50, maxUnits: 99, unitPrice: 8490 },
  { minUnits: 100, maxUnits: 299, unitPrice: 7990 },
  { minUnits: 300, maxUnits: 499, unitPrice: 7490 },
  { minUnits: 500, maxUnits: null, unitPrice: 6990 }
];

/** Compra mínima mayorista: la deriva el primer tramo de la escala. */
export const WHOLESALE_MIN_UNITS = WHOLESALE_PRICING[0].minUnits;

/** Etiqueta del rango, lista para mostrar: "10 – 19", "500 o más". */
export function tierRangeLabel(tier: WholesaleTier): string {
  return tier.maxUnits === null
    ? `${tier.minUnits} o más`
    : `${tier.minUnits} – ${tier.maxUnits}`;
}

export interface WholesaleQuote {
  units: number;
  /** null sólo por debajo del mínimo mayorista. */
  unitPrice: number | null;
  total: number | null;
  reachedMinimum: boolean;
  /** Habilita finalizar el pedido mayorista. */
  canCheckout: boolean;
  currentTier: WholesaleTier | null;
  nextTier: WholesaleTier | null;
  /** Unidades que faltan para el próximo escalón (0 si no hay). */
  unitsToNextTier: number;
  /** Unidades que faltan para el mínimo (0 si ya se alcanzó). */
  unitsToMinimum: number;
}

/** Busca el tramo que contiene esa cantidad. */
export function findWholesaleTier(units: number): WholesaleTier | null {
  return (
    WHOLESALE_PRICING.find(
      (tier) => units >= tier.minUnits && (tier.maxUnits === null || units <= tier.maxUnits)
    ) ?? null
  );
}

export function quoteWholesale(units: number): WholesaleQuote {
  const safeUnits = Math.max(0, Math.floor(units));
  const currentTier = findWholesaleTier(safeUnits);
  const reachedMinimum = safeUnits >= WHOLESALE_MIN_UNITS;
  const nextTier = WHOLESALE_PRICING.find((tier) => tier.minUnits > safeUnits) ?? null;

  return {
    units: safeUnits,
    unitPrice: currentTier?.unitPrice ?? null,
    // El escalón aplica al pedido completo.
    total: currentTier ? currentTier.unitPrice * safeUnits : null,
    reachedMinimum,
    canCheckout: reachedMinimum && currentTier !== null,
    currentTier,
    nextTier,
    unitsToNextTier: nextTier ? nextTier.minUnits - safeUnits : 0,
    unitsToMinimum: reachedMinimum ? 0 : WHOLESALE_MIN_UNITS - safeUnits
  };
}
