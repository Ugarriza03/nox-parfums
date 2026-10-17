"use client";

import { useState } from "react";
import { guardarComplementosCatalogo } from "@/app/admin/(panel)/catalogo/[slug]/complementos-acciones";

export function EditorComplementos({ slug, status, initial }: {
 slug: string; status: "draft" | "published";
 initial: { description: string | null; inspiredLabel: string | null;
  dataStatus: "verificado" | "pendiente" | null; performance: Record<string, unknown> | null };
}) {
 const [description,setDescription]=useState(initial.description ?? "");
 const [inspiredLabel,setInspiredLabel]=useState(initial.inspiredLabel ?? "");
 const [dataStatus,setDataStatus]=useState(initial.dataStatus ?? "");
 const [performance,setPerformance]=useState(JSON.stringify(initial.performance ?? null,null,2));
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 async function submit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();setMessage("");
  let parsed: Record<string,unknown> | null;
  try {
   const value: unknown=JSON.parse(performance);
   if(value!==null && (typeof value!=="object" || Array.isArray(value))) throw Error();
   parsed=value as Record<string,unknown> | null;
  } catch {setMessage("El rendimiento debe ser un objeto JSON o null.");return;}
  setBusy(true);
  try {
   await guardarComplementosCatalogo({slug,description:description.trim()||null,
    inspiredLabel:inspiredLabel.trim()||null,
    dataStatus:dataStatus as "verificado" | "pendiente" | null || null,
    performance:parsed});
   setMessage(status==="published"?"Revisión pendiente guardada. La ficha publicada no cambió.":"Datos del borrador guardados.");
  } catch(err) {setMessage(err instanceof Error?err.message:"No se pudieron guardar los datos.");}
  finally {setBusy(false);}
 }
 return <form onSubmit={submit} className="space-y-4">
  <h2 className="text-lg text-bone">Información complementaria</h2>
  <p className="text-sm text-mist">No inventes duración, proyección ni características que no estén verificadas.
   {status==="published"?" Estos cambios requieren aprobación.":""}</p>
  <label className="grid gap-1 text-sm">Perfume de inspiración
   <input maxLength={500} value={inspiredLabel} onChange={e=>setInspiredLabel(e.target.value)}
    disabled={busy} className="rounded border p-3 text-black" />
  </label>
  <label className="grid gap-1 text-sm">Descripción
   <textarea maxLength={5000} rows={5} value={description} onChange={e=>setDescription(e.target.value)}
    disabled={busy} className="rounded border p-3 text-black" />
  </label>
  <label className="grid gap-1 text-sm">Estado de datos
   <select value={dataStatus} onChange={e=>setDataStatus(e.target.value as typeof dataStatus)}
    disabled={busy} className="rounded border p-3 text-black">
    <option value="">Sin definir</option><option value="pendiente">Pendiente</option>
    <option value="verificado">Verificado</option>
   </select>
  </label>
  <label className="grid gap-1 text-sm">Rendimiento verificado (JSON opcional)
   <textarea rows={4} value={performance} onChange={e=>setPerformance(e.target.value)}
    disabled={busy} spellCheck={false} className="rounded border p-3 font-mono text-sm text-black" />
  </label>
  {message && <p role="status" className="text-sm text-bone">{message}</p>}
  <button type="submit" disabled={busy} className="rounded border px-5 py-3 disabled:opacity-50">
   {busy?"Guardando…":status==="published"?"Guardar revisión editorial":"Guardar información complementaria"}
  </button>
 </form>;
}
