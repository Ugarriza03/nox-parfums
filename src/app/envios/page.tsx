import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink, DataNotice, IconWhatsApp, Reveal } from "@/components/ui";
import { SHIPPING_METHODS } from "@/config/shipping";
import { generalEnquiryLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Envíos y entregas",
  description:
    "Cómo entregamos los pedidos NOX: puntos de entrega, moto mensajería, entrega coordinada y Correo Argentino para el interior."
};

export default function ShippingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Envíos y entregas"
        title="Cómo te llega tu pedido"
        lead="Trabajamos con distintas modalidades según dónde estés. La definimos juntos al cerrar el pedido por WhatsApp."
      />

      <section className="py-14 md:py-20">
        <div className="nox-shell">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-edge/60 bg-edge/40 md:grid-cols-2">
            {SHIPPING_METHODS.map((method, index) => (
              <Reveal key={method.id} delay={index * 70}>
                <div className="flex h-full flex-col bg-void p-7 md:p-9">
                  <p className="font-display text-[22px] text-bone md:text-[26px]">
                    {method.title}
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-mist">{method.description}</p>
                  {(method.cost || method.eta) && (
                    <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-edge/50 pt-4">
                      {method.cost && (
                        <div>
                          <dt className="text-[10px] uppercase tracking-[0.16em] text-mist/70">
                            Costo
                          </dt>
                          <dd className="mt-1 text-[13px] text-haze">{method.cost}</dd>
                        </div>
                      )}
                      {method.eta && (
                        <div>
                          <dt className="text-[10px] uppercase tracking-[0.16em] text-mist/70">
                            Plazo
                          </dt>
                          <dd className="mt-1 text-[13px] text-haze">{method.eta}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-8">
              <DataNotice>
                No publicamos un costo ni un plazo fijo de envío porque varían según la zona y la
                modalidad. Preferimos decírtelo con certeza al coordinar el pedido, en vez de
                poner un número que después no se cumpla.
              </DataNotice>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-edge/50 py-14 md:py-20">
        <div className="nox-shell">
          <Reveal>
            <div className="max-w-2xl">
              <p className="nox-eyebrow mb-5">Si algo sale mal</p>
              <h2 className="font-display text-[28px] leading-[1.12] text-bone md:text-[38px]">
                Un error nuestro lo resolvemos nosotros
              </h2>
              <p className="mt-5 text-[14px] leading-relaxed text-mist">
                Si al preparar tu pedido nos equivocamos —por ejemplo, pediste el inspirado en
                Jean Paul Gaultier Le Male Elixir y recibiste el inspirado en Le Male— escribinos
                y te lo cambiamos. No te vamos a hacer dar vueltas por algo que hicimos mal.
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-mist/70">
                Es una política de resolución ante errores de preparación. Para cualquier otra
                situación, escribinos y lo vemos caso por caso.
              </p>
              <ButtonLink
                href={generalEnquiryLink()}
                external
                variant="whatsapp"
                className="mt-8 w-full sm:w-auto"
              >
                <IconWhatsApp /> Escribinos
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
