/**
 * PROXY DE NEXT.JS 16 — sólo para /admin.
 *
 * Renueva la sesión de Supabase del panel antes de renderizar (los Server
 * Components no pueden escribir cookies) y agrega cabeceras de privacidad.
 * No decide permisos: eso lo hacen requerirAdmin() en cada página/acción y la
 * base de datos con RLS.
 *
 * El matcher limita su ejecución a /admin: la tienda pública nunca pasa por
 * acá. Sin configuración de Supabase, deja pasar la request sin tocarla.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_COOKIE_OPTIONS, leerConfigSupabase, panelHabilitado } from "@/lib/admin/config";

const CABECERAS_ADMIN: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "private, no-store"
};

function conCabeceras(respuesta: NextResponse): NextResponse {
  for (const [clave, valor] of Object.entries(CABECERAS_ADMIN)) respuesta.headers.set(clave, valor);
  return respuesta;
}

export async function proxy(request: NextRequest) {
  const config = leerConfigSupabase();
  if (!config || !panelHabilitado()) return conCabeceras(NextResponse.next({ request }));

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookieOptions: ADMIN_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista, cabeceras) {
        for (const { name, value } of lista) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of lista) {
          respuesta.cookies.set(name, value, { ...options, ...ADMIN_COOKIE_OPTIONS });
        }
        for (const [clave, valor] of Object.entries(cabeceras ?? {})) respuesta.headers.set(clave, valor);
      }
    },
    auth: { detectSessionInUrl: false }
  });

  try {
    // Valida y, si hace falta, renueva el token. No se usa para autorizar.
    await supabase.auth.getClaims();
  } catch {
    // Supabase inaccesible o pausado: la página mostrará el estado de error.
  }

  return conCabeceras(respuesta);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
