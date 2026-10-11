import Link from "next/link";

/**
 * 404 RAÍZ — neutral, sin el marco de la tienda.
 *
 * Next la incluye en todas las rutas (también en /admin), así que NO puede
 * importar componentes de la tienda: si lo hiciera, el JavaScript del pedido
 * y del catálogo se descargaría en el panel. Sólo la alcanzan los notFound()
 * de /admin; la tienda usa (tienda)/not-found.tsx.
 */
export default function NotFound() {
  return (
    <main id="contenido" className="flex min-h-screen items-center bg-void">
      <div className="nox-shell">
        <div className="mx-auto max-w-lg text-center">
          <p className="nox-eyebrow">Error 404</p>
          <h1 className="mt-4 font-display text-[32px] leading-[1.1] text-bone md:text-[44px]">Esta página no existe</h1>
          <div className="mt-9 flex justify-center">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-edge px-7 text-[11px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-mist"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
