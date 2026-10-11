import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { panelHabilitado } from "@/lib/admin/config";

/**
 * LAYOUT BASE DE /admin
 *
 * Todo el panel es dinámico (depende de la sesión): nada se prerenderiza en
 * el build, así que la compilación no necesita las variables de Supabase.
 * En producción el panel responde 404 hasta que NOX_ADMIN_HABILITADO = "true".
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "NOX Admin", template: "%s · NOX Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  if (!panelHabilitado()) notFound();
  return (
    // Layout propio: no incluye Header, Footer, OrderBar ni el pedido de la
    // tienda (viven en el grupo (tienda)), así que el panel no los descarga.
    <main id="contenido" data-nox-admin className="min-h-screen bg-void pb-20 pt-10 md:pt-14">
      <div className="nox-shell">{children}</div>
    </main>
  );
}
