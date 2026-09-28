/**
 * REFERENCIA OLFATIVA — capa de resolución y parseo
 *
 * Fragrantica se usa como FUENTE INTERNA de datos estructurados sobre la
 * fragancia de referencia. De acá sólo salen: notas de salida / corazón /
 * fondo, notas principales, acordes y familia.
 *
 * Lo que este módulo NO hace, a propósito:
 *   · no copia descripciones, reseñas ni texto editorial de terceros
 *   · no extrae duración, proyección ni estela (varían por piel y por
 *     formulación, y describirían al original y no al extrait NOX)
 *   · no adivina: si el match no es concluyente devuelve needsReview
 *
 * Todas las funciones son puras sobre strings, así que el matcher se puede
 * testear sin red (ver scripts/qa-match.mjs).
 */

/* ========================================================================= */
/*  1. MARCAS                                                                */
/* ========================================================================= */

/**
 * Marca del catálogo NOX → slug de la casa en la referencia.
 * Sólo entradas confirmadas a mano. Una marca que no está acá se intenta
 * con su propio slug y, si falla, queda para revisión.
 */
export const BRAND_SLUGS = {
  "Christian Dior": "Dior",
  "Paco Rabanne": "Rabanne",
  "Jean Paul Gaultier": "Jean-Paul-Gaultier",
  "Thierry Mugler": "Mugler",
  Armani: "Giorgio-Armani",
  "Giorgio Armani": "Giorgio-Armani",
  "Lancôme": "Lancome",
  "Viktor & Rolf": "Viktor-Rolf",
  "Victoria's Secret": "Victoria-s-Secret",
  "Dolce & Gabbana": "Dolce-Gabbana",
  "J. Del Pozo": "Jesus-Del-Pozo",
  Kilian: "By-Kilian",
  Lattafa: "Lattafa-Perfumes",
  "Al Haramain": "Al-Haramain-Perfumes",
  "Maison Francis Kurkdjian": "Maison-Francis-Kurkdjian",
  "Parfums de Marly": "Parfums-de-Marly",
  "Memo Paris": "Memo-Paris",
  "Antonio Banderas": "Antonio-Banderas",
  "Ariana Grande": "Ariana-Grande",
  "Britney Spears": "Britney-Spears",
  "Calvin Klein": "Calvin-Klein",
  "Carolina Herrera": "Carolina-Herrera",
  "Hugo Boss": "Hugo-Boss",
  "Issey Miyake": "Issey-Miyake",
  "Nina Ricci": "Nina-Ricci",
  "Ralph Lauren": "Ralph-Lauren",
  "Tom Ford": "Tom-Ford",
  "Tommy Hilfiger": "Tommy-Hilfiger",
  "Louis Vuitton": "Louis-Vuitton",
  "Yves Saint Laurent": "Yves-Saint-Laurent",
  Bulgari: "Bvlgari",
  // Equivalencia de casa para validar la URL de referencia: la marca publica
  // esta línea bajo su casa madre. NO cambia house, nombre público ni slug.
  DKNY: "Donna-Karan",
  Afnan: "Afnan",
  Armaf: "Armaf",
  Rasasi: "Rasasi",
  Kajal: "Kajal",
  Kayali: "Kayali",
  Bharara: "Bharara-Beauty",
  Xerjoff: "Xerjoff",
  Montale: "Montale",
  Amouage: "Amouage"
};

/**
 * Casos donde el catálogo NOX atribuiría una fragancia a una marca distinta de
 * la que figura en la referencia. La atribución de 9PM y 9PM Night Out (Afnan)
 * y de Club de Nuit y Mandarin Sky (Armaf) ya quedó corregida en el catálogo.
 */
export const PRODUCT_BRAND_OVERRIDES = {
  // La fuente publica esta fragancia bajo la casa "Halloween", no bajo
  // "Jesus Del Pozo", que allí es otra casa con su propio catálogo. Se resuelve
  // por producto y NO tocando BRAND_SLUGS, para no desviar otras referencias de
  // J. Del Pozo. El nombre público NOX no cambia.
  "J. Del Pozo — Halloween": "Halloween"
};

/**
 * Nombre del catálogo → nombre exacto de la fragancia de referencia.
 *
 * Sólo entradas verificadas a mano. Un alias mal puesto es justamente el error
 * que este sistema tiene que evitar, así que ante la duda no se agrega: el
 * matcher marca el producto para revisión y alguien lo resuelve.
 *
 * Los nombres que existirían en masculino y femenino a la vez se desambiguan en
 * el catálogo, no acá: "212 VIP" es el femenino y "212 VIP Men" el masculino,
 * y cada uno coincide de forma exacta con su referencia. Un alias por nombre no
 * podría distinguirlos.
 */
/**
 * ALIAS ACOTADOS A UNA CASA.
 *
 * Se usan cuando el nombre del catálogo NOX sólo es ambiguo dentro de su propia
 * marca: "Le Male Parfum" identifica una fragancia concreta en Jean Paul
 * Gaultier, pero el mismo texto en otra casa no significaría lo mismo. Tienen
 * prioridad sobre NAME_ALIASES.
 *
 * NUNCA cambian el nombre público: el catálogo sigue mostrando el naming NOX.
 */
export const BRAND_NAME_ALIASES = {
  "Memo Paris": {
    // Lote 10. Mismo caso: la casa no tiene un 'Iris Leather', sino Irish Leather
    // (2013). La portada imprime 'IRIS LEATHER', así que el naming público queda.
    "Iris Leather": "Irish Leather"
  },
  "Louis Vuitton": {
    // Lote 10. Error de naming del catálogo confirmado por NOX: la casa no tiene
    // un 'Afternoon Sweet'. El nombre público NO se cambia, porque la portada ya
    // impresa dice 'AFTERNOON SWEET' en el título y en el frasco. Igual que con
    // Tobacco Vanilla y Mandarin Sky, el alias resuelve la referencia y el nombre
    // interno nunca se publica.
    "Afternoon Sweet": "Afternoon Swim"
  },
  "Tommy Hilfiger": {
    // Lote 10. El catálogo usa el nombre de la casa. La referencia es Tommy
    // (1995), Fragrantica 6314.
    "Tommy Hilfiger": "Tommy"
  },
  "Tom Ford": {
    // Lote 10. La casa la comercializa como 'Fabulous' (2017). El nombre público
    // de NOX no cambia: sólo se resuelve la referencia interna.
    "Fucking Fabulous": "Fabulous"
  },
  Creed: {
    // Lote 10. El catálogo invierte el orden del nombre oficial.
    "Aventus Absolu": "Absolu Aventus",
    // Lote 10. El nombre oficial no incluye "Aventus".
    "Aventus Millesime 1849": "Millesime 1849"
  },
  Guerlain: {
    // Lote 10. "Aqua Allegoria" es una línea entera. La fragancia concreta que
    // vende NOX es Mandarine Basilic.
    "Acqua Alegoría": "Aqua Allegoria Mandarine Basilic"
  },
  "Christian Dior": {
    // Lote 10. Cinco referencias conviven bajo el nombre "Miss Dior". La
    // decisión comercial de NOX es el Eau de Parfum de 2017, Fragrantica 45202.
    "Miss Dior": "Miss Dior Eau de Parfum",
    // Lote 08. El catálogo dice "Dior Homme" a secas; la decisión comercial de
    // NOX es la referencia que Dior comercializa como "Dior Homme Original"
    // (2021, la reedición del perfil de iris). No alcanza a "Dior Homme Intense",
    // que en el catálogo se llama distinto y tiene su propia ficha.
    "Dior Homme": "Dior Homme Original",
    // Lote 08. El catálogo dice "J'adore" sin concentración; la decisión
    // comercial de NOX es el Eau de Toilette, no el Eau de Parfum.
    "J'adore": "J'adore Eau de Toilette"
  },
  "Jean Paul Gaultier": {
    // La referencia se comercializa como "Le Male Le Parfum".
    // No confundir con Le Male, Le Male Elixir ni Ultra Male.
    "Le Male Parfum": "Le Male Le Parfum",
    // La referencia pertenece a la línea Le Beau.
    "Paradise Garden": "Le Beau Paradise Garden",
    // Verificado en la ficha: la referencia lleva el prefijo de línea
    // "Gaultier". "Divine" a secas es demasiado genérico para un alias global.
    Divine: "Gaultier Divine"
  },
  "Al Haramain": {
    // La referencia lleva el sufijo "Edition".
    "Amber Oud Gold": "Amber Oud Gold Edition"
  },
  Givenchy: {
    // Lote 10. Misma convención que L'Interdit Rouge: Givenchy comercializa EDP y
    // EDT con composiciones distintas, y NOX vende el Eau de Parfum (2018).
    "L'Interdit": "L'Interdit Eau de Parfum",
    // La referencia incluye la concentración en el nombre.
    "Gentleman Reserve Privée": "Gentleman Eau de Parfum Reserve Privée",
    // Macro-lote: la referencia es plural ("Gentlemen"), no singular.
    "Gentleman Only": "Gentlemen Only",
    // La casa repite su nombre dentro del de la fragancia.
    Irresistible: "Irresistible Givenchy",
    // La referencia incluye la concentración en el nombre.
    "L'Interdit Rouge": "L'Interdit Eau de Parfum Rouge"
  },
  "Giorgio Armani": {
    // Verificado en la ficha: la referencia es "Absolu", sin la "t" final.
    "Armani Code Absolut": "Armani Code Absolu",
    // La referencia pertenece a la línea Emporio Armani.
    "Because It's You": "Emporio Armani Because It's You"
  },
  "Hugo Boss": {
    // Lote 10. El catálogo usa el nombre de la casa como nombre de fragancia.
    // La referencia es Hugo (1995), Fragrantica 570, no Hugo Man (2021).
    "Hugo Boss": "Hugo",
    // Verificado en la ficha: las dos referencias llevan el prefijo de línea
    // "Boss", y The Scent Elixir además distingue For Him de For Her.
    "Bottled Elixir": "Boss Bottled Elixir",
    "Boss The Scent Elixir": "Boss The Scent Elixir For Him",
    // Mismo prefijo de línea que el resto de Boss Bottled.
    "Bottled Night": "Boss Bottled Night"
  },
  Kayali: {
    // Verificado en la ficha: la referencia incluye el sufijo de sabor y el
    // número de la línea Yum.
    "Yum Pistachio": "Yum Pistachio Gelato | 33",
    "Yum Marshmallow": "Yum Boujee Marshmallow | 81"
  },

  /* --- macro-lote: casas nuevas --------------------------------------- */
  // "Armani" y "Giorgio Armani" son casas distintas en el catálogo NOX y
  // apuntan a fragancias distintas: la femenina y la masculina de la línea Code.
  Armani: {
    // Lote 10. La referencia lleva el acento y la concentración. Se usa la
    // composición que Armani publica hoy, no la pirámide clásica.
    Si: "Sì Eau de Parfum",
    "Armani Code": "Armani Code for Women"
  },
  "Antonio Banderas": {
    Icon: "The Icon"
  },
  Azzaro: {
    // La referencia es el clásico de 1978, que lleva "pour Homme" en el nombre.
    Azzaro: "Azzaro pour Homme"
  },
  "Calvin Klein": {
    // Las dos pertenecen a la línea CK One Shock y se distinguen por destinatario.
    "One Shock": "CK One Shock For Her",
    Shock: "CK One Shock For Him"
  },
  "Carolina Herrera": {
    // Lote 10. No existe un 'Bad Boy Cobalt' simple: NOX vende el Elixir (2024).
    "Bad Boy Cobalt": "Bad Boy Cobalt Elixir",
    // El catálogo NOX invierte el orden respecto del oficial.
    "Good Girl Very": "Very Good Girl",
    // La referencia es la edición de colección.
    "Good Girl Glorious Gold": "Good Girl Glorious Gold Collector Edition"
  },
  Chanel: {
    // La referencia lleva "Homme" en el nombre.
    "Allure Sport": "Allure Homme Sport"
  },
  Gucci: {
    "Guilty Black": "Gucci Guilty Black Pour Homme"
  },
  Kenzo: {
    // Lote 10. Cuatro referencias bajo ese nombre; NOX vende el EDT de 2022.
    "Kenzo Homme": "Kenzo Homme Eau de Toilette",
    "Flower": "Flower by Kenzo"
  },
  Lattafa: {
    // Misma línea Bade'e Al Oud que Honor y Gloria, Oud for Glory y Amethyst.
    Sublime: "Bade'e Al Oud Sublime"
  },
  "Paco Rabanne": {
    // Lote 10. El catálogo escribe 'Acqua' y la casa 'Aqua'. Añada 2024.
    "Invictus Acqua": "Invictus Aqua",
    // Lote 10. El catálogo invierte el orden en el masculino. Referencia: el
    // Black XS original de 2005, no el de 2018.
    "XS Black": "Black XS",
    // Lote 10. El catálogo llama 'Black XS' al femenino: la referencia es el Eau
    // de Parfum de 2018, no el original de 2007.
    "Black XS": "Black XS for Her Eau de Parfum",
    "Pure XS": "Pure XS For Her",
    // El catálogo NOX abrevia; la referencia es de la línea Black XS.
    "XS Aphrodisiaque": "Black XS L'Aphrodisiaque for Men"
  },
  "Ralph Lauren": {
    "Ralph Blue": "Ralph Lauren Blue"
  },
  Shakira: {
    "Shakira Rock": "Rock! by Shakira"
  },
  "Victoria's Secret": {
    // Lote 10. Tres referencias bajo ese nombre; NOX vende el EDP de 2014.
    "Very Sexy": "Very Sexy Eau de Parfum",
    // La referencia es plural.
    "Bombshell Night": "Bombshell Nights"
  }
};

