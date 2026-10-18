import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import { PRODUCTS } from "@/data/products";
import { prepararVistaCatalogoV2, type FilaCatalogoV2 } from "@/lib/admin/catalogo-v2-adaptador";
import { Aviso, Tarjeta, Titulo } from "@/components/admin/ui";

export const metadata = { title: "Vista previa de migración del catálogo" };
export const dynamic = "force-dynamic";

function jsonEstable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(jsonEstable).join(",")}]`;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj).sort().map(k => `${JSON.stringify(k)}:${jsonEstable(obj[k])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export default async function VistaPreviaCatalogoV2() {
  const { supabase } = await requerirAdmin();
  const { data, error } = await supabase.from("catalog_products")
    .select("slug,house,fragrance_name,status,gender,universe,origin,olfactory,inspired_label,data_status,performance,image_path")
    .order("slug").limit(1000);
  if (error || !data) return <Aviso tono="error">No se pudo leer el catálogo V2. La tienda pública permanece intacta.</Aviso>;

  const vista = prepararVistaCatalogoV2(data as FilaCatalogoV2[], false);
  const originales = new Map(PRODUCTS.map(p => [p.slug, p]));
  const recibidos = new Set<string>();
  const problemas: string[] = [];
  let publicados = 0;
  let nuevos = 0;
  let perfilesDiferentes = 0;
  let rendimientoNoVerificado = 0;
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
    if (jsonEstable(p.olfactory) !== jsonEstable(original.olfactory)) {
      perfilesDiferentes++;
      problemas.push(`Perfil olfativo diferente: ${p.slug}`);
    }
    if (p.inspired_label !== original.inspiredLabel || p.data_status !== original.dataStatus) {
      problemas.push(`Referencia o estado de verificación diferente: ${p.slug}`);
    }
    // Una performance afirmada sin prueba NOX es un bloqueo, no una diferencia editorial.
    const rendimiento = p.performance as { verified?: unknown } | null;
    if (rendimiento?.verified === true && original.performance.verified !== true) {
      rendimientoNoVerificado++;
      problemas.push(`Rendimiento NOX sin prueba previa: ${p.slug}`);
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
          <div><dt className="text-sm text-mist">Perfiles olfativos diferentes</dt><dd className="text-xl text-bone">{perfilesDiferentes}</dd></div>
          <div><dt className="text-sm text-mist">Rendimientos sin prueba previa</dt><dd className="text-xl text-bone">{rendimientoNoVerificado}</dd></div>
        </dl>
      </Tarjeta>
      <Aviso tono={vista.fuente === "v2" ? "ok" : "info"}>
        Adaptador de lectura: {vista.fuente === "v2" ? "datos V2 disponibles para simulación" : `respaldo estático activo (${vista.motivos.join(", ")})`}. Ningún cambio se muestra en la tienda pública.
      </Aviso>
      <Aviso tono={listo ? "info" : "error"}>
        {listo
          ? "Paridad de identidad y datos olfativos 233/233. Aún falta verificar imágenes, pedidos y SEO antes de cualquier corte público."
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
