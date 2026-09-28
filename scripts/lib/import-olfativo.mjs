/**
 * ENTRADA ESTRUCTURADA DE INFORMACIÓN OLFATIVA
 *
 * Por qué existe: la consulta automatizada a la fuente de referencia puede no
 * estar disponible (por ejemplo, HTTP 403). En ese caso NO se evade nada: se
 * registra needsReview y se usa este camino alternativo, que recibe los mismos
 * datos estructurados en un archivo JSON.
 *
 * Lo que este módulo NO hace, a propósito:
 *   · No descarga nada. Es un lector y validador de archivos locales.
 *   · No inventa datos: si faltan notas, el registro se rechaza.
 *   · No acepta texto editorial, reseñas, votos ni performance. Cualquier campo
 *     de performance en el archivo es un ERROR, no un dato que se ignora en
 *     silencio: si alguien lo mandó, quiere decir que entendió mal el modelo.
 *
 * Lo que este módulo devuelve es EXACTAMENTE la misma forma que produce el
 * parser remoto (`parsePerfumePage`): { topNotes, middleNotes, baseNotes,
 * accords }. De ahí en adelante el pipeline es uno solo — mismo matcher, misma
 * traducción, misma derivación de familia y carácter, mismo schema, mismo QA.
 *
 * ───────────────────────────── SCHEMA ─────────────────────────────
 *
 * Un archivo puede contener un objeto o un array de objetos (lote):
 *
 * {
 *   "productSlug":   "lattafa-yara",        // requerido · debe existir en el catálogo
 *   "brand":         "Lattafa",             // requerido · marca de la fragancia de referencia
 *   "referenceName": "Yara",                // requerido · nombre exacto de la variante
 *   "source": {
 *     "name":         "Fragrantica",        // requerido
 *     "status":       "verified",           // "verified" | "candidate" (ver abajo)
 *     "url":          "https://…/Yara-76880.html",  // sólo en "verified"
 *     "checkedAt":    "2026-09-13",         // sólo en "verified" · requerido ahí
 *     "candidateUrl": null                  // sólo en "candidate"
 *   },
 *   "profile": {
 *     "topNotes":    ["Orchid", "Heliotrope", "Tangerine"],   // requerido
 *     "middleNotes": ["Gourmand Accord", "Tropical Fruits"],  // requerido
 *     "baseNotes":   ["Vanilla", "Musk", "Sandalwood"],       // requerido
 *     "accords":     ["Sweet", "Vanilla", "Powdery"],         // requerido
 *     "mainNotes":   [],                    // opcional · si va vacío se deriva
 *     "family":      null                   // opcional · informativo; la familia
 *                                           //   real se deriva de los acordes
 *   },
 *   "referenceGender": "femenino",          // opcional · género de la ficha de
 *                                           //   referencia ("masculino" | "femenino" |
 *                                           //   "unisex"). Si contradice al producto
 *                                           //   NOX, el registro queda needsReview.
 *   "needsReview": true,                    // opcional · el operador declara que NO
 *   "reviewReason": "…",                    //   pudo determinar la referencia con
 *                                           //   certeza. No se carga nada y queda
 *                                           //   anotado. Es un resultado válido.
 *   "note": "…"                             // opcional · observación interna
 * }
 *
 * ───────────────────── ESTADOS DE LA FUENTE ─────────────────────
 *
 * Una URL que todavía no se abrió NO es procedencia. El schema las separa:
 *
 *   "verified"   name + url + checkedAt. Alguien abrió esa ficha y la comprobó.
 *                Es la única que cuenta como provenance y la única con la que
 *                se pueden cargar datos olfativos.
 *
 *   "candidate"  name + candidateUrl, sin url y sin checkedAt. Es una
 *                referencia probable, no comprobada. Sirve para probar la
 *                identificación (--solo-match) y para dejar anotado por dónde
 *                seguir, pero NUNCA se guarda como url de origen ni habilita
 *                una carga de notas: en una corrida completa queda needsReview.
 *
 *   needsReview  la identidad o la variante están en duda (declarado en el
 *                archivo, o detectado por el matcher o por el género). No
 *                escribe datos, cualquiera sea el estado de la fuente.
 *
 * Si se declara una url sin checkedAt, el registro se rechaza: o se comprueba y
 * se fecha, o se declara como candidateUrl. No hay término medio.
 *
 * Modo sólo-match (`--solo-match`): valida identidad, marca, variante y URL, y
 * corre el matcher SIN exigir perfil. Sirve para probar el matcher contra un
 * lote antes de tener los datos olfativos. En ese modo nunca se escribe nada.
 *
 * Las notas y los acordes se escriben como figuran en la fuente (inglés). El
 * pipeline los pasa por el diccionario de traducción existente; lo que no esté
 * en el diccionario se conserva tal cual y marca el registro como needsReview.
 */

