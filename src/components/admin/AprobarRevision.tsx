"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publicarRevision } from "@/app/admin/(panel)/catalogo/[slug]/revision-acciones";

export function AprobarRevision({ slug }: { slug: string }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function aprobar() {
    if (!confirmar || ocupado) return;
    setOcupado(true);
    setError(null);
    try {
      await publicarRevision(slug);
      setConfirmar(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo aprobar la revisión.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-3 text-sm text-haze">
        <input type="checkbox" checked={confirmar} onChange={e => setConfirmar(e.target.checked)} disabled={ocupado} className="mt-1" />
        Confirmo que revisé los cambios y quiero aplicarlos a esta fragancia.
      </label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button type="button" disabled={!confirmar || ocupado} onClick={aprobar}
        className="rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-void disabled:cursor-not-allowed disabled:opacity-50">
        {ocupado ? "Aplicando…" : "Aprobar y aplicar revisión"}
      </button>
    </div>
  );
}
