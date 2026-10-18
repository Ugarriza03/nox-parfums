"use client";

import { useState } from "react";
import { CatalogFragranceEditor, type CatalogEditorValues, type ResultadoGuardado } from "./CatalogFragranceEditor";
import { SubirPortadaCatalogo } from "./SubirPortadaCatalogo";
import { Tarjeta, Subtitulo } from "./ui";

export function CatalogEditorConPortada({
  slug, initial, mode, version, hayRevision, onSave
}: {
  slug: string;
  initial: Partial<CatalogEditorValues>;
  mode: "edit-draft" | "propose-revision";
  /** Versión de los datos del servidor (ver CatalogFragranceEditor). */
  version: string;
  /** Con revisión pendiente, el editor parte de la propuesta. */
  hayRevision: boolean;
  onSave: (values: CatalogEditorValues) => Promise<ResultadoGuardado>;
}) {
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  // Una imagen subida y no guardada pertenece a la versión anterior: se olvida al cambiar.
  const [versionVista, setVersionVista] = useState(version);
  if (version !== versionVista) {
    setVersionVista(version);
    setUploadedImagePath(null);
  }
  const descripcion = mode === "edit-draft"
    ? "Borrador: los cambios se aplican al guardar."
    : hayRevision
      ? "Publicada con revisión pendiente: el formulario muestra la propuesta. Guardar la reemplaza; la ficha publicada no cambia hasta aprobarla."
      : "Publicada: los cambios quedan como revisión pendiente.";
  return (
    <div className="space-y-6">
      <Tarjeta>
        <Subtitulo id="editar" descripcion={descripcion}>
          {mode === "edit-draft" ? "Editar ficha" : "Proponer cambios"}
        </Subtitulo>
        <CatalogFragranceEditor initial={initial} mode={mode} onSave={onSave} uploadedImagePath={uploadedImagePath} version={version} />
      </Tarjeta>
      <Tarjeta>
        <Subtitulo>Subir portada</Subtitulo>
        <SubirPortadaCatalogo key={version} slug={slug} modo={mode} onUploaded={setUploadedImagePath} />
      </Tarjeta>
    </div>
  );
}
