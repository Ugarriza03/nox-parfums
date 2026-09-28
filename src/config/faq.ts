/**
 * PREGUNTAS FRECUENTES
 * Sólo información confirmada. Nada de plazos, costos ni políticas inventadas.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const FAQ: FaqGroup[] = [
  {
    title: "El producto",
    items: [
      {
        question: "¿Qué es un Extrait de Parfum?",
        answer:
          "Nuestros extractos se presentan como Extrait de Parfum en 60 ml. Es un formato pensado para una presencia sostenida."
      },
      {
        question: "¿Los perfumes son originales de las marcas?",
        answer:
          "No. NOX ofrece fragancias inspiradas en perfumes reconocidos. Cuando decimos «inspirado en Valentino Born in Roma» estamos indicando la referencia olfativa, no vendiendo ese producto. Es una interpretación muy fiel al perfil olfativo de la fragancia de referencia, y las marcas citadas pertenecen a sus titulares."
      },
      {
        question: "¿Cuánto dura en la piel?",
        answer:
          "Depende de la fragancia, de la piel de cada persona y del clima, así que preferimos no dar un número general. Si te interesa una en particular, escribinos y te contamos lo que sabemos de esa."
      },
      {
        question: "¿Cómo sé cuál elegir si nunca compré?",
        answer:
          "Podés usar el asesor de la web: tres preguntas y te mostramos opciones compatibles con lo que buscás. Y si preferís que te guiemos nosotros, seguimos la charla por WhatsApp."
      }
    ]
  },
  {
    title: "Precios y pedidos",
    items: [
      {
        question: "¿Cómo funciona el beneficio por cantidad?",
        answer:
          "Cuantas más unidades lleves, mejor queda el precio total. Se aplica automáticamente al armar el pedido: no hay cupones ni pasos extra."
      },
      {
        question: "¿Puedo combinar fragancias distintas?",
        answer:
          "Sí. El beneficio se calcula sobre la cantidad total del pedido, no sobre una misma fragancia."
      },
      {
        question: "¿Necesito una cuenta para comprar?",
        answer:
          "No. Armás el pedido en la web y lo cerrás por WhatsApp. Ahí coordinamos entrega y pago."
      }
    ]
  },
  {
    title: "Pagos",
    items: [
      {
        question: "¿Qué medios de pago aceptan?",
        answer:
          "Efectivo, transferencia bancaria y transferencia desde billetera virtual."
      },
      {
        question: "¿Aceptan tarjeta o cuotas?",
        answer:
          "Por el momento no trabajamos con tarjeta de crédito, tarjeta de débito ni pago en cuotas."
      }
    ]
  },
  {
    title: "Entregas",
    items: [
      {
        question: "¿Cómo entregan los pedidos?",
        answer:
          "Según la zona: puntos de entrega, moto mensajería, entrega coordinada o Correo Argentino para el interior. El detalle está en la página de envíos."
      },
      {
        question: "¿Cuánto sale el envío?",
        answer:
          "Depende de la modalidad y de la zona, así que lo confirmamos al coordinar el pedido. No manejamos una tarifa única."
      }
    ]
  },
  {
    title: "Si algo sale mal",
    items: [
      {
        question: "¿Y si me mandan una fragancia equivocada?",
        answer:
          "Lo resolvemos. Si al preparar el pedido nos equivocamos —por ejemplo, pediste el inspirado en Le Male Elixir y recibiste el inspirado en Le Male— escribinos y te lo cambiamos."
      },
      {
        question: "¿A dónde escribo si tengo un problema?",
        answer:
          "Al mismo WhatsApp por el que hiciste el pedido. Es el canal por el que respondemos."
      }
    ]
  },
  {
    title: "Revender",
    items: [
      {
        question: "¿Puedo comprar para revender?",
        answer:
          "Sí. La compra mínima mayorista es de 10 unidades y podés combinar las fragancias que quieras. La escala de precios está en la sección de mayoristas."
      }
    ]
  }
];
