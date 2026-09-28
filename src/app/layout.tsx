import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { OrderProvider } from "@/store/order";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrderBar } from "@/components/order/OrderBar";
import { siteConfig } from "@/config/site";

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
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <OrderProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-[12px] focus:text-void"
          >
            Ir al contenido
          </a>
          <Header />
          <main id="contenido" className="min-h-screen">
            {children}
          </main>
          <Footer />
          <OrderBar />
        </OrderProvider>
      </body>
    </html>
  );
}
