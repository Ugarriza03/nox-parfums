/** TIPOS DEL DOMINIO NOX */

import type { Gender, Origin } from "./catalog.raw";
export type { Gender, Origin };

/** Universo comercial. "pendiente" = todavía no clasificado con fuente confiable. */
export type Universe = "disenador" | "nicho" | "arabe" | "pendiente";

/** Familia olfativa. Es el eje principal del asesor. */
export type Family =
  | "citrico-fresco"
  | "acuatico"
  | "aromatico-limpio"
  | "amaderado"
  | "especiado"
  | "floral"
  | "gourmand-dulce"
  | "ambarado-intenso"
  | "cuero-ahumado";

export type Occasion =
  | "diario"
  | "trabajo"
  | "cita"
  | "noche"
  | "evento"
  | "regalo"
  | "versatil";

export type Season = "calor" | "frio" | "todo-el-ano";

/**
 * CARÁCTER AROMÁTICO de la composición.
 *
 * Describe CÓMO SE PERCIBE el perfil olfativo —suave, envolvente, marcado—,
 * no su rendimiento físico. No dice cuántas horas dura, cuánto proyecta ni qué
 * estela deja: eso es performance y vive en NoxPerformance, separado y sólo
 * cuando NOX lo probó.
 */
export type AromaticIntensity =
  | "suave"
  | "equilibrada"
  | "intensa"
  | "envolvente"
  | "marcada";

/** Lo que el asesor pregunta: qué tanta presencia quiere percibir la persona. */
export type IntensityPreference = "discreta" | "equilibrada" | "marcada";

/** Escala cualitativa de performance. Sólo se usa sobre datos medidos por NOX. */
export type PerformanceLevel = "baja" | "media" | "media-alta" | "alta" | "muy-alta";

/** Estela percibida. Sólo se usa sobre datos medidos por NOX. */
export type SillageLevel = "cercana" | "moderada" | "marcada" | "amplia";

/**
 * PERFIL OLFATIVO.
 *
 * Describe CÓMO HUELE la composición: notas, acordes, familias, evolución y
 * carácter. La referencia que inspira cada interpretación NOX nos dice esto con
 * suficiente respaldo, así que es la base de la ficha.
 *
 * Lo que NO entra acá: duración, horas, proyección, estela ni rendimiento. Eso
 * es performance del producto NOX, se mide, y vive en NoxPerformance.
 *
 * La procedencia de cada perfil (URL, fecha, estado del match) vive en
 * data/olfactory.sources.ts — capa interna que la web pública no importa.
 */
export interface OlfactoryProfile {
  /** Familia principal. Es la que manda en filtros y asesor. */
  family: Family | null;
  /** Perfil completo: una fragancia puede cruzar varias familias. */
  families: Family[];
  /** Acordes principales, en orden de prominencia. */
  accords: string[];
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  /** 3 a 5 notas para card, asesor y buscador. */
  mainNotes: string[];
  /** Sólo ocasiones con respaldo. Puede quedar vacío. */
  occasions: Occasion[];
  seasons: Season[];
  /**
   * Carácter aromático. Se deriva de los acordes verificados con un criterio
   * uniforme (ver scripts/lib/fragrantica.mjs → aromaticIntensityFromAccords).
   * NO es duración ni proyección.
   */
  aromaticIntensity: AromaticIntensity | null;
  /**
   * Descripción sensorial, redacción propia de NOX construida a partir de los
   * acordes y las notas verificadas. No copia texto editorial de terceros.
   */
  feel: string;
  /** Para "Te puede gustar si…". Derivado de los acordes. */
  likeIf: string[];
}

/**
 * PERFORMANCE DEL PRODUCTO NOX — capa separada.
 *
 * Duración, proyección, estela y rendimiento del extracto NOX. NO se deduce de
 * la fragancia de referencia ni se completa desde ninguna fuente externa: sólo
 * se carga cuando NOX lo probó, y hasta entonces `verified` es false y la ficha
 * no afirma nada al respecto.
 *
 * El autocompletado olfativo tiene prohibido escribir acá (ver la guardia en
 * scripts/autocompletar-olfativo.ts).
 */
export interface NoxPerformance {
  /** false mientras NOX no lo haya probado. Nada se publica con false. */
  verified: boolean;
  longevity: PerformanceLevel | null;
  projection: PerformanceLevel | null;
  sillage: SillageLevel | null;
  performanceIntensity: PerformanceLevel | null;
  /** Fecha de la prueba NOX (YYYY-MM). */
  testedAt: string | null;
  /** Observación interna de la prueba. */
  notes: string | null;
}

/** Confianza del match entre el producto NOX y la fragancia de referencia. */
export type MatchConfidence = "exact" | "normalized" | "ambiguous" | "not-found";

/**
 * Procedencia de un perfil — CAPA INTERNA.
 * No se muestra en la ficha pública: sirve para auditar y re-verificar.
 */
