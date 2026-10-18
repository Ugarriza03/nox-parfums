/**
 * SINCRONIZACIÓN DE LA FICHA DEL CATÁLOGO V2 — lógica pura (sin red ni React).
 *
 * Evita que un formulario con valores viejos genere una revisión que revierta
 * cambios ya aprobados:
 *   · `versionFicha` identifica el estado del servidor que vio el editor; si
 *     cambia (aprobación, guardado, cambio de estado), el editor se reinicia.
 *   · `compararVersion` permite al servidor rechazar un guardado hecho sobre
 *     una versión vieja (otra pestaña, otra sesión).
 *   · Con revisión pendiente, el editor parte de la propuesta (no de la ficha
 *     publicada), para no pisar la propuesta con datos anteriores.
 *   · `igualProfundo` detecta guardados sin cambios para no crear revisiones vacías.
 *
 * Sin imports de src/data ni de Supabase: lo usan componentes de cliente,
 * Server Actions y las pruebas.
 */

import type { EstadoCatalogo } from "./catalogo-v2";

/* ------------------------------------------------------------ versión */

/** Versión esperada por el editor: lo que el servidor mostró al renderizar. */
export type VersionFicha = { updatedAt: string; estado: EstadoCatalogo; revisionAt: string | null };

export function versionFicha(v: VersionFicha): string {
  return `${v.updatedAt}|${v.estado}|${v.revisionAt ?? ""}`;
}

/** Estado actual leído en el servidor justo antes de escribir. */
export type VersionActual = { updatedAt: string | null; estado: string | null; revisionAt: string | null };

export const MENSAJE_DESACTUALIZADA =
  "La ficha cambió desde que se cargó el editor (otra pestaña, una aprobación o un cambio de estado). " +
  "Se recargaron los datos actuales: revisalos y volvé a guardar.";

/**
 * null si la versión esperada sigue vigente; si no, el motivo. Las marcas de
 * tiempo se comparan como las devuelve PostgREST (misma columna, mismo formato).
 */
export function compararVersion(esperada: unknown, actual: VersionActual): string | null {
  if (!esVersionValida(esperada)) return "Falta la versión de la ficha. Actualizá la página antes de guardar.";
  if (actual.updatedAt === null || actual.estado === null) return "No se pudo verificar la fragancia.";
  if (esperada.updatedAt !== actual.updatedAt || esperada.estado !== actual.estado ||
      (esperada.revisionAt ?? null) !== (actual.revisionAt ?? null)) {
    return MENSAJE_DESACTUALIZADA;
  }
  return null;
}

export function esVersionValida(v: unknown): v is VersionFicha {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.updatedAt === "string" && o.updatedAt.length > 0 && o.updatedAt.length <= 64 &&
    typeof o.estado === "string" && ["draft", "published", "hidden", "archived"].includes(o.estado) &&
    (o.revisionAt === null || o.revisionAt === undefined || (typeof o.revisionAt === "string" && o.revisionAt.length <= 64));
}

/* ------------------------------------------------- valores del editor */

export type FilaFicha = {
  slug: string; house: string; fragrance_name: string; gender: string; universe: string; origin: string;
  olfactory: unknown; image_path: string | null; description: string | null; inspired_label: string | null;
  data_status: string | null;
};

export type ValoresBaseEditor = {
  slug: string; house: string; fragranceName: string;
  gender: "femenino" | "masculino" | "unisex";
  universe: "disenador" | "nicho" | "arabe" | "pendiente";
  origin: "internacional" | "arabe";
  olfactory: Record<string, unknown> | null;
  imagePath: string | null;
};

const tiene = (o: Record<string, unknown> | null, k: string) => Boolean(o) && Object.hasOwn(o as object, k);

/**
 * Valores con los que arranca el editor. Si hay revisión pendiente, se parte
 * de la propuesta: guardar de nuevo la reemplaza, así que mostrar la ficha
 * publicada haría perder la propuesta anterior.
 */
export function valoresEditor(fila: FilaFicha, propuesta: Record<string, unknown> | null): ValoresBaseEditor {
  const de = <T,>(clave: string, base: T): T => (tiene(propuesta, clave) ? (propuesta as Record<string, unknown>)[clave] as T : base);
  const olfactory = de<unknown>("olfactory", fila.olfactory);
  return {
    slug: fila.slug,
    house: de("house", fila.house),
    fragranceName: de("fragrance_name", fila.fragrance_name),
    gender: de("gender", fila.gender) as ValoresBaseEditor["gender"],
    universe: de("universe", fila.universe) as ValoresBaseEditor["universe"],
    origin: de("origin", fila.origin) as ValoresBaseEditor["origin"],
    olfactory: olfactory && typeof olfactory === "object" && !Array.isArray(olfactory) ? olfactory as Record<string, unknown> : null,
    imagePath: de<string | null>("image_path", fila.image_path)
  };
}

