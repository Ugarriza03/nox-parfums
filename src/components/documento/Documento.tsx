import type { ReactNode } from "react";
import "@/app/globals.css";

/**
 * DOCUMENTO HTML COMPARTIDO
 *
 * La tienda y NOX Admin tienen cada una su propio layout raíz
 * (src/app/(tienda)/layout.tsx y src/app/admin/layout.tsx). Los dos arman el
 * documento con este componente: <html>, tipografías y estilos globales.
 * No importa nada de la tienda ni del panel.
 */
export function Documento({ children }: { children: ReactNode }) {
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
