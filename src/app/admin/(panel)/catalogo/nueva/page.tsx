import Link from "next/link";
import { requerirAdmin } from "@/lib/admin/sesion";
import { CatalogFragranceEditor } from "@/components/admin/CatalogFragranceEditor";
import { Tarjeta, Titulo } from "@/components/admin/ui";
import { guardarBorrador } from "./acciones";

export const metadata = { title: "Nueva fragancia" };

export default async function NuevaFraganciaPage() {
  await requerirAdmin();
  return (
    <div className="max-w-3xl space-y-6">
      <nav aria-label="Ruta" className="text-[13px] text-mist">
        <Link href="/admin/catalogo" className="hover:text-bone">Catálogo</Link>
        <span aria-hidden="true" className="mx-2">/</span>
        <span className="text-haze">Nueva fragancia</span>
      </nav>
      <Titulo eyebrow="Catálogo V2" descripcion="Se crea como borrador: no se publica ni crea inventario. La portada se sube después, desde la ficha.">
        Nueva fragancia
      </Titulo>
      <Tarjeta>
        <CatalogFragranceEditor mode="create-draft" onSave={guardarBorrador} />
      </Tarjeta>
    </div>
  );
}
