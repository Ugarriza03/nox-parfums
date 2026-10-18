import type { ReactNode } from "react";
import { requerirAdmin } from "@/lib/admin/sesion";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

/**
 * Marco compartido de las secciones protegidas: menú lateral + contenido.
 * La verificación de acá es la primera; cada página y cada acción vuelven a
 * llamar a requerirAdmin() (los layouts no se re-ejecutan en cada navegación).
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { admin } = await requerirAdmin();
  return (
    <div className="lg:flex">
      <AdminSidebar
        usuario={{ nombre: admin.nombre, email: admin.email, mfaActivo: admin.aal === "aal2" }}
      />
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-8 sm:px-6 md:pt-10 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
