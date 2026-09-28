"use client";

import Link from "next/link";
import {
  ButtonLink,
  DataNotice,
  IconArrow,
  IconWhatsApp,
  QuantityStepper,
  Reveal
} from "@/components/ui";
import { ProductCover } from "@/components/product/ProductCover";
import { useOrder } from "@/store/order";
import { retailOrderLink } from "@/lib/whatsapp";
import {
  MAX_DEFINED_RETAIL_UNITS,
  RETAIL_BUNDLES,
  RETAIL_PROMO_MIN_UNITS,
  RETAIL_PROMO_LABEL,
  RETAIL_PROMO_RANGE_LABEL,
  quoteRetail,
  giftLabel,
  WHOLESALE_MIN_UNITS,
  formatARS
} from "@/config/pricing";
import { siteConfig } from "@/config/site";
import type { OrderLineResolved } from "@/store/order";

/**
 * Reparte el total del combo entre las líneas, proporcional a la cantidad.
 * Es sólo una referencia visual: el precio real es el total del combo.
 * La última línea absorbe el redondeo para que la suma cierre exacta.
 */
function proportionalShares(lines: OrderLineResolved[], total: number, units: number): number[] {
  if (units === 0) return lines.map(() => 0);
  const raw = lines.map((line) => Math.round((total * line.quantity) / units));
  const diff = total - raw.reduce((a, b) => a + b, 0);
  if (raw.length > 0) raw[raw.length - 1] += diff;
  return raw;
}

