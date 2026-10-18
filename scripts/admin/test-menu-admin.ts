/**
 * Prueba de la navegación lateral: orden de secciones y sección activa.
 * Ejecutar: npx tsx scripts/admin/test-menu-admin.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// El componente es "use client"; se lee el array y la función sin React.
const fuente = readFileSync(new URL("../../src/components/admin/AdminSidebar.tsx", import.meta.url), "utf8");
const etiquetas = [...fuente.matchAll(/\{ href: "([^"]+)", etiqueta: "([^"]+)"/g)].map((m) => [m[1], m[2]]);
assert.deepEqual(etiquetas, [
  ["/admin", "Resumen"],
  ["/admin/catalogo", "Catálogo"],
  ["/admin/inventario", "Inventario"],
  ["/admin/actividad", "Actividad"],
  ["/admin/configuracion", "Configuración"]
]);

function seccionActiva(ruta: string, href: string): boolean {
  if (href === "/admin") return ruta === "/admin" || ruta === "/admin/";
  return ruta === href || ruta.startsWith(`${href}/`);
}
assert.ok(fuente.includes('if (href === "/admin") return ruta === "/admin" || ruta === "/admin/";'), "la función probada coincide con el componente");
const activas = (ruta: string) => etiquetas.filter(([h]) => seccionActiva(ruta, h)).map(([, e]) => e);
assert.deepEqual(activas("/admin"), ["Resumen"]);
assert.deepEqual(activas("/admin/catalogo"), ["Catálogo"]);
assert.deepEqual(activas("/admin/catalogo/afnan-9pm"), ["Catálogo"]);
assert.deepEqual(activas("/admin/catalogo/nueva"), ["Catálogo"]);
assert.deepEqual(activas("/admin/inventario/afnan-9pm"), ["Inventario"]);
assert.deepEqual(activas("/admin/inventarios"), []);
assert.deepEqual(activas("/admin/actividad"), ["Actividad"]);

// Accesibilidad básica declarada en el componente.
for (const requisito of ['aria-current={activa ? "page" : undefined}', 'role="dialog"', 'aria-modal="true"', "aria-expanded={abierto}",
  'aria-controls="nox-admin-menu-movil"', 'e.key === "Escape"', "focus-visible:ring", "cerrarSesion"]) {
  assert.ok(fuente.includes(requisito), `falta: ${requisito}`);
}
console.log("OK: menú lateral — 5 secciones en orden, sección activa y atributos de accesibilidad.");
