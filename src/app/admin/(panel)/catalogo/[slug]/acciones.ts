"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";
import type { CatalogEditorValues } from "@/components/admin/CatalogFragranceEditor";

export async function guardarEdicionCatalogo(values: CatalogEditorValues): Promise<void> {
  const { supabase } = await requerirAdmin();

  if (!values || typeof values.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug) || values.slug.length > 120 ||
      typeof values.house !== "string" || !values.house.trim() || values.house.trim().length > 160 ||
      typeof values.fragranceName !== "string" || !values.fragranceName.trim() || values.fragranceName.trim().length > 180 ||
      !["femenino", "masculino", "unisex"].includes(values.gender) ||
      !["disenador", "nicho", "arabe", "pendiente"].includes(values.universe) ||
      !["internacional", "arabe"].includes(values.origin) ||
      (values.olfactory !== null && (typeof values.olfactory !== "object" || Array.isArray(values.olfactory))) ||
      (values.imagePath !== null &&
       (typeof values.imagePath !== "string" || values.imagePath.length > 500 ||
        values.imagePath.startsWith("/") || values.imagePath.includes("..") ||
        /[\x00-\x1f\x7f]/.test(values.imagePath)))) {
    throw new Error("Los datos de la fragancia no son válidos.");
  }

  const { data: actual, error: errorLectura } = await supabase
    .from("catalog_products").select("status").eq("slug", values.slug).maybeSingle();

  if (errorLectura || !actual) throw new Error("No se pudo verificar la fragancia.");
  const funcion = actual.status === "draft"
    ? "nox_catalog_editar_borrador"
    : actual.status === "published"
      ? "nox_catalog_guardar_revision"
      : null;

  if (!funcion) throw new Error("Solo se editan borradores o se proponen revisiones de fichas publicadas.");

  const { error } = await supabase.rpc(funcion, {
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
    if (error.code === "NX409") throw new Error("El estado de la fragancia cambió. Actualizá la página y revisá antes de guardar.");
    if (error.code === "NX401" || error.code === "42501") throw new Error("Necesitás una sesión de administrador con MFA.");
    throw new Error("No se pudieron guardar los cambios.");
  }
  revalidatePath(`/admin/catalogo/${values.slug}`);
  revalidatePath("/admin/catalogo");
}
