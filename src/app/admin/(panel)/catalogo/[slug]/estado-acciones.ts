"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";
import { ESTADOS_CATALOGO, esSlugValido, mensajeErrorRpc, type EstadoCatalogo } from "@/lib/admin/catalogo-v2";

export type { EstadoCatalogo };
export type ResultadoAccion = { ok: true } | { ok: false; error: string; desactualizada?: boolean };

/** Transición de estado mediante nox_catalog_cambiar_estado (auditada, idempotente). */
export async function cambiarEstadoCatalogo(slug: string, estado: EstadoCatalogo): Promise<ResultadoAccion> {
  const { supabase } = await requerirAdmin();
  if (!esSlugValido(slug) || !ESTADOS_CATALOGO.includes(estado)) return { ok: false, error: "Solicitud inválida." };
  const { error } = await supabase.rpc("nox_catalog_cambiar_estado", { p_slug: slug, p_estado: estado });
  if (error) return { ok: false, error: mensajeErrorRpc(error, "No se pudo cambiar el estado de la fragancia.") };
  revalidatePath(`/admin/catalogo/${slug}`);
  revalidatePath("/admin/catalogo");
  return { ok: true };
}
