/**
 * MOTOR DEL ASESOR DE FRAGANCIAS
 *
 * Trabaja exclusivamente sobre atributos verificados del producto
 * (familias, notas, ocasiones, estaciones y carácter aromático).
 *
 * Orden de peso: familia → notas → ocasión → carácter aromático → estación.
 * El género filtra el pool antes de puntuar.
 *
 * La performance del extracto NOX (duración, proyección, estela) entra como
 * criterio EXTRA y sólo cuando NOX la probó (performance.verified). Nunca
 * resta puntos: que una fragancia todavía no esté probada no la vuelve peor,
 * y ningún motivo que ve el usuario habla de horas ni de proyección salvo que
 * ese dato exista.
 * Un producto sin perfil olfativo verificado NUNCA se recomienda.
 *
 * Sobre las ocasiones: muchas fichas de referencia no declaran ocasión de uso.
 * Cuando `olfactory.occasions` está vacío se aplica una AFINIDAD por familia
 * (tabla OCCASION_AFFINITY, más abajo). Eso es un criterio de recomendación
 * explícito y uniforme, no un dato que se le atribuya al producto: por eso
 * puntúa menos que una ocasión verificada y el texto que ve el usuario dice
 * "encaja con", nunca "este perfume es para".
 */

import { VERIFIED_PRODUCTS } from "@/data/products";
import {
  FAMILY_LABELS,
  INTENSITY_PREFERENCE_LABELS,
  INTENSITY_PREFERENCE_OF,
  OCCASION_LABELS,
  type Family,
  type Gender,
  type IntensityPreference,
  type Occasion,
  type Product
} from "@/data/types";

/* ----------------------------------------------------------- definiciones */

export interface NoteGroup {
  id: string;
  label: string;
  /** Coincide si alguna de estas cadenas aparece en la pirámide. */
  matches: string[];
}

/** Grupos de notas construidos a partir de las notas reales del catálogo. */
export const NOTE_GROUPS: NoteGroup[] = [
  { id: "citricos", label: "Cítricos", matches: ["Bergamota", "Limón", "Pomelo", "Mandarina", "Naranja", "Petitgrain"] },
  { id: "vainilla", label: "Vainilla", matches: ["Vainilla"] },
  { id: "cafe-cacao", label: "Café y cacao", matches: ["Café", "Cacao"] },
  { id: "dulces", label: "Caramelo y miel", matches: ["Praliné", "Caramelo", "Miel", "Azúcar", "Almendra", "Haba tonka", "Dátiles", "Castaña"] },
  { id: "especias", label: "Especias", matches: ["Canela", "Pimienta", "Cardamomo", "Nuez moscada", "Jengibre", "Azafrán", "Anís", "Alcaravea", "Hinojo"] },
  { id: "lavanda", label: "Lavanda", matches: ["Lavanda"] },
  { id: "maderas", label: "Maderas", matches: ["Cedro", "Sándalo", "Vetiver", "Madera", "Pachulí", "Guayaco", "Roble"] },
  { id: "flores-blancas", label: "Flores blancas", matches: ["Jazmín", "Azahar", "Nardo", "Gardenia", "Muguet", "Fresia"] },
  { id: "rosa", label: "Rosa", matches: ["Rosa", "Peonía", "Iris", "Violeta", "Orquídea"] },
  { id: "frutas", label: "Frutas", matches: ["Manzana", "Pera", "Ananá", "Durazno", "Ciruela", "Grosella", "Lichi", "Frutas", "Melón", "Osmanto", "Ruibarbo"] },
  { id: "tabaco-cuero", label: "Tabaco y cuero", matches: ["Tabaco", "Cuero", "Abedul", "Humo", "Incienso", "Olíbano", "Gamuza", "Mirra"] },
  { id: "ambar", label: "Ámbar y resinas", matches: ["Ámbar", "Ambroxan", "Amberwood", "Ambrofix", "Labdanum", "Benjuí", "Resina"] },
  { id: "marino", label: "Marino y acuático", matches: ["marina", "acuática", "acuáticas", "Sal", "Pepino", "mineral"] },
  { id: "verdes", label: "Hierbas y verdes", matches: ["Salvia", "Menta", "Albahaca", "Romero", "Artemisa", "Laurel", "Hoja", "Geranio", "Té", "Enebro"] },
  { id: "almizcle", label: "Almizcle limpio", matches: ["Almizcle"] }
];

