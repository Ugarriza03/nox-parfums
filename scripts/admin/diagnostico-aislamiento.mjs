/**
 * DIAGNÓSTICO DE AISLAMIENTO TIENDA / PANEL — sobre el build real de Next.
 *
 * Lee los manifiestos de referencias de cliente que genera `next build`
 * (.next/server/app/admin/**\/page_client-reference-manifest.js) y muestra,
 * para cada ruta de /admin:
 *   · qué entradas de Next (layouts, not-found, páginas) aportan JavaScript
 *   · qué módulos de cliente de la tienda figuran, si figura alguno
 *   · si se pasan nombres de chunks, qué entrada los incluye
 *
 *   npm run build && node scripts/admin/diagnostico-aislamiento.mjs [chunk.js …]
 *
 * Es informativo: el formato del manifiesto es interno de Next y puede
 * cambiar entre versiones. Si no lo reconoce, lo dice y no falla.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const TIENDA = /src[\\/](store|components[\\/](layout|order|product|home|ui)|data)[\\/]/;

function manifiestos(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const n of readdirSync(dir)) {
    const r = join(dir, n);
    if (statSync(r).isDirectory()) out.push(...manifiestos(r));
    else if (n.endsWith("_client-reference-manifest.js")) out.push(r);
  }
  return out;
}

function leerManifiesto(archivo) {
  const contexto = { globalThis: {} };
  contexto.self = contexto.globalThis;
  vm.runInNewContext(readFileSync(archivo, "utf8"), contexto, { timeout: 2000 });
  const todos = contexto.globalThis.__RSC_MANIFEST ?? {};
  return Object.entries(todos);
}

/** Devuelve { ruta, entradas: {entrada: chunks[]}, modulosTienda: string[] }[] */
export function analizar(raiz, sospechosos = []) {
  const base = join(raiz, ".next/server/app/admin");
  const resultado = [];
  for (const archivo of manifiestos(base)) {
    let entradas;
    try {
      entradas = leerManifiesto(archivo);
    } catch (e) {
      resultado.push({ archivo, error: `no se pudo leer: ${e.message}` });
      continue;
    }
    for (const [ruta, m] of entradas) {
      const entryJS = m?.entryJSFiles ?? {};
      const modulos = Object.keys(m?.clientModules ?? {});
      const modulosTienda = [...new Set(modulos.filter((k) => TIENDA.test(k)).map((k) => k.replace(/ <module evaluation>$/, "")))];
      const culpables = {};
      for (const chunk of sospechosos) {
        const nombre = basename(chunk);
        culpables[nombre] = Object.entries(entryJS)
          .filter(([, lista]) => (lista ?? []).some((c) => basename(String(c)) === nombre))
          .map(([entrada]) => entrada);
      }
      resultado.push({ archivo, ruta, entradas: Object.keys(entryJS), modulosTienda, culpables, reconocido: Boolean(m?.entryJSFiles || m?.clientModules) });
    }
  }
  return resultado;
}

export function imprimir(resultado) {
  if (resultado.length === 0) {
    console.log("  (no se encontraron manifiestos en .next/server/app/admin: ¿corriste npm run build?)");
    return;
  }
  for (const r of resultado) {
    if (r.error) {
      console.log(`  ${r.archivo}: ${r.error}`);
      continue;
    }
    console.log(`  ${r.ruta}`);
    if (!r.reconocido) {
      console.log("    formato de manifiesto no reconocido (versión de Next distinta)");
      continue;
    }
    console.log(`    entradas con JavaScript: ${r.entradas.join(", ") || "—"}`);
    console.log(`    módulos de cliente de la tienda: ${r.modulosTienda.join(", ") || "ninguno"}`);
    for (const [chunk, quienes] of Object.entries(r.culpables)) {
      console.log(`    ${chunk} lo incluye: ${quienes.join(", ") || "ninguna entrada de esta ruta"}`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  console.log("Aislamiento tienda / panel según el build de Next\n" + "─".repeat(66));
  const r = analizar(raiz, process.argv.slice(2));
  imprimir(r);
  const conTienda = r.filter((x) => x.modulosTienda?.length);
  console.log("─".repeat(66));
  console.log(conTienda.length ? `${conTienda.length} ruta(s) de /admin con módulos de la tienda` : "Ninguna ruta de /admin declara módulos de cliente de la tienda");
}
