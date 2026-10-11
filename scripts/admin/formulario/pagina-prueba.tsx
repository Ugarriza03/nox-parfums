/**
 * Página de prueba del formulario de movimientos. Reproduce la estructura de
 * src/app/admin/(panel)/inventario/[slug]/page.tsx: el formulario de carga
 * inicial y el de movimientos ocupan la MISMA posición del árbol, que es
 * justamente lo que hace que React conserve el estado al cambiar de modo.
 * Sólo para scripts/admin/test-formulario-movimiento.mjs.
 */

import { useEffect, useReducer } from "react";
import { createRoot } from "react-dom/client";
import { FormularioMovimiento } from "@/components/admin/FormularioMovimiento";
import { db, suscribir } from "./acciones-simuladas";

function Pagina({ slug }: { slug: string }) {
  const [, refrescar] = useReducer((x: number) => x + 1, 0);
  useEffect(() => suscribir(refrescar), []);

  const item = db.stock.has(slug);
  const stock = item ? db.stock.get(slug)! : null;
  const historial = db.movimientos.filter((m) => m.slug === slug);

  return (
    <div>
      <p data-prueba="stock">{stock === null ? "—" : stock}</p>
      <h2 data-prueba="titulo">{item ? "Registrar movimiento" : "Registrar inventario inicial"}</h2>
      {item ? (
        <FormularioMovimiento slug={slug} tipos={["ingreso", "egreso", "ajuste"]} stockActual={stock} />
      ) : (
        <FormularioMovimiento slug={slug} tipos={["carga_inicial"]} stockActual={null} />
      )}
      <ul data-prueba="historial">
        {historial.map((m) => (
          <li key={m.requestId}>
            {m.tipo} {m.cantidad} {m.antes}→{m.despues}
          </li>
        ))}
      </ul>
    </div>
  );
}

const slug = new URLSearchParams(window.location.search).get("slug") ?? "ariana-grande-cloud";
createRoot(document.getElementById("raiz")!).render(<Pagina slug={slug} />);