import { readFileSync } from "node:fs";
import { brandMatchesUrl, normalize } from "./fragrantica.mjs";

/** Campos de performance. Su sola presencia invalida el registro. */
const CAMPOS_PERFORMANCE = [
  "noxPerformance",
  "performance",
  "longevity",
  "projection",
  "sillage",
  "performanceIntensity",
  "testedAt",
  "duration",
  "duracion",
  "hours",
  "horas",
  "rendimiento",
  "estela",
  "proyeccion"
];

/** Campos que traen opinión ajena o texto editorial. Tampoco se importan. */
const CAMPOS_EDITORIALES = [
  "description",
  "descripcion",
  "review",
  "reviews",
  "reseñas",
  "resenas",
  "comments",
  "comentarios",
  "votes",
  "votos",
  "rating",
  "ratings",
  "feel",
  "likeIf"
];

/** Lee y parsea el archivo. Devuelve siempre un array de registros crudos. */
export function readImportFile(path) {
  let crudo;
  try {
    crudo = readFileSync(path, "utf8");
  } catch (error) {
    throw new Error(`No se pudo leer ${path}: ${error.message}`);
  }

  let data;
  try {
    data = JSON.parse(crudo);
  } catch (error) {
    throw new Error(`${path} no es JSON válido: ${error.message}`);
  }

  if (Array.isArray(data)) {
    if (data.length === 0) throw new Error(`${path} es un array vacío: no hay nada para importar.`);
    return data;
  }
  if (data && typeof data === "object") return [data];
  throw new Error(`${path} debe contener un objeto o un array de objetos.`);
}

function esArrayDeTexto(valor) {
  return Array.isArray(valor) && valor.every((x) => typeof x === "string");
}

function limpiar(lista) {
  const vistos = new Set();
  const out = [];
  const duplicados = [];
  for (const item of lista ?? []) {
    const texto = String(item).trim();
    if (!texto) continue;
    const clave = normalize(texto);
    if (vistos.has(clave)) {
      duplicados.push(texto);
      continue;
    }
    vistos.add(clave);
    out.push(texto);
  }
  return { lista: out, duplicados };
}

function camposProhibidos(objeto, prohibidos) {
  if (!objeto || typeof objeto !== "object") return [];
  const claves = Object.keys(objeto).map((k) => [k, normalize(k).replace(/\s+/g, "")]);
  return claves
    .filter(([, norm]) => prohibidos.some((p) => normalize(p).replace(/\s+/g, "") === norm))
    .map(([k]) => k);
}

const GENEROS = ["masculino", "femenino", "unisex"];

/**
 * Valida un registro contra el schema y contra el producto real del catálogo.
 *
 * @param record   registro crudo del archivo
 * @param product  Product del catálogo cuyo slug coincide (o undefined)
 * @param opciones { marcaEsperada, soloMatch } marca de referencia esperada y
 *                 modo sólo-match (no exige perfil)
 * @returns {{ errores: string[], avisos: string[], parsed: object|null, brand: string,
 *             referenceName: string, source: object }}
 */
