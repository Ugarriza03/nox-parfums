/**
 * Verificación de versión antes de escribir una ficha del catálogo V2 — sólo servidor.
 *
 * Lee updated_at/estado de la ficha y la fecha de la revisión pendiente, y los
 * compara con lo que el editor recibió al renderizar. Si difieren, la Server
 * Action rechaza el guardado: así un formulario viejo (otra pestaña, o una
 * vista anterior a una aprobación) no puede revertir cambios aprobados.
 *
 * Limitación conocida: la verificación y la RPC son dos consultas, por lo que
 * queda una ventana de milisegundos entre ambas. La RPC de revisiones ya
 * rechaza revisiones con base distinta (NX409); para cerrar del todo la
 * ventana en borradores haría falta un parámetro de versión en la RPC
 * (migración, fuera de alcance).
 */

import type { ClienteAdmin } from "./supabase";
import { compararVersion, type VersionActual } from "./ficha-sincronizacion";

export async function leerVersionActual(supabase: ClienteAdmin, slug: string): Promise<VersionActual | null> {
  const [ficha, revision] = await Promise.all([
    supabase.from("catalog_products").select("status,updated_at").eq("slug", slug).maybeSingle(),
    supabase.from("catalog_revisions").select("proposed_at").eq("product_slug", slug).maybeSingle()
  ]);
  if (ficha.error || !ficha.data || revision.error) return null;
  return {
    updatedAt: typeof ficha.data.updated_at === "string" ? ficha.data.updated_at : null,
    estado: typeof ficha.data.status === "string" ? ficha.data.status : null,
    revisionAt: typeof revision.data?.proposed_at === "string" ? revision.data.proposed_at : null
  };
}

/** null si se puede escribir; si no, el mensaje para el usuario. */
export async function verificarVersion(supabase: ClienteAdmin, slug: string, esperada: unknown): Promise<
  { ok: true; actual: VersionActual } | { ok: false; error: string; desactualizada: boolean }
> {
  const actual = await leerVersionActual(supabase, slug);
  if (!actual) return { ok: false, error: "No se pudo verificar la fragancia.", desactualizada: false };
  const motivo = compararVersion(esperada, actual);
  if (motivo) return { ok: false, error: motivo, desactualizada: true };
  return { ok: true, actual };
}
