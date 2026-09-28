/**
 * CLASIFICACIÓN DE UNIVERSO POR CASA (diseñador / nicho / árabe).
 *
 * Regla del proyecto: no se inventa la clasificación.
 * - "disenador" y "nicho" se asignan sólo con respaldo.
 *   El respaldo usado fue la categorización editorial de Fragrantica
 *   (sección "Niche Perfumery") más el posicionamiento público de cada casa.
 * - "pendiente" = no se pudo verificar de forma concluyente. Aparece en el
 *   catálogo pero sin etiqueta de universo, y se lista en el reporte de datos
 *   faltantes para que el cliente lo defina.
 * - Las casas del bloque árabe del catálogo se clasifican como "arabe" por
 *   origen del grupo, no por esta tabla.
 */

import type { Universe } from "./types";

export const HOUSE_UNIVERSE: Record<string, Universe> = {
  // --- Diseñador -----------------------------------------------------------
  "Ariana Grande": "disenador",
  Armani: "disenador",
  "Antonio Banderas": "disenador",
  Azzaro: "disenador",
  "Britney Spears": "disenador",
  Bulgari: "disenador",
  Cacharel: "disenador",
  "Calvin Klein": "disenador",
  "Carolina Herrera": "disenador",
  Chanel: "disenador",
  "Christian Dior": "disenador",
  Davidoff: "disenador",
  DKNY: "disenador",
  "Dolce & Gabbana": "disenador",
  "Giorgio Armani": "disenador",
  Givenchy: "disenador",
  Gucci: "disenador",
  Guerlain: "disenador",
  "Hugo Boss": "disenador",
  "Issey Miyake": "disenador",
  "J. Del Pozo": "disenador",
  "Jean Paul Gaultier": "disenador",
  Kenzo: "disenador",
  "Lancôme": "disenador",
  Moschino: "disenador",
  "Nina Ricci": "disenador",
  "Paco Rabanne": "disenador",
  "Ralph Lauren": "disenador",
  Shakira: "disenador",
  "Thierry Mugler": "disenador",
  "Tommy Hilfiger": "disenador",
  Valentino: "disenador",
  Versace: "disenador",
  "Victoria's Secret": "disenador",
  "Viktor & Rolf": "disenador",
  "Yves Saint Laurent": "disenador",
  // Decisión de merchandising de NOX, no una clasificación oficial de la casa.
  "Louis Vuitton": "disenador",

  // --- Nicho ---------------------------------------------------------------
  Amouage: "nicho",
  Creed: "nicho",
  Kilian: "nicho",
  "Maison Francis Kurkdjian": "nicho",
  "Memo Paris": "nicho",
  Montale: "nicho",
  "Parfums de Marly": "nicho",
  "Tom Ford": "nicho",
  Xerjoff: "nicho",
};
