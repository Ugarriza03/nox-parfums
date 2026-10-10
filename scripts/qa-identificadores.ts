/**
 * QA DE IDENTIFICADORES ESTABLES — npm run qa:ids
 *
 * Demuestra que los 233 slugs actuales no cambian aunque se agreguen
 * fragancias homónimas, que un renombre no cambia el identificador en
 * silencio y que nada de esto toca el catálogo real.
 *
 * Todas las variantes ficticias se arman sobre COPIAS en memoria de
 * RAW_CATALOG y del registro. No se escribe ningún archivo.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { RAW_CATALOG, type RawGroup } from "../src/data/catalog.raw";
import { PRODUCT_ID_REGISTRY } from "../src/data/product-ids";
import {
  assignStableSlugs,
  collectDrafts,
  identityKey,
  ProductIdentityError,
  slugify,
  type Draft,
  type RegisteredProductId
} from "../src/data/product-identity";
import { PRODUCTS, FEATURED_SLUGS } from "../src/data/products";
import { OLFACTORY_PROFILES } from "../src/data/olfactory";
import { COVER_SLUGS } from "../src/components/product/covers";

let fallas = 0;
function check(nombre: string, ok: boolean, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}
function lanza(fn: () => unknown, contiene?: string): boolean {
  try {
    fn();
    return false;
  } catch (e) {
    return e instanceof ProductIdentityError && (!contiene || e.message.includes(contiene));
  }
}

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const hashCatalogoAntes = sha(readFileSync("src/data/catalog.raw.ts", "utf8"));
const hashRegistroAntes = sha(readFileSync("src/data/product-ids.ts", "utf8"));
const rawAntes = JSON.stringify(RAW_CATALOG);

const clonar = (): RawGroup[] => JSON.parse(JSON.stringify(RAW_CATALOG));
const registroCopia = (): RegisteredProductId[] => PRODUCT_ID_REGISTRY.map((e) => ({ ...e }));
const SLUGS_REGISTRO = PRODUCT_ID_REGISTRY.map((e) => e.slug);

/** El algoritmo anterior, reproducido sólo para demostrar el problema. */
function slugsAlgoritmoAnterior(drafts: Draft[]): string[] {
  const n = new Map<string, number>();
  for (const d of drafts) n.set(d.baseSlug, (n.get(d.baseSlug) ?? 0) + 1);
  return drafts.map((d) => ((n.get(d.baseSlug) ?? 0) > 1 ? `${d.baseSlug}-${d.gender}` : d.baseSlug));
}

/** Agrega `name` a la casa `house` del grupo (género + origen) indicado. */
function agregar(raw: RawGroup[], gender: string, origin: string, house: string, name: string) {
  const grupo = raw.find((g) => g.gender === gender && g.origin === origin);
  if (!grupo) throw new Error(`grupo ${gender}/${origin} inexistente`);
  (grupo.brands[house] ??= []).push(name);
}

/** Compara los slugs de los 233 productos originales contra el registro. */
function originalesIntactos(asignados: { slug: string; registered: boolean }[]): string[] {
  const registrados = asignados.filter((a) => a.registered).map((a) => a.slug);
  return SLUGS_REGISTRO.filter((s, i) => registrados[i] !== s);
}

/* ===================================================== 1. catálogo real */
console.log("\n1. CATÁLOGO REAL\n" + "─".repeat(66));

