"use server";

import { requerirAdmin } from "@/lib/admin/sesion";
import { COVER_BUCKET } from "@/lib/admin/validar-portada";

export type PortadaAuditada = {
  path: string;
  createdAt: string | null;
  referenced: boolean;
  candidate: boolean;
};

/** Informe de lectura únicamente. No borra, mueve ni modifica objetos. */
export async function auditarPortadasCatalogo(slug: string): Promise<PortadaAuditada[]> {
  const { supabase } = await requerirAdmin();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) {
    throw new Error("Fragancia inválida.");
  }
  const { data: product, error: productError } = await supabase
    .from("catalog_products").select("slug").eq("slug", slug).maybeSingle();
  if (productError || !product) throw new Error("No se pudo verificar la fragancia.");

  const { data: objects, error } = await supabase.storage
    .from(COVER_BUCKET).list(`covers/${slug}`, { limit: 100, offset: 0, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw new Error("No se pudo consultar el almacenamiento privado.");
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const result: PortadaAuditada[] = [];
  for (const object of objects ?? []) {
    if (!/^[a-z0-9-]+\.(webp|png|jpg|jpeg)$/.test(object.name)) continue;
    const path = `covers/${slug}/${object.name}`;
    const { data: referenced, error: refError } = await supabase.rpc("nox_catalog_imagen_en_uso", { p_path: path });
    if (refError) throw new Error("No se pudieron verificar las referencias de las imágenes.");
    const createdAt = typeof object.created_at === "string" ? object.created_at : null;
    const age = createdAt ? Date.parse(createdAt) : NaN;
    const candidate = referenced === false && Number.isFinite(age) && age < cutoff;
    result.push({ path, createdAt, referenced: referenced === true, candidate });
  }
  return result;
}
