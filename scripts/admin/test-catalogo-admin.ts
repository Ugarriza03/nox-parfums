/**
 * Pruebas de la lógica del módulo Catálogo de NOX Admin (sin red ni Supabase).
 * Ejecutar: npx tsx scripts/admin/test-catalogo-admin.ts
 */
import assert from "node:assert/strict";
import { isDeepStrictEqual } from "node:util";
import { PRODUCTS } from "../../src/data/products";
import {
  TAMANIO_PAGINA, diferenciasRevision, editableAPerfil, esFuncionAusente, esSlugValido, filtrarCatalogo,
  leerFiltrosCatalogo, mensajeErrorRpc, perfilAEditable, sugerirSlug, urlFiltros, type FilaListadoCatalogo
} from "../../src/lib/admin/catalogo-v2";
import { validarValoresFicha } from "../../src/lib/admin/catalogo-validacion";
import * as Tienda from "../../src/data/types";
import * as Admin from "../../src/lib/admin/catalogo-v2";

let casos = 0;
const caso = (nombre: string, fn: () => void) => {
  try { fn(); casos++; } catch (e) { console.error(`✗ ${nombre}`); throw e; }
};

const filas: FilaListadoCatalogo[] = PRODUCTS.map((p) => ({
  slug: p.slug, house: p.house, fragrance_name: p.inspiredBy.slice(p.house.length + 1),
  gender: p.gender, universe: p.universe, status: "published", updated_at: "2026-10-18T00:00:00Z"
}));

caso("filtros de URL no confiables", () => {
  const f = leerFiltrosCatalogo({ q: "  dior ", estado: "publicada", genero: "masculino", categoria: ["nicho", "x"], pagina: "-3", revision: "1" });
  assert.equal(f.q, "dior");
  assert.equal(f.estado, undefined);
  assert.equal(f.genero, "masculino");
  assert.equal(f.categoria, "nicho");
  assert.equal(f.pagina, 1);
  assert.equal(f.revision, true);
  assert.equal(leerFiltrosCatalogo({ pagina: "99999999" }).pagina, 1);
  assert.equal(leerFiltrosCatalogo({ q: "x".repeat(500) }).q.length, 120);
});

caso("listado completo y paginación de 233", () => {
  const r = filtrarCatalogo(filas, leerFiltrosCatalogo({}), new Set());
  assert.equal(r.total, 233);
  assert.equal(r.filas.length, TAMANIO_PAGINA);
  assert.equal(r.paginas, Math.ceil(233 / TAMANIO_PAGINA));
  const ultima = filtrarCatalogo(filas, leerFiltrosCatalogo({ pagina: "999" }), new Set());
  assert.equal(ultima.pagina, r.paginas, "una página fuera de rango cae en la última");
  assert.equal(ultima.filas.length, 233 - (r.paginas - 1) * TAMANIO_PAGINA);
  const vistos = new Set<string>();
  for (let p = 1; p <= r.paginas; p++) {
    for (const f of filtrarCatalogo(filas, leerFiltrosCatalogo({ pagina: String(p) }), new Set()).filas) vistos.add(f.slug);
  }
  assert.equal(vistos.size, 233, "recorrer todas las páginas muestra las 233 sin repetir");
});

caso("búsqueda sin acentos y filtros combinados", () => {
  const dior = filtrarCatalogo(filas, leerFiltrosCatalogo({ q: "christian dior" }), new Set());
  assert.ok(dior.total > 0 && dior.filas.every((f) => f.house === "Christian Dior"));
  const arabes = filtrarCatalogo(filas, leerFiltrosCatalogo({ categoria: "arabe", genero: "masculino" }), new Set());
  assert.ok(arabes.filas.every((f) => f.universe === "arabe" && f.gender === "masculino"));
  const conRev = filtrarCatalogo(filas, leerFiltrosCatalogo({ revision: "1" }), new Set(["afnan-9pm"]));
  assert.deepEqual(conRev.filas.map((f) => f.slug), ["afnan-9pm"]);
  assert.equal(filtrarCatalogo(filas, leerFiltrosCatalogo({ estado: "draft" }), new Set()).total, 0);
});

caso("urlFiltros conserva filtros y omite vacíos", () => {
  const f = leerFiltrosCatalogo({ q: "lattafa", genero: "unisex" });
  assert.equal(urlFiltros(f, { pagina: 2 }), "?q=lattafa&genero=unisex&pagina=2");
  assert.equal(urlFiltros(leerFiltrosCatalogo({})), "");
});

caso("perfil olfativo: guardar sin cambios no altera ninguna de las 233", () => {
  let diferencias = 0;
  for (const p of PRODUCTS) {
    const base = p.olfactory as unknown as Record<string, unknown> | null;
    const r = editableAPerfil(perfilAEditable(base), base);
    if (!r.ok || !isDeepStrictEqual(r.perfil, base)) diferencias++;
  }
  assert.equal(diferencias, 0);
});