/**
 * ALIAS ACOTADOS A UNA CASA **Y A UN GÉNERO**.
 *
 * Por qué existe: hay nombres de catálogo que la casa usa para dos fragancias
 * distintas, una masculina y otra femenina — "The One" de Dolce & Gabbana,
 * "L'Eau d'Issey" de Issey Miyake. El nombre público NOX es el mismo para las
 * dos, así que un alias por (casa, nombre) resolvería las dos al mismo lugar y
 * rompería la que hoy está bien. Por eso este tabla agrega el género a la
 * clave: la entrada masculina no puede tocar al producto femenino ni al revés.
 *
 * Es la única diferencia con BRAND_NAME_ALIASES, sobre la que tiene prioridad.
 * NO afloja el matcher: sigue haciendo falta que la variante declarada coincida
 * exactamente con lo que la entrada dice. Lo único que aporta es distinguir dos
 * productos del catálogo que se llaman igual y son fragancias diferentes.
 *
 * Como siempre: sólo entradas verificadas a mano, con la ficha de referencia
 * abierta y fechada. Ante la duda no se agrega y el producto queda en revisión.
 *
 * NUNCA cambia el nombre público: el catálogo sigue mostrando el naming NOX.
 */
export const BRAND_GENDER_NAME_ALIASES = {
  "Carolina Herrera": {
    femenino: {
      // Lote 10. El catálogo dice "212 Heroes" en los dos géneros. La ficha
      // femenina que vende NOX es 212 Heroes Forever Young (2022), Fragrantica
      // 72453; el masculino "212 Heroes" (2021) ya está cargado con su propia
      // referencia y esta entrada no lo alcanza.
      "212 Heroes": "212 Heroes Forever Young",
      // Lote 10. "212 New York" es branding de línea en los dos géneros. La
      // ficha femenina de la línea es 212 (1997), Fragrantica 296.
      "212 New York": "212"
    },
    masculino: {
      // Lote 10. Mismo caso en masculino: la ficha de la línea es 212 Men
      // (1999), Fragrantica 297.
      "212 New York": "212 Men",
      // Ficha verificada: 212 Sexy Men (2006), Fragrantica 1054.
      // El femenino "212 Sexy" ya está cargado con su propia referencia.
      "212 Sexy": "212 Sexy Men",
      // Ficha verificada: CH Men (2009), Fragrantica 6759.
      // El femenino "CH" ya está cargado con su propia referencia.
      CH: "CH Men"
    }
  },
  "Dolce & Gabbana": {
    masculino: {
      // Ficha verificada: The One for Men (2008), Fragrantica 2056.
      // El femenino "The One" (2006, ficha 698) ya está cargado y no se toca:
      // su nombre de catálogo coincide exacto con su referencia y no pasa por acá.
      "The One": "The One for Men",
      // Ficha verificada: Light Blue pour Homme (2007), Fragrantica 1068.
      // El femenino "Light Blue" ya está cargado con su propia referencia.
      "Light Blue": "Light Blue pour Homme"
    }
  },
  "Jean Paul Gaultier": {
    masculino: {
      // Ficha verificada: Scandal Pour Homme (2021), Fragrantica 68074.
      // El femenino "Scandal" ya está cargado con su propia referencia.
      Scandal: "Scandal Pour Homme"
    }
  },
  Versace: {
    // Único caso femenino de esta tabla. El catálogo NOX tiene un solo "Eros",
    // y es el femenino: su referencia es Eros Pour Femme (2014), ficha 28958.
    //
    // Por qué acá y no en BRAND_NAME_ALIASES: qa:match usa ("Eros", "Versace")
    // SIN género como fixture del comportamiento genérico del matcher ante
    // candidatos duplicados. Un alias por (casa, nombre) cambiaría ese caso y
    // rompería el test. Con la clave de género, la llamada de tres argumentos
    // del fixture no consulta esta tabla y sigue comportándose igual.
    femenino: {
      Eros: "Eros Pour Femme"
    }
  },
  "Issey Miyake": {
    masculino: {
      // Ficha verificada: L'Eau d'Issey Pour Homme (1994), Fragrantica 721.
      // El femenino "L'Eau d'Issey" conserva su propia referencia.
      "L'Eau d'Issey": "L'Eau d'Issey Pour Homme"
    }
  }
};

export const NAME_ALIASES = {
  "One Million": "1 Million",
  "One Million Elixir": "1 Million Elixir",
  "One Million Lucky": "1 Million Lucky",
  "Tobacco Vanilla": "Tobacco Vanille",
  "La Vida es Bella": "La Vie Est Belle",
  // Lote 10. NOX definió que su referencia es L'Eau de Parfum Intense (2015),
  // no Intensement (2020). Eran dos fragancias distintas bajo el mismo nombre.
  "La Vida es Bella Intense": "La Vie Est Belle L'Eau de Parfum Intense",
  // Lote 10. NOX vende el Eau de Toilette; la línea también tiene Parfum y EDP.
  "Chanel N°5": "Chanel No 5 Eau de Toilette",
  "Club de Nuit": "Club de Nuit Intense Man",
  // Verificados a mano: en la referencia la línea lleva el prefijo "Bade'e Al Oud".
  "Honor y Gloria": "Bade'e Al Oud Honor & Glory",
  "Oud for Glory": "Bade'e Al Oud Oud for Glory",
  // Armaf comercializa esta fragancia dentro de su línea Odyssey.
  "Mandarin Sky": "Odyssey Mandarin Sky",
  // Lote 10. Se conserva por compatibilidad, pero el alias de la casa Guerlain
  // tiene prioridad y apunta a la fragancia concreta (Mandarine Basilic).
  "Acqua Alegoría": "Aqua Allegoria Mandarine Basilic",
  Si: "Si",
  // Verificado en la ficha: la referencia se llama "La Nuit Trésor" (2015).
  // El orden de las palabras del catálogo NOX está invertido respecto del oficial.
  "Tresor Le Nuit": "La Nuit Tresor",
  "Bharara King": "King",
  "Spice Bomb": "Spicebomb",
  "Born in Roma": "Valentino Uomo Born in Roma",
  "Born in Roma Intense": "Valentino Uomo Born In Roma Intense",
  "Born in Roma Extradose": "Born in Roma Extradose Uomo",
  "Born in Roma Donna": "Valentino Donna Born In Roma",
  "Born in Roma Extradose Donna": "Born in Roma Extradose Donna",
  "Purple Melancholia": "Valentino Donna Born in Roma Purple Melancholia",
  "Stronger With You": "Emporio Armani Stronger With You",
  "Stronger With You Intensely": "Emporio Armani Stronger With You Intensely",
  "Angel's Share": "Angels' Share",
  // Verificado a mano: la referencia pertenece a la línea Bade'e Al Oud,
  // igual que Honor y Gloria y Oud for Glory.
  Amethyst: "Bade'e Al Oud Amethyst"
};

