"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { descartarRevision } from "@/app/admin/(panel)/catalogo/[slug]/descartar-revision-acciones";

export function DescartarRevision({ slug }: { slug: string }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function descartar() {
    if (!confirmar || ocupado) return;
    setOcupado(true);
    setError(null);
    try {
      await descartarRevision(slug);
      setConfirmar(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo descartar la revisión.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <div className="space-y-3">
      <label className="flex items-start gap-3 text-sm text-haze">
        <input type="checkbox" checked={confirmar} onChange={e => setConfirmar(e.target.checked)}
          disabled={ocupado} className="mt-1" />
        Confirmo que quiero descartar los cambios pendientes. La ficha actual no se modificará.
      </label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button type="button" disabled={!confirmar || ocupado} onClick={descartar}
        className="rounded-full border border-edge px-5 py-2.5 text-sm text-bone disabled:cursor-not-allowed disabled:opacity-50">
        {ocupado ? "Descartando…" : "Descartar revisión"}
      </button>
    </div>
  );
}
