/**
 * CONFIGURACIÓN GENERAL DE LA MARCA
 * Fuente única de verdad para datos de contacto, redes y textos institucionales.
 * Cambiar acá se propaga a toda la app.
 */

export const siteConfig = {
  name: "NOX PARFUMS",
  shortName: "NOX",
  concentration: "Extrait de Parfum",
  volumeMl: 60,
  /** Cambiar por el dominio real cuando se publique. Se usa para SEO / metadata. */
  url: "https://noxparfums.com.ar",
  description:
    "NOX Parfums. Extrait de Parfum en 60 ml, inspirados en los grandes nombres de la perfumería. Asesoramiento real antes de elegir.",

  instagram: {
    handle: "@nox.parfums_",
    url: "https://instagram.com/nox.parfums_"
  },

  whatsapp: {
    /** Cómo se muestra en pantalla. */
    display: "11 2707-6746",
    /**
     * Formato internacional para links wa.me (sin +, sin espacios, sin guiones).
     * Confirmado con el cliente: +54 9 11 2707-6746 (celular, Buenos Aires).
     */
    international: "5491127076746"
  }
} as const;

/** Construye un link de WhatsApp con el mensaje ya redactado. */
export function waLink(message: string): string {
  return `https://wa.me/${siteConfig.whatsapp.international}?text=${encodeURIComponent(
    message
  )}`;
}
