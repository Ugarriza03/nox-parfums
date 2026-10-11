"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECCIONES = [
  { href: "/admin", etiqueta: "Resumen" },
  { href: "/admin/inventario", etiqueta: "Inventario" },
  { href: "/admin/actividad", etiqueta: "Actividad" },
  { href: "/admin/configuracion", etiqueta: "Configuración" }
] as const;

export function AdminNav() {
  const ruta = usePathname() ?? "";
  return (
    <nav aria-label="Secciones del panel" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {SECCIONES.map((s) => {
        const activa = s.href === "/admin" ? ruta === "/admin" : ruta === s.href || ruta.startsWith(`${s.href}/`);
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={activa ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition ${
              activa ? "bg-bone text-void" : "text-haze hover:bg-graphite hover:text-bone"
            }`}
          >
            {s.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
