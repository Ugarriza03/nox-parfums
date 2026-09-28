/**
 * GENERADOR DE CSS PARA EL PREVIEW
 *
 * El proyecto Next.js usa Tailwind de verdad (tailwind.config.ts + PostCSS).
 * Este script existe sólo para el preview estático: recorre las clases que
 * realmente usa el código y emite el CSS equivalente, de modo que el archivo
 * HTML del preview sea autónomo y no dependa de ningún CDN.
 *
 * No afecta al build de producción.
 */

import fs from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const THEME_COLORS = {
  void: "#050609",
  ink: "#0A0C11",
  midnight: "#0D1220",
  slate: "#141821",
  graphite: "#232833",
  edge: "#2E3440",
  mist: "#8D93A0",
  haze: "#B6BBC5",
  bone: "#ECEAE5",
  steel: "#8FA6CC",
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  current: "currentColor"
};

const SCREENS = { sm: 640, md: 768, lg: 1024, xl: 1280 };

const VARIANT_SELECTOR = {
  hover: (s) => `${s}:hover`,
  focus: (s) => `${s}:focus`,
  "focus-visible": (s) => `${s}:focus-visible`,
  active: (s) => `${s}:active`,
  disabled: (s) => `${s}:disabled`,
  first: (s) => `${s}:first-child`,
  last: (s) => `${s}:last-child`,
  "group-hover": (s) => `.group:hover ${s}`,
  "group-open": (s) => `.group[open] ${s}`,
  placeholder: (s) => `${s}::placeholder`,
  marker: (s) => `${s}::marker`
};

/* ------------------------------------------------------------------ helpers */

