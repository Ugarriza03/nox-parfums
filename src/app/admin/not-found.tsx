import Link from "next/link";

/**
 * 404 DEL PANEL — neutral, sin nada de la tienda.
 *
 * Es la 404 del layout raíz de /admin: la usan los notFound() de las páginas
 * del panel (por ejemplo, una fragancia inexistente en el detalle de stock).
 * Se muestra dentro del layout del panel, para administradores.
 */
export default function NotFound() {
  return (
    <section data-nox-404="panel" className="flex min-h-[60vh] items-center">
      <div className="nox-shell w-full">
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
    </section>
  );
}
