"use client";

import { ButtonLink, IconArrow } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { TOTAL_HOUSES, TOTAL_PRODUCTS } from "@/data/products";

export function Hero() {
  return (
    <section className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden pb-14 pt-28 md:min-h-[88vh] md:justify-center md:pb-0 md:pt-24">
      {/* Atmósfera */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(105% 70% at 50% 0%, #101829 0%, transparent 58%), radial-gradient(85% 60% at 78% 22%, #16203444 0%, transparent 64%)"
          }}
        />
        <div
          className="nox-breathe absolute left-1/2 top-[26%] h-[380px] w-[380px] -translate-x-1/2 rounded-full blur-[110px] md:top-[30%] md:h-[560px] md:w-[560px]"
          style={{ background: "#1D3055" }}
        />
        {/* Marca fantasma de fondo */}
        <div className="absolute inset-x-0 top-[38%] flex justify-center md:top-[14%] md:justify-end md:pr-[6%]">
          <span className="select-none font-display text-[34vw] leading-none tracking-[0.12em] text-bone/[0.022] md:text-[22vw]">
            NOX
          </span>
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{ background: "linear-gradient(to top, #050609, transparent)" }}
        />
      </div>

      <div className="nox-shell relative">
        <div className="max-w-3xl">
          <p className="nox-eyebrow">
            {siteConfig.concentration} · {siteConfig.volumeMl} ml
          </p>

          <h1 className="mt-5 font-display text-[40px] leading-[1.04] tracking-[-0.015em] text-bone sm:text-[52px] md:text-[76px] lg:text-[86px]">
            Tu presencia,
            <br />
            <span className="text-haze">antes que tu nombre.</span>
          </h1>

          <p className="mt-6 max-w-lg text-[14px] leading-relaxed text-mist md:mt-7 md:text-[16px]">
            Fragancias inspiradas en los grandes nombres de la perfumería, con el carácter de
            NOX. Y alguien que sabe del tema para ayudarte a elegir la tuya.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row md:mt-11">
            <ButtonLink href="/catalogo" size="lg" className="w-full sm:w-auto">
              Descubrir fragancias <IconArrow />
            </ButtonLink>
            <ButtonLink href="/asesor" variant="outline" size="lg" className="w-full sm:w-auto">
              Encontrar mi fragancia
            </ButtonLink>
          </div>

          <div className="mt-12 flex items-center gap-6 border-t border-edge/50 pt-6 md:mt-16 md:gap-10">
            <Meta value={`${TOTAL_PRODUCTS}`} label="fragancias" />
            <span className="h-8 w-px bg-edge/60" aria-hidden="true" />
            <Meta value={`${TOTAL_HOUSES}`} label="casas de referencia" />
            <span className="hidden h-8 w-px bg-edge/60 sm:block" aria-hidden="true" />
            <div className="hidden sm:block">
              <Meta value="60" label="ml por extracto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meta({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-[26px] leading-none text-bone md:text-[30px]">{value}</p>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-mist">{label}</p>
    </div>
  );
}
