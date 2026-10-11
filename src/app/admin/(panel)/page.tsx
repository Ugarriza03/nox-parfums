import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import { leerInventario, leerMovimientos } from "@/lib/admin/datos";
import { productoAdmin } from "@/lib/admin/catalogo";
import { Aviso, ChipTipo, Indicador, TablaContenedor, Titulo, claseTabla, claseTd, claseTh, fecha } from "@/components/admin/ui";

export const metadata = { title: "Resumen" };

export default async function ResumenPage() {
  const { supabase } = await requerirAdmin();

  let datos: Awaited<ReturnType<typeof leerInventario>>;
  let recientes: Awaited<ReturnType<typeof leerMovimientos>>;
  try {
    [datos, recientes] = await Promise.all([leerInventario(supabase), leerMovimientos(supabase, { limite: 8 })]);
  } catch (e) {
    return <Aviso tono="error">{e instanceof Error ? e.message : "No se pudieron leer los datos."}</Aviso>;
  }

  const { filas, umbral } = datos;
  const registrados = filas.filter((f) => f.stock !== null);
  const unidades = registrados.reduce((total, f) => total + (f.stock ?? 0), 0);
  const sinStock = filas.filter((f) => f.estado === "sin_stock").length;
  const stockBajo = filas.filter((f) => f.estado === "stock_bajo").length;
  const sinRegistro = filas.length - registrados.length;

  return (
    <div className="space-y-8">
      <Titulo
        eyebrow="Resumen"
        descripcion="Stock propio de NOX. No es la disponibilidad comercial: una fragancia sin stock propio puede seguir publicada y pedirse."
      >
        Inventario propio
      </Titulo>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Indicador etiqueta="Fragancias en el catálogo" valor={filas.length} />
        <Indicador etiqueta="Con inventario inicial registrado" valor={registrados.length} nota={`${sinRegistro} todavía sin registrar`} />
        <Indicador etiqueta="Unidades propias registradas" valor={unidades} nota="Suma de las fragancias con inventario registrado" />
        <Indicador etiqueta="Sin stock propio" valor={sinStock} nota="Cero confirmado por un registro" />
        <Indicador etiqueta="Stock bajo" valor={stockBajo} nota={`Hasta ${umbral} unidad${umbral === 1 ? "" : "es"}`} />
      </div>

      {sinRegistro === filas.length ? (
        <Aviso>
          Todavía no hay inventario registrado. Cargalo producto por producto desde{" "}
          <Link href="/admin/inventario" className="underline underline-offset-4">Inventario</Link> con la cantidad
          realmente contada.
        </Aviso>
      ) : null}

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[15px] text-bone">Movimientos recientes</h2>
          <Link href="/admin/actividad" className="text-[13px] text-mist hover:text-bone">Ver historial</Link>
        </div>
        {recientes.length === 0 ? (
          <p className="text-[13px] text-mist">Sin movimientos registrados.</p>
        ) : (
          <TablaContenedor>
            <table className={claseTabla}>
              <thead>
                <tr>
                  <th className={claseTh}>Fecha</th>
                  <th className={claseTh}>Fragancia</th>
                  <th className={claseTh}>Tipo</th>
                  <th className={claseTh}>Stock</th>
                  <th className={claseTh}>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((m) => {
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
                      <td className={claseTd}>{m.stock_before} → {m.stock_after}</td>
                      <td className={claseTd}>{m.admin_users?.display_name ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TablaContenedor>
        )}
      </section>
    </div>
  );
}
