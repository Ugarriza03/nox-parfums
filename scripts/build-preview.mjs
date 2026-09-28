/**
 * Genera dist-preview/index.html: un único HTML navegable con toda la tienda.
 * Usa los mismos componentes que el proyecto Next.js, con shims para
 * next/link y next/navigation. No reemplaza al build de Next.
 *
 *   node scripts/build-preview.mjs
 */

import { build } from "esbuild";
import { buildCss, collectClasses } from "./build-css.mjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "dist-preview");
mkdirSync(outDir, { recursive: true });

/* 1. Bundle de la aplicación ------------------------------------------- */

const result = await build({
  entryPoints: [resolve(root, "preview/entry.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  tsconfig: resolve(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "next/link": resolve(root, "preview/shims/link.tsx"),
    "next/navigation": resolve(root, "preview/shims/navigation.tsx")
  },
  write: false,
  logLevel: "info"
});

let js = result.outputFiles[0].text;

/* 1bis. Portadas reales incrustadas ------------------------------------- */
/*
 * El preview es un HTML standalone que se abre con doble clic: no hay servidor
 * que sirva /products/covers/*, así que cada portada se reemplaza por su data
 * URI. Sin esto, los productos con foto saldrían con la imagen rota.
 * Sólo lectura de archivos y base64: no agrega ninguna dependencia.
 */
const coversDir = resolve(root, "public/products/covers");
/*
 * Para el HTML autónomo se incrusta un derivado de 640 px (el hero se muestra a
 * 614 px), no el original de 1122 px: con 203 portadas la diferencia es de ~61 MB
 * a ~17 MB y en pantalla no se nota. El sitio real sigue sirviendo el original.
 */
const previewDir = resolve(coversDir, "preview");
const MIME = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
let incrustadas = 0;
let bytesPortadas = 0;

if (existsSync(coversDir)) {
  for (const archivo of readdirSync(coversDir).sort()) {
    const mime = MIME[extname(archivo).toLowerCase()];
    if (!mime) continue;
    const ruta = `/products/covers/${archivo}`;
    if (!js.includes(ruta)) continue;
    const liviano = resolve(previewDir, archivo);
    const datos = readFileSync(existsSync(liviano) ? liviano : resolve(coversDir, archivo));
    js = js.split(ruta).join(`data:${mime};base64,${datos.toString("base64")}`);
    incrustadas += 1;
    bytesPortadas += datos.length;
  }
}

/* Ninguna ruta de portada puede sobrevivir: en el HTML standalone estaría rota. */
const huerfanas = [...js.matchAll(/\/products\/covers\/[^"'`\\]+/g)].map((m) => m[0]);
if (huerfanas.length > 0) {
  throw new Error(
    `Portadas sin incrustar (${huerfanas.length}). En el HTML standalone quedarían rotas:\n  ` +
      [...new Set(huerfanas)].join("\n  ")
  );
}

/* 2. CSS propio (todo lo que no son directivas de Tailwind) ------------- */

const globals = readFileSync(resolve(root, "src/app/globals.css"), "utf8");
const customCss = globals.replace(/@tailwind[^;]+;\s*/g, "");

/* 3. CSS de utilidades generado desde las clases usadas -------------------- */

const utilities = buildCss(collectClasses());

const preflight = `
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#2E3440}
html{line-height:1.5;-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;line-height:inherit}
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit;margin:0}
h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}
ol,ul,menu{list-style:none;margin:0;padding:0}
a{color:inherit;text-decoration:inherit}
button,input,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}
button,select{text-transform:none}
button,[type=button],[type=submit]{-webkit-appearance:button;background-color:transparent;background-image:none;cursor:pointer}
:disabled{cursor:default}
img,svg,video,canvas{display:block;vertical-align:middle;max-width:100%}
summary{display:list-item;cursor:pointer}
summary::-webkit-details-marker{display:none}
input::placeholder{opacity:1;color:#8D93A0}
input[type=search]::-webkit-search-cancel-button{-webkit-appearance:none}
`;

const html = `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>NOX PARFUMS — Extrait de Parfum</title>
<meta name="description" content="NOX Parfums. Extrait de Parfum en 60 ml, inspirados en los grandes nombres de la perfumeria." />
<meta name="theme-color" content="#050609" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
<style>
${preflight}
${utilities}
body { background-color:#050609; color:#ECEAE5; margin:0; font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; overflow-x:hidden; }
${customCss}
</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;

writeFileSync(resolve(outDir, "index.html"), html, "utf8");
console.log(
  `\n✓ dist-preview/index.html — ${(html.length / 1024).toFixed(0)} KB` +
    (incrustadas > 0
      ? `  ·  ${incrustadas} portadas incrustadas (${(bytesPortadas / 1024 / 1024).toFixed(1)} MB)`
      : "")
);
