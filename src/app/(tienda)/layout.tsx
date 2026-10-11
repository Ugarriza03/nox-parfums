import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { Documento } from "@/components/documento/Documento";
import { TiendaChrome } from "@/components/layout/TiendaChrome";

/**
 * LAYOUT RAÍZ DE LA TIENDA PÚBLICA
 *
 * El grupo (tienda) no cambia ninguna URL: /, /catalogo, /fragancia/[slug],
 * /asesor, /mi-pedido, /mayoristas y las páginas informativas siguen igual.
 *
 * Es un layout RAÍZ (arma <html>): la tienda y /admin no comparten layout.
 * Con un layout raíz común, Next 16 responde los notFound() de la tienda
 * desde la raíz (layout raíz + not-found raíz) y no desde (tienda); y un
 * not-found raíz con el marco de la tienda metía el pedido y el catálogo en
 * /admin. Así, la 404 de la tienda ((tienda)/not-found.tsx) es la del layout
 * raíz de la tienda y conserva su presentación, y el panel no la incluye.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Extrait de Parfum`,
    template: `%s · ${siteConfig.shortName}`
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Extrait de Parfum`,
    description: siteConfig.description
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#050609",
  width: "device-width",
  initialScale: 1
};

export default function TiendaLayout({ children }: { children: ReactNode }) {
  return (
    <Documento>
      <TiendaChrome>{children}</TiendaChrome>
    </Documento>
  );
}
