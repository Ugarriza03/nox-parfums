"use server";

/**
 * ACCIONES DE SERVIDOR DE NOX ADMIN
 *
 * Cada acción vuelve a verificar la sesión y los permisos en el servidor
 * (requerirAdmin / obtenerAcceso). Ningún botón oculto ni validación del
 * navegador se considera suficiente. La base de datos, además, rechaza a
 * quien no sea administrador (RLS + is_admin()).
 */

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { obtenerAcceso, requerirAdmin } from "@/lib/admin/sesion";
import { MENSAJE_AUTH_INACCESIBLE, clasificarErrorAuth } from "@/lib/admin/acceso";
import { ETIQUETA_TIPO, mensajeDeError, validarMovimiento } from "@/lib/admin/inventario-reglas";
import { SLUGS_VALIDOS } from "@/lib/admin/catalogo";
import { registrarMovimientoDB } from "@/lib/admin/datos";

export interface EstadoFormulario {
  ok: boolean;
  mensaje: string | null;
  errores?: Record<string, string>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ sesión */

export async function iniciarSesion(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const { acceso, supabase } = await obtenerAcceso();
  if (acceso.estado === "deshabilitado") notFound();
  if (!supabase) return { ok: false, mensaje: "El panel no está configurado en este entorno." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  // Mensaje único: no revela si el email existe.
  const credencialesInvalidas = { ok: false, mensaje: "Email o contraseña incorrectos." };
  if (!EMAIL.test(email) || email.length > 254 || password.length < 8 || password.length > 200) {
    return credencialesInvalidas;
  }

  let resultado: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
  try {
    resultado = await supabase.auth.signInWithPassword({ email, password });
  } catch {
    return { ok: false, mensaje: MENSAJE_AUTH_INACCESIBLE };
  }
  if (resultado.error) {
    // Sin respuesta del servidor de autenticación (caído, pausado o sin red).
    if (clasificarErrorAuth(resultado.error) === "conexion") {
      return { ok: false, mensaje: MENSAJE_AUTH_INACCESIBLE };
    }
    if (resultado.error.status === 429) {
      return { ok: false, mensaje: "Demasiados intentos. Esperá unos minutos antes de volver a probar." };
    }
    return credencialesInvalidas;
  }
  // /admin decide: panel, segundo factor o "sin acceso".
  redirect("/admin");
}

export async function cerrarSesion(): Promise<void> {
  const { supabase } = await obtenerAcceso();
  if (supabase) {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Aunque falle la red, las cookies locales se eliminan igual.
    }
  }
  redirect("/admin/login");
}

/* ------------------------------------------------------------- inventario */

export async function registrarMovimiento(
  _previo: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const { supabase } = await requerirAdmin();

  const validacion = validarMovimiento(
    {
      requestId: formData.get("requestId"),
      productSlug: formData.get("productSlug"),
      tipo: formData.get("tipo"),
      cantidad: formData.get("cantidad"),
      motivo: formData.get("motivo")
    },
    SLUGS_VALIDOS
  );
  if (!validacion.ok) {
    return { ok: false, mensaje: "Revisá los datos del movimiento.", errores: validacion.errores as Record<string, string> };
  }

  const resultado = await registrarMovimientoDB(supabase, validacion.datos);
  if (!resultado.ok) return { ok: false, mensaje: mensajeDeError(resultado.error) };

  const m = resultado.movimiento;
  revalidatePath("/admin", "layout");
  return {
    ok: true,
    mensaje: `${ETIQUETA_TIPO[m.movement_type]} registrado. Stock propio: ${m.stock_before} → ${m.stock_after}.`
  };
}

/* ------------------------------------------------------------------- MFA */

export type PreparacionMfa =
  | { ok: true; factorId: string; qr: string; secreto: string }
  | { ok: false; mensaje: string };

export async function prepararMfa(): Promise<PreparacionMfa> {
  const { supabase } = await requerirAdmin({ permitirAal1: true });

  const factores = await supabase.auth.mfa.listFactors();
  if (factores.error || !factores.data) return { ok: false, mensaje: "No se pudieron leer los factores de seguridad." };
  if (factores.data.totp.length > 0) return { ok: false, mensaje: "Ya tenés una app de autenticación vinculada." };

  // Descarta inscripciones anteriores que nunca se confirmaron.
  for (const f of factores.data.all) {
    if (f.factor_type === "totp" && f.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }

  const inscripcion = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "NOX Admin" });
  if (inscripcion.error || !inscripcion.data) {
    return { ok: false, mensaje: "No se pudo iniciar la vinculación. Verificá que MFA (TOTP) esté habilitado en Supabase." };
  }
  return {
    ok: true,
    factorId: inscripcion.data.id,
    qr: inscripcion.data.totp.qr_code,
    secreto: inscripcion.data.totp.secret
  };
}

export async function verificarMfa(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const { supabase } = await requerirAdmin({ permitirAal1: true });

  const factorId = String(formData.get("factorId") ?? "");
  const codigo = String(formData.get("codigo") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(codigo)) return { ok: false, mensaje: "El código tiene 6 dígitos." };

  // El factor tiene que pertenecer al usuario de la sesión.
  const factores = await supabase.auth.mfa.listFactors();
  const propio = factores.data?.all.some((f) => f.id === factorId && f.factor_type === "totp");
  if (!propio) return { ok: false, mensaje: "Factor de seguridad inválido. Recargá la página." };

  const verificacion = await supabase.auth.mfa.challengeAndVerify({ factorId, code: codigo });
  if (verificacion.error) return { ok: false, mensaje: "Código incorrecto o vencido. Probá con el siguiente." };

  redirect("/admin");
}
