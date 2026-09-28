/**
 * QA de la escala mayorista por rangos.
 * Verifica precio unitario Y total para cada cantidad, incluidos los bordes
 * de cada tramo y el bloqueo por debajo del mínimo.
 *
 *   npm run qa:mayoristas
 */

import {
  WHOLESALE_MIN_UNITS,
  WHOLESALE_PRICING,
  formatARS,
  quoteWholesale
} from "../src/config/pricing";

interface Caso {
  units: number;
  unitPrice: number | null;
  canCheckout: boolean;
}

const CASOS: Caso[] = [
  { units: 0, unitPrice: null, canCheckout: false },
  { units: 1, unitPrice: null, canCheckout: false },
  { units: 9, unitPrice: null, canCheckout: false },
  { units: 10, unitPrice: 9990, canCheckout: true },
  { units: 12, unitPrice: 9990, canCheckout: true },
  { units: 19, unitPrice: 9990, canCheckout: true },
  { units: 20, unitPrice: 9490, canCheckout: true },
  { units: 25, unitPrice: 9490, canCheckout: true },
  { units: 29, unitPrice: 9490, canCheckout: true },
  { units: 30, unitPrice: 8990, canCheckout: true },
  { units: 42, unitPrice: 8990, canCheckout: true },
  { units: 49, unitPrice: 8990, canCheckout: true },
  { units: 50, unitPrice: 8490, canCheckout: true },
  { units: 75, unitPrice: 8490, canCheckout: true },
  { units: 99, unitPrice: 8490, canCheckout: true },
  { units: 100, unitPrice: 7990, canCheckout: true },
  { units: 150, unitPrice: 7990, canCheckout: true },
  { units: 299, unitPrice: 7990, canCheckout: true },
  { units: 300, unitPrice: 7490, canCheckout: true },
  { units: 350, unitPrice: 7490, canCheckout: true },
  { units: 499, unitPrice: 7490, canCheckout: true },
  { units: 500, unitPrice: 6990, canCheckout: true },
  { units: 600, unitPrice: 6990, canCheckout: true },
  { units: 2000, unitPrice: 6990, canCheckout: true }
];

let fallas = 0;

console.log("\nQA — ESCALA MAYORISTA POR RANGOS\n" + "─".repeat(62));
console.log("unid.   precio unit.      total esperado        estado");
console.log("─".repeat(62));

for (const caso of CASOS) {
  const q = quoteWholesale(caso.units);
  const totalEsperado = caso.unitPrice === null ? null : caso.unitPrice * caso.units;

  const okUnit = q.unitPrice === caso.unitPrice;
  const okTotal = q.total === totalEsperado;
  const okCheckout = q.canCheckout === caso.canCheckout;
  const ok = okUnit && okTotal && okCheckout;
  if (!ok) fallas++;

  const unidad = q.unitPrice === null ? "—" : formatARS(q.unitPrice);
  const total = q.total === null ? "bajo mínimo" : formatARS(q.total);
  const estado = q.canCheckout ? "puede finalizar" : `faltan ${q.unitsToMinimum}`;

  console.log(
    `${ok ? "✓" : "✗"} ${String(caso.units).padStart(5)}  ${unidad.padEnd(14)}  ${total.padEnd(18)}  ${estado}`
  );

  if (!ok) {
    if (!okUnit) console.log(`      esperado unitario ${caso.unitPrice}, obtenido ${q.unitPrice}`);
    if (!okTotal) console.log(`      esperado total ${totalEsperado}, obtenido ${q.total}`);
    if (!okCheckout) console.log(`      esperado canCheckout ${caso.canCheckout}, obtenido ${q.canCheckout}`);
  }
}

/* --- El escalón aplica al pedido completo, no sólo a las unidades extra --- */

console.log("\nEl escalón se aplica al pedido COMPLETO:");
for (const [a, b] of [
  [19, 20],
  [29, 30],
  [99, 100],
  [499, 500]
]) {
  const qa = quoteWholesale(a);
  const qb = quoteWholesale(b);
  const mixto = qa.total! + (b - a) * qb.unitPrice!; // cálculo incorrecto, de referencia
  const ok = qb.total === qb.unitPrice! * b && qb.total !== mixto;
  if (!ok) fallas++;
  console.log(
    `${ok ? "✓" : "✗"} ${a} → ${formatARS(qa.total!)}  |  ${b} → ${formatARS(qb.total!)} ` +
      `(${b} × ${formatARS(qb.unitPrice!)}, no ${formatARS(mixto)})`
  );
}

/* ------------------ Sin huecos ni solapamientos en la escala ------------- */

console.log("\nContinuidad de la escala:");
for (let i = 0; i < WHOLESALE_PRICING.length - 1; i++) {
  const actual = WHOLESALE_PRICING[i];
  const siguiente = WHOLESALE_PRICING[i + 1];
  const ok = actual.maxUnits !== null && actual.maxUnits + 1 === siguiente.minUnits;
  if (!ok) fallas++;
  console.log(
    `${ok ? "✓" : "✗"} ${actual.minUnits}–${actual.maxUnits} → ${siguiente.minUnits}…`
  );
}
const ultimo = WHOLESALE_PRICING[WHOLESALE_PRICING.length - 1];
const okUltimo = ultimo.maxUnits === null;
if (!okUltimo) fallas++;
console.log(`${okUltimo ? "✓" : "✗"} último tramo sin techo (${ultimo.minUnits}+)`);

/* ------------------------ Toda cantidad ≥ mínimo cotiza ------------------ */

let sinPrecio = 0;
for (let u = WHOLESALE_MIN_UNITS; u <= 1000; u++) {
  const q = quoteWholesale(u);
  if (q.unitPrice === null || q.total === null) sinPrecio++;
}
const okCobertura = sinPrecio === 0;
if (!okCobertura) fallas++;
console.log(
  `${okCobertura ? "✓" : "✗"} ninguna cantidad entre ${WHOLESALE_MIN_UNITS} y 1000 queda "a confirmar"` +
    (okCobertura ? "" : ` (${sinPrecio} sin precio)`)
);

console.log("\n" + "─".repeat(62));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
