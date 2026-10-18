"use client";

import { useEffect, useId, useState } from "react";
import { subirPortadaCatalogo } from "@/app/admin/(panel)/catalogo/[slug]/portada-acciones";
import { MAX_COVER_ETIQUETA, validarArchivoPortadaCliente } from "@/lib/admin/validar-portada";
import { mensajePortadaSubida, pasosPortada, type ModoPortada } from "@/lib/admin/ficha-sincronizacion";
import { claseBotonSecundario, claseError, claseOk } from "./ui";

/**
 * Sube una imagen candidata al almacenamiento privado. Subir NO asocia la
 * imagen a la ficha: la asociación se hace al guardar el borrador o la
 * revisión (y, si está publicada, al aprobar la revisión).
 */
export function SubirPortadaCatalogo({ slug, modo, onUploaded }: {
  slug: string;
  modo: ModoPortada;
  onUploaded: (path: string) => void;
}) {
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

  function elegir(f: File | null) {
    setRuta(null);
    if (!f) { setArchivo(null); setError(null); return; }
    // Se valida antes de enviar: un archivo que supere el límite de la Server
    // Action se rechazaría sin un mensaje claro.
    const problema = validarArchivoPortadaCliente(f);
    setError(problema);
    setArchivo(problema ? null : f);
  }

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!archivo) return;
    const problema = validarArchivoPortadaCliente(archivo);
    if (problema) { setError(problema); return; }
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
      setError(`No se pudo subir la portada. Verificá que pese menos de ${MAX_COVER_ETIQUETA} e intentá nuevamente.`);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <p className="text-[13px] leading-relaxed text-mist">
        WebP, PNG o JPEG de hasta {MAX_COVER_ETIQUETA}. Subir una imagen <strong className="font-medium text-haze">no</strong> la
        asocia a la ficha ni la publica en la tienda.
      </p>
      <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed text-mist" aria-label="Pasos para cambiar la portada">
        {pasosPortada(modo).map((p) => <li key={p}>{p}</li>)}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={id} className={`${claseBotonSecundario} cursor-pointer`}>Elegir imagen</label>
        <input id={id} type="file" accept="image/webp,image/png,image/jpeg" required disabled={ocupado}
          onChange={(e) => elegir(e.target.files?.[0] ?? null)}
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
        {ruta ? <p role="status" className={claseOk}>{mensajePortadaSubida(modo)}</p> : null}
      </div>
    </form>
  );
}
