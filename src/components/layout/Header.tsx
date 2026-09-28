"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NoxMark, IconWhatsApp } from "@/components/ui";
import { useOrder } from "@/store/order";
import { siteConfig } from "@/config/site";
import { generalEnquiryLink } from "@/lib/whatsapp";

/** Navegación principal: deliberadamente corta. */
const PRIMARY = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/asesor", label: "Encontrá tu fragancia" },
  { href: "/mayoristas", label: "Mayoristas" }
];

/** Secundaria: vive en el menú mobile y en el pie. */
const SECONDARY = [
  { href: "/como-comprar", label: "Cómo comprar" },
  { href: "/envios", label: "Envíos y entregas" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" }
];

export function Header() {
  const pathname = usePathname();
  const { units } = useOrder();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-nox ${
          scrolled || open
            ? "border-b border-edge/60 bg-void/88 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="nox-shell flex h-16 items-center justify-between gap-4 md:h-20">
          <Link href="/" className="flex items-center gap-2.5" aria-label="NOX Parfums — Inicio">
            <NoxMark size={32} />
            <span className="font-display text-[19px] tracking-[0.24em] text-bone md:text-[21px]">
              NOX
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Navegación principal">
            {PRIMARY.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-[12px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                    active ? "text-bone" : "text-mist hover:text-bone"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-bone transition-all duration-400 ease-nox ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/mi-pedido"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-edge px-4 text-[11px] uppercase tracking-[0.12em] text-bone transition-colors hover:border-mist"
            >
              <span className="hidden sm:inline">Mi pedido</span>
              <span className="sm:hidden">Pedido</span>
              <span
                className={`grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1 text-[10px] tabular-nums transition-colors ${
                  units > 0 ? "bg-bone text-void" : "bg-graphite text-mist"
                }`}
              >
                {units}
              </span>
            </Link>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-edge text-bone transition-colors hover:border-mist lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                {open ? (
                  <path
                    d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M2 5h12M2 11h12"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menú mobile a pantalla completa */}
      <div
        className={`fixed inset-0 z-40 bg-void transition-all duration-500 ease-nox lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="nox-shell flex h-full flex-col pt-24 pb-10">
          <nav className="flex flex-col" aria-label="Navegación">
            {PRIMARY.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-edge/50 py-5 font-display text-[28px] leading-none text-bone transition-transform duration-500 ease-nox"
                style={{
                  transform: open ? "none" : "translateY(14px)",
                  opacity: open ? 1 : 0,
                  transitionDelay: `${80 + i * 60}ms`
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-4">
            {SECONDARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] tracking-[0.04em] text-mist transition-colors hover:text-bone"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <a
              href={generalEnquiryLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#2C6B52] bg-[#1E4D3B] text-[12px] uppercase tracking-[0.14em] text-[#DDF3E6]"
            >
              <IconWhatsApp /> Escribinos por WhatsApp
            </a>
            <a
              href={siteConfig.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-[12px] tracking-[0.1em] text-mist"
            >
              {siteConfig.instagram.handle}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
