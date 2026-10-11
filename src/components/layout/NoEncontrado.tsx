import Link from "next/link";
import { NoxMark } from "@/components/ui";

/**
 * Contenido de la página 404 (sin marco). Lo usan la 404 global
 * ((tienda)/not-found.tsx, dentro del marco de la tienda) y el preview estático.
 */
export function NoEncontrado() {
  return (
    <section className="flex min-h-[70vh] items-center pt-24">
      <div className="nox-shell">
        <div className="mx-auto max-w-lg text-center">
          <div className="flex justify-center opacity-60">
            <NoxMark size={56} />
          </div>
          <p className="nox-eyebrow mt-8">Error 404</p>
          <h1 className="mt-4 font-display text-[32px] leading-[1.1] text-bone md:text-[44px]">
            Esta página no existe
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-mist">
            Puede que el enlace esté viejo o que la fragancia haya cambiado de nombre.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/catalogo"
              className="inline-flex h-12 items-center justify-center rounded-full bg-bone px-7 text-[11px] uppercase tracking-[0.14em] text-void transition-colors hover:bg-white"
            >
              Ver catálogo
            </Link>
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
