"use client";

/**
 * MENÚ LATERAL DE NOX ADMIN — un único componente para todo el panel.
 *
 * · Escritorio (≥ lg): barra fija a la izquierda, contraíble a sólo iconos.
 *   La preferencia se recuerda en este navegador (localStorage, opcional).
 * · Celular: barra superior con botón de menú; el menú se abre como panel
 *   modal (role="dialog"), con foco atrapado, cierre con Escape, con el fondo
 *   o al navegar, y devuelve el foco al botón que lo abrió.
 * · Sección activa: aria-current="page" + indicador visual.
 * · No decide permisos: sólo muestra lo que el servidor ya autorizó.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { cerrarSesion } from "@/app/admin/acciones";
import {
  IconoActividad,
  IconoCatalogo,
  IconoCerrar,
  IconoConfiguracion,
  IconoContraer,
  IconoEscudo,
  IconoExpandir,
  IconoInventario,
  IconoMenu,
  IconoResumen,
  IconoSalir
} from "./iconos";

type Seccion = { href: string; etiqueta: string; Icono: ComponentType<SVGProps<SVGSVGElement>> };

export const SECCIONES_ADMIN: readonly Seccion[] = [
  { href: "/admin", etiqueta: "Resumen", Icono: IconoResumen },
  { href: "/admin/catalogo", etiqueta: "Catálogo", Icono: IconoCatalogo },
  { href: "/admin/inventario", etiqueta: "Inventario", Icono: IconoInventario },
  { href: "/admin/actividad", etiqueta: "Actividad", Icono: IconoActividad },
  { href: "/admin/configuracion", etiqueta: "Configuración", Icono: IconoConfiguracion }
];

export function seccionActiva(ruta: string, href: string): boolean {
  if (href === "/admin") return ruta === "/admin" || ruta === "/admin/";
  return ruta === href || ruta.startsWith(`${href}/`);
}

const CLAVE_CONTRAIDO = "nox-admin-menu-contraido";

export interface UsuarioMenu {
  nombre: string;
  email: string | null;
  mfaActivo: boolean;
}

function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <Link href="/admin" className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-steel/70">
      <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-edge font-display text-[13px] tracking-wide text-bone">
        N
      </span>
      {compacta ? (
        <span className="sr-only">NOX Admin — Resumen</span>
      ) : (
        <span className="leading-tight">
          <span className="block font-display text-[19px] tracking-[0.18em] text-bone">NOX</span>
          <span className="block text-[10px] uppercase tracking-widest text-mist">Admin</span>
        </span>
      )}
    </Link>
  );
}

function Enlaces({ ruta, compacto, alNavegar }: { ruta: string; compacto: boolean; alNavegar?: () => void }) {
  return (
    <ul className="space-y-1">
      {SECCIONES_ADMIN.map(({ href, etiqueta, Icono }) => {
        const activa = seccionActiva(ruta, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={alNavegar}
              aria-current={activa ? "page" : undefined}
              title={compacto ? etiqueta : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-steel/70 ${
                compacto ? "justify-center" : ""
              } ${activa ? "bg-graphite/70 text-bone" : "text-haze hover:bg-graphite/40 hover:text-bone"}`}
            >
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full transition-opacity ${
                  activa ? "bg-bone opacity-100" : "opacity-0"
                }`}
              />
              <Icono className={`shrink-0 ${activa ? "text-bone" : "text-mist group-hover:text-haze"}`} />
              <span className={compacto ? "sr-only" : ""}>{etiqueta}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Usuario({ usuario, compacto }: { usuario: UsuarioMenu; compacto: boolean }) {
  return (
    <div className={`space-y-3 border-t border-edge pt-4 ${compacto ? "text-center" : ""}`}>
      {compacto ? (
        <span
          className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-graphite text-[12px] text-bone"
          title={`${usuario.nombre}${usuario.mfaActivo ? " · MFA activo" : " · sin segundo factor"}`}
        >
          <span aria-hidden="true">{usuario.nombre.trim().charAt(0).toUpperCase() || "·"}</span>
          <span className="sr-only">{usuario.nombre}</span>
        </span>
      ) : (
        <div className="min-w-0">
          <p className="truncate text-[13px] text-bone">{usuario.nombre}</p>
          {usuario.email ? <p className="truncate text-[12px] text-mist">{usuario.email}</p> : null}
          <p className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] ${
            usuario.mfaActivo ? "border-steel/40 text-steel" : "border-haze/40 text-haze"
          }`}>
            <IconoEscudo width={13} height={13} />
            {usuario.mfaActivo ? "Segundo factor activo" : "Sin segundo factor"}
          </p>
        </div>
      )}
      <form action={cerrarSesion}>
        <button
          type="submit"
          title={compacto ? "Cerrar sesión" : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-haze outline-none transition-colors hover:bg-graphite/40 hover:text-bone focus-visible:ring-2 focus-visible:ring-steel/70 ${
            compacto ? "justify-center" : ""
          }`}
        >
          <IconoSalir className="shrink-0 text-mist" />
          <span className={compacto ? "sr-only" : ""}>Cerrar sesión</span>
        </button>
      </form>
    </div>
  );
}

export function AdminSidebar({ usuario }: { usuario: UsuarioMenu }) {
  const ruta = usePathname() ?? "";
  const [contraido, setContraido] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setContraido(window.localStorage.getItem(CLAVE_CONTRAIDO) === "1");
    } catch {
      /* almacenamiento no disponible: se usa el menú expandido */
    }
  }, []);

  const alternarContraido = () => {
    setContraido((v) => {
      try {
        window.localStorage.setItem(CLAVE_CONTRAIDO, v ? "0" : "1");
      } catch {
        /* sin persistencia */
      }
      return !v;
    });
  };

  const cerrarMenu = useCallback(() => {
    setAbierto(false);
    botonMenu.current?.focus();
  }, []);

  // Cerrar el menú móvil al cambiar de ruta.
  useEffect(() => {
    setAbierto(false);
  }, [ruta]);

  // Menú móvil abierto: Escape, foco atrapado y sin scroll de fondo.
  useEffect(() => {
    if (!abierto) return;
    const contenedor = panel.current;
    const enfocables = () =>
      Array.from(contenedor?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    enfocables()[0]?.focus();
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrarMenu();
        return;
      }
      if (e.key !== "Tab") return;
      const lista = enfocables();
      if (lista.length === 0) return;
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", alTeclear);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, cerrarMenu]);

  const actual = SECCIONES_ADMIN.find((s) => seccionActiva(ruta, s.href));

  return (
    <>
      {/* Celular y tablet: barra superior */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-edge bg-void/95 px-4 backdrop-blur lg:hidden">
        <Marca />
        <div className="flex items-center gap-3">
          {actual ? <span className="text-[12px] text-mist">{actual.etiqueta}</span> : null}
          <button
            ref={botonMenu}
            type="button"
            onClick={() => setAbierto(true)}
            aria-expanded={abierto}
            aria-controls="nox-admin-menu-movil"
            aria-label="Abrir menú"
            className="grid h-10 w-10 place-items-center rounded-full border border-edge text-bone outline-none focus-visible:ring-2 focus-visible:ring-steel/70"
          >
            <IconoMenu />
          </button>
        </div>
      </div>

      {abierto ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-void/80" onClick={cerrarMenu} />
          <div
            ref={panel}
            id="nox-admin-menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de NOX Admin"
            className="absolute inset-y-0 left-0 flex w-[min(300px,86vw)] flex-col border-r border-edge bg-ink px-4 py-5"
          >
            <div className="mb-6 flex items-center justify-between">
              <Marca />
              <button
                type="button"
                onClick={cerrarMenu}
                aria-label="Cerrar menú"
                className="grid h-10 w-10 place-items-center rounded-full border border-edge text-bone outline-none focus-visible:ring-2 focus-visible:ring-steel/70"
              >
                <IconoCerrar />
              </button>
            </div>
            <nav aria-label="Secciones del panel" className="flex-1 overflow-y-auto">
              <Enlaces ruta={ruta} compacto={false} alNavegar={() => setAbierto(false)} />
            </nav>
            <Usuario usuario={usuario} compacto={false} />
          </div>
        </div>
      ) : null}

      {/* Escritorio: barra lateral fija */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-edge bg-ink/60 px-3 py-6 transition-[width] duration-200 lg:flex ${
          contraido ? "w-[76px]" : "w-[248px]"
        }`}
      >
        <div className={`mb-8 flex items-center ${contraido ? "flex-col gap-4" : "justify-between px-1"}`}>
          <Marca compacta={contraido} />
          <button
            type="button"
            onClick={alternarContraido}
            aria-pressed={contraido}
            aria-label={contraido ? "Expandir menú" : "Contraer menú"}
            title={contraido ? "Expandir menú" : "Contraer menú"}
            className="grid h-8 w-8 place-items-center rounded-lg text-mist outline-none transition-colors hover:bg-graphite/50 hover:text-bone focus-visible:ring-2 focus-visible:ring-steel/70"
          >
            {contraido ? <IconoExpandir /> : <IconoContraer />}
          </button>
        </div>
        <nav aria-label="Secciones del panel" className="flex-1 overflow-y-auto">
          <Enlaces ruta={ruta} compacto={contraido} />
        </nav>
        <Usuario usuario={usuario} compacto={contraido} />
      </aside>
    </>
  );
}
