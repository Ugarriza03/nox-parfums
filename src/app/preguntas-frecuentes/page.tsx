import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, IconWhatsApp, Reveal } from "@/components/ui";
import { FAQ } from "@/config/faq";
import { generalEnquiryLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Dudas habituales sobre las fragancias NOX, precios, medios de pago, entregas y reventa."
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Preguntas frecuentes"
        title="Lo que más nos preguntan"
        lead="Si lo tuyo no está acá, escribinos: contestamos por WhatsApp."
      />

      <section className="py-14 md:py-20">
        <div className="nox-shell">
          <div className="flex flex-col gap-14 md:gap-20">
            {FAQ.map((group, groupIndex) => (
              <Reveal key={group.title} delay={groupIndex * 60}>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:gap-14">
                  <h2 className="font-display text-[24px] leading-tight text-bone md:sticky md:top-28 md:self-start md:text-[28px]">
                    {group.title}
                  </h2>
                  <div className="flex flex-col divide-y divide-edge/50 border-t border-edge/50">
                    {group.items.map((item) => (
                      <details key={item.question} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-[15px] leading-snug text-bone marker:content-none">
                          {item.question}
                          <span
                            className="mt-1 shrink-0 text-mist transition-transform duration-400 ease-nox group-open:rotate-45"
                            aria-hidden="true"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14">
                              <path
                                d="M7 2v10M2 7h10"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        </summary>
                        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-mist">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-20 flex flex-col items-center rounded-2xl border border-edge/60 px-6 py-12 text-center">
              <p className="font-display text-[24px] text-bone md:text-[30px]">
                ¿Te quedó alguna duda?
              </p>
              <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-mist">
                Preguntanos lo que sea. Preferimos contestarte bien antes que vender apurado.
              </p>
              <ButtonLink href={generalEnquiryLink()} external variant="whatsapp" size="lg" className="mt-8">
                <IconWhatsApp /> Escribinos por WhatsApp
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
