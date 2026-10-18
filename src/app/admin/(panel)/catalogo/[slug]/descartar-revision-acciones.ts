"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";
import { esSlugValido, mensajeErrorRpc } from "@/lib/admin/catalogo-v2";
import type { ResultadoAccion } from "./estado-acciones";

/**
 * Descarta la revisión pendiente (nox_catalog_descartar_revision, migración
 * 20261012270000). Si la base todavía no tiene esa función, devuelve un error
 * claro y no hace nada: no existe un camino alternativo que borre la revisión.
 */
export async function descartarRevision(slug: string): Promise<ResultadoAccion> {
  const { supabase } = await requerirAdmin();
  if (!esSlugValido(slug)) return { ok: false, error: "Solicitud inválida." };
  const { error } = await supabase.rpc("nox_catalog_descartar_revision", { p_slug: slug });
  if (error) return { ok: false, error: mensajeErrorRpc(error, "No se pudo descartar la revisión.") };
  revalidatePath(`/admin/catalogo/${slug}`);
  revalidatePath("/admin/catalogo");
  return { ok: true };
}