/* ========================================================================= */
/*  2. NORMALIZACIÓN Y MATCH DE VARIANTE                                     */
/* ========================================================================= */

export function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[''`´]/g, "")
    .replace(/&/g, " and ")
    .replace(/°/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    // Separa dígito y letra pegados para que "9PM", "9 PM" y "9pm" normalicen
    // igual. Sin esto, "9PM Night Out" no encontraba a "9 PM Night Out".
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ");
}

/** Quita el nombre de la casa cuando encabeza el nombre del perfume. */
function stripBrandPrefix(name, brand) {
  const n = normalize(name);
  const b = normalize(brand);
  if (!b) return n;
  if (n.startsWith(`${b} `)) return n.slice(b.length + 1);
  return n;
}

function tokens(value) {
  return normalize(value).split(" ").filter(Boolean);
}

/**
 * Resuelve el nombre del catálogo contra la lista real de fragancias de la casa.
 *
 * Devuelve { candidate, confidence, candidates }.
 *   exact       el nombre normalizado coincide tal cual → se puede autocompletar
 *   normalized  coincide al quitar el prefijo de marca → se puede autocompletar
 *   ambiguous   hay varios parecidos o sólo coincidencia parcial → needsReview
 *   not-found   no hay nada parecido → needsReview
 *
 * Es deliberadamente estricto: "Le Male", "Le Male Elixir", "Le Male Le Parfum"
 * y "Ultra Male" son productos distintos y jamás deben cruzarse.
 *
 * `gender` (opcional) es el género del producto NOX. Sólo sirve para elegir un
 * alias de BRAND_GENDER_NAME_ALIASES cuando la casa usa el mismo nombre para
 * una fragancia masculina y otra femenina. No relaja ninguna comparación: sin
 * este argumento el resultado es idéntico al de siempre.
 */
export function matchVariant(targetName, brand, candidates, gender) {
  // Prioridad de alias, de más específico a menos: (casa + género) gana a
  // (casa), que gana al global. `gender` es opcional: sin él, el comportamiento
  // es exactamente el de siempre y ninguna llamada existente cambia.
  const alias =
    (gender ? BRAND_GENDER_NAME_ALIASES[brand]?.[gender]?.[targetName] : undefined) ??
    BRAND_NAME_ALIASES[brand]?.[targetName] ??
    NAME_ALIASES[targetName] ??
    targetName;
  const target = normalize(alias);
  const targetNoBrand = stripBrandPrefix(alias, brand);

  const scored = candidates.map((c) => {
    const raw = typeof c === "string" ? c : c.name;
    return {
      ref: c,
      name: raw,
      norm: normalize(raw),
      normNoBrand: stripBrandPrefix(raw, brand)
    };
  });

  // 1. Coincidencia exacta.
  const exact = scored.filter((c) => c.norm === target);
  if (exact.length === 1) {
    return { candidate: exact[0].ref, confidence: "exact", candidates: [] };
  }
  if (exact.length > 1) {
    return {
      candidate: null,
      confidence: "ambiguous",
      candidates: exact.map((c) => c.name)
    };
  }

  // 2. Coincidencia al ignorar el prefijo de marca en cualquiera de los dos lados.
  const normalized = scored.filter(
    (c) => c.normNoBrand === targetNoBrand || c.norm === targetNoBrand || c.normNoBrand === target
  );
  if (normalized.length === 1) {
    return { candidate: normalized[0].ref, confidence: "normalized", candidates: [] };
  }
  if (normalized.length > 1) {
    return {
      candidate: null,
      confidence: "ambiguous",
      candidates: normalized.map((c) => c.name)
    };
  }

  // 3. Parciales: nunca se autocompletan. Sólo se listan para la revisión.
  const targetTokens = tokens(alias);
  const partial = scored
    .filter((c) => targetTokens.every((t) => c.norm.split(" ").includes(t)))
    .map((c) => c.name);

  if (partial.length > 0) {
    return { candidate: null, confidence: "ambiguous", candidates: partial.slice(0, 6) };
  }

  // 4. Nada cercano: se ofrecen los más parecidos por tokens compartidos.
  const near = scored
    .map((c) => ({
      name: c.name,
      shared: targetTokens.filter((t) => c.norm.split(" ").includes(t)).length
    }))
    .filter((c) => c.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 5)
    .map((c) => c.name);

  return { candidate: null, confidence: "not-found", candidates: near };
}

/* ========================================================================= */
/*  3. PARSEO DE HTML                                                        */
/* ========================================================================= */

/** Lista de fragancias de una casa: [{ name, url }]. */
export function parseDesignerIndex(html) {
  const out = new Map();
  const re = /href="(\/perfume\/([^/"]+)\/([^"]+?)-(\d+)\.html)"[^>]*>([\s\S]{0,200}?)<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    const [, path, , slug, id, inner] = m;
    // El texto del ancla es más fiel que el slug (conserva acentos y símbolos).
    const text = inner
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const fromSlug = decodeURIComponent(slug).replace(/-/g, " ").trim();
    const name = text.length >= 2 && text.length < 90 ? text : fromSlug;
    if (!out.has(id)) {
      out.set(id, { name, url: `https://www.fragrantica.com${path}` });
    }
  }
  return [...out.values()];
}

const NOTE_SPLIT = /\s*,\s*|\s+and\s+|\s*;\s*/i;

function cleanNotes(chunk) {
  return String(chunk)
    .split(NOTE_SPLIT)
    .map((n) => n.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim())
    .filter((n) => n.length > 1 && n.length < 48)
    .filter((n, i, a) => a.indexOf(n) === i);
}

/**
 * Notas y acordes de una ficha de referencia.
 * Devuelve null cuando no puede extraer nada: preferimos un hueco a un dato
 * mal parseado.
 */
