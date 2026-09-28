/**
 * PERFORMANCE DEL EXTRACTO NOX — capa separada del perfil olfativo.
 *
 * Qué vive acá: duración, proyección, estela y rendimiento MEDIDOS SOBRE EL
 * PRODUCTO NOX. Nada más.
 *
 * Reglas duras de esta capa:
 *   · Ningún dato entra acá desde una fuente externa. El autocompletado
 *     olfativo puede escribir src/data/olfactory.ts, y tiene PROHIBIDO tocar
 *     este archivo (hay una guardia en scripts/autocompletar-olfativo.ts y un
 *     chequeo en npm run qa:performance).
 *   · Mientras `verified` sea false, la ficha no afirma nada de performance.
 *     No hay valor por defecto, no hay estimación, no hay inferencia desde la
 *     fragancia de referencia: la performance del original no es la nuestra.
 *   · Se carga a mano, con escala cualitativa, después de probar el extracto.
 *
 * Forma de una carga futura:
 *
 *   "lattafa-khamrah": {
 *     verified: true,
 *     longevity: "alta",
 *     projection: "media-alta",
 *     sillage: "marcada",
 *     performanceIntensity: "alta",
 *     testedAt: "2026-10",
 *     notes: "Prueba NOX sobre piel, jornada completa."
 *   }
 */

import type { NoxPerformance } from "./types";

/** Estado de una fragancia todavía no probada por NOX. */
export const UNVERIFIED_PERFORMANCE: NoxPerformance = {
  verified: false,
  longevity: null,
  projection: null,
  sillage: null,
  performanceIntensity: null,
  testedAt: null,
  notes: null
};

/**
 * Performance medida por NOX, por slug de producto.
 * Vacío hasta que existan pruebas propias. No completar desde ninguna fuente.
 */
export const NOX_PERFORMANCE: Record<string, NoxPerformance> = {};

/** Devuelve siempre un registro: sin prueba NOX, devuelve el estado no verificado. */
export function getPerformance(slug: string): NoxPerformance {
  return NOX_PERFORMANCE[slug] ?? UNVERIFIED_PERFORMANCE;
}

/** Cuántas fragancias tienen performance probada por NOX. */
export const VERIFIED_PERFORMANCE_COUNT = Object.values(NOX_PERFORMANCE).filter(
  (p) => p.verified
).length;
