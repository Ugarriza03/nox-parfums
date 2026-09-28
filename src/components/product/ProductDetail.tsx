"use client";

import Link from "next/link";
import {
  ButtonLink,
  DataNotice,
  IconArrow,
  IconWhatsApp,
  Reveal,
  Tag
} from "@/components/ui";
import { AddedFlash, OrderControl, RemoveFromOrder } from "@/components/order/OrderControl";
import { familyAccent } from "./FragranceVisual";
import { ProductCover } from "./ProductCover";
import { ProductCard } from "./ProductCard";
import { useOrder } from "@/store/order";
import { relatedProducts } from "@/lib/catalog-query";
import { productEnquiryLink } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { RETAIL_BUNDLES, formatARS } from "@/config/pricing";
import {
  AROMATIC_INTENSITY_LABELS,
  FAMILY_LABELS,
  GENDER_LABELS,
  OCCASION_LABELS,
  PERFORMANCE_LEVEL_LABELS,
  SILLAGE_LABELS,
  SEASON_LABELS,
  UNIVERSE_LABELS,
  type Product
} from "@/data/types";

export function ProductDetail({ product }: { product: Product }) {
  const { quantityOf } = useOrder();
  const inOrder = quantityOf(product.slug);
  const o = product.olfactory;
  const related = relatedProducts(product, 4);

  return (
    <>
      {/* =========================================================== cabecera */}
      <section className="pt-24 md:pt-32">
        <div className="nox-shell">
          <nav className="mb-6 flex items-center gap-2 text-[11px] tracking-[0.06em] text-mist md:mb-8">
            <Link href="/catalogo" className="transition-colors hover:text-bone">
              Catálogo
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-mist/70">{product.house}</span>
          </nav>

          {/* La portada pesa más que la ficha: 5 columnas contra 4 en desktop. */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-9 md:gap-12 lg:gap-16">
            {/* Portada protagonista */}
            <Reveal className="md:col-span-5">
              <div className="relative">
                {/* Halo de familia: enmarca la portada sin encerrarla */}
                <div
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] opacity-70 blur-3xl md:-inset-10"
                  style={{
                    background: `radial-gradient(60% 50% at 50% 55%, ${familyAccent(product)}26 0%, transparent 72%)`
                  }}
                  aria-hidden="true"
                />
                <div className="overflow-hidden rounded-[22px] border border-edge/70 shadow-[0_40px_90px_-50px_rgba(0,0,0,1)]">
                  <div className="aspect-[4/5] w-full">
                    <ProductCover product={product} size="hero" priority />
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 rounded-[22px]"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(236,234,229,0.08)" }}
                  aria-hidden="true"
                />
              </div>
            </Reveal>

            {/* Ficha */}
            <div className="flex flex-col md:col-span-4 md:pt-2">
              <Reveal delay={80}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-mist">Inspirado en</p>
                <h1 className="mt-3 font-display text-[34px] leading-[1.06] text-bone md:text-[50px]">
                  {product.inspiredBy}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Tag>{siteConfig.concentration}</Tag>
                  <Tag>{siteConfig.volumeMl} ml</Tag>
                  <Tag>{GENDER_LABELS[product.gender]}</Tag>
                  {product.universe !== "pendiente" && (
                    <Tag>{UNIVERSE_LABELS[product.universe]}</Tag>
                  )}
                </div>

                <p className="mt-5 text-[12px] leading-relaxed text-mist">
                  Inspiración de alta fidelidad aromática.
                </p>

                {o && <p className="mt-5 text-[15px] leading-relaxed text-haze">{o.feel}</p>}
              </Reveal>

              {/* Acción principal */}
              <Reveal delay={140}>
                <div className="mt-8 rounded-2xl border border-edge/60 p-5 md:mt-10 md:p-6">
                  {inOrder === 0 ? (
                    <OrderControl
                      product={product}
                      variant="detail"
                      addLabel="Agregar al pedido"
                    />
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-mist">
                          Cantidad
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <OrderControl product={product} variant="detail" />
                          <RemoveFromOrder product={product} />
                        </div>
                      </div>
                      <AddedFlash product={product} />
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12px] text-mist">
                    <span>1 extracto {formatARS(RETAIL_BUNDLES[0].total)}</span>
                    <span className="text-mist/50" aria-hidden="true">·</span>
                    <span>
                      2 por {formatARS(RETAIL_BUNDLES[1].total)} — el beneficio se aplica solo
                    </span>
                  </div>

                  {inOrder > 0 && (
                    <Link
                      href="/mi-pedido"
                      className="mt-4 inline-flex items-center gap-2 text-[12px] text-haze underline underline-offset-4 transition-colors hover:text-bone"
                    >
                      Ver mi pedido ({inOrder} {inOrder === 1 ? "unidad" : "unidades"}){" "}
                      <IconArrow size={12} />
                    </Link>
                  )}
                </div>
              </Reveal>

              {/* Estado de datos */}
              {!o && (
                <Reveal delay={180}>
                  <div className="mt-6">
                    <DataNotice>
                      Todavía no publicamos la ficha olfativa completa de esta fragancia. Preferimos
                      no poner información que no podamos respaldar. Si querés saber cómo huele,
                      escribinos y te contamos.
                    </DataNotice>
                    <ButtonLink
                      href={productEnquiryLink(product)}
                      external
                      variant="whatsapp"
                      className="mt-4 w-full sm:w-auto"
                    >
                      <IconWhatsApp /> Preguntar por esta fragancia
                    </ButtonLink>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================ perfil de la fragancia */}
      {o && (
        <section className="py-16 md:py-24">
          <div className="nox-shell">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
              <div>
                <Reveal>
                  <p className="nox-eyebrow mb-6">Cómo evoluciona</p>
                  <ol className="relative flex flex-col gap-8 border-l border-edge/60 pl-7">
                    <Stage
                      index="01"
                      title="Primera impresión"
                      notes={o.topNotes}
                      copy="Lo que sentís apenas lo aplicás."
                    />
                    <Stage
                      index="02"
                      title="Después de unos minutos"
                      notes={o.middleNotes}
                      copy="El corazón del perfume, cuando ya se asentó."
                    />
                    <Stage
                      index="03"
                      title="Lo que permanece"
                      notes={o.baseNotes}
                      copy="El fondo del perfil: la parte que se percibe al final."
                    />
                  </ol>
                </Reveal>
              </div>

              <div className="flex flex-col gap-10">
                <Reveal delay={80}>
                  <div>
                    <p className="nox-eyebrow mb-5">Perfil olfativo</p>
                    <p className="mb-5 text-[12px] text-mist/80">Notas principales</p>
                    <div className="flex flex-wrap gap-2">
                      {o.mainNotes.map((note) => (
                        <span
                          key={note}
                          className="rounded-full border border-edge/70 px-3.5 py-2 text-[12px] text-haze"
                        >
                          {note}
                        </span>
                      ))}
                    </div>

                    <p className="nox-eyebrow mb-3 mt-8">Familias</p>
                    <p className="text-[13px] leading-relaxed text-mist">
                      {o.families.map((f) => FAMILY_LABELS[f]).join(" · ")}
                    </p>

                    <p className="nox-eyebrow mb-3 mt-8">Acordes</p>
                    <p className="text-[13px] leading-relaxed text-mist">{o.accords.join(" · ")}</p>
                  </div>
                </Reveal>

                {/* Sólo se muestra si hay respaldo */}
                {(o.occasions.length > 0 || o.seasons.length > 0 || o.aromaticIntensity) && (
                  <Reveal delay={140}>
                    <div className="rounded-2xl border border-edge/60 p-6">
                      <p className="nox-eyebrow mb-4">¿Cuándo lo usaría?</p>
                      <dl className="flex flex-col gap-4">
                        {o.occasions.length > 0 && (
                          <Row
                            label="Ocasión"
                            value={o.occasions.map((x) => OCCASION_LABELS[x]).join(" · ")}
                          />
                        )}
                        {o.seasons.length > 0 && (
                          <Row
                            label="Clima"
                            value={o.seasons.map((x) => SEASON_LABELS[x]).join(" · ")}
                          />
                        )}
                        {o.aromaticIntensity && (
                          <Row
                            label="Carácter"
                            value={AROMATIC_INTENSITY_LABELS[o.aromaticIntensity]}
                          />
                        )}
                      </dl>
                    </div>
                  </Reveal>
                )}

                {o.likeIf.length > 0 && (
                  <Reveal delay={200}>
                    <div>
                      <p className="nox-eyebrow mb-4">Te puede gustar si…</p>
                      <ul className="flex flex-col gap-3">
                        {o.likeIf.map((item) => (
                          <li key={item} className="flex gap-3 text-[13px] leading-relaxed text-mist">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-steel" aria-hidden="true" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                )}

                {/* Performance: SÓLO cuando NOX probó el extracto. Sin prueba
                    propia, la ficha no dice nada de duración ni proyección. */}
                {product.performance.verified && (
                  <Reveal delay={220}>
                    <div className="rounded-2xl border border-edge/60 p-6">
                      <p className="nox-eyebrow mb-4">Probado por NOX</p>
                      <dl className="flex flex-col gap-4">
                        {product.performance.longevity && (
                          <Row
                            label="Duración"
                            value={PERFORMANCE_LEVEL_LABELS[product.performance.longevity]}
                          />
                        )}
                        {product.performance.projection && (
                          <Row
                            label="Proyección"
                            value={PERFORMANCE_LEVEL_LABELS[product.performance.projection]}
                          />
                        )}
                        {product.performance.sillage && (
                          <Row
                            label="Estela"
                            value={SILLAGE_LABELS[product.performance.sillage]}
                          />
                        )}
                      </dl>
                    </div>
                  </Reveal>
                )}

                <Reveal delay={240}>
                  <p className="text-[11px] leading-relaxed text-mist/60">
                    Perfil olfativo inspirado en la fragancia de referencia. NOX reproduce de
                    forma muy fiel su identidad aromática, con posibles variaciones propias de
                    nuestra interpretación.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================== relacionadas */}
      {related.length > 0 && (
        <section className="border-t border-edge/50 py-16 md:py-24">
          <div className="nox-shell">
            <Reveal>
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <p className="nox-eyebrow mb-3">También podés mirar</p>
                  <h2 className="font-display text-[26px] leading-tight text-bone md:text-[34px]">
                    Fragancias del mismo mundo
                  </h2>
                </div>
                <ButtonLink href="/catalogo" variant="ghost" size="sm" className="shrink-0">
                  Ver todo <IconArrow />
                </ButtonLink>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {related.map((item, index) => (
                <Reveal key={item.slug} delay={index * 60}>
                  <ProductCard product={item} index={index} showUniverse={false} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Stage({
  index,
  title,
  notes,
  copy
}: {
  index: string;
  title: string;
  notes: string[];
  copy: string;
}) {
  return (
    <li className="relative">
      <span
        className="absolute -left-[33px] top-1.5 h-2 w-2 rounded-full border border-steel bg-void"
        aria-hidden="true"
      />
      <p className="text-[10px] uppercase tracking-[0.18em] text-mist/70">{index}</p>
      <p className="mt-1.5 font-display text-[22px] leading-tight text-bone md:text-[26px]">
        {title}
      </p>
      <p className="mt-2 text-[12px] text-mist/80">{copy}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-haze">
        {notes.length > 0 ? notes.join(", ") : "Sin datos verificados para esta etapa."}
      </p>
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-24 shrink-0 text-[11px] uppercase tracking-[0.14em] text-mist/70">
        {label}
      </dt>
      <dd className="text-[13px] leading-relaxed text-haze">{value}</dd>
    </div>
  );
}
