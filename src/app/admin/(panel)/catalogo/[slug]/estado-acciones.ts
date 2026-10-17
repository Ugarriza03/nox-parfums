"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";

export type EstadoCatalogo = "draft" | "published" | "hidden" | "archived";

export async function cambiarEstadoCatalogo(slug: string, estado: EstadoCatalogo): Promise<void> {
  const { supabase } = await requerirAdmin();
  if (typeof slug !== "string" || slug.length > 120 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      !["draft", "published", "hidden", "archived"].includes(estado)) {
    throw new Error("Solicitud inválida.");
  }

  const { error } = await supabase.rpc("nox_catalog_cambiar_estado", {
    p_slug: slug,
    p_estado: estado
  });
  if (error) {
    if (error.code === "NX409") throw new Error("La transición no está permitida. Actualizá la ficha antes de continuar.");
    if (error.code === "NX401" || error.code === "42501") throw new Error("Se requiere una sesión de administrador con MFA.");
    throw new Error("No se pudo modificar el estado de la fragancia.");
  }
  revalidatePath(`/admin/catalogo/${slug}`);
  revalidatePath("/admin/catalogo");
}