caso("perfil olfativo: edición, validación y claves desconocidas", () => {
  const base = { family: "floral", custom: { a: 1 } } as Record<string, unknown>;
  const e = perfilAEditable(base);
  e.topNotes = "Bergamota,  Pera ,, Limón";
  e.occasions = ["noche"];
  const r = editableAPerfil(e, base);
  assert.ok(r.ok);
  if (r.ok) {
    assert.deepEqual((r.perfil as Record<string, unknown>).topNotes, ["Bergamota", "Pera", "Limón"]);
    assert.deepEqual((r.perfil as Record<string, unknown>).custom, { a: 1 }, "conserva claves que el editor no conoce");
  }
  assert.equal(editableAPerfil({ ...e, family: "inventada" }, base).ok, false);
  assert.equal(editableAPerfil({ ...e, occasions: ["siempre"] }, base).ok, false);
  assert.equal(editableAPerfil({ ...e, aromaticIntensity: "brutal" }, base).ok, false);
  const vacio = editableAPerfil(perfilAEditable(null), null);
  assert.ok(vacio.ok && vacio.perfil === null, "un perfil vacío nuevo queda null");
});

caso("diferencias de revisión", () => {
  const actual = { house: "A", fragrance_name: "B", olfactory: { x: [1, 2] }, performance: null };
  const d = diferenciasRevision(actual, { house: "A", fragrance_name: "C", olfactory: { x: [1, 2] } });
  assert.deepEqual(d.map((c) => c.clave), ["fragrance_name"]);
  assert.equal(diferenciasRevision(actual, { olfactory: { x: [2, 1] } }).length, 1);
  assert.equal(diferenciasRevision(actual, {}).length, 0, "campos ausentes en la propuesta no cuentan");
});

caso("slugs", () => {
  assert.equal(sugerirSlug("Maison Francis Kurkdjian", "Baccarat Rouge 540"), "maison-francis-kurkdjian-baccarat-rouge-540");
  assert.equal(sugerirSlug("Dolce & Gabbana", "Light Blue"), "dolce-and-gabbana-light-blue");
  assert.equal(sugerirSlug("Lancôme", "La Vie Est Belle"), "lancome-la-vie-est-belle");
  assert.ok(esSlugValido("afnan-9pm"));
  for (const malo of ["", "Afnan", "a--b", "-a", "a b", "x".repeat(121), null, 3]) assert.equal(esSlugValido(malo), false);
});

caso("errores de RPC", () => {
  assert.match(mensajeErrorRpc({ code: "NX401" }, "g"), /MFA/);
  assert.match(mensajeErrorRpc({ code: "PGRST202" }, "g"), /migración pendiente/);
  assert.equal(mensajeErrorRpc({ code: "NX422", message: "Primero restaure el producto archivado." }, "g"), "Primero restaure el producto archivado.");
  assert.equal(mensajeErrorRpc({ code: "XX000", message: "detalle interno de postgres" }, "genérico"), "genérico");
  assert.ok(esFuncionAusente({ code: "PGRST202" }));
  assert.ok(!esFuncionAusente({ code: "NX422" }));
  assert.ok(!esFuncionAusente(null));
});

caso("validación de servidor de la ficha", () => {
  const ok = { slug: "qa-x", house: " QA ", fragranceName: "X", gender: "unisex", universe: "nicho", origin: "internacional", olfactory: null, imagePath: null };
  const r = validarValoresFicha(ok);
  assert.ok(r.ok && r.valores.house === "QA");
  assert.equal(validarValoresFicha({ ...ok, gender: "otro" }).ok, false);
  assert.equal(validarValoresFicha({ ...ok, olfactory: [1] }).ok, false);
  assert.equal(validarValoresFicha({ ...ok, imagePath: "covers/otra/abc.webp" }).ok, false, "portada de otra fragancia");
  assert.equal(validarValoresFicha({ ...ok, imagePath: "covers/qa-x/../x.webp" }).ok, false);
  assert.ok(validarValoresFicha({ ...ok, imagePath: "covers/qa-x/0f3a-11.webp" }).ok);
  assert.equal(validarValoresFicha({ ...ok, house: "" }).ok, false);
  assert.equal(validarValoresFicha(null).ok, false);
});

caso("etiquetas del panel idénticas a las de la tienda", () => {
  assert.deepEqual(Admin.FAMILY_LABELS, Tienda.FAMILY_LABELS);
  assert.deepEqual(Admin.OCCASION_LABELS, Tienda.OCCASION_LABELS);
  assert.deepEqual(Admin.SEASON_LABELS, Tienda.SEASON_LABELS);
  assert.deepEqual(Admin.AROMATIC_INTENSITY_LABELS, Tienda.AROMATIC_INTENSITY_LABELS);
  assert.deepEqual(Admin.ETIQUETA_GENERO, Tienda.GENDER_LABELS);
  assert.deepEqual(Admin.ETIQUETA_CATEGORIA, Tienda.UNIVERSE_LABELS);
});

console.log(`OK: ${casos} grupos de pruebas del módulo Catálogo (filtros, paginación, perfil 233/233, revisiones, validación).`);