export interface AdvisorAnswers {
  family: Family | "sin-definir" | null;
  noteGroups: string[];
  /** true cuando el usuario elige "prefiero que me guíen". */
  notesOpen: boolean;
  occasion: Occasion | null;
  /** Preferencia de presencia. Se lee como CARÁCTER, nunca como duración. */
  intensity: IntensityPreference | "sin-definir" | null;
  gender: Gender | "indistinto" | null;
}

export const EMPTY_ANSWERS: AdvisorAnswers = {
  family: null,
  noteGroups: [],
  notesOpen: false,
  occasion: null,
  intensity: null,
  gender: null
};

/* ------------------------------------------------------------- afinidades */

/**
 * Afinidad familia → ocasión. Criterio editorial uniforme, usado sólo cuando
 * la fuente del producto no declara ocasiones.
 */
const OCCASION_AFFINITY: Record<Occasion, Family[]> = {
  diario: ["citrico-fresco", "acuatico", "aromatico-limpio", "floral"],
  trabajo: ["citrico-fresco", "acuatico", "aromatico-limpio", "amaderado"],
  cita: ["gourmand-dulce", "ambarado-intenso", "especiado", "floral"],
  noche: ["gourmand-dulce", "ambarado-intenso", "cuero-ahumado", "especiado"],
  evento: ["ambarado-intenso", "amaderado", "cuero-ahumado", "floral"],
  regalo: ["gourmand-dulce", "floral", "citrico-fresco", "amaderado"],
  versatil: ["amaderado", "aromatico-limpio", "citrico-fresco", "especiado"]
};

/* ---------------------------------------------------------------- scoring */

export interface Recommendation {
  product: Product;
  score: number;
  /** Motivos en lenguaje natural, todos trazables a un dato verificado. */
  reasons: string[];
}

/** Todas las notas verificadas de una fragancia, para cruzar con lo elegido. */
function notesText(product: Product): string {
  const o = product.olfactory!;
  return [...o.topNotes, ...o.middleNotes, ...o.baseNotes].join(" | ").toLowerCase();
}

function matchedNoteGroups(product: Product, selected: string[]): NoteGroup[] {
  if (selected.length === 0) return [];
  const haystack = notesText(product);
  return NOTE_GROUPS.filter(
    (g) => selected.includes(g.id) && g.matches.some((m) => haystack.includes(m.toLowerCase()))
  );
}

