/**
 * PREVIEW ESTÁTICO
 *
 * Empaqueta exactamente los mismos componentes del proyecto Next.js en un
 * único HTML navegable, para poder probar el recorrido completo sin levantar
 * el servidor. No forma parte del sitio de producción.
 */

import { createRoot } from "react-dom/client";
import { usePathname } from "next/navigation";
import { OrderProvider } from "@/store/order";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrderBar } from "@/components/order/OrderBar";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getProduct } from "@/data/products";

import HomePage from "@/app/(tienda)/page";
import { CatalogClient } from "@/app/(tienda)/catalogo/CatalogClient";
import { AdvisorClient } from "@/app/(tienda)/asesor/AdvisorClient";
import { OrderClient } from "@/app/(tienda)/mi-pedido/OrderClient";
import { WholesaleClient } from "@/app/(tienda)/mayoristas/WholesaleClient";
import HowToBuyPage from "@/app/(tienda)/como-comprar/page";
import ShippingPage from "@/app/(tienda)/envios/page";
import FaqPage from "@/app/(tienda)/preguntas-frecuentes/page";
import ContactPage from "@/app/(tienda)/contacto/page";
import { NoEncontrado as NotFound } from "@/components/layout/NoEncontrado";

function Routes() {
  const path = usePathname();

  if (path === "/") return <HomePage />;
  if (path === "/catalogo") return <CatalogClient />;
  if (path === "/asesor") return <AdvisorClient />;
  if (path === "/mi-pedido") return <OrderClient />;
  if (path === "/mayoristas") return <WholesaleClient />;
  if (path === "/como-comprar") return <HowToBuyPage />;
  if (path === "/envios") return <ShippingPage />;
  if (path === "/preguntas-frecuentes") return <FaqPage />;
  if (path === "/contacto") return <ContactPage />;

  if (path.startsWith("/fragancia/")) {
    const product = getProduct(path.replace("/fragancia/", ""));
    if (product) return <ProductDetail product={product} />;
  }

  return <NotFound />;
}

function App() {
  return (
    <OrderProvider>
      <Header />
      <main id="contenido" className="min-h-screen">
        <Routes />
      </main>
      <Footer />
      <OrderBar />
    </OrderProvider>
  );
}

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);
