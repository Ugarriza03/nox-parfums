"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";
import { mensajeErrorRpc } from "@/lib/admin/catalogo-v2";
import { validarValoresFicha } from "@/lib/admin/catalogo-validacion";
import { verificarVersion } from "@/lib/admin/catalogo-version";
import type { CatalogEditorValues, ResultadoGuardado } from "@/components/admin/CatalogFragranceEditor";

/**
 * Guarda la edición de una ficha existente:
 *   · borrador  → nox_catalog_editar_borrador (cambio directo, auditado)
 *   · publicada → nox_catalog_guardar_revision (revisión pendiente, no visible)
 * Devuelve el resultado en vez de lanzar: en producción Next oculta los
 * mensajes de error de las Server Actions.
 *
 * `esperada` es la versión que el servidor mostró al renderizar el editor (se
 * enlaza con .bind en la página). Si la ficha o su revisión cambiaron desde
 * entonces, se rechaza el guardado para no revertir cambios aprobados.
 */
export async function guardarEdicionCatalogo(esperada: unknown, values: CatalogEditorValues): Promise<ResultadoGuardado> {
  const { supabase } = await requerirAdmin();
  const v = validarValoresFicha(values);
  if (!v.ok) return v;
  const { valores } = v;

  const version = await verificarVersion(supabase, valores.slug, esperada);
  if (!version.ok) return version;

  const estado = version.actual.estado;
  const funcion = estado === "draft"
    ? "nox_catalog_editar_borrador"
    : estado === "published"
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
