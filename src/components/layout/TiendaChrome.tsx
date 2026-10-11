import type { ReactNode } from "react";
import { OrderProvider } from "@/store/order";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrderBar } from "@/components/order/OrderBar";

/**
 * MARCO DE LA TIENDA PÚBLICA
 *
 * Pedido (OrderProvider), salto al contenido, Header, <main>, Footer y
 * OrderBar: exactamente la misma estructura que tenía el layout raíz.
 *
 * Lo usan el layout del grupo (tienda) y la página 404 global. El panel
 * /admin NO pasa por acá, así que no carga el pedido ni el catálogo.
 */
export function TiendaChrome({ children }: { children: ReactNode }) {
  return (
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
  );
}