export type ValoresComplementos = {
  description: string | null; inspiredLabel: string | null; dataStatus: "verificado" | "pendiente" | null;
};

export function valoresComplementos(fila: FilaFicha, propuesta: Record<string, unknown> | null): ValoresComplementos {
  const de = (clave: string, base: string | null) => (tiene(propuesta, clave) ? (propuesta as Record<string, unknown>)[clave] as string | null : base);
  const ds = de("data_status", fila.data_status);
  return {
    description: de("description", fila.description),
    inspiredLabel: de("inspired_label", fila.inspired_label),
    dataStatus: ds === "verificado" || ds === "pendiente" ? ds : null
  };
}

/** Igualdad estructural sin depender del orden de las claves. */
export function igualProfundo(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as unknown[];
    return a.length === bb.length && a.every((x, i) => igualProfundo(x, bb[i]));
  }
  const ka = Object.keys(a as object), kb = Object.keys(b as object);
  return ka.length === kb.length &&
    ka.every((k) => Object.hasOwn(b as object, k) && igualProfundo((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

/** true si los valores a guardar son iguales a los que mostró el servidor (guardado sin cambios). */
export function sinCambios(valores: ValoresBaseEditor, initial: Partial<ValoresBaseEditor> | undefined): boolean {
  if (!initial) return false;
  return valores.house === (initial.house ?? "").trim() &&
    valores.fragranceName === (initial.fragranceName ?? "").trim() &&
    valores.gender === initial.gender && valores.universe === initial.universe && valores.origin === initial.origin &&
    (valores.imagePath || null) === (initial.imagePath || null) &&
    igualProfundo(valores.olfactory ?? null, initial.olfactory ?? null);
}

/* ------------------------------------------------------------ avisos */

/** Avisos de página que llegan por la URL tras una acción. */
export type AvisoUrl = "creada" | "revision-aprobada";

/**
 * Texto del aviso sólo si sigue representando el estado actual; si no, null
 * (p. ej. "Borrador creado" deja de mostrarse cuando la ficha ya se publicó).
 */
export function avisoFicha(aviso: unknown, estado: EstadoCatalogo, hayRevision: boolean): string | null {
  if (aviso === "creada" && estado === "draft") return "Borrador creado. No está publicado: revisalo y publicalo cuando esté listo.";
  if (aviso === "revision-aprobada" && estado === "published" && !hayRevision) return "Revisión aprobada y aplicada a la ficha publicada.";
  return null;
}

/** Lee `?creada=1` (enlace histórico) o `?aviso=...` de la URL. */
export function leerAvisoUrl(params: Record<string, string | string[] | undefined>): AvisoUrl | null {
  const aviso = typeof params.aviso === "string" ? params.aviso : null;
  if (aviso === "creada" || aviso === "revision-aprobada") return aviso;
  if (params.creada === "1") return "creada";
  return null;
}

/* ----------------------------------------------------------- portadas */

export type ModoPortada = "edit-draft" | "propose-revision";

/** Pasos que se muestran junto al formulario de portada. */
export function pasosPortada(modo: ModoPortada): string[] {
  return modo === "propose-revision"
    ? [
        "Subí la imagen: queda guardada en almacenamiento privado, pero todavía no está asociada a la ficha.",
        "Guardá la revisión pendiente desde “Proponer cambios” (el campo “Portada privada” muestra la imagen nueva).",
        "Aprobá la revisión: recién entonces la ficha publicada usa la portada nueva."
      ]
    : [
        "Subí la imagen: queda guardada en almacenamiento privado, pero todavía no está asociada a la ficha.",
        "Guardá el borrador desde “Editar ficha”: recién entonces la ficha usa la portada nueva."
      ];
}

export function mensajePortadaSubida(modo: ModoPortada): string {
  return modo === "propose-revision"
    ? "Imagen subida, pero todavía no asociada. Guardá la revisión pendiente y después aprobala para que la ficha la use."
    : "Imagen subida, pero todavía no asociada. Guardá el borrador para que la ficha la use.";
}

/** Ayuda del campo "Portada privada" del editor. */
export function ayudaCampoPortada(modo: ModoPortada, imagenActual: string | null, imagenEditor: string | null): string {
  if ((imagenEditor || null) !== (imagenActual || null)) {
    return modo === "propose-revision"
      ? "Portada sin guardar: guardá la revisión y aprobala para asociarla."
      : "Portada sin guardar: guardá el borrador para asociarla.";
  }
  return "Se completa al subir una imagen. Para quitarla, usá “Quitar portada”.";
}
