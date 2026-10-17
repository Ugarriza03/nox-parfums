"use client";

import { useState } from "react";
import { auditarPortadasCatalogo, type PortadaAuditada } from "@/app/admin/(panel)/catalogo/[slug]/auditoria-portadas";

export function AuditoriaPortadas({ slug }: { slug: string }) {
  const [items, setItems] = useState<PortadaAuditada[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function consultar() {
    setBusy(true);
    setError(null);
    try {
      setItems(await auditarPortadasCatalogo(slug));
    } catch {
      setItems(null);
      setError("No se pudo verificar el estado de las portadas.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-3">
      <h2 className="text-lg text-bone">Auditoría de portadas privadas</h2>
      <p className="text-sm text-mist">
        Consulta hasta 100 archivos recientes de esta fragancia. Una imagen sin referencias
        y con más de 30 días se marca como candidata; no se elimina automáticamente.
      </p>
      <button type="button" onClick={consultar} disabled={busy}
        className="rounded border border-edge px-4 py-2 text-sm text-bone disabled:opacity-50">
        {busy ? "Verificando…" : "Revisar imágenes almacenadas"}
      </button>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {items && (
        <div role="status" className="space-y-2">
          {items.length === 0 && <p className="text-sm text-mist">No se encontraron imágenes privadas.</p>}
          {items.map(item => (
            <div key={item.path} className="rounded border border-edge p-3 text-sm">
              <p className="break-all text-bone">{item.path}</p>
              <p className="text-mist">
                {item.referenced ? "En uso: conservar" :
                  item.candidate ? "Candidata para revisión manual (sin referencias, más de 30 días)" :
                  "Sin referencias: conservar por ahora"}
                {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString("es-AR")}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
