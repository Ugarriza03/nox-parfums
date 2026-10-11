/**
 * E2E DE NOX ADMIN SIN SUPABASE REAL — npm run test:admin:e2e
 *
 * Requiere `npm run build` previo. Levanta `next start` tres veces con
 * configuraciones distintas y comprueba, contra el servidor de producción:
 *
 *   A. Sin variables de Supabase (estado controlado)
 *      · la tienda responde igual, con su marco, y el proxy no la toca
 *      · 404 de la tienda: URL inexistente, ficha inexistente, /admin/…
 *      · /admin y todas sus secciones redirigen al login, sin datos
 *      · el login informa "no configurado"; noindex y no-store
 *      · el login no muestra ni transporta el marco de la tienda y el
 *        navegador no descarga código del pedido ni del catálogo
 *      · ningún JavaScript de la tienda contiene código del panel
 *      · sin errores de consola ni de hidratación (tienda y login)
 *   B. Producción sin NOX_ADMIN_HABILITADO → /admin responde la 404 de la tienda
 *   C. Supabase configurado pero inaccesible → errores controlados, sin acceso
 *
 * AISLAMIENTO DEL ENTORNO: cada escenario arranca con un entorno armado desde
 * cero para NOX Admin. `next start` carga .env, .env.local y
 * .env.production(.local) del proyecto; si el desarrollador tiene ahí sus
 * credenciales de Supabase, el escenario A dejaría de ser "sin
 * configuración". Por eso las variables del panel se definen siempre
 * (vacías si corresponde, y Next nunca pisa una variable ya definida) y se
 * marca el entorno como ya procesado para que Next no lea esos archivos.
 *
 * Las pruebas con autenticación real (admin, usuario sin permisos, MFA)
 * necesitan un proyecto de Supabase: ver docs/NOX-ADMIN-PANEL.md.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { analizar, imprimir } from "./diagnostico-aislamiento.mjs";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const NEXT_BIN = require.resolve("next/dist/bin/next", { paths: [raiz] });

let fallas = 0;
let fallasEscenario = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) {
    fallas++;
    fallasEscenario++;
  }
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

/* ------------------------------------------------------ entorno aislado */

// Variables que deciden el comportamiento del panel. Se definen SIEMPRE en el
// proceso hijo: vacías = "no definidas" para la app, pero definidas para
// Next, que así no las toma de los archivos .env* del desarrollador.
const VARIABLES_PANEL = ["NOX_SUPABASE_URL", "NOX_SUPABASE_PUBLISHABLE_KEY", "NOX_ADMIN_HABILITADO", "VERCEL_ENV"];

function entornoAislado(extra) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    // Fuera todo lo que pueda configurar el panel o Supabase desde afuera.
    if (/^(NOX_|SUPABASE|NEXT_PUBLIC_SUPABASE|VERCEL)/.test(k)) continue;
    env[k] = v;
  }
  for (const k of VARIABLES_PANEL) env[k] = "";
  return {
    ...env,
    ...extra,
    NEXT_TELEMETRY_DISABLED: "1",
    // Next no vuelve a leer .env* si el entorno ya figura como procesado.
    __NEXT_PROCESSED_ENV: "true"
  };
}

const archivosEnv = [".env", ".env.local", ".env.production", ".env.production.local"].filter((f) => existsSync(resolve(raiz, f)));
if (archivosEnv.length) {
  console.log(`Aviso: existen ${archivosEnv.join(", ")}. Las pruebas no los usan (entorno aislado).`);
}

/** Puerto TCP local sin nadie escuchando: conexión rechazada al instante. */
async function puertoCerrado() {
  return new Promise((ok, mal) => {
    const s = createServer();
    s.once("error", mal);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });
}