check("el registro tiene 233 entradas", PRODUCT_ID_REGISTRY.length === 233, `${PRODUCT_ID_REGISTRY.length}`);
check("el registro no repite slugs", new Set(SLUGS_REGISTRO).size === SLUGS_REGISTRO.length);
check("el catálogo arma 233 productos", PRODUCTS.length === 233, `${PRODUCTS.length}`);
check(
  "cada producto usa exactamente el slug registrado, en el mismo orden",
  PRODUCTS.every((p, i) => p.slug === SLUGS_REGISTRO[i] && p.id === p.slug)
);
const realAsignados = assignStableSlugs(collectDrafts(RAW_CATALOG), PRODUCT_ID_REGISTRY);
check("no hay productos sin registrar", realAsignados.every((a) => a.registered));
check(
  "la casa y el nombre del registro coinciden con el catálogo",
  PRODUCTS.every((p, i) => {
    const e = PRODUCT_ID_REGISTRY[i];
    return p.house === e.house && p.inspiredBy === `${e.house} ${e.name}` && p.gender === e.gender && p.origin === e.origin;
  })
);
check(
  "el registro reproduce el algoritmo anterior sobre el catálogo actual (ningún slug cambió)",
  slugsAlgoritmoAnterior(collectDrafts(RAW_CATALOG)).every((s, i) => s === SLUGS_REGISTRO[i])
);
check("los 233 perfiles olfativos apuntan a slugs registrados", Object.keys(OLFACTORY_PROFILES).every((k) => SLUGS_REGISTRO.includes(k)));
check("las 233 portadas apuntan a slugs registrados", COVER_SLUGS.length === 233 && COVER_SLUGS.every((k) => SLUGS_REGISTRO.includes(k)));
check("las destacadas apuntan a slugs registrados", FEATURED_SLUGS.every((k) => SLUGS_REGISTRO.includes(k)));

/* =========================================== 2. homónimo en otro género */
console.log("\n2. HOMÓNIMO FICTICIO EN OTRO GÉNERO\n" + "─".repeat(66));

{
  const raw = clonar();
  agregar(raw, "femenino", "internacional", "Christian Dior", "Sauvage");
  const drafts = collectDrafts(raw);
  const asignados = assignStableSlugs(drafts, PRODUCT_ID_REGISTRY);
  const rotos = originalesIntactos(asignados);
  check("con el registro, los 233 slugs originales no cambian", rotos.length === 0, rotos.join(", "));
  const nuevo = asignados.find((a) => !a.registered);
  check(
    "Sauvage femenino (ficticio) recibe un slug propio con sufijo",
    nuevo?.slug === "christian-dior-sauvage-femenino",
    nuevo?.slug
  );
  check("el Sauvage existente conserva christian-dior-sauvage", asignados.some((a) => a.registered && a.slug === "christian-dior-sauvage"));

  const antes = slugsAlgoritmoAnterior(drafts);
  const renombradosAntes = SLUGS_REGISTRO.filter((s) => !antes.includes(s));
  check(
    "control: el algoritmo anterior SÍ habría renombrado el existente",
    renombradosAntes.includes("christian-dior-sauvage"),
    renombradosAntes.join(", ")
  );
}

{
  const raw = clonar();
  agregar(raw, "unisex", "internacional", "Dolce & Gabbana", "Light Blue");
  const asignados = assignStableSlugs(collectDrafts(raw), PRODUCT_ID_REGISTRY);
  check("Light Blue unisex (ficticio): los 233 originales no cambian", originalesIntactos(asignados).length === 0);
  check(
    "Light Blue unisex recibe dolce-gabbana-light-blue-unisex",
    asignados.find((a) => !a.registered)?.slug === "dolce-gabbana-light-blue-unisex"
  );
}

{
  const raw = clonar();
  agregar(raw, "femenino", "internacional", "Casa Ficticia", "Prueba");
  agregar(raw, "masculino", "internacional", "Casa Ficticia", "Prueba");
  const asignados = assignStableSlugs(collectDrafts(raw), PRODUCT_ID_REGISTRY);
  const nuevos = asignados.filter((a) => !a.registered).map((a) => a.slug).sort();
  check(
    "dos homónimos nuevos a la vez reciben slugs distintos con sufijo",
    JSON.stringify(nuevos) === JSON.stringify(["casa-ficticia-prueba-femenino", "casa-ficticia-prueba-masculino"]),
    nuevos.join(", ")
  );
  check("…sin tocar los 233 originales", originalesIntactos(asignados).length === 0);
}

{
  const raw = clonar();
  agregar(raw, "unisex", "internacional", "Casa Ficticia", "Unica");
  const asignados = assignStableSlugs(collectDrafts(raw), PRODUCT_ID_REGISTRY);
  check("un producto nuevo sin homónimos recibe el slug sin sufijo", asignados.find((a) => !a.registered)?.slug === "casa-ficticia-unica");
}

