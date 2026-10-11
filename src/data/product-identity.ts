/**
 * IDENTIDAD ESTABLE DE PRODUCTOS
 *
 * Antes, el slug (que es también el `id` del producto) se recalculaba en cada
 * build a partir de casa + nombre, y si el slug base se repetía se le agregaba
 * el género a TODAS las apariciones. Consecuencia: sumar una fragancia
 * homónima en otro género renombraba la que ya existía, y con ella su URL
 * pública, su portada, su perfil olfativo y los pedidos guardados.
 *
 * Ahora el slug sale de un registro explícito (product-ids.ts):
 *
 *   · Un producto registrado usa SIEMPRE el slug del registro. Nunca se
 *     recalcula, aunque aparezca un homónimo.
 *   · Un producto nuevo (todavía no registrado) recibe un slug calculado una
 *     sola vez, que no puede chocar con ninguno existente. Después se registra
 *     con `npm run ids:registrar` y queda fijo.
 *   · Un cambio de nombre o de casa en catalog.raw.ts NO cambia el slug en
 *     silencio: la entrada del registro queda huérfana y el armado del
 *     catálogo falla con un mensaje claro. Para renombrar se edita la entrada
 *     del registro (casa / nombre) conservando su slug.
 *
 * Este módulo es puro: no importa datos, para poder probarlo con catálogos
 * temporales (scripts/qa-identificadores.ts).
 */

import type { Gender, Origin, RawGroup } from "./catalog.raw";

/* ------------------------------------------------------------------ utils */

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/&/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ------------------------------------------------------------------ tipos */

/** Lo que identifica a una fragancia dentro del catálogo maestro. */
export interface ProductIdentity {
  house: string;
  name: string;
  gender: Gender;
  origin: Origin;
}

/** Entrada del registro: identidad + slug congelado. */
export interface RegisteredProductId extends ProductIdentity {
  slug: string;
}

export interface Draft extends ProductIdentity {
  baseSlug: string;
}

export interface AssignedDraft extends Draft {
  slug: string;
  /** false = producto nuevo, todavía sin entrada en el registro. */
  registered: boolean;
}

export class ProductIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductIdentityError";
  }
}

/** Clave de identidad. Incluye género y origen: así se distinguen los homónimos. */
export function identityKey(i: ProductIdentity): string {
  return `${i.gender}|${i.origin}|${i.house}|${i.name}`;
}

const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ------------------------------------------------------------- borradores */

/** Recorre el catálogo maestro en su orden original. */
export function collectDrafts(raw: readonly RawGroup[]): Draft[] {
  const drafts: Draft[] = [];
  for (const group of raw) {
    for (const [house, names] of Object.entries(group.brands)) {
      for (const name of names) {
        drafts.push({
          house,
          name,
          gender: group.gender,
          origin: group.origin,
          baseSlug: slugify(`${house} ${name}`)
        });
      }
    }
  }
  return drafts;
}

/* ------------------------------------------------------------- asignación */

/**
 * Asigna el slug definitivo a cada borrador.
 *
 * Falla (lanza ProductIdentityError) ante cualquier situación que hoy
 * cambiaría un identificador sin que nadie lo decida: entradas del registro
 * duplicadas o huérfanas, fragancias repetidas en el catálogo maestro o un
 * slug nuevo que choca con uno existente.
 */
export function assignStableSlugs(
  drafts: readonly Draft[],
  registry: readonly RegisteredProductId[]
): AssignedDraft[] {
  const problemas: string[] = [];

  // 1. El registro tiene que ser coherente consigo mismo.
  const porClave = new Map<string, RegisteredProductId>();
  const slugsRegistrados = new Set<string>();
  for (const entry of registry) {
    const key = identityKey(entry);
    if (porClave.has(key)) problemas.push(`Registro: identidad repetida "${key}".`);
    if (slugsRegistrados.has(entry.slug)) problemas.push(`Registro: slug repetido "${entry.slug}".`);
    if (!SLUG_VALIDO.test(entry.slug)) problemas.push(`Registro: slug inválido "${entry.slug}".`);
    porClave.set(key, entry);
    slugsRegistrados.add(entry.slug);
  }

  // 2. El catálogo maestro no puede listar dos veces la misma fragancia.
  const clavesVistas = new Set<string>();
  for (const d of drafts) {
    const key = identityKey(d);
    if (clavesVistas.has(key)) problemas.push(`Catálogo: fragancia repetida "${key}".`);
    clavesVistas.add(key);
  }

  // 3. Toda entrada registrada tiene que seguir existiendo. Si no, alguien
  //    renombró o quitó una fragancia sin actualizar el registro.
  // Array.from: el tsconfig no fija `target`, y sin ES2015 TypeScript no
  // permite recorrer un Map con for…of (TS2802).
  for (const [key, entry] of Array.from(porClave.entries())) {
    if (!clavesVistas.has(key)) {
      problemas.push(
        `Registro: "${entry.slug}" (${key}) ya no está en el catálogo maestro. ` +
          `Si se renombró, actualizá casa/nombre en src/data/product-ids.ts conservando el slug. ` +
          `Si se quitó a propósito, quitá también su entrada.`
      );
    }
  }

  if (problemas.length) throw new ProductIdentityError(problemas.join("\n"));

  // 4. Slugs ocupados: los registrados y también sus bases, para que un nuevo
  //    homónimo nunca quede con el slug "pelado" junto a variantes con sufijo.
  const ocupados = new Set<string>(slugsRegistrados);
  for (const entry of registry) ocupados.add(slugify(`${entry.house} ${entry.name}`));

  const nuevos = drafts.filter((d) => !porClave.has(identityKey(d)));
  const basesNuevas = new Map<string, number>();
  for (const d of nuevos) basesNuevas.set(d.baseSlug, (basesNuevas.get(d.baseSlug) ?? 0) + 1);

  const asignados = new Set<string>();
  const result = drafts.map((d): AssignedDraft => {
    const entry = porClave.get(identityKey(d));
    if (entry) return { ...d, slug: entry.slug, registered: true };

    const necesitaSufijo = ocupados.has(d.baseSlug) || (basesNuevas.get(d.baseSlug) ?? 0) > 1;
    const slug = necesitaSufijo ? `${d.baseSlug}-${d.gender}` : d.baseSlug;
    if (ocupados.has(slug) || asignados.has(slug)) {
      throw new ProductIdentityError(
        `Producto nuevo "${identityKey(d)}": el slug "${slug}" ya está en uso. ` +
          `Registralo a mano con un slug propio en src/data/product-ids.ts.`
      );
    }
    asignados.add(slug);
    return { ...d, slug, registered: false };
  });

  return result;
}
