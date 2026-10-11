import type { Metadata } from "next";
import { OrderClient } from "./OrderClient";

export const metadata: Metadata = {
  title: "Mi pedido",
  description:
    "Armá tu pedido NOX, mirá el precio con el beneficio por cantidad aplicado y cerralo por WhatsApp con todo escrito.",
  robots: { index: false, follow: true }
};

export default function OrderPage() {
  return <OrderClient />;
}