/* ============================================ 3. renombres y bajas */
console.log("\n3. RENOMBRES Y BAJAS\n" + "─".repeat(66));

{
  const raw = clonar();
  const grupo = raw.find((g) => g.gender === "masculino" && g.origin === "internacional")!;
  grupo.brands["Christian Dior"] = grupo.brands["Christian Dior"].map((n) => (n === "Sauvage" ? "Sauvage Renombrado" : n));
  check(
    "renombrar en el catálogo SIN actualizar el registro falla con un error claro",
    lanza(() => assignStableSlugs(collectDrafts(raw), PRODUCT_ID_REGISTRY), "christian-dior-sauvage")
  );

  const registro = registroCopia();
  const entrada = registro.find((e) => e.slug === "christian-dior-sauvage")!;
  entrada.name = "Sauvage Renombrado";
  const asignados = assignStableSlugs(collectDrafts(raw), registro);
  check(
    "renombrar catálogo + registro conserva el slug christian-dior-sauvage",
    asignados.some((a) => a.name === "Sauvage Renombrado" && a.slug === "christian-dior-sauvage")
  );
  check("…y no cambia ningún otro slug", originalesIntactos(asignados).length === 0);
  check("…aunque el slug calculado del nombre nuevo sería otro", slugify("Christian Dior Sauvage Renombrado") !== "christian-dior-sauvage");
}

{
  const raw = clonar();
  const grupo = raw.find((g) => g.gender === "femenino" && g.origin === "internacional")!;
  grupo.brands["Ariana Grande"] = grupo.brands["Ariana Grande"].filter((n) => n !== "Cloud");
  check(
    "quitar una fragancia sin quitar su entrada del registro falla",
    lanza(() => assignStableSlugs(collectDrafts(raw), PRODUCT_ID_REGISTRY), "ariana-grande-cloud")
  );
}

{
  const raw = clonar();
  agregar(raw, "femenino", "internacional", "Ariana Grande", "Cloud");
  check("una fragancia repetida en el catálogo maestro falla", lanza(() => assignStableSlugs(collectDrafts(raw), PRODUCT_ID_REGISTRY), "repetida"));
}

{
  const registro = registroCopia();
  registro[1].slug = registro[0].slug;
  check("un registro con slugs repetidos falla", lanza(() => assignStableSlugs(collectDrafts(RAW_CATALOG), registro), "slug repetido"));
}

{
  const raw = clonar();
  // Producto nuevo cuyo slug calculado ya es un slug registrado.
  agregar(raw, "femenino", "internacional", "Carolina Herrera", "212 Heroes Femenino");
  const asignados = assignStableSlugs(collectDrafts(raw), PRODUCT_ID_REGISTRY);
  const nuevo = asignados.find((a) => !a.registered);
  check(
    "un slug nuevo nunca reutiliza uno registrado",
    !!nuevo && !SLUGS_REGISTRO.includes(nuevo.slug) && originalesIntactos(asignados).length === 0,
    nuevo?.slug
  );
}

/* ====================================== 4. el catálogo real no se tocó */
console.log("\n4. SIN EFECTOS SOBRE EL CATÁLOGO REAL\n" + "─".repeat(66));

check("RAW_CATALOG en memoria no fue modificado", JSON.stringify(RAW_CATALOG) === rawAntes);
check("catalog.raw.ts no cambió en disco", sha(readFileSync("src/data/catalog.raw.ts", "utf8")) === hashCatalogoAntes);
check("product-ids.ts no cambió en disco", sha(readFileSync("src/data/product-ids.ts", "utf8")) === hashRegistroAntes);
check(
  "ningún producto ficticio quedó en el catálogo",
  !PRODUCTS.some((p) => /ficticia|renombrado/i.test(p.inspiredBy)) &&
    !PRODUCT_ID_REGISTRY.some((e) => /ficticia|renombrado/i.test(identityKey(e)))
);

console.log("\n" + "─".repeat(66));
if (fallas) {
  console.log(`${fallas} fallas`);
  process.exit(1);
}
console.log("Identificadores estables: todo OK");
