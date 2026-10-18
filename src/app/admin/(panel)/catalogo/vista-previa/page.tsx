import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import { PRODUCTS } from "@/data/products";
import { Aviso, Tarjeta, Titulo } from "@/components/admin/ui";

export const metadata = { title: "Vista previa de migración del catálogo" };
export const dynamic = "force-dynamic";

export default async function VistaPreviaCatalogoV2() {
  const { supabase } = await requerirAdmin();
  const { data, error } = await supabase.from("catalog_products")
    .select("slug,house,fragrance_name,status,gender,universe,origin")
    .order("slug").limit(1000);
  if (error || !data) return <Aviso tono="error">No se pudo leer el catálogo V2. La tienda pública permanece intacta.</Aviso>;

  const originales = new Map(PRODUCTS.map(p => [p.slug, p]));
  const recibidos = new Set<string>();
  const problemas: string[] = [];
  let publicados = 0;
  let nuevos = 0;
  for (const p of data) {
    if (recibidos.has(p.slug)) problemas.push(`Slug duplicado: ${p.slug}`);
    recibidos.add(p.slug);
    if (p.status === "published") publicados++;
    const original = originales.get(p.slug);
    if (!original) { nuevos++; continue; }
    if (p.status !== "published") problemas.push(`Producto histórico no publicado: ${p.slug}`);
    if (p.house !== original.house || p.gender !== original.gender ||
        p.universe !== original.universe || p.origin !== original.origin ||
        `${p.house} ${p.fragrance_name}` !== original.inspiredBy) {
      problemas.push(`Datos de identidad diferentes: ${p.slug}`);
    }
  }
  for (const p of PRODUCTS) {
    if (!recibidos.has(p.slug)) problemas.push(`Falta producto histórico: ${p.slug}`);
  }
  const listo = problemas.length === 0 && data.length === 233 && publicados === 233 && nuevos === 0;
  return (
    <div className="space-y-6">
      <Link href="/admin/catalogo" className="text-sm text-mist hover:text-bone">← Catálogo</Link>
      <Titulo eyebrow="Control previo" descripcion="Comparación de solo lectura entre el catálogo público estático y la base V2. No activa el catálogo nuevo.">
        Vista previa de migración
      </Titulo>
      <Tarjeta>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-mist">Productos actuales</dt><dd className="text-xl text-bone">{PRODUCTS.length}</dd></div>
          <div><dt className="text-sm text-mist">Registros en V2</dt><dd className="text-xl text-bone">{data.length}</dd></div>
          <div><dt className="text-sm text-mist">Publicados en V2</dt><dd className="text-xl text-bone">{publicados}</dd></div>
          <div><dt className="text-sm text-mist">Productos nuevos en V2</dt><dd className="text-xl text-bone">{nuevos}</dd></div>
        </dl>
      </Tarjeta>
      <Aviso tono={listo ? "info" : "error"}>
        {listo
          ? "Paridad básica de identidad 233/233. Aún falta verificar imágenes, notas, pedidos y SEO antes de cualquier corte público."
          : "No se permite considerar listo el cambio al catálogo V2. Revisá las diferencias indicadas."}
      </Aviso>
      {problemas.length > 0 && (
        <Tarjeta>
          <h2 className="mb-3 text-base text-bone">Diferencias detectadas ({problemas.length})</h2>
          <ul className="max-h-96 list-disc space-y-1 overflow-y-auto pl-5 text-sm text-haze">
            {problemas.map((problema, index) => <li key={index}>{problema}</li>)}
          </ul>
        </Tarjeta>
      )}
      <p className="text-sm text-mist">Esta pantalla nunca modifica Supabase, el inventario ni el catálogo público.</p>
    </div>
  );
}
