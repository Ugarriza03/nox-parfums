/**
 * Validación de servidor de los valores del editor de catálogo (lógica pura).
 * Las Server Actions la usan antes de llamar a las RPC; la base vuelve a
 * validar todo por su cuenta.
 */
import { CATEGORIAS_CATALOGO, GENEROS_CATALOGO, ORIGENES_CATALOGO, esSlugValido } from "./catalogo-v2";

export interface ValoresFicha {
  slug: string;
  house: string;
  fragranceName: string;
  gender: string;
  universe: string;
  origin: string;
  olfactory: Record<string, unknown> | null;
  imagePath: string | null;
}

const RUTA_PORTADA = /^covers\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9-]+\.(webp|png|jpg|jpeg)$/;

export function validarValoresFicha(v: unknown): { ok: true; valores: ValoresFicha } | { ok: false; error: string } {
  if (!v || typeof v !== "object") return { ok: false, error: "Datos inválidos." };
  const x = v as Record<string, unknown>;
  if (!esSlugValido(x.slug)) return { ok: false, error: "El identificador no es válido." };
  const house = typeof x.house === "string" ? x.house.trim() : "";
  const fragranceName = typeof x.fragranceName === "string" ? x.fragranceName.trim() : "";
  if (!house || house.length > 160) return { ok: false, error: "La marca es obligatoria (hasta 160 caracteres)." };
  if (!fragranceName || fragranceName.length > 180) return { ok: false, error: "El nombre es obligatorio (hasta 180 caracteres)." };
  if (!(GENEROS_CATALOGO as readonly unknown[]).includes(x.gender)) return { ok: false, error: "Género inválido." };
  if (!(CATEGORIAS_CATALOGO as readonly unknown[]).includes(x.universe)) return { ok: false, error: "Categoría inválida." };
  if (!(ORIGENES_CATALOGO as readonly unknown[]).includes(x.origin)) return { ok: false, error: "Origen inválido." };
  const olf = x.olfactory;
  if (olf !== null && (typeof olf !== "object" || Array.isArray(olf))) return { ok: false, error: "El perfil olfativo no es válido." };
  if (olf && JSON.stringify(olf).length > 20_000) return { ok: false, error: "El perfil olfativo es demasiado grande." };
  const img = x.imagePath;
  if (img !== null && (typeof img !== "string" || !RUTA_PORTADA.test(img) || !img.startsWith(`covers/${x.slug}/`))) {
    return { ok: false, error: "La portada debe ser una imagen privada de esta fragancia." };
  }
  return {
    ok: true,
    valores: {
      slug: x.slug,
      house,
      fragranceName,
      gender: x.gender as string,
      universe: x.universe as string,
      origin: x.origin as string,
      olfactory: (olf as Record<string, unknown> | null) ?? null,
      imagePath: (img as string | null) ?? null
    }
  };
}