export interface SourceRecord {
  name: string;
  /**
   * URL COMPROBADA. Sólo se llena cuando alguien abrió esa ficha y la fechó en
   * `checkedAt`. Una referencia probable pero sin comprobar va en
   * `candidateUrl` y nunca acá: así es imposible confundir una pista con
   * procedencia.
   */
  url: string;
  /** Referencia probable, todavía sin comprobar. No es procedencia. */
  candidateUrl?: string;
  /** "verified" = comprobada y fechada · "candidate" = todavía no. */
  urlStatus?: "verified" | "candidate";
  checkedAt: string | null;
  /** "secondary": describe el perfume de referencia, no al extrait NOX. */
  status: "secondary";
  /** Marca y nombre exactos con los que se validó el match. */
  matchedBrand: string;
  matchedName: string;
  matchConfidence: MatchConfidence;
  /**
   * Cómo entró el dato:
   *   "remoto"  el script leyó la fuente directamente
   *   "archivo" entrada estructurada validada (--source-file), usada cuando la
   *             consulta remota no está disponible
   * Ambos caminos pasan por el mismo matcher, la misma validación y el mismo
   * schema. Opcional por compatibilidad con los registros ya cargados.
   */
  intake?: "remoto" | "archivo";
  /** true cuando el match no fue concluyente y hay que revisarlo a mano. */
  needsReview: boolean;
  /** Candidatos descartados, para resolver la revisión más rápido. */
  candidates?: string[];
  note?: string;
  /**
   * Origen de la redacción sensorial de la ficha:
   *   "auto"      compuesta desde los acordes por el autocompletado
   *   "editorial" escrita a mano por NOX
   */
  copy?: "auto" | "editorial";
}

export interface Product {
  id: string;
  slug: string;
  /** Nombre de la fragancia original que inspira el extracto NOX. */
  inspiredBy: string;
  /** Marca de la fragancia original. NOX siempre es la marca protagonista. */
  house: string;
  /** Texto listo para mostrar: "Inspirado en Valentino Born in Roma". */
  inspiredLabel: string;
  gender: Gender;
  origin: Origin;
  universe: Universe;
  // Las notas de revisión NO viven en Product: son internas y se consultan
  // desde los scripts en src/data/review-notes.ts, que la web no importa.
  olfactory: OlfactoryProfile | null;
  /** Siempre presente. `verified: false` mientras NOX no haya probado el extracto. */
  performance: NoxPerformance;
  dataStatus: "verificado" | "pendiente";
  /**
   * Imagen de producto. Cuando es null se usa la composición generativa
   * (ver components/product/FragranceVisual).
   */
  image: string | null;
}

/* --------------------------------------------------- etiquetas de interfaz */

export const FAMILY_LABELS: Record<Family, string> = {
  "citrico-fresco": "Cítrico y fresco",
  acuatico: "Acuático",
  "aromatico-limpio": "Aromático y limpio",
  amaderado: "Amaderado",
  especiado: "Especiado",
  floral: "Floral",
  "gourmand-dulce": "Dulce y gourmand",
  "ambarado-intenso": "Ambarado e intenso",
  "cuero-ahumado": "Cuero y ahumado"
};

export const OCCASION_LABELS: Record<Occasion, string> = {
  diario: "Todos los días",
  trabajo: "Trabajo o estudio",
  cita: "Una cita",
  noche: "Noche y salidas",
  evento: "Un evento",
  regalo: "Para regalar",
  versatil: "Algo versátil"
};

export const SEASON_LABELS: Record<Season, string> = {
  calor: "Calor",
  frio: "Frío",
  "todo-el-ano": "Todo el año"
};

/** Carácter aromático, como se muestra en la ficha. */
export const AROMATIC_INTENSITY_LABELS: Record<AromaticIntensity, string> = {
  suave: "Suave",
  equilibrada: "Equilibrada",
  intensa: "Intensa",
  envolvente: "Envolvente",
  marcada: "Marcada"
};

/**
 * A qué preferencia del asesor responde cada carácter aromático.
 * Es una lectura de carácter, no de duración ni de proyección.
 */
export const INTENSITY_PREFERENCE_OF: Record<AromaticIntensity, IntensityPreference> = {
  suave: "discreta",
  equilibrada: "equilibrada",
  intensa: "marcada",
  envolvente: "marcada",
  marcada: "marcada"
};

export const INTENSITY_PREFERENCE_LABELS: Record<IntensityPreference, string> = {
  discreta: "Discreta",
  equilibrada: "Equilibrada",
  marcada: "Que se note"
};

/* ------------------------------------------- performance NOX (sólo medida) */

export const PERFORMANCE_LEVEL_LABELS: Record<PerformanceLevel, string> = {
  baja: "Baja",
  media: "Media",
  "media-alta": "Media-alta",
  alta: "Alta",
  "muy-alta": "Muy alta"
};

export const SILLAGE_LABELS: Record<SillageLevel, string> = {
  cercana: "Cercana",
  moderada: "Moderada",
  marcada: "Marcada",
  amplia: "Amplia"
};

export const GENDER_LABELS: Record<Gender, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  unisex: "Unisex"
};

export const UNIVERSE_LABELS: Record<Universe, string> = {
  disenador: "Diseñador",
  nicho: "Nicho",
  arabe: "Árabes",
  pendiente: "Sin clasificar"
};
