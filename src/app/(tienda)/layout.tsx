import type { ReactNode } from "react";
import { TiendaChrome } from "@/components/layout/TiendaChrome";

/**
 * LAYOUT DE LA TIENDA PÚBLICA
 *
 * El grupo (tienda) no cambia ninguna URL: /, /catalogo, /fragancia/[slug],
 * /asesor, /mi-pedido, /mayoristas y las páginas informativas siguen igual.
 * Separa la tienda del panel /admin, que tiene su propio layout.
 */
export default function TiendaLayout({ children }: { children: ReactNode }) {
  return <TiendaChrome>{children}</TiendaChrome>;
}
