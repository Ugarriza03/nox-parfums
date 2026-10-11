/**
 * FILTROS DEL PANEL — lógica pura.
 * Interpreta parámetros de la URL (que llegan del usuario) sin confiar en ellos.
 */

import { TIPOS_MOVIMIENTO, type EstadoStock, type TipoMovimiento } from "./inventario-reglas";

const ESTADOS: readonly EstadoStock[] = ["sin_registro", "sin_stock", "stock_bajo", "con_stock"];
const GENEROS = ["femenino", "masculino", "unisex"] as const;
const CATEGORIAS = ["disenador", "nicho", "arabe", "pendiente"] as const;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

type Parametros = Record<string, string | string[] | undefined>;

function uno(p: Parametros, clave: string): string {
  const v = p[clave];
  return (Array.isArray(v) ? v[0] : v ?? "").trim().slice(0, 120);
}

function fechaValida(v: string): string | undefined {
  if (!FECHA.test(v)) return undefined;
  const d = new Date(`${v}T12:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? undefined : v;
}

export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/* --------------------------------------------------------------- inventario */

export interface FiltrosInventario {
  q: string;
  estado?: EstadoStock;
  genero?: (typeof GENEROS)[number];
  categoria?: (typeof CATEGORIAS)[number];
}

export function leerFiltrosInventario(p: Parametros): FiltrosInventario {
  const estado = uno(p, "estado") as EstadoStock;
  const genero = uno(p, "genero") as (typeof GENEROS)[number];
  const categoria = uno(p, "categoria") as (typeof CATEGORIAS)[number];
  return {
    q: uno(p, "q"),
    estado: ESTADOS.includes(estado) ? estado : undefined,
    genero: GENEROS.includes(genero) ? genero : undefined,
    categoria: CATEGORIAS.includes(categoria) ? categoria : undefined
  };
}

export function filtrarInventario<
  T extends { nombre: string; marca: string; slug: string; estado: EstadoStock; genero: string; categoria: string }
>(filas: readonly T[], f: FiltrosInventario): T[] {
  const q = normalizar(f.q);
  return filas.filter(
    (fila) =>
      (!q || normalizar(`${fila.marca} ${fila.nombre} ${fila.slug}`).includes(q)) &&
      (!f.estado || fila.estado === f.estado) &&
      (!f.genero || fila.genero === f.genero) &&
      (!f.categoria || fila.categoria === f.categoria)
  );
}

/* --------------------------------------------------------------- actividad */

export interface FiltrosActividad {
  producto?: string;
  tipo?: TipoMovimiento;
  desde?: string;
  hasta?: string;
  antesDeId?: number;
}

export function leerFiltrosActividad(p: Parametros, slugsValidos: ReadonlySet<string>): FiltrosActividad {
  const producto = uno(p, "producto");
  const tipo = uno(p, "tipo") as TipoMovimiento;
  const antes = uno(p, "antes");
  const desde = fechaValida(uno(p, "desde"));
  const hasta = fechaValida(uno(p, "hasta"));
  return {
    producto: slugsValidos.has(producto) ? producto : undefined,
    tipo: TIPOS_MOVIMIENTO.includes(tipo) ? tipo : undefined,
    desde,
    hasta: desde && hasta && hasta < desde ? undefined : hasta,
    antesDeId: /^\d{1,15}$/.test(antes) ? Number(antes) : undefined
  };
}
