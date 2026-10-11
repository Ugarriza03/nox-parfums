import type { Metadata } from "next";
import { CatalogClient } from "./CatalogClient";

export const metadata: Metadata = {
  title: "Catálogo de fragancias",
  description:
    "Todo el catálogo NOX: Extrait de Parfum en 60 ml inspirados en perfumería de diseñador, nicho y árabe. Buscá por nombre, casa o nota."
};

export default function CatalogPage() {
  return <CatalogClient />;
}
