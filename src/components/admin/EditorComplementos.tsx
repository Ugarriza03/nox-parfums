"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarComplementosCatalogo } from "@/app/admin/(panel)/catalogo/[slug]/complementos-acciones";
import { claseAyuda, claseBotonSecundario, claseCampo, claseError, claseEtiqueta, claseOk } from "./ui";

export function EditorComplementos({ slug, status, initial }: {
  slug: string;
  status: "draft" | "published";
  initial: { description: string | null; inspiredLabel: string | null; dataStatus: "verificado" | "pendiente" | null };
}) {
  const router = useRouter();
  const [description, setDescription] = useState(initial.description ?? "");
  const [inspiredLabel, setInspiredLabel] = useState(initial.inspiredLabel ?? "");
  const [dataStatus, setDataStatus] = useState<"" | "verificado" | "pendiente">(initial.dataStatus ?? "");
  const [busy, setBusy] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje(null);
    setBusy(true);
    try {
      const r = await guardarComplementosCatalogo({
        slug,
        description: description.trim() || null,
        inspiredLabel: inspiredLabel.trim() || null,
        dataStatus: dataStatus || null
      });
      if (!r.ok) { setMensaje({ ok: false, texto: r.error }); return; }
      setMensaje({ ok: true, texto: status === "published" ? "Revisión editorial guardada. La ficha publicada no cambió." : "Información guardada." });
      router.refresh();
    } catch {
      setMensaje({ ok: false, texto: "No se pudieron guardar los datos. Intentá nuevamente." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={busy} className="space-y-4">
        <label className={claseEtiqueta}>Referencia de inspiración
          <input maxLength={500} value={inspiredLabel} onChange={(e) => setInspiredLabel(e.target.value)} className={claseCampo} />
          <span className={claseAyuda}>Ej.: “Inspirado en Marca Fragancia”.</span>
        </label>
        <label className={claseEtiqueta}>Descripción editorial
          <textarea maxLength={5000} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={claseCampo} />
          <span className={claseAyuda}>Opcional. No inventes características que no estén verificadas.</span>
        </label>
        <label className={claseEtiqueta}>Estado de los datos olfativos
          <select value={dataStatus} onChange={(e) => setDataStatus(e.target.value as typeof dataStatus)} className={claseCampo}>
            <option value="">Sin definir</option>
            <option value="pendiente">Pendiente de verificación</option>
            <option value="verificado">Verificado</option>
          </select>
        </label>
      </fieldset>
      <div className="rounded-xl border border-edge bg-void px-4 py-3 text-[12.5px] leading-relaxed text-mist">
        <strong className="font-medium text-haze">Rendimiento NOX bloqueado.</strong> Duración, proyección y estela sólo se cargan
        con pruebas propias de NOX; este panel no permite editarlos y conserva el valor actual.
      </div>
      <div aria-live="polite">
        {mensaje ? <p role={mensaje.ok ? "status" : "alert"} className={mensaje.ok ? claseOk : claseError}>{mensaje.texto}</p> : null}
      </div>
      <button type="submit" disabled={busy} className={claseBotonSecundario} aria-busy={busy}>
        {busy ? "Guardando…" : status === "published" ? "Guardar como revisión" : "Guardar información"}
      </button>
    </form>
  );
}
