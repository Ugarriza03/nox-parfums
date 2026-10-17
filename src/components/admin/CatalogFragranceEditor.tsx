"use client";

import { useEffect, useMemo, useState } from "react";

export type CatalogEditorValues = {
  slug: string;
  house: string;
  fragranceName: string;
  gender: "femenino" | "masculino" | "unisex";
  universe: "disenador" | "nicho" | "arabe" | "pendiente";
  origin: "internacional" | "arabe";
  olfactory: Record<string, unknown> | null;
  imagePath: string | null;
};

type Props = {
  initial?: Partial<CatalogEditorValues>;
  mode: "create-draft" | "edit-draft" | "propose-revision";
  busy?: boolean;
  uploadedImagePath?: string | null;
  onSave: (values: CatalogEditorValues) => Promise<void>;
};

/** UI desacoplada: no hace llamadas a Supabase ni publica cambios por su cuenta. */
export function CatalogFragranceEditor({ initial, mode, busy = false, uploadedImagePath, onSave }: Props) {
  const [house, setHouse] = useState(initial?.house ?? "");
  const [fragranceName, setFragranceName] = useState(initial?.fragranceName ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [gender, setGender] = useState<CatalogEditorValues["gender"]>(initial?.gender ?? "unisex");
  const [universe, setUniverse] = useState<CatalogEditorValues["universe"]>(initial?.universe ?? "disenador");
  const [origin, setOrigin] = useState<CatalogEditorValues["origin"]>(initial?.origin ?? "internacional");
  const [notes, setNotes] = useState(JSON.stringify(initial?.olfactory ?? {}, null, 2));
  const [imagePath, setImagePath] = useState(initial?.imagePath ?? "");
  useEffect(() => {
    if (uploadedImagePath) setImagePath(uploadedImagePath);
  }, [uploadedImagePath]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const locked = busy || saving;
  const slugValid = useMemo(() => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 120, [slug]);
  const label = mode === "propose-revision" ? "Guardar revisión pendiente" : "Guardar borrador";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!slugValid) { setError("El identificador debe contener letras minúsculas, números y guiones."); return; }
    if (!house.trim() || !fragranceName.trim() || house.trim().length > 160 || fragranceName.trim().length > 180) {
      setError("Revisá la marca y el nombre de la fragancia."); return;
    }
    if (imagePath && (imagePath.length > 500 || imagePath.startsWith("/") || imagePath.includes("..") || /[\x00-\x1f\x7f]/.test(imagePath))) {
      setError("La ruta de imagen no es válida."); return;
    }
    let olfactory: Record<string, unknown> | null;
    try {
      const parsed: unknown = JSON.parse(notes);
      if (parsed === null) olfactory = null;
      else if (typeof parsed === "object" && !Array.isArray(parsed)) olfactory = parsed as Record<string, unknown>;
      else throw new Error("Formato incorrecto");
    } catch {
      setError("El perfil olfativo debe ser un objeto JSON válido."); return;
    }
    setSaving(true);
    try {
      await onSave({ slug, house: house.trim(), fragranceName: fragranceName.trim(), gender, universe, origin, olfactory, imagePath: imagePath || null });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar. Intentá nuevamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" aria-label="Editor de fragancia NOX">
      <p className="text-sm opacity-75">
        {mode === "propose-revision"
          ? "Los cambios se guardan para revisión. La ficha publicada no cambia hasta aprobarlos."
          : "Los cambios se guardan como borrador y no se publican automáticamente."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">Marca
          <input required maxLength={160} value={house} onChange={e => setHouse(e.target.value)} disabled={locked} className="rounded border p-3 text-black" />
        </label>
        <label className="grid gap-1 text-sm">Nombre de la fragancia
          <input required maxLength={180} value={fragranceName} onChange={e => setFragranceName(e.target.value)} disabled={locked} className="rounded border p-3 text-black" />
        </label>
        <label className="grid gap-1 text-sm">Identificador (slug)
          <input required maxLength={120} value={slug} onChange={e => setSlug(e.target.value)} disabled={locked || mode !== "create-draft"} className="rounded border p-3 text-black" />
        </label>
        <label className="grid gap-1 text-sm">Género
          <select value={gender} onChange={e => setGender(e.target.value as CatalogEditorValues["gender"])} disabled={locked} className="rounded border p-3 text-black">
            <option value="femenino">Femenino</option><option value="masculino">Masculino</option><option value="unisex">Unisex</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">Categoría
          <select value={universe} onChange={e => setUniverse(e.target.value as CatalogEditorValues["universe"])} disabled={locked} className="rounded border p-3 text-black">
            <option value="disenador">Diseñador</option><option value="nicho">Nicho</option><option value="arabe">Árabe</option><option value="pendiente">Pendiente</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">Origen
          <select value={origin} onChange={e => setOrigin(e.target.value as CatalogEditorValues["origin"])} disabled={locked} className="rounded border p-3 text-black">
            <option value="internacional">Internacional</option><option value="arabe">Árabe</option>
          </select>
        </label>
      </div>
      <label className="grid gap-1 text-sm">Perfil olfativo (JSON)
        <textarea rows={7} value={notes} onChange={e => setNotes(e.target.value)} disabled={locked} spellCheck={false} className="rounded border p-3 font-mono text-sm text-black" />
      </label>
      <label className="grid gap-1 text-sm">Ruta de imagen (opcional)
        <input maxLength={500} value={imagePath} onChange={e => setImagePath(e.target.value)} disabled={locked} className="rounded border p-3 text-black" />
      </label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={locked} className="rounded border px-5 py-3 disabled:opacity-50">
        {saving ? "Guardando…" : label}
      </button>
    </form>
  );
}
