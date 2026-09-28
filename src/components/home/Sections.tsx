"use client";

import Link from "next/link";
import {
  ButtonLink,
  Chip,
  IconArrow,
  IconWhatsApp,
  Reveal,
  Section,
  SectionHead
} from "@/components/ui";
import { ProductCard } from "@/components/product/ProductCard";
import { FEATURED_PRODUCTS, UNIVERSE_COUNTS, GENDER_COUNTS } from "@/data/products";
import {
  RETAIL_BUNDLES,
  RETAIL_PROMO_LABEL,
  RETAIL_PROMO_RANGE_LABEL,
  RETAIL_PROMO_UNIT_PRICE,
  MAX_DEFINED_RETAIL_UNITS,
  WHOLESALE_MIN_UNITS,
  giftLabel,
  formatARS
} from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { wholesaleInfoLink } from "@/lib/whatsapp";

/* ============================================================ DESCUBRIMIENTO */

export function DiscoverBlock() {
  return (
    <Section className="border-y border-edge/50 bg-ink">
      <Reveal>
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between md:gap-16">
          <div className="max-w-xl">
            <p className="nox-eyebrow mb-4">Asesoramiento</p>
            <h2 className="font-display text-[30px] leading-[1.12] text-bone md:text-[42px]">
              ¿No sabés cuál elegir?
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-mist md:text-[15px]">
              Tres preguntas y te mostramos las fragancias que tienen sentido para vos. Si
              preferís que te guiemos nosotros, seguimos la charla por WhatsApp.
            </p>
          </div>
          <ButtonLink href="/asesor" size="lg" className="w-full shrink-0 sm:w-auto">
            Empezar <IconArrow />
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  );
}

/* ================================================================ DESTACADAS */