export function recommend(answers: AdvisorAnswers, limit = 5): Recommendation[] {
  const pool = VERIFIED_PRODUCTS.filter((product) => {
    if (!answers.gender || answers.gender === "indistinto") return true;
    // Un unisex siempre entra; un masculino no se ofrece a quien pidió femenino.
    return product.gender === answers.gender || product.gender === "unisex";
  });

  const scored: Recommendation[] = pool.map((product) => {
    const o = product.olfactory!;
    let score = 0;
    const reasons: string[] = [];

    // 1. Familia olfativa — el criterio de mayor peso.
    if (answers.family && answers.family !== "sin-definir") {
      if (o.families.includes(answers.family)) {
        const position = o.families.indexOf(answers.family);
        score += position === 0 ? 10 : 7;
        reasons.push(`Es ${FAMILY_LABELS[answers.family].toLowerCase()}, que es lo que buscabas`);
      }
    }

    // 2. Notas elegidas.
    const noteHits = matchedNoteGroups(product, answers.noteGroups);
    if (noteHits.length > 0) {
      score += noteHits.length * 4;
      const labels = noteHits.map((g) => g.label.toLowerCase());
      reasons.push(
        labels.length === 1
          ? `Tiene ${labels[0]} en su composición`
          : `Cruza ${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`
      );
    }

    // 3. Ocasión.
    if (answers.occasion) {
      if (o.occasions.includes(answers.occasion)) {
        score += 6;
        reasons.push(`Está referenciado para ${OCCASION_LABELS[answers.occasion].toLowerCase()}`);
      } else if (o.occasions.length === 0) {
        const affine = OCCASION_AFFINITY[answers.occasion].filter((f) => o.families.includes(f));
        if (affine.length > 0) {
          score += 3;
          reasons.push(`Su perfil encaja con ${OCCASION_LABELS[answers.occasion].toLowerCase()}`);
        }
      }
    }

    // 4. Carácter aromático. Es una lectura de CÓMO SE PERCIBE la composición,
    //    no de cuánto dura ni de cuánto proyecta. Una fragancia sin carácter
    //    cargado no se penaliza: simplemente no suma por este criterio.
    if (answers.intensity && answers.intensity !== "sin-definir" && o.aromaticIntensity) {
      const caracter = INTENSITY_PREFERENCE_OF[o.aromaticIntensity];
      if (caracter === answers.intensity) {
        score += 4;
        reasons.push(
          answers.intensity === "marcada"
            ? "Tiene el carácter marcado que buscabas"
            : answers.intensity === "discreta"
              ? "Es de carácter contenido, como pediste"
              : "Su carácter aromático es equilibrado, como pediste"
        );
      } else {
        score -= 2;
      }
    }

    // 5. Empujoncito a lo versátil cuando el usuario no definió familia.
    if ((!answers.family || answers.family === "sin-definir") && o.seasons.includes("todo-el-ano")) {
      score += 2;
      reasons.push("Funciona en cualquier época del año");
    }

    // 6. Performance NOX — criterio EXTRA, y sólo si NOX la probó.
    //    Nunca resta: no tener prueba propia no es un defecto de la fragancia.
    if (product.performance.verified && answers.intensity === "marcada") {
      score += 2;
      reasons.push("Su rendimiento está probado por NOX");
    }

    return { product, score, reasons };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.product.inspiredBy.localeCompare(b.product.inspiredBy, "es"))
    .slice(0, limit);
}

/** ¿Las respuestas alcanzan para recomendar algo con criterio? */
export function hasEnoughSignal(answers: AdvisorAnswers): boolean {
  const familyDefined = Boolean(answers.family && answers.family !== "sin-definir");
  return familyDefined || answers.noteGroups.length > 0 || Boolean(answers.occasion);
}

/** Traduce las respuestas al texto que se manda por WhatsApp. */
export function answersToMessageFields(answers: AdvisorAnswers): Record<string, string> {
  const noteLabels = NOTE_GROUPS.filter((g) => answers.noteGroups.includes(g.id)).map((g) => g.label);

  return {
    "Tipo de aroma":
      answers.family && answers.family !== "sin-definir"
        ? FAMILY_LABELS[answers.family]
        : "No estoy seguro",
    "Notas que me gustan": answers.notesOpen
      ? "Prefiero que me guíen"
      : noteLabels.length > 0
        ? noteLabels.join(", ")
        : "Sin preferencia",
    Ocasión: answers.occasion ? OCCASION_LABELS[answers.occasion] : "Sin definir",
    Intensidad:
      answers.intensity && answers.intensity !== "sin-definir"
        ? INTENSITY_PREFERENCE_LABELS[answers.intensity]
        : "Sin preferencia",
    Perfil:
      answers.gender && answers.gender !== "indistinto"
        ? answers.gender.charAt(0).toUpperCase() + answers.gender.slice(1)
        : "Indistinto"
  };
}
