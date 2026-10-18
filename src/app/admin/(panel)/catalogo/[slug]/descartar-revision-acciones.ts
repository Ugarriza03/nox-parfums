"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";

export async function descartarRevision(slug: string): Promise<void> {
  const { supabase } = await requerirAdmin();
  if (typeof slug !== "string" || slug.length > 120 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Solicitud inválida.");
  }
  const { error } = await supabase.rpc("nox_catalog_descartar_revision", {
    p_slug: slug
  });
  if (error) {
    if (error.code === "NX401" || error.code === "42501")
      throw new Error("Se requiere una sesión de administrador con MFA.");
    if (error.code === "NX404")
      throw new Error("La revisión ya no existe. Actualizá la página.");
    throw new Error("No se pudo descartar la revisión.");
  }
  revalidatePath(`/admin/catalogo/${slug}`);
  revalidatePath("/admin/catalogo");
}
