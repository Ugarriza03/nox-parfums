import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import { Aviso, TablaContenedor, Titulo, claseBoton, claseCampo, claseTabla, claseTd, claseTh, fecha } from "@/components/admin/ui";

export const metadata = { title: "Catálogo de fragancias" };

type Estado = "draft" | "published" | "hidden" | "archived";
type Fila = {
  slug: string;
  house: string;
  fragrance_name: string;
  gender: string;
  universe: string;
  status: Estado;
  updated_at: string;
};

const ESTADOS: Record<Estado, string> = {
  draft: "Borrador",
  published: "Publicada",
  hidden: "Oculta",
  archived: "Archivada"
};

function filtro(valor: string | string[] | undefined): string {
  return typeof valor === "string" ? valor.slice(0, 120) : "";
}

export default async function CatalogoAdminPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requerirAdmin();
  const parametros = await searchParams;
  const q = filtro(parametros.q).trim().toLocaleLowerCase("es-AR");
  const estado = filtro(parametros.estado);
  const estadoValido = estado === "" || Object.hasOwn(ESTADOS, estado);

  // Solo datos de catalog_products: el inventario se consulta por separado.
  const consulta = await supabase
    .from("catalog_products")
    .select("slug,house,fragrance_name,gender,universe,status,updated_at")
    .order("house", { ascending: true })
    .order("fragrance_name", { ascending: true })
    .limit(1000);

  if (consulta.error) {
    return (
      <div className="space-y-6">
        <Titulo eyebrow="NOX Admin · Catálogo V2">Fragancias</Titulo>
        <Aviso tono="error">No se pudo leer el catálogo editable. Verificá que la migración V2 esté habilitada en el entorno de pruebas.</Aviso>
      </div>
    );
  }

  const filas = (consulta.data ?? []) as Fila[];
  const visibles = filas.filter(f => {
    const coincideEstado = estadoValido && (!estado || f.status === estado);
    const texto = `${f.house} ${f.fragrance_name} ${f.slug}`.toLocaleLowerCase("es-AR");
    return coincideEstado && (!q || texto.includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Titulo eyebrow="NOX Admin · Catálogo V2" descripcion="Administrá las fichas y su visibilidad. El stock propio se gestiona exclusivamente desde Inventario.">
          Fragancias
        </Titulo>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/catalogo/vista-previa" className="rounded-full border border-edge px-5 py-2.5 text-sm text-bone">Comparar con tienda actual</Link>
          <Link href="/admin/catalogo/nueva" className={claseBoton}>Nueva fragancia</Link>
        </div>
      </div>
      <form method="get" className="grid gap-3 sm:grid-cols-[1fr_190px_auto]" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar marca, nombre o identificador" aria-label="Buscar fragancias" className={claseCampo} />
        <select name="estado" defaultValue={estadoValido ? estado : ""} aria-label="Estado de publicación" className={claseCampo}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
        </select>
        <button type="submit" className="rounded-full border border-edge px-5 py-2 text-sm text-bone">Filtrar</button>
      </form>
      <p className="text-sm text-mist">{visibles.length} fragancia{visibles.length === 1 ? "" : "s"} encontradas</p>
      {filas.length === 0 ? (
        <Aviso>El catálogo editable todavía no tiene fragancias cargadas. No se debe importar automáticamente el catálogo público sin verificar la paridad de los 233 productos.</Aviso>
      ) : visibles.length === 0 ? (
        <Aviso>No hay fragancias que coincidan con esos filtros.</Aviso>
      ) : (
        <TablaContenedor>
          <table className={claseTabla}>
            <thead><tr>
              <th className={claseTh}>Fragancia</th>
              <th className={claseTh}>Categoría</th>
              <th className={claseTh}>Estado</th>
              <th className={claseTh}>Actualización</th>
              <th className={claseTh}>Acción</th>
            </tr></thead>
            <tbody>{visibles.map(f => (
              <tr key={f.slug}>
                <td className={claseTd}><strong className="font-medium text-bone">{f.house} · {f.fragrance_name}</strong><p className="mt-1 font-mono text-xs text-mist">{f.slug}</p></td>
                <td className={claseTd}>{f.universe} · {f.gender}</td>
                <td className={claseTd}>{ESTADOS[f.status] ?? "Desconocido"}</td>
                <td className={claseTd}>{fecha(f.updated_at)}</td>
                <td className={claseTd}><Link href={`/admin/catalogo/${encodeURIComponent(f.slug)}`} className="text-bone underline underline-offset-4">Ver ficha</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </TablaContenedor>
      )}
    </div>
  );
}
