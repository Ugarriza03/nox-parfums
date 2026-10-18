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
  // Cada mensaje queda ligado al estado en que se mostró: si el estado de la
  // ficha cambia por otra vía, el mensaje viejo deja de mostrarse.
  const [mensajeEstado, setMensajeEstado] = useState<{ ok: boolean; texto: string; estado: EstadoCatalogo } | null>(null);
  const mensaje = mensajeEstado && mensajeEstado.estado === estado ? mensajeEstado : null;
  const opciones = TRANSICIONES[estado] ?? [];
  const opcion = opciones.find((o) => o.destino === elegido);

  async function confirmar() {
    if (!opcion || ocupado) return;
    setOcupado(true);
    setMensajeEstado(null);
    try {
      const r = await cambiarEstadoCatalogo(slug, opcion.destino);
      if (!r.ok) { setMensajeEstado({ ok: false, texto: r.error, estado }); return; }
      setMensajeEstado({ ok: true, texto: `Estado actualizado: ${ETIQUETA_ESTADO_CATALOGO[opcion.destino]}.`, estado: opcion.destino });
      setElegido(null);
      // Se quitan avisos de la URL (p. ej. "Borrador creado"): ya no describen la ficha.
      router.replace(`/admin/catalogo/${encodeURIComponent(slug)}`, { scroll: false });
      router.refresh();
    } catch {
      setMensajeEstado({ ok: false, texto: "No se pudo cambiar el estado. Intentá nuevamente.", estado });
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
              onClick={() => { setElegido(o.destino); setMensajeEstado(null); }}
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
