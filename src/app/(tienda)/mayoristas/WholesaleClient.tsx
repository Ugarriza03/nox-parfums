"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ButtonLink,
  IconArrow,
  IconWhatsApp,
  QuantityStepper,
  Reveal,
  SectionHead
} from "@/components/ui";
import { PRODUCTS, PRODUCTS_BY_SLUG } from "@/data/products";
import { filterCatalog, DEFAULT_FILTERS } from "@/lib/catalog-query";
import { wholesaleInfoLink, wholesaleOrderLink } from "@/lib/whatsapp";
import {
  WHOLESALE_MIN_UNITS,
  WHOLESALE_PRICING,
  formatARS,
  quoteWholesale,
  tierRangeLabel
} from "@/config/pricing";
import { GENDER_LABELS, UNIVERSE_LABELS } from "@/data/types";

/**
 * Armado de pedido mayorista.
 * Intencionalmente separado del pedido minorista: son dos lógicas comerciales
 * distintas y el cliente minorista nunca ve esta escala dentro de una ficha.
 */
export function WholesaleClient() {
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");

  const units = useMemo(
    () => Object.values(selection).reduce((sum, q) => sum + q, 0),
    [selection]
  );
  const quote = quoteWholesale(units);

  const lines = useMemo(
    () =>
      Object.entries(selection)
        .filter(([, q]) => q > 0)
        .map(([slug, quantity]) => ({ product: PRODUCTS_BY_SLUG[slug], quantity }))
        .filter((l) => Boolean(l.product)),
    [selection]
  );

  const searchResults = useMemo(() => {
    if (query.trim().length < 2) return [];
    return filterCatalog({ ...DEFAULT_FILTERS, query }, PRODUCTS).slice(0, 8);
  }, [query]);

  const setQuantity = (slug: string, quantity: number) =>
    setSelection((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[slug];
      else next[slug] = quantity;
      return next;
    });

  const addUnits = (slug: string, amount: number) =>
    setQuantity(slug, (selection[slug] ?? 0) + amount);

  return (
    <>
      {/* ============================================================= intro */}
      <section className="pt-28 md:pt-36">
        <div className="nox-shell">
          <div className="max-w-3xl">
            <p className="nox-eyebrow">Mayoristas</p>
            <h1 className="mt-4 font-display text-[36px] leading-[1.06] text-bone md:text-[58px]">
              Quiero revender NOX
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-mist">
              Si querés empezar a vender perfumes, esta es la puerta de entrada. Compra mínima
              de {WHOLESALE_MIN_UNITS} unidades, surtido libre entre todo el catálogo, y el
              precio por unidad baja a medida que sube la cantidad total.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ escala */}
      <section className="py-14 md:py-20">
        <div className="nox-shell">
          <Reveal>
            <SectionHead
              eyebrow="Escala"
              title="Precio por unidad según cantidad"
              lead="El escalón se calcula sobre el total del pedido, no por fragancia. Podés mezclar todas las que quieras."
            />
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7 lg:gap-2">
            {WHOLESALE_PRICING.map((tier, index) => {
              const active = quote.currentTier?.minUnits === tier.minUnits;
              return (
                <Reveal key={tier.minUnits} delay={index * 50}>
                  <div
                    className={`flex h-full flex-col justify-between rounded-xl border p-4 transition-colors duration-500 ${
                      active ? "border-bone bg-white/[0.05]" : "border-edge/60"
                    }`}
                    aria-current={active ? "true" : undefined}
                  >
                    <div>
                      <p className="font-display text-[22px] leading-none text-bone md:text-[24px]">
                        {tierRangeLabel(tier)}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-mist">
                        unidades
                      </p>
                    </div>
                    <p className="mt-5 text-[14px] text-haze">
                      {formatARS(tier.unitPrice)}
                      <span className="text-mist"> c/u</span>
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ armado */}
      <section className="border-t border-edge/50 py-14 md:py-20">
        <div className="nox-shell">
          <Reveal>
            <SectionHead
              eyebrow="Armá tu pedido"
              title="Elegí las fragancias y las cantidades"
              lead="Buscá por nombre o casa y sumá lo que quieras llevar. El cálculo se actualiza solo."
            />
          </Reveal>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
            <div>
              {/* Buscador */}
              <div className="relative">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar fragancia o casa…"
                  aria-label="Buscar fragancias para el pedido mayorista"
                  className="h-12 w-full rounded-full border border-edge bg-ink/60 px-5 py-4 text-[14px] text-bone placeholder:text-mist/70 focus:border-mist focus:outline-none"
                />
              </div>

              {searchResults.length > 0 && (
                <ul className="mt-3 overflow-hidden rounded-xl border border-edge/60">
                  {searchResults.map((product) => (
                    <li
                      key={product.slug}
                      className="flex items-center justify-between gap-4 border-b border-edge/40 px-4 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] text-bone">{product.inspiredBy}</p>
                        <p className="mt-0.5 text-[11px] text-mist">
                          {GENDER_LABELS[product.gender]}
                          {product.universe !== "pendiente" &&
                            ` · ${UNIVERSE_LABELS[product.universe]}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {[1, 5, 10].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => addUnits(product.slug, amount)}
                            className="h-9 rounded-full border border-edge px-3 text-[11px] text-haze transition-colors hover:border-mist hover:text-bone"
                          >
                            +{amount}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {query.trim().length >= 2 && searchResults.length === 0 && (
                <p className="mt-4 text-[13px] text-mist">
                  No encontramos esa fragancia. Probá con el nombre de la casa.
                </p>
              )}

              {/* Selección */}
              <div className="mt-10">
                <p className="nox-eyebrow mb-5">
                  Tu selección {lines.length > 0 && `· ${lines.length}`}
                </p>

                {lines.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-edge/70 px-6 py-12 text-center">
                    <p className="text-[14px] text-mist">
                      Todavía no agregaste nada. Buscá arriba y sumá fragancias.
                    </p>
                    <Link
                      href="/catalogo"
                      className="mt-4 inline-flex items-center gap-2 text-[12px] text-haze underline underline-offset-4 hover:text-bone"
                    >
                      Ver el catálogo completo <IconArrow size={12} />
                    </Link>
                  </div>
                ) : (
                  <ul className="flex flex-col divide-y divide-edge/50 border-y border-edge/50">
                    {lines.map((line) => (
                      <li
                        key={line.product.slug}
                        className="flex flex-wrap items-center justify-between gap-4 py-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-mist">
                            Inspirado en
                          </p>
                          <p className="mt-1 truncate font-display text-[18px] text-bone md:text-[20px]">
                            {line.product.inspiredBy}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <QuantityStepper
                            value={line.quantity}
                            onChange={(next) => setQuantity(line.product.slug, next)}
                            min={0}
                            max={999}
                            label={`Cantidad de ${line.product.inspiredBy}`}
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(line.product.slug, 0)}
                            className="rounded-full p-2 text-mist transition-colors hover:text-bone"
                            aria-label={`Quitar ${line.product.inspiredBy}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                              <path
                                d="M3.5 3.5 10.5 10.5M10.5 3.5 3.5 10.5"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Resumen mayorista */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-edge/60 p-6 md:p-7">
                <p className="nox-eyebrow mb-6">Resumen mayorista</p>

                <div className="flex items-baseline justify-between border-b border-edge/50 pb-4">
                  <span className="text-[13px] text-mist">Unidades</span>
                  <span className="text-[15px] tabular-nums text-bone">{units}</span>
                </div>

                {quote.canCheckout && quote.unitPrice !== null && quote.total !== null ? (
                  <>
                    <div className="flex items-baseline justify-between border-b border-edge/50 py-4">
                      <span className="text-[13px] text-mist">
                        Precio por unidad
                        {quote.currentTier && (
                          <span className="ml-2 text-mist/60">
                            ({tierRangeLabel(quote.currentTier)})
                          </span>
                        )}
                      </span>
                      <span className="text-[15px] tabular-nums text-haze">
                        {formatARS(quote.unitPrice)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-5">
                      <span className="text-[13px] text-mist">Total</span>
                      <span className="font-display text-[28px] leading-none text-bone md:text-[32px]">
                        {formatARS(quote.total)}
                      </span>
                    </div>

                    {quote.nextTier && (
                      <div className="mt-5 rounded-xl border border-edge/60 bg-white/[0.02] p-4">
                        <p className="text-[12px] leading-relaxed text-haze">
                          Sumando {quote.unitsToNextTier}{" "}
                          {quote.unitsToNextTier === 1 ? "unidad más accedés" : "unidades más accedés"}{" "}
                          al precio de {formatARS(quote.nextTier.unitPrice)} c/u.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="pt-5">
                    <p className="text-[13px] leading-relaxed text-mist" role="status">
                      {units === 0
                        ? `La compra mínima mayorista es de ${WHOLESALE_MIN_UNITS} unidades.`
                        : `Te ${quote.unitsToMinimum === 1 ? "falta" : "faltan"} ${quote.unitsToMinimum} ${
                            quote.unitsToMinimum === 1 ? "unidad" : "unidades"
                          } para alcanzar el mínimo mayorista.`}
                    </p>
                    <div
                      className="mt-4 h-1 w-full overflow-hidden rounded-full bg-graphite"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={WHOLESALE_MIN_UNITS}
                      aria-valuenow={units}
                      aria-label="Progreso hacia el mínimo mayorista"
                    >
                      <div
                        className="h-full rounded-full bg-bone transition-all duration-700 ease-nox"
                        style={{
                          width: `${Math.min(100, (units / WHOLESALE_MIN_UNITS) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {quote.canCheckout ? (
                  <ButtonLink
                    href={wholesaleOrderLink(lines)}
                    external
                    variant="whatsapp"
                    size="lg"
                    className="mt-6 w-full"
                  >
                    <IconWhatsApp /> Enviar pedido mayorista
                  </ButtonLink>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-edge px-8 text-[13px] uppercase tracking-[0.14em] text-mist/60"
                    >
                      <IconWhatsApp /> Enviar pedido mayorista
                    </button>
                    <ButtonLink
                      href={wholesaleInfoLink()}
                      external
                      variant="outline"
                      className="mt-3 w-full"
                    >
                      Consultar por WhatsApp
                    </ButtonLink>
                  </>
                )}

                <p className="mt-4 text-[11px] leading-relaxed text-mist/70">
                  {quote.canCheckout
                    ? "Se abre WhatsApp con el pedido, el precio por unidad y el total ya escritos."
                    : `Desde ${WHOLESALE_MIN_UNITS} unidades podés cerrar el pedido mayorista. Si tenés dudas antes, escribinos y lo vemos juntos.`}
                </p>
              </div>

              <p className="mt-5 px-1 text-[12px] leading-relaxed text-mist/70">
                ¿Dudas antes de arrancar? Escribinos y te explicamos cómo funciona la compra
                mayorista.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
