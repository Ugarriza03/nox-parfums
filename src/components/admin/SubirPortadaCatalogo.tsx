"use client";

import { useEffect, useState } from "react";
import { subirPortadaCatalogo } from "@/app/admin/(panel)/catalogo/[slug]/portada-acciones";

export function SubirPortadaCatalogo({ slug, onUploaded }: { slug: string; onUploaded: (path: string) => void }) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!archivo) { setPreview(null); return; }
    const url = URL.createObjectURL(archivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);
  const [ocupado, setOcupado] = useState(false);
  const [ruta, setRuta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!archivo) return;
    setOcupado(true);
    setError(null);
    setRuta(null);
    try {
      const form = new FormData();
      form.set("slug", slug);
      form.set("archivo", archivo);
      const path = await subirPortadaCatalogo(form);
      setRuta(path);
      onUploaded(path);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir la portada.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <p className="text-sm text-mist">
        La imagen se carga en almacenamiento privado. No se aplica a la ficha ni se publica automáticamente.
        Una vez subida, quedará seleccionada en el editor. Guardá el borrador o la revisión para asociarla.
      </p>
      <input type="file" accept="image/webp,image/png,image/jpeg" required
        disabled={ocupado} onChange={e => { setArchivo(e.target.files?.[0] ?? null); setRuta(null); }}
        className="block w-full text-sm text-bone" />
      {preview && (
        // Vista previa local: no accede al bucket privado ni publica la imagen.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Vista previa de la portada seleccionada" className="h-52 w-auto rounded border border-edge object-contain" />
      )}
      <button type="submit" disabled={ocupado || !archivo}
        className="rounded border border-edge px-4 py-2 text-sm text-bone disabled:opacity-50">
        {ocupado ? "Subiendo…" : "Subir imagen privada"}
      </button>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {ruta && (
        <div role="status" className="space-y-2 text-sm text-bone">
          <p>Imagen subida y seleccionada en el editor. Todavía no está guardada en la ficha.</p>
          <label className="block">Ruta privada generada
            <input readOnly value={ruta} onFocus={e => e.currentTarget.select()}
              className="mt-1 w-full rounded border border-edge p-2 text-black" />
          </label>
        </div>
      )}
    </form>
  );
}
