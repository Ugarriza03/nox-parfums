"use client";

import { useState } from "react";
import { CatalogFragranceEditor, type CatalogEditorValues, type ResultadoGuardado } from "./CatalogFragranceEditor";
import { SubirPortadaCatalogo } from "./SubirPortadaCatalogo";
import { Tarjeta, Subtitulo } from "./ui";

export function CatalogEditorConPortada({
  slug, initial, mode, onSave
}: {
  slug: string;
  initial: Partial<CatalogEditorValues>;
  mode: "edit-draft" | "propose-revision";
  onSave: (values: CatalogEditorValues) => Promise<ResultadoGuardado>;
}) {
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <Tarjeta>
        <Subtitulo id="editar" descripcion={mode === "edit-draft" ? "Borrador: los cambios se aplican al guardar." : "Publicada: los cambios quedan como revisión pendiente."}>
          {mode === "edit-draft" ? "Editar ficha" : "Proponer cambios"}
        </Subtitulo>
        <CatalogFragranceEditor initial={initial} mode={mode} onSave={onSave} uploadedImagePath={uploadedImagePath} />
      </Tarjeta>
      <Tarjeta>
        <Subtitulo>Subir portada</Subtitulo>
        <SubirPortadaCatalogo slug={slug} onUploaded={setUploadedImagePath} />
      </Tarjeta>
    </div>
  );
}
