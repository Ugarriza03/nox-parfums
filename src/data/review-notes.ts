/**
 * NOTAS DE REVISIÓN — CAPA INTERNA
 *
 * Observaciones dirigidas al equipo, no al cliente: discrepancias de nombre,
 * clasificaciones a confirmar, variantes ambiguas. Son texto de trabajo, con
 * tono de mensaje interno ("avisame si la corrijo"), y NO son copy público.
 *
 * Por eso viven acá y no en brands.ts: este archivo lo importan ÚNICAMENTE los
 * scripts (reporte de datos y QA). Ningún componente de la web lo toca, así que
 * no entra al bundle ni queda visible inspeccionando el HTML. Misma lógica que
 * olfactory.sources.ts.
 *
 * Lo que el usuario ve de un producto sin datos verificados es el estado
 * público y neutro de la ficha ("Todavía no publicamos la ficha olfativa
 * completa…"), nunca el motivo técnico de la duda.
 *
 * Verificado por: npm run qa:catalogo y npm run qa:sync.
 */

/**
 * Notas internas para revisar con el cliente. Se muestran únicamente en el
 * reporte de datos (scripts/reporte-datos.ts), nunca en la web pública.
 */
export const HOUSE_REVIEW_NOTES: Record<string, string> = {
  "Tom Ford":
    "Clasificada como nicho a nivel casa. Tom Ford tiene dos líneas (Signature y Private Blend) con posicionamiento distinto: si querés separar Noir Extreme del resto, se define por producto.",
  Creed:
    "Clasificada como nicho. Es una casa que la comunidad discute por su distribución masiva; si preferís mostrarla como diseñador, se cambia en una línea.",
  Xerjoff:
    "En tu catálogo está dentro del bloque Árabes. Xerjoff es una casa italiana de nicho. Se respetó tu agrupación comercial, pero conviene revisarlo.",
  Montale:
    "En tu catálogo está dentro del bloque Árabes. Montale es una casa francesa de nicho (con perfumería de estilo oriental). Se respetó tu agrupación, pero conviene revisarlo.",

  Kayali:
    "Kayali es una casa de Dubái (grupo Huda Beauty). Queda dentro del bloque Árabes tal como la agrupaste.",
  Armani:
    "En tu catálogo conviven \"Armani\" y \"Giorgio Armani\" como marcas separadas. Se respetó tal cual, pero se pueden unificar."
};

/** Notas de revisión a nivel producto (nombre exacto tal como figura en tu lista). */
export const PRODUCT_REVIEW_NOTES: Record<string, string> = {
  "Tom Ford — Tobacco Vanilla":
    "El nombre oficial de la fragancia es \"Tobacco Vanille\". Se mantuvo tu escritura en el catálogo; avisame si la corrijo.",
  "Versace — Eros":
    "En tu catálogo Eros figura dentro de FEMENINOS. Versace Eros existe en versión masculina y en versión femenina (Eros Pour Femme). No se cargaron notas para no arriesgar el dato equivocado: confirmame cuál de las dos es.",
  "Parfums de Marly — Haltane":
    "El nombre oficial es \"Haltane\" y existe también \"Althaïr\"; verificar que sea la que vendés antes de cargar notas.",
  "Lancôme — La Vida es Bella":
    "Nombre comercial original: \"La Vie Est Belle\". Se mantuvo tu escritura en español."
};
