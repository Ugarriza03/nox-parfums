import { TiendaChrome } from "@/components/layout/TiendaChrome";
import { NoEncontrado } from "@/components/layout/NoEncontrado";

/**
 * 404 GLOBAL
 *
 * Se renderiza dentro del layout raíz (que ya no tiene el marco de la tienda),
 * así que suma TiendaChrome para conservar la presentación de siempre: Header,
 * contenido 404, Footer y OrderBar. Cubre URLs inexistentes y los notFound()
 * de /fragancia/[slug].
 */
export default function NotFound() {
  return (
    <TiendaChrome>
      <NoEncontrado />
    </TiendaChrome>
  );
}
