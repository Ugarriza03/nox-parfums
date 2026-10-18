/**
 * Regresiones de la ficha del catálogo V2 (prueba controlada del 18/10/2026):
 *   1. Formulario con valores viejos tras aprobar → no puede revertir cambios.
 *   2. "Borrador creado" visible con la ficha ya publicada.
 *   3. Portada: subir ≠ asociar; pasos según el estado.
 *   4. Límite de portada coherente con el cuerpo máximo de una Server Action.
 * Sin red ni Supabase. Ejecutar: npx tsx scripts/admin/test-ficha-sincronizacion.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRODUCTS } from "../../src/data/products";
import { editableAPerfil, perfilAEditable } from "../../src/lib/admin/catalogo-v2";
import {
  MENSAJE_DESACTUALIZADA, avisoFicha, ayudaCampoPortada, compararVersion, esVersionValida, igualProfundo, leerAvisoUrl,
  mensajePortadaSubida, pasosPortada, sinCambios, valoresComplementos, valoresEditor, versionFicha,
  type FilaFicha, type VersionFicha
} from "../../src/lib/admin/ficha-sincronizacion";
import {
  LIMITE_SERVER_ACTION_BYTES, MAX_COVER_BYTES, MAX_COVER_ETIQUETA, validarArchivoPortadaCliente, validarPortada
} from "../../src/lib/admin/validar-portada";

let casos = 0;
const caso = (nombre: string, fn: () => void) => {
  try { fn(); casos++; } catch (e) { console.error(`✗ ${nombre}`); throw e; }
};
const fuente = (ruta: string) => readFileSync(new URL(`../../${ruta}`, import.meta.url), "utf8");

const T0 = "2026-10-18T22:59:07.504175+00:00";
const T1 = "2026-10-18T23:00:10.335013+00:00";
const R0 = "2026-10-18T22:59:28.829935+00:00";

const fila: FilaFicha = {
  slug: "qa-x", house: "QA", fragrance_name: "Persistencia 01", gender: "unisex", universe: "disenador",
  origin: "internacional", olfactory: { family: "amaderado", topNotes: [] }, image_path: null,
  description: "Base", inspired_label: null, data_status: "pendiente"
};

caso("1a. versión: cambia con guardado, aprobación y estado", () => {
  const v: VersionFicha = { updatedAt: T0, estado: "published", revisionAt: R0 };
  assert.notEqual(versionFicha(v), versionFicha({ ...v, revisionAt: null }), "aprobar quita la revisión");
  assert.notEqual(versionFicha(v), versionFicha({ ...v, updatedAt: T1 }), "aprobar/guardar cambia updated_at");
  assert.notEqual(versionFicha(v), versionFicha({ ...v, estado: "hidden" }), "cambio de estado");
  assert.equal(versionFicha(v), versionFicha({ ...v }));
});

caso("1b. servidor rechaza un formulario anterior a la aprobación", () => {
  // Escenario real: el editor se cargó con la revisión pendiente (T0, R0);
  // después se aprobó (updated_at → T1, sin revisión). Guardar con la versión vieja se rechaza.
  const vieja: VersionFicha = { updatedAt: T0, estado: "published", revisionAt: R0 };
  assert.equal(compararVersion(vieja, { updatedAt: T1, estado: "published", revisionAt: null }), MENSAJE_DESACTUALIZADA);
  assert.equal(compararVersion(vieja, { updatedAt: T0, estado: "published", revisionAt: R0 }), null);
  // Otra pestaña guardó una revisión nueva: tampoco se pisa.
  const sinRev: VersionFicha = { updatedAt: T1, estado: "published", revisionAt: null };
  assert.equal(compararVersion(sinRev, { updatedAt: T1, estado: "published", revisionAt: R0 }), MENSAJE_DESACTUALIZADA);
  assert.equal(compararVersion({ ...sinRev, estado: "draft" }, { updatedAt: T1, estado: "published", revisionAt: null }), MENSAJE_DESACTUALIZADA);
  for (const mala of [null, undefined, "x", {}, { updatedAt: "", estado: "published" }, { updatedAt: T0, estado: "otro" }]) {
    assert.ok(compararVersion(mala, { updatedAt: T0, estado: "published", revisionAt: null }), "sin versión válida no se escribe");
    assert.equal(esVersionValida(mala), false);
  }
  assert.ok(compararVersion(sinRev, { updatedAt: null, estado: null, revisionAt: null }));
});

caso("1c. con revisión pendiente, el editor parte de la propuesta", () => {
  const propuesta = { fragrance_name: "Persistencia 01 Revisada", image_path: "covers/qa-x/a.webp", description: "Nueva" };
  const ed = valoresEditor(fila, propuesta);
  assert.equal(ed.fragranceName, "Persistencia 01 Revisada");
  assert.equal(ed.imagePath, "covers/qa-x/a.webp");
  assert.equal(ed.house, "QA", "campos no propuestos salen de la ficha");
  assert.deepEqual(ed.olfactory, fila.olfactory);
  const base = valoresEditor(fila, null);
  assert.equal(base.fragranceName, "Persistencia 01");
  assert.equal(valoresComplementos(fila, propuesta).description, "Nueva");
  assert.equal(valoresComplementos(fila, propuesta).dataStatus, "pendiente");
  assert.equal(valoresComplementos(fila, { data_status: null }).dataStatus, null, "una propuesta puede vaciar el campo");
  assert.equal(valoresEditor(fila, { olfactory: [1] }).olfactory, null, "perfil inválido no llega al editor");
});

caso("1d. guardar sin cambios no crea revisiones vacías (233 perfiles)", () => {
  let fallos = 0;
  for (const p of PRODUCTS) {
    const olf = p.olfactory as unknown as Record<string, unknown> | null;
    const ini = { ...valoresEditor({ ...fila, slug: p.slug, olfactory: olf }, null) };
    const r = editableAPerfil(perfilAEditable(olf), olf);
    if (!r.ok || !sinCambios({ ...ini, olfactory: r.perfil }, ini)) fallos++;
  }
  assert.equal(fallos, 0);
  const ini = valoresEditor(fila, null);
  assert.equal(sinCambios({ ...ini, fragranceName: "Otra" }, ini), false);
  assert.equal(sinCambios({ ...ini, imagePath: "covers/qa-x/b.webp" }, ini), false);
  assert.equal(sinCambios({ ...ini, olfactory: { topNotes: [], family: "amaderado" } }, ini), true, "orden de claves irrelevante");
  assert.equal(sinCambios(ini, undefined), false);
  assert.ok(igualProfundo({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }));
  assert.ok(!igualProfundo([1, 2], [2, 1]));
  assert.ok(!igualProfundo({ a: 1 }, { a: 1, b: undefined }));
});

caso("1e. componentes y acciones aplican la sincronización", () => {
  const editor = fuente("src/components/admin/CatalogFragranceEditor.tsx");
  assert.ok(editor.includes("if (version !== versionVista)"), "el editor se reinicia al cambiar la versión");
  assert.ok(editor.includes("sinCambios(valores, initial)"), "detecta guardados sin cambios");
  assert.ok(editor.includes("r.desactualizada") && editor.includes("router.refresh()"));
  assert.ok(fuente("src/components/admin/EditorComplementos.tsx").includes("if (clave !== claveVista)"));
  assert.ok(fuente("src/components/admin/CatalogEditorConPortada.tsx").includes("setUploadedImagePath(null)"));
  for (const accion of ["acciones.ts", "complementos-acciones.ts", "revision-acciones.ts"]) {
    assert.ok(fuente(`src/app/admin/(panel)/catalogo/[slug]/${accion}`).includes("verificarVersion("), `${accion} verifica la versión`);
  }
  const pagina = fuente("src/app/admin/(panel)/catalogo/[slug]/page.tsx");
  assert.ok(pagina.includes("guardarEdicionCatalogo.bind(null, version)"));
  assert.ok(pagina.includes("valoresEditor(data as FilaFicha, propuesta)"));
  assert.ok(pagina.includes("version={version}"), "revisión y complementos reciben la versión");
});

caso("2. avisos representan el estado actual", () => {
  assert.match(avisoFicha("creada", "draft", false) ?? "", /Borrador creado/);
  for (const estado of ["published", "hidden", "archived"] as const) assert.equal(avisoFicha("creada", estado, false), null);
  assert.match(avisoFicha("revision-aprobada", "published", false) ?? "", /aprobada/);
  assert.equal(avisoFicha("revision-aprobada", "published", true), null, "hay otra revisión pendiente");
  assert.equal(avisoFicha("revision-aprobada", "hidden", false), null);
  assert.equal(avisoFicha("otro", "draft", false), null);
  assert.equal(leerAvisoUrl({ creada: "1" }), "creada");
  assert.equal(leerAvisoUrl({ aviso: "creada" }), "creada");
  assert.equal(leerAvisoUrl({ aviso: "revision-aprobada" }), "revision-aprobada");
  assert.equal(leerAvisoUrl({ aviso: "<script>" }), null);
  assert.equal(leerAvisoUrl({ aviso: ["creada"] }), null);
  const pagina = fuente("src/app/admin/(panel)/catalogo/[slug]/page.tsx");
  assert.ok(!pagina.includes("Borrador creado"), "la página no muestra el aviso sin condición");
  assert.ok(pagina.includes("avisoFicha(avisoUrl, estado"));
  const controles = fuente("src/components/admin/ControlesEstadoCatalogo.tsx");
  assert.ok(controles.includes("mensajeEstado.estado === estado"), "el mensaje de estado se oculta si el estado cambió");
  assert.ok(controles.includes("router.replace(`/admin/catalogo/${encodeURIComponent(slug)}`"), "quita avisos de la URL");
});

caso("3. portada: subir no es asociar", () => {
  const publicada = pasosPortada("propose-revision").join(" ");
  assert.match(publicada, /todavía no está asociada/);
  assert.match(publicada, /Guardá la revisión/);
  assert.match(publicada, /Aprobá la revisión/);
  const borrador = pasosPortada("edit-draft").join(" ");
  assert.match(borrador, /Guardá el borrador/);
  assert.doesNotMatch(borrador, /Aprob/);
  assert.match(mensajePortadaSubida("propose-revision"), /no asociada.*aprobala/);
  assert.match(mensajePortadaSubida("edit-draft"), /no asociada.*borrador/);
  assert.match(ayudaCampoPortada("propose-revision", null, "covers/qa-x/a.webp"), /sin guardar.*aprobala/);
  assert.match(ayudaCampoPortada("edit-draft", "covers/qa-x/a.webp", null), /sin guardar/);
  assert.doesNotMatch(ayudaCampoPortada("edit-draft", "covers/qa-x/a.webp", "covers/qa-x/a.webp"), /sin guardar/);
  assert.ok(fuente("src/components/admin/SubirPortadaCatalogo.tsx").includes("pasosPortada(modo)"));
});

caso("4. límite de portada < cuerpo máximo de Server Action", () => {
  assert.ok(MAX_COVER_BYTES + 64 * 1024 <= LIMITE_SERVER_ACTION_BYTES, "deja margen para el multipart");
  assert.equal(MAX_COVER_ETIQUETA, `${MAX_COVER_BYTES / 1024} KB`);
  const config = fuente("next.config.mjs");
  assert.ok(!config.includes("bodySizeLimit"), "si se amplía bodySizeLimit, revisar MAX_COVER_BYTES y esta prueba");
  assert.equal(validarArchivoPortadaCliente({ size: MAX_COVER_BYTES, type: "image/webp" }), null);
  assert.match(validarArchivoPortadaCliente({ size: MAX_COVER_BYTES + 1, type: "image/webp" }) ?? "", /900 KB/);
  assert.match(validarArchivoPortadaCliente({ size: 2 * 1024 * 1024, type: "image/jpeg" }) ?? "", /2,00 MB/);
  assert.ok(validarArchivoPortadaCliente({ size: 10, type: "image/gif" }));
  assert.ok(validarArchivoPortadaCliente({ size: 0, type: "image/png" }));
  assert.throws(() => validarPortada("qa-x", "a.webp", "image/webp", new Uint8Array(MAX_COVER_BYTES + 1)), /900 KB/);
  for (const ruta of ["src/components/admin/SubirPortadaCatalogo.tsx", "src/app/admin/(panel)/catalogo/[slug]/portada-acciones.ts", "src/lib/admin/validar-portada.ts"]) {
    const sinComentarios = fuente(ruta).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    assert.ok(!/5\s?MB/.test(sinComentarios), `${ruta} no anuncia 5 MB`);
  }
});

console.log(`OK: ${casos} grupos de regresión de la ficha (versión/stale, avisos, portadas, límite de carga).`);
