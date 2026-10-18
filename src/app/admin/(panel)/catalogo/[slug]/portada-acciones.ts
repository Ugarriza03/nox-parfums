"use server";

import { requerirAdmin } from "@/lib/admin/sesion";
import { esSlugValido } from "@/lib/admin/catalogo-v2";
import { COVER_BUCKET, MAX_COVER_BYTES, MAX_COVER_ETIQUETA, validarPortada } from "@/lib/admin/validar-portada";

export type ResultadoPortada = { ok: true; ruta: string } | { ok: false; error: string };

/**
 * Carga una imagen privada como candidata. NO modifica catalog_products,
 * NO publica revisiones y NO elimina portadas. La asociación a la ficha se
 * guarda por separado desde el editor (borrador o revisión).
 */
export async function subirPortadaCatalogo(form: FormData): Promise<ResultadoPortada> {
  const { supabase } = await requerirAdmin();
  const slug = form.get("slug");
  const archivo = form.get("archivo");
  if (!esSlugValido(slug) || !(archivo instanceof File)) {
    return { ok: false, error: "Seleccioná una imagen para una fragancia válida." };
  }
  if (archivo.size < 1 || archivo.size > MAX_COVER_BYTES) return { ok: false, error: `La portada debe pesar como máximo ${MAX_COVER_ETIQUETA}.` };

  const { data: producto, error: errorProducto } = await supabase
    .from("catalog_products").select("status").eq("slug", slug).maybeSingle();
  if (errorProducto || !producto) return { ok: false, error: "No se pudo verificar la fragancia." };
  if (producto.status !== "draft" && producto.status !== "published") {
    return { ok: false, error: "Una fragancia oculta o archivada no admite imágenes nuevas." };
  }

  let storagePath: string;
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  try {
    ({ storagePath } = validarPortada(slug, archivo.name, archivo.type, bytes));
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Imagen inválida." };
  }
  const { error } = await supabase.storage.from(COVER_BUCKET).upload(storagePath, bytes, {
    contentType: archivo.type,
    cacheControl: "3600",
    upsert: false
  });
  if (error) return { ok: false, error: "No se pudo subir la imagen al almacenamiento privado." };
  return { ok: true, ruta: storagePath };
}
