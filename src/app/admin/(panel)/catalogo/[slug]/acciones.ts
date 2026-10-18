"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";
import { mensajeErrorRpc } from "@/lib/admin/catalogo-v2";
import { validarValoresFicha } from "@/lib/admin/catalogo-validacion";
import type { CatalogEditorValues, ResultadoGuardado } from "@/components/admin/CatalogFragranceEditor";

/**
 * Guarda la edición de una ficha existente:
 *   · borrador  → nox_catalog_editar_borrador (cambio directo, auditado)
 *   · publicada → nox_catalog_guardar_revision (revisión pendiente, no visible)
 * Devuelve el resultado en vez de lanzar: en producción Next oculta los
 * mensajes de error de las Server Actions.
 */
export async function guardarEdicionCatalogo(values: CatalogEditorValues): Promise<ResultadoGuardado> {
  const { supabase } = await requerirAdmin();
  const v = validarValoresFicha(values);
  if (!v.ok) return v;
  const { valores } = v;

  const { data: actual, error: errorLectura } = await supabase
    .from("catalog_products").select("status").eq("slug", valores.slug).maybeSingle();
  if (errorLectura || !actual) return { ok: false, error: "No se pudo verificar la fragancia." };

  const funcion = actual.status === "draft"
    ? "nox_catalog_editar_borrador"
    : actual.status === "published"
      ? "nox_catalog_guardar_revision"
      : null;
  if (!funcion) return { ok: false, error: "Sólo se editan borradores o se proponen revisiones de fichas publicadas." };

  const { error } = await supabase.rpc(funcion, {
    p_slug: valores.slug,
    p_house: valores.house,
    p_fragrance_name: valores.fragranceName,
    p_gender: valores.gender,
    p_universe: valores.universe,
    p_origin: valores.origin,
    p_olfactory: valores.olfactory,
    p_image_path: valores.imagePath
  });
  if (error) return { ok: false, error: mensajeErrorRpc(error, "No se pudieron guardar los cambios.") };
  revalidatePath(`/admin/catalogo/${valores.slug}`);
  revalidatePath("/admin/catalogo");
  return { ok: true };
}
