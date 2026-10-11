import { NoEncontrado } from "@/components/layout/NoEncontrado";

/**
 * 404 DE LA TIENDA
 *
 * Es la 404 del layout raíz de la tienda ((tienda)/layout.tsx), así que se
 * muestra con Header, Footer, OrderBar y el pedido sin importarlos acá.
 * Cubre:
 *   · URLs inexistentes (las atrapa [...noEncontrada] y llama a notFound())
 *   · fichas inexistentes (/fragancia/[slug] llama a notFound())
 *   · /admin en producción sin habilitar (el proxy reescribe a una URL
 *     inexistente)
 *
 * /admin tiene su propio layout raíz y no incluye este archivo.
 */
export default function NotFoundTienda() {
  return <NoEncontrado />;
}
