import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/admin/sesion";
import { Aviso, Tarjeta, Titulo, fecha } from "@/components/admin/ui";
import type { CatalogEditorValues } from "@/components/admin/CatalogFragranceEditor";
import { EditorComplementos } from "@/components/admin/EditorComplementos";
import { AuditoriaPortadas } from "@/components/admin/AuditoriaPortadas";
import { CatalogEditorConPortada } from "@/components/admin/CatalogEditorConPortada";
import { guardarEdicionCatalogo } from "./acciones";
import { AprobarRevision } from "@/components/admin/AprobarRevision";
import { ControlesEstadoCatalogo } from "@/components/admin/ControlesEstadoCatalogo";
import type { EstadoCatalogo } from "./estado-acciones";

export const metadata = { title: "Ficha del catálogo" };

export default async function FichaCatalogoAdmin({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { supabase } = await requerirAdmin();
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) notFound();

  const { data, error } = await supabase
    .from("catalog_products")
    .select("slug,house,fragrance_name,gender,universe,origin,status,olfactory,image_path,description,inspired_label,data_status,performance,updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return <Aviso tono="error">No se pudo consultar esta ficha del catálogo V2.</Aviso>;
  if (!data) notFound();

  const revision = data.status === "published"
    ? await supabase.from("catalog_revisions")
        .select("proposed_data,proposed_at,base_updated_at")
        .eq("product_slug", slug).maybeSingle()
    : null;

  const campos = [
    ["Identificador", data.slug],
    ["Género", data.gender],
    ["Categoría", data.universe],
    ["Origen", data.origin],
    ["Estado", data.status],
    ["Imagen", data.image_path ?? "Sin imagen configurada"],
    ["Última actualización", fecha(data.updated_at)]
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/catalogo" className="text-sm text-mist hover:text-bone">← Catálogo</Link>
      <Titulo eyebrow={data.house} descripcion="Los borradores se editan directamente. Las fichas publicadas generan revisiones pendientes, sin modificar la tienda.">
        {data.fragrance_name}
      </Titulo>
      <Tarjeta>
        <dl className="grid gap-4 sm:grid-cols-2">
          {campos.map(([nombre, valor]) => (
            <div key={nombre} className="border-b border-edge pb-3">
              <dt className="text-xs text-mist">{nombre}</dt>
              <dd className="mt-1 break-words text-sm text-bone">{valor}</dd>
            </div>
          ))}
        </dl>
      </Tarjeta>
      <Tarjeta>
        <h2 className="mb-3 text-base text-bone">Perfil olfativo</h2>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-haze">
          {data.olfactory ? JSON.stringify(data.olfactory, null, 2) : "Sin perfil cargado"}
        </pre>
      </Tarjeta>
      {revision?.error ? (
        <Aviso tono="error">No se pudo verificar si existen revisiones pendientes.</Aviso>
      ) : revision?.data ? (
        <Tarjeta>
          <h2 className="mb-3 text-lg text-bone">Revisión pendiente de aprobación</h2>
          <p className="mb-3 text-sm text-mist">Propuesta guardada el {fecha(revision.data.proposed_at)}. La ficha actual no se modifica hasta aprobarla.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs uppercase tracking-wider text-mist">Ficha actual</h3>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-edge p-3 text-xs text-haze">{JSON.stringify({
                house: data.house, fragrance_name: data.fragrance_name, gender: data.gender,
                universe: data.universe, origin: data.origin, olfactory: data.olfactory,
                image_path: data.image_path
              }, null, 2)}</pre>
            </div>
            <div>
              <h3 className="mb-2 text-xs uppercase tracking-wider text-mist">Cambios propuestos</h3>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-edge p-3 text-xs text-haze">{JSON.stringify(revision.data.proposed_data, null, 2)}</pre>
            </div>
          </div>
          <div className="mt-5"><AprobarRevision slug={slug} /></div>
        </Tarjeta>
      ) : null}
      {(data.status === "draft" || data.status === "published") ? (
        <Tarjeta>
          <CatalogEditorConPortada
            slug={slug}
            mode={data.status === "draft" ? "edit-draft" : "propose-revision"}
            initial={{
              slug: data.slug,
              house: data.house,
              fragranceName: data.fragrance_name,
              gender: data.gender as CatalogEditorValues["gender"],
              universe: data.universe as CatalogEditorValues["universe"],
              origin: data.origin as CatalogEditorValues["origin"],
              olfactory: data.olfactory as Record<string, unknown> | null,
              imagePath: data.image_path
            }}
            onSave={guardarEdicionCatalogo}
          />
        </Tarjeta>
      ) : (
        <Aviso>Esta fragancia está oculta o archivada. Para editarla, primero debe volver a un estado permitido.</Aviso>
      )}
      {(data.status === "draft" || data.status === "published") && (
        <Tarjeta>
          <EditorComplementos slug={slug} status={data.status} initial={{
            description: data.description,
            inspiredLabel: data.inspired_label,
            dataStatus: data.data_status as "verificado" | "pendiente" | null,
            performance: data.performance as Record<string, unknown> | null
          }} />
        </Tarjeta>
      )}
      <Tarjeta>
        <AuditoriaPortadas slug={slug} />
      </Tarjeta>
      <Tarjeta>
        <h2 className="mb-4 text-lg text-bone">Publicación y visibilidad</h2>
        <ControlesEstadoCatalogo slug={slug} estado={data.status as EstadoCatalogo} />
      </Tarjeta>
      <Aviso>El stock no se modifica desde esta ficha. Para registrar unidades o movimientos, utilizá Inventario.</Aviso>
    </div>
  );
}