export function validateImportRecord(record, product, opciones = {}) {
  const errores = [];
  const avisos = [];

  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { errores: ["El registro no es un objeto JSON."], avisos, parsed: null };
  }

  /* --- performance y texto editorial: prohibidos en cualquier nivel ------- */
  const perf = [
    ...camposProhibidos(record, CAMPOS_PERFORMANCE),
    ...camposProhibidos(record.profile, CAMPOS_PERFORMANCE),
    ...camposProhibidos(record.source, CAMPOS_PERFORMANCE)
  ];
  if (perf.length > 0) {
    errores.push(
      `Trae campos de performance (${perf.join(", ")}). La performance del extracto NOX se mide, ` +
        "no se importa: se carga a mano en src/data/nox-performance.ts."
    );
  }
  const editorial = [
    ...camposProhibidos(record, CAMPOS_EDITORIALES),
    ...camposProhibidos(record.profile, CAMPOS_EDITORIALES)
  ];
  if (editorial.length > 0) {
    errores.push(
      `Trae campos editoriales o de opinión ajena (${editorial.join(", ")}). Sólo se importan ` +
        "datos estructurados; la redacción de la ficha es propia de NOX."
    );
  }

  /* --- el operador declara que no pudo resolverlo -------------------------- */
  const declaraRevision = record.needsReview === true;
  const razonDeclarada =
    typeof record.reviewReason === "string" ? record.reviewReason.trim() : "";
  if (declaraRevision && !razonDeclarada) {
    errores.push('Declara needsReview pero no explica por qué (falta reviewReason).');
  }

  /* --- identidad ---------------------------------------------------------- */
  const slug = typeof record.productSlug === "string" ? record.productSlug.trim() : "";
  if (!slug) errores.push("Falta productSlug.");
  else if (!product) errores.push(`productSlug "${slug}" no existe en el catálogo.`);

  const brand = typeof record.brand === "string" ? record.brand.trim() : "";
  if (!brand) errores.push("Falta brand.");
  else if (opciones.marcaEsperada && normalize(brand) !== normalize(opciones.marcaEsperada)) {
    errores.push(
      `La marca del archivo ("${brand}") no coincide con la del producto ` +
        `("${opciones.marcaEsperada}").`
    );
  }

  const referenceName =
    typeof record.referenceName === "string" ? record.referenceName.trim() : "";
  if (!referenceName) errores.push("Falta referenceName.");

  /* --- fuente: verificada vs. candidata ----------------------------------- */
  const source = record.source ?? {};
  const sourceName = typeof source.name === "string" ? source.name.trim() : "";
  const sourceUrl = typeof source.url === "string" ? source.url.trim() : "";
  const candidateUrl =
    typeof source.candidateUrl === "string" ? source.candidateUrl.trim() : "";
  const checkedAtCrudo = typeof source.checkedAt === "string" ? source.checkedAt.trim() : "";

  // El estado declarado manda; si no se declara, se infiere de lo que hay.
  const estadoDeclarado =
    typeof source.status === "string" ? source.status.trim().toLowerCase() : "";
  if (estadoDeclarado && !["verified", "candidate"].includes(estadoDeclarado)) {
    errores.push(`source.status "${estadoDeclarado}" no es "verified" ni "candidate".`);
  }
  // Si trae url, la intención es declararla como comprobada: se la valida como
  // "verified" para poder decir exactamente qué le falta (típicamente checkedAt)
  // en vez de un error genérico.
  const sourceStatus =
    estadoDeclarado || (sourceUrl ? "verified" : candidateUrl ? "candidate" : "");

  if (!sourceName) errores.push("Falta source.name.");

  if (sourceStatus === "candidate") {
    if (sourceUrl) {
      errores.push(
        "Una fuente candidata no puede traer source.url: la URL sin comprobar va en " +
          "source.candidateUrl, para que no se guarde como procedencia."
      );
    }
    if (checkedAtCrudo) {
      errores.push("Una fuente candidata no puede traer checkedAt: todavía no se comprobó.");
    }
    if (!candidateUrl) errores.push("Fuente candidata sin source.candidateUrl.");
  } else if (sourceStatus === "verified") {
    if (candidateUrl) {
      errores.push("Una fuente verificada no puede traer candidateUrl al mismo tiempo.");
    }
    if (!sourceUrl) errores.push("Falta source.url: sin URL no hay procedencia que auditar.");
    if (!checkedAtCrudo) {
      errores.push(
        "Falta source.checkedAt. Una URL sin fecha de comprobación no es procedencia: " +
          'comprobala y fechala, o declarala como candidata (status "candidate" + candidateUrl).'
      );
    }
  } else {
    errores.push(
      'La fuente no declara estado ni trae datos: usá status "verified" con url y checkedAt, ' +
        'o status "candidate" con candidateUrl.'
    );
  }

  // La URL a revisar es la que haya, comprobada o no: las validaciones de forma
  // valen para las dos. Lo que cambia es si cuenta como procedencia.
  const urlRevisable = sourceUrl || candidateUrl;
  const campoUrl = sourceUrl ? "source.url" : "source.candidateUrl";
  if (!urlRevisable) {
    // ya informado arriba
  } else if (!/^https?:\/\//i.test(urlRevisable)) {
    errores.push(`${campoUrl} no es una URL válida: "${urlRevisable}".`);
  } else if (/\/designers\//i.test(urlRevisable)) {
    errores.push(`${campoUrl} apunta al índice de la casa, no a la ficha de la fragancia.`);
  } else if (brand) {
    // La URL tiene que ser de la casa declarada: evita traer "otra Yara".
    //
    // El segmento de marca se reconoce por la forma de la fuente de referencia,
    // que es /perfume/<Casa>/<ficha>. El marcador tiene que ser el segmento
    // "perfume" EXACTO, no cualquiera que lo contenga: un sitio oficial puede
    // tener rutas como /fragrances/womens-perfume/si/si-eau-de-parfum/, donde
    // "womens-perfume" hacía que el segmento siguiente ("si", el nombre de la
    // línea) se leyera como si fuera la marca y el registro se rechazara por
    // una marca que nunca estuvo mal. Comprobado sobre las 211 URLs ya
    // cargadas: el segmento detectado es idéntico en las 211 con una regla y
    // con la otra. La comprobación no se afloja — se vuelve más precisa.
    const segmentos = urlRevisable.split("/").filter(Boolean);
    const marcaEnUrl = segmentos.find(
      (s, i) => i > 0 && segmentos[i - 1].toLowerCase() === "perfume"
    );
    if (marcaEnUrl && !brandMatchesUrl(brand, marcaEnUrl)) {
      errores.push(
        `${campoUrl} pertenece a "${marcaEnUrl.replace(/-/g, " ")}" y la marca declarada es "${brand}".`
      );
    }
    // Y la variante declarada tiene que figurar en la URL.
    const ultimo = normalize(segmentos[segmentos.length - 1] ?? "");
    if (referenceName && ultimo && !ultimo.includes(normalize(referenceName))) {
      avisos.push(
        `La URL no menciona "${referenceName}". Verificá que sea la ficha de esa variante.`
      );
    }
  }

  const checkedAt = checkedAtCrudo;

  /* --- coherencia de género con el producto del catálogo ------------------ */
  const referenceGender =
    typeof record.referenceGender === "string" ? record.referenceGender.trim().toLowerCase() : "";
  if (referenceGender && !GENEROS.includes(referenceGender)) {
    errores.push(`referenceGender "${referenceGender}" no es masculino, femenino ni unisex.`);
  }
  // Si la ficha de referencia es de otro género que el producto NOX, puede ser
  // otra variante (Eros / Eros Pour Femme). No se resuelve solo: va a revisión.
  let conflictoGenero = "";
  if (
    referenceGender &&
    product &&
    GENEROS.includes(referenceGender) &&
    referenceGender !== "unisex" &&
    product.gender !== "unisex" &&
    referenceGender !== product.gender
  ) {
    conflictoGenero =
      `La referencia es ${referenceGender} y el producto NOX figura como ${product.gender}. ` +
      "Puede ser otra variante de la misma línea: hace falta confirmarlo a mano.";
  }

  /* --- perfil ------------------------------------------------------------- */
  const profile = record.profile ?? {};
  if (!record.profile || typeof record.profile !== "object") {
    if (!opciones.soloMatch && !declaraRevision) errores.push("Falta el objeto profile.");
  }

  for (const campo of ["topNotes", "middleNotes", "baseNotes", "accords"]) {
    if (profile[campo] !== undefined && !esArrayDeTexto(profile[campo])) {
      errores.push(`profile.${campo} tiene que ser un array de textos.`);
    }
  }
  if (profile.mainNotes !== undefined && !esArrayDeTexto(profile.mainNotes)) {
    errores.push("profile.mainNotes tiene que ser un array de textos.");
  }

  const top = limpiar(profile.topNotes);
  const middle = limpiar(profile.middleNotes);
  const base = limpiar(profile.baseNotes);
  const accords = limpiar(profile.accords);

  const principales = limpiar(profile.mainNotes);
  const totalNotas = top.lista.length + middle.lista.length + base.lista.length;
  // En sólo-match y en un registro declarado para revisión, el perfil puede
  // faltar: lo que se está probando es la identificación, no los datos.
  const exigePerfil = !opciones.soloMatch && !declaraRevision;
  if (totalNotas === 0 && principales.lista.length === 0 && exigePerfil) {
    errores.push("El perfil no trae ninguna nota. Sin notas no se carga nada.");
  }
  // Hay fichas de referencia que publican las notas sin separarlas por etapa.
  // Se aceptan con mainNotes solamente: la ficha dirá que no hay datos por
  // etapa, que es la verdad, en vez de inventar una pirámide.
  if (totalNotas === 0 && principales.lista.length > 0) {
    avisos.push(
      "La fuente no separa la pirámide por etapas: se cargan sólo las notas principales."
    );
  }
  if (accords.lista.length === 0 && exigePerfil) {
    errores.push("El perfil no trae acordes: son los que derivan familia y carácter.");
  }

  const duplicados = [
    ...top.duplicados,
    ...middle.duplicados,
    ...base.duplicados,
    ...principales.duplicados,
    ...accords.duplicados
  ];
  if (duplicados.length > 0) {
    avisos.push(`Se descartaron duplicados: ${[...new Set(duplicados)].join(", ")}.`);
  }

  if (profile.family) {
    avisos.push(
      `profile.family ("${profile.family}") es informativo: la familia NOX se deriva de los acordes.`
    );
  }

  if (errores.length > 0) {
    return {
      errores,
      avisos,
      declaraRevision,
      razonDeclarada,
      conflictoGenero,
      referenceGender,
      parsed: null,
      brand,
      referenceName,
      source: {}
    };
  }

  return {
    errores,
    avisos,
    declaraRevision,
    razonDeclarada,
    conflictoGenero,
    referenceGender,
    // Misma forma que devuelve parsePerfumePage: el pipeline no distingue.
    parsed: {
      topNotes: top.lista,
      middleNotes: middle.lista,
      baseNotes: base.lista,
      accords: accords.lista,
      mainNotes: principales.lista
    },
    brand,
    referenceName,
    source: {
      name: sourceName,
      status: sourceStatus,
      // `url` sólo se llena cuando la fuente está comprobada. Una candidata
      // nunca ocupa este campo: así es imposible confundirlas más adelante.
      url: sourceStatus === "verified" ? sourceUrl : "",
      candidateUrl: sourceStatus === "candidate" ? candidateUrl : "",
      checkedAt: checkedAt || null
    },
    note: typeof record.note === "string" ? record.note.trim() : ""
  };
}

/** Agrupa los registros por productSlug y detecta el mismo producto repetido. */
export function indexImportRecords(records) {
  const porSlug = new Map();
  const repetidos = [];
  for (const record of records) {
    const slug = typeof record?.productSlug === "string" ? record.productSlug.trim() : "";
    if (!slug) {
      porSlug.set(`__sin-slug-${porSlug.size}`, record);
      continue;
    }
    if (porSlug.has(slug)) {
      repetidos.push(slug);
      continue;
    }
    porSlug.set(slug, record);
  }
  return { porSlug, repetidos };
}
