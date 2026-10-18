/**
 * Validación de archivos antes de enviar una portada a Supabase Storage.
 * No confía en la extensión ni en el MIME proporcionado por el navegador.
 */
/*
 * Límite de tamaño de portada: 900 KB.
 * La subida pasa por una Server Action, cuyo cuerpo Next.js limita por defecto
 * a 1 MB (serverActions.bodySizeLimit). El límite anterior (5 MB) era
 * inalcanzable: un archivo de más de ~1 MB se rechazaba antes de llegar al
 * código, sin mensaje claro. Se deja margen para el resto del formulario
 * multipart. Las portadas actuales pesan como máximo ~325 KB.
 * No se amplía bodySizeLimit: afectaría a todas las Server Actions del sitio
 * (también la tienda) y en Vercel el cuerpo de una función no puede superar 4,5 MB.
 */
export const MAX_COVER_BYTES = 900 * 1024;
export const MAX_COVER_ETIQUETA = "900 KB";
/** Límite por defecto del cuerpo de una Server Action en Next.js (1 MB). */
export const LIMITE_SERVER_ACTION_BYTES = 1024 * 1024;
export const COVER_MIMES = ["image/webp", "image/png", "image/jpeg"] as const;

/** Comprobación previa en el navegador (el servidor vuelve a validar el contenido). */
export function validarArchivoPortadaCliente(archivo: { size: number; type: string }): string | null {
  if (archivo.size < 1) return "El archivo está vacío.";
  if (archivo.size > MAX_COVER_BYTES) {
    return `La imagen pesa ${(archivo.size / 1024 / 1024).toFixed(2).replace(".", ",")} MB. El máximo es ${MAX_COVER_ETIQUETA}: comprimila (por ejemplo, exportala como WebP) y volvé a intentar.`;
  }
  if (!(COVER_MIMES as readonly string[]).includes(archivo.type)) return "Formato no admitido: usá WebP, PNG o JPEG.";
  return null;
}
export const COVER_BUCKET = "nox-catalog-covers";

export function validarPortada(
  slug: string,
  nombre: string,
  mime: string,
  bytes: Uint8Array
): { extension: "webp" | "png" | "jpg"; storagePath: string } {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) {
    throw new Error("Identificador de fragancia inválido.");
  }
  if (!bytes.length || bytes.length > MAX_COVER_BYTES) {
    throw new Error(`La imagen debe pesar entre 1 byte y ${MAX_COVER_ETIQUETA}.`);
  }
  const webp = bytes.length >= 12 &&
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";
  const png = bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b);
  const jpg = bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 &&
    bytes[bytes.length-2] === 255 && bytes[bytes.length-1] === 217;
  const extension = webp ? "webp" : png ? "png" : jpg ? "jpg" : null;
  if (!extension) throw new Error("El archivo no es una imagen WebP, PNG o JPEG válida.");
  const expectedMime = { webp: "image/webp", png: "image/png", jpg: "image/jpeg" }[extension];
  if (mime !== expectedMime) throw new Error("El tipo MIME no coincide con el contenido.");
  const fileExtension = nombre.toLowerCase().split(".").pop();
  if (fileExtension !== extension && !(extension === "jpg" && fileExtension === "jpeg")) {
    throw new Error("La extensión no coincide con el contenido.");
  }
  // El nombre final se genera en el servidor: nunca usar la ruta enviada por el usuario.
  return { extension, storagePath: `covers/${slug}/${crypto.randomUUID()}.${extension}` };
}
