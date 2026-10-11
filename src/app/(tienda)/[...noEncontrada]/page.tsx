import { notFound } from "next/navigation";

/**
 * Cualquier URL que no coincide con otra ruta termina acá y responde 404 con
 * la página de la tienda ((tienda)/not-found.tsx). Las rutas existentes
 * siempre tienen prioridad sobre este comodín.
 */
export default function RutaInexistente(): never {
  notFound();
}
