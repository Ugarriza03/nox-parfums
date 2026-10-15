"use client";

import { useState } from "react";
import { subirPortadaCatalogo } from "@/app/admin/(panel)/catalogo/[slug]/portada-acciones";

export function SubirPortadaCatalogo({ slug }: { slug: string }) {
  const [archivo, setArchivo] = useState<File | null>(null);
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
      setRuta(await subirPortadaCatalogo(form));
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
        Luego copiá la ruta en el editor de la fragancia y guardá el borrador o la revisión.
      </p>
      <input type="file" accept="image/webp,image/png,image/jpeg" required
        disabled={ocupado} onChange={e => { setArchivo(e.target.files?.[0] ?? null); setRuta(null); }}
        className="block w-full text-sm text-bone" />
      <button type="submit" disabled={ocupado || !archivo}
        className="rounded border border-edge px-4 py-2 text-sm text-bone disabled:opacity-50">
        {ocupado ? "Subiendo…" : "Subir imagen privada"}
      </button>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {ruta && (
        <div role="status" className="space-y-2 text-sm text-bone">
          <p>Imagen subida. Todavía no está asociada a la fragancia.</p>
          <label className="block">Ruta para pegar en el editor
            <input readOnly value={ruta} onFocus={e => e.currentTarget.select()}
              className="mt-1 w-full rounded border border-edge p-2 text-black" />
          </label>
        </div>
      )}
    </form>
  );
}
