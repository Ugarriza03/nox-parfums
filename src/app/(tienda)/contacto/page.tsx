import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, IconArrow, IconWhatsApp, Reveal } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { generalEnquiryLink, orderIssueLink, wholesaleInfoLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Escribinos por WhatsApp al ${siteConfig.whatsapp.display} o seguinos en Instagram ${siteConfig.instagram.handle}.`
};

const REASONS = [
  {
    title: "Quiero que me asesoren",
    copy: "Contanos qué usás o qué buscás y te orientamos.",
    href: generalEnquiryLink(),
    cta: "Escribir"
  },
  {
    title: "Quiero revender NOX",
    copy: "Escala mayorista desde 10 unidades.",
    href: wholesaleInfoLink(),
    cta: "Consultar"
  },
  {
    title: "Tuve un problema con mi pedido",
    copy: "Si nos equivocamos preparando el pedido, lo resolvemos.",
    href: orderIssueLink(),
    cta: "Resolver"
  }
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Hablemos"
        lead="Respondemos por WhatsApp. Es el canal por el que coordinamos todo."
      />

      <section className="py-14 md:py-20">
        <div className="nox-shell">
          <Reveal>
            <div className="rounded-2xl border border-edge/60 p-8 md:p-12">
              <p className="nox-eyebrow">WhatsApp</p>
              <p className="mt-4 font-display text-[36px] leading-none text-bone md:text-[52px]">
                {siteConfig.whatsapp.display}
              </p>
              <ButtonLink
                href={generalEnquiryLink()}
                external
                variant="whatsapp"
                size="lg"
                className="mt-8 w-full sm:w-auto"
              >
                <IconWhatsApp /> Abrir conversación
              </ButtonLink>
            </div>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {REASONS.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 70}>
                <a
                  href={reason.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col justify-between rounded-2xl border border-edge/60 p-6 transition-colors duration-500 hover:border-mist/60"
                >
                  <div>
                    <p className="font-display text-[20px] leading-tight text-bone md:text-[22px]">
                      {reason.title}
                    </p>
                    <p className="mt-2.5 text-[13px] leading-relaxed text-mist">{reason.copy}</p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-haze">
                    {reason.cta} <IconArrow />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={160}>
            <div className="mt-10 flex flex-col gap-4 border-t border-edge/50 pt-10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="nox-eyebrow mb-2">Instagram</p>
                <a
                  href={siteConfig.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-[24px] text-bone transition-colors hover:text-white md:text-[30px]"
                >
                  {siteConfig.instagram.handle}
                </a>
              </div>
              <Link
                href="/preguntas-frecuentes"
                className="inline-flex items-center gap-2 text-[13px] text-haze underline underline-offset-4 transition-colors hover:text-bone"
              >
                Ver preguntas frecuentes <IconArrow size={12} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
