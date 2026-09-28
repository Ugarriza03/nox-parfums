/**
 * ARMADO DE MENSAJES DE WHATSAPP
 * Fuente única de verdad del texto que recibe NOX. El usuario nunca tiene que
 * volver a escribir los productos a mano.
 */

import { siteConfig, waLink } from "@/config/site";
import {
  formatARS,
  quoteRetail,
  quoteWholesale,
  giftLabel,
  RETAIL_PROMO_UNIT_PRICE
} from "@/config/pricing";
import type { Product } from "@/data/types";

export interface OrderLine {
  product: Product;
  quantity: number;
}

const HEADER_RETAIL = "Hola NOX, quiero realizar este pedido:";
const HEADER_WHOLESALE = "Hola NOX, quiero hacer un pedido mayorista:";
const FOOTER = "Quisiera coordinar entrega y forma de pago.";

function lineText(line: OrderLine): string {
  return `${line.quantity}x ${line.product.inspiredLabel}`;
}

/* ------------------------------------------------------------- minorista */

export function buildRetailMessage(lines: OrderLine[]): string {
  const units = lines.reduce((sum, l) => sum + l.quantity, 0);
  const quote = quoteRetail(units);

  const parts = [HEADER_RETAIL, "", ...lines.map(lineText), "", `Cantidad total: ${units}`];

  if (quote.status === "confirmado") {
    if (quote.promoUnitaria) {
      parts.push(`Precio por unidad: ${formatARS(RETAIL_PROMO_UNIT_PRICE)}`);
    }
    parts.push(`Total: ${formatARS(quote.total)}`);
    parts.push(`Incluye de regalo: ${giftLabel(units)}`);
  } else {
    parts.push("Total: a confirmar con ustedes");
  }

  parts.push("", FOOTER);
  return parts.join("\n");
}

export function retailOrderLink(lines: OrderLine[]): string {
  return waLink(buildRetailMessage(lines));
}

/* ------------------------------------------------------------- mayorista */

export function buildWholesaleMessage(lines: OrderLine[]): string {
  const units = lines.reduce((sum, l) => sum + l.quantity, 0);
  const quote = quoteWholesale(units);

  const parts = [HEADER_WHOLESALE, "", ...lines.map(lineText), "", `Cantidad total: ${units}`];

  if (quote.unitPrice && quote.total) {
    parts.push(`Precio por unidad: ${formatARS(quote.unitPrice)}`);
    parts.push(`Total: ${formatARS(quote.total)}`);
  } else {
    parts.push("Total: a confirmar con ustedes");
  }

  parts.push("", FOOTER);
  return parts.join("\n");
}

export function wholesaleOrderLink(lines: OrderLine[]): string {
  return waLink(buildWholesaleMessage(lines));
}

/* ------------------------------------------------- consultas individuales */

export function productEnquiryLink(product: Product): string {
  return waLink(
    `Hola NOX, quería consultar por ${product.inspiredLabel.replace("Inspirado en ", "el inspirado en ")}. ¿Me pueden contar más?`
  );
}

export function advisorEnquiryLink(answers: Record<string, string>): string {
  const body = Object.entries(answers)
    .filter(([, value]) => value && value.trim().length > 0)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  return waLink(
    `Hola NOX. Hice el asesor de fragancias y estoy buscando:\n\n${body}\n\n¿Me pueden asesorar?`
  );
}

export function generalEnquiryLink(): string {
  return waLink("Hola NOX, quería hacerles una consulta.");
}

export function wholesaleInfoLink(): string {
  return waLink(
    "Hola NOX, me interesa revender sus perfumes. ¿Me pueden pasar la información mayorista?"
  );
}

export function orderIssueLink(): string {
  return waLink(
    "Hola NOX, tuve un problema con un pedido que recibí y quería resolverlo con ustedes."
  );
}

export { siteConfig, waLink };
