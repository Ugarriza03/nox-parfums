"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";

export async function publicarRevision(slug: string): Promise<void> {
  const { supabase } = await requerirAdmin();
  if (typeof slug !== "string" || slug.length > 120 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Identificador de fragancia inválido.");
  }

  const { error } = await supabase.rpc("nox_catalog_publicar_revision", { p_slug: slug });
  if (error) {
    if (error.code === "NX409") throw new Error("La revisión ya no es válida. Actualizá la página antes de intentar nuevamente.");
    if (error.code === "NX401" || error.code === "42501") throw new Error("Necesitás una sesión administrativa con MFA.");
    throw new Error("No se pudo aprobar la revisión.");
  }
  revalidatePath(`/admin/catalogo/${slug}`);
  revalidatePath("/admin/catalogo");
}
