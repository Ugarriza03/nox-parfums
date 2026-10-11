import type { ReactNode } from "react";
import { requerirAdmin } from "@/lib/admin/sesion";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Marco de las secciones protegidas. La verificación de acá es la primera;
 * cada página y cada acción vuelven a llamar a requerirAdmin().
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { admin } = await requerirAdmin();
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b border-edge pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-mist">NOX Admin</p>
          <p className="mt-1 text-[13px] text-haze">
            {admin.nombre}
            <span className="ml-2 text-mist">· {admin.aal === "aal2" ? "sesión con segundo factor" : "sesión sin segundo factor"}</span>
          </p>
        </div>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
