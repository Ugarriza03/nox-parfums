import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { panelHabilitado } from "@/lib/admin/config";
import { Documento } from "@/components/documento/Documento";

/**
 * LAYOUT RAÍZ DE /admin
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

export const viewport: Viewport = {
  themeColor: "#050609",
  width: "device-width",
  initialScale: 1
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Primera barrera: en producción sin habilitar, el proxy ya responde la 404
  // de la tienda antes de llegar acá. Si no corriera, esto responde 404 sin
  // ningún contenido del panel.
  if (!panelHabilitado()) notFound();
  return (
    // Layout RAÍZ propio: no comparte layout con la tienda, así que el panel
    // no descarga Header, Footer, OrderBar, el pedido ni el catálogo.
    <Documento>
      <main id="contenido" data-nox-admin className="min-h-screen bg-void pb-20 pt-10 md:pt-14">
        <div className="nox-shell">{children}</div>
      </main>
    </Documento>
  );
}
