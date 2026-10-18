import { redirect } from "next/navigation";
import { obtenerAcceso } from "@/lib/admin/sesion";
import { cerrarSesion } from "@/app/admin/acciones";
import { Aviso, claseBotonSecundario } from "@/components/admin/ui";

export const metadata = { title: "Sin acceso" };

export default async function SinAccesoPage() {
  const { acceso } = await obtenerAcceso();
  if (acceso.estado === "ok") redirect("/admin");
  if (acceso.estado !== "sin_permiso") redirect("/admin/login");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="font-display text-[32px] text-bone">Sin acceso</h1>
      <Aviso>
        La cuenta {acceso.email ?? ""} inició sesión, pero no está autorizada como administradora de NOX. El acceso lo
        otorga un administrador desde la base de datos; no se puede solicitar desde acá.
      </Aviso>
      <form action={cerrarSesion}>
        <button type="submit" className={claseBotonSecundario}>Cerrar sesión</button>
      </form>
    </div>
  );
}
