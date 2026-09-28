"use client";

import Link from "next/link";
import { ProductCover } from "./ProductCover";
import { AddedFlash, OrderControl } from "@/components/order/OrderControl";
import { useOrder } from "@/store/order";
import { RETAIL_BUNDLES, formatARS } from "@/config/pricing";
import { GENDER_LABELS, UNIVERSE_LABELS, type Product } from "@/data/types";

/**
 * Card de catálogo.
 *
 * La portada manda: ocupa la mayor parte de la card, con relación 4:5 fija en
 * toda la grilla para que las filas queden parejas. Debajo, la jerarquía es
 *
 *   marca (chico)  →  NOMBRE (grande)  →  género · universo  →  precio  →  acciones
 *
 * El "60 ml" no se repite en cada card: vive en la ficha y en el pie del sitio.
 * El precio mostrado es el de una unidad, leído de la única fuente de verdad.
 */

/** Precio de una unidad. Se lee de pricing, nunca se calcula acá. */
const PRECIO_UNITARIO = RETAIL_BUNDLES[0].total;

export function ProductCard({
  product,
  index = 0,
  showUniverse = true
}: {
  product: Product;
  index?: number;
  /**
   * El universo se muestra en la grilla del catálogo, donde ordena la lectura.
   * En las relacionadas de una ficha se oculta: ahí el universo que importa es
   * el del producto que se está mirando, y mezclarlos confunde.
   */
  showUniverse?: boolean;
}) {
  const { quantityOf } = useOrder();
  const inOrder = quantityOf(product.slug);

  const resumen = product.olfactory
    ? product.olfactory.mainNotes.slice(0, 3).join(" · ")
    : "Información olfativa en verificación";

  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/fragancia/${product.slug}`}
        className="relative block overflow-hidden rounded-[18px] border border-edge/60 bg-void transition-all duration-500 ease-nox group-hover:border-mist/55 group-hover:shadow-[0_18px_46px_-24px_rgba(0,0,0,0.9)]"
        aria-label={`Ver ${product.inspiredLabel}`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <div className="h-full w-full transition-transform duration-[1100ms] ease-nox group-hover:scale-[1.05]">
            <ProductCover product={product} size="card" priority={index < 4} />
          </div>

          {/* Marco interior: da borde al objeto sin encerrar la escena */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[18px]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(236,234,229,0.07)" }}
            aria-hidden="true"
          />

          {/* Universo, sobre la portada: libera el bloque de texto */}
          {showUniverse && product.universe !== "pendiente" && (
            <span className="absolute left-3 top-3 rounded-full border border-bone/20 bg-void/55 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-bone/75 backdrop-blur-sm">
              {UNIVERSE_LABELS[product.universe]}
            </span>
          )}

          {/* Velo inferior: apoya la lectura y ancla la portada a la card */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%]"
            style={{ background: "linear-gradient(180deg, transparent, rgba(5,6,10,0.72))" }}
            aria-hidden="true"
          />

          {/* Aparece al pasar el mouse; en touch la card entera ya es el link */}
          <span className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-1.5 items-center justify-center rounded-full border border-bone/25 bg-void/70 py-2 text-[10px] uppercase tracking-[0.18em] text-bone opacity-0 backdrop-blur-sm transition-all duration-500 ease-nox group-hover:translate-y-0 group-hover:opacity-100 md:flex">
            Ver fragancia
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-0.5 pt-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-mist">{product.house}</p>

        <h3 className="mt-1.5">
          <Link
            href={`/fragancia/${product.slug}`}
            className="font-display text-[19px] leading-[1.12] text-bone transition-colors hover:text-white md:text-[22px]"
          >
            {product.inspiredBy}
          </Link>
        </h3>

        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-mist/70">
          {GENDER_LABELS[product.gender]}
        </p>

        <p className="mt-2 text-[12px] leading-relaxed text-mist">{resumen}</p>

        <p className="mt-3 text-[15px] text-bone">{formatARS(PRECIO_UNITARIO)}</p>

        {/* Pie: edición rápida sin salir del catálogo.
            Alto fijo para que agregar no mueva la grilla. */}
        <div className="mt-3 flex h-10 items-center justify-between gap-2">
          {inOrder === 0 ? (
            <>
              <Link
                href={`/fragancia/${product.slug}`}
                className="text-[10px] uppercase tracking-[0.16em] text-mist/70 underline-offset-4 transition-colors hover:text-bone hover:underline"
              >
                Ver fragancia
              </Link>
              <OrderControl product={product} variant="card" />
            </>
          ) : (
            <>
              <OrderControl product={product} variant="card" className="flex-1" />
              <span className="hidden sm:block">
                <AddedFlash product={product} />
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.slug} product={product} index={index} />
      ))}
    </div>
  );
}
