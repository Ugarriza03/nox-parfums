"use client";

import { useState } from "react";
import { CatalogFragranceEditor, type CatalogEditorValues } from "./CatalogFragranceEditor";
import { SubirPortadaCatalogo } from "./SubirPortadaCatalogo";

export function CatalogEditorConPortada({
  slug, initial, mode, onSave
}: {
  slug: string;
  initial: Partial<CatalogEditorValues>;
  mode: "edit-draft" | "propose-revision";
  onSave: (values: CatalogEditorValues) => Promise<void>;
}) {
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg text-bone">Nueva portada</h2>
        <SubirPortadaCatalogo slug={slug} onUploaded={setUploadedImagePath} />
      </section>
      <section className="space-y-3">
        <h2 className="text-lg text-bone">{mode === "edit-draft" ? "Editar borrador" : "Preparar revisión"}</h2>
        <CatalogFragranceEditor initial={initial} mode={mode} onSave={onSave}
          uploadedImagePath={uploadedImagePath} />
      </section>
    </div>
  );
}
