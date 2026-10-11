/**
 * REGLAS DEL INVENTARIO — lógica pura y compartida.
 *
 * Validación de los formularios (el servidor de la app valida antes de
 * llamar a la base; la base vuelve a validar en registrar_movimiento()),
 * estado de stock y traducción de errores de la base a mensajes claros.
 */

export const TIPOS_MOVIMIENTO = ["carga_inicial", "ingreso", "egreso", "ajuste"] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];

export const ETIQUETA_TIPO: Record<TipoMovimiento, string> = {
  carga_inicial: "Carga inicial",
  ingreso: "Ingreso",
  egreso: "Egreso",
  ajuste: "Ajuste por recuento"
};

export const CANTIDAD_MAXIMA = 100000;
export const MOTIVO_MAXIMO = 500;
export const UMBRAL_STOCK_BAJO_POR_DEFECTO = 1;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface MovimientoValido {
  requestId: string;
  productSlug: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string | null;
}

export type ResultadoValidacion =
  | { ok: true; datos: MovimientoValido }
  | { ok: false; errores: Partial<Record<"requestId" | "productSlug" | "tipo" | "cantidad" | "motivo", string>> };

/**
 * Valida un movimiento recibido del formulario.
 * `slugsValidos` es el registro de identificadores estables: un slug que no
 * está ahí no es un producto del catálogo y se rechaza.
 */
export function validarMovimiento(
  entrada: Record<string, unknown>,
  slugsValidos: ReadonlySet<string>
): ResultadoValidacion {
  const errores: Extract<ResultadoValidacion, { ok: false }>["errores"] = {};
  const texto = (v: unknown) => (typeof v === "string" ? v : "");

  const requestId = texto(entrada.requestId).trim();
  if (!UUID.test(requestId)) errores.requestId = "Solicitud inválida. Recargá la página.";

  const productSlug = texto(entrada.productSlug).trim();
  if (!slugsValidos.has(productSlug)) errores.productSlug = "El producto no existe en el catálogo.";

  const tipo = texto(entrada.tipo) as TipoMovimiento;
  if (!TIPOS_MOVIMIENTO.includes(tipo)) errores.tipo = "Tipo de movimiento inválido.";

  const cantidadTexto = texto(entrada.cantidad).trim();
  let cantidad = Number.NaN;
  if (!/^\d{1,6}$/.test(cantidadTexto)) {
    errores.cantidad = "Ingresá un número entero sin signo.";
  } else {
    cantidad = Number(cantidadTexto);
    if (cantidad > CANTIDAD_MAXIMA) errores.cantidad = `La cantidad máxima es ${CANTIDAD_MAXIMA}.`;
    else if ((tipo === "ingreso" || tipo === "egreso") && cantidad === 0) {
      errores.cantidad = "La cantidad debe ser mayor a cero.";
    }
  }

  const motivoLimpio = texto(entrada.motivo).trim();
  const motivo = motivoLimpio === "" ? null : motivoLimpio;
  if (motivo && motivo.length > MOTIVO_MAXIMO) {
    errores.motivo = `El motivo admite hasta ${MOTIVO_MAXIMO} caracteres.`;
  } else if ((tipo === "ajuste" || tipo === "carga_inicial") && (!motivo || motivo.length < 3)) {
    errores.motivo =
      tipo === "ajuste"
        ? "El ajuste requiere un motivo (por ejemplo: recuento físico)."
        : "La carga inicial requiere indicar de dónde sale la cantidad (por ejemplo: conteo físico del día).";
  }

  if (Object.keys(errores).length > 0) return { ok: false, errores };
  return { ok: true, datos: { requestId, productSlug, tipo, cantidad, motivo } };
}

/* ---------------------------------------------------------- estado de stock */

export type EstadoStock = "sin_registro" | "sin_stock" | "stock_bajo" | "con_stock";

export const ETIQUETA_ESTADO: Record<EstadoStock, string> = {
  sin_registro: "Sin inventario inicial",
  sin_stock: "Sin stock propio",
  stock_bajo: "Stock bajo",
  con_stock: "Con stock propio"
};

/**
 * Estado del STOCK PROPIO. No es disponibilidad comercial: una fragancia sin
 * stock propio puede seguir publicada y pedirse (depósito externo).
 *   · sin_registro: nunca se hizo la carga inicial (no hay dato).
 *   · sin_stock: carga hecha y stock confirmado en cero.
 */
export function estadoStock(stock: number | null, umbral: number): EstadoStock {
  if (stock === null) return "sin_registro";
  if (stock <= 0) return "sin_stock";
  if (stock <= umbral) return "stock_bajo";
  return "con_stock";
}

/* ------------------------------------------------- errores de la base */

const MENSAJES: Record<string, string> = {
  NX401: "No tenés autorización para registrar movimientos.",
  NX404: "Este producto todavía no tiene inventario inicial. Registrá primero la carga inicial.",
  NX409: "La operación entra en conflicto con un registro existente (por ejemplo, la carga inicial ya se hizo).",
  NX422: "Los datos del movimiento no son válidos.",
  NX423: "Stock insuficiente: el movimiento dejaría el stock por debajo de cero."
};

export function mensajeDeError(error: { code?: string | null; message?: string | null } | null): string {
  if (!error) return "Error desconocido.";
  if (error.code && MENSAJES[error.code]) {
    // Para NX422/NX423 la base trae un detalle útil y sin datos sensibles.
    return error.code === "NX423" || error.code === "NX422"
      ? `${MENSAJES[error.code]} ${error.message ?? ""}`.trim()
      : MENSAJES[error.code];
  }
  return "No se pudo completar la operación. Intentá de nuevo en unos segundos.";
}
