import type { Metadata } from "next";
import { AdvisorClient } from "./AdvisorClient";

export const metadata: Metadata = {
  title: "Encontrá tu fragancia",
  description:
    "Tres preguntas y te mostramos las fragancias NOX que tienen sentido para vos. Si preferís, seguimos por WhatsApp con asesoramiento personalizado."
};

export default function AdvisorPage() {
  return <AdvisorClient />;
}
