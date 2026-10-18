/** Lectura opcional de catálogo V2 para tienda; nunca usa service_role. */
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/data/types";
import { leerConfigSupabase } from "@/lib/admin/config";
import { prepararVistaCatalogoV2, type FilaCatalogoV2, type ResultadoVistaV2 } from "@/lib/admin/catalogo-v2-adaptador";

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;
export const TIEMPO_MAXIMO_MS = 2500;
export const REVALIDAR_SEGUNDOS = 300;

export function catalogoV2Activado(env: Env = process.env): boolean {
  return env.NOX_CATALOGO_V2_TIENDA === "true";
}
function estatico(motivo: string): ResultadoVistaV2 {
  return { products: PRODUCTS, fuente: "estatico", motivos: [motivo] };
}
function esFila(valor: unknown): valor is FilaCatalogoV2 {
  if (!valor || typeof valor !== "object") return false;
  const f = valor as Record<string, unknown>;
  return ["slug", "house", "fragrance_name", "gender", "universe", "origin", "status"]
    .every(k => typeof f[k] === "string");
}
export async function obtenerCatalogoTienda(
  env: Env = process.env, fetchImpl: Fetch = fetch
): Promise<ResultadoVistaV2> {
  if (!catalogoV2Activado(env)) return estatico("Catálogo V2 desactivado");
  const config = leerConfigSupabase(env);
  if (!config) return estatico("Supabase no configurado");
  let filas: unknown;
  try {
    const respuesta = await fetchImpl(`${config.url}/rest/v1/rpc/nox_catalogo_publico`, {
      method: "POST",
      headers: { apikey: config.publishableKey, "Content-Type": "application/json", Accept: "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
      next: { revalidate: REVALIDAR_SEGUNDOS }
    } as RequestInit);
    if (!respuesta.ok) return estatico(`Supabase respondió ${respuesta.status}`);
    filas = await respuesta.json();
  } catch {
    return estatico("Supabase no disponible");
  }
  if (!Array.isArray(filas) || !filas.every(esFila)) return estatico("Respuesta inválida");
  return prepararVistaCatalogoV2(filas, false);
}
export async function obtenerProductoTienda(
  slug: string, env: Env = process.env, fetchImpl: Fetch = fetch
): Promise<{ product: Product | undefined; fuente: ResultadoVistaV2["fuente"] }> {
  const vista = await obtenerCatalogoTienda(env, fetchImpl);
  return { product: vista.products.find(p => p.slug === slug), fuente: vista.fuente };
}
