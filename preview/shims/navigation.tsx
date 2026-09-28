/**
 * Shim de next/navigation para el build de preview estático.
 * En el proyecto Next real este archivo no se usa: lo reemplaza el router
 * de Next. Acá implementamos un router por hash para que el preview funcione
 * abriendo un único archivo HTML.
 */
import { useEffect, useState } from "react";

const listeners = new Set<() => void>();

export function currentPath(): string {
  if (typeof window === "undefined") return "/";
  const raw = window.location.hash.replace(/^#/, "");
  const path = raw.split("?")[0];
  return path.startsWith("/") ? path : "/";
}

export function navigate(to: string) {
  window.location.hash = to;
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    listeners.forEach((fn) => fn());
    window.scrollTo({ top: 0, behavior: "auto" });
  });
}

export function usePathname(): string {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const update = () => setPath(currentPath());
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);
  return path;
}

export function useRouter() {
  return {
    push: navigate,
    replace: navigate,
    back: () => window.history.back(),
    refresh: () => {}
  };
}

export function notFound(): never {
  throw new Error("NEXT_NOT_FOUND");
}

export function useSearchParams() {
  const hash = typeof window === "undefined" ? "" : window.location.hash;
  const q = hash.includes("?") ? hash.slice(hash.indexOf("?")) : "";
  return new URLSearchParams(q);
}
