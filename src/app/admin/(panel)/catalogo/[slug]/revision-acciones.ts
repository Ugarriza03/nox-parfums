"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";
import { esSlugValido, mensajeErrorRpc } from "@/lib/admin/catalogo-v2";
import type { ResultadoAccion } from "./estado-acciones";

/** Aprueba y aplica la revisión pendiente (nox_catalog_publicar_revision). */
export async function publicarRevision(slug: string): Promise<ResultadoAccion> {
  const { supabase } = await requerirAdmin();
  if (!esSlugValido(slug)) return { ok: false, error: "Identificador de fragancia inválido." };
  const { error } = await supabase.rpc("nox_catalog_publicar_revision", { p_slug: slug });
  if (error) return { ok: false, error: mensajeErrorRpc(error, "No se pudo aprobar la revisión.") };
  revalidatePath(`/admin/catalogo/${slug}`);
  revalidatePath("/admin/catalogo");
  return { ok: true };
}
