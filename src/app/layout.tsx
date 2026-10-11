import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { siteConfig } from "@/config/site";

/**
 * LAYOUT RAÍZ — sólo el documento: <html>, tipografías, estilos y metadata.
 *
 * El marco de la tienda (pedido, Header, Footer, OrderBar) vive en
 * src/app/(tienda)/layout.tsx y en la 404 global; el panel /admin tiene el
 * suyo. Así el panel no carga componentes ni datos de la tienda.
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-scroll-behavior: Next.js 16 ya no anula `scroll-behavior: smooth`
    // (globals.css) al navegar entre rutas. El atributo conserva el
    // comportamiento de Next 14: salto instantáneo al inicio en cada página.
    <html lang="es-AR" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
