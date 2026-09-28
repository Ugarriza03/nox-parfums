import Link from "next/link";
import { NoxMark, IconWhatsApp } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { generalEnquiryLink } from "@/lib/whatsapp";

const COLUMNS = [
  {
    title: "Explorar",
    links: [
      { href: "/catalogo", label: "Catálogo" },
      { href: "/asesor", label: "Encontrá tu fragancia" },
      { href: "/mi-pedido", label: "Mi pedido" },
      { href: "/mayoristas", label: "Quiero revender NOX" }
    ]
  },
  {
    title: "Información",
    links: [
      { href: "/como-comprar", label: "Cómo comprar" },
      { href: "/envios", label: "Envíos y entregas" },
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
      { href: "/contacto", label: "Contacto" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="border-t border-edge/60 bg-ink">
      <div className="nox-shell py-14 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <NoxMark size={40} />
              <span className="font-display text-[22px] tracking-[0.24em] text-bone">NOX</span>
            </div>
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-mist">
              Extrait de Parfum en {siteConfig.volumeMl} ml, inspirados en los grandes nombres de
              la perfumería. Si no sabés cuál elegir, te ayudamos a encontrarlo.
            </p>
            <a
              href={generalEnquiryLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-[#2C6B52] bg-[#1E4D3B] px-5 text-[12px] uppercase tracking-[0.14em] text-[#DDF3E6] transition-colors hover:bg-[#256045]"
            >
              <IconWhatsApp /> {siteConfig.whatsapp.display}
            </a>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="nox-eyebrow mb-5">{column.title}</p>
              <ul className="flex flex-col gap-3.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-mist transition-colors hover:text-bone"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-edge/50 pt-7 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] tracking-[0.06em] text-mist/70">
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-5">
            <a
              href={siteConfig.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] tracking-[0.08em] text-mist transition-colors hover:text-bone"
            >
              {siteConfig.instagram.handle}
            </a>
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-[11px] leading-relaxed text-mist/55">
          NOX ofrece fragancias inspiradas en perfumes reconocidos. Las marcas mencionadas
          pertenecen a sus respectivos titulares y se citan únicamente como referencia
          olfativa. NOX no está asociada ni patrocinada por ellas.
        </p>
      </div>
    </footer>
  );
}
