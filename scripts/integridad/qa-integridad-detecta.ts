/**
 * QA DEL VERIFICADOR DE INTEGRIDAD — npm run qa:integridad
 *
 * Prueba que el verificador realmente detecta cada tipo de daño. Parte del
 * manifiesto del catálogo actual y aplica alteraciones sobre COPIAS en
 * memoria: no toca ningún archivo de datos ni de imágenes.
 */

import { construirManifiesto, type Manifiesto } from "./manifiesto";
import { compararManifiestos } from "./comparar";

let fallas = 0;
function check(nombre: string, ok: boolean, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

const base = construirManifiesto();
const copia = (): Manifiesto => JSON.parse(JSON.stringify(base));
const p = (m: Manifiesto, slug: string) => m.productos.find((x) => x.slug === slug)!;

function detecta(nombre: string, categoria: string, alterar: (m: Manifiesto) => void) {
  const m = copia();
  alterar(m);
  const problemas = compararManifiestos(base, m);
  const hallado = (problemas[categoria] ?? []).length > 0;
  check(`detecta: ${nombre}`, hallado, hallado ? problemas[categoria][0] : `categorías: ${Object.keys(problemas).join(", ") || "ninguna"}`);
}

console.log("\nVERIFICADOR DE INTEGRIDAD\n" + "─".repeat(66));

check("sin alteraciones no reporta nada", Object.keys(compararManifiestos(base, copia())).length === 0);

detecta("cambio de slug (mismo producto, otro identificador)", "Cambios de slug", (m) => {
  p(m, "christian-dior-sauvage").slug = "christian-dior-sauvage-masculino";
  p(m, "christian-dior-sauvage-masculino").id = "christian-dior-sauvage-masculino";
});
detecta("producto eliminado", "Productos eliminados", (m) => {
  m.productos = m.productos.filter((x) => x.slug !== "ariana-grande-cloud");
});
detecta("producto duplicado", "Productos duplicados", (m) => {
  m.productos.push(JSON.parse(JSON.stringify(p(m, "lattafa-khamrah"))));
});
detecta("producto nuevo sin aprobar", "Productos nuevos sin aprobar", (m) => {
  const nuevo = JSON.parse(JSON.stringify(p(m, "lattafa-khamrah")));
  Object.assign(nuevo, { slug: "casa-ficticia-prueba", id: "casa-ficticia-prueba", casa: "Casa Ficticia", nombre: "Prueba" });
  m.productos.push(nuevo);
});
detecta("portada faltante", "Portadas", (m) => {
  Object.assign(p(m, "lattafa-khamrah").portada, { existe: false, sha256: null, bytes: null });
});
detecta("portada reemplazada por otra imagen", "Portadas", (m) => {
  p(m, "lattafa-khamrah").portada.sha256 = p(m, "afnan-9pm").portada.sha256;
});
detecta("portada con otra ruta", "Portadas", (m) => {
  p(m, "lattafa-khamrah").portada.ruta = "/products/covers/otra.webp";
});
detecta("portada con otras dimensiones", "Portadas", (m) => {
  p(m, "lattafa-khamrah").portada.ancho = 1000;
});
detecta("perfil olfativo desenganchado", "Perfiles olfativos", (m) => {
  Object.assign(p(m, "afnan-9pm").perfilOlfativo, { existe: false, sha256: null });
});
detecta("perfil olfativo modificado", "Perfiles olfativos", (m) => {
  p(m, "afnan-9pm").perfilOlfativo.sha256 = "0".repeat(64);
});
detecta("cambio de nombre o casa", "Datos protegidos", (m) => {
  p(m, "afnan-9pm").casa = "Armaf";
});
detecta("cambio de género", "Datos protegidos", (m) => {
  p(m, "afnan-9pm").genero = "unisex";
});
detecta("cambio de universo", "Datos protegidos", (m) => {
  p(m, "afnan-9pm").universo = "nicho";
});
detecta("destacada que apunta a un producto inexistente", "Destacadas", (m) => {
  m.destacadas[0] = "no-existe";
});
detecta("cambio de precios o promociones", "Precios, promociones o regalos", (m) => {
  m.sha256.comercial = "0".repeat(64);
});
detecta("cambio en el registro de identificadores", "Datos protegidos", (m) => {
  m.sha256.registroIdentificadores = "0".repeat(64);
});
detecta("cambio en la clasificación de casas", "Datos protegidos", (m) => {
  m.sha256.clasificacionCasas = "0".repeat(64);
});

console.log("\n" + "─".repeat(66));
if (fallas) {
  console.log(`${fallas} fallas`);
  process.exit(1);
}
console.log("El verificador detecta todos los casos probados");
