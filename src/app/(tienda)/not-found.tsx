import { NoEncontrado } from "@/components/layout/NoEncontrado";

/**
 * 404 DE LA TIENDA
 *
 * Se muestra dentro del layout de (tienda), así que conserva Header, Footer,
 * OrderBar y el pedido sin importarlos acá. Cubre:
 *   · URLs inexistentes (las atrapa [...noEncontrada] y llama a notFound())
 *   · fichas inexistentes (/fragancia/[slug] llama a notFound())
 *
 * Vive en el grupo (tienda) y no en la raíz a propósito: Next incluye el
 * not-found de un segmento en TODAS las páginas que cuelgan de él. En la raíz
 * metía el marco de la tienda (y el pedido, nox.pedido.v1) en /admin.
 */
export default function NotFoundTienda() {
  return <NoEncontrado />;
}
