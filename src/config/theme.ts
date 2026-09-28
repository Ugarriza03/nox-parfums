/**
 * TOKENS VISUALES NOX — fuente única de verdad del sistema de diseño.
 * Los consume tailwind.config.ts y el build de preview.
 */
export const noxTheme = {
  colors: {
    void: "#050609",     // fondo base
    ink: "#0A0C11",      // superficies
    midnight: "#0D1220", // azul medianoche
    slate: "#141821",    // azul tinta muy oscuro
    graphite: "#232833", // gris grafito
    edge: "#2E3440",     // bordes
    mist: "#8D93A0",     // texto secundario
    haze: "#B6BBC5",     // texto terciario
    bone: "#ECEAE5",     // blanco roto — texto principal
    steel: "#8FA6CC"     // acento frío, uso mínimo
  },
  fontFamily: {
    display: ["'Cormorant Garamond'", "Georgia", "serif"],
    sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"]
  },
  letterSpacing: { wider: "0.08em", widest: "0.22em" },
  maxWidth: { shell: "1240px" },
  transitionTimingFunction: { nox: "cubic-bezier(0.22, 1, 0.36, 1)" }
} as const;
