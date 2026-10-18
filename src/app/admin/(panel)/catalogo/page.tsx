import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import {
  Aviso, ChipEstadoCatalogo, ChipRevision, TablaContenedor, Titulo, claseBoton, claseBotonSecundario,
  claseCampo, claseTabla, claseTd, claseTh, fecha
} from "@/components/admin/ui";
import {
  CATEGORIAS_CATALOGO, ESTADOS_CATALOGO, ETIQUETA_CATEGORIA, ETIQUETA_ESTADO_CATALOGO, ETIQUETA_GENERO,
  GENEROS_CATALOGO, filtrarCatalogo, leerFiltrosCatalogo, urlFiltros,
  type CategoriaCatalogo, type FilaListadoCatalogo, type GeneroCatalogo
} from "@/lib/admin/catalogo-v2";

export const metadata = { title: "Catálogo" };

export default async function CatalogoAdminPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requerirAdmin();
  const filtros = leerFiltrosCatalogo(await searchParams);

  // Sólo catálogo: el inventario se consulta por separado, en su sección.
  const [consulta, revisiones] = await Promise.all([
    supabase
      .from("catalog_products")
      .select("slug,house,fragrance_name,gender,universe,status,updated_at")
      .order("house", { ascending: true })
      .order("fragrance_name", { ascending: true })
      .limit(2000),
    supabase.from("catalog_revisions").select("product_slug").limit(2000)
  ]);

  const encabezado = (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <Titulo eyebrow="Catálogo V2" descripcion="Qué fragancias existen y cómo se presentan. Las cantidades se gestionan en Inventario.">
        Fragancias
      </Titulo>
      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/admin/catalogo/vista-previa" className={claseBotonSecundario}>Comparar con la tienda</Link>
        <Link href="/admin/catalogo/nueva" className={claseBoton}>Nueva fragancia</Link>
      </div>
    </div>
  );

  if (consulta.error) {
    return (
      <div>
        {encabezado}
        <Aviso tono="error">No se pudo leer el catálogo V2. Verificá que las migraciones estén aplicadas en este entorno.</Aviso>
      </div>
    );
  }

  const todas = (consulta.data ?? []) as FilaListadoCatalogo[];
  const conRevision = new Set((revisiones.data ?? []).map((r) => r.product_slug as string));
  const { filas, total, pagina, paginas } = filtrarCatalogo(todas, filtros, conRevision);
  const conteo = Object.fromEntries(ESTADOS_CATALOGO.map((e) => [e, todas.filter((f) => f.status === e).length]));
  const hayFiltros = Boolean(filtros.q || filtros.estado || filtros.genero || filtros.categoria || filtros.revision);

  return (
    <div className="space-y-6">
      {encabezado}

      <nav aria-label="Filtrar por estado" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {[{ clave: undefined, etiqueta: "Todas", n: todas.length }, ...ESTADOS_CATALOGO.map((e) => ({ clave: e, etiqueta: ETIQUETA_ESTADO_CATALOGO[e], n: conteo[e] }))].map((t) => {
          const activa = filtros.estado === t.clave && !filtros.revision;
          return (
            <Link
              key={t.etiqueta}
              href={`/admin/catalogo${urlFiltros(filtros, { estado: t.clave, revision: false, pagina: 1 })}`}
              aria-current={activa ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors ${activa ? "bg-graphite text-bone" : "text-mist hover:text-bone"}`}
            >
              {t.etiqueta} <span className="text-mist">{t.n}</span>
            </Link>
          );
        })}
        <Link
          href={`/admin/catalogo${urlFiltros(filtros, { revision: !filtros.revision, pagina: 1 })}`}
          aria-current={filtros.revision ? "page" : undefined}
          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors ${filtros.revision ? "bg-graphite text-bone" : "text-mist hover:text-bone"}`}
        >
          Con revisión pendiente <span className="text-mist">{conRevision.size}</span>
        </Link>
      </nav>

      <form method="get" role="search" aria-label="Buscar en el catálogo" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_170px_170px_auto]">
        {filtros.estado ? <input type="hidden" name="estado" value={filtros.estado} /> : null}
        {filtros.revision ? <input type="hidden" name="revision" value="1" /> : null}
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Buscar</span>
          <input name="q" defaultValue={filtros.q} placeholder="Buscar por marca, fragancia o identificador" className={claseCampo} type="search" />
        </label>
        <label>
          <span className="sr-only">Género</span>
          <select name="genero" defaultValue={filtros.genero ?? ""} className={claseCampo}>
            <option value="">Todos los géneros</option>
            {GENEROS_CATALOGO.map((g) => <option key={g} value={g}>{ETIQUETA_GENERO[g]}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Categoría</span>
          <select name="categoria" defaultValue={filtros.categoria ?? ""} className={claseCampo}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS_CATALOGO.map((c) => <option key={c} value={c}>{ETIQUETA_CATEGORIA[c]}</option>)}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className={claseBotonSecundario}>Filtrar</button>
          {hayFiltros ? <Link href="/admin/catalogo" className="self-center px-2 text-[13px] text-mist hover:text-bone">Limpiar</Link> : null}
        </div>
      </form>

      <p className="text-[13px] text-mist" aria-live="polite">
        {total} fragancia{total === 1 ? "" : "s"}{hayFiltros ? " con estos filtros" : ""}
        {paginas > 1 ? ` · página ${pagina} de ${paginas}` : ""}
      </p>

      {todas.length === 0 ? (
        <Aviso>El catálogo V2 de este entorno está vacío. No se importa automáticamente: la carga de las 233 fragancias requiere verificar la paridad.</Aviso>
      ) : filas.length === 0 ? (
        <Aviso>No hay fragancias que coincidan con estos filtros.</Aviso>
      ) : (
        <TablaContenedor>
          <table className={claseTabla}>
            <caption className="sr-only">Fragancias del catálogo V2</caption>
            <thead>
              <tr>
                <th scope="col" className={claseTh}>Marca</th>
                <th scope="col" className={claseTh}>Fragancia</th>
                <th scope="col" className={claseTh}>Género</th>
                <th scope="col" className={claseTh}>Categoría</th>
                <th scope="col" className={claseTh}>Estado</th>
                <th scope="col" className={claseTh}>Actualización</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.slug} className="transition-colors hover:bg-graphite/25">
                  <td className={claseTd}>{f.house}</td>
                  <td className={claseTd}>
                    <Link href={`/admin/catalogo/${encodeURIComponent(f.slug)}`} className="font-medium text-bone underline-offset-4 hover:underline focus-visible:underline">
                      {f.fragrance_name}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] text-mist">{f.slug}</p>
                  </td>
                  <td className={claseTd}>{ETIQUETA_GENERO[f.gender as GeneroCatalogo] ?? f.gender}</td>
                  <td className={claseTd}>{ETIQUETA_CATEGORIA[f.universe as CategoriaCatalogo] ?? f.universe}</td>
                  <td className={claseTd}>
                    <div className="flex flex-wrap gap-1.5">
                      <ChipEstadoCatalogo estado={f.status} />
                      {conRevision.has(f.slug) ? <ChipRevision /> : null}
                    </div>
                  </td>
                  <td className={`${claseTd} whitespace-nowrap`}>{fecha(f.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablaContenedor>
      )}

      {paginas > 1 ? (
        <nav aria-label="Paginación" className="flex items-center justify-between gap-3">
          {pagina > 1 ? (
            <Link href={`/admin/catalogo${urlFiltros(filtros, { pagina: pagina - 1 })}`} className={claseBotonSecundario} rel="prev">Anterior</Link>
          ) : <span />}
          <span className="text-[13px] text-mist">Página {pagina} de {paginas}</span>
          {pagina < paginas ? (
            <Link href={`/admin/catalogo${urlFiltros(filtros, { pagina: pagina + 1 })}`} className={claseBotonSecundario} rel="next">Siguiente</Link>
          ) : <span />}
        </nav>
      ) : null}
    </div>
  );
}
