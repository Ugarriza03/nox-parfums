/**
 * CATÁLOGO V2 EN NOX ADMIN — lógica pura (sin Supabase, sin React).
 *
 * Etiquetas, filtros de la URL, paginación, perfil olfativo estructurado y
 * traducción de errores de las RPC. Todo lo que llega de la URL o de un
 * formulario se trata como no confiable.
 *
 * Catálogo ≠ Inventario: nada de este módulo lee ni escribe stock.
 */

// Sin imports de src/data: este módulo lo usan componentes de cliente del
// panel y el navegador de /admin no debe descargar datos de la tienda
// (scripts/qa-admin.ts lo verifica). Las etiquetas replican las de
// src/data/types.ts; scripts/admin/test-catalogo-admin.ts comprueba que sean
// idénticas.
type Family =
  | "citrico-fresco" | "acuatico" | "aromatico-limpio" | "amaderado" | "especiado"
  | "floral" | "gourmand-dulce" | "ambarado-intenso" | "cuero-ahumado";
type Occasion = "diario" | "trabajo" | "cita" | "noche" | "evento" | "regalo" | "versatil";
type Season = "calor" | "frio" | "todo-el-ano";
type AromaticIntensity = "suave" | "equilibrada" | "intensa" | "envolvente" | "marcada";

