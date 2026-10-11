/**
 * Sustituto de "@/app/admin/acciones" SÓLO para la prueba del formulario
 * (scripts/admin/test-formulario-movimiento.mjs). Nunca entra en el build.
 *
 * Simula registrar_movimiento con las mismas reglas que la función SQL:
 * carga inicial única por producto, idempotencia por request_id, egreso sin
 * stock negativo y ajuste = stock contado. Después de confirmar, avisa a la
 * página de prueba para que se vuelva a renderizar, como hace revalidatePath.
 */

import { validarMovimiento, ETIQUETA_TIPO, type TipoMovimiento } from "@/lib/admin/inventario-reglas";

export interface EstadoFormulario {
  ok: boolean;
  mensaje: string | null;
  errores?: Record<string, string>;
}

export interface MovimientoSimulado {
  requestId: string;
  slug: string;
  tipo: TipoMovimiento;
  cantidad: number;
  antes: number;
  despues: number;
}

export const db = {
  stock: new Map<string, number>(),
  movimientos: [] as MovimientoSimulado[],
  envios: 0
};

const suscriptores = new Set<() => void>();
export function suscribir(fn: () => void): () => void {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
}

declare global {
  interface Window {
    __retrasarRefresco?: boolean;
    __refrescar?: () => void;
    __db?: typeof db;
  }
}

function refrescar() {
  for (const fn of suscriptores) fn();
}
if (typeof window !== "undefined") {
  window.__refrescar = refrescar;
  window.__db = db;
}

function registrar(d: { requestId: string; productSlug: string; tipo: TipoMovimiento; cantidad: number }): MovimientoSimulado {
  const previo = db.movimientos.find((m) => m.requestId === d.requestId);
  if (previo) {
    if (previo.slug === d.productSlug && previo.tipo === d.tipo && previo.cantidad === d.cantidad) return previo;
    throw new Error("request_id ya utilizado con otros datos.");
  }
  const actual = db.stock.get(d.productSlug);
  let antes = 0;
  let despues: number;
  if (d.tipo === "carga_inicial") {
    if (actual !== undefined) throw new Error("Este producto ya tiene inventario inicial registrado.");
    despues = d.cantidad;
  } else {
    if (actual === undefined) throw new Error("Primero registrá el inventario inicial de esta fragancia.");
    antes = actual;
    if (d.tipo === "ingreso") despues = antes + d.cantidad;
    else if (d.tipo === "egreso") {
      if (d.cantidad > antes) throw new Error("No hay stock propio suficiente para ese egreso.");
      despues = antes - d.cantidad;
    } else despues = d.cantidad;
  }
  const m: MovimientoSimulado = { requestId: d.requestId, slug: d.productSlug, tipo: d.tipo, cantidad: d.cantidad, antes, despues };
  db.stock.set(d.productSlug, despues);
  db.movimientos.push(m);
  return m;
}

export async function registrarMovimiento(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  db.envios++;
  await new Promise((r) => setTimeout(r, 120)); // latencia de red
  const v = validarMovimiento(
    {
      requestId: formData.get("requestId"),
      productSlug: formData.get("productSlug"),
      tipo: formData.get("tipo"),
      cantidad: formData.get("cantidad"),
      motivo: formData.get("motivo")
    },
    new Set(["ariana-grande-cloud", "afnan-9pm"])
  );
  if (!v.ok) return { ok: false, mensaje: "Revisá los datos del movimiento.", errores: v.errores as Record<string, string> };
  let m: MovimientoSimulado;
  try {
    m = registrar(v.datos);
  } catch (e) {
    return { ok: false, mensaje: (e as Error).message };
  }
  if (!window.__retrasarRefresco) refrescar();
  return { ok: true, mensaje: `${ETIQUETA_TIPO[m.tipo]} registrado. Stock propio: ${m.antes} → ${m.despues}.` };
}
