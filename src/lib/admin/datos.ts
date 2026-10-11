/**
 * CONSULTAS DE INVENTARIO — sólo servidor.
 *
 * Se ejecutan con la sesión del administrador: la base aplica RLS y sólo
 * devuelve datos a administradores activos. Las escrituras pasan
 * exclusivamente por la función registrar_movimiento().
 */

import type { ClienteAdmin } from "./supabase";
import {
  estadoStock,
  UMBRAL_STOCK_BAJO_POR_DEFECTO,
  type EstadoStock,
  type MovimientoValido,
  type TipoMovimiento
} from "./inventario-reglas";
import { PRODUCTOS_ADMIN, type ProductoAdmin } from "./catalogo";

export interface ItemInventario {
  product_slug: string;
  stock: number;
  initialized_at: string;
  updated_at: string;
  updated_by: string;
}

export interface Movimiento {
  id: number;
  request_id: string;
  product_slug: string;
  movement_type: TipoMovimiento;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reason: string | null;
  created_at: string;
  created_by: string;
  admin_users?: { display_name: string } | null;
}

export interface FilaInventario extends ProductoAdmin {
  stock: number | null;
  estado: EstadoStock;
  actualizado: string | null;
}

export class ErrorDatos extends Error {}

export async function leerUmbral(supabase: ClienteAdmin): Promise<number> {
  const { data, error } = await supabase.from("inventory_settings").select("low_stock_threshold").maybeSingle();
  if (error) throw new ErrorDatos("No se pudo leer la configuración del inventario.");
  return typeof data?.low_stock_threshold === "number" ? data.low_stock_threshold : UMBRAL_STOCK_BAJO_POR_DEFECTO;
}

export async function leerInventario(supabase: ClienteAdmin): Promise<{ filas: FilaInventario[]; umbral: number }> {
  const [umbral, respuesta] = await Promise.all([
    leerUmbral(supabase),
    supabase.from("inventory_items").select("product_slug, stock, initialized_at, updated_at, updated_by")
  ]);
  if (respuesta.error) throw new ErrorDatos("No se pudo leer el inventario.");
  const items = new Map((respuesta.data as ItemInventario[]).map((i) => [i.product_slug, i]));

  const filas = PRODUCTOS_ADMIN.map((p) => {
    const item = items.get(p.slug);
    const stock = item ? item.stock : null;
    return { ...p, stock, estado: estadoStock(stock, umbral), actualizado: item?.updated_at ?? null };
  });
  return { filas, umbral };
}

export interface FiltrosMovimientos {
  producto?: string;
  tipo?: TipoMovimiento;
  desde?: string; // YYYY-MM-DD (inclusive)
  hasta?: string; // YYYY-MM-DD (inclusive)
  antesDeId?: number;
  limite?: number;
}

export async function leerMovimientos(
  supabase: ClienteAdmin,
  filtros: FiltrosMovimientos = {}
): Promise<Movimiento[]> {
  const limite = Math.min(Math.max(filtros.limite ?? 50, 1), 200);
  let consulta = supabase
    .from("inventory_movements")
    .select(
      "id, request_id, product_slug, movement_type, quantity, stock_before, stock_after, reason, created_at, created_by, admin_users(display_name)"
    )
    .order("id", { ascending: false })
    .limit(limite);

  if (filtros.producto) consulta = consulta.eq("product_slug", filtros.producto);
  if (filtros.tipo) consulta = consulta.eq("movement_type", filtros.tipo);
  if (filtros.desde) consulta = consulta.gte("created_at", `${filtros.desde}T00:00:00-03:00`);
  if (filtros.hasta) consulta = consulta.lte("created_at", `${filtros.hasta}T23:59:59.999-03:00`);
  if (filtros.antesDeId) consulta = consulta.lt("id", filtros.antesDeId);

  const { data, error } = await consulta;
  if (error) throw new ErrorDatos("No se pudo leer el historial de movimientos.");
  return data as unknown as Movimiento[];
}

export async function registrarMovimientoDB(
  supabase: ClienteAdmin,
  m: MovimientoValido
): Promise<{ ok: true; movimiento: Movimiento } | { ok: false; error: { code?: string; message?: string } }> {
  const { data, error } = await supabase.rpc("registrar_movimiento", {
    p_request_id: m.requestId,
    p_product_slug: m.productSlug,
    p_tipo: m.tipo,
    p_cantidad: m.cantidad,
    p_motivo: m.motivo
  });
  if (error) return { ok: false, error: { code: error.code, message: error.message } };
  return { ok: true, movimiento: data as Movimiento };
}
