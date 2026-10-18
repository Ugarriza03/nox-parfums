import type { ReactNode } from "react";

/**
 * Marco de las pantallas de acceso (ingreso, segundo factor y sin acceso).
 * El grupo de rutas (acceso) no cambia las URLs: siguen siendo /admin/login,
 * /admin/mfa y /admin/sin-acceso.
 */
export default function AccesoLayout({ children }: { children: ReactNode }) {
  return <div className="nox-shell pb-20 pt-10 md:pt-14">{children}</div>;
}
