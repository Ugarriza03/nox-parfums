"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";

export async function guardarComplementosCatalogo(input: {
 slug: string; description: string | null; inspiredLabel: string | null;
 dataStatus: "verificado" | "pendiente" | null;
 performance: Record<string, unknown> | null;
}): Promise<void> {
 const { supabase } = await requerirAdmin();
 if (!input || typeof input.slug !== "string" ||
     !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || input.slug.length>120 ||
     (input.description !== null && (typeof input.description !== "string" || input.description.length>5000)) ||
     (input.inspiredLabel !== null && (typeof input.inspiredLabel !== "string" || input.inspiredLabel.length>500)) ||
     (input.dataStatus !== null && !["verificado","pendiente"].includes(input.dataStatus)) ||
     (input.performance !== null && (typeof input.performance !== "object" || Array.isArray(input.performance)))) {
  throw new Error("Los datos editoriales no son válidos.");
 }
 const { error } = await supabase.rpc("nox_catalog_guardar_complementos",{
  p_slug:input.slug,p_description:input.description,p_inspired_label:input.inspiredLabel,
  p_data_status:input.dataStatus,p_performance:input.performance
 });
 if (error) {
  if (error.code==="NX409") throw new Error("La ficha cambió. Actualizá la página.");
  if (error.code==="NX401" || error.code==="42501") throw new Error("Se requiere administrador con MFA.");
  throw new Error("No se pudieron guardar los datos complementarios.");
 }
 revalidatePath(`/admin/catalogo/${input.slug}`);
}
