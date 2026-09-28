"use client";

/**
 * PORTADA DE PRODUCTO — punto único de decisión
 *
 *   producto con portada real  ->  <img> con la foto
 *   producto sin portada real  ->  FragranceVisual (composición generada)
 *
 * Todo el resto del frontend llama a este componente y no decide nada: ni la
 * card ni la ficha saben si están mostrando una foto o un render. Cuando llegue
 * el lote 02 alcanza con sumar los slugs en ./covers.ts.
 *
 * La foto ya trae incorporados el frasco, la ficha de notas y el packaging de
 * referencia, así que no se superpone nada generado encima.
 */

import { FragranceVisual, type VisualSize } from "./FragranceVisual";
import { coverFor } from "./covers";
import type { Product } from "@/data/types";

export function ProductCover({
  product,
  size = "card",
  priority = false
}: {
  product: Product;
  size?: VisualSize;
  priority?: boolean;
}) {
  const cover = coverFor(product);

  if (cover) {
    return (
      // El proyecto genera además un HTML standalone (npm run preview), donde
      // no hay servidor ni optimizador de imágenes: por eso <img> con ruta
      // estática y no next/image. El build del preview inlinea estas rutas.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cover}
        alt={`Extracto NOX ${product.inspiredLabel.toLowerCase()}`}
        width={1122}
        height={1402}
        className="h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return <FragranceVisual product={product} size={size} priority={priority} />;
}
