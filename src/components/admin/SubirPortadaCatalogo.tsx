"use client";

import { useEffect, useId, useState } from "react";
import { subirPortadaCatalogo } from "@/app/admin/(panel)/catalogo/[slug]/portada-acciones";
import { claseBotonSecundario, claseError, claseOk } from "./ui";

export function SubirPortadaCatalogo({ slug, onUploaded }: { slug: string; onUploaded: (path: string) => void }) {
  const id = useId();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [ruta, setRuta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!archivo) { setPreview(null); return; }
    const url = URL.createObjectURL(archivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

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
      const r = await subirPortadaCatalogo(form);
      if (!r.ok) { setError(r.error); return; }
      setRuta(r.ruta);
      onUploaded(r.ruta);
    } catch {
      setError("No se pudo subir la portada. Intentá nuevamente.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <p className="text-[13px] leading-relaxed text-mist">
        WebP, PNG o JPEG de hasta 5 MB. Se guarda en almacenamiento privado y queda seleccionada en el editor;
        se asocia a la ficha recién al guardar el borrador o la revisión. No se publica en la tienda.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={id} className={`${claseBotonSecundario} cursor-pointer`}>Elegir imagen</label>
        <input id={id} type="file" accept="image/webp,image/png,image/jpeg" required disabled={ocupado}
          onChange={(e) => { setArchivo(e.target.files?.[0] ?? null); setRuta(null); setError(null); }}
          className="sr-only" />
        <span className="truncate text-[13px] text-haze">{archivo ? archivo.name : "Ningún archivo seleccionado"}</span>
      </div>
      {preview ? (
        // Vista previa local del archivo elegido: no accede al bucket.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Vista previa de la portada seleccionada" className="h-48 w-auto rounded-xl border border-edge object-contain" />
      ) : null}
      <button type="submit" disabled={ocupado || !archivo} className={claseBotonSecundario} aria-busy={ocupado}>
        {ocupado ? "Subiendo…" : "Subir a almacenamiento privado"}
      </button>
      <div aria-live="polite">
        {error ? <p role="alert" className={claseError}>{error}</p> : null}
        {ruta ? <p role="status" className={claseOk}>Imagen subida y seleccionada en el editor. Guardá la ficha para asociarla.</p> : null}
      </div>
    </form>
  );
}
