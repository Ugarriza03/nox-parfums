/**
 * DECISIÓN DE ACCESO A NOX ADMIN — lógica pura (sin Next ni Supabase).
 *
 * Recibe lo que el servidor averiguó sobre la sesión y devuelve un único
 * estado. Las páginas y las acciones actúan según ese estado; la base de
 * datos vuelve a verificar todo por su cuenta (RLS + is_admin()).
 */

export interface EstadoAdminDB {
  is_admin_user: boolean;
  active: boolean;
  mfa_required: boolean;
  display_name: string;
  aal: string;
}

export interface EntradaAcceso {
  habilitado: boolean;
  configurado: boolean;
  /** Claims verificados con getClaims(); null si no hay sesión válida. */
  claims: { sub: string; email?: string; aal?: string } | null;
  /** Fila de admin_status(); null si el usuario no es administrador. */
  estadoDB: EstadoAdminDB | null;
  /** Error al consultar la base (red, proyecto pausado, etc.). */
  errorDB?: string | null;
  /**
   * Supabase Auth no pudo verificar la sesión por un problema de conexión
   * (caído, pausado, sin red). Distinto de "no hay sesión": nunca concede
   * acceso, pero se informa en lugar de mostrarse como sesión inexistente.
   */
  errorAuth?: string | null;
}

export type Acceso =
  | { estado: "deshabilitado" }
  | { estado: "no_configurado" }
  | { estado: "sin_sesion" }
  | { estado: "error"; mensaje: string }
  | { estado: "sin_permiso"; email: string | null }
  | { estado: "requiere_mfa"; admin: AdminSesion }
  | { estado: "ok"; admin: AdminSesion };

export interface AdminSesion {
  userId: string;
  email: string | null;
  nombre: string;
  aal: "aal1" | "aal2";
  mfaRequerido: boolean;
}

export function resolverAcceso(e: EntradaAcceso): Acceso {
  if (!e.habilitado) return { estado: "deshabilitado" };
  if (!e.configurado) return { estado: "no_configurado" };
  if (e.errorAuth) return { estado: "error", mensaje: e.errorAuth };
  if (!e.claims || !e.claims.sub) return { estado: "sin_sesion" };
  if (e.errorDB) return { estado: "error", mensaje: e.errorDB };

  const fila = e.estadoDB;
  if (!fila || !fila.is_admin_user || !fila.active) {
    return { estado: "sin_permiso", email: e.claims.email ?? null };
  }

  const aal = e.claims.aal === "aal2" ? "aal2" : "aal1";
  const admin: AdminSesion = {
    userId: e.claims.sub,
    email: e.claims.email ?? null,
    nombre: fila.display_name,
    aal,
    mfaRequerido: fila.mfa_required
  };
  if (fila.mfa_required && aal !== "aal2") return { estado: "requiere_mfa", admin };
  return { estado: "ok", admin };
}

/** A dónde va cada estado cuando la página exige un administrador completo. */
export function destinoDe(acceso: Acceso, opciones: { permitirAal1?: boolean } = {}): string | null {
  switch (acceso.estado) {
    case "ok":
      return null;
    case "requiere_mfa":
      return opciones.permitirAal1 ? null : "/admin/mfa";
    case "sin_sesion":
    case "no_configurado":
    case "error":
      return "/admin/login";
    case "sin_permiso":
      return "/admin/sin-acceso";
    case "deshabilitado":
      return "404";
  }
}

/**
 * Clasifica el error de Supabase Auth (getClaims, signInWithPassword…).
 *
 *  · "conexion": el servicio no respondió o falló del lado del servidor
 *    (AuthRetryableFetchError / AuthUnknownError, status 0, ausente o ≥ 500).
 *  · "sesion": el servicio respondió y rechazó la sesión o las credenciales
 *    (token inválido o vencido, sesión inexistente, 4xx).
 *
 * Ninguno de los dos concede acceso; sólo cambia el mensaje.
 */
export function clasificarErrorAuth(error: unknown): "conexion" | "sesion" | null {
  if (error === null || error === undefined) return null;
  const e = error as { name?: unknown; status?: unknown };
  if (e.name === "AuthRetryableFetchError" || e.name === "AuthUnknownError") return "conexion";
  const status = typeof e.status === "number" ? e.status : 0;
  if (status === 0 || status >= 500) return "conexion";
  return "sesion";
}

export const MENSAJE_AUTH_INACCESIBLE = "No se pudo conectar con el servicio de autenticación. Probá de nuevo en unos minutos.";
