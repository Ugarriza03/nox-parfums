"use client";

import { useActionState, useState, useTransition } from "react";
import { prepararMfa, verificarMfa, type EstadoFormulario, type PreparacionMfa } from "@/app/admin/acciones";
import { Aviso, claseBoton, claseBotonSecundario, claseCampo } from "./ui";

const INICIAL: EstadoFormulario = { ok: false, mensaje: null };

function srcQr(qr: string): string {
  return qr.startsWith("data:") ? qr : `data:image/svg+xml;utf-8,${encodeURIComponent(qr)}`;
}

function FormularioCodigo({ factorId }: { factorId: string }) {
  const [estado, accion, pendiente] = useActionState(verificarMfa, INICIAL);
  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="factorId" value={factorId} />
      <div>
        <label htmlFor="codigo" className="mb-1.5 block text-[12px] text-mist">Código de 6 dígitos de tu app de autenticación</label>
        <input
          id="codigo"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          className={`${claseCampo} max-w-[200px] tracking-widest`}
        />
      </div>
      {estado.mensaje ? <Aviso tono="error">{estado.mensaje}</Aviso> : null}
      <button type="submit" disabled={pendiente} className={claseBoton}>
        {pendiente ? "Verificando…" : "Verificar"}
      </button>
    </form>
  );
}

/** Con un factor ya vinculado: sólo pide el código. Sin factor: guía la vinculación. */
export function FormularioMfa({ factorVerificadoId }: { factorVerificadoId: string | null }) {
  const [preparacion, setPreparacion] = useState<PreparacionMfa | null>(null);
  const [pendiente, iniciar] = useTransition();

  if (factorVerificadoId) return <FormularioCodigo factorId={factorVerificadoId} />;

  if (preparacion?.ok) {
    return (
      <div className="space-y-5">
        <ol className="list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-haze">
          <li>Abrí tu app de autenticación (Google Authenticator, 1Password, Authy u otra).</li>
          <li>Escaneá el código QR o cargá la clave manualmente.</li>
          <li>Ingresá el código de 6 dígitos que muestra la app.</li>
        </ol>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={srcQr(preparacion.qr)} alt="Código QR para vincular la app de autenticación" width={180} height={180} className="rounded-xl bg-white p-3" />
        <details className="text-[12px] text-mist">
          <summary className="cursor-pointer">No puedo escanear el código</summary>
          <p className="mt-2 break-all font-mono text-bone">{preparacion.secreto}</p>
        </details>
        <FormularioCodigo factorId={preparacion.factorId} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {preparacion && !preparacion.ok ? <Aviso tono="error">{preparacion.mensaje}</Aviso> : null}
      <button
        type="button"
        disabled={pendiente}
        className={claseBotonSecundario}
        onClick={() => iniciar(async () => setPreparacion(await prepararMfa()))}
      >
        {pendiente ? "Preparando…" : "Vincular app de autenticación"}
      </button>
    </div>
  );
}