export function parsePerfumePage(html) {
  const result = {
    name: null,
    brand: null,
    topNotes: [],
    middleNotes: [],
    baseNotes: [],
    accords: []
  };

  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    result.name = h1[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }
  const brand = html.match(/itemprop="brand"[\s\S]{0,200}?content="([^"]+)"/i);
  if (brand) result.brand = brand[1].trim();

  /* --- Estrategia A: la frase estructurada de la descripción --------------- */
  const flat = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  const top = flat.match(/[Tt]op notes? (?:are|is) ([^.;]+)[.;]/);
  const mid = flat.match(/[Mm]iddle notes? (?:are|is) ([^.;]+)[.;]/);
  const base = flat.match(/[Bb]ase notes? (?:are|is) ([^.;]+)[.;]/);
  if (top) result.topNotes = cleanNotes(top[1]);
  if (mid) result.middleNotes = cleanNotes(mid[1]);
  if (base) result.baseNotes = cleanNotes(base[1]);

  // Fragancias lineales: "Main notes are X, Y and Z"
  if (!top && !mid && !base) {
    const main = flat.match(/[Mm]ain (?:accords|notes) (?:are|is) ([^.;]+)[.;]/);
    if (main) result.middleNotes = cleanNotes(main[1]);
  }

  /* --- Estrategia B: el bloque de pirámide del DOM ------------------------- */
  if (result.topNotes.length + result.middleNotes.length + result.baseNotes.length === 0) {
    const pyramid = html.match(/id="pyramid"([\s\S]*?)(?:<\/section>|id="ratings")/i);
    if (pyramid) {
      const block = pyramid[1];
      const sections = block.split(/<h4[^>]*>/i).slice(1);
      for (const section of sections) {
        const label = normalize(section.slice(0, 80));
        const names = [...section.matchAll(/>([A-Z][A-Za-z'’\- ]{2,40})<\/div>/g)].map((x) => x[1].trim());
        if (!names.length) continue;
        if (label.startsWith("top")) result.topNotes = names;
        else if (label.startsWith("middle") || label.startsWith("heart")) result.middleNotes = names;
        else if (label.startsWith("base")) result.baseNotes = names;
      }
    }
  }

  /* --- Acordes principales ------------------------------------------------ */
  const accords = [...html.matchAll(/class="accord-bar"[^>]*>([\s\S]{0,60}?)<\/div>/g)].map((m) =>
    m[1].replace(/<[^>]*>/g, "").trim()
  );
  result.accords = accords.filter((a) => a && a.length < 40).slice(0, 10);

  const total =
    result.topNotes.length + result.middleNotes.length + result.baseNotes.length;
  return total > 0 ? result : null;
}

/* ========================================================================= */
/*  4. TRADUCCIÓN DE NOTAS Y ACORDES                                         */
/* ========================================================================= */

/**
 * Notas y acordes en español rioplatense.
 * Lo que no esté acá NO se traduce a ojo: queda en su idioma original y el
 * producto se marca needsReview para que alguien lo resuelva.
 */
export const NOTE_ES = {
  // cítricos
  bergamot: "Bergamota", "calabrian bergamot": "Bergamota de Calabria", lemon: "Limón",
  "sicilian lemon": "Limón de Sicilia", "amalfi lemon": "Limón de Amalfi", lime: "Lima",
  grapefruit: "Pomelo", mandarin: "Mandarina", "mandarin orange": "Mandarina",
  "green mandarin": "Mandarina verde", "blood mandarin": "Mandarina sanguina",
  orange: "Naranja", "bitter orange": "Naranja amarga", "blood orange": "Naranja sanguina",
  "sicilian orange": "Naranja de Sicilia", tangerine: "Mandarina", petitgrain: "Petitgrain",
  neroli: "Neroli", citruses: "Cítricos", yuzu: "Yuzu", bitter: "Amargo",
  // frutas
  apple: "Manzana", "green apple": "Manzana verde", pear: "Pera", peach: "Durazno",
  plum: "Ciruela", pineapple: "Ananá", "black currant": "Grosella negra",
  blackcurrant: "Grosella negra", raspberry: "Frambuesa", strawberry: "Frutilla",
  cherry: "Cereza", litchi: "Lichi", lychee: "Lichi", melon: "Melón",
  watermelon: "Sandía", coconut: "Coco", fig: "Higo", "fig leaf": "Hoja de higuera",
  rhubarb: "Ruibarbo", "dried fruits": "Frutos secos", fruits: "Frutas",
  "tropical fruits": "Frutas tropicales", banana: "Banana", mango: "Mango", dates: "Dátiles",
  // flores
  jasmine: "Jazmín", "jasmine sambac": "Jazmín sambac", "moroccan jasmine": "Jazmín de Marruecos",
  "indian jasmine": "Jazmín de India", rose: "Rosa", "bulgarian rose": "Rosa búlgara",
  "turkish rose": "Rosa de Turquía", "damask rose": "Rosa de Damasco", peony: "Peonía",
  tuberose: "Nardo", gardenia: "Gardenia", iris: "Iris", orris: "Lirio",
  violet: "Violeta", "violet leaf": "Hoja de violeta", freesia: "Fresia",
  "orange blossom": "Azahar", "tunisian orange blossom": "Azahar de Túnez",
  "african orange flower": "Flor de naranjo africana", ylang: "Ylang ylang",
  "ylang ylang": "Ylang ylang", lavender: "Lavanda", "wild lavender": "Lavanda silvestre",
  orchid: "Orquídea", heliotrope: "Heliotropo", "lily of the valley": "Muguet",
  // Aprobadas para el lote 10. Español rioplatense: "Damasco", no "Chabacano";
  // "frutilla", no "fresa". Se conserva el término técnico donde aporta
  // precisión (Toffee, Tagete).
  apricot: "Damasco",
  "whipped cream": "Crema batida",
  "vanilla orchid": "Orquídea de vainilla",
  "brazilian rosewood": "Palo de rosa de Brasil",
  toffee: "Toffee",
  "oriental notes": "Notas orientales",
  // normalize() borra el apóstrofo recto y deja "strawberry smores"; con el
  // apóstrofo tipográfico queda separado. Se cubren las dos escrituras.
  "strawberry smores": "S'mores de frutilla",
  "strawberry s mores": "S'mores de frutilla",
  marigold: "Tagete",
  lily: "Lirio", magnolia: "Magnolia", mimosa: "Mimosa", osmanthus: "Osmanto",
  "water jasmine": "Jazmín acuático", "ginger flower": "Flor de jengibre",
  "tobacco blossom": "Flor de tabaco",
  // especias
  pepper: "Pimienta", "black pepper": "Pimienta negra", "pink pepper": "Pimienta rosa",
  "white pepper": "Pimienta blanca", "sichuan pepper": "Pimienta de Sichuan",
  cinnamon: "Canela", cardamom: "Cardamomo", nutmeg: "Nuez moscada", ginger: "Jengibre",
  saffron: "Azafrán", clove: "Clavo de olor", anise: "Anís", "star anise": "Anís estrellado",
  fennel: "Hinojo", caraway: "Alcaravea", coriander: "Cilantro", cumin: "Comino",
  "spicy notes": "Notas especiadas", spices: "Especias", licorice: "Regaliz",
  liquorice: "Regaliz", absinthe: "Absenta", wormwood: "Artemisa", artemisia: "Artemisa",
  // maderas y resinas
  cedar: "Cedro", cedarwood: "Cedro", "virginia cedar": "Cedro de Virginia",
  "virginian cedar": "Cedro de Virginia", "atlas cedar": "Cedro del Atlas",
  sandalwood: "Sándalo", vetiver: "Vetiver", "haitian vetiver": "Vetiver de Haití",
  patchouli: "Pachulí", "indian patchouli": "Pachulí de India", oud: "Oud",
  "agarwood oud": "Oud", guaiac: "Guayaco", "guaiac wood": "Madera de guayaco",
  "woody notes": "Notas amaderadas", woods: "Maderas", birch: "Abedul", oak: "Roble",
  "oak moss": "Musgo de roble", oakmoss: "Musgo de roble", "dry wood": "Madera seca",
  driftwood: "Madera de deriva", cashmeran: "Cashmeran", "cashmere wood": "Madera de cachemira",
  "akigalawood": "Akigalawood", papyrus: "Papiro", "fir resin": "Resina de abeto",
  amberwood: "Amberwood", ambroxan: "Ambroxan", ambrofix: "Ambrofix", amber: "Ámbar",
  ambergris: "Ámbar gris", labdanum: "Labdanum", benzoin: "Benjuí", myrrh: "Mirra",
  incense: "Incienso", olibanum: "Olíbano", frankincense: "Olíbano", elemi: "Elemí",
  // dulces
  vanilla: "Vainilla", "madagascar vanilla": "Vainilla de Madagascar",
  "bourbon vanilla": "Vainilla bourbon", "black vanilla husk": "Vaina de vainilla negra",
  "tonka bean": "Haba tonka", tonka: "Haba tonka", caramel: "Caramelo", praline: "Praliné",
  honey: "Miel", beeswax: "Cera de abejas", sugar: "Azúcar", chocolate: "Chocolate",
  cacao: "Cacao", cocoa: "Cacao", coffee: "Café", almond: "Almendra",
  "bitter almond": "Almendra amarga", "candied almond": "Almendra confitada",
  chestnut: "Castaña", pistachio: "Pistacho", marshmallow: "Malvavisco",
  hazelnut: "Avellana", cognac: "Coñac", rum: "Ron", whiskey: "Whisky",
  // otros
  musk: "Almizcle", "white musk": "Almizcle blanco", leather: "Cuero", suede: "Gamuza",
  tobacco: "Tabaco", "tobacco leaf": "Hoja de tabaco", smoke: "Humo", salt: "Sal",
  "sea notes": "Notas marinas", "marine notes": "Notas marinas",
  "water notes": "Notas acuáticas", "watery notes": "Notas acuáticas",
  "mineral notes": "Notas minerales", "earthy notes": "Notas terrosas",
  mint: "Menta", peppermint: "Menta", sage: "Salvia", "clary sage": "Salvia sclarea",
  basil: "Albahaca", rosemary: "Romero", thyme: "Tomillo", "bay leaf": "Laurel",
  geranium: "Geranio", "juniper berries": "Bayas de enebro", tea: "Té",
  "green tea": "Té verde", "jasmine tea": "Té de jazmín", cucumber: "Pepino",
  aldehydes: "Aldehídos", hedione: "Hedione", "ambrette musk mallow": "Ambreta",
  ambrette: "Ambreta", "gourmand accord": "Acorde gourmand", petalia: "Petalia",
  mahonial: "Mahonial", "green notes": "Notas verdes", ozonic: "Ozónico",
  // ── Lote 20. Claves ya normalizadas (normalize() las deja así).
  // Español rioplatense: "frutilla", "damasco", "ananá".
  blackberry: "Mora",
  "candied fruits": "Frutas confitadas",
  "ceylon cinnamon": "Canela de Ceilán",
  "chinese black tea": "Té negro chino",
  chinotto: "Chinotto",
  citron: "Cidra",
  coumarin: "Cumarina",
  cupcake: "Cupcake",
  cypress: "Ciprés",
  "finger lime": "Lima caviar",
  frangipani: "Frangipani",
  "fruity notes": "Notas frutales",
  gin: "Gin",
  "green tangerine": "Mandarina verde",
  honeysuckle: "Madreselva",
  // Molécula: se deja el nombre técnico, traducirlo sería inventar.
  "iso e super": "Iso E Super",
  juniper: "Enebro",
  kiwi: "Kiwi",
  kulfi: "Kulfi",
  "madagascar pepper": "Pimienta de Madagascar",
  "mastic or lentisque": "Almáciga",
  "nigerian ginger": "Jengibre de Nigeria",
  "orris root": "Raíz de lirio",
  passionfruit: "Maracuyá",
  // "Pepperwood™" normaliza a "pepperwood": la marca registrada no tiene
  // traducción establecida en castellano.
  pepperwood: "Pepperwood",
  quince: "Membrillo",
  "red cedar": "Cedro rojo",
  "red litchi": "Lichi rojo",
  "strawberry fizz candy": "Caramelo de frutilla",
  "sugar cane": "Caña de azúcar",
  "texas cedar": "Cedro de Texas",
  "tunisian neroli": "Neroli de Túnez",
  vanille: "Vainilla",
  vodka: "Vodka",
  "white chocolate": "Chocolate blanco",
  "white flowers": "Flores blancas",
  "woodsy notes": "Notas amaderadas",
  // ── Lote 3. Claves ya normalizadas. Extensión append-only: no se tocó,
  // renombró ni reordenó ninguna entrada anterior.
  // Español rioplatense y terminología de perfumería.
  // Molécula propietaria sin traducción establecida: se conserva el nombre.
  aquozone: "Aquozone",
  "black cherry": "Cereza negra",
  carnation: "Clavel",
  chamomile: "Manzanilla",
  "champagne rose": "Champagne rosado",
  "cherry liqueur": "Licor de cereza",
  // "Clavo de olor" es el nombre corriente en es-AR; no confundir con Clavel.
  cloves: "Clavo de olor",
  "coconut water": "Agua de coco",
  // Arándano ROJO: el azul es otra fruta.
  cranberry: "Arándano rojo",
  // Nombre propio de postre, se usa en francés también en castellano.
  "creme brulee": "Crème brûlée",
  "egyptian jasmine": "Jazmín de Egipto",
  eucalyptus: "Eucalipto",
  // Grasse es la ciudad perfumera; se traduce como origen, igual que Turquía.
  "grasse rose": "Rosa de Grasse",
  "green accord": "Acorde verde",
  hawthorn: "Espino albar",
  "indian tuberose": "Nardo de India",
  "italian lemon": "Limón de Italia",
  "light amber": "Ámbar claro",
  // Musgo a secas; "Musgo de roble" ya existía para oakmoss.
  moss: "Musgo",
  // "Nutmeg Flower" es nombre común de Nigella sativa, no del macis: el macis
  // es el arilo de Myristica fragrans, otra materia botánica. Resuelto en la
  // revisión del lote 3.
  "nutmeg flower": "Nigella (ajenuz)",
  paprika: "Pimentón",
  "peach blossom": "Flor de durazno",
  "peru balsam": "Bálsamo de Perú",
  pine: "Pino",
  // Guinda es el término establecido para la cereza ácida.
  "sour cherry": "Guinda",
  "tolu balsam": "Bálsamo de Tolú",
  turmeric: "Cúrcuma",

  /* --- lote 4 ----------------------------------------------------------- */
  angelica: "Angélica",
  // Molécula propietaria: se conserva el nombre comercial, igual que Aquozone.
  calypsone: "Calypsone",
  "carrot seeds": "Semillas de zanahoria",
  "cotton candy": "Algodón de azúcar",
  // Artemisia pallens. No tiene nombre común en castellano: se conserva.
  davana: "Davana",
  "ice cream": "Helado",
  // Lokum turco. Se elige el término comprensible en castellano.
  loukhoum: "Delicia turca",
  meringue: "Merengue",
  milk: "Leche",
  // Variedad de ciruela: explícito para que no se lea como otra fruta.
  mirabelle: "Ciruela mirabel",
  // Myrtus communis. "Arrayán" también sería correcto; en perfumería se usa
  // Mirto.
  myrtle: "Mirto",
  // Pittosporum tobira.
  pitosporum: "Pitosporo",
  "red amber": "Ámbar rojo",
  "red berries": "Frutos rojos",
  // Capsicum, NO el grano de pimienta: la referencia oficial de la casa habla
  // de "pimiento rojo picante". Por eso no es "Pimienta roja".
  "red pepper": "Pimiento rojo",
  "sea salt": "Sal marina",
  "vanilla absolute": "Absoluto de vainilla",
  "white peach": "Durazno blanco",

  /* --- macro-lote ------------------------------------------------------- */
  agarwood: "Oud",
  "almond blossom": "Flor de almendro",
  ambertonic: "Ambertonic",
  "apple leaf": "Hoja de manzano",
  "apple tree": "Manzano",
  "apple tree blossom": "Flor de manzano",
  bamboo: "Bambú",
  "banana leaf": "Hoja de banano",
  bellflower: "Campanilla",
  "birch leaf": "Hoja de abedul",
  "black locust": "Acacia blanca",
  "black rose": "Rosa negra",
  "blue lotus": "Loto azul",
  blueberry: "Arándano",
  boronia: "Boronia",
  "bourbon geranium": "Geranio Bourbon",
  "brown sugar": "Azúcar moreno",
  "bubble gum": "Chicle",
  calone: "Calone",
  camelia: "Camelia",
  cannabis: "Cannabis",
  cappuccino: "Capuchino",
  cassia: "Casia",
  cassis: "Grosella negra",
  "cherry blossom": "Flor de cerezo",
  "cherry jam": "Mermelada de cereza",
  clementine: "Clementina",
  cyclamen: "Ciclamen",
  cypriol: "Cypriol",
  "cypriol oil or nagarmotha": "Cypriol (nagarmotha)",
  dahlia: "Dalia",
  datura: "Datura",
  "exotic woods": "Maderas exóticas",
  flax: "Lino",
  "floral notes": "Notas florales",
  flowers: "Flores",
  "forest fruits": "Frutos del bosque",
  "french labdanum": "Labdanum de Francia",
  "french narcissus": "Narciso de Francia",
  galbanum: "Gálbano",
  georgywood: "Georgywood",
  "granny smith apple": "Manzana Granny Smith",
  grass: "Hierba",
  "green coriander": "Cilantro verde",
  "guatemalan cardamom": "Cardamomo de Guatemala",
  "tuscan iris": "Iris de Toscana",
  /* Lote 11. Las dos notas que faltaban para cerrar Oud for Glory y Layton
     Exclusif. "civet" ya existía como acorde (Animálico); acá se agrega como
     nota, y "laotian oud" sigue la forma de las demás notas con procedencia. */
  civet: "Civeta",
  "laotian oud": "Oud de Laos",
  /* Lote 10. Notas que aparecieron al cargar las 26 decisiones. Traducciones
     mecánicas del término de la fuente, en la misma forma que las entradas que
     ya existían; ninguna es una interpretación. */
  "cactus flower": "Flor de cactus",
  "cactus": "Cactus",
  "white camelia": "Camelia blanca",
  "civetta": "Civeta",
  "sweet orange": "Naranja dulce",
  "jasmine leaf": "Hoja de jazmín",
  "palisander rosewood": "Palisandro",
  "ivy": "Hiedra",
  "currant buds": "Brotes de grosella",
  "tamarind": "Tamarindo",
  "black violet": "Violeta negra",
  "massoia wood": "Madera de massoia",
  "green pepper": "Pimienta verde",
  "truffle": "Trufa",
  "fir": "Abeto",
  "black cardamom": "Cardamomo negro",
  "black amber": "Ámbar negro",
  "seaweed": "Algas",
  "celery seeds": "Semillas de apio",
  "white woods": "Maderas blancas",
  "cotton flower": "Flor de algodón",
  "juniper berry": "Bayas de enebro",
  "mate": "Mate",
  "blackcurrant nectar": "Néctar de grosella negra",
  "rose de mai": "Rosa de Mayo",
  "oud wood": "Madera de oud",
  "patchouly": "Pachulí",
  "dry amber": "Ámbar seco",
  "pink peppercorn": "Pimienta rosa",
  "lavandin": "Lavandín",
  helvetolide: "Helvetolide",
  hyacinth: "Jacinto",
  "indian ginger": "Jengibre de India",
  "indonesian nutmeg": "Nuez moscada de Indonesia",
  "indonesian patchouli leaf": "Hoja de pachulí de Indonesia",
  "italian mandarin": "Mandarina de Italia",
  "italian orange": "Naranja de Italia",
  "japanese osmanthus": "Osmanto de Japón",
  "lemon blossom": "Flor de limonero",
  "lemon verbena": "Verbena de limón",
  lotus: "Loto",
  "madagascar vetiver": "Vetiver de Madagascar",
  mahogany: "Caoba",
  "mexican chocolate": "Chocolate mexicano",
  mignonette: "Reseda",
  narcissus: "Narciso",
  "nectarine blossom": "Flor de nectarina",
  "olive blossom": "Flor de olivo",
  "olive tree": "Olivo",
  opoponax: "Opopónaco",
  "ozonic notes": "Notas ozónicas",
  "palo santo": "Palo santo",
  papaya: "Papaya",
  "parma violet": "Violeta de Parma",
  "passion flower": "Flor de la pasión",
  pelargonium: "Pelargonio",
  pimento: "Pimienta de Jamaica",
  "pimento leaf": "Hoja de pimienta de Jamaica",
  "pine tree needles": "Agujas de pino",
  "pink peony": "Peonía rosa",
  pitahaya: "Pitahaya",
  pomarose: "Pomarose",
  pomegranate: "Granada",
  popcorn: "Pochoclo",
  "red currant": "Grosella roja",
  "red peony": "Peonía roja",
  "red poppy": "Amapola roja",
  resin: "Resina",
  resins: "Resinas",
  rice: "Arroz",
  "rose water": "Agua de rosas",
  rosyfolia: "Rosyfolia",
  "sea water": "Agua de mar",
  seagrass: "Hierba marina",
  "sicilian mandarin": "Mandarina de Sicilia",
  styrax: "Estoraque",
  sylkolide: "Sylkolide",
  "tahitian vetiver": "Vetiver de Tahití",
  "taif rose": "Rosa de Taif",
  tarragon: "Estragón",
  "thanaka wood": "Madera de thanaka",
  "tiare flower": "Flor de tiaré",
  "vanilla pod": "Vaina de vainilla",
  verbena: "Verbena",
  "violet root": "Raíz de violeta",
  "water lily": "Nenúfar",
  "water peony": "Peonía acuática",
  "white cedar": "Cedro blanco",
  "white currant": "Grosella blanca",
  "white honey": "Miel blanca",
  "white iris": "Iris blanco",
  "white lily": "Lirio blanco",
  "white rose": "Rosa blanca",
  "white tea": "Té blanco",
  "wild berries": "Bayas silvestres",
  "yellow freesia": "Fresia amarilla",
  "yellow mandarin": "Mandarina amarilla"
};

export const ACCORD_ES = {
  citrus: "Cítrico", fresh: "Fresco", "fresh spicy": "Especiado fresco",
  "warm spicy": "Especiado cálido", "soft spicy": "Especiado suave", spicy: "Especiado",
  woody: "Amaderado", aromatic: "Aromático", amber: "Ámbar", vanilla: "Vainilla",
  sweet: "Dulce", powdery: "Empolvado", musky: "Almizclado", floral: "Floral",
  "white floral": "Floral blanco", fruity: "Frutal", green: "Verde", herbal: "Herbal",
  aquatic: "Acuático", marine: "Marino", salty: "Salado", ozonic: "Ozónico",
  smoky: "Ahumado", leather: "Cuero", tobacco: "Tabaco", animalic: "Animálico",
  balsamic: "Balsámico", earthy: "Terroso", mineral: "Mineral", metallic: "Metálico",
  patchouli: "Pachulí", rose: "Rosa", iris: "Iris", violet: "Violeta",
  lavender: "Lavanda", cacao: "Cacao", coffee: "Café", caramel: "Caramelo",
  honey: "Miel", almond: "Almendra", coconut: "Coco", tropical: "Tropical",
  nutty: "Avellanado", cinnamon: "Canela", anis: "Anís", bitter: "Amargo",
  "soapy": "Jabonoso", "yellow floral": "Floral amarillo", tuberose: "Nardo",
  oud: "Oud", conifer: "Conífero", camphor: "Alcanforado",
  // Lactonic es un ACORDE (textura cremosa/láctea), no una nota del perfil.
  lactonic: "Lactónico",
  // ── Lote 20.
  chocolate: "Chocolate",
  rum: "Ron",
  vodka: "Vodka",
  whiskey: "Whisky",
  // ── Lote 3.
  aldehydic: "Aldehídico",
  cherry: "Cereza",
  mossy: "Musgoso",
  terpenic: "Terpénico",

  /* --- macro-lote --- */
  cannabis: "Cannabis",
  savory: "Sabroso",
  sour: "Ácido"
};

export function translateNote(note) {
  return NOTE_ES[normalize(note)] ?? null;
}

export function translateAccord(accord) {
  return ACCORD_ES[normalize(accord)] ?? null;
}

/* ========================================================================= */
/*  5. FAMILIA OLFATIVA A PARTIR DE LOS ACORDES                              */
/* ========================================================================= */

/**
 * Acorde de referencia → familia NOX. El orden de los acordes manda: el
 * primero que mapea define la familia principal.
 */
const ACCORD_TO_FAMILY = [
  [["citrus", "fresh", "green"], "citrico-fresco"],
  [["aquatic", "marine", "ozonic", "salty"], "acuatico"],
  [["aromatic", "lavender", "herbal", "soapy"], "aromatico-limpio"],
  [["woody", "patchouli", "earthy", "conifer"], "amaderado"],
  [["fresh spicy", "warm spicy", "soft spicy", "spicy", "cinnamon", "anis"], "especiado"],
  [["floral", "white floral", "rose", "iris", "violet", "tuberose", "yellow floral"], "floral"],
  [["sweet", "vanilla", "caramel", "honey", "cacao", "coffee", "almond", "nutty", "tropical", "fruity"], "gourmand-dulce"],
  [["amber", "balsamic", "oud", "animalic"], "ambarado-intenso"],
  [["leather", "tobacco", "smoky"], "cuero-ahumado"]
];

export function familiesFromAccords(accords) {
  const found = [];
  for (const accord of accords) {
    const key = normalize(accord);
    for (const [keys, family] of ACCORD_TO_FAMILY) {
      if (keys.includes(key) && !found.includes(family)) found.push(family);
    }
  }
  return found.slice(0, 3);
}

/* ========================================================================= */
/*  6. REDACCIÓN NOX                                                         */
/* ========================================================================= */

/**
 * REDACCIÓN NOX — anclada en las notas, no en plantillas por familia.
 *
 * Orden de evidencia, de más a menos libertad editorial:
 *   1. notas verificadas      → se nombran tal cual
 *   2. pirámide verificada    → habilita describir la evolución
 *   3. notas principales      → describen la composición, sin evolución
 *   4. acordes verificados    → contexto, se nombran tal cual
 *   5. familias derivadas     → sólo como adjetivo literal de la familia
 *
 * Lo que el generador NO hace, a propósito: traducir una familia en una
 * sensación que las notas no respaldan. Un acorde acuático no autoriza a decir
 * "marino" ni "liviano"; amaderado no autoriza "maderas secas"; aromático no
 * autoriza "barbería". Si la evidencia no lo dice, el texto no lo dice.
 *
 * Tampoco dice nada de duración, proyección ni estela: eso es performance y
 * vive en src/data/nox-performance.ts.
 */

/** Adjetivo literal de cada familia. No agrega sensación: nombra la familia. */
const FAMILY_ADJ = {
  "citrico-fresco": "cítrico",
  acuatico: "acuático",
  "aromatico-limpio": "aromático",
  amaderado: "amaderado",
  especiado: "especiado",
  floral: "floral",
  "gourmand-dulce": "dulce",
  "ambarado-intenso": "ambarado",
  "cuero-ahumado": "ahumado"
};

/** El mismo adjetivo en femenino, para "una composición …". */
const FAMILY_ADJ_F = {
  "citrico-fresco": "cítrica",
  acuatico: "acuática",
  "aromatico-limpio": "aromática",
  amaderado: "amaderada",
  especiado: "especiada",
  floral: "floral",
  "gourmand-dulce": "dulce",
  "ambarado-intenso": "ambarada",
  "cuero-ahumado": "ahumada"
};

/**
 * EVIDENCIA EXIGIDA PARA VERBALIZAR UN ADJETIVO DE FAMILIA.
 *
 * Una familia derivada sirve para clasificar, filtrar y hacer matching. NO
 * autoriza por sí sola a afirmar en público cada palabra que contiene su
 * nombre: "citrico-fresco" puede haberse derivado sólo del acorde Fresco, y
 * "gourmand-dulce" sólo del acorde Frutal. Verbalizar entonces "cítrico" o
 * "dulce" es afirmar algo que la fuente nunca dijo.
 *
 * Cada adjetivo declara acá qué acordes verificados cuentan como evidencia
 * propia. Un adjetivo sin evidencia no se escribe, aunque su familia esté
 * cargada. Las familias NO cambian: cambia sólo su traducción a lenguaje
 * público.
 *
 * Se aceptan subtipos del mismo acorde ("Especiado cálido" respalda
 * "especiado", "Floral blanco" respalda "floral") porque nombran la misma
 * cualidad con más precisión. No se aceptan saltos entre cualidades distintas:
 * Frutal no respalda "dulce" y Fresco no respalda "cítrico".
 */
export const ADJ_EVIDENCIA = {
  "cítrico": ["citrico"],
  "cítrica": ["citrico"],
  "acuático": ["acuatico", "marino"],
  "acuática": ["acuatico", "marino"],
  "aromático": ["aromatico"],
  "aromática": ["aromatico"],
  amaderado: ["amaderado"],
  amaderada: ["amaderado"],
  especiado: ["especiado", "especiado calido", "especiado fresco", "especiado suave"],
  especiada: ["especiado", "especiado calido", "especiado fresco", "especiado suave"],
  floral: ["floral", "floral blanco", "floral amarillo"],
  dulce: ["dulce"],
  ambarado: ["ambar"],
  ambarada: ["ambar"],
  ahumado: ["ahumado"],
  ahumada: ["ahumado"]
};

/**
 * ¿Los acordes verificados respaldan este adjetivo?
 *
 * Acepta acordes en inglés (como vienen de la ficha) o ya traducidos (como
 * están guardados en olfactory.ts): traduce lo que puede y normaliza siempre,
 * así "Ámbar", "ambar" y "Amber" cuentan igual.
 */
export function adjetivoRespaldado(adjetivo, accords) {
  const aceptados = ADJ_EVIDENCIA[adjetivo];
  // Un adjetivo que no está en la tabla no se puede auditar: no se verbaliza.
  if (!aceptados) return false;
  const presentes = new Set(
    accords.flatMap((a) => {
      const es = translateAccord(a);
      return [normalize(a), es ? normalize(es) : null].filter(Boolean);
    })
  );
  return aceptados.some((a) => presentes.has(a));
}

/** Minúscula inicial conservando los nombres propios ("Palo de rosa de Brasil"). */
const min = (nota) => (nota ? nota.charAt(0).toLowerCase() + nota.slice(1) : "");

/** Mayúscula inicial de una oración. */
const may = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : "");

/** Une en español: "a", "a y b", "a, b y c". */
function enumerar(items) {
  const l = items.filter(Boolean);
  if (l.length === 0) return "";
  if (l.length === 1) return l[0];
  return `${l.slice(0, -1).join(", ")} y ${l[l.length - 1]}`;
}

/** Hash estable del slug: elige plantilla sin azar, igual en cada corrida. */
function indiceEstable(semilla, total) {
  let h = 0;
  for (const c of String(semilla)) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return h % total;
}

/** Cierre por familias: "Un perfil dulce y ambarado." Nada más que la familia. */
function cierreFamilias(families) {
  const adj = families.map((f) => FAMILY_ADJ[f]).filter(Boolean).slice(0, 3);
  if (adj.length === 0) return "";
  return `El conjunto es ${enumerar(adj)}.`;
}

/**
 * PLANTILLAS CON PIRÁMIDE.
 *
 * En todas, las notas son complemento y nunca sujeto: así el texto es correcto
 * tanto con una nota como con cuatro, sin tener que conjugar por cantidad.
 * Todas conservan salida → corazón → fondo.
 */
const ESTRUCTURAS = [
  (t, m, b) => `Abre con ${t}. El corazón suma ${m} y el fondo se asienta en ${b}.`,
  (t, m, b) => `La apertura combina ${t}. Después llega el turno de ${m}, y el final queda en ${b}.`,
  (t, m, b) => `Empieza con ${t}. En el corazón hay ${m}, y el fondo reúne ${b}.`,
  (t, m, b) => `${may(t)} en la salida, ${m} en el corazón y ${b} en el fondo.`,
  (t, m, b) => `Arranca con ${t}, pasa por ${m} y termina sobre ${b}.`,
  (t, m, b) => `Primero ${t}. Después ${m}. Al final, ${b}.`,
  (t, m, b) => `La salida es de ${t}; el centro se arma con ${m}; el fondo descansa en ${b}.`,
  (t, m, b) => `Desde ${t} avanza hacia ${m} y cierra apoyado en ${b}.`,
  (t, m, b) => `Al principio ${t}. Más adelante entran ${m}, y el fondo termina en ${b}.`,
  (t, m, b) => `Sale con ${t}, se acomoda en ${m} y se queda en ${b}.`
];

/** Plantillas SIN pirámide: describen la composición, no narran una evolución. */
const ESTRUCTURAS_SIN_PIRAMIDE = [
  (p, r) => (r ? `${may(p)} marcan el perfil, acompañados por ${r}.` : `${may(p)} marcan el perfil.`),
  (p, r) => (r ? `El perfil se construye sobre ${p}, con ${r} alrededor.` : `El perfil se construye sobre ${p}.`),
  (p, r) => (r ? `${may(p)} llevan la composición; ${r} la completan.` : `${may(p)} llevan la composición.`),
  (p, r) => (r ? `La composición reúne ${p}, y también ${r}.` : `La composición reúne ${p}.`),
  // Nada de posición ni jerarquía: la fuente no separó etapas.
  (p, r) => (r ? `Entre sus notas principales aparecen ${p}; también ${r}.` : `Entre sus notas principales aparecen ${p}.`)
];

/**
 * CIERRES.
 *
 * Cada uno declara qué evidencia necesita. Nunca agregan textura, peso,
 * temperatura, elegancia, potencia ni ocasión: sólo reformulan la familia
 * derivada o nombran acordes verificados.
 */
const CIERRES = [
  { necesita: "familias", texto: (f) => `El conjunto es ${enumerar(f)}.` },
  { necesita: "familias", texto: (f) => `Queda en un registro ${enumerar(f)}.` },
  { necesita: "familias", texto: (f) => `El resultado es un perfil ${enumerar(f)}.` },
  { necesita: "familias-f", texto: (_f, _a, ff) => `Es una composición ${enumerar(ff)}.` },
  // `families` describe la identidad GLOBAL de la composición, no su drydown.
  // Por eso ningún cierre basado sólo en familias puede hablar de "final",
  // "fondo", "salida" ni "corazón": sería atribuirle a una etapa un dato que
  // no es de esa etapa.
  { necesita: "dos-familias", texto: (f) => `El perfil cruza lo ${f[0]} con lo ${f[1]}.` },
  { necesita: "dos-familias", texto: (f) => `La composición combina un registro ${f[0]} y ${f[1]}.` },
  { necesita: "acordes", texto: (_f, a) => `Se apoya en acordes de ${a[0]} y ${a[1]}.` },
  { necesita: "acordes", texto: (_f, a) => `Entre sus acordes principales figuran ${a[0]} y ${a[1]}.` }
  // Se eliminó el cierre "fondo-familia": mezclaba notas de fondo verificadas
  // con una familia global, sin ninguna relación demostrada entre las dos. Que
  // en un caso diera un resultado razonable no lo vuelve válido para 183.
];

/** Arma el cierre con la evidencia disponible, variando según el slug. */
function armarCierre(slug, families, accords) {
  // El filtro de evidencia va ANTES del recorte a 3: un adjetivo sin acorde que
  // lo respalde no ocupa lugar, no lo cede a otro que sí lo tenga.
  const adj = families
    .map((f) => FAMILY_ADJ[f])
    .filter((a) => Boolean(a) && adjetivoRespaldado(a, accords))
    .slice(0, 3);
  const adjF = families
    .map((f) => FAMILY_ADJ_F[f])
    .filter((a) => Boolean(a) && adjetivoRespaldado(a, accords))
    .slice(0, 3);
  const acordes = accords.slice(0, 2).map(min);
  const disponibles = CIERRES.filter((c) => {
    if (c.necesita === "familias") return adj.length > 0;
    if (c.necesita === "familias-f") return adjF.length > 0;
    if (c.necesita === "dos-familias") return adj.length >= 2;
    if (c.necesita === "acordes") return acordes.length >= 2;
    return false;
  });
  if (disponibles.length === 0) return "";

  // El desfasaje evita que la misma fragancia use siempre la plantilla i con el
  // cierre i: dos decisiones independientes, las dos estables.
  const elegido = disponibles[indiceEstable(`${slug}-cierre`, disponibles.length) ];
  return elegido.texto(adj, acordes, adjF);
}

/**
 * Arma el "cómo se siente".
 *
 * @param perfil { slug, topNotes, middleNotes, baseNotes, mainNotes, accords, families }
 */
export function buildFeel(perfil) {
  const {
    slug = "",
    topNotes = [],
    middleNotes = [],
    baseNotes = [],
    mainNotes = [],
    accords = [],
    families = []
  } = perfil ?? {};

  const cierre = armarCierre(slug, families, accords);
  const hayPiramide = topNotes.length > 0 || middleNotes.length > 0 || baseNotes.length > 0;

  /* --- Sin pirámide: se describe la composición, no se inventa evolución --- */
  if (!hayPiramide) {
    if (mainNotes.length === 0) return "";
    const principales = enumerar(mainNotes.slice(0, 4).map(min));
    const resto = enumerar(mainNotes.slice(4, 8).map(min));
    const armar = ESTRUCTURAS_SIN_PIRAMIDE[indiceEstable(slug, ESTRUCTURAS_SIN_PIRAMIDE.length)];
    return [armar(principales, resto), cierre].filter(Boolean).join(" ");
  }

  /* --- Con pirámide: se respeta la evolución real de la fuente ------------- */
  const t = enumerar(topNotes.slice(0, 3).map(min));
  const m = enumerar(middleNotes.slice(0, 3).map(min));
  const b = enumerar(baseNotes.slice(0, 3).map(min));

  // Si alguna etapa vino vacía, se nombran sólo las que existen: no se rellena.
  if (!t || !m || !b) {
    const tramos = [
      t && `${t} en la salida`,
      m && `${m} en el corazón`,
      b && `${b} en el fondo`
    ].filter(Boolean);
    return [`${may(enumerar(tramos))}.`, cierre].filter(Boolean).join(" ");
  }

  const armar = ESTRUCTURAS[indiceEstable(slug, ESTRUCTURAS.length)];
  return [armar(t, m, b), cierre].filter(Boolean).join(" ");
}

/* --------------------------------------------------------------- likeIf --- */

/**
 * Aperturas en voseo. Se eligen por slug, no al azar, así el texto es estable
 * entre corridas y no se repite la misma cabecera en todo el catálogo.
 */
const APERTURAS = {
  transicion: [
    (a, b) => `Te atrae el contraste entre ${a} y un corazón de ${b}`,
    (a, b) => `Te gustan las aperturas de ${a} que pasan a ${b}`,
    (a, b) => `Disfrutás perfiles que van de ${a} hacia ${b}`,
    (a, b) => `Te llama la atención el paso de ${a} a ${b}`
  ],
  fondo: [
    (a, b) => `Buscás una composición que termine en ${a} y ${b}`,
    (a, b) => `Te llaman la atención los fondos de ${a} y ${b}`,
    (a, b) => `Preferís que el final quede en ${a} y ${b}`,
    (a, b) => `Querés un cierre de ${a} y ${b}`
  ],
  acordes: [
    (a, b) => `Te gusta la combinación de ${a} y ${b}`,
    (a, b) => `Te atraen los acordes de ${a} y ${b}`,
    (a, b) => `Preferís perfiles donde aparecen ${a} y ${b}`,
    (a, b) => `Querés explorar lo ${a} junto a lo ${b}`
  ],
  centro: [
    (a, b) => `Te interesa un corazón de ${a} y ${b}`,
    (a, b) => `Te gusta la combinación de ${a} y ${b} en el centro`,
    (a, b) => `Buscás una composición con ${a} y ${b}`
  ],
  fondoUno: [
    (a) => `Preferís que el final quede en ${a}`,
    (a) => `Te llama la atención un cierre de ${a}`,
    (a) => `Buscás una composición que termine en ${a}`
  ],
  tambien: [
    (a, b) => `Te interesa que aparezcan ${a} y ${b}`,
    (a, b) => `Te gusta encontrar ${a} y ${b} en la misma composición`,
    (a, b) => `Te atrae la presencia de ${a} y ${b}`
  ],
  notas: [
    (a, b) => `Te interesan las composiciones con ${a} y ${b}`,
    (a, b) => `Te gusta el cruce de ${a} con ${b}`,
    (a, b) => `Buscás perfiles donde convivan ${a} y ${b}`
  ],
  familias: [
    (a, b) => `Querés explorar lo ${a} con carácter ${b}`,
    (a, b) => `Buscás algo ${a} donde lo ${b} tenga peso`,
    // "matiz" es masculino, así que concuerda con las formas de FAMILY_ADJ sin
    // necesidad de una segunda tabla en femenino. Antes decía "con lectura ${b}"
    // y, al ser "lectura" femenino, cualquier adjetivo con género rompía la
    // concordancia ("con lectura ambarado").
    (a, b) => `Preferís un perfil ${a} con un matiz ${b}`
  ],
  familia: [
    (a) => `Buscás un perfil ${a}`,
    (a) => `Preferís las composiciones ${a}`,
    (a) => `Te interesan los perfiles ${a}`
  ]
};

/** Elige una apertura de la categoría, estable por slug. */
const abrir = (categoria, slug, ...args) => {
  const opciones = APERTURAS[categoria];
  return opciones[indiceEstable(`${slug}-${categoria}`, opciones.length)](...args);
};

/**
 * Arma el "Te puede gustar si…".
 *
 * Se construye una lista de candidatos, cada uno anclado en un tipo de
 * evidencia distinto y con las claves que consume anotadas. Después se eligen
 * hasta tres SIN repetir evidencia: si una línea ya usó amaderado y especiado,
 * la siguiente tiene que apoyarse en otra cosa.
 *
 * Nada de intensidad, duración, sensualidad, elegancia, formalidad ni edad.
 */
function elegirLikeIf(perfil) {
  const {
    slug = "",
    topNotes = [],
    middleNotes = [],
    baseNotes = [],
    mainNotes = [],
    accords = [],
    families = []
  } = perfil ?? {};

  // MISMA COMPUERTA QUE EN EL CIERRE DEL FEEL.
  //
  // Una family interna no autoriza por sí sola un descriptor público, y eso
  // vale para todo el copy generado, no sólo para buildFeel. Un adjetivo sin
  // acorde que lo respalde no llega a ser candidato: la línea directamente no
  // se arma. FALLA CERRADO — nunca se sustituye por otro descriptor inventado
  // para rellenar; el selector simplemente pasa al candidato siguiente, y si
  // sólo quedan dos líneas independientes, se devuelven dos.
  const adj = families
    .map((f) => FAMILY_ADJ[f])
    .filter((a) => Boolean(a) && adjetivoRespaldado(a, accords));
  const candidatos = [];
  const agregar = (texto, claves) => texto && candidatos.push({ texto, claves: claves.map(normalize) });

  /* 1. La transición entre etapas: la relación más informativa que tenemos. */
  if (topNotes[0] && middleNotes[0]) {
    agregar(abrir("transicion", slug, min(topNotes[0]), min(middleNotes[0])), [topNotes[0], middleNotes[0]]);
  }

  /* 2. El corazón, cuando combina dos notas distintas. */
  if (middleNotes[0] && middleNotes[1]) {
    agregar(abrir("centro", slug, min(middleNotes[0]), min(middleNotes[1])), [middleNotes[0], middleNotes[1]]);
  }

  /* 3. El fondo: qué queda al final. */
  if (baseNotes[0] && baseNotes[1]) {
    agregar(abrir("fondo", slug, min(baseNotes[0]), min(baseNotes[1])), [baseNotes[0], baseNotes[1]]);
  }

  /* 3bis. Un fondo de una sola nota también sirve. */
  if (baseNotes[0] && !baseNotes[1]) {
    agregar(abrir("fondoUno", slug, min(baseNotes[0])), [baseNotes[0]]);
  }

  /* 4. Sin pirámide, las notas principales por pares. Nunca se dice "en el
        centro": la fuente no separa etapas y el texto no puede inventarlas. */
  if (topNotes.length === 0 && mainNotes.length >= 2) {
    agregar(abrir("notas", slug, min(mainNotes[0]), min(mainNotes[1])), [mainNotes[0], mainNotes[1]]);
    if (mainNotes[3] && mainNotes[4]) {
      agregar(abrir("tambien", slug, min(mainNotes[3]), min(mainNotes[4])), [mainNotes[3], mainNotes[4]]);
    }
    if (mainNotes[5] && mainNotes[6]) {
      agregar(abrir("notas", slug, min(mainNotes[5]), min(mainNotes[6])), [mainNotes[5], mainNotes[6]]);
    }
  }

  /* 5. Acordes verificados, nombrados tal cual. Se saltean los pares que sólo
        repiten lo que las familias ya dicen: sería la misma idea dos veces. */
  const yaEnFamilias = new Set(adj.map(normalize));
  const paresAcordes = [
    [accords[0], accords[1]],
    [accords[2], accords[3]],
    [accords[4], accords[5]]
  ].filter(([a, b]) => a && b && !(yaEnFamilias.has(normalize(a)) && yaEnFamilias.has(normalize(b))));

  paresAcordes.slice(0, 2).forEach(([a, b], i) => {
    const opciones = APERTURAS.acordes;
    // El segundo par usa otra apertura para que no queden dos líneas gemelas.
    const idx = (indiceEstable(`${slug}-acordes`, opciones.length) + i) % opciones.length;
    agregar(opciones[idx](min(a), min(b)), [a, b]);
  });

  /* 6. Familias: el último recurso, porque es el dato más derivado. */
  if (adj.length >= 2) agregar(abrir("familias", slug, adj[0], adj[1]), [adj[0], adj[1]]);
  else if (adj.length === 1) agregar(abrir("familia", slug, adj[0]), [adj[0]]);

  /* --- Selección sin repetir NINGUNA evidencia ----------------------------
   *
   * Una línea nueva no puede apoyarse en una evidencia que otra línea elegida
   * ya consumió: alcanza con que comparta UNA para descartarla. Antes el filtro
   * pedía que las compartiera TODAS, así que "lavanda → crema batida" y
   * "crema batida + coco" convivían repitiendo crema batida.
   *
   * Si de ahí salen sólo dos líneas independientes, se devuelven dos. No se
   * recicla una nota para llegar a tres.
   */
  const usadas = new Set();
  const elegidas = [];
  for (const c of candidatos) {
    if (elegidas.length === 3) break;
    if (c.claves.length > 0 && c.claves.some((k) => usadas.has(k))) continue;
    for (const k of c.claves) usadas.add(k);
    elegidas.push(c);
  }
  return elegidas;
}

/**
 * Igual que buildLikeIf pero devuelve también la evidencia que consume cada
 * línea. Lo usa el QA para comprobar sobre el RESULTADO —no sobre la lista de
 * candidatos— que la intersección entre líneas sea vacía.
 */
export function buildLikeIfDetalle(perfil) {
  return elegirLikeIf(perfil);
}

/** Sólo los textos: es lo que se guarda en el perfil. */
export function buildLikeIf(perfil) {
  return elegirLikeIf(perfil).map((c) => c.texto);
}

/* ========================================================================= */
/*  7. CARÁCTER AROMÁTICO                                                    */
/* ========================================================================= */

/**
 * CARÁCTER, NO PERFORMANCE.
 *
 * Deriva `aromaticIntensity` de los acordes verificados con un criterio único y
 * uniforme, igual que familiesFromAccords. Describe cómo se percibe la
 * composición —suave, equilibrada, intensa, envolvente, marcada—, no cuánto
 * dura, cuánto proyecta ni qué estela deja.
 *
 * La duración, la proyección y la estela del extracto NOX viven en
 * src/data/nox-performance.ts y sólo se cargan después de probarlo. Esta
 * función NUNCA las toca.
 *
 * Acepta acordes en inglés (como vienen de la ficha de referencia) o ya
 * traducidos al español (como están guardados en olfactory.ts).
 */
const ACCORD_WEIGHT = {
  // Acordes que dan cuerpo, peso y calidez.
  denso: [
    "amber", "ambar", "oud", "leather", "cuero", "tobacco", "tabaco",
    "smoky", "ahumado", "animalic", "animalico", "balsamic", "balsamico",
    "warm spicy", "especiado calido", "resin", "resina", "incienso",
    "patchouli", "pachuli", "honey", "miel", "cinnamon", "canela",
    "cacao", "coffee", "cafe", "earthy", "terroso"
  ],
  // Acordes golosos: empujan hacia lo envolvente, no hacia lo potente.
  dulce: [
    "sweet", "dulce", "vanilla", "vainilla", "caramel", "caramelo",
    "gourmand", "almond", "almendra", "nutty", "avellanado",
    "coconut", "coco", "tropical"
  ],
  // Acordes que aligeran y abren la composición. Deliberadamente acotado:
  // "aromático", "almizclado" y "empolvado" son texturas, no frescura, y
  // contarlos acá achataba el carácter de composiciones que no son livianas.
  ligero: [
    "citrus", "citrico", "fresh", "fresco", "fresh spicy", "especiado fresco",
    "aquatic", "acuatico", "marine", "marino", "ozonic", "ozonico",
    "green", "verde", "herbal", "salty", "salado", "mineral",
    "soapy", "jabonoso", "camphor", "alcanforado"
  ],
  // Acordes que por sí solos imponen carácter, aunque estén rodeados de frescura.
  firma: [
    "oud", "leather", "cuero", "tobacco", "tabaco", "animalic", "animalico",
    "smoky", "ahumado", "incienso", "tuberose", "nardo", "honey", "miel",
    "coffee", "cafe", "cacao"
  ]
};

export function aromaticIntensityFromAccords(accords) {
  if (!accords || accords.length === 0) return null;

  const claves = accords.map((a) => normalize(a));
  const contar = (grupo) =>
    claves.filter((c) => ACCORD_WEIGHT[grupo].some((k) => c === k || c.includes(k))).length;

  const densos = contar("denso");
  const dulces = contar("dulce");
  const ligeros = contar("ligero");
  const firmas = contar("firma");
  const peso = densos + firmas - ligeros;

  if (peso >= 3) return dulces >= 3 ? "envolvente" : "marcada";
  if (peso >= 1) return dulces >= 2 ? "envolvente" : "intensa";
  if (peso === 0) return dulces >= 3 ? "envolvente" : "equilibrada";
  if (peso === -1) return "equilibrada";
  return dulces >= 2 ? "equilibrada" : "suave";
}


/* ========================================================================= */
/*  8. MARCA DECLARADA vs. MARCA EN LA URL                                   */
/* ========================================================================= */

/**
 * ¿La casa que aparece en la URL de referencia corresponde a la marca declarada?
 *
 * No alcanza con comparar los strings: la referencia usa su propio slug de casa,
 * que legítimamente difiere del nombre del catálogo NOX —"Dior" por "Christian
 * Dior", "Lattafa-Perfumes" por "Lattafa", "Al-Haramain-Perfumes" por "Al
 * Haramain"—. Se acepta cuando los tokens del más corto están todos en el más
 * largo, y se consulta BRAND_SLUGS cuando la casa ya tiene un slug conocido.
 *
 * Lo que sigue rechazando: una URL de otra casa ("Armaf" declarando "Afnan").
 */
export function brandMatchesUrl(brand, marcaEnUrl) {
  if (!brand || !marcaEnUrl) return true;

  const enUrl = normalize(marcaEnUrl);
  const candidatos = [normalize(brand), normalize(BRAND_SLUGS[brand] ?? brand)];

  return candidatos.some((esperado) => {
    if (!esperado || enUrl === esperado) return true;
    const a = enUrl.split(" ").filter(Boolean);
    const b = esperado.split(" ").filter(Boolean);
    const [corto, largo] = a.length <= b.length ? [a, b] : [b, a];
    return corto.length > 0 && corto.every((t) => largo.includes(t));
  });
}
