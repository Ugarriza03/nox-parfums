"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cambiarEstadoCatalogo } from "@/app/admin/(panel)/catalogo/[slug]/estado-acciones";
import { ETIQUETA_ESTADO_CATALOGO, TRANSICIONES, type EstadoCatalogo } from "@/lib/admin/catalogo-v2";
import { claseBoton, claseBotonSecundario, claseError, claseOk } from "./ui";

/** Publicar, ocultar, archivar y restaurar con confirmación explícita. */
export function ControlesEstadoCatalogo({ slug, estado, bloqueoPublicar }: {
  slug: string;
  estado: EstadoCatalogo;
  /** Motivo por el que no se puede publicar ahora (p. ej. revisión pendiente). */
  bloqueoPublicar?: string | null;
}) {
  const router = useRouter();
  const [elegido, setElegido] = useState<EstadoCatalogo | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const opciones = TRANSICIONES[estado] ?? [];
  const opcion = opciones.find((o) => o.destino === elegido);

  async function confirmar() {
    if (!opcion || ocupado) return;
    setOcupado(true);
    setMensaje(null);
    try {
      const r = await cambiarEstadoCatalogo(slug, opcion.destino);
      if (!r.ok) { setMensaje({ ok: false, texto: r.error }); return; }
      setMensaje({ ok: true, texto: `Estado actualizado: ${ETIQUETA_ESTADO_CATALOGO[opcion.destino]}.` });
      setElegido(null);
      router.refresh();
    } catch {
      setMensaje({ ok: false, texto: "No se pudo cambiar el estado. Intentá nuevamente." });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Acciones de publicación">
        {opciones.map((o) => {
          const bloqueada = o.destino === "published" && Boolean(bloqueoPublicar);
          return (
            <button
              key={o.destino}
              type="button"
              disabled={ocupado || bloqueada}
              aria-pressed={elegido === o.destino}
              onClick={() => { setElegido(o.destino); setMensaje(null); }}
              className={`${claseBotonSecundario} disabled:cursor-not-allowed disabled:opacity-50 ${elegido === o.destino ? "border-bone/60" : ""}`}
              title={bloqueada ? bloqueoPublicar ?? undefined : undefined}
            >
              {o.etiqueta}
            </button>
          );
        })}
      </div>
      {bloqueoPublicar && opciones.some((o) => o.destino === "published") ? (
        <p className="text-[12.5px] text-mist">{bloqueoPublicar}</p>
      ) : null}
      {opcion ? (
        <div className="space-y-3 rounded-xl border border-edge bg-void p-4" role="region" aria-label="Confirmar cambio de estado">
          <p className="text-[13.5px] text-bone">
            {ETIQUETA_ESTADO_CATALOGO[estado]} → {ETIQUETA_ESTADO_CATALOGO[opcion.destino]}
          </p>
          <p className="text-[13px] leading-relaxed text-mist">{opcion.aviso}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={confirmar} disabled={ocupado} className={claseBoton} aria-busy={ocupado}>
              {ocupado ? "Aplicando…" : `Confirmar: ${opcion.etiqueta.toLowerCase()}`}
            </button>
            <button type="button" onClick={() => setElegido(null)} disabled={ocupado} className={claseBotonSecundario}>Cancelar</button>
          </div>
        </div>
      ) : null}
      <div aria-live="polite">
        {mensaje ? <p role={mensaje.ok ? "status" : "alert"} className={mensaje.ok ? claseOk : claseError}>{mensaje.texto}</p> : null}
      </div>
    </div>
  );
}
