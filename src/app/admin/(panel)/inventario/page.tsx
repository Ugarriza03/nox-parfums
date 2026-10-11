import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import { leerInventario } from "@/lib/admin/datos";
import { filtrarInventario, leerFiltrosInventario } from "@/lib/admin/filtros";
import { ETIQUETA_ESTADO, type EstadoStock } from "@/lib/admin/inventario-reglas";
import { Aviso, ChipEstado, TablaContenedor, Titulo, claseBotonSecundario, claseCampo, claseTabla, claseTd, claseTh, fecha } from "@/components/admin/ui";

export const metadata = { title: "Inventario" };

const ESTADOS: EstadoStock[] = ["sin_registro", "sin_stock", "stock_bajo", "con_stock"];

export default async function InventarioPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requerirAdmin();
  const filtros = leerFiltrosInventario(await searchParams);

  let datos: Awaited<ReturnType<typeof leerInventario>>;
  try {
    datos = await leerInventario(supabase);
  } catch (e) {
    return <Aviso tono="error">{e instanceof Error ? e.message : "No se pudo leer el inventario."}</Aviso>;
  }
  const filas = filtrarInventario(datos.filas, filtros);

  return (
    <div>
      <Titulo eyebrow="Inventario" descripcion={`Stock propio por fragancia. Stock bajo: hasta ${datos.umbral} unidad${datos.umbral === 1 ? "" : "es"}.`}>
        Fragancias
      </Titulo>

      <form method="get" className="mb-6 grid gap-3 md:grid-cols-[1fr_180px_160px_160px_auto]" role="search">
        <input name="q" defaultValue={filtros.q} placeholder="Buscar por fragancia, marca o identificador" aria-label="Buscar" className={claseCampo} />
        <select name="estado" defaultValue={filtros.estado ?? ""} aria-label="Estado" className={claseCampo}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>
          ))}
        </select>
        <select name="genero" defaultValue={filtros.genero ?? ""} aria-label="Género" className={claseCampo}>
          <option value="">Todos los géneros</option>
          <option value="femenino">Femenino</option>
          <option value="masculino">Masculino</option>
          <option value="unisex">Unisex</option>
        </select>
        <select name="categoria" defaultValue={filtros.categoria ?? ""} aria-label="Categoría" className={claseCampo}>
          <option value="">Todas las categorías</option>
          <option value="disenador">Diseñador</option>
          <option value="nicho">Nicho</option>
          <option value="arabe">Árabes</option>
        </select>
        <button type="submit" className={claseBotonSecundario}>Filtrar</button>
      </form>

      <p className="mb-3 text-[12px] text-mist">
        {filas.length} de {datos.filas.length} fragancias
      </p>

      <TablaContenedor>
        <table className={claseTabla}>
          <thead>
            <tr>
              <th className={claseTh}>Fragancia</th>
              <th className={claseTh}>Marca</th>
              <th className={claseTh}>Género</th>
              <th className={claseTh}>Categoría</th>
              <th className={`${claseTh} text-right`}>Stock propio</th>
              <th className={claseTh}>Estado</th>
              <th className={claseTh}>Última modificación</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.slug} className="hover:bg-graphite/40">
                <td className={claseTd}>
                  <Link href={`/admin/inventario/${f.slug}`} className="text-bone hover:underline">{f.nombre}</Link>
                </td>
                <td className={claseTd}>{f.marca}</td>
                <td className={claseTd}>{f.generoEtiqueta}</td>
                <td className={claseTd}>{f.categoriaEtiqueta}</td>
                <td className={`${claseTd} text-right tabular-nums text-bone`}>{f.stock === null ? "—" : f.stock}</td>
                <td className={claseTd}><ChipEstado estado={f.estado} /></td>
                <td className={claseTd}>{fecha(f.actualizado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TablaContenedor>
    </div>
  );
}
