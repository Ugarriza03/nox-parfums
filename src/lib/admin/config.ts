/**
 * CONFIGURACIÓN DE NOX ADMIN — sólo servidor.
 *
 * Las variables se leen en tiempo de ejecución (no llevan prefijo
 * NEXT_PUBLIC_, así que nunca se incrustan en el JavaScript del navegador).
 * Si faltan o son inválidas, el panel muestra "no configurado" y la tienda
 * sigue funcionando: nada de esto se evalúa fuera de /admin.
 *
 *   NOX_SUPABASE_URL              https://<proyecto>.supabase.co
 *   NOX_SUPABASE_PUBLISHABLE_KEY  clave publishable (sb_publishable_…) o anon
 *   NOX_ADMIN_HABILITADO          "true" para habilitar el panel en producción
 *
 * La app NUNCA usa la clave secreta / service_role.
 */

export interface AdminSupabaseConfig {
  url: string;
  publishableKey: string;
}

type Env = Record<string, string | undefined>;

export function leerConfigSupabase(env: Env = process.env): AdminSupabaseConfig | null {
  const url = env.NOX_SUPABASE_URL?.trim();
  const publishableKey = env.NOX_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) return null;

  // Una clave secreta en esta variable sería un error grave de configuración.
  if (/^sb_secret_/i.test(publishableKey) || /service_role/i.test(rolDeJwt(publishableKey) ?? "")) {
    return null;
  }

  return { url: parsed.origin, publishableKey };
}

/**
 * El panel sólo se habilita en el entorno de producción de Vercel cuando
 * NOX_ADMIN_HABILITADO = "true". En previews y en local queda disponible
 * (si está configurado) para poder probarlo.
 */
export function panelHabilitado(env: Env = process.env): boolean {
  if (env.VERCEL_ENV === "production") return env.NOX_ADMIN_HABILITADO === "true";
  return true;
}

/** Rol de un JWT (claves anon/service_role heredadas), sin verificar firma. */
function rolDeJwt(token: string): string | null {
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  try {
    const json = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8")) as { role?: unknown };
    return typeof json.role === "string" ? json.role : null;
  } catch {
    return null;
  }
}

/** Opciones de las cookies de sesión del panel. */
export const ADMIN_COOKIE_OPTIONS = {
  // Sólo viajan a /admin: la tienda pública nunca recibe la sesión.
  path: "/admin",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  // Sesión de trabajo: 8 horas desde la última renovación.
  maxAge: 60 * 60 * 8
};
