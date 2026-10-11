import { redirect } from "next/navigation";
import { obtenerAcceso } from "@/lib/admin/sesion";
import { FormularioLogin } from "@/components/admin/FormularioLogin";
import { Aviso, Tarjeta } from "@/components/admin/ui";

export const metadata = { title: "Ingresar" };

export default async function LoginPage() {
  const { acceso } = await obtenerAcceso();
  if (acceso.estado === "ok") redirect("/admin");
  if (acceso.estado === "requiere_mfa") redirect("/admin/mfa");
  if (acceso.estado === "sin_permiso") redirect("/admin/sin-acceso");

  return (
    <div className="mx-auto max-w-sm">
      <p className="text-[11px] uppercase tracking-widest text-mist">NOX Admin</p>
      <h1 className="mb-6 mt-2 font-display text-[32px] text-bone">Ingresar</h1>
      {acceso.estado === "no_configurado" ? (
        <Aviso>
          El panel no está configurado en este entorno: faltan las variables de conexión. La tienda no se ve
          afectada. Ver docs/NOX-ADMIN-PANEL.md.
        </Aviso>
      ) : (
        <Tarjeta>
          {acceso.estado === "error" ? (
            <div className="mb-4">
              <Aviso tono="error">{acceso.mensaje}</Aviso>
            </div>
          ) : null}
          <FormularioLogin />
        </Tarjeta>
      )}
    </div>
  );
}