async function conServidor(titulo, puerto, envExtra, fn) {
  console.log(`\n${titulo}\n${"─".repeat(66)}`);
  fallasEscenario = 0;
  const proceso = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(puerto)], {
    cwd: raiz,
    env: entornoAislado(envExtra),
    stdio: ["ignore", "pipe", "pipe"]
  });
  let log = "";
  proceso.stdout.on("data", (d) => (log += d));
  proceso.stderr.on("data", (d) => (log += d));
  const base = `http://127.0.0.1:${puerto}`;
  try {
    const limite = Date.now() + 60_000;
    for (;;) {
      try {
        const r = await fetch(`${base}/`, { redirect: "manual" });
        if (r.status > 0) break;
      } catch {
        if (Date.now() > limite) throw new Error(`next start no respondió en ${puerto}:\n${log}`);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    try {
      await fn(base);
    } catch (e) {
      check(`el escenario terminó sin excepciones`, false, e.message.split("\n")[0]);
    }
  } finally {
    proceso.kill("SIGTERM");
  }
  if (fallasEscenario) console.log(`\nÚltimas líneas del servidor:\n${log.slice(-2500)}`);
  return log;
}

const get = (url, headers = {}) => fetch(url, { redirect: "manual", headers: { "user-agent": "nox-e2e-admin", ...headers } });
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;

// Marcadores. MARCO: el marco visible de la tienda. TIENDA_JS: código del
// pedido y del catálogo. PANEL_JS: código del panel.
const MARCO = /Ir al contenido/;
const TIENDA_JS = /nox\.pedido\.v1|Inspirado en|lattafa-khamrah/;
const PANEL_JS = /registrarMovimiento|Vincular app de autenticación|inventory_movements|NOX_SUPABASE/;

/** HTML sin <script>: lo que efectivamente se ve. */
const visible = (html) => html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
/** Contenido de los <script> en línea (incluye la carga RSC de Next). */
const enLinea = (html) => [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join("\n");
/** Todos los chunks de JavaScript que nombra el HTML (etiquetas y carga RSC). */
function chunksDe(html) {
  const out = new Set();
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) out.add(m[1]);
  for (const m of html.matchAll(/(?:\/_next\/)?static\/chunks\/[A-Za-z0-9._~\-\/]+?\.js/g)) {
    out.add(m[0].startsWith("/_next/") ? m[0] : `/_next/${m[0]}`);
  }
  return [...out];
}
async function chunksConMarcador(base, chunks, marcador) {
  const con = [];
  for (const src of chunks) {
    const r = await get(new URL(src, base).toString());
    if (r.status !== 200) continue;
    if (marcador.test(await r.text())) con.push(src);
  }
  return con;
}

/* ================================================== A. sin configuración */
const logA = await conServidor("A. SIN CONFIGURACIÓN DE SUPABASE", 3107, {}, async (base) => {
  const home = await get(`${base}/`);
  const htmlHome = await home.text();
  check("la home responde 200", home.status === 200);
  check("el proxy no se ejecuta en la tienda (sin cabeceras del panel)", !home.headers.get("x-robots-tag") && !home.headers.get("x-frame-options"));
  check("el HTML de la tienda no incluye nada del panel", !/data-nox-admin|NOX Admin|registrar_movimiento/.test(htmlHome));
  check("la home conserva el marco de la tienda (salto, encabezado y pie)", MARCO.test(htmlHome) && /<header/.test(htmlHome) && /<footer/.test(htmlHome));

  for (const ruta of ["/catalogo", "/fragancia/lattafa-khamrah", "/mi-pedido", "/asesor", "/mayoristas", "/como-comprar", "/envios", "/preguntas-frecuentes", "/contacto"]) {
    const r = await get(`${base}${ruta}`);
    const html = await r.text();
    check(`${ruta} responde 200 con el marco de la tienda`, r.status === 200 && MARCO.test(html) && /<footer/.test(html), String(r.status));
  }

  // 404 de la tienda: misma presentación de siempre.
  for (const ruta of ["/no-existe-nox", "/fragancia/no-existe-nox", "/catalogo/no-existe/nox"]) {
    const r = await get(`${base}${ruta}`);
    const html = await r.text();
    check(
      `${ruta} responde 404 con la página de la tienda`,
      r.status === 404 && /Esta página no existe/.test(html) && MARCO.test(visible(html)) && /<footer/.test(html) && !/data-nox-admin/.test(html),
      String(r.status)
    );
  }
  const adminInexistente = await get(`${base}/admin/no-existe-nox`);
  check(
    "/admin/no-existe-nox responde 404 (noindex) sin nada del panel",
    adminInexistente.status === 404 && /noindex/.test(adminInexistente.headers.get("x-robots-tag") ?? "") && !/data-nox-admin/.test(await adminInexistente.text()),
    String(adminInexistente.status)
  );

  for (const ruta of ["/admin", "/admin/inventario", "/admin/inventario/lattafa-khamrah", "/admin/actividad", "/admin/configuracion", "/admin/mfa"]) {
    const r = await get(`${base}${ruta}`);
    const destino = r.headers.get("location") ?? "";
    const cuerpo = await r.text();
    check(
      `${ruta} redirige al login sin mostrar datos`,
      [303, 307, 308].includes(r.status) && /\/admin\/login$/.test(destino) && !/Stock propio|inventory_/.test(cuerpo),
      `${r.status} → ${destino}`
    );
  }

  const login = await get(`${base}/admin/login`);
  const htmlLogin = await login.text();
  check(
    "el login responde 200 e informa que el panel no está configurado",
    login.status === 200 && /no está configurado/.test(htmlLogin),
    login.status !== 200 ? String(login.status) : /type="password"/.test(htmlLogin) ? "muestra el formulario: el servidor recibió configuración de Supabase (¿variables heredadas o .env*?)" : ""
  );
  check("el login no muestra el formulario sin configuración", !/type="password"/.test(htmlLogin));
  check("cabecera X-Robots-Tag noindex en /admin", /noindex/.test(login.headers.get("x-robots-tag") ?? ""));
  check("meta robots noindex en el HTML del panel", /<meta name="robots" content="noindex/.test(htmlLogin));
  check("respuesta del panel no cacheable", /no-store/.test(login.headers.get("cache-control") ?? ""));

  // Aislamiento del login, en tres niveles:
  //  1. lo que se ve (HTML sin scripts)
  //  2. lo que viaja en la carga RSC en línea (Next serializa ahí, por
  //     ejemplo, el not-found de cada segmento aunque no se muestre)
  //  3. el JavaScript que nombra el HTML y el que el navegador descarga
  const vista = visible(htmlLogin);
  check(
    "el login no muestra el marco de la tienda (salto, encabezado, pie)",
    !MARCO.test(vista) && !/<header|<footer/.test(vista) && /data-nox-admin/.test(vista)
  );
  const rsc = enLinea(htmlLogin);
  check(
    "la carga RSC del login no transporta el marco de la tienda",
    !MARCO.test(rsc) && !/Escribinos por WhatsApp|Mi pedido/.test(rsc),
    (rsc.match(/.{0,60}(Ir al contenido|Escribinos por WhatsApp|Mi pedido).{0,60}/) ?? [""])[0]
  );
  const chunksLogin = chunksDe(htmlLogin);
  const conTienda = await chunksConMarcador(base, chunksLogin, TIENDA_JS);
  check(`los ${chunksLogin.length} chunks que nombra el login no contienen el pedido ni el catálogo`, chunksLogin.length > 0 && conTienda.length === 0, conTienda.join(", "));
  if (conTienda.length) {
    console.log("\nDe dónde vienen, según el manifiesto del build:");
    imprimir(analizar(raiz, conTienda));
  }

  // JavaScript que descarga la tienda: no debe contener código del panel.
  const chunksHome = chunksDe(htmlHome);
  const conPanel = await chunksConMarcador(base, chunksHome, PANEL_JS);
  check(`los ${chunksHome.length} chunks de la home no contienen código del panel`, chunksHome.length > 0 && conPanel.length === 0, conPanel.join(", "));

  // Navegador real: sin errores, y lo que efectivamente descarga.
  const browser = await chromium.launch({ proxy });
  for (const ruta of ["/", "/catalogo", "/fragancia/lattafa-khamrah", "/no-existe-nox", "/admin/login"]) {
    const page = await browser.newPage();
    const errores = [];
    const descargados = [];
    page.on("pageerror", (e) => errores.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|Failed to load resource/.test(m.text())) errores.push(m.text());
    });
    page.on("response", (r) => {
      if (r.url().startsWith(base) && /\.js(\?|$)/.test(r.url())) descargados.push(r);
    });
    await page.goto(`${base}${ruta}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const hidratacion = errores.filter((e) => /hydrat|did not match|server rendered HTML/i.test(e));
    check(`${ruta}: sin errores de consola ni de hidratación`, errores.length === 0, [...hidratacion, ...errores].slice(0, 2).join(" | "));

    if (ruta === "/admin/login") {
      const dom = await page.evaluate(() => ({
        header: document.querySelectorAll("header").length,
        footer: document.querySelectorAll("footer").length,
        salto: document.body.innerText.includes("Ir al contenido"),
        panel: document.querySelectorAll("[data-nox-admin]").length
      }));
      check("en el navegador, el login no tiene encabezado, pie ni salto de la tienda", dom.header === 0 && dom.footer === 0 && !dom.salto && dom.panel === 1, JSON.stringify(dom));
      const conCodigoTienda = [];
      for (const r of descargados) {
        const cuerpo = await r.text().catch(() => "");
        if (TIENDA_JS.test(cuerpo)) conCodigoTienda.push(new URL(r.url()).pathname);
      }
      check(
        `el navegador descarga ${descargados.length} archivos JS en el login y ninguno tiene el pedido ni el catálogo`,
        descargados.length > 0 && conCodigoTienda.length === 0,
        conCodigoTienda.join(", ")
      );
      if (conCodigoTienda.length) imprimir(analizar(raiz, conCodigoTienda));
    }
    await page.close();
  }
  await browser.close();
});

/* ================================================== B. producción deshabilitada */
await conServidor(
  "B. PRODUCCIÓN SIN HABILITAR",
  3108,
  { VERCEL_ENV: "production", NOX_SUPABASE_URL: "https://ejemplo.supabase.co", NOX_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba" },
  async (base) => {
    for (const ruta of ["/admin", "/admin/login", "/admin/inventario", "/admin/mfa"]) {
      const r = await get(`${base}${ruta}`);
      const html = await r.text();
      check(
        `${ruta} responde la 404 de la tienda, sin nada del panel`,
        r.status === 404 && /Esta página no existe/.test(html) && MARCO.test(visible(html)) && !/data-nox-admin|NOX Admin|type="password"/.test(html),
        String(r.status)
      );
    }
    const home = await get(`${base}/`);
    check("la tienda sigue respondiendo 200", home.status === 200);
  }
);

/* ================================================== C. Supabase inaccesible */
const puerto = await puertoCerrado();
const URL_CAIDA = `http://127.0.0.1:${puerto}`;

/**
 * Sesión con forma válida (como la que deja @supabase/ssr) para un proyecto
 * que no responde. No es una credencial: el token no está firmado por ningún
 * proyecto y el servidor de Auth no existe. Sirve para comprobar que, si
 * Supabase no puede verificar una sesión, el panel no la acepta ni la
 * confunde con "no hay sesión".
 */
function cookieSesionDePrueba() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const ahora = Math.floor(Date.now() / 1000);
  const sub = "00000000-0000-4000-8000-0000000000e2";
  const token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub, aud: "authenticated", role: "authenticated", aal: "aal1", exp: ahora + 3600, iat: ahora, email: "e2e@ejemplo.invalid", session_id: sub })}.firma-de-prueba`;
  const sesion = {
    access_token: token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: ahora + 3600,
    refresh_token: "refresh-de-prueba",
    user: { id: sub, aud: "authenticated", role: "authenticated", email: "e2e@ejemplo.invalid", app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() }
  };
  // Clave de almacenamiento de supabase-js: sb-<primer tramo del host>-auth-token
  return `sb-127-auth-token=base64-${b64(sesion)}`;
}

await conServidor(
  "C. SUPABASE CONFIGURADO PERO INACCESIBLE",
  3109,
  { NOX_SUPABASE_URL: URL_CAIDA, NOX_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba" },
  async (base) => {
    const r = await get(`${base}/admin/inventario`);
    check("sin sesión, /admin/inventario redirige al login", [303, 307, 308].includes(r.status) && /\/admin\/login$/.test(r.headers.get("location") ?? ""));

    // Con una sesión que Supabase no puede verificar: sin acceso y con aviso.
    const cookie = cookieSesionDePrueba();
    const conSesion = await get(`${base}/admin/inventario`, { cookie });
    const cuerpoConSesion = await conSesion.text();
    check(
      "con sesión y Supabase caído, /admin/inventario no da acceso (redirige al login)",
      [303, 307, 308].includes(conSesion.status) && /\/admin\/login$/.test(conSesion.headers.get("location") ?? "") && !/Stock propio|inventory_/.test(cuerpoConSesion),
      `${conSesion.status} → ${conSesion.headers.get("location") ?? ""}`
    );
    const loginConSesion = await get(`${base}/admin/login`, { cookie });
    const htmlConSesion = await loginConSesion.text();
    check(
      "con sesión y Supabase caído, el login responde 200 e informa la falla de conexión",
      loginConSesion.status === 200 && /No se pudo conectar con el servicio de autenticación/.test(htmlConSesion),
      String(loginConSesion.status)
    );
    check("el aviso no expone detalles técnicos (host, puerto, causa)", !new RegExp(`ECONNREFUSED|fetch failed|127\\.0\\.0\\.1:${puerto}`).test(visible(htmlConSesion)));

    const browser = await chromium.launch({ proxy });
    const page = await browser.newPage();
    const respuestas = [];
    page.on("response", (res) => respuestas.push(res.status()));
    await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
    check("el formulario de login se muestra", (await page.locator('input[type="password"]').count()) === 1);
    await page.fill('input[name="email"]', "prueba@ejemplo.com");
    await page.fill('input[name="password"]', "contraseña-de-prueba-larga");
    await page.click('button[type="submit"]');
    let alerta = "";
    try {
      await page.waitForSelector('form [role="alert"]', { timeout: 20000 });
      alerta = await page.locator('form [role="alert"]').innerText();
    } catch {
      alerta = `(sin aviso en 20 s; estados HTTP: ${respuestas.join(", ")})`;
    }
    check("con Supabase caído, el login muestra un error controlado", /No se pudo conectar/.test(alerta), alerta);
    check("ninguna respuesta 500 durante el intento de login", !respuestas.some((s) => s >= 500), respuestas.filter((s) => s >= 500).join(", "));
    await browser.close();

    const home = await get(`${base}/`);
    check("la tienda no depende de Supabase (200)", home.status === 200);
  }
);

if (/Error|TypeError/.test(logA) && /admin/i.test(logA)) {
  console.log("\nLog del servidor A con errores:\n" + logA.slice(-2000));
}

console.log("\n" + "─".repeat(66));
if (fallas) {
  console.log(`${fallas} fallas`);
  process.exit(1);
}
console.log("NOX Admin E2E: todo OK");
