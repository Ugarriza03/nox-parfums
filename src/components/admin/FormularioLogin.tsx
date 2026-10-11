"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoFormulario } from "@/app/admin/acciones";
import { Aviso, claseBoton, claseCampo } from "./ui";

const INICIAL: EstadoFormulario = { ok: false, mensaje: null };

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, INICIAL);
  return (
    <form action={accion} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[12px] text-mist">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={claseCampo} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[12px] text-mist">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className={claseCampo}
        />
      </div>
      {estado.mensaje ? <Aviso tono="error">{estado.mensaje}</Aviso> : null}
      <button type="submit" disabled={pendiente} className={`${claseBoton} w-full`}>
        {pendiente ? "Verificando…" : "Ingresar"}
      </button>
    </form>
  );
}
