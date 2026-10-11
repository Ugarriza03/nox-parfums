import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import { cerrarSesion } from "@/app/admin/acciones";
import { FormularioMfa } from "@/components/admin/FormularioMfa";
import { Aviso, Tarjeta } from "@/components/admin/ui";

export const metadata = { title: "Segundo factor" };

export default async function MfaPage() {
  const { admin, supabase } = await requerirAdmin({ permitirAal1: true });

  const factores = await supabase.auth.mfa.listFactors();
  const verificado = factores.data?.totp[0]?.id ?? null;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-mist">NOX Admin</p>
        <h1 className="mt-2 font-display text-[32px] text-bone">Segundo factor</h1>
      </div>

      {admin.aal === "aal2" ? (
        <Aviso tono="ok">
          Esta sesión ya está verificada con segundo factor. <Link href="/admin" className="underline underline-offset-4">Ir al panel</Link>
        </Aviso>
      ) : (
        <Tarjeta>
          <p className="mb-5 text-[13px] leading-relaxed text-haze">
            {verificado
              ? "Ingresá el código de tu app de autenticación para continuar."
              : admin.mfaRequerido
                ? "Tu usuario requiere un segundo factor. Vinculá una app de autenticación para continuar."
                : "Vinculá una app de autenticación. Será obligatoria antes de habilitar el panel en producción."}
          </p>
          <FormularioMfa factorVerificadoId={verificado} />
        </Tarjeta>
      )}

      <form action={cerrarSesion}>
        <button type="submit" className="text-[13px] text-mist hover:text-bone">Cerrar sesión</button>
      </form>
    </div>
  );
}
