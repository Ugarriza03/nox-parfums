import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/admin/sesion";
import { leerMovimientos, leerUmbral, ErrorDatos, type ItemInventario } from "@/lib/admin/datos";
import { productoAdmin } from "@/lib/admin/catalogo";
import { estadoStock } from "@/lib/admin/inventario-reglas";
import { FormularioMovimiento } from "@/components/admin/FormularioMovimiento";
import { Aviso, ChipEstado, ChipTipo, TablaContenedor, Tarjeta, Titulo, claseTabla, claseTd, claseTh, fecha } from "@/components/admin/ui";

export const metadata = { title: "Detalle de stock" };

export default async function DetalleStockPage({ params }: { params: Promise<{ slug: string }> }) {
  // Primero la autorización: a un visitante no se le responde nada del panel.
  const { supabase } = await requerirAdmin();
  const { slug } = await params;
  const producto = productoAdmin(slug);
  if (!producto) notFound();

  let item: ItemInventario | null;
  let umbral: number;
  let movimientos: Awaited<ReturnType<typeof leerMovimientos>>;
  try {
    const consulta = await supabase
      .from("inventory_items")
      .select("product_slug, stock, initialized_at, updated_at, updated_by")
      .eq("product_slug", slug)
      .maybeSingle();
    if (consulta.error) throw new ErrorDatos("No se pudo leer el stock de esta fragancia.");
    item = consulta.data as ItemInventario | null;
    [umbral, movimientos] = await Promise.all([leerUmbral(supabase), leerMovimientos(supabase, { producto: slug, limite: 50 })]);
  } catch (e) {
    return <Aviso tono="error">{e instanceof Error ? e.message : "No se pudieron leer los datos."}</Aviso>;
  }

  const stock = item ? item.stock : null;
  const estado = estadoStock(stock, umbral);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/inventario" className="text-[13px] text-mist hover:text-bone">← Inventario</Link>
      </div>
      <Titulo eyebrow={`${producto.marca} · ${producto.generoEtiqueta} · ${producto.categoriaEtiqueta}`}>
        {producto.nombre}
      </Titulo>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <Tarjeta>
          <p className="text-[12px] text-mist">Stock propio</p>
          <p className="mt-2 font-display text-[44px] leading-none text-bone">{stock === null ? "—" : stock}</p>
          <div className="mt-3"><ChipEstado estado={estado} /></div>
          <dl className="mt-5 space-y-2 text-[12px] text-mist">
            <div className="flex justify-between gap-3"><dt>Identificador</dt><dd className="font-mono text-haze">{slug}</dd></div>
            <div className="flex justify-between gap-3"><dt>Inventario inicial</dt><dd className="text-haze">{item ? fecha(item.initialized_at) : "Sin registrar"}</dd></div>
            <div className="flex justify-between gap-3"><dt>Última modificación</dt><dd className="text-haze">{item ? fecha(item.updated_at) : "—"}</dd></div>
          </dl>
        </Tarjeta>

        <Tarjeta>
          <h2 className="mb-4 text-[15px] text-bone">{item ? "Registrar movimiento" : "Registrar inventario inicial"}</h2>
          {item ? (
            <FormularioMovimiento slug={slug} tipos={["ingreso", "egreso", "ajuste"]} stockActual={stock} />
          ) : (
            <FormularioMovimiento slug={slug} tipos={["carga_inicial"]} stockActual={null} />
          )}
        </Tarjeta>
      </div>

      <section>
        <h2 className="mb-3 text-[15px] text-bone">Historial de esta fragancia</h2>
        {movimientos.length === 0 ? (
          <p className="text-[13px] text-mist">Sin movimientos.</p>
        ) : (
          <TablaContenedor>
            <table className={claseTabla}>
              <thead>
                <tr>
                  <th className={claseTh}>Fecha</th>
                  <th className={claseTh}>Tipo</th>
                  <th className={`${claseTh} text-right`}>Cantidad</th>
                  <th className={claseTh}>Stock</th>
                  <th className={claseTh}>Responsable</th>
                  <th className={claseTh}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.id}>
                    <td className={claseTd}>{fecha(m.created_at)}</td>
                    <td className={claseTd}><ChipTipo tipo={m.movement_type} /></td>
                    <td className={`${claseTd} text-right tabular-nums`}>{m.quantity}</td>
                    <td className={claseTd}>{m.stock_before} → {m.stock_after}</td>
                    <td className={claseTd}>{m.admin_users?.display_name ?? "—"}</td>
                    <td className={claseTd}>{m.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaContenedor>
        )}
      </section>
    </div>
  );
}
