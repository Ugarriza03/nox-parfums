"use client";

/**
 * Registro de un movimiento de stock propio.
 *
 * El request_id se genera en el navegador y se conserva hasta que la
 * operación se confirma: un doble clic o un reintento después de un corte de
 * red envían el MISMO id y la base no duplica el movimiento. El servidor y la
 * base vuelven a validar todo.
 */

import { useActionState, useEffect, useState } from "react";
import { registrarMovimiento, type EstadoFormulario } from "@/app/admin/acciones";
import { ETIQUETA_TIPO, type TipoMovimiento } from "@/lib/admin/inventario-reglas";
import { Aviso, claseBoton, claseCampo } from "./ui";

const INICIAL: EstadoFormulario = { ok: false, mensaje: null };

const AYUDA: Record<TipoMovimiento, string> = {
  carga_inicial:
    "Primer registro del stock propio de esta fragancia. Ingresá la cantidad realmente contada (puede ser 0) y de dónde sale.",
  ingreso: "Unidades que entran al stock propio (por ejemplo, reposición desde el depósito).",
  egreso: "Unidades que salen del stock propio, por ejemplo una venta confirmada por WhatsApp.",
  ajuste: "Corrección por recuento: ingresá el stock REAL contado. El sistema registra la diferencia."
};

function nuevoId(): string {
  return crypto.randomUUID();
}

export function FormularioMovimiento({
  slug,
  tipos,
  stockActual
}: {
  slug: string;
  tipos: readonly TipoMovimiento[];
  stockActual: number | null;
}) {
  const [estado, accion, pendiente] = useActionState(registrarMovimiento, INICIAL);
  const [requestId, setRequestId] = useState<string>("");
  const [tipo, setTipo] = useState<TipoMovimiento>(tipos[0]);
  const [formKey, setFormKey] = useState(0);

  // El id se crea en el navegador (no en el render del servidor) para no
  // provocar diferencias de hidratación.
  useEffect(() => {
    setRequestId(nuevoId());
  }, []);

  // Confirmado el movimiento: id nuevo y formulario limpio para el siguiente.
  useEffect(() => {
    if (estado.ok) {
      setRequestId(nuevoId());
      setFormKey((k) => k + 1);
    }
  }, [estado]);

  const motivoObligatorio = tipo === "ajuste" || tipo === "carga_inicial";

  return (
    <form key={formKey} action={accion} className="space-y-4">
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="productSlug" value={slug} />

      {tipos.length > 1 ? (
        <fieldset>
          <legend className="mb-2 text-[12px] text-mist">Tipo de movimiento</legend>
          <div className="flex flex-wrap gap-2">
            {tipos.map((t) => (
              <label
                key={t}
                className={`cursor-pointer rounded-full border px-4 py-2 text-[13px] transition ${
                  tipo === t ? "border-bone bg-bone text-void" : "border-edge text-haze hover:border-mist"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={t}
                  checked={tipo === t}
                  onChange={() => setTipo(t)}
                  className="sr-only"
                />
                {ETIQUETA_TIPO[t]}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <input type="hidden" name="tipo" value={tipos[0]} />
      )}

      <p className="text-[13px] leading-relaxed text-mist">{AYUDA[tipo]}</p>

      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <div>
          <label htmlFor={`cantidad-${slug}`} className="mb-1.5 block text-[12px] text-mist">
            {tipo === "ajuste" ? "Stock real contado" : "Cantidad"}
          </label>
          <input
            id={`cantidad-${slug}`}
            name="cantidad"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            autoComplete="off"
            className={claseCampo}
          />
          {estado.errores?.cantidad ? <p className="mt-1 text-[12px] text-haze">{estado.errores.cantidad}</p> : null}
        </div>
        <div>
          <label htmlFor={`motivo-${slug}`} className="mb-1.5 block text-[12px] text-mist">
            Motivo u observación{motivoObligatorio ? " (obligatorio)" : " (opcional)"}
          </label>
          <input
            id={`motivo-${slug}`}
            name="motivo"
            maxLength={500}
            required={motivoObligatorio}
            autoComplete="off"
            className={claseCampo}
          />
          {estado.errores?.motivo ? <p className="mt-1 text-[12px] text-haze">{estado.errores.motivo}</p> : null}
        </div>
      </div>

      {tipo === "egreso" && stockActual !== null ? (
        <p className="text-[12px] text-mist">Stock propio actual: {stockActual}. No se puede descontar más que eso.</p>
      ) : null}

      {estado.mensaje ? <Aviso tono={estado.ok ? "ok" : "error"}>{estado.mensaje}</Aviso> : null}

      <button type="submit" disabled={pendiente || !requestId} className={claseBoton}>
        {pendiente ? "Registrando…" : `Registrar ${ETIQUETA_TIPO[tipo].toLowerCase()}`}
      </button>
    </form>
  );
}