export function OrderClient() {
  const { lines, units, quote, setQuantity, remove, clear, isReady } = useOrder();

  if (!isReady) {
    return (
      <section className="pt-32 md:pt-40">
        <div className="nox-shell pb-24">
          <div className="h-5 w-32 animate-pulse rounded bg-graphite" />
          <div className="mt-6 h-12 w-72 animate-pulse rounded bg-graphite" />
        </div>
      </section>
    );
  }

  if (lines.length === 0) return <EmptyOrder />;

  const shares =
    quote.status === "confirmado" ? proportionalShares(lines, quote.total, units) : null;

  /* Próximo escalón: pack cerrado hasta 4, y desde ahí la promoción por unidad,
     que sigue mejorando el precio medio hasta la novena. */
  const siguiente = units > 0 ? quoteRetail(units + 1) : null;
  const nextBundle =
    siguiente && siguiente.status === "confirmado"
      ? { units: siguiente.units, total: siguiente.total, unitAverage: siguiente.unitAverage }
      : null;

  return (
    <section className="pt-28 md:pt-36">
      <div className="nox-shell pb-28">
        <Reveal>
          <p className="nox-eyebrow">Mi pedido</p>
          <h1 className="mt-4 font-display text-[34px] leading-[1.08] text-bone md:text-[52px]">
            {units} {units === 1 ? "fragancia elegida" : "fragancias elegidas"}
          </h1>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_390px] lg:gap-16">
          {/* ------------------------------------------------------- líneas */}
          <div className="min-w-0">
            <ul className="flex flex-col divide-y divide-edge/50 border-y border-edge/50">
              {lines.map((line, index) => (
                <li key={line.product.slug} className="flex min-w-0 gap-4 py-5 md:gap-6 md:py-6">
                  <Link
                    href={`/fragancia/${line.product.slug}`}
                    className="block w-20 shrink-0 overflow-hidden rounded-xl md:w-28"
                  >
                    {/* Misma portada que el catalogo, la ficha y el asesor.
                        ProductCover es el punto unico de decision del proyecto:
                        resuelve slug -> coverFor() -> PORTADAS y muestra la foto
                        real; la composicion generada queda solo como respaldo
                        interno suyo. Llamar al componente de respaldo directo
                        desde aca era lo que hacia que el pedido mostrara siempre
                        la composicion aunque la fragancia tuviera su portada. */}
                    <div className="aspect-[4/5] w-full">
                      <ProductCover product={line.product} size="thumb" />
                    </div>
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-mist">
                          Inspirado en
                        </p>
                        <h2 className="mt-1">
                          <Link
                            href={`/fragancia/${line.product.slug}`}
                            className="font-display text-[19px] leading-tight text-bone transition-colors hover:text-white md:text-[23px]"
                          >
                            {line.product.inspiredBy}
                          </Link>
                        </h2>
                        <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-mist/70">
                          {siteConfig.concentration} · {siteConfig.volumeMl} ml
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(line.product.slug)}
                        className="shrink-0 rounded-full p-2 text-mist transition-colors hover:text-bone"
                        aria-label={`Quitar ${line.product.inspiredBy} del pedido`}
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

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(next) => setQuantity(line.product.slug, next)}
                        min={0}
                        max={20}
                        label={`Cantidad de ${line.product.inspiredBy}`}
                      />
                      {shares && (
                        <span className="text-[13px] tabular-nums text-haze">
                          {formatARS(shares[index])}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between gap-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 text-[12px] text-haze underline underline-offset-4 transition-colors hover:text-bone"
              >
                Seguir mirando el catálogo <IconArrow size={12} />
              </Link>
              <button
                type="button"
                onClick={clear}
                className="text-[12px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
              >
                Vaciar pedido
              </button>
            </div>

            {shares && (
              <p className="mt-6 text-[11px] leading-relaxed text-mist/60">
                Los valores por fragancia son una referencia: el precio real es el del combo
                completo, ya con el beneficio por cantidad aplicado.
              </p>
            )}
          </div>

          {/* ------------------------------------------------------ resumen */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-edge/60 p-6 md:p-7">
              <p className="nox-eyebrow mb-6">Resumen</p>

              <div className="flex items-baseline justify-between border-b border-edge/50 pb-4">
                <span className="text-[13px] text-mist">Cantidad total</span>
                <span className="text-[15px] tabular-nums text-bone">{units}</span>
              </div>

              {quote.status === "confirmado" ? (
                <>
                  <div className="flex items-baseline justify-between pt-5">
                    <span className="text-[13px] text-mist">Total</span>
                    <span className="font-display text-[30px] leading-none text-bone md:text-[34px]">
                      {formatARS(quote.total)}
                    </span>
                  </div>
                  <p className="mt-2 text-right text-[12px] text-mist">
                    {formatARS(quote.unitAverage)} por unidad
                  </p>

                  {quote.promoUnitaria && (
                    <p className="mt-3 text-[12px] leading-relaxed text-haze">
                      {RETAIL_PROMO_LABEL}. {RETAIL_PROMO_RANGE_LABEL}.
                    </p>
                  )}

                  <div className="mt-5 rounded-xl border border-edge/60 p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-mist">Te llevás de regalo</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-haze">{giftLabel(units)}</p>
                  </div>

                  {nextBundle && (
                    <div className="mt-5 rounded-xl border border-edge/60 bg-white/[0.02] p-4">
                      <p className="text-[12px] leading-relaxed text-haze">
                        Si sumás una más, {nextBundle.units} quedan en{" "}
                        {formatARS(nextBundle.total)} — {formatARS(nextBundle.unitAverage)} cada
                        una.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="pt-5">
                  <DataNotice>
                    La escala minorista llega hasta {MAX_DEFINED_RETAIL_UNITS} unidades. Para{" "}
                    {units} lo coordinamos por WhatsApp
                    {units >= WHOLESALE_MIN_UNITS ? (
                      <>
                        {" "}
                        — y a partir de {WHOLESALE_MIN_UNITS} te conviene mirar la{" "}
                        <Link
                          href="/mayoristas"
                          className="underline underline-offset-4 hover:text-bone"
                        >
                          escala mayorista
                        </Link>
                        .
                      </>
                    ) : (
                      "."
                    )}
                  </DataNotice>
                </div>
              )}

              <ButtonLink
                href={retailOrderLink(lines)}
                external
                variant="whatsapp"
                size="lg"
                className="mt-6 w-full"
              >
                <IconWhatsApp /> Finalizar pedido por WhatsApp
              </ButtonLink>

              <p className="mt-4 text-[11px] leading-relaxed text-mist/70">
                Se abre WhatsApp con el pedido ya escrito. Ahí coordinamos entrega y forma de
                pago: efectivo, transferencia bancaria o transferencia desde billetera virtual.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2 px-1">
              <Link
                href="/envios"
                className="text-[12px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
              >
                Cómo hacemos las entregas
              </Link>
              <Link
                href="/como-comprar"
                className="text-[12px] text-mist underline underline-offset-4 transition-colors hover:text-bone"
              >
                Cómo comprar paso a paso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyOrder() {
  return (
    <section className="pt-32 md:pt-40">
      <div className="nox-shell pb-32">
        <div className="mx-auto max-w-lg text-center">
          <p className="nox-eyebrow">Mi pedido</p>
          <h1 className="mt-5 font-display text-[32px] leading-[1.1] text-bone md:text-[46px]">
            Todavía no elegiste nada
          </h1>
          <p className="mt-5 text-[14px] leading-relaxed text-mist">
            Recorré el catálogo y andá sumando lo que te interese. Si no sabés por dónde
            arrancar, el asesor te acomoda en un minuto.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/catalogo" size="lg">
              Ver catálogo <IconArrow />
            </ButtonLink>
            <ButtonLink href="/asesor" variant="outline" size="lg">
              Encontrar mi fragancia
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
