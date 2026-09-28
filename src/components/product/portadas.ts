/**
 * CONFIGURACIÓN VISUAL DE PORTADAS — capa de presentación
 *
 * Este módulo NO es datos de producto: no toca catálogo, perfiles, pricing,
 * matcher, baseline ni imports. Sólo decide cómo se ve la portada.
 *
 * ── FOTOGRAFÍA REAL DEL FRASCO ────────────────────────────────────────────
 * `BOTTLE_PHOTO` es el único interruptor del sistema. Con `null`, la portada
 * usa el frasco renderizado. Apenas exista una foto del envase NOX recortada
 * con fondo transparente, se apunta acá y TODAS las portadas pasan a usarla,
 * sin tocar ningún otro archivo.
 *
 * Especificación del recorte esperado:
 *   · PNG con canal alfa, fondo totalmente transparente
 *   · frasco completo: tapa, cuello, vidrio y base negra
 *   · ángulo 3/4 frontal suave, el mismo del envase real
 *   · alto útil ≈ 1600 px, el frasco ocupando el 92 % del alto del lienzo
 *   · luz de estudio neutra, sin dominante cálida
 *   · sin sombra incorporada: la portada la genera para poder apoyarla
 *     sobre cada escena
 *   · archivo en `public/`, referenciado como "/frasco-nox.png"
 *
 * El video del envase sirvió como referencia de geometría y materiales, pero
 * no como asset: está filmado con poca luz y con movimiento, y un recorte de
 * ese material no llega a fotografía de producto.
 */
export const BOTTLE_PHOTO: string | null = null;

import type { Family } from "@/data/types";

/* ------------------------------------------------------------------ ESCENAS */

/**
 * Cada escena es un CLIMA, no una ilustración de las notas. Nada de frutas ni
 * flores recortadas: horizonte, atmósfera, siluetas y una fuente de luz.
 */
export type SceneKind =
  | "mineral"
  | "agua"
  | "citrico"
  | "tropical"
  | "bosque"
  | "petalos"
  | "brasa";

export interface Escena {
  kind: SceneKind;
  /** Cielo de arriba hacia el horizonte. */
  cielo: [string, string, string];
  /** Color de la fuente de luz de la escena. */
  luz: string;
  /** Siluetas del paisaje. */
  silueta: string;
  /** Plano de apoyo. */
  piso: string;
  /** Líquido dentro del frasco. */
  liquido: string;
  /** Acento reutilizable fuera de la portada. */
  accent: string;
}

const ESCENAS: Record<SceneKind, Escena> = {
  mineral: {
    kind: "mineral",
    cielo: ["#05080F", "#0A1120", "#1E2739"],
    luz: "#C9A87C",
    silueta: "#080C15",
    piso: "#0A0E17",
    liquido: "#B98C55",
    accent: "#9FB0C8"
  },
  agua: {
    kind: "agua",
    cielo: ["#030E18", "#061E30", "#10384E"],
    luz: "#8FC6E4",
    silueta: "#03101A",
    piso: "#05161F",
    liquido: "#7FB4D4",
    accent: "#9EC2DD"
  },
  citrico: {
    kind: "citrico",
    cielo: ["#050B0C", "#091515", "#183029"],
    luz: "#D3E5B8",
    silueta: "#040D0C",
    piso: "#06100E",
    liquido: "#C4D79A",
    accent: "#B9D8A6"
  },
  tropical: {
    kind: "tropical",
    cielo: ["#070905", "#101407", "#2B2A11"],
    luz: "#E4CB8E",
    silueta: "#050703",
    piso: "#090B05",
    liquido: "#D9B872",
    accent: "#E3C494"
  },
  bosque: {
    kind: "bosque",
    cielo: ["#090704", "#131009", "#2A2012"],
    luz: "#C79A62",
    silueta: "#070502",
    piso: "#0A0704",
    liquido: "#A8814F",
    accent: "#CBAE85"
  },
  petalos: {
    kind: "petalos",
    cielo: ["#0B0610", "#160C18", "#2F1C2B"],
    luz: "#DFAFC4",
    silueta: "#09050F",
    piso: "#0B0610",
    liquido: "#C89BAE",
    accent: "#DDAEC2"
  },
  brasa: {
    kind: "brasa",
    cielo: ["#0B0504", "#180906", "#33130A"],
    luz: "#DE9A62",
    silueta: "#090302",
    piso: "#0B0504",
    liquido: "#C7834A",
    accent: "#DFA179"
  }
};

/** Clima por defecto según la familia principal del perfil. */
const POR_FAMILIA: Record<Family, SceneKind> = {
  "citrico-fresco": "citrico",
  acuatico: "agua",
  "aromatico-limpio": "citrico",
  amaderado: "bosque",
  especiado: "brasa",
  floral: "petalos",
  "gourmand-dulce": "tropical",
  "ambarado-intenso": "brasa",
  "cuero-ahumado": "bosque"
};

/**
 * Productos piloto: acá se afina el clima a mano cuando la familia sola no
 * alcanza para describir la fragancia. Todo lo que no figure usa POR_FAMILIA.
 */
const POR_PRODUCTO: Record<string, SceneKind> = {
  // Paisaje mineral, aire seco, cielo profundo. La familia principal es
  // "especiado", que por defecto daría brasa: acá manda el clima.
  "christian-dior-sauvage": "mineral",
  "christian-dior-sauvage-elixir": "mineral",
  // Cítrico y limpio, aire abierto.
  "louis-vuitton-imagination": "citrico",
  // Dulce y tropical: coco, vainilla, humedad cálida.
  "jean-paul-gaultier-le-beau": "tropical"
};

export function escenaDe(slug: string, family: Family | undefined): Escena {
  const kind = POR_PRODUCTO[slug] ?? (family ? POR_FAMILIA[family] : "mineral");
  return ESCENAS[kind];
}

/* -------------------------------------------------------------- VARIACIÓN */

/**
 * Semilla estable por producto. Dos fragancias del mismo clima no comparten
 * la altura del horizonte, la posición de la luz ni el perfil de las siluetas,
 * así que el catálogo no se repite. Determinista: la misma portada siempre.
 */
export function semilla(slug: string): (i: number) => number {
  let h = 2166136261;
  for (let k = 0; k < slug.length; k++) {
    h ^= slug.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return (i: number) => {
    let x = Math.imul(h ^ Math.imul(i + 1, 0x9e3779b9), 0x85ebca6b);
    x ^= x >>> 15;
    x = Math.imul(x, 0xc2b2ae35);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  };
}
