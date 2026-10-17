/**
 * Validación de archivos antes de enviar una portada a Supabase Storage.
 * No confía en la extensión ni en el MIME proporcionado por el navegador.
 */
export const MAX_COVER_BYTES = 5 * 1024 * 1024;
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
    throw new Error("La imagen debe pesar entre 1 byte y 5 MB.");
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
