/** Lectura opcional de catálogo V2 para tienda; nunca usa service_role. */
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/data/types";
import { prepararVistaCatalogoV2, type FilaCatalogoV2, type ResultadoVistaV2 } from "@/lib/catalogo-v2-adaptador";

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;
function leerConfigPublica(env: Env): { url: string; publishableKey: string } | null {
  const rawUrl = env.NOX_SUPABASE_URL?.trim();
  const publishableKey = env.NOX_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!rawUrl || !publishableKey || /^sb_secret_/i.test(publishableKey)) return null;
  let url: URL;
  try { url = new URL(rawUrl); } catch { return null; }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) return null;
  const jwt = publishableKey.split(".");
  if (jwt.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(jwt[1], "base64url").toString("utf8")) as { role?: string };
      if (payload.role === "service_role") return null;
    } catch { return null; }
  }
  return { url: url.origin, publishableKey };
}
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
  const config = leerConfigPublica(env);
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
