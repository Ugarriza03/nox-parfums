"use client";

/**
 * ESTADO DEL PEDIDO ("Mi pedido")
 * Contexto global + persistencia en localStorage, para que el pedido sobreviva
 * a una recarga o a que el cliente vuelva más tarde desde el mismo dispositivo.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { PRODUCTS_BY_SLUG } from "@/data/products";
import { quoteRetail, type RetailQuote } from "@/config/pricing";
import type { Product } from "@/data/types";

const STORAGE_KEY = "nox.pedido.v1";

export interface OrderItem {
  slug: string;
  quantity: number;
}

export interface OrderLineResolved {
  product: Product;
  quantity: number;
}

interface OrderContextValue {
  items: OrderItem[];
  lines: OrderLineResolved[];
  units: number;
  quote: RetailQuote;
  /** Slug del último producto agregado, para el feedback visual. */
  lastAdded: string | null;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  quantityOf: (slug: string) => number;
  isReady: boolean;
}

const OrderContext = createContext<OrderContextValue | null>(null);

function readStorage(): OrderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.slug === "string" && PRODUCTS_BY_SLUG[i.slug])
      .map((i) => ({ slug: i.slug as string, quantity: Math.max(1, Number(i.quantity) || 1) }));
  } catch {
    return [];
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(readStorage());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible: el pedido sigue funcionando en memoria */
    }
  }, [items, isReady]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const flash = useCallback((slug: string) => {
    setLastAdded(slug);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLastAdded(null), 2200);
  }, []);

  const add = useCallback(
    (slug: string, quantity = 1) => {
      if (!PRODUCTS_BY_SLUG[slug]) return;
      setItems((current) => {
        const existing = current.find((i) => i.slug === slug);
        if (existing) {
          return current.map((i) =>
            i.slug === slug ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...current, { slug, quantity }];
      });
      flash(slug);
    },
    [flash]
  );

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => i.slug !== slug)
        : current.map((i) => (i.slug === slug ? { ...i, quantity } : i))
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((current) => current.filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<OrderContextValue>(() => {
    const lines: OrderLineResolved[] = items
      .map((i) => ({ product: PRODUCTS_BY_SLUG[i.slug], quantity: i.quantity }))
      .filter((l) => Boolean(l.product));
    const units = lines.reduce((sum, l) => sum + l.quantity, 0);

    return {
      items,
      lines,
      units,
      quote: quoteRetail(units),
      lastAdded,
      add,
      setQuantity,
      remove,
      clear,
      quantityOf: (slug: string) => items.find((i) => i.slug === slug)?.quantity ?? 0,
      isReady
    };
  }, [items, lastAdded, add, setQuantity, remove, clear, isReady]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder debe usarse dentro de <OrderProvider>");
  return ctx;
}
