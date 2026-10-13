import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/admin/sesion";
import { Aviso, Tarjeta, Titulo, fecha } from "@/components/admin/ui";

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
      <Titulo eyebrow={data.house} descripcion="Ficha administrativa de solo lectura. La edición y publicación se habilitarán después de verificar el flujo completo.">
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
      <Aviso>El stock no se modifica desde esta ficha. Para registrar unidades o movimientos, utilizá Inventario.</Aviso>
    </div>
  );
}
