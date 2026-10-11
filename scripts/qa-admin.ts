/**
 * QA DE NOX ADMIN (sin red ni base de datos) — npm run qa:admin
 *
 * 1. Lógica pura: configuración, decisión de acceso, validación de
 *    movimientos, estados de stock, filtros y mensajes de error.
 * 2. Revisión estática de seguridad del código: rutas protegidas desde el
 *    servidor, ninguna clave privilegiada, ninguna escritura directa a las
 *    tablas, aislamiento entre tienda y panel, migración sin políticas de
 *    escritura.
 *
 * Las pruebas de la base (RLS, permisos, concurrencia) están en
 * supabase/tests/ (npm run qa:admin:sql) y las de navegador en
 * scripts/admin/e2e-admin.mjs (npm run test:admin:e2e).
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { leerConfigSupabase, panelHabilitado, ADMIN_COOKIE_OPTIONS } from "../src/lib/admin/config";
import { resolverAcceso, destinoDe, clasificarErrorAuth, type EntradaAcceso } from "../src/lib/admin/acceso";
import { validarMovimiento, estadoStock, mensajeDeError } from "../src/lib/admin/inventario-reglas";
import { leerFiltrosActividad, leerFiltrosInventario, filtrarInventario } from "../src/lib/admin/filtros";
import { PRODUCTOS_ADMIN, SLUGS_VALIDOS } from "../src/lib/admin/catalogo";
import { PRODUCT_ID_REGISTRY } from "../src/data/product-ids";

let fallas = 0;
function check(nombre: string, ok: boolean, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}
const seccion = (t: string) => console.log(`\n${t}\n${"─".repeat(66)}`);

/* ====================================================== 1. configuración */
seccion("1. CONFIGURACIÓN");

