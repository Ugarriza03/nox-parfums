"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cambiarEstadoCatalogo, type EstadoCatalogo } from "@/app/admin/(panel)/catalogo/[slug]/estado-acciones";

const OPCIONES: Record<EstadoCatalogo, { destino: EstadoCatalogo; etiqueta: string; aviso: string }[]> = {
  draft: [{ destino: "published", etiqueta: "Publicar fragancia", aviso: "La fragancia quedará marcada como publicada en el catálogo administrativo." }, { destino: "archived", etiqueta: "Archivar borrador", aviso: "El borrador quedará archivado." }],
  published: [{ destino: "hidden", etiqueta: "Ocultar fragancia", aviso: "La fragancia dejará de estar marcada como publicada." }, { destino: "archived", etiqueta: "Archivar fragancia", aviso: "La fragancia quedará archivada." }],
  hidden: [{ destino: "published", etiqueta: "Volver a publicar", aviso: "La fragancia volverá al estado publicado." }, { destino: "archived", etiqueta: "Archivar fragancia", aviso: "La fragancia quedará archivada." }],
  archived: [{ destino: "draft", etiqueta: "Restaurar como borrador", aviso: "La fragancia volverá como borrador, sin publicarse." }, { destino: "hidden", etiqueta: "Restaurar oculta", aviso: "La fragancia volverá oculta, sin publicarse." }]
};

export function ControlesEstadoCatalogo({ slug, estado }: { slug: string; estado: EstadoCatalogo }) {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<EstadoCatalogo | "">("");
  const [confirmado, setConfirmado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const opciones = OPCIONES[estado] ?? [];
  const elegido = opciones.find(o => o.destino === seleccion);

  async function ejecutar() {
    if (!elegido || !confirmado || ocupado) return;
    setOcupado(true);
    setError(null);
    try {
      await cambiarEstadoCatalogo(slug, elegido.destino);
      setSeleccion("");
      setConfirmado(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo modificar el estado.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="grid gap-2 text-sm text-haze">
        Cambiar estado
        <select value={seleccion} disabled={ocupado}
          onChange={e => { setSeleccion(e.target.value as EstadoCatalogo | ""); setConfirmado(false); setError(null); }}
          className="w-full rounded-xl border border-edge bg-void px-3 py-2.5 text-bone">
          <option value="">Seleccionar acción</option>
          {opciones.map(o => <option key={o.destino} value={o.destino}>{o.etiqueta}</option>)}
        </select>
      </label>
      {elegido && (
        <div className="space-y-3 rounded-xl border border-edge p-4">
          <p className="text-sm text-haze">{elegido.aviso}</p>
          <p className="text-xs text-mist">La tienda pública seguirá usando el catálogo actual hasta completar su integración con V2.</p>
          <label className="flex items-start gap-2 text-sm text-bone">
            <input type="checkbox" className="mt-1" checked={confirmado} disabled={ocupado}
              onChange={e => setConfirmado(e.target.checked)} />
            Confirmo que quiero realizar esta acción.
          </label>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button type="button" onClick={ejecutar} disabled={!confirmado || ocupado}
            className="rounded-full border border-edge px-5 py-2.5 text-sm text-bone disabled:opacity-50">
            {ocupado ? "Procesando…" : elegido.etiqueta}
          </button>
        </div>
      )}
    </div>
  );
}
