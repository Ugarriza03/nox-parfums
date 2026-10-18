/**
 * ICONOS DE NOX ADMIN — trazo fino (1.5), 20×20, color heredado.
 * Decorativos: siempre aria-hidden; el texto del enlace da el nombre accesible.
 */
import type { SVGProps } from "react";

function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconoResumen = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><rect x="3" y="3" width="6" height="6" rx="1.2" /><rect x="11" y="3" width="6" height="6" rx="1.2" /><rect x="3" y="11" width="6" height="6" rx="1.2" /><rect x="11" y="11" width="6" height="6" rx="1.2" /></Base>
);
export const IconoCatalogo = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M8 2.5h4M8.5 2.5v2.2M11.5 2.5v2.2" /><rect x="5" y="4.7" width="10" height="12.8" rx="2.5" /><path d="M8 10.5h4" /></Base>
);
export const IconoInventario = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M3 6.5 10 3l7 3.5v7L10 17l-7-3.5z" /><path d="M3 6.5 10 10l7-3.5M10 10v7" /></Base>
);
export const IconoActividad = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M2.5 10h3l2-5 3 10 2-5h5" /></Base>
);
export const IconoConfiguracion = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><circle cx="10" cy="10" r="2.5" /><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" /></Base>
);
export const IconoSalir = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M8 3.5H5a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 5 16.5h3" /><path d="M12.5 13.5 16 10l-3.5-3.5M16 10H8" /></Base>
);
export const IconoMenu = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M3.5 6h13M3.5 10h13M3.5 14h13" /></Base>
);
export const IconoCerrar = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M5 5l10 10M15 5 5 15" /></Base>
);
export const IconoContraer = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><rect x="3" y="3.5" width="14" height="13" rx="2" /><path d="M8 3.5v13M13 8l-2 2 2 2" /></Base>
);
export const IconoExpandir = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><rect x="3" y="3.5" width="14" height="13" rx="2" /><path d="M8 3.5v13M11 8l2 2-2 2" /></Base>
);
export const IconoEscudo = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M10 2.5 4 5v4.5c0 3.6 2.6 6.5 6 8 3.4-1.5 6-4.4 6-8V5z" /><path d="m7.5 10 1.8 1.8L12.8 8.3" /></Base>
);
