"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarComplementosCatalogo } from "@/app/admin/(panel)/catalogo/[slug]/complementos-acciones";
import { esVersionValida, type VersionFicha } from "@/lib/admin/ficha-sincronizacion";
import { claseAyuda, claseBotonSecundario, claseCampo, claseError, claseEtiqueta, claseOk } from "./ui";

/**
 * Datos editoriales. Igual que el editor de ficha: se reinicia con los datos
 * del servidor cuando cambia la versión, y el servidor rechaza un guardado
 * hecho sobre una versión vieja.
 */
export function EditorComplementos({ slug, status, initial, version }: {
  slug: string;
  status: "draft" | "published";
  initial: { description: string | null; inspiredLabel: string | null; dataStatus: "verificado" | "pendiente" | null };
  version: VersionFicha;
}) {
  const router = useRouter();
  const [description, setDescription] = useState(initial.description ?? "");
  const [inspiredLabel, setInspiredLabel] = useState(initial.inspiredLabel ?? "");
  const [dataStatus, setDataStatus] = useState<"" | "verificado" | "pendiente">(initial.dataStatus ?? "");
  const [busy, setBusy] = useState(false);
  const [mensaje, setMensajeEstado] = useState<{ ok: boolean; texto: string; status: string } | null>(null);
  const setMensaje = (m: { ok: boolean; texto: string } | null) => setMensajeEstado(m ? { ...m, status } : null);

  const clave = esVersionValida(version) ? `${version.updatedAt}|${version.estado}|${version.revisionAt ?? ""}` : "";
  const [claveVista, setClaveVista] = useState(clave);
  if (clave !== claveVista) {
    setClaveVista(clave);
    setDescription(initial.description ?? "");
    setInspiredLabel(initial.inspiredLabel ?? "");
    setDataStatus(initial.dataStatus ?? "");
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje(null);
    const valores = {
      description: description.trim() || null,
      inspiredLabel: inspiredLabel.trim() || null,
      dataStatus: dataStatus || null
    };
    if (valores.description === (initial.description?.trim() || null) &&
        valores.inspiredLabel === (initial.inspiredLabel?.trim() || null) &&
        valores.dataStatus === (initial.dataStatus ?? null)) {
      setMensaje({ ok: true, texto: "No hay cambios para guardar." });
      return;
    }
    setBusy(true);
    try {
      const r = await guardarComplementosCatalogo({ slug, ...valores, versionEsperada: version });
      if (!r.ok) {
        setMensaje({ ok: false, texto: r.error });
        if (r.desactualizada) router.refresh();
        return;
      }
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
        {mensaje && mensaje.status === status ? <p role={mensaje.ok ? "status" : "alert"} className={mensaje.ok ? claseOk : claseError}>{mensaje.texto}</p> : null}
      </div>
      <button type="submit" disabled={busy} className={claseBotonSecundario} aria-busy={busy}>
        {busy ? "Guardando…" : status === "published" ? "Guardar como revisión" : "Guardar información"}
      </button>
    </form>
  );
}