function esc(cls) {
  return cls.replace(/[.:/[\]()%#,+*~='"!$^&|{}<>?@`]/g, (m) => `\\${m}`);
}

function arbitrary(value) {
  return value.replace(/^\[/, "").replace(/\]$/, "").replace(/_/g, " ");
}

function spacing(token) {
  if (token === "px") return "1px";
  if (token === "auto") return "auto";
  if (token === "full") return "100%";
  if (token === "screen") return "100vh";
  if (token?.startsWith("[")) return arbitrary(token);
  if (/^\d+\/\d+$/.test(token)) {
    const [a, b] = token.split("/").map(Number);
    return `${((a / b) * 100).toFixed(6).replace(/\.?0+$/, "")}%`;
  }
  const n = Number(token);
  return Number.isFinite(n) ? `${n * 0.25}rem` : null;
}

function color(token) {
  if (!token) return null;
  let value = token;
  let alpha = null;

  const slash = token.lastIndexOf("/");
  if (slash > 0) {
    value = token.slice(0, slash);
    const raw = token.slice(slash + 1);
    alpha = raw.startsWith("[") ? Number(arbitrary(raw)) : Number(raw) / 100;
  }

  let hex = value.startsWith("[") ? arbitrary(value) : THEME_COLORS[value];
  if (!hex) return null;
  if (alpha === null || !Number.isFinite(alpha)) return hex;
  if (hex === "transparent" || hex === "currentColor") return hex;

  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* --------------------------------------------------------------- utilidades */

const STATIC = {
  block: "display:block",
  "inline-block": "display:inline-block",
  inline: "display:inline",
  flex: "display:flex",
  "inline-flex": "display:inline-flex",
  grid: "display:grid",
  hidden: "display:none",
  contents: "display:contents",
  relative: "position:relative",
  absolute: "position:absolute",
  fixed: "position:fixed",
  sticky: "position:sticky",
  static: "position:static",
  "flex-col": "flex-direction:column",
  "flex-row": "flex-direction:row",
  "flex-wrap": "flex-wrap:wrap",
  "flex-1": "flex:1 1 0%",
  "shrink-0": "flex-shrink:0",
  "grow-0": "flex-grow:0",
  "items-center": "align-items:center",
  "items-start": "align-items:flex-start",
  "items-end": "align-items:flex-end",
  "items-baseline": "align-items:baseline",
  "items-stretch": "align-items:stretch",
  "justify-center": "justify-content:center",
  "justify-between": "justify-content:space-between",
  "justify-start": "justify-content:flex-start",
  "justify-end": "justify-content:flex-end",
  "self-start": "align-self:flex-start",
  "self-end": "align-self:flex-end",
  "self-stretch": "align-self:stretch",
  "place-items-center": "place-items:center",
  "text-left": "text-align:left",
  "text-center": "text-align:center",
  "text-right": "text-align:right",
  uppercase: "text-transform:uppercase",
  lowercase: "text-transform:lowercase",
  underline: "text-decoration-line:underline",
  "no-underline": "text-decoration-line:none",
  "tabular-nums": "font-variant-numeric:tabular-nums",
  "font-display": "font-family:'Cormorant Garamond', Georgia, serif",
  "font-sans": "font-family:Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  "font-light": "font-weight:300",
  "font-normal": "font-weight:400",
  "font-medium": "font-weight:500",
  "font-semibold": "font-weight:600",
  truncate: "overflow:hidden;text-overflow:ellipsis;white-space:nowrap",
  "whitespace-nowrap": "white-space:nowrap",
  "overflow-hidden": "overflow:hidden",
  "overflow-x-auto": "overflow-x:auto",
  "overflow-y-auto": "overflow-y:auto",
  "object-cover": "object-fit:cover",
  "object-contain": "object-fit:contain",
  "list-none": "list-style-type:none",
  "select-none": "user-select:none",
  "cursor-pointer": "cursor:pointer",
  "pointer-events-none": "pointer-events:none",
  "pointer-events-auto": "pointer-events:auto",
  "outline-none": "outline:2px solid transparent;outline-offset:2px",
  border: "border-width:1px;border-style:solid",
  "border-0": "border-width:0",
  "border-b": "border-bottom-width:1px;border-bottom-style:solid",
  "border-t": "border-top-width:1px;border-top-style:solid",
  "border-l": "border-left-width:1px;border-left-style:solid",
  "border-r": "border-right-width:1px;border-right-style:solid",
  "border-y": "border-top-width:1px;border-bottom-width:1px;border-top-style:solid;border-bottom-style:solid",
  "border-x": "border-left-width:1px;border-right-width:1px;border-left-style:solid;border-right-style:solid",
  "border-b-0": "border-bottom-width:0",
  "border-dashed": "border-style:dashed",
  "border-solid": "border-style:solid",
  rounded: "border-radius:0.25rem",
  "rounded-lg": "border-radius:0.5rem",
  "rounded-xl": "border-radius:0.75rem",
  "rounded-2xl": "border-radius:1rem",
  "rounded-3xl": "border-radius:1.5rem",
  "rounded-full": "border-radius:9999px",
  "rounded-l-full": "border-top-left-radius:9999px;border-bottom-left-radius:9999px",
  "rounded-r-full": "border-top-right-radius:9999px;border-bottom-right-radius:9999px",
  "divide-y": "", // manejado aparte
  "mix-blend-soft-light": "mix-blend-mode:soft-light",
  "backdrop-blur-xl": "backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)",
  "backdrop-blur-lg": "backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)",
  "transition-all": "transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
  "transition-colors":
    "transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
  "transition-opacity": "transition-property:opacity;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
  "transition-transform": "transition-property:transform;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
  "ease-nox": "transition-timing-function:cubic-bezier(0.22, 1, 0.36, 1)",
  "ease-out": "transition-timing-function:cubic-bezier(0,0,0.2,1)",
  "animate-pulse": "animation:nox-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
  "marker:content-none": "",
  "sr-only":
    "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0",
  "not-sr-only":
    "position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip:auto;white-space:normal",
  "min-h-screen": "min-height:100vh",
  "min-w-0": "min-width:0px",
  "w-full": "width:100%",
  "h-full": "height:100%",
  "inset-0": "top:0;right:0;bottom:0;left:0",
  "inset-x-0": "left:0;right:0",
  "inset-y-0": "top:0;bottom:0",
  "rotate-45": "transform:rotate(45deg)",
  "group": ""
};

const PREFIX_RULES = [
  // dimensiones
  [/^w-(.+)$/, (v) => ({ width: spacing(v) })],
  [/^h-(.+)$/, (v) => ({ height: spacing(v) })],
  [/^min-w-(.+)$/, (v) => ({ "min-width": spacing(v) })],
  [/^min-h-(.+)$/, (v) => ({ "min-height": spacing(v) })],
  [/^max-w-(.+)$/, (v) => ({ "max-width": maxWidth(v) })],
  [/^aspect-(.+)$/, (v) => ({ "aspect-ratio": arbitrary(v) })],

  // posición
  [/^top-(.+)$/, (v) => ({ top: spacing(v) })],
  [/^right-(.+)$/, (v) => ({ right: spacing(v) })],
  [/^bottom-(.+)$/, (v) => ({ bottom: spacing(v) })],
  [/^left-(.+)$/, (v) => ({ left: spacing(v) })],
  [/^z-(.+)$/, (v) => ({ "z-index": v.startsWith("[") ? arbitrary(v) : v })],

  // espaciado
  [/^p-(.+)$/, (v) => ({ padding: spacing(v) })],
  [/^px-(.+)$/, (v) => ({ "padding-left": spacing(v), "padding-right": spacing(v) })],
  [/^py-(.+)$/, (v) => ({ "padding-top": spacing(v), "padding-bottom": spacing(v) })],
  [/^pt-(.+)$/, (v) => ({ "padding-top": spacing(v) })],
  [/^pr-(.+)$/, (v) => ({ "padding-right": spacing(v) })],
  [/^pb-(.+)$/, (v) => ({ "padding-bottom": spacing(v) })],
  [/^pl-(.+)$/, (v) => ({ "padding-left": spacing(v) })],
  [/^m-(.+)$/, (v) => ({ margin: spacing(v) })],
  [/^mx-(.+)$/, (v) => ({ "margin-left": spacing(v), "margin-right": spacing(v) })],
  [/^my-(.+)$/, (v) => ({ "margin-top": spacing(v), "margin-bottom": spacing(v) })],
  [/^mt-(.+)$/, (v) => ({ "margin-top": spacing(v) })],
  [/^mr-(.+)$/, (v) => ({ "margin-right": spacing(v) })],
  [/^mb-(.+)$/, (v) => ({ "margin-bottom": spacing(v) })],
  [/^ml-(.+)$/, (v) => ({ "margin-left": spacing(v) })],
  [/^-mx-(.+)$/, (v) => ({ "margin-left": `-${spacing(v)}`, "margin-right": `-${spacing(v)}` })],
  [/^-mt-(.+)$/, (v) => ({ "margin-top": `-${spacing(v)}` })],

  // flex / grid
  [/^gap-x-(.+)$/, (v) => ({ "column-gap": spacing(v) })],
  [/^gap-y-(.+)$/, (v) => ({ "row-gap": spacing(v) })],
  [/^gap-(.+)$/, (v) => ({ gap: spacing(v) })],
  [/^grid-cols-(.+)$/, (v) => ({
    "grid-template-columns": v.startsWith("[")
      ? arbitrary(v)
      : `repeat(${v}, minmax(0, 1fr))`
  })],
  [/^col-span-(.+)$/, (v) => ({ "grid-column": `span ${v} / span ${v}` })],

  // tipografía
  [/^text-\[(\d+(?:\.\d+)?(?:px|rem|vw|em))\]$/, (v) => ({ "font-size": v })],
  [/^leading-(.+)$/, (v) => ({ "line-height": lineHeight(v) })],
  [/^tracking-(.+)$/, (v) => ({ "letter-spacing": v.startsWith("[") ? arbitrary(v) : v })],
  [/^underline-offset-(.+)$/, (v) => ({ "text-underline-offset": `${v}px` })],

  // colores
  [/^text-(.+)$/, (v) => (color(v) ? { color: color(v) } : null)],
  [/^bg-(.+)$/, (v) => (color(v) ? { "background-color": color(v) } : null)],
  [/^border-(.+)$/, (v) =>
    color(v) ? { "border-color": color(v), "border-style": "solid" } : null],
  [/^accent-(.+)$/, (v) => (color(v) ? { "accent-color": color(v) } : null)],
  [/^divide-(.+)$/, (v) => (color(v) ? { __divideColor: color(v) } : null)],

  // efectos
  [/^opacity-(.+)$/, (v) => ({
    opacity: v.startsWith("[") ? arbitrary(v) : String(Number(v) / 100)
  })],
  [/^blur-(.+)$/, (v) => ({ filter: `blur(${blurSize(v)})` })],
  [/^duration-(.+)$/, (v) => ({
    "transition-duration": v.startsWith("[") ? arbitrary(v) : `${v}ms`
  })],
  [/^scale-(.+)$/, (v) => ({ transform: `scale(${v.startsWith("[") ? arbitrary(v) : Number(v) / 100})` })],
  [/^-translate-x-(.+)$/, (v) => ({ __tx: `-${spacing(v)}` })],
  [/^-translate-y-(.+)$/, (v) => ({ __ty: `-${spacing(v)}` })],
  [/^translate-x-(.+)$/, (v) => ({ __tx: spacing(v) })],
  [/^translate-y-(.+)$/, (v) => ({ __ty: spacing(v) })]
];

function maxWidth(v) {
  const named = {
    sm: "24rem",
    md: "28rem",
    lg: "32rem",
    xl: "36rem",
    "2xl": "42rem",
    "3xl": "48rem",
    "4xl": "56rem",
    shell: "1240px",
    full: "100%",
    none: "none"
  };
  if (named[v]) return named[v];
  return spacing(v);
}

function lineHeight(v) {
  const named = { none: "1", tight: "1.25", snug: "1.375", normal: "1.5", relaxed: "1.625", loose: "2" };
  if (named[v]) return named[v];
  if (v.startsWith("[")) return arbitrary(v);
  return null;
}

function blurSize(v) {
  const named = { sm: "4px", DEFAULT: "8px", md: "12px", lg: "16px", xl: "24px", "2xl": "40px", "3xl": "64px" };
  if (v.startsWith("[")) return arbitrary(v);
  return named[v] ?? "8px";
}

/* ------------------------------------------------------------- compilación */

function declarations(base) {
  if (Object.prototype.hasOwnProperty.call(STATIC, base)) {
    return STATIC[base] === "" ? null : STATIC[base];
  }
  for (const [re, fn] of PREFIX_RULES) {
    const m = base.match(re);
    if (!m) continue;
    const out = fn(m[1]);
    if (!out) continue;

    // transform combinado
    if (out.__tx || out.__ty) {
      const parts = [];
      if (out.__tx) parts.push(`translateX(${out.__tx})`);
      if (out.__ty) parts.push(`translateY(${out.__ty})`);
      return `transform:${parts.join(" ")}`;
    }
    if (out.__divideColor) return `__DIVIDE__${out.__divideColor}`;

    const decls = Object.entries(out)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([prop, value]) => `${prop}:${value}`);
    if (decls.length) return decls.join(";");
  }
  return null;
}


/**
 * Peso de orden: replica la cascada de Tailwind para que `p-4 pt-8` funcione
 * igual acá (la utilidad más específica se emite después).
 */
function weight(base) {
  const table = [
    [/^(p|m|gap)-/, 10],
    [/^(px|py|mx|my|gap-x|gap-y)-/, 11],
    [/^(pt|pr|pb|pl|mt|mr|mb|ml)-/, 12],
    [/^border$/, 20],
    [/^border-(x|y)$/, 21],
    [/^border-(t|b|l|r)$/, 22],
    [/^border-/, 23],
    [/^rounded$/, 30],
    [/^rounded-(lg|xl|2xl|3xl|full)$/, 31],
    [/^rounded-(l|r|t|b)-/, 32],
    [/^inset-/, 5],
    [/^(top|right|bottom|left)-/, 6]
  ];
  for (const [re, w] of table) if (re.test(base)) return w;
  return 0;
}

export function buildCss(classes) {
  const media = { base: [] };
  for (const key of Object.keys(SCREENS)) media[key] = [];

  const ordered = [...classes].sort((a, b) => {
    const ab = a.split(":").pop();
    const bb = b.split(":").pop();
    return weight(ab) - weight(bb);
  });

  for (const cls of ordered) {
    const parts = cls.split(":");
    const base = parts.pop();
    const variants = parts;

    const screen = variants.find((v) => SCREENS[v]);
    const states = variants.filter((v) => !SCREENS[v]);

    let decls = declarations(base);
    if (!decls) continue;

    let selector = `.${esc(cls)}`;

    // divide-y / divide-color aplican a los hijos
    if (base === "divide-y") {
      decls = "border-top-width:1px;border-top-style:solid";
      selector = `.${esc(cls)} > * + *`;
    } else if (decls.startsWith("__DIVIDE__")) {
      decls = `border-color:${decls.replace("__DIVIDE__", "")}`;
      selector = `.${esc(cls)} > * + *`;
    }

    for (const state of states) {
      const fn = VARIANT_SELECTOR[state];
      if (fn) selector = fn(selector);
    }

    const rule = `${selector}{${decls}}`;
    media[screen ?? "base"].push(rule);
  }

  const chunks = [media.base.join("\n")];
  for (const [name, width] of Object.entries(SCREENS)) {
    if (media[name].length) {
      chunks.push(`@media (min-width:${width}px){\n${media[name].join("\n")}\n}`);
    }
  }
  chunks.push("@keyframes nox-pulse{0%,100%{opacity:1}50%{opacity:.5}}");
  return chunks.join("\n");
}

/* ---------------------------------------------------------------- extracción */

export function collectClasses(dirs = ["src", "preview"]) {
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    (function walk(d) {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, entry.name);
        if (entry.isDirectory()) {
          if (!/node_modules|dist-preview/.test(p)) walk(p);
        } else if (/\.tsx?$/.test(p)) files.push(p);
      }
    })(dir);
  }

  const set = new Set();
  const CLASS_RE = /class(?:Name)?\s*=\s*(?:\{)?(?:`([\s\S]*?)`|"([^"]*)"|'([^']*)')/g;
  const LITERAL_RE = /"([a-z0-9:/[\]\-. #%]{4,})"/g;
  const TOKEN_RE = /-?[A-Za-z][A-Za-z0-9_:/.[\]\-%#]*/g;

  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    let m;
    while ((m = CLASS_RE.exec(src))) {
      const raw = (m[1] ?? m[2] ?? m[3] ?? "").replace(/\$\{[\s\S]*?\}/g, " ");
      for (const token of raw.match(TOKEN_RE) ?? []) set.add(token);
    }
    // clases dentro de ternarios: "border-bone bg-white/[0.05]"
    while ((m = LITERAL_RE.exec(src))) {
      const body = m[1];
      if (!/[a-z]-/.test(body)) continue;
      for (const token of body.split(/\s+/)) {
        if (/^-?[a-z][a-z0-9:/.[\]\-%#]*$/.test(token)) set.add(token);
      }
    }
  }
  return [...set];
}

// Guardia de módulo principal. La comparación anterior pegaba la ruta detrás
// de "file://", que nunca coincide en Windows; pathToFileURL normaliza las dos
// partes al mismo formato. Importado desde build-preview.mjs sigue sin correr.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const classes = collectClasses();
  const css = buildCss(classes);
  fs.mkdirSync("dist-preview", { recursive: true });
  fs.writeFileSync("dist-preview/nox.css", css);
  const generated = css.split("\n").filter((l) => l.includes("{")).length;
  console.log(`✓ ${generated} reglas desde ${classes.length} clases detectadas`);
}
