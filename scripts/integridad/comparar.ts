/**
 * COMPARACIÓN DE MANIFIESTOS — lógica pura, sin leer ni escribir archivos.
 *
 * Devuelve los problemas agrupados por categoría (vacío = todo coincide).
 * La usan verificar-integridad.ts (contra el manifiesto versionado) y
 * qa-integridad-detecta.ts (contra copias alteradas en memoria).
 */

import { MANIFIESTO_VERSION, type Manifiesto, type ProductoManifiesto } from "./manifiesto";

export type Problemas = Record<string, string[]>;

export function compararManifiestos(esperado: Manifiesto, actual: Manifiesto): Problemas {
  const problemas: Problemas = {};
  function falla(categoria: string, detalle: string) {
    (problemas[categoria] ??= []).push(detalle);
  }

  if (esperado.version !== MANIFIESTO_VERSION) {
    falla("Manifiesto", `versión ${esperado.version}, se esperaba ${MANIFIESTO_VERSION}`);
  }

  /* ----------------------------------------- invariantes sin manifiesto */

  const vistos = new Map<string, number>();
  for (const p of actual.productos) vistos.set(p.slug, (vistos.get(p.slug) ?? 0) + 1);
  for (const [slug, n] of vistos) if (n > 1) falla("Productos duplicados", `${slug} aparece ${n} veces`);

  for (const p of actual.productos) {
    if (p.id !== p.slug) falla("Identificadores", `${p.slug}: id "${p.id}" distinto del slug`);
    if (!p.perfilOlfativo.existe) falla("Perfiles olfativos", `${p.slug}: sin perfil asociado`);
    if (!p.portada.existe) falla("Portadas", `${p.slug}: falta el archivo ${p.portada.ruta}`);
    if (p.nombre === "(sin registro)") falla("Identificadores", `${p.slug}: sin entrada en el registro de identificadores`);
  }
  for (const slug of actual.destacadas) {
    if (!vistos.has(slug)) falla("Destacadas", `"${slug}" no existe en el catálogo`);
  }

  /* ------------------------------------------- comparación con manifiesto */

  const porSlugEsperado = new Map(esperado.productos.map((p) => [p.slug, p]));
  const porSlugActual = new Map(actual.productos.map((p) => [p.slug, p]));
  const identidad = (p: ProductoManifiesto) => `${p.genero}|${p.origen}|${p.casa}|${p.nombre}`;
  const actualPorIdentidad = new Map(actual.productos.map((p) => [identidad(p), p]));

  for (const e of esperado.productos) {
    const a = porSlugActual.get(e.slug);
    if (!a) {
      const mismo = actualPorIdentidad.get(identidad(e));
      if (mismo) falla("Cambios de slug", `${e.slug} → ${mismo.slug} (${e.inspiradoEn})`);
      else falla("Productos eliminados", `${e.slug} (${e.inspiradoEn})`);
      continue;
    }

    const campos: [string, unknown, unknown][] = [
      ["casa", e.casa, a.casa],
      ["nombre", e.nombre, a.nombre],
      ["inspiradoEn", e.inspiradoEn, a.inspiradoEn],
      ["género", e.genero, a.genero],
      ["origen", e.origen, a.origen],
      ["universo", e.universo, a.universo],
      ["estado de datos", e.dataStatus, a.dataStatus],
      ["performance verificada", e.performanceVerificada, a.performanceVerificada],
      ["posición en destacadas", e.destacada, a.destacada]
    ];
    for (const [campo, antes, ahora] of campos) {
      if (antes !== ahora) falla("Datos protegidos", `${e.slug}: ${campo} "${antes}" → "${ahora}"`);
    }

    if (e.perfilOlfativo.sha256 !== a.perfilOlfativo.sha256) {
      falla("Perfiles olfativos", `${e.slug}: el perfil olfativo cambió o desapareció`);
    }
    if (e.procedencia.sha256 !== a.procedencia.sha256) {
      falla("Procedencia", `${e.slug}: el registro de procedencia cambió o desapareció`);
    }

    if (e.portada.ruta !== a.portada.ruta) falla("Portadas", `${e.slug}: ruta ${e.portada.ruta} → ${a.portada.ruta}`);
    else if (e.portada.sha256 !== a.portada.sha256) falla("Portadas", `${e.slug}: el archivo de portada cambió o falta`);
    if (e.portada.ancho !== a.portada.ancho || e.portada.alto !== a.portada.alto) {
      falla("Portadas", `${e.slug}: dimensiones ${e.portada.ancho}×${e.portada.alto} → ${a.portada.ancho}×${a.portada.alto}`);
    }
    if (e.portadaPreview.sha256 !== a.portadaPreview.sha256) {
      falla("Portadas", `${e.slug}: el derivado de preview cambió o falta`);
    }
  }

  for (const a of actual.productos) {
    if (!porSlugEsperado.has(a.slug) && !esperado.productos.some((e) => identidad(e) === identidad(a))) {
      falla("Productos nuevos sin aprobar", `${a.slug} (${a.inspiradoEn})`);
    }
  }

  if (actual.productos.map((p) => p.slug).join() !== esperado.productos.map((p) => p.slug).join() &&
      actual.productos.length === esperado.productos.length &&
      !problemas["Cambios de slug"] && !problemas["Productos eliminados"]) {
    falla("Orden del catálogo", "los productos son los mismos pero cambió su orden");
  }

  if (actual.destacadas.join() !== esperado.destacadas.join()) {
    falla("Destacadas", `[${esperado.destacadas.join(", ")}] → [${actual.destacadas.join(", ")}]`);
  }

  for (const clave of Object.keys(esperado.sha256) as (keyof Manifiesto["sha256"])[]) {
    if (esperado.sha256[clave] !== actual.sha256[clave]) {
      const categoria = clave === "comercial" ? "Precios, promociones o regalos" : "Datos protegidos";
      falla(categoria, `cambió el hash de "${clave}"`);
    }
  }

  const altEsperadas = new Map(esperado.portadasAlternativas.map((p) => [p.slug, p.archivo.sha256]));
  const altActuales = new Map(actual.portadasAlternativas.map((p) => [p.slug, p.archivo.sha256]));
  for (const [slug, h] of altEsperadas) {
    if (altActuales.get(slug) !== h) falla("Portadas", `alternativa de ${slug} cambió o falta`);
  }
  for (const slug of altActuales.keys()) if (!altEsperadas.has(slug)) falla("Portadas", `alternativa nueva sin aprobar: ${slug}`);

  for (const [clave, antes] of Object.entries(esperado.totales)) {
    const ahora = (actual.totales as Record<string, unknown>)[clave];
    if (JSON.stringify(antes) !== JSON.stringify(ahora)) {
      falla("Totales", `${clave}: ${JSON.stringify(antes)} → ${JSON.stringify(ahora)}`);
    }
  }

  return problemas;
}
