/**
 * SESIÓN Y AUTORIZACIÓN DE NOX ADMIN — sólo servidor.
 *
 * obtenerAcceso() verifica el token con getClaims() (nunca getSession() para
 * decidir) y consulta admin_status() en la base. requerirAdmin() se llama en
 * CADA página y CADA acción del panel: el layout no alcanza, porque los
 * layouts no se vuelven a ejecutar en toda navegación.
 */

import { notFound, redirect } from "next/navigation";
import { leerConfigSupabase, panelHabilitado } from "./config";
import {
  MENSAJE_AUTH_INACCESIBLE,
  clasificarErrorAuth,
  destinoDe,
  resolverAcceso,
  type Acceso,
  type AdminSesion,
  type EstadoAdminDB
} from "./acceso";
import { crearClienteAdmin, type ClienteAdmin } from "./supabase";

export interface ContextoAdmin {
  acceso: Acceso;
  supabase: ClienteAdmin | null;
}

export async function obtenerAcceso(): Promise<ContextoAdmin> {
  const habilitado = panelHabilitado();
  const config = leerConfigSupabase();
  if (!habilitado || !config) {
    return {
      acceso: resolverAcceso({ habilitado, configurado: Boolean(config), claims: null, estadoDB: null }),
      supabase: null
    };
  }

  const supabase = await crearClienteAdmin(config);

  // Tres resultados posibles, que no se confunden entre sí:
  //  · claims válidos            → se consulta admin_status() en la base
  //  · sin sesión / sesión inválida o vencida (4xx) → "sin_sesion"
  //  · Supabase inaccesible (red, 5xx, excepción)   → "error", sin acceso
  let claims: { sub: string; email?: string; aal?: string } | null = null;
  let errorAuth: string | null = null;
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error) {
      if (clasificarErrorAuth(error) === "conexion") errorAuth = MENSAJE_AUTH_INACCESIBLE;
    } else if (data?.claims?.sub) {
      claims = {
        sub: String(data.claims.sub),
        email: typeof data.claims.email === "string" ? data.claims.email : undefined,
        aal: typeof data.claims.aal === "string" ? data.claims.aal : undefined
      };
    }
  } catch {
    // Una excepción inesperada no es "no hay sesión": se trata como falla del
    // servicio. No se concede acceso y no se expone el detalle.
    claims = null;
    errorAuth = MENSAJE_AUTH_INACCESIBLE;
  }

  let estadoDB: EstadoAdminDB | null = null;
  let errorDB: string | null = null;
  if (claims) {
    const { data, error } = await supabase.rpc("admin_status");
    if (error) {
      errorDB = "No se pudo verificar el acceso con la base de datos.";
    } else if (Array.isArray(data) && data.length > 0) {
      estadoDB = data[0] as EstadoAdminDB;
    }
  }

  return {
    acceso: resolverAcceso({ habilitado, configurado: true, claims, estadoDB, errorDB, errorAuth }),
    supabase
  };
}

/**
 * Exige un administrador. Redirige (o responde 404 si el panel está
 * deshabilitado) cuando no corresponde. Con `permitirAal1` acepta un
 * administrador que todavía tiene que completar el segundo factor (sólo para
 * la pantalla de MFA).
 */
export async function requerirAdmin(
  opciones: { permitirAal1?: boolean } = {}
): Promise<{ admin: AdminSesion; supabase: ClienteAdmin }> {
  const { acceso, supabase } = await obtenerAcceso();
  const destino = destinoDe(acceso, opciones);
  if (destino === "404") notFound();
  if (destino) redirect(destino);
  if ((acceso.estado !== "ok" && acceso.estado !== "requiere_mfa") || !supabase) redirect("/admin/login");
  return { admin: acceso.admin, supabase };
}
