import type { Metadata } from "next";
import { WholesaleClient } from "./WholesaleClient";

export const metadata: Metadata = {
  title: "Mayoristas — Quiero revender NOX",
  description:
    "Escala mayorista NOX desde 10 unidades. Armá tu pedido combinando fragancias, mirá el precio por unidad y enviálo por WhatsApp."
};

export default function WholesalePage() {
  return <WholesaleClient />;
}