const FAMILY_LABELS: Record<Family, string> = {
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
const OCCASION_LABELS: Record<Occasion, string> = {
  diario: "Todos los días",
  trabajo: "Trabajo o estudio",
  cita: "Una cita",
  noche: "Noche y salidas",
  evento: "Un evento",
  regalo: "Para regalar",
  versatil: "Algo versátil"
};
const SEASON_LABELS: Record<Season, string> = { calor: "Calor", frio: "Frío", "todo-el-ano": "Todo el año" };
const AROMATIC_INTENSITY_LABELS: Record<AromaticIntensity, string> = {
  suave: "Suave",
  equilibrada: "Equilibrada",
  intensa: "Intensa",
  envolvente: "Envolvente",
  marcada: "Marcada"
};
const GENDER_LABELS = { masculino: "Masculino", femenino: "Femenino", unisex: "Unisex" } as const;
const UNIVERSE_LABELS = { disenador: "Diseñador", nicho: "Nicho", arabe: "Árabes", pendiente: "Sin clasificar" } as const;

export type EstadoCatalogo = "draft" | "published" | "hidden" | "archived";
export type GeneroCatalogo = "femenino" | "masculino" | "unisex";
export type CategoriaCatalogo = "disenador" | "nicho" | "arabe" | "pendiente";
export type OrigenCatalogo = "internacional" | "arabe";

export const ESTADOS_CATALOGO: readonly EstadoCatalogo[] = ["draft", "published", "hidden", "archived"];
export const GENEROS_CATALOGO: readonly GeneroCatalogo[] = ["femenino", "masculino", "unisex"];
export const CATEGORIAS_CATALOGO: readonly CategoriaCatalogo[] = ["disenador", "nicho", "arabe", "pendiente"];
export const ORIGENES_CATALOGO: readonly OrigenCatalogo[] = ["internacional", "arabe"];

export const ETIQUETA_ESTADO_CATALOGO: Record<EstadoCatalogo, string> = {
  draft: "Borrador",
  published: "Publicada",
  hidden: "Oculta",
  archived: "Archivada"
};
export const ETIQUETA_GENERO: Record<GeneroCatalogo, string> = GENDER_LABELS;
export const ETIQUETA_CATEGORIA: Record<CategoriaCatalogo, string> = UNIVERSE_LABELS;
export const ETIQUETA_ORIGEN: Record<OrigenCatalogo, string> = { internacional: "Internacional", arabe: "Árabe" };

export const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function esSlugValido(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length > 0 && slug.length <= 120 && SLUG_VALIDO.test(slug);
}

/** Identificador sugerido para una fragancia nueva (el definitivo se congela al crear). */
export function sugerirSlug(marca: string, nombre: string): string {
  return `${marca} ${nombre}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

/* ------------------------------------------------------------- listado */

export interface FilaListadoCatalogo {
  slug: string;
  house: string;
  fragrance_name: string;
  gender: string;
  universe: string;
  status: string;
  updated_at: string;
}

export interface FiltrosCatalogo {
  q: string;
  estado?: EstadoCatalogo;
  genero?: GeneroCatalogo;
  categoria?: CategoriaCatalogo;
  revision: boolean;
  pagina: number;
}

export const TAMANIO_PAGINA = 25;

type Parametros = Record<string, string | string[] | undefined>;

function uno(p: Parametros, clave: string): string {
  const v = p[clave];
  return (Array.isArray(v) ? v[0] ?? "" : v ?? "").trim().slice(0, 120);
}

function elegir<T extends string>(valor: string, permitidos: readonly T[]): T | undefined {
  return (permitidos as readonly string[]).includes(valor) ? (valor as T) : undefined;
}

export function leerFiltrosCatalogo(p: Parametros): FiltrosCatalogo {
  const pagina = Number.parseInt(uno(p, "pagina"), 10);
  return {
    q: uno(p, "q"),
    estado: elegir(uno(p, "estado"), ESTADOS_CATALOGO),
    genero: elegir(uno(p, "genero"), GENEROS_CATALOGO),
    categoria: elegir(uno(p, "categoria"), CATEGORIAS_CATALOGO),
    revision: uno(p, "revision") === "1",
    pagina: Number.isFinite(pagina) && pagina >= 1 && pagina <= 10_000 ? pagina : 1
  };
}

export function normalizarTexto(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export interface ResultadoListado<T> {
  filas: T[];
  total: number;
  pagina: number;
  paginas: number;
}

export function filtrarCatalogo<T extends FilaListadoCatalogo>(
  filas: readonly T[],
  f: FiltrosCatalogo,
  conRevision: ReadonlySet<string>
): ResultadoListado<T> {
  const q = normalizarTexto(f.q);
  const coinciden = filas.filter(
    (fila) =>
      (!q || normalizarTexto(`${fila.house} ${fila.fragrance_name} ${fila.slug}`).includes(q)) &&
      (!f.estado || fila.status === f.estado) &&
      (!f.genero || fila.gender === f.genero) &&
      (!f.categoria || fila.universe === f.categoria) &&
      (!f.revision || conRevision.has(fila.slug))
  );
  const paginas = Math.max(1, Math.ceil(coinciden.length / TAMANIO_PAGINA));
  const pagina = Math.min(f.pagina, paginas);
  const inicio = (pagina - 1) * TAMANIO_PAGINA;
  return { filas: coinciden.slice(inicio, inicio + TAMANIO_PAGINA), total: coinciden.length, pagina, paginas };
}

/** Query string de un filtro, sin valores vacíos (para enlaces de paginación). */
export function urlFiltros(f: FiltrosCatalogo, cambios: Partial<FiltrosCatalogo> = {}): string {
  const final = { ...f, ...cambios };
  const p = new URLSearchParams();
  if (final.q) p.set("q", final.q);
  if (final.estado) p.set("estado", final.estado);
  if (final.genero) p.set("genero", final.genero);
  if (final.categoria) p.set("categoria", final.categoria);
  if (final.revision) p.set("revision", "1");
  if (final.pagina > 1) p.set("pagina", String(final.pagina));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/* ---------------------------------------------------- perfil olfativo */

export const FAMILIAS = Object.keys(FAMILY_LABELS) as Family[];
export const OCASIONES = Object.keys(OCCASION_LABELS) as Occasion[];
export const ESTACIONES = Object.keys(SEASON_LABELS) as Season[];
export const INTENSIDADES = Object.keys(AROMATIC_INTENSITY_LABELS) as AromaticIntensity[];
export { FAMILY_LABELS, OCCASION_LABELS, SEASON_LABELS, AROMATIC_INTENSITY_LABELS };

/** Campos del perfil que el editor estructurado conoce. El resto se conserva intacto. */
export const CLAVES_PERFIL = [
  "family", "families", "accords", "topNotes", "middleNotes", "baseNotes",
  "mainNotes", "occasions", "seasons", "aromaticIntensity", "feel", "likeIf"
] as const;

export interface PerfilEditable {
  family: string;
  families: string[];
  accords: string;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  mainNotes: string;
  occasions: string[];
  seasons: string[];
  aromaticIntensity: string;
  feel: string;
  likeIf: string;
}

function lista(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function perfilAEditable(perfil: Record<string, unknown> | null): PerfilEditable {
  const p = perfil ?? {};
  return {
    family: typeof p.family === "string" ? p.family : "",
    families: lista(p.families),
    accords: lista(p.accords).join(", "),
    topNotes: lista(p.topNotes).join(", "),
    middleNotes: lista(p.middleNotes).join(", "),
    baseNotes: lista(p.baseNotes).join(", "),
    mainNotes: lista(p.mainNotes).join(", "),
    occasions: lista(p.occasions),
    seasons: lista(p.seasons),
    aromaticIntensity: typeof p.aromaticIntensity === "string" ? p.aromaticIntensity : "",
    feel: typeof p.feel === "string" ? p.feel : "",
    likeIf: lista(p.likeIf).join("\n")
  };
}

/** Divide sin reordenar ni deduplicar: guardar sin cambios no altera el perfil. */
function separar(texto: string, separador: RegExp): string[] {
  return texto.split(separador).map((parte) => parte.trim().replace(/\s+/g, " ")).filter(Boolean);
}

export type ResultadoPerfil = { ok: true; perfil: Record<string, unknown> | null } | { ok: false; error: string };

/**
 * Convierte el formulario en el JSON del perfil. Conserva las claves que el
 * editor no conoce (`base`), valida familias, ocasiones, estaciones e
 * intensidad contra los valores de la tienda, y devuelve null si todo está vacío.
 */
export function editableAPerfil(e: PerfilEditable, base: Record<string, unknown> | null): ResultadoPerfil {
  if (e.family && !FAMILIAS.includes(e.family as Family)) return { ok: false, error: "La familia principal no es válida." };
  if (e.families.some((f) => !FAMILIAS.includes(f as Family))) return { ok: false, error: "Hay familias no válidas." };
  if (e.occasions.some((o) => !OCASIONES.includes(o as Occasion))) return { ok: false, error: "Hay ocasiones no válidas." };
  if (e.seasons.some((s) => !ESTACIONES.includes(s as Season))) return { ok: false, error: "Hay estaciones no válidas." };
  if (e.aromaticIntensity && !INTENSIDADES.includes(e.aromaticIntensity as AromaticIntensity)) {
    return { ok: false, error: "El carácter aromático no es válido." };
  }
  if (e.feel.length > 1200) return { ok: false, error: "La descripción sensorial admite hasta 1200 caracteres." };
  const textos = [e.accords, e.topNotes, e.middleNotes, e.baseNotes, e.mainNotes, e.likeIf];
  if (textos.some((t) => t.length > 4000)) return { ok: false, error: "Alguna lista de notas es demasiado larga." };

  const conocido: Record<string, unknown> = {
    family: e.family || null,
    families: [...e.families],
    accords: separar(e.accords, /[,;\n]/),
    topNotes: separar(e.topNotes, /[,;\n]/),
    middleNotes: separar(e.middleNotes, /[,;\n]/),
    baseNotes: separar(e.baseNotes, /[,;\n]/),
    mainNotes: separar(e.mainNotes, /[,;\n]/),
    // Se respeta el orden existente: guardar sin tocar no genera diferencias.
    occasions: [...e.occasions],
    seasons: [...e.seasons],
    aromaticIntensity: e.aromaticIntensity || null,
    feel: e.feel.trim(),
    likeIf: separar(e.likeIf, /\n/)
  };
  const vacio = Object.values(conocido).every((v) => v === null || v === "" || (Array.isArray(v) && v.length === 0));
  const extras = Object.fromEntries(
    Object.entries(base ?? {}).filter(([k]) => !(CLAVES_PERFIL as readonly string[]).includes(k))
  );
  if (vacio && Object.keys(extras).length === 0) return { ok: true, perfil: base === null ? null : {} };
  return { ok: true, perfil: { ...extras, ...conocido } };
}

/* --------------------------------------------------- diferencias */

export const CAMPOS_REVISION: { clave: string; etiqueta: string }[] = [
  { clave: "house", etiqueta: "Marca" },
  { clave: "fragrance_name", etiqueta: "Fragancia" },
  { clave: "gender", etiqueta: "Género" },
  { clave: "universe", etiqueta: "Categoría" },
  { clave: "origin", etiqueta: "Origen" },
  { clave: "image_path", etiqueta: "Portada" },
  { clave: "olfactory", etiqueta: "Perfil olfativo" },
  { clave: "inspired_label", etiqueta: "Referencia de inspiración" },
  { clave: "description", etiqueta: "Descripción" },
  { clave: "data_status", etiqueta: "Estado de datos" },
  { clave: "performance", etiqueta: "Rendimiento NOX" }
];

function estable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(estable).join(",")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${estable(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(v ?? null);
}

/** Campos que cambian entre la ficha actual y la propuesta (sólo los presentes en la propuesta). */
export function diferenciasRevision(
  actual: Record<string, unknown>,
  propuesta: Record<string, unknown>
): { clave: string; etiqueta: string; antes: unknown; despues: unknown }[] {
  return CAMPOS_REVISION.filter(({ clave }) => Object.hasOwn(propuesta, clave))
    .filter(({ clave }) => estable(actual[clave]) !== estable(propuesta[clave]))
    .map(({ clave, etiqueta }) => ({ clave, etiqueta, antes: actual[clave] ?? null, despues: propuesta[clave] ?? null }));
}

/* --------------------------------------------------- transiciones */

export const TRANSICIONES: Record<EstadoCatalogo, { destino: EstadoCatalogo; etiqueta: string; aviso: string }[]> = {
  draft: [
    { destino: "published", etiqueta: "Publicar", aviso: "Queda publicada en el catálogo V2. La tienda pública sigue usando el catálogo actual hasta autorizar la integración." },
    { destino: "archived", etiqueta: "Archivar", aviso: "El borrador queda archivado. Se puede restaurar." }
  ],
  published: [
    { destino: "hidden", etiqueta: "Ocultar", aviso: "Deja de estar publicada. Se puede volver a publicar." },
    { destino: "archived", etiqueta: "Archivar", aviso: "Queda archivada. Se puede restaurar como borrador u oculta." }
  ],
  hidden: [
    { destino: "published", etiqueta: "Volver a publicar", aviso: "Vuelve al estado publicado. Si hay una revisión pendiente, primero hay que resolverla." },
    { destino: "archived", etiqueta: "Archivar", aviso: "Queda archivada. Se puede restaurar." }
  ],
  archived: [
    { destino: "draft", etiqueta: "Restaurar como borrador", aviso: "Vuelve como borrador, sin publicarse." },
    { destino: "hidden", etiqueta: "Restaurar oculta", aviso: "Vuelve oculta, sin publicarse." }
  ]
};

/* --------------------------------------------------- errores de RPC */

export interface ErrorRpc {
  code?: string | null;
  message?: string | null;
}

/** RPC inexistente en la base (migración pendiente). */
export function esFuncionAusente(error: ErrorRpc | null | undefined): boolean {
  return Boolean(error && (error.code === "PGRST202" || error.code === "42883"));
}

/**
 * Mensaje para la persona. Los códigos NX4xx los define NOX en sus propias
 * funciones (textos en castellano, sin datos internos), así que se muestran tal
 * cual; cualquier otro error se reemplaza por un texto genérico.
 */
export function mensajeErrorRpc(error: ErrorRpc, generico: string): string {
  if (error.code === "NX401" || error.code === "42501") return "Se requiere una sesión de administrador con segundo factor (MFA).";
  if (esFuncionAusente(error)) return "Esta función todavía no está habilitada en la base de datos (migración pendiente).";
  if (error.code === "23505") return "Ya existe una fragancia con ese identificador.";
  if (error.code && /^NX4\d\d$/.test(error.code) && error.message) return error.message.slice(0, 300);
  return generico;
}
