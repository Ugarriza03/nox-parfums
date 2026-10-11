/**
 * E2E DE NOX ADMIN SIN SUPABASE REAL — npm run test:admin:e2e
 *
 * Requiere `npm run build` previo. Levanta `next start` tres veces con
 * configuraciones distintas y comprueba, contra el servidor de producción:
 *
 *   A. Sin variables de Supabase (estado controlado)
 *      · la tienda responde igual y el proxy no la toca
 *      · /admin y todas sus secciones redirigen al login, sin datos
 *      · el login informa "no configurado"; noindex y no-store
 *      · ningún JavaScript de la tienda contiene código del panel
 *      · sin errores de consola ni de hidratación (tienda y login)
 *   B. Producción sin NOX_ADMIN_HABILITADO → /admin responde 404
 *   C. Supabase configurado pero inaccesible → login con error controlado
 *
 * Las pruebas con autenticación real (admin, usuario sin permisos, MFA)
 * necesitan un proyecto de Supabase: ver docs/NOX-ADMIN-PANEL.md.
 */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const NEXT_BIN = require.resolve("next/dist/bin/next", { paths: [raiz] });

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

const ENV_BASE = { ...process.env };
for (const k of ["NOX_SUPABASE_URL", "NOX_SUPABASE_PUBLISHABLE_KEY", "NOX_ADMIN_HABILITADO", "VERCEL_ENV"]) delete ENV_BASE[k];

async function conServidor(puerto, envExtra, fn) {
  const proceso = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(puerto)], {
    cwd: raiz,
    env: { ...ENV_BASE, ...envExtra, NEXT_TELEMETRY_DISABLED: "1" },
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
    await fn(base);
  } finally {
    proceso.kill("SIGTERM");
  }
  return log;
}

const get = (url) => fetch(url, { redirect: "manual", headers: { "user-agent": "nox-e2e-admin" } });
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;

/* ================================================== A. sin configuración */
console.log("\nA. SIN CONFIGURACIÓN DE SUPABASE\n" + "─".repeat(66));
const logA = await conServidor(3107, {}, async (base) => {
  const home = await get(`${base}/`);
  const htmlHome = await home.text();
  check("la home responde 200", home.status === 200);
  check("el proxy no se ejecuta en la tienda (sin cabeceras del panel)", !home.headers.get("x-robots-tag") && !home.headers.get("x-frame-options"));
  check("el HTML de la tienda no incluye nada del panel", !/data-nox-admin|NOX Admin|registrar_movimiento/.test(htmlHome));

  for (const ruta of ["/catalogo", "/fragancia/lattafa-khamrah", "/mi-pedido", "/asesor", "/mayoristas"]) {
    const r = await get(`${base}${ruta}`);
    check(`${ruta} responde 200`, r.status === 200, String(r.status));
  }

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
  check("el login responde 200 e informa que el panel no está configurado", login.status === 200 && /no está configurado/.test(htmlLogin));
  check("el login no muestra el formulario sin configuración", !/type="password"/.test(htmlLogin));
  check("cabecera X-Robots-Tag noindex en /admin", /noindex/.test(login.headers.get("x-robots-tag") ?? ""));
  check("meta robots noindex en el HTML del panel", /<meta name="robots" content="noindex/.test(htmlLogin));
  check("respuesta del panel no cacheable", /no-store/.test(login.headers.get("cache-control") ?? ""));

  // JavaScript que descarga la tienda: no debe contener código del panel.
  const scripts = [...htmlHome.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  let conPanel = [];
  for (const src of scripts) {
    const js = await (await get(new URL(src, base).toString())).text();
    if (/registrarMovimiento|Vincular app de autenticación|inventory_movements|NOX_SUPABASE/.test(js)) conPanel.push(src);
  }
  check(`los ${scripts.length} scripts de la home no contienen código del panel`, scripts.length > 0 && conPanel.length === 0, conPanel.join(", "));

  // Navegador real: sin errores de consola ni de hidratación.
  const browser = await chromium.launch({ proxy });
  for (const ruta of ["/", "/catalogo", "/fragancia/lattafa-khamrah", "/admin/login"]) {
    const page = await browser.newPage();
    const errores = [];
    page.on("pageerror", (e) => errores.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|Failed to load resource/.test(m.text())) errores.push(m.text());
    });
    await page.goto(`${base}${ruta}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const hidratacion = errores.filter((e) => /hydrat|did not match|server rendered HTML/i.test(e));
    check(`${ruta}: sin errores de consola ni de hidratación`, errores.length === 0, [...hidratacion, ...errores].slice(0, 2).join(" | "));
    await page.close();
  }
  await browser.close();
});

/* ================================================== B. producción deshabilitada */
console.log("\nB. PRODUCCIÓN SIN HABILITAR\n" + "─".repeat(66));
await conServidor(
  3108,
  { VERCEL_ENV: "production", NOX_SUPABASE_URL: "https://ejemplo.supabase.co", NOX_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba" },
  async (base) => {
    for (const ruta of ["/admin", "/admin/login", "/admin/inventario"]) {
      const r = await get(`${base}${ruta}`);
      check(`${ruta} responde 404 en producción sin NOX_ADMIN_HABILITADO`, r.status === 404, String(r.status));
    }
    const home = await get(`${base}/`);
    check("la tienda sigue respondiendo 200", home.status === 200);
  }
);

/* ================================================== C. Supabase inaccesible */
console.log("\nC. SUPABASE CONFIGURADO PERO INACCESIBLE\n" + "─".repeat(66));
await conServidor(
  3109,
  { NOX_SUPABASE_URL: "http://127.0.0.1:9", NOX_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba" },
  async (base) => {
    const r = await get(`${base}/admin/inventario`);
    check("sin sesión, /admin/inventario redirige al login", [303, 307, 308].includes(r.status) && /\/admin\/login$/.test(r.headers.get("location") ?? ""));

    const browser = await chromium.launch({ proxy });
    const page = await browser.newPage();
    await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
    check("el formulario de login se muestra", (await page.locator('input[type="password"]').count()) === 1);
    await page.fill('input[name="email"]', "prueba@ejemplo.com");
    await page.fill('input[name="password"]', "contraseña-de-prueba-larga");
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="alert"]', { timeout: 15000 });
    const alerta = await page.locator('[role="alert"]').innerText();
    check(
      "con Supabase caído, el login muestra un error controlado (sin 500)",
      /No se pudo conectar/.test(alerta),
      alerta
    );
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
console.log("E2E NOX Admin (sin Supabase real): todo OK");
