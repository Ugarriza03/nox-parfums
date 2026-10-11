import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import { leerMovimientos } from "@/lib/admin/datos";
import { PRODUCTOS_ADMIN, SLUGS_VALIDOS, productoAdmin } from "@/lib/admin/catalogo";
import { leerFiltrosActividad } from "@/lib/admin/filtros";
import { ETIQUETA_TIPO, TIPOS_MOVIMIENTO } from "@/lib/admin/inventario-reglas";
import { Aviso, ChipTipo, TablaContenedor, Titulo, claseBotonSecundario, claseCampo, claseTabla, claseTd, claseTh, fecha } from "@/components/admin/ui";

export const metadata = { title: "Actividad" };

const POR_PAGINA = 50;

export default async function ActividadPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requerirAdmin();
  const filtros = leerFiltrosActividad(await searchParams, SLUGS_VALIDOS);

  let movimientos: Awaited<ReturnType<typeof leerMovimientos>>;
  try {
    movimientos = await leerMovimientos(supabase, { ...filtros, limite: POR_PAGINA });
  } catch (e) {
    return <Aviso tono="error">{e instanceof Error ? e.message : "No se pudo leer el historial."}</Aviso>;
  }

  const siguiente = movimientos.length === POR_PAGINA ? movimientos[movimientos.length - 1].id : null;
  const base = new URLSearchParams();
  if (filtros.producto) base.set("producto", filtros.producto);
  if (filtros.tipo) base.set("tipo", filtros.tipo);
  if (filtros.desde) base.set("desde", filtros.desde);
  if (filtros.hasta) base.set("hasta", filtros.hasta);

  return (
    <div>
      <Titulo eyebrow="Actividad" descripcion="Historial de movimientos de stock propio. Los registros no se pueden editar ni eliminar.">
        Historial
      </Titulo>

      <form method="get" className="mb-6 grid gap-3 md:grid-cols-[1fr_180px_160px_160px_auto]">
        <select name="producto" defaultValue={filtros.producto ?? ""} aria-label="Fragancia" className={claseCampo}>
          <option value="">Todas las fragancias</option>
          {PRODUCTOS_ADMIN.map((p) => (
            <option key={p.slug} value={p.slug}>{p.marca} {p.nombre} ({p.generoEtiqueta})</option>
          ))}
        </select>
        <select name="tipo" defaultValue={filtros.tipo ?? ""} aria-label="Tipo" className={claseCampo}>
          <option value="">Todos los tipos</option>
          {TIPOS_MOVIMIENTO.map((t) => (
            <option key={t} value={t}>{ETIQUETA_TIPO[t]}</option>
          ))}
        </select>
        <input type="date" name="desde" defaultValue={filtros.desde ?? ""} aria-label="Desde" className={claseCampo} />
        <input type="date" name="hasta" defaultValue={filtros.hasta ?? ""} aria-label="Hasta" className={claseCampo} />
        <button type="submit" className={claseBotonSecundario}>Filtrar</button>
      </form>

      {movimientos.length === 0 ? (
        <p className="text-[13px] text-mist">No hay movimientos con estos filtros.</p>
      ) : (
        <TablaContenedor>
          <table className={claseTabla}>
            <thead>
              <tr>
                <th className={claseTh}>Fecha</th>
                <th className={claseTh}>Fragancia</th>
                <th className={claseTh}>Tipo</th>
                <th className={`${claseTh} text-right`}>Cantidad</th>
                <th className={claseTh}>Stock</th>
                <th className={claseTh}>Responsable</th>
                <th className={claseTh}>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => {
                const p = productoAdmin(m.product_slug);
                return (
                  <tr key={m.id}>
                    <td className={claseTd}>{fecha(m.created_at)}</td>
                    <td className={claseTd}>
                      <Link href={`/admin/inventario/${m.product_slug}`} className="text-bone hover:underline">
                        {p ? `${p.marca} ${p.nombre}` : m.product_slug}
                      </Link>
                    </td>
                    <td className={claseTd}><ChipTipo tipo={m.movement_type} /></td>
                    <td className={`${claseTd} text-right tabular-nums`}>{m.quantity}</td>
                    <td className={claseTd}>{m.stock_before} → {m.stock_after}</td>
                    <td className={claseTd}>{m.admin_users?.display_name ?? "—"}</td>
                    <td className={claseTd}>{m.reason ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TablaContenedor>
      )}

      {siguiente ? (
        <div className="mt-4">
          <Link
            href={`/admin/actividad?${new URLSearchParams({ ...Object.fromEntries(base), antes: String(siguiente) })}`}
            className={claseBotonSecundario}
          >
            Movimientos anteriores
          </Link>
        </div>
      ) : null}
    </div>
  );
}
