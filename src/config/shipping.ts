/**
 * ENVÍOS Y ENTREGAS
 *
 * IMPORTANTE: no se declaran costos fijos ni plazos exactos porque no fueron
 * definidos comercialmente. Si más adelante se confirman, agregar los campos
 * `cost` y `eta` a cada modalidad.
 */

export interface ShippingMethod {
  id: string;
  title: string;
  description: string;
  /** Se completa cuando exista una tarifa confirmada. */
  cost: string | null;
  /** Se completa cuando exista un plazo confirmado. */
  eta: string | null;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "punto-encuentro",
    title: "Puntos de entrega",
    description:
      "Coordinamos un punto de encuentro conveniente para vos. Es la forma más directa y la que más usan nuestros clientes de la zona.",
    cost: null,
    eta: null
  },
  {
    id: "moto",
    title: "Moto mensajería",
    description:
      "Según la zona, enviamos con Uber Moto u otro servicio de mensajería. Te pasamos el detalle al coordinar el pedido.",
    cost: null,
    eta: null
  },
  {
    id: "entrega-coordinada",
    title: "Entrega coordinada",
    description:
      "Cuando la ubicación lo permite, acordamos día y horario de entrega directamente con vos.",
    cost: null,
    eta: null
  },
  {
    id: "correo-argentino",
    title: "Correo Argentino",
    description:
      "Para el interior del país y para zonas fuera de nuestro alcance de entrega directa, despachamos por Correo Argentino.",
    cost: null,
    eta: null
  }
];

export const PAYMENT_METHODS = [
  {
    id: "efectivo",
    title: "Efectivo",
    description: "En entregas presenciales y puntos de encuentro."
  },
  {
    id: "transferencia",
    title: "Transferencia bancaria",
    description: "Te pasamos los datos al confirmar el pedido."
  },
  {
    id: "billetera",
    title: "Transferencia por billetera virtual",
    description: "Transferencia desde tu billetera virtual habitual."
  }
] as const;
