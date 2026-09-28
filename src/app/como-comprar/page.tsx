import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, IconArrow, IconWhatsApp, Reveal } from "@/components/ui";
import { PAYMENT_METHODS } from "@/config/shipping";
import { WHOLESALE_MIN_UNITS } from "@/config/pricing";
import { generalEnquiryLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Cómo comprar",
  description:
    "Cómo se compra en NOX: elegís, armás el pedido en la web y lo cerrás por WhatsApp. Medios de pago y coordinación de entrega."
};

const STEPS = [
  {
    title: "Elegí tus fragancias",
    copy: "Recorré el catálogo o usá el asesor si no tenés claro qué buscás. Podés agregar todas las que quieras."
  },
  {
    title: "Armá tu pedido",
    copy: "En «Mi pedido» ves lo elegido, editás cantidades y el precio se actualiza con el beneficio por cantidad ya aplicado."
  },
  {
    title: "Cerralo por WhatsApp",
    copy: "Tocás «Finalizar pedido por WhatsApp» y se abre el chat con el pedido escrito. No tenés que volver a listar nada."
  },
  {
    title: "Coordinamos entrega y pago",
    copy: "Por ese mismo chat acordamos cómo te llega y cómo abonás. Ahí queda todo confirmado."
  }
];

export default function HowToBuyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cómo comprar"
        title="Cuatro pasos y listo"
        lead="No hay checkout con tarjeta ni cuenta que crear. La compra se cierra por WhatsApp, con una persona del otro lado."
      />

      <section className="py-14 md:py-20">
        <div className="nox-shell">
          <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-edge/60 bg-edge/40 md:grid-cols-2">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 70}>
                <li className="flex h-full flex-col bg-void p-7 md:p-9">
                  <span className="font-display text-[30px] leading-none text-mist/50">
                    0{index + 1}
                  </span>
                  <p className="mt-5 font-display text-[22px] text-bone md:text-[25px]">
                    {step.title}
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-mist">{step.copy}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-edge/50 py-14 md:py-20">
        <div className="nox-shell grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <div>
              <p className="nox-eyebrow mb-6">Medios de pago</p>
              <ul className="flex flex-col gap-5">
                {PAYMENT_METHODS.map((method) => (
                  <li key={method.id} className="border-b border-edge/50 pb-5 last:border-b-0">
                    <p className="font-display text-[20px] text-bone">{method.title}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-mist">
                      {method.description}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[12px] leading-relaxed text-mist/70">
                Por el momento no trabajamos con tarjeta de crédito, tarjeta de débito ni pago en
                cuotas.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div>
              <p className="nox-eyebrow mb-6">Antes de comprar</p>
              <div className="flex flex-col gap-6">
                <Item
                  title="¿No sabés cuál elegir?"
                  copy="El asesor te hace tres preguntas y te muestra opciones compatibles."
                  href="/asesor"
                  label="Ir al asesor"
                />
                <Item
                  title="¿Cómo te llega?"
                  copy="Trabajamos con distintas modalidades según la zona."
                  href="/envios"
                  label="Ver envíos y entregas"
                />
                <Item
                  title={`¿Querés revender?`}
                  copy={`Desde ${WHOLESALE_MIN_UNITS} unidades entrás en escala mayorista.`}
                  href="/mayoristas"
                  label="Ver mayoristas"
                />
              </div>

              <ButtonLink
                href={generalEnquiryLink()}
                external
                variant="whatsapp"
                className="mt-9 w-full sm:w-auto"
              >
                <IconWhatsApp /> Tengo una duda
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Item({
  title,
  copy,
  href,
  label
}: {
  title: string;
  copy: string;
  href: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-edge/60 p-5">
      <p className="text-[15px] text-bone">{title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-mist">{copy}</p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-2 text-[12px] text-haze underline underline-offset-4 transition-colors hover:text-bone"
      >
        {label} <IconArrow size={12} />
      </Link>
    </div>
  );
}
