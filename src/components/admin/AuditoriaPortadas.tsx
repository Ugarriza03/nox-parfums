"use client";

import { useState } from "react";
import { claseBotonSecundario, claseError } from "./ui";
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
      <p className="text-[13px] leading-relaxed text-mist">
        Consulta hasta 100 archivos recientes de esta fragancia. Una imagen sin referencias
        y con más de 30 días se marca como candidata; no se elimina automáticamente.
      </p>
      <button type="button" onClick={consultar} disabled={busy}
        className={claseBotonSecundario}>
        {busy ? "Verificando…" : "Revisar imágenes almacenadas"}
      </button>
      {error && <p role="alert" className={claseError}>{error}</p>}
      {items && (
        <div role="status" className="space-y-2">
          {items.length === 0 && <p className="text-sm text-mist">No se encontraron imágenes privadas.</p>}
          {items.map(item => (
            <div key={item.path} className="rounded-xl border border-edge p-3 text-[13px]">
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
