/**
 * LEDGER PERSISTENTE DE REVISIONES PENDIENTES  (data-review/revision.json)
 *
 * El archivo es acumulativo: guarda TODO lo que quedó sin resolver, venga del
 * lote que venga. Una corrida sólo tiene autoridad sobre los productos que
 * efectivamente procesó; el resto del ledger no se toca.
 *
 * Antes, cada corrida escribía únicamente sus propias entradas y borraba en
 * silencio las de los lotes anteriores. `mergeRevisionLedger` reemplaza esa
 * escritura por una fusión con reglas explícitas:
 *
 *   A. Fuera de alcance      slug que la corrida NO procesó → se preserva tal cual.
 *   B. Sigue pendiente       slug procesado que vuelve a necesitar revisión →
 *                            la entrada nueva REEMPLAZA a la vieja (motivo al día).
 *   C. Resuelto              slug procesado que ya no necesita revisión →
 *                            se ELIMINA del ledger.
 *   D. Sin slug              entrada previa sin slug legible → se preserva:
 *                            no hay forma de saber si se resolvió.
 *   E. Deduplicado           un slug ocupa como mucho una entrada. Entre varias
 *                            entradas nuevas del mismo slug gana la última.
 *   F. Orden estable         primero las preservadas en su orden original, después
 *                            las nuevas en el orden en que las produjo la corrida.
 *                            Un slug que ya estaba en el ledger conserva su
 *                            posición aunque su contenido se actualice.
 *   G. Idempotente           volver a correr el mismo lote con el mismo resultado
 *                            deja el archivo byte a byte igual.
 *
 * La función es pura: no lee ni escribe archivos.
 *
 * @param {object[]} previo      ledger ya escrito en disco (array parseado)
 * @param {object[]} nuevas      entradas de revisión que produjo esta corrida
 * @param {Iterable<string>} procesados  slugs sobre los que esta corrida tuvo alcance
 * @returns {object[]}           ledger fusionado
 */
export function mergeRevisionLedger(previo, nuevas, procesados) {
  const anterior = Array.isArray(previo) ? previo : [];
  const producidas = Array.isArray(nuevas) ? nuevas : [];
  const alcance = new Set(procesados ?? []);

  // E — una entrada por slug; entre repetidas del mismo slug gana la última.
  const pendientes = new Map();
  const sinSlug = [];
  for (const entrada of producidas) {
    const slug = entrada?.slug;
    if (typeof slug === "string" && slug.length > 0) pendientes.set(slug, entrada);
    else sinSlug.push(entrada);
  }

  // Un slug que la corrida marcó para revisión está, por definición, en alcance.
  for (const slug of pendientes.keys()) alcance.add(slug);

  const salida = [];
  const yaPuestos = new Set();

  for (const entrada of anterior) {
    const slug = entrada?.slug;

    // D — sin slug no se puede decidir nada: se preserva.
    if (typeof slug !== "string" || slug.length === 0) {
      salida.push(entrada);
      continue;
    }

    // E — el ledger previo podría venir con duplicados: se colapsan.
    if (yaPuestos.has(slug)) continue;

    // A — la corrida no tuvo alcance sobre este producto: intacto.
    if (!alcance.has(slug)) {
      salida.push(entrada);
      yaPuestos.add(slug);
      continue;
    }

    // B — sigue pendiente: entra la versión nueva, en la posición vieja (F).
    if (pendientes.has(slug)) {
      salida.push(pendientes.get(slug));
      yaPuestos.add(slug);
      continue;
    }

    // C — procesado y resuelto: se elimina.
  }

  // F — las pendientes que no estaban antes se agregan al final, en orden.
  for (const entrada of producidas) {
    const slug = entrada?.slug;
    if (typeof slug !== "string" || slug.length === 0) continue;
    if (yaPuestos.has(slug)) continue;
    if (pendientes.get(slug) !== entrada) continue; // no es la ganadora del dedup
    salida.push(entrada);
    yaPuestos.add(slug);
  }

  // Entradas nuevas sin slug: no deberían existir, pero no se descartan.
  salida.push(...sinSlug);

  return salida;
}

/** Resumen legible de lo que hizo la fusión, para el informe de la corrida. */
export function resumirMerge(previo, fusionado) {
  const antes = new Set((previo ?? []).map((e) => e?.slug).filter(Boolean));
  const despues = new Set((fusionado ?? []).map((e) => e?.slug).filter(Boolean));
  return {
    total: (fusionado ?? []).length,
    agregadas: [...despues].filter((s) => !antes.has(s)),
    resueltas: [...antes].filter((s) => !despues.has(s)),
    preservadas: [...despues].filter((s) => antes.has(s))
  };
}