check("sin variables → no configurado", leerConfigSupabase({}) === null);
check("sólo URL → no configurado", leerConfigSupabase({ NOX_SUPABASE_URL: "https://x.supabase.co" }) === null);
check(
  "URL https + clave publishable → configurado",
  leerConfigSupabase({ NOX_SUPABASE_URL: "https://abc.supabase.co/", NOX_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_123" })
    ?.url === "https://abc.supabase.co"
);
check(
  "URL http remota → rechazada",
  leerConfigSupabase({ NOX_SUPABASE_URL: "http://abc.supabase.co", NOX_SUPABASE_PUBLISHABLE_KEY: "k" }) === null
);
check(
  "http://127.0.0.1 (Supabase local) → aceptada",
  leerConfigSupabase({ NOX_SUPABASE_URL: "http://127.0.0.1:54321", NOX_SUPABASE_PUBLISHABLE_KEY: "k" }) !== null
);
check(
  "clave secreta sb_secret_ en la variable → rechazada",
  leerConfigSupabase({ NOX_SUPABASE_URL: "https://abc.supabase.co", NOX_SUPABASE_PUBLISHABLE_KEY: "sb_secret_xyz" }) === null
);
const jwtServicio = ["e30", Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url"), "firma"].join(".");
check(
  "JWT heredado con rol service_role → rechazado",
  leerConfigSupabase({ NOX_SUPABASE_URL: "https://abc.supabase.co", NOX_SUPABASE_PUBLISHABLE_KEY: jwtServicio }) === null
);
check("URL inválida → no configurado", leerConfigSupabase({ NOX_SUPABASE_URL: "no es url", NOX_SUPABASE_PUBLISHABLE_KEY: "k" }) === null);

check("producción sin NOX_ADMIN_HABILITADO → panel deshabilitado", panelHabilitado({ VERCEL_ENV: "production" }) === false);
check(
  "producción con NOX_ADMIN_HABILITADO=true → habilitado",
  panelHabilitado({ VERCEL_ENV: "production", NOX_ADMIN_HABILITADO: "true" }) === true
);
check("preview / local → habilitado (para probar)", panelHabilitado({ VERCEL_ENV: "preview" }) && panelHabilitado({}));
check(
  "cookies de sesión: httpOnly, sameSite lax, path /admin, 8 h",
  ADMIN_COOKIE_OPTIONS.httpOnly === true &&
    ADMIN_COOKIE_OPTIONS.sameSite === "lax" &&
    ADMIN_COOKIE_OPTIONS.path === "/admin" &&
    ADMIN_COOKIE_OPTIONS.maxAge === 28800
);

/* ====================================================== 2. acceso */
seccion("2. DECISIÓN DE ACCESO");

const base: EntradaAcceso = { habilitado: true, configurado: true, claims: null, estadoDB: null };
const fila = { is_admin_user: true, active: true, mfa_required: false, display_name: "Gabriel", aal: "aal1" };
const casos: [string, EntradaAcceso, string, string | null][] = [
  ["panel deshabilitado", { ...base, habilitado: false }, "deshabilitado", "404"],
  ["sin configuración de Supabase", { ...base, configurado: false }, "no_configurado", "/admin/login"],
  ["usuario no autenticado", base, "sin_sesion", "/admin/login"],
  ["autenticado sin permisos", { ...base, claims: { sub: "u1", email: "x@y.z" } }, "sin_permiso", "/admin/sin-acceso"],
  ["admin desactivado", { ...base, claims: { sub: "u1" }, estadoDB: { ...fila, active: false } }, "sin_permiso", "/admin/sin-acceso"],
  ["error de la base", { ...base, claims: { sub: "u1" }, errorDB: "caída" }, "error", "/admin/login"],
  ["Supabase Auth inaccesible (sin claims)", { ...base, errorAuth: "sin conexión" }, "error", "/admin/login"],
  ["Supabase Auth inaccesible no concede acceso aunque la base diga admin", { ...base, errorAuth: "sin conexión", estadoDB: fila }, "error", "/admin/login"],
  ["admin con MFA exigido y sesión aal1", { ...base, claims: { sub: "u1", aal: "aal1" }, estadoDB: { ...fila, mfa_required: true } }, "requiere_mfa", "/admin/mfa"],
  ["admin con MFA exigido y sesión aal2", { ...base, claims: { sub: "u1", aal: "aal2" }, estadoDB: { ...fila, mfa_required: true } }, "ok", null],
  ["admin autorizado sin MFA exigido", { ...base, claims: { sub: "u1" }, estadoDB: fila }, "ok", null]
];
for (const [nombre, entrada, estado, destino] of casos) {
  const a = resolverAcceso(entrada);
  check(`${nombre} → ${estado}`, a.estado === estado && destinoDe(a) === destino, `${a.estado} / ${destinoDe(a)}`);
}
{
  const clases: [string, unknown, string | null][] = [
    ["sin error", null, null],
    ["AuthRetryableFetchError (red caída, status 0)", { name: "AuthRetryableFetchError", status: 0 }, "conexion"],
    ["AuthRetryableFetchError 503", { name: "AuthRetryableFetchError", status: 503 }, "conexion"],
    ["AuthUnknownError", { name: "AuthUnknownError" }, "conexion"],
    ["error sin status (excepción de fetch)", new TypeError("fetch failed"), "conexion"],
    ["500 del servidor de Auth", { name: "AuthApiError", status: 500 }, "conexion"],
    ["sesión inexistente (AuthSessionMissingError 400)", { name: "AuthSessionMissingError", status: 400 }, "sesion"],
    ["JWT inválido (AuthInvalidJwtError 400)", { name: "AuthInvalidJwtError", status: 400 }, "sesion"],
    ["refresh token revocado (AuthApiError 400)", { name: "AuthApiError", status: 400 }, "sesion"],
    ["credenciales incorrectas (AuthApiError 400)", { name: "AuthApiError", status: 400, code: "invalid_credentials" }, "sesion"],
    ["token vencido (AuthApiError 401)", { name: "AuthApiError", status: 401 }, "sesion"],
    ["límite de intentos (429)", { name: "AuthApiError", status: 429 }, "sesion"]
  ];
  for (const [nombre, error, esperado] of clases) {
    const r = clasificarErrorAuth(error);
    check(`error de Auth: ${nombre} → ${esperado ?? "ninguno"}`, r === esperado, String(r));
  }
}
check(
  "la pantalla de MFA admite aal1 sólo si se pide explícitamente",
  destinoDe(resolverAcceso(casos.find(([n]) => n === "admin con MFA exigido y sesión aal1")![1]), { permitirAal1: true }) === null
);

/* ====================================================== 3. movimientos */
seccion("3. VALIDACIÓN DE MOVIMIENTOS");

const rid = "6f1c2b7e-2d7a-4c1e-9b1a-0c8d3e5f7a90";
const ok = (e: Record<string, unknown>) => validarMovimiento({ requestId: rid, productSlug: "lattafa-khamrah", ...e }, SLUGS_VALIDOS);
check("ingreso válido", ok({ tipo: "ingreso", cantidad: "3" }).ok);
check("egreso válido con motivo opcional vacío", ok({ tipo: "egreso", cantidad: "1", motivo: "  " }).ok);
check("carga inicial de 0 con motivo (cero confirmado)", ok({ tipo: "carga_inicial", cantidad: "0", motivo: "Conteo físico" }).ok);
check("carga inicial sin motivo → rechazada", !ok({ tipo: "carga_inicial", cantidad: "5" }).ok);
check("ajuste sin motivo → rechazado", !ok({ tipo: "ajuste", cantidad: "4", motivo: "" }).ok);
check("ajuste con motivo → válido", ok({ tipo: "ajuste", cantidad: "4", motivo: "Recuento" }).ok);
check("cantidad negativa → rechazada", !ok({ tipo: "ingreso", cantidad: "-1" }).ok);
check("cantidad decimal → rechazada", !ok({ tipo: "ingreso", cantidad: "1.5" }).ok);
check("ingreso de 0 → rechazado", !ok({ tipo: "ingreso", cantidad: "0" }).ok);
check("cantidad mayor al máximo → rechazada", !ok({ tipo: "ingreso", cantidad: "100001" }).ok);
check("tipo desconocido → rechazado", !ok({ tipo: "venta", cantidad: "1" }).ok);
check("motivo de más de 500 caracteres → rechazado", !ok({ tipo: "ingreso", cantidad: "1", motivo: "x".repeat(501) }).ok);
check(
  "producto fuera del registro de identificadores → rechazado",
  !validarMovimiento({ requestId: rid, productSlug: "producto-inventado", tipo: "ingreso", cantidad: "1" }, SLUGS_VALIDOS).ok
);
check(
  "request_id que no es UUID → rechazado",
  !validarMovimiento({ requestId: "123", productSlug: "lattafa-khamrah", tipo: "ingreso", cantidad: "1" }, SLUGS_VALIDOS).ok
);

/* ====================================================== 4. estados */
seccion("4. ESTADO DEL STOCK PROPIO");

check("sin fila de inventario → sin_registro", estadoStock(null, 1) === "sin_registro");
check("stock 0 confirmado → sin_stock (distinto de sin_registro)", estadoStock(0, 1) === "sin_stock");
check("stock 1 con umbral global 1 → stock_bajo", estadoStock(1, 1) === "stock_bajo");
check("stock 2 → con_stock", estadoStock(2, 1) === "con_stock");
check("NX423 → mensaje de stock insuficiente", /Stock insuficiente/.test(mensajeDeError({ code: "NX423", message: "x" })));
check("NX401 → no autorizado", /autorizaci/.test(mensajeDeError({ code: "NX401" })));
check("error desconocido → mensaje genérico sin detalles internos", !/select|relation|pg_/i.test(mensajeDeError({ code: "XX000", message: "relation pg_x" })));

/* ====================================================== 5. filtros y catálogo */
seccion("5. FILTROS Y CATÁLOGO DEL PANEL");

const fa = leerFiltrosActividad(
  { producto: "inventado", tipo: "borrar", desde: "2026-02-30", hasta: "2026-10-01", antes: "1;drop" },
  SLUGS_VALIDOS
);
check(
  "parámetros de la URL inválidos se descartan",
  !fa.producto && !fa.tipo && !fa.desde && fa.hasta === "2026-10-01" && !fa.antesDeId,
  JSON.stringify(fa)
);
const fi = leerFiltrosInventario({ q: "khamrah", estado: "inventado" });
check("estado de inventario desconocido se ignora", fi.estado === undefined && fi.q === "khamrah");
const filtradas = filtrarInventario(
  PRODUCTOS_ADMIN.map((p) => ({ ...p, estado: "sin_registro" as const })),
  { q: "khamrah" }
);
check("la búsqueda encuentra por nombre sin importar mayúsculas/acentos", filtradas.length >= 1 && filtradas.every((f) => /khamrah/.test(f.slug)));
check("el panel ve los 233 productos del registro de identificadores", PRODUCTOS_ADMIN.length === 233 && PRODUCT_ID_REGISTRY.length === 233);
check(
  "los slugs del panel son exactamente los del registro",
  PRODUCTOS_ADMIN.every((p, i) => p.slug === PRODUCT_ID_REGISTRY[i].slug)
);
check(
  "el panel no expone perfiles olfativos ni procedencia",
  PRODUCTOS_ADMIN.every((p) => !("olfactory" in p) && !("source" in p))
);

/* ====================================================== 6. revisión estática */
seccion("6. REVISIÓN ESTÁTICA DE SEGURIDAD");

const enPosix = (r: string) => r.split(sep).join("/");
function archivos(dir: string): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const r = join(dir, n);
    if (statSync(r).isDirectory()) out.push(...archivos(r));
    else if (/\.(ts|tsx)$/.test(n)) out.push(enPosix(r));
  }
  return out;
}
const sinComentarios = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
const leer = (f: string) => sinComentarios(readFileSync(f, "utf8"));

const fuentes = archivos("src");
const delPanel = fuentes.filter((f) => f.startsWith("src/app/admin/") || f.startsWith("src/components/admin/") || f.startsWith("src/lib/admin/") || f === "src/proxy.ts");
const publicos = fuentes.filter((f) => !delPanel.includes(f));

// config.ts es el único que menciona estas claves: para RECHAZARLAS.
const conClavePrivilegiada = fuentes.filter(
  (f) => !f.endsWith("src/lib/admin/config.ts") && /service_role|sb_secret_|SERVICE_ROLE/i.test(leer(f))
);
check(
  "ningún archivo usa claves privilegiadas (service_role / sb_secret)",
  conClavePrivilegiada.length === 0,
  conClavePrivilegiada.join(", ")
);
check(
  "las variables de Supabase no son NEXT_PUBLIC_ (no se incrustan en el navegador)",
  !fuentes.some((f) => /NEXT_PUBLIC_SUPABASE/.test(leer(f)))
);
const clientesPanel = delPanel.filter((f) => /^\s*["']use client["']/.test(readFileSync(f, "utf8")));
const importaServidor = clientesPanel.filter((f) => /@\/lib\/admin\/(sesion|supabase|datos|config)|@supabase\//.test(leer(f)));
check("ningún componente de cliente importa el cliente de Supabase ni la sesión", importaServidor.length === 0, importaServidor.join(", "));
const tiendaImportaPanel = publicos.filter((f) => /@\/(lib|components)\/admin|@supabase\//.test(leer(f)));
check("la tienda pública no importa nada del panel ni de Supabase", tiendaImportaPanel.length === 0, tiendaImportaPanel.join(", "));
const escrituraDirecta = fuentes.filter((f) =>
  /from\(\s*["'](inventory_items|inventory_movements|admin_users|inventory_settings)["']\s*\)[\s\S]{0,200}\.(insert|update|upsert|delete)\(/.test(leer(f))
);
check("no hay escrituras directas a tablas: sólo registrar_movimiento()", escrituraDirecta.length === 0, escrituraDirecta.join(", "));

const paginasPanel = delPanel.filter((f) => /src\/app\/admin\/\(panel\)\/.*page\.tsx$/.test(f));
const sinGuardia = paginasPanel.filter((f) => !/await requerirAdmin\(/.test(leer(f)));
check(`las ${paginasPanel.length} páginas del panel verifican al administrador en el servidor`, paginasPanel.length >= 5 && sinGuardia.length === 0, sinGuardia.join(", "));
check("el layout del panel también verifica", /await requerirAdmin\(/.test(leer("src/app/admin/(panel)/layout.tsx")));

const acciones = leer("src/app/admin/acciones.ts");
const funciones = [...acciones.matchAll(/export async function (\w+)\([\s\S]*?\n}/g)];
const sinVerificar = funciones.filter(([cuerpo]) => !/requerirAdmin\(|obtenerAcceso\(/.test(cuerpo)).map(([, n]) => n);
check(`las ${funciones.length} acciones de servidor verifican la sesión`, funciones.length >= 5 && sinVerificar.length === 0, sinVerificar.join(", "));
check("las acciones usan getClaims (no getSession) para decidir", !/getSession\(/.test(leer("src/lib/admin/sesion.ts")) && /getClaims\(/.test(leer("src/lib/admin/sesion.ts")));

const proxy = readFileSync("src/proxy.ts", "utf8");
const matcher = /matcher:\s*\[([^\]]*)\]/.exec(proxy)?.[1] ?? "";
check(
  "el proxy sólo se ejecuta en /admin",
  /export async function proxy\(/.test(proxy) && matcher.split(",").map((m) => m.trim()).every((m) => /^"\/admin(\/:path\*)?"$/.test(m)),
  matcher.trim()
);
check("el panel no se indexa (robots noindex en el layout)", /index:\s*false/.test(readFileSync("src/app/admin/layout.tsx", "utf8")));
check("el panel es dinámico (no se prerenderiza en el build)", /dynamic\s*=\s*"force-dynamic"/.test(readFileSync("src/app/admin/layout.tsx", "utf8")));

/* ---------------------------------------------- separación tienda / panel */

// Dos layouts raíz, sin layout ni 404 compartidos. Next responde los
// notFound() que no se resuelven dentro del árbol con la 404 del layout raíz
// de esa ruta: así la tienda usa la suya y /admin no incluye nada de ella.
check(
  "no hay layout ni 404 raíz compartidos (src/app/layout.tsx y src/app/not-found.tsx no existen)",
  !existsSync("src/app/layout.tsx") && !existsSync("src/app/not-found.tsx")
);
const layoutTienda = leer("src/app/(tienda)/layout.tsx");
const layoutAdmin = leer("src/app/admin/layout.tsx");
check(
  "la tienda y el panel tienen cada uno su layout raíz con el documento compartido",
  /<Documento>/.test(layoutTienda) && /<Documento>/.test(layoutAdmin)
);
const documento = leer("src/components/documento/Documento.tsx");
check(
  "el documento compartido sólo arma <html>, tipografías y estilos (sin tienda ni panel)",
  /<html lang="es-AR"/.test(documento) && /<body>/.test(documento) &&
    [...documento.matchAll(/from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g)].every(([, a, b]) => ["react", "@/app/globals.css"].includes(a ?? b))
);
check("el layout de la tienda usa TiendaChrome y conserva su metadata", /<TiendaChrome>/.test(layoutTienda) && /metadataBase/.test(layoutTienda) && /openGraph/.test(layoutTienda));
check(
  "el layout del panel no incluye el marco de la tienda (Header, Footer, OrderBar, pedido)",
  !/Header|Footer|OrderBar|OrderProvider|TiendaChrome|@\/store\//.test(layoutAdmin)
);
check(
  "la 404 de la tienda es la de su layout raíz y muestra NoEncontrado dentro del marco",
  /<NoEncontrado \/>/.test(leer("src/app/(tienda)/not-found.tsx")) && !/TiendaChrome/.test(leer("src/app/(tienda)/not-found.tsx"))
);
check(
  "las URLs inexistentes caen en (tienda)/[...noEncontrada] y responden notFound()",
  existsSync("src/app/(tienda)/[...noEncontrada]/page.tsx") && /notFound\(\)/.test(leer("src/app/(tienda)/[...noEncontrada]/page.tsx"))
);
check(
  "la 404 del panel es neutral: no importa nada de la tienda",
  existsSync("src/app/admin/not-found.tsx") &&
    ![...leer("src/app/admin/not-found.tsx").matchAll(/from\s+["']([^"']+)["']/g)].some(([, r]) => r !== "next/link")
);
check(
  "con el panel deshabilitado, el proxy responde la 404 de la tienda",
  /if \(!panelHabilitado\(\)\)\s*\{\s*return conCabeceras\(NextResponse\.rewrite\(new URL\(RUTA_INEXISTENTE/.test(leer("src/proxy.ts"))
);
const chrome = leer("src/components/layout/TiendaChrome.tsx");
check(
  "TiendaChrome conserva OrderProvider, Header, <main id=contenido>, Footer y OrderBar",
  ["<OrderProvider>", "<Header />", 'id="contenido"', "<Footer />", "<OrderBar />"].every((t) => chrome.includes(t))
);
const RUTAS_PUBLICAS = ["page.tsx", "catalogo/page.tsx", "fragancia/[slug]/page.tsx", "asesor/page.tsx", "mi-pedido/page.tsx", "mayoristas/page.tsx", "como-comprar/page.tsx", "envios/page.tsx", "preguntas-frecuentes/page.tsx", "contacto/page.tsx"];
const faltantes = RUTAS_PUBLICAS.filter((r) => !existsSync(`src/app/(tienda)/${r}`));
const fuera = RUTAS_PUBLICAS.filter((r) => r !== "page.tsx" && existsSync(`src/app/${r}`));
check("las 10 rutas públicas viven en (tienda) y no quedan duplicadas fuera", faltantes.length === 0 && fuera.length === 0 && !existsSync("src/app/page.tsx"), [...faltantes, ...fuera].join(", "));

/** Archivos que alcanza un módulo siguiendo imports @/… y relativos. */
function alcanzables(inicio: string[], cortarEn: (f: string, texto: string) => boolean): Set<string> {
  const vistos = new Set<string>();
  const pendientes = [...inicio];
  while (pendientes.length) {
    const f = pendientes.pop()!;
    if (vistos.has(f)) continue;
    vistos.add(f);
    const texto = readFileSync(f, "utf8");
    if (cortarEn(f, texto)) continue;
    for (const [, ruta] of sinComentarios(texto).matchAll(/from\s+["']([^"']+)["']/g)) {
      let base: string | null = null;
      if (ruta.startsWith("@/")) base = `src/${ruta.slice(2)}`;
      else if (ruta.startsWith(".")) base = enPosix(join(f, "..", ruta));
      if (!base) continue;
      const candidato = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find((c) => existsSync(c));
      if (candidato) pendientes.push(candidato);
    }
  }
  return vistos;
}
// Lo que descarga el navegador en /admin: los componentes de cliente del
// panel y lo que importan. Un módulo "use server" llega como referencia, no
// como código, así que ahí se corta el recorrido.
const deCliente = alcanzables(clientesPanel, (f, t) => !clientesPanel.includes(f) && /^\s*["']use server["']/.test(t));
const deTienda = [...deCliente].filter((f) => /src\/(store|components\/(layout|order|product|home|ui)|data)\//.test(f));
check(
  `el JavaScript de cliente del panel (${deCliente.size} módulos) no incluye pedido, catálogo ni componentes de la tienda`,
  deTienda.length === 0,
  deTienda.join(", ")
);

// Árbol que Next arma para CADA ruta de /admin: los archivos especiales del
// nivel raíz (layout, not-found, error, loading, template…) más los de
// src/app/admin. Next serializa el not-found de cada segmento como parte de la
// página aunque no se muestre, así que los componentes de cliente que
// alcance cualquiera de estos archivos se descargan en /admin/login.
const ESPECIALES = /^(layout|page|not-found|error|global-error|loading|template|default|forbidden|unauthorized)\.(tsx|ts|jsx|js)$/;
const especialesRaiz = readdirSync("src/app").filter((n) => ESPECIALES.test(n)).map((n) => `src/app/${n}`);
const especialesAdmin = archivos("src/app/admin").filter((f) => ESPECIALES.test(f.split("/").pop()!));
const raicesArbolAdmin = [...especialesRaiz, ...especialesAdmin];
function clientesDelArbol(raices: string[]): Set<string> {
  const vistos = new Set<string>();
  const clientes = new Set<string>();
  const pendientes = [...raices];
  while (pendientes.length) {
    const f = pendientes.pop()!;
    if (vistos.has(f)) continue;
    vistos.add(f);
    const texto = readFileSync(f, "utf8");
    if (/^\s*["']use client["']/.test(texto)) {
      clientes.add(f);
      continue;
    }
    if (!raices.includes(f) && /^\s*["']use server["']/.test(texto)) continue;
    for (const [, ruta] of sinComentarios(texto).matchAll(/from\s+["']([^"']+)["']/g)) {
      let base: string | null = null;
      if (ruta.startsWith("@/")) base = `src/${ruta.slice(2)}`;
      else if (ruta.startsWith(".")) base = enPosix(join(f, "..", ruta));
      if (!base) continue;
      const candidato = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find((c) => existsSync(c));
      if (candidato) pendientes.push(candidato);
    }
  }
  return clientes;
}
const clientesArbolAdmin = clientesDelArbol(raicesArbolAdmin);
const codigoNavegadorAdmin = alcanzables([...clientesArbolAdmin], (f, t) => !clientesArbolAdmin.has(f) && /^\s*["']use server["']/.test(t));
const tiendaEnAdmin = [...codigoNavegadorAdmin].filter((f) => /src\/(store|components\/(layout|order|product|home|ui)|data)\//.test(f));
const culpables = especialesRaiz.filter((r) =>
  [...clientesDelArbol([r])].some((c) => [...alcanzables([c], () => false)].some((f) => /src\/(store|components\/(layout|order|product|home|ui)|data)\//.test(f)))
);
check(
  `ninguna ruta de /admin descarga código de la tienda (árbol completo: ${raicesArbolAdmin.length} archivos de Next, ${codigoNavegadorAdmin.size} módulos de cliente)`,
  tiendaEnAdmin.length === 0,
  `${tiendaEnAdmin.slice(0, 6).join(", ")}${culpables.length ? ` · lo introduce: ${culpables.join(", ")}` : ""}`
);
const desdeLayoutAdmin = alcanzables(["src/app/admin/layout.tsx"], () => false);
check(
  "el layout del panel no importa nada del marco de la tienda",
  ![...desdeLayoutAdmin].some((f) => /src\/(store|components\/(layout|order))\//.test(f))
);

const migraciones = existsSync("supabase/migrations") ? readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql")) : [];
const sql = migraciones
  .map((f) => readFileSync(join("supabase/migrations", f), "utf8"))
  .join("\n")
  .replace(/--.*$/gm, " ");
check("hay migración versionada del inventario", migraciones.length >= 1);
check("la migración no crea políticas de escritura", !/create policy[^;]*for\s+(insert|update|delete|all)/i.test(sql));
check("las funciones SECURITY DEFINER fijan search_path vacío", (sql.match(/security definer/gi) ?? []).length === (sql.match(/security definer\s+set search_path = ''/gi) ?? []).length && /security definer/i.test(sql));
check("la migración revoca los privilegios por defecto de anon", /revoke all on table[\s\S]*from public, anon, authenticated/i.test(sql));

let versionados: string[] = [];
try {
  versionados = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n");
} catch {
  versionados = [];
}
const envVersionados = versionados.filter((f) => /(^|\/)\.env(\..*)?$/.test(f) && !f.endsWith(".env.example"));
check("no hay archivos .env versionados (salvo .env.example)", envVersionados.length === 0, envVersionados.join(", "));

console.log("\n" + "─".repeat(66));
if (fallas) {
  console.log(`${fallas} fallas`);
  process.exit(1);
}
console.log("NOX Admin: todo OK");