export function FeaturedSection() {
  return (
    <Section>
      <Reveal>
        <SectionHead
          eyebrow="Selección"
          title="Una selección para descubrir NOX"
          lead="Inspiraciones de alta fidelidad en formato Extrait de Parfum. Seis fragancias que cubren perfiles distintos; el catálogo completo tiene bastante más."
          action={
            <ButtonLink href="/catalogo" variant="outline">
              Ver todo el catálogo
            </ButtonLink>
          }
        />
      </Reveal>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14">
        {FEATURED_PRODUCTS.map((product, index) => (
          <Reveal key={product.slug} delay={index * 60}>
            <ProductCard product={product} index={index} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* =================================================================== UNIVERSOS */

const UNIVERSES = [
  {
    href: "/catalogo?universo=disenador",
    key: "disenador",
    title: "Diseñador",
    copy: "Referencias de grandes casas internacionales."
  },
  {
    href: "/catalogo?universo=nicho",
    key: "nicho",
    title: "Nicho",
    copy: "Casas y composiciones con una identidad olfativa más particular."
  },
  {
    href: "/catalogo?universo=arabe",
    key: "arabe",
    title: "Árabes",
    copy: "Una selección de casas y fragancias de perfumería árabe."
  }
];

const PROFILES = [
  { href: "/catalogo?perfil=masculino", key: "masculino", title: "Masculino" },
  { href: "/catalogo?perfil=femenino", key: "femenino", title: "Femenino" },
  { href: "/catalogo?perfil=unisex", key: "unisex", title: "Unisex" }
];

export function UniversesSection() {
  return (
    <Section className="border-t border-edge/50">
      <Reveal>
        <SectionHead
          eyebrow="Universos NOX"
          title="Elegí por dónde entrar"
          lead="Tres mundos con lógicas distintas. También podés filtrar directamente por perfil."
        />
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {UNIVERSES.map((universe, index) => (
          <Reveal key={universe.key} delay={index * 80}>
            <Link
              href={universe.href}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-edge/60 p-6 transition-colors duration-500 ease-nox hover:border-mist/50 md:p-8"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-nox group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(90% 70% at 50% 100%, rgba(143,166,204,0.13) 0%, transparent 70%)"
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.18em] text-mist">
                  {UNIVERSE_COUNTS[universe.key] ?? 0} fragancias
                </p>
                <h3 className="mt-3 font-display text-[27px] leading-tight text-bone md:text-[32px]">
                  {universe.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-mist">{universe.copy}</p>
              </div>
              <span className="relative mt-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-haze transition-colors group-hover:text-bone">
                Explorar <IconArrow />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={160}>
        <div className="mt-8 flex flex-wrap items-center gap-2.5 md:mt-10">
          <span className="mr-2 text-[11px] uppercase tracking-[0.16em] text-mist">Por perfil</span>
          {PROFILES.map((profile) => (
            <Link key={profile.key} href={profile.href}>
              <Chip as="span">
                {profile.title}
                <span className="ml-2 text-mist/70">{GENDER_COUNTS[profile.key] ?? 0}</span>
              </Chip>
            </Link>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================================================== EXPERIENCIA */

const EXPERIENCE = [
  {
    title: "Extrait de Parfum",
    copy: "Nuestros extractos se presentan como Extrait de Parfum en 60 ml. Una concentración alta que acompaña la experiencia aromática."
  },
  {
    title: "Alguien que te asesora",
    copy: "No te dejamos solo frente a una grilla. Preguntá por WhatsApp, contanos qué usás y te orientamos."
  },
  {
    title: "Variedad real",
    copy: "Diseñador, nicho y árabes. Masculinos, femeninos y unisex. Casi siempre hay algo parecido a lo que buscás."
  },
  {
    title: "Tu pedido, armado",
    copy: "Elegís, armás el pedido en la web y lo cerrás por WhatsApp con todo escrito. Sin vueltas."
  }
];

export function ExperienceSection() {
  return (
    <Section className="border-t border-edge/50 bg-ink">
      <Reveal>
        <SectionHead eyebrow="La experiencia NOX" title="Cómo trabajamos" />
      </Reveal>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-edge/60 bg-edge/40 sm:grid-cols-2">
        {EXPERIENCE.map((item, index) => (
          <Reveal key={item.title} delay={index * 70}>
            <div className="h-full bg-ink p-6 md:p-8">
              <p className="font-display text-[20px] text-bone md:text-[23px]">{item.title}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-mist">{item.copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ==================================================== BENEFICIO POR CANTIDAD */

export function TiersSection() {
  return (
    <Section className="border-t border-edge/50">
      <Reveal>
        <SectionHead
          eyebrow="Beneficio por cantidad"
          title="Cuantos más llevás, mejor queda el precio"
          lead="El beneficio se aplica solo cuando armás el pedido. No hay códigos ni pasos extra. Los packs cerrados van de 1 a 4 extractos; a partir de la quinta unidad el precio pasa a ser por extracto."
        />
      </Reveal>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {RETAIL_BUNDLES.map((bundle, index) => {
          const perUnit = Math.round(bundle.total / bundle.units);
          return (
            <Reveal key={bundle.units} delay={index * 70}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-edge/60 p-5 transition-colors duration-500 hover:border-mist/50 md:p-6">
                <div>
                  <p className="font-display text-[34px] leading-none text-bone md:text-[42px]">
                    {bundle.units}
                  </p>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-mist">
                    {bundle.units === 1 ? "extracto" : "extractos"}
                  </p>
                </div>
                <div className="mt-7">
                  <p className="text-[17px] text-bone md:text-[19px]">{formatARS(bundle.total)}</p>
                  {bundle.units > 1 && (
                    <p className="mt-1 text-[11px] text-mist">{formatARS(perUnit)} cada uno</p>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={200}>
        <div className="mt-5 rounded-2xl border border-edge/60 p-5 md:mt-6 md:p-6">
          <p className="font-display text-[20px] leading-tight text-bone md:text-[24px]">
            {RETAIL_PROMO_LABEL}
          </p>
          <p className="mt-2 text-[12px] text-mist">
            {RETAIL_PROMO_RANGE_LABEL}. Por ejemplo, {MAX_DEFINED_RETAIL_UNITS} extractos{" "}
            {formatARS(MAX_DEFINED_RETAIL_UNITS * RETAIL_PROMO_UNIT_PRICE)}.
          </p>
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-edge/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-mist">1 o 2 extractos</p>
            <p className="mt-2 text-[13px] leading-relaxed text-haze">{giftLabel(1)} de regalo</p>
          </div>
          <div className="rounded-2xl border border-edge/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-mist">3 extractos o más</p>
            <p className="mt-2 text-[13px] leading-relaxed text-haze">{giftLabel(3)} de regalo</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={280}>
        <p className="mt-6 text-[12px] leading-relaxed text-mist/80">
          A partir de {WHOLESALE_MIN_UNITS} unidades entrás en la{" "}
          <Link href="/mayoristas" className="text-haze underline underline-offset-4 hover:text-bone">
            escala mayorista
          </Link>
          , con su propia lista de precios.
        </p>
      </Reveal>
    </Section>
  );
}

/* ================================================================ MAYORISTAS */

export function WholesaleTeaser() {
  return (
    <Section className="border-t border-edge/50 bg-ink">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-edge/60 p-8 md:p-14">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 120% at 88% 0%, rgba(143,166,204,0.12) 0%, transparent 62%)"
            }}
            aria-hidden="true"
          />
          <div className="relative max-w-2xl">
            <p className="nox-eyebrow mb-4">Mayoristas</p>
            <h2 className="font-display text-[30px] leading-[1.12] text-bone md:text-[42px]">
              Quiero revender NOX
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-mist md:text-[15px]">
              Desde {WHOLESALE_MIN_UNITS} unidades trabajamos con escala mayorista. Armás el
              pedido con las fragancias que quieras y el precio por unidad baja según la
              cantidad total.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/mayoristas" size="lg" className="w-full sm:w-auto">
                Ver escala mayorista <IconArrow />
              </ButtonLink>
              <ButtonLink
                href={wholesaleInfoLink()}
                external
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <IconWhatsApp /> Consultar
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ===================================================================== CIERRE */

export function ClosingSection() {
  return (
    <Section className="border-t border-edge/50">
      <Reveal>
        <div className="flex flex-col items-center py-6 text-center md:py-12">
          <p className="nox-eyebrow">Hablemos</p>
          <h2 className="mt-5 max-w-2xl font-display text-[30px] leading-[1.1] text-bone md:text-[48px]">
            Contanos qué buscás y te ayudamos a encontrarlo
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-mist">
            Respondemos por WhatsApp. Si querés ver cómo trabajamos, también estamos en
            Instagram.
          </p>
          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink
              href={`https://wa.me/${siteConfig.whatsapp.international}`}
              external
              variant="whatsapp"
              size="lg"
            >
              <IconWhatsApp /> {siteConfig.whatsapp.display}
            </ButtonLink>
            <ButtonLink href={siteConfig.instagram.url} external variant="outline" size="lg">
              {siteConfig.instagram.handle}
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
