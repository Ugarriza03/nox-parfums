"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publicarRevision } from "@/app/admin/(panel)/catalogo/[slug]/revision-acciones";
import { descartarRevision } from "@/app/admin/(panel)/catalogo/[slug]/descartar-revision-acciones";
import { claseBoton, claseBotonSecundario, claseError, claseOk } from "./ui";

type Accion = "aprobar" | "descartar";

/**
 * Aprobar o descartar la revisión pendiente, con confirmación.
 * `puedeAprobar` es falso si la ficha ya no está publicada (la base lo
 * rechazaría). `descarteDisponible` es falso si la migración de descarte no
 * está aplicada: el botón queda deshabilitado con el motivo, sin alternativas.
 */
export function AccionesRevision({ slug, puedeAprobar, descarteDisponible }: {
  slug: string;
  puedeAprobar: boolean;
  descarteDisponible: boolean;
}) {
  const router = useRouter();
  const [accion, setAccion] = useState<Accion | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function confirmar() {
    if (!accion || ocupado) return;
    setOcupado(true);
    setMensaje(null);
    try {
      const r = accion === "aprobar" ? await publicarRevision(slug) : await descartarRevision(slug);
      if (!r.ok) { setMensaje({ ok: false, texto: r.error }); return; }
      setMensaje({ ok: true, texto: accion === "aprobar" ? "Revisión aprobada y aplicada a la ficha." : "Revisión descartada. La ficha no cambió." });
      setAccion(null);
      router.refresh();
    } catch {
      setMensaje({ ok: false, texto: "No se pudo completar la acción. Intentá nuevamente." });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => { setAccion("aprobar"); setMensaje(null); }} disabled={ocupado || !puedeAprobar}
          className={`${claseBoton}`} aria-pressed={accion === "aprobar"}>
          Aprobar y aplicar
        </button>
        <button type="button" onClick={() => { setAccion("descartar"); setMensaje(null); }} disabled={ocupado || !descarteDisponible}
          className={`${claseBotonSecundario} disabled:cursor-not-allowed disabled:opacity-50`} aria-pressed={accion === "descartar"}>
          Descartar revisión
        </button>
      </div>
      {!puedeAprobar ? <p className="text-[12.5px] text-mist">Sólo se aprueban revisiones de fichas publicadas.</p> : null}
      {!descarteDisponible ? (
        <p className="text-[12.5px] text-mist">
          Descartar está bloqueado: falta aplicar la migración <code className="font-mono">20261012270000_descartar_revision</code> en esta base.
        </p>
      ) : null}
      {accion ? (
        <div className="space-y-3 rounded-xl border border-edge bg-void p-4" role="region" aria-label="Confirmar acción sobre la revisión">
          <p className="text-[13px] leading-relaxed text-haze">
            {accion === "aprobar"
              ? "Los cambios propuestos reemplazan a la ficha actual. Queda registrado en la auditoría."
              : "Se descartan los cambios propuestos. La ficha actual queda igual y el descarte se registra en la auditoría."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={confirmar} disabled={ocupado} className={claseBoton} aria-busy={ocupado}>
              {ocupado ? "Procesando…" : accion === "aprobar" ? "Confirmar aprobación" : "Confirmar descarte"}
            </button>
            <button type="button" onClick={() => setAccion(null)} disabled={ocupado} className={claseBotonSecundario}>Cancelar</button>
          </div>
        </div>
      ) : null}
      <div aria-live="polite">
        {mensaje ? <p role={mensaje.ok ? "status" : "alert"} className={mensaje.ok ? claseOk : claseError}>{mensaje.texto}</p> : null}
      </div>
    </div>
  );
}
