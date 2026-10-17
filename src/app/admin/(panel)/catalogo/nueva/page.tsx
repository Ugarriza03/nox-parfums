import { requerirAdmin } from "@/lib/admin/sesion";
import { CatalogFragranceEditor } from "@/components/admin/CatalogFragranceEditor";
import { guardarBorrador } from "./acciones";

export const metadata = { title: "Nueva fragancia" };

export default async function NuevaFraganciaPage() {
  await requerirAdmin();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-mist">NOX Admin · Catálogo V2</p>
        <h1 className="mt-2 font-display text-3xl text-bone">Nueva fragancia</h1>
        <p className="mt-2 text-sm text-haze">La fragancia se guarda como borrador y no se publica automáticamente.</p>
      </div>
      <CatalogFragranceEditor mode="create-draft" onSave={guardarBorrador} />
    </div>
  );
}
