"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Chip, ButtonLink, IconArrow, Reveal } from "@/components/ui";
import { ProductCard } from "@/components/product/ProductCard";
import { DEFAULT_FILTERS, filterCatalog, type CatalogFilters } from "@/lib/catalog-query";
import { FAMILY_COUNTS, OCCASION_COUNTS, TOTAL_PRODUCTS } from "@/data/products";
import {
  FAMILY_LABELS,
  GENDER_LABELS,
  OCCASION_LABELS,
  UNIVERSE_LABELS,
  type Family,
  type Gender,
  type Occasion,
  type Universe
} from "@/data/types";

const UNIVERSES: (Universe | "todos")[] = ["todos", "disenador", "nicho", "arabe"];
const GENDERS: (Gender | "todos")[] = ["todos", "masculino", "femenino", "unisex"];

export function CatalogClient() {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [visible, setVisible] = useState(24);

  // Lectura de parámetros de entrada (?universo= / ?perfil=) sin depender de
  // useSearchParams, para que la página se pueda prerenderizar sin Suspense.
  useEffect(() => {
    // Soporta ?universo= tanto en la query normal como detrás del hash,
    // para que los enlaces funcionen igual en el sitio y en el preview estático.
    const hashQuery = window.location.hash.includes("?")
      ? window.location.hash.slice(window.location.hash.indexOf("?"))
      : "";
    const params = new URLSearchParams(window.location.search || hashQuery);
    const universo = params.get("universo") as Universe | null;
    const perfil = params.get("perfil") as Gender | null;
    const q = params.get("q");

    setFilters((current) => ({
      ...current,
      universe: universo && UNIVERSES.includes(universo) ? universo : current.universe,
      gender: perfil && GENDERS.includes(perfil) ? perfil : current.gender,
      query: q ?? current.query
    }));
  }, []);

  const results = useMemo(() => filterCatalog(filters), [filters]);

  useEffect(() => setVisible(24), [filters]);

  const update = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const isFiltered =
    filters.query !== "" ||
    filters.universe !== "todos" ||
    filters.gender !== "todos" ||
    filters.family !== "todas" ||
    filters.occasion !== "todas" ||
    filters.onlyVerified;

  const families = (Object.keys(FAMILY_COUNTS) as Family[]).sort((a, b) =>
    FAMILY_LABELS[a].localeCompare(FAMILY_LABELS[b], "es")
  );
  const occasions = (Object.keys(OCCASION_COUNTS) as Occasion[]).sort((a, b) =>
    OCCASION_LABELS[a].localeCompare(OCCASION_LABELS[b], "es")
  );

  return (
    <>
      {/* -------------------------------------------------------- encabezado */}
      <section className="border-b border-edge/50 pt-28 md:pt-36">
        <div className="nox-shell pb-8 md:pb-10">
          <p className="nox-eyebrow">Catálogo</p>
          <h1 className="mt-4 max-w-2xl font-display text-[34px] leading-[1.08] text-bone md:text-[54px]">
            {TOTAL_PRODUCTS} fragancias para recorrer
          </h1>
          <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-mist">
            Buscá por nombre, por casa o directamente por una nota que te guste. Si preferís que
            te guiemos,{" "}
            <Link href="/asesor" className="text-haze underline underline-offset-4 hover:text-bone">
              empezá por el asesor
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- filtros */}
      <div className="sticky top-16 z-30 border-b border-edge/50 bg-void/92 backdrop-blur-xl md:top-20">
        <div className="nox-shell py-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist"
                aria-hidden="true"
              >
                <circle cx="6.6" cy="6.6" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path d="m10.2 10.2 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={filters.query}
                onChange={(e) => update("query", e.target.value)}
                placeholder="Buscar fragancia, casa o nota…"
                aria-label="Buscar en el catálogo"
                className="h-12 w-full rounded-full border border-edge bg-ink/60 pl-11 pr-4 text-[14px] text-bone placeholder:text-mist/70 transition-colors focus:border-mist focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`inline-flex h-12 shrink-0 items-center gap-2 rounded-full border px-4 text-[11px] uppercase tracking-[0.12em] transition-colors ${
                showAdvanced ? "border-bone text-bone" : "border-edge text-mist hover:text-bone"
              }`}
              aria-expanded={showAdvanced}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M2 4h10M4 7h6M6 10h2"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="hidden sm:inline">Más filtros</span>
            </button>
          </div>

          <div className="nox-scroll-x -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
            {UNIVERSES.map((universe) => (
              <Chip
                key={universe}
                active={filters.universe === universe}
                onClick={() => update("universe", universe)}
              >
                {universe === "todos" ? "Todos los universos" : UNIVERSE_LABELS[universe as Universe]}
              </Chip>
            ))}
            <span className="mx-1 hidden w-px shrink-0 self-stretch bg-edge/60 md:block" aria-hidden="true" />
            {GENDERS.map((gender) => (
              <Chip
                key={gender}
                active={filters.gender === gender}
                onClick={() => update("gender", gender)}
              >
                {gender === "todos" ? "Todos los perfiles" : GENDER_LABELS[gender as Gender]}
              </Chip>
            ))}
          </div>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 gap-5 border-t border-edge/50 pt-4 md:grid-cols-3">
              <Field label="Familia olfativa">
                <select
                  value={filters.family}
                  onChange={(e) => update("family", e.target.value as CatalogFilters["family"])}
                  className="h-11 w-full rounded-lg border border-edge bg-ink px-3 text-[13px] text-bone focus:border-mist focus:outline-none"
                >
                  <option value="todas">Todas</option>
                  {families.map((family) => (
                    <option key={family} value={family}>
                      {FAMILY_LABELS[family]} ({FAMILY_COUNTS[family]})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Ocasión">
                <select
                  value={filters.occasion}
                  onChange={(e) => update("occasion", e.target.value as CatalogFilters["occasion"])}
                  className="h-11 w-full rounded-lg border border-edge bg-ink px-3 text-[13px] text-bone focus:border-mist focus:outline-none"
                >
                  <option value="todas">Todas</option>
                  {occasions.map((occasion) => (
                    <option key={occasion} value={occasion}>
                      {OCCASION_LABELS[occasion]} ({OCCASION_COUNTS[occasion]})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Orden">
                <select
                  value={filters.sort}
                  onChange={(e) => update("sort", e.target.value as CatalogFilters["sort"])}
                  className="h-11 w-full rounded-lg border border-edge bg-ink px-3 text-[13px] text-bone focus:border-mist focus:outline-none"
                >
                  <option value="relevancia">Relevancia</option>
                  <option value="casa">Por casa</option>
                  <option value="verificados">Con ficha completa primero</option>
                </select>
              </Field>

              <label className="flex cursor-pointer items-center gap-3 md:col-span-3">
                <input
                  type="checkbox"
                  checked={filters.onlyVerified}
                  onChange={(e) => update("onlyVerified", e.target.checked)}
                  className="h-4 w-4 accent-bone"
                />
                <span className="text-[13px] text-mist">
                  Mostrar sólo las que ya tienen ficha olfativa completa
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------- resultados */}
      <section className="py-10 md:py-14">
        <div className="nox-shell">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="text-[12px] tracking-[0.04em] text-mist">
              {results.length === 0
                ? "Sin resultados"
                : `${results.length} ${results.length === 1 ? "fragancia" : "fragancias"}`}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-[12px] text-haze underline underline-offset-4 transition-colors hover:text-bone"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <EmptyState query={filters.query} onReset={() => setFilters(DEFAULT_FILTERS)} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
                {results.slice(0, visible).map((product, index) => (
                  <ProductCard key={product.slug} product={product} index={index} />
                ))}
              </div>

              {visible < results.length && (
                <div className="mt-14 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + 24)}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-edge px-7 text-[11px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-mist"
                  >
                    Ver más ({results.length - visible} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="nox-eyebrow mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <Reveal>
      <div className="flex flex-col items-center rounded-2xl border border-edge/60 px-6 py-16 text-center">
        <p className="font-display text-[24px] text-bone md:text-[30px]">
          No encontramos nada con eso
        </p>
        <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-mist">
          {query
            ? `Probá con otro nombre, o contanos qué buscás y lo vemos juntos.`
            : "Probá aflojando algún filtro."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-12 items-center justify-center rounded-full border border-edge px-6 text-[11px] uppercase tracking-[0.14em] text-bone transition-colors hover:border-mist"
          >
            Limpiar filtros
          </button>
          <ButtonLink href="/asesor" size="md">
            Usar el asesor <IconArrow />
          </ButtonLink>
        </div>
      </div>
    </Reveal>
  );
}
