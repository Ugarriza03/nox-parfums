import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/admin/sesion";
import { Aviso, Tarjeta, Titulo, fecha } from "@/components/admin/ui";
import { CatalogFragranceEditor, type CatalogEditorValues } from "@/components/admin/CatalogFragranceEditor";
import { guardarEdicionCatalogo } from "./acciones";

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
    .select("slug,house,fragrance_name,gender,universe,origin,status,olfactory,image_path,updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return <Aviso tono="error">No se pudo consultar esta ficha del catálogo V2.</Aviso>;
  if (!data) notFound();

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
      {(data.status === "draft" || data.status === "published") ? (
        <Tarjeta>
          <h2 className="mb-4 text-lg text-bone">{data.status === "draft" ? "Editar borrador" : "Preparar revisión"}</h2>
          <CatalogFragranceEditor
            key={data.slug + ":" + data.updated_at}
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
      <Aviso>El stock no se modifica desde esta ficha. Para registrar unidades o movimientos, utilizá Inventario.</Aviso>
    </div>
  );
}
