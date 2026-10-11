import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import { cerrarSesion } from "@/app/admin/acciones";
import { Tarjeta, Titulo, claseBotonSecundario } from "@/components/admin/ui";

export const metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  const { admin, supabase } = await requerirAdmin();
  const factores = await supabase.auth.mfa.listFactors();
  const tieneTotp = Boolean(factores.data && factores.data.totp.length > 0);

  return (
    <div className="space-y-6">
      <Titulo eyebrow="Configuración">Tu cuenta</Titulo>

      <Tarjeta>
        <dl className="grid gap-4 text-[13px] sm:grid-cols-2">
          <div><dt className="text-mist">Nombre</dt><dd className="mt-1 text-bone">{admin.nombre}</dd></div>
          <div><dt className="text-mist">Email</dt><dd className="mt-1 text-bone">{admin.email ?? "—"}</dd></div>
          <div>
            <dt className="text-mist">Segundo factor (TOTP)</dt>
            <dd className="mt-1 text-bone">{tieneTotp ? "Vinculado" : "No vinculado"}</dd>
          </div>
          <div>
            <dt className="text-mist">Sesión actual</dt>
            <dd className="mt-1 text-bone">{admin.aal === "aal2" ? "Con segundo factor" : "Sólo contraseña"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-mist">Exigencia de MFA para tu usuario</dt>
            <dd className="mt-1 text-bone">
              {admin.mfaRequerido ? "Exigido" : "No exigido todavía (debe exigirse antes de habilitar producción)"}
            </dd>
          </div>
        </dl>
        {!tieneTotp ? (
          <div className="mt-5">
            <Link href="/admin/mfa" className={claseBotonSecundario}>Vincular segundo factor</Link>
          </div>
        ) : null}
      </Tarjeta>

      <Tarjeta>
        <form action={cerrarSesion}>
          <button type="submit" className={claseBotonSecundario}>Cerrar sesión</button>
        </form>
      </Tarjeta>
    </div>
  );
}
