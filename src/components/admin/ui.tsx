/**
 * PIEZAS VISUALES DE NOX ADMIN — sin estado, aptas para Server Components.
 * Paleta de la marca (void, ink, graphite, edge, mist, bone) con el acento
 * frío `steel` en dosis mínimas. Sin dorados.
 */

import type { ReactNode } from "react";
import { ETIQUETA_ESTADO, ETIQUETA_TIPO, type EstadoStock, type TipoMovimiento } from "@/lib/admin/inventario-reglas";

const FORMATO_FECHA = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires"
});

export function fecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : FORMATO_FECHA.format(d);
}

export function Titulo({ eyebrow, children, descripcion }: { eyebrow?: string; children: ReactNode; descripcion?: ReactNode }) {
  return (
    <header className="mb-8">
      {eyebrow ? <p className="text-[11px] uppercase tracking-widest text-mist">{eyebrow}</p> : null}
      <h1 className="mt-2 font-display text-[30px] leading-tight text-bone md:text-[38px]">{children}</h1>
      {descripcion ? <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-mist">{descripcion}</p> : null}
    </header>
  );
}

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-edge bg-ink p-5 md:p-6 ${className}`}>{children}</section>;
}

export function Indicador({ etiqueta, valor, nota }: { etiqueta: string; valor: ReactNode; nota?: string }) {
  return (
    <div className="rounded-2xl border border-edge bg-ink p-5">
      <p className="text-[12px] text-mist">{etiqueta}</p>
      <p className="mt-2 font-display text-[34px] leading-none text-bone">{valor}</p>
      {nota ? <p className="mt-2 text-[12px] leading-snug text-mist">{nota}</p> : null}
    </div>
  );
}

const ESTILO_ESTADO: Record<EstadoStock, string> = {
  sin_registro: "border-edge text-mist",
  sin_stock: "border-haze/40 text-haze",
  stock_bajo: "border-steel/60 text-steel",
  con_stock: "border-bone/40 text-bone"
};

export function ChipEstado({ estado }: { estado: EstadoStock }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] ${ESTILO_ESTADO[estado]}`}>
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}

export function ChipTipo({ tipo }: { tipo: TipoMovimiento }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full border border-edge px-2.5 py-0.5 text-[11px] text-haze">
      {ETIQUETA_TIPO[tipo]}
    </span>
  );
}

export function Aviso({ tono = "info", children }: { tono?: "info" | "error" | "ok"; children: ReactNode }) {
  const estilo =
    tono === "error"
      ? "border-haze/50 bg-graphite text-bone"
      : tono === "ok"
        ? "border-steel/50 bg-midnight text-bone"
        : "border-edge bg-ink text-haze";
  return (
    <div role={tono === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${estilo}`}>
      {children}
    </div>
  );
}

/** Contenedor de tablas con scroll horizontal propio (sin desbordar la página en celular). */
export function TablaContenedor({ children }: { children: ReactNode }) {
  return <div className="-mx-1 overflow-x-auto rounded-2xl border border-edge bg-ink">{children}</div>;
}

export const claseTabla = "w-full min-w-[720px] border-collapse text-left text-[13px]";
export const claseTh = "border-b border-edge px-4 py-3 text-[11px] font-normal uppercase tracking-wider text-mist";
export const claseTd = "border-b border-edge/60 px-4 py-3 align-top text-haze";
export const claseCampo =
  "w-full rounded-xl border border-edge bg-void px-3 py-2.5 text-[14px] normal-case tracking-normal text-bone placeholder:text-mist/70 focus:border-steel focus:outline-none focus-visible:ring-2 focus-visible:ring-steel/40 disabled:opacity-70";
export const claseBoton =
  "inline-flex items-center justify-center rounded-full bg-bone px-5 py-2.5 text-[13px] font-medium text-void transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";
export const claseBotonSecundario =
  "inline-flex items-center justify-center rounded-full border border-edge px-5 py-2.5 text-[13px] text-bone transition hover:border-mist";

/* ------------------------------------------------------------ catálogo V2 */

const ESTILO_ESTADO_CATALOGO: Record<string, string> = {
  draft: "border-edge text-haze",
  published: "border-bone/40 text-bone",
  hidden: "border-steel/50 text-steel",
  archived: "border-edge text-mist"
};
const ETIQUETA_ESTADO_CATALOGO_UI: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  hidden: "Oculta",
  archived: "Archivada"
};

export function ChipEstadoCatalogo({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] ${ESTILO_ESTADO_CATALOGO[estado] ?? "border-edge text-mist"}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${estado === "published" ? "bg-bone" : estado === "hidden" ? "bg-steel" : "bg-mist/60"}`} />
      {ETIQUETA_ESTADO_CATALOGO_UI[estado] ?? "Desconocido"}
    </span>
  );
}

export function ChipRevision() {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full border border-steel/40 px-2.5 py-0.5 text-[11px] text-steel">
      Revisión pendiente
    </span>
  );
}

/** Encabezado de sección dentro de una tarjeta. */
export function Subtitulo({ children, descripcion, id }: { children: ReactNode; descripcion?: ReactNode; id?: string }) {
  return (
    <div className="mb-5">
      <h2 id={id} className="text-[16px] text-bone">{children}</h2>
      {descripcion ? <p className="mt-1.5 text-[13px] leading-relaxed text-mist">{descripcion}</p> : null}
    </div>
  );
}

export const claseEtiqueta = "grid gap-1.5 text-[12px] uppercase tracking-wider text-mist";
export const claseAyuda = "text-[12px] normal-case tracking-normal text-mist/90";
export const claseError = "rounded-xl border border-haze/50 bg-graphite px-4 py-3 text-[13px] text-bone";
export const claseOk = "rounded-xl border border-steel/50 bg-midnight px-4 py-3 text-[13px] text-bone";
