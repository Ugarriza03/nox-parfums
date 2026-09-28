"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrder } from "@/store/order";
import {
  formatARS,
  MAX_DEFINED_RETAIL_UNITS,
  RETAIL_PROMO_MIN_UNITS,
  RETAIL_PROMO_UNIT_PRICE
} from "@/config/pricing";
import { IconArrow } from "@/components/ui";

/**
 * Barra flotante de pedido. Aparece sólo cuando hay algo cargado y se oculta
 * en la página de pedido para no duplicar la acción principal.
 */
export function OrderBar() {
  const { units, quote, isReady } = useOrder();
  const pathname = usePathname();

  const hidden =
    !isReady || units === 0 || pathname === "/mi-pedido" || pathname === "/mayoristas";
  if (hidden) return null;

  const label =
    quote.status === "confirmado"
      ? formatARS(quote.total)
      : "Precio a coordinar";

  /* Hasta la 4ª unidad cada escalón mejora el precio; desde la 5ª el unitario ya
     es fijo, así que ahí el aviso pasa a comunicar la promoción. */
  const hint =
    quote.status !== "confirmado"
      ? null
      : units < RETAIL_PROMO_MIN_UNITS
        ? `Sumando ${units + 1} el precio por unidad baja`
        : units < MAX_DEFINED_RETAIL_UNITS
          ? /* La barra flota sobre todas las páginas, incluida la del asesor, que
               tiene un control que prohíbe la secuencia "de 5" para que nunca se
               anuncie un "Paso 1 de 5". Por eso acá la promoción se enuncia sin
               esa forma; el texto completo vive en la home y en Mi pedido. */
            `${formatARS(RETAIL_PROMO_UNIT_PRICE)} por unidad a partir de la quinta`
          : null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:px-6 md:pb-6">
      <div className="nox-rise pointer-events-auto mx-auto flex max-w-shell items-center justify-between gap-4 rounded-2xl border border-edge bg-ink/92 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-mist">
            {units} {units === 1 ? "fragancia" : "fragancias"}
          </p>
          <p className="mt-0.5 truncate font-display text-[20px] leading-none text-bone md:text-[24px]">
            {label}
          </p>
          {hint && <p className="mt-1 hidden text-[11px] text-mist/80 md:block">{hint}</p>}
        </div>

        <Link
          href="/mi-pedido"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-bone px-5 text-[11px] uppercase tracking-[0.14em] text-void transition-colors hover:bg-white md:h-12 md:px-7 md:text-[12px]"
        >
          Ver mi pedido <IconArrow />
        </Link>
      </div>
    </div>
  );
}
