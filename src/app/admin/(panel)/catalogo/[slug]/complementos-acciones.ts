"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin/sesion";
import { esSlugValido, mensajeErrorRpc } from "@/lib/admin/catalogo-v2";
import { verificarVersion } from "@/lib/admin/catalogo-version";
import type { ResultadoAccion } from "./estado-acciones";

/**
 * Guarda la información editorial (referencia, descripción, estado de datos).
 *
 * El rendimiento NOX (duración, proyección, estela) NO se edita desde el
 * panel: sólo se carga con pruebas propias de NOX. Por eso el servidor ignora
 * cualquier valor recibido y reenvía el que ya tenía la ficha (o la revisión
 * pendiente), de modo que la RPC nunca recibe una afirmación nueva.
 */
export async function guardarComplementosCatalogo(input: {
  slug: string;
  description: string | null;
  inspiredLabel: string | null;
  dataStatus: "verificado" | "pendiente" | null;
  /** Versión que mostró la página; si cambió, se rechaza (formulario viejo). */
  versionEsperada: unknown;
}): Promise<ResultadoAccion> {
  const { supabase } = await requerirAdmin();
  if (!input || !esSlugValido(input.slug) ||
      (input.description !== null && (typeof input.description !== "string" || input.description.length > 5000)) ||
      (input.inspiredLabel !== null && (typeof input.inspiredLabel !== "string" || input.inspiredLabel.length > 500)) ||
      (input.dataStatus !== null && !["verificado", "pendiente"].includes(input.dataStatus))) {
    return { ok: false, error: "Los datos editoriales no son válidos." };
  }
  const version = await verificarVersion(supabase, input.slug, input.versionEsperada);
  if (!version.ok) return version;

  const [ficha, revision] = await Promise.all([
    supabase.from("catalog_products").select("performance").eq("slug", input.slug).maybeSingle(),
    supabase.from("catalog_revisions").select("proposed_data").eq("product_slug", input.slug).maybeSingle()
  ]);
  if (ficha.error || !ficha.data || revision.error) return { ok: false, error: "No se pudo verificar la fragancia." };
  const propuesta = (revision.data?.proposed_data ?? null) as Record<string, unknown> | null;
  const performance = propuesta && Object.hasOwn(propuesta, "performance") ? propuesta.performance : ficha.data.performance;

  const { error } = await supabase.rpc("nox_catalog_guardar_complementos", {
    p_slug: input.slug,
    p_description: input.description,
    p_inspired_label: input.inspiredLabel,
    p_data_status: input.dataStatus,
    p_performance: performance ?? null
  });
  if (error) return { ok: false, error: mensajeErrorRpc(error, "No se pudieron guardar los datos complementarios.") };
  revalidatePath(`/admin/catalogo/${input.slug}`);
  return { ok: true };
}
