/**
 * CLIENTE DE SUPABASE PARA NOX ADMIN — sólo servidor.
 *
 * Un cliente nuevo por request, con la sesión del administrador leída de las
 * cookies (httpOnly, path=/admin). No hay cliente de navegador: el navegador
 * nunca habla con Supabase ni ve tokens.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_COOKIE_OPTIONS, type AdminSupabaseConfig } from "./config";

export async function crearClienteAdmin(config: AdminSupabaseConfig) {
  const almacen = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookieOptions: ADMIN_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) {
            almacen.set(name, value, { ...options, ...ADMIN_COOKIE_OPTIONS });
          }
        } catch {
          // Desde un Server Component no se pueden escribir cookies. La
          // renovación de la sesión la hace src/proxy.ts antes de renderizar.
        }
      }
    },
    auth: { detectSessionInUrl: false }
  });
}

export type ClienteAdmin = Awaited<ReturnType<typeof crearClienteAdmin>>;
