"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";
import { mensajeErrorRpc } from "@/lib/admin/catalogo-v2";
import { validarValoresFicha } from "@/lib/admin/catalogo-validacion";
import type { CatalogEditorValues, ResultadoGuardado } from "@/components/admin/CatalogFragranceEditor";

/** Crea una fragancia como BORRADOR (nunca publicada) mediante la RPC auditada. */
export async function guardarBorrador(values: CatalogEditorValues): Promise<ResultadoGuardado> {
  const { supabase } = await requerirAdmin();
  const v = validarValoresFicha(values);
  if (!v.ok) return v;
  const { valores } = v;
  // Una ficha nueva todavía no puede tener portada: se sube después de crearla.
  if (valores.imagePath !== null) return { ok: false, error: "La portada se agrega después de crear el borrador." };

  const { error } = await supabase.rpc("nox_catalog_crear_borrador", {
    p_slug: valores.slug,
    p_house: valores.house,
    p_fragrance_name: valores.fragranceName,
    p_gender: valores.gender,
    p_universe: valores.universe,
    p_origin: valores.origin,
    p_olfactory: valores.olfactory,
    p_image_path: null
  });
  if (error) return { ok: false, error: mensajeErrorRpc(error, "No se pudo crear el borrador.") };
  revalidatePath("/admin/catalogo");
  return { ok: true, slug: valores.slug };
}
