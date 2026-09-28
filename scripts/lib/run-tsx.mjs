/**
 * EJECUTAR UN SCRIPT TypeScript DESDE OTRO SCRIPT, EN CUALQUIER SISTEMA.
 *
 * Por qué existe: los QA corren el CLI real como subproceso. Llamar a "npx" por
 * su nombre parece inofensivo pero NO es portable: en Windows el ejecutable se
 * llama `npx.cmd`, y `spawnSync`/`execFileSync` sin shell no aplican PATHEXT,
 * así que la llamada falla con ENOENT antes de ejecutar nada.
 *
 * La solución no es adivinar el nombre del binario según la plataforma, sino no
 * depender del PATH global: se resuelve el CLI de tsx dentro del proyecto y se
 * lo ejecuta con el mismo Node que está corriendo (`process.execPath`), que
 * siempre existe y siempre es una ruta absoluta. Sin `shell: true`, así que no
 * hay que escapar argumentos ni preocuparse por rutas con espacios.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(aqui, "..", "..");

/** Ubica el entrypoint de tsx sin depender de ningún binario del PATH. */
function resolverTsx() {
  // 1. Resolución normal de Node: encuentra tsx esté donde esté instalado.
  try {
    const require = createRequire(import.meta.url);
    const pkg = require.resolve("tsx/package.json");
    const bin = require("node:fs").readFileSync(pkg, "utf8");
    const entry = JSON.parse(bin).bin;
    const archivo = typeof entry === "string" ? entry : entry?.tsx;
    if (archivo) {
      const ruta = join(dirname(pkg), archivo);
      if (existsSync(ruta)) return ruta;
    }
  } catch {
    // sigue con la búsqueda manual
  }

  // 2. Búsqueda manual hacia arriba, por si la resolución de módulos no aplica.
  let dir = PROJECT_ROOT;
  for (let i = 0; i < 6; i++) {
    for (const candidato of [
      join(dir, "node_modules", "tsx", "dist", "cli.mjs"),
      join(dir, "node_modules", "tsx", "dist", "cli.js")
    ]) {
      if (existsSync(candidato)) return candidato;
    }
    const padre = dirname(dir);
    if (padre === dir) break;
    dir = padre;
  }

  return null;
}

const TSX_CLI = resolverTsx();

/**
 * Corre tsx como subproceso y devuelve { salida, ok, code }.
 *
 * Nunca lanza: un subproceso que falla es un dato del QA, no una excepción.
 * `ok` es true sólo con exit code 0; stdout y stderr vienen juntos en `salida`
 * para poder buscar mensajes sin importar por dónde salieron.
 */
export function runTsx(args, opciones = {}) {
  if (!TSX_CLI) {
    return {
      salida:
        "No se encontró el CLI de tsx. Instalá las dependencias del proyecto " +
        "(npm install) antes de correr el QA.",
      ok: false,
      code: null
    };
  }

  const res = spawnSync(process.execPath, [TSX_CLI, ...args], {
    cwd: opciones.cwd ?? PROJECT_ROOT,
    encoding: "utf8",
    env: { ...process.env, ...(opciones.env ?? {}) },
    // Sin shell: los argumentos van tal cual, sin escapes ni sorpresas con
    // espacios en la ruta (habitual en Windows: C:\Users\Mi Usuario\...).
    shell: false,
    maxBuffer: 32 * 1024 * 1024
  });

  if (res.error) {
    return { salida: `No se pudo ejecutar tsx: ${res.error.message}`, ok: false, code: null };
  }

  return {
    salida: `${res.stdout ?? ""}${res.stderr ?? ""}`,
    ok: res.status === 0,
    code: res.status
  };
}

/** Corre un script .ts del proyecto. */
export function runScript(script, args = [], opciones = {}) {
  return runTsx([script, ...args], opciones);
}

/** Evalúa TypeScript suelto y devuelve su stdout. Útil para consultar datos. */
export function evalTs(codigo, opciones = {}) {
  return runTsx(["-e", codigo], opciones);
}

/** Ruta del CLI de tsx que se está usando, para diagnósticos del QA. */
export const TSX_PATH = TSX_CLI;
