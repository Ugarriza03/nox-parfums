"use server";

import { requerirAdmin } from "@/lib/admin/sesion";
import { COVER_BUCKET, MAX_COVER_BYTES, validarPortada } from "@/lib/admin/validar-portada";

/**
 * Carga una imagen privada como candidato. NO modifica catalog_products,
 * NO publica revisiones y NO elimina las portadas locales.
 * La asociación a la ficha se guarda por separado mediante el editor.
 */
export async function subirPortadaCatalogo(form: FormData): Promise<string> {
  const { supabase } = await requerirAdmin();
  const slug = form.get("slug");
  const archivo = form.get("archivo");
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      slug.length > 120 || !(archivo instanceof File)) {
    throw new Error("Seleccioná una imagen y una fragancia válida.");
  }
  if (archivo.size < 1 || archivo.size > MAX_COVER_BYTES) {
    throw new Error("La portada debe pesar como máximo 5 MB.");
  }
  const { data: producto, error: errorProducto } = await supabase
    .from("catalog_products").select("status").eq("slug", slug).maybeSingle();
  if (errorProducto || !producto) throw new Error("No se pudo verificar la fragancia.");
  if (producto.status !== "draft" && producto.status !== "published") {
    throw new Error("Esta fragancia no admite imágenes mientras está oculta o archivada.");
  }

  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const { storagePath } = validarPortada(slug, archivo.name, archivo.type, bytes);
  const { error } = await supabase.storage.from(COVER_BUCKET).upload(storagePath, bytes, {
    contentType: archivo.type,
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw new Error("No se pudo subir la imagen al almacenamiento privado.");
  // No devolver URL pública ni token de acceso. El editor conserva la ruta.
  return storagePath;
}
