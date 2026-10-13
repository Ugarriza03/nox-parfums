"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";
import type { CatalogEditorValues } from "@/components/admin/CatalogFragranceEditor";

/** Server Action: el navegador nunca recibe tokens ni habla con Supabase. */
export async function guardarBorrador(values: CatalogEditorValues): Promise<void> {
  const { supabase } = await requerirAdmin();

  if (!values || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug) ||
      values.slug.length > 120 ||
      !values.house?.trim() || values.house.trim().length > 160 ||
      !values.fragranceName?.trim() || values.fragranceName.trim().length > 180 ||
      !["femenino","masculino","unisex"].includes(values.gender) ||
      !["disenador","nicho","arabe","pendiente"].includes(values.universe) ||
      !["internacional","arabe"].includes(values.origin) ||
      (values.olfactory !== null &&
       (typeof values.olfactory !== "object" || Array.isArray(values.olfactory))) ||
      (values.imagePath !== null &&
       (typeof values.imagePath !== "string" || values.imagePath.length > 500 ||
        values.imagePath.startsWith("/") || values.imagePath.includes("..") ||
        /[\x00-\x1f\x7f]/.test(values.imagePath)))) {
    throw new Error("Revisá los datos de la fragancia antes de guardar.");
  }

  const { error } = await supabase.rpc("nox_catalog_crear_borrador", {
    p_slug: values.slug,
    p_house: values.house.trim(),
    p_fragrance_name: values.fragranceName.trim(),
    p_gender: values.gender,
    p_universe: values.universe,
    p_origin: values.origin,
    p_olfactory: values.olfactory,
    p_image_path: values.imagePath
  });
  if (error) {
    if (error.code === "NX409" || error.code === "23505") {
      throw new Error("Ya existe una fragancia con ese identificador.");
    }
    if (error.code === "NX401" || error.code === "42501") {
      throw new Error("Tu sesión no tiene autorización. Volvé a ingresar con MFA.");
    }
    throw new Error("No se pudo guardar el borrador. Verificá la configuración del catálogo V2.");
  }
  revalidatePath("/admin/catalogo");
}
