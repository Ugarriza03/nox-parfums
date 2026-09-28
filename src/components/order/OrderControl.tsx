"use client";

/**
 * CONTROL DE PEDIDO
 *
 * Un único componente para agregar, aumentar, disminuir y quitar una fragancia
 * desde cualquier lugar: card del catálogo, ficha de producto y resultados del
 * asesor. Lee y escribe SIEMPRE sobre el estado global del pedido
 * (`useOrder`), así que los tres lugares quedan sincronizados con Mi pedido
 * sin estados locales paralelos.
 *
 * Estados:
 *   cantidad 0  →  [ Agregar ]
 *   cantidad n  →  [ − ]  n  [ + ]     (− en 1 quita el producto)
 *
 * El alto del contenedor es fijo en cada variante para que el cambio de estado
 * no mueva el layout de la card.
 */

import { useOrder } from "@/store/order";
import type { Product } from "@/data/types";

type Variant = "card" | "row" | "detail";

const HEIGHT: Record<Variant, string> = {
  card: "h-10",
  row: "h-10",
  detail: "h-12"
};

/** Tamaño del texto del botón "Agregar". */
const TEXT: Record<Variant, string> = {
  card: "text-[11px]",
  row: "text-[11px]",
  detail: "text-[13px]"
};

/** Tamaño del número de cantidad: siempre un punto más grande y legible. */
const COUNT_TEXT: Record<Variant, string> = {
  card: "text-[13px]",
  row: "text-[13px]",
  detail: "text-[15px]"
};

/** Área táctil de − y +. En la ficha hay espacio para 40px. */
const TAP: Record<Variant, string> = {
  card: "h-8 w-8",
  row: "h-8 w-8",
  detail: "h-10 w-10"
};

export function OrderControl({
  product,
  variant = "card",
  addLabel = "Agregar",
  className = ""
}: {
  product: Product;
  variant?: Variant;
  addLabel?: string;
  className?: string;
}) {
  const { add, setQuantity, remove, quantityOf } = useOrder();
  const quantity = quantityOf(product.slug);
  const name = product.inspiredBy;
  const height = HEIGHT[variant];
  const text = TEXT[variant];
  const countText = COUNT_TEXT[variant];
  const tap = TAP[variant];

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => add(product.slug)}
        aria-label={`Agregar ${name} al pedido`}
        className={`inline-flex ${height} items-center justify-center gap-1.5 rounded-full border border-edge px-4 ${text} uppercase tracking-[0.12em] text-haze transition-all duration-300 ease-nox hover:border-mist hover:text-bone focus-visible:border-mist ${
          variant === "detail" ? "w-full bg-bone text-void hover:bg-white hover:text-void" : ""
        } ${className}`}
      >
        {addLabel}
      </button>
    );
  }

  const decreaseLabel =
    quantity === 1
      ? `Quitar ${name} del pedido`
      : `Quitar una unidad de ${name}`;

  return (
    <div
      className={`inline-flex ${height} items-center justify-between gap-1 rounded-full border border-bone/70 bg-white/[0.05] px-1 transition-all duration-300 ease-nox ${className}`}
    >
      <button
        type="button"
        onClick={() =>
          quantity === 1 ? remove(product.slug) : setQuantity(product.slug, quantity - 1)
        }
        aria-label={decreaseLabel}
        className={`grid ${tap} shrink-0 place-items-center rounded-full text-haze transition-colors duration-200 hover:bg-white/10 hover:text-bone focus-visible:bg-white/10`}
      >
        {quantity === 1 ? (
          // En 1, el control de restar quita el producto: el ícono lo anticipa.
          <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M2.6 4.2h8.8M5.6 4.2V3a.8.8 0 0 1 .8-.8h1.2a.8.8 0 0 1 .8.8v1.2M4 4.2l.5 7a.9.9 0 0 0 .9.8h3.2a.9.9 0 0 0 .9-.8l.5-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 7h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <span
        className={`min-w-[1.75rem] text-center ${countText} tabular-nums text-bone`}
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">{name}: </span>
        {quantity}
        <span className="sr-only"> {quantity === 1 ? "unidad" : "unidades"} en el pedido</span>
      </span>

      <button
        type="button"
        onClick={() => add(product.slug)}
        aria-label={`Agregar una unidad de ${name}`}
        className={`grid ${tap} shrink-0 place-items-center rounded-full text-haze transition-colors duration-200 hover:bg-white/10 hover:text-bone focus-visible:bg-white/10`}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M7 3v8M3 7h8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

/** Botón explícito de quitar, para donde hay espacio (ficha y asesor). */
export function RemoveFromOrder({
  product,
  className = ""
}: {
  product: Product;
  className?: string;
}) {
  const { remove, quantityOf } = useOrder();
  if (quantityOf(product.slug) === 0) return null;

  return (
    <button
      type="button"
      onClick={() => remove(product.slug)}
      aria-label={`Quitar ${product.inspiredBy} del pedido`}
      className={`text-[12px] text-mist underline underline-offset-4 transition-colors hover:text-bone ${className}`}
    >
      Quitar del pedido
    </button>
  );
}

/** Aviso efímero de "agregado", sin mover el layout. */
export function AddedFlash({ product }: { product: Product }) {
  const { lastAdded } = useOrder();
  if (lastAdded !== product.slug) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-bone">
      <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M2 6.4 4.8 9 10 3.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Agregado
    </span>
  );
}
