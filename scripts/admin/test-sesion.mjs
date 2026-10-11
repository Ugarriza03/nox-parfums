/**
 * Prueba de obtenerAcceso() / requerirAdmin() (src/lib/admin/sesion.ts) con
 * el código REAL, reemplazando sólo el cliente de Supabase y next/navigation.
 *
 * Verifica que un Supabase inaccesible no se confunda con "no hay sesión" y
 * que, en ningún caso de falla, se conceda acceso.
 *
 *   npm run test:admin:sesion
 */

import { build } from "esbuild";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dir = mkdtempSync(join(tmpdir(), "nox-sesion-"));

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

const stubs = {
  name: "stubs",
  setup(b) {
    b.onResolve({ filter: /^next\/navigation$/ }, () => ({ path: "navegacion", namespace: "stub" }));
    b.onResolve({ filter: /^\.\/supabase$/ }, () => ({ path: "supabase", namespace: "stub" }));
    b.onLoad({ filter: /^navegacion$/, namespace: "stub" }, () => ({
      contents: `
        export function notFound() { throw Object.assign(new Error("NEXT_NOT_FOUND"), { destino: "404" }); }
        export function redirect(url) { throw Object.assign(new Error("NEXT_REDIRECT"), { destino: url }); }`,
      loader: "js"
    }));
    b.onLoad({ filter: /^supabase$/, namespace: "stub" }, () => ({
      contents: `
        export async function crearClienteAdmin() {
          globalThis.__clientes = (globalThis.__clientes ?? 0) + 1;
          return {
            auth: { getClaims: () => globalThis.__getClaims() },
            rpc: (nombre) => globalThis.__rpc(nombre)
          };
        }`,
      loader: "js"
    }));
  }
};

const salida = await build({
  entryPoints: [resolve(raiz, "src/lib/admin/sesion.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  tsconfig: resolve(raiz, "tsconfig.json"),
  plugins: [stubs],
  write: false,
  logLevel: "warning"
});
const archivo = join(dir, "sesion.mjs");
writeFileSync(archivo, salida.outputFiles[0].text);
const { obtenerAcceso, requerirAdmin } = await import(pathToFileURL(archivo).href);

const ENV = { NOX_SUPABASE_URL: "https://proyecto.supabase.co", NOX_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba" };
for (const k of ["NOX_SUPABASE_URL", "NOX_SUPABASE_PUBLISHABLE_KEY", "NOX_ADMIN_HABILITADO", "VERCEL_ENV"]) delete process.env[k];
Object.assign(process.env, ENV);

const FILA_ADMIN = [{ is_admin_user: true, active: true, mfa_required: true, display_name: "Gabriel", aal: "aal2" }];
const CLAIMS = { data: { claims: { sub: "00000000-0000-0000-0000-00000000000a", email: "a@b.c", aal: "aal2" } }, error: null };
const SIN_RED = { name: "AuthRetryableFetchError", status: 0, message: "fetch failed: connect ECONNREFUSED 10.0.0.5:443" };

async function destinoDeRequerir() {
  try {
    await requerirAdmin();
    return "acceso concedido";
  } catch (e) {
    return e.destino ?? `excepción: ${e.message}`;
  }
}

async function caso(nombre, { getClaims, rpc = async () => ({ data: FILA_ADMIN, error: null }) }, esperado) {
  globalThis.__getClaims = getClaims;
  let rpcLlamado = false;
  globalThis.__rpc = async (n) => ((rpcLlamado = true), rpc(n));
  const { acceso } = await obtenerAcceso();
  const destino = await destinoDeRequerir();
  const ok =
    acceso.estado === esperado.estado &&
    destino === esperado.destino &&
    (esperado.mensaje === undefined || acceso.mensaje === esperado.mensaje) &&
    (esperado.rpc === undefined || rpcLlamado === esperado.rpc);
  check(`${nombre} → ${esperado.estado}, ${esperado.destino}`, ok, `${acceso.estado} / ${destino}${acceso.mensaje ? ` / ${acceso.mensaje}` : ""}`);
  return acceso;
}

console.log("\nSESIÓN DE NOX ADMIN (obtenerAcceso / requerirAdmin)\n" + "─".repeat(66));
const MENSAJE = "No se pudo conectar con el servicio de autenticación. Probá de nuevo en unos minutos.";

await caso("sin sesión", { getClaims: async () => ({ data: null, error: null }) }, { estado: "sin_sesion", destino: "/admin/login", rpc: false });
const caido = await caso(
  "Supabase Auth inaccesible (AuthRetryableFetchError)",
  { getClaims: async () => ({ data: null, error: SIN_RED }) },
  { estado: "error", destino: "/admin/login", mensaje: MENSAJE, rpc: false }
);
check("el mensaje no expone el detalle técnico (host, puerto, causa)", !/ECONNREFUSED|10\.0\.0\.5|443|fetch failed/.test(JSON.stringify(caido)));
await caso("Auth responde 503", { getClaims: async () => ({ data: null, error: { name: "AuthRetryableFetchError", status: 503 } }) }, { estado: "error", destino: "/admin/login", rpc: false });
await caso("getClaims lanza una excepción", { getClaims: async () => { throw new TypeError("fetch failed"); } }, { estado: "error", destino: "/admin/login", mensaje: MENSAJE, rpc: false });
await caso("token inválido (AuthInvalidJwtError 400)", { getClaims: async () => ({ data: null, error: { name: "AuthInvalidJwtError", status: 400 } }) }, { estado: "sin_sesion", destino: "/admin/login", rpc: false });
await caso("sesión vencida y refresh rechazado (AuthApiError 400)", { getClaims: async () => ({ data: null, error: { name: "AuthApiError", status: 400 } }) }, { estado: "sin_sesion", destino: "/admin/login", rpc: false });
await caso("admin válido con aal2", { getClaims: async () => CLAIMS }, { estado: "ok", destino: "acceso concedido", rpc: true });
await caso("claims válidos pero la base no responde", { getClaims: async () => CLAIMS, rpc: async () => ({ data: null, error: { message: "timeout" } }) }, { estado: "error", destino: "/admin/login" });
await caso("usuario autenticado que no es admin", { getClaims: async () => CLAIMS, rpc: async () => ({ data: [], error: null }) }, { estado: "sin_permiso", destino: "/admin/sin-acceso" });
await caso(
  "admin con MFA exigido y sesión aal1",
  { getClaims: async () => ({ data: { claims: { ...CLAIMS.data.claims, aal: "aal1" } }, error: null }) },
  { estado: "requiere_mfa", destino: "/admin/mfa" }
);

delete process.env.NOX_SUPABASE_URL;
globalThis.__clientes = 0;
await caso("sin configuración: no se crea cliente ni se llama a Supabase", { getClaims: async () => CLAIMS }, { estado: "no_configurado", destino: "/admin/login", rpc: false });
check("sin configuración no se instancia el cliente", globalThis.__clientes === 0);

Object.assign(process.env, ENV, { VERCEL_ENV: "production" });
await caso("producción sin NOX_ADMIN_HABILITADO", { getClaims: async () => CLAIMS }, { estado: "deshabilitado", destino: "404", rpc: false });

rmSync(dir, { recursive: true, force: true });
console.log("\n" + "─".repeat(66));
if (fallas) {
  console.log(`${fallas} fallas`);
  process.exit(1);
}
console.log("Sesión de NOX Admin: todo OK");
