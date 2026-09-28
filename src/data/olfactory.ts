/**
 * PERFILES OLFATIVOS — capa pública
 *
 * Describen la FRAGANCIA DE REFERENCIA que inspira cada interpretación NOX.
 * La ficha lo aclara una vez, de forma discreta.
 *
 * Esta capa NO contiene procedencia: la URL consultada, la fecha y el estado
 * del match viven en olfactory.sources.ts, que ningún componente importa.
 *
 * Qué se carga y qué no:
 *   · SÍ: notas de salida / corazón / fondo, notas principales, acordes,
 *     familias, ocasiones, clima y carácter aromático (aromaticIntensity).
 *     Todo eso dice CÓMO HUELE, y la referencia lo respalda.
 *   · NO: duración, horas, proyección, estela ni rendimiento. Eso es
 *     performance del extracto NOX, se mide, y vive en
 *     src/data/nox-performance.ts. Este archivo nunca la contiene.
 *   · La redacción (feel, likeIf) es propia de NOX, no copiada de terceros.
 *
 * Para cargar nuevas fragancias: npm run olfativo -- --limit 20
 */

import type { OlfactoryProfile } from "./types";

export const OLFACTORY_PROFILES: Record<string, OlfactoryProfile> = {
  "afnan-9pm": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "ambarado-intenso",
      "especiado"
    ],
    "accords": [
      "Vainilla",
      "Ámbar",
      "Especiado cálido",
      "Frutal",
      "Canela",
      "Dulce",
      "Lavanda"
    ],
    "topNotes": [
      "Manzana",
      "Canela",
      "Lavanda silvestre",
      "Bergamota"
    ],
    "middleNotes": [
      "Azahar",
      "Muguet"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Ámbar",
      "Pachulí"
    ],
    "mainNotes": [
      "Manzana",
      "Canela",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Manzana y canela sobre vainilla y haba tonka. Dulce, cálido y pensado para la noche.",
    "likeIf": [
      "Te gustan los dulces cálidos",
      "Buscás algo de noche",
      "Querés un dulce cálido a buen precio"
    ]
  },
  "afnan-9pm-night-out": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "gourmand-dulce",
      "especiado"
    ],
    "accords": [
      "Amaderado",
      "Frutal",
      "Especiado cálido",
      "Dulce",
      "Tropical",
      "Aromático",
      "Lavanda",
      "Floral",
      "Vainilla",
      "Especiado fresco"
    ],
    "topNotes": [
      "Pitahaya",
      "Coñac",
      "Lavanda",
      "Manzana",
      "Bergamota"
    ],
    "middleNotes": [
      "Toffee",
      "Gamuza",
      "Cardamomo",
      "Cedro",
      "Mahonial"
    ],
    "baseNotes": [
      "Haba tonka",
      "Akigalawood",
      "Ambrofix",
      "Pachulí"
    ],
    "mainNotes": [
      "Pitahaya",
      "Toffee",
      "Haba tonka",
      "Akigalawood"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "La apertura combina pitahaya, coñac y lavanda. Después llega el turno de toffee, gamuza y cardamomo, y el final queda en haba tonka, akigalawood y ambrofix. El conjunto es amaderado, dulce y especiado.",
    "likeIf": [
      "Te atrae el contraste entre pitahaya y un corazón de toffee",
      "Preferís que el final quede en haba tonka y akigalawood",
      "Querés explorar lo amaderado junto a lo frutal"
    ]
  },
  "al-haramain-amber-oud-dubai-night": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "especiado",
      "floral"
    ],
    "accords": [
      "Ámbar",
      "Especiado cálido",
      "Rosa",
      "Oud",
      "Aromático",
      "Cítrico",
      "Vainilla",
      "Almizclado",
      "Especiado fresco",
      "Empolvado"
    ],
    "topNotes": [
      "Azafrán",
      "Bergamota",
      "Elemí"
    ],
    "middleNotes": [
      "Oud",
      "Rosa búlgara",
      "Muguet"
    ],
    "baseNotes": [
      "Haba tonka",
      "Ámbar",
      "Almizcle blanco",
      "Musgo de roble"
    ],
    "mainNotes": [
      "Azafrán",
      "Oud",
      "Haba tonka",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Primero azafrán, bergamota y elemí. Después oud, rosa búlgara y muguet. Al final, haba tonka, ámbar y almizcle blanco. El resultado es un perfil ambarado y especiado.",
    "likeIf": [
      "Disfrutás perfiles que van de azafrán hacia oud",
      "Buscás una composición que termine en haba tonka y ámbar",
      "Querés explorar lo ambarado con carácter especiado"
    ]
  },
  "al-haramain-amber-oud-gold": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "acuatico",
      "citrico-fresco"
    ],
    "accords": [
      "Dulce",
      "Frutal",
      "Ozónico",
      "Vainilla",
      "Empolvado",
      "Almizclado",
      "Fresco",
      "Acuático",
      "Ámbar",
      "Cítrico"
    ],
    "topNotes": [
      "Bergamota",
      "Notas verdes"
    ],
    "middleNotes": [
      "Melón",
      "Ananá",
      "Ámbar",
      "Acorde gourmand"
    ],
    "baseNotes": [
      "Vainilla",
      "Almizcle",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Bergamota",
      "Melón",
      "Vainilla",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Desde bergamota y notas verdes avanza hacia melón, ananá y ámbar y cierra apoyado en vainilla, almizcle y notas amaderadas. El conjunto es dulce, acuático y cítrico.",
    "likeIf": [
      "Te atrae el contraste entre bergamota y un corazón de melón",
      "Preferís que el final quede en vainilla y almizcle",
      "Querés explorar lo dulce junto a lo frutal"
    ]
  },
  "amouage-guidance-46": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "gourmand-dulce",
      "especiado"
    ],
    "accords": [
      "Amaderado",
      "Frutal",
      "Avellanado",
      "Especiado cálido",
      "Floral",
      "Ámbar",
      "Dulce",
      "Rosa",
      "Almendra",
      "Empolvado"
    ],
    "topNotes": [
      "Agua de rosas",
      "Pera",
      "Avellana",
      "Almendra amarga",
      "Olíbano",
      "Pimienta rosa"
    ],
    "middleNotes": [
      "Rosa",
      "Osmanto",
      "Azafrán",
      "Jazmín sambac"
    ],
    "baseNotes": [
      "Sándalo",
      "Akigalawood",
      "Vainilla",
      "Ambreta",
      "Ámbar gris",
      "Labdanum",
      "Georgywood",
      "Cypriol"
    ],
    "mainNotes": [
      "Agua de rosas",
      "Rosa",
      "Sándalo",
      "Akigalawood"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Agua de rosas, pera y avellana en la salida, rosa, osmanto y azafrán en el corazón y sándalo, akigalawood y vainilla en el fondo. El perfil cruza lo amaderado con lo dulce.",
    "likeIf": [
      "Te atrae el contraste entre agua de rosas y un corazón de rosa",
      "Preferís que el final quede en sándalo y akigalawood",
      "Te gusta la combinación de frutal y avellanado"
    ]
  },
  "antonio-banderas-blue-seduction": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "gourmand-dulce",
      "acuatico"
    ],
    "accords": [
      "Aromático",
      "Frutal",
      "Marino",
      "Acuático",
      "Especiado fresco",
      "Verde",
      "Ozónico",
      "Fresco",
      "Cítrico",
      "Salado"
    ],
    "topNotes": [
      "Melón",
      "Bergamota",
      "Menta",
      "Grosella negra"
    ],
    "middleNotes": [
      "Agua de mar",
      "Manzana verde",
      "Capuchino",
      "Cardamomo",
      "Nuez moscada"
    ],
    "baseNotes": [
      "Notas amaderadas",
      "Ámbar"
    ],
    "mainNotes": [
      "Melón",
      "Agua de mar",
      "Notas amaderadas",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Primero melón, bergamota y menta. Después agua de mar, manzana verde y capuchino. Al final, notas amaderadas y ámbar. El resultado es un perfil aromático y acuático.",
    "likeIf": [
      "Disfrutás perfiles que van de melón hacia agua de mar",
      "Buscás una composición que termine en notas amaderadas y ámbar",
      "Te atraen los acordes de aromático y frutal"
    ]
  },
  "antonio-banderas-icon": {
    "family": "especiado",
    "families": [
      "especiado",
      "aromatico-limpio",
      "citrico-fresco"
    ],
    "accords": [
      "Especiado fresco",
      "Aromático",
      "Cítrico",
      "Lavanda",
      "Amaderado",
      "Especiado cálido",
      "Herbal",
      "Musgoso",
      "Terroso"
    ],
    "topNotes": [
      "Pomelo",
      "Pimienta negra"
    ],
    "middleNotes": [
      "Lavanda",
      "Salvia"
    ],
    "baseNotes": [
      "Sándalo",
      "Musgo de roble"
    ],
    "mainNotes": [
      "Pomelo",
      "Lavanda",
      "Sándalo",
      "Musgo de roble"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Desde pomelo y pimienta negra avanza hacia lavanda y salvia y cierra apoyado en sándalo y musgo de roble. El resultado es un perfil especiado, aromático y cítrico.",
    "likeIf": [
      "Disfrutás perfiles que van de pomelo hacia lavanda",
      "Buscás una composición que termine en sándalo y musgo de roble",
      "Te atraen los acordes de especiado fresco y aromático"
    ]
  },
  "antonio-banderas-king-of-seduction": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "citrico-fresco",
      "gourmand-dulce"
    ],
    "accords": [
      "Aromático",
      "Cítrico",
      "Frutal",
      "Marino",
      "Amaderado",
      "Fresco",
      "Acuático",
      "Almizclado",
      "Dulce",
      "Especiado fresco"
    ],
    "topNotes": [
      "Ananá",
      "Melón",
      "Bergamota",
      "Manzana verde",
      "Pomelo"
    ],
    "middleNotes": [
      "Notas marinas",
      "Jazmín",
      "Cardamomo",
      "Neroli"
    ],
    "baseNotes": [
      "Vetiver",
      "Almizcle blanco",
      "Cedro",
      "Gamuza",
      "Ámbar"
    ],
    "mainNotes": [
      "Ananá",
      "Notas marinas",
      "Vetiver",
      "Almizcle blanco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Arranca con ananá, melón y bergamota, pasa por notas marinas, jazmín y cardamomo y termina sobre vetiver, almizcle blanco y cedro. Entre sus acordes principales figuran aromático y cítrico.",
    "likeIf": [
      "Te llama la atención el paso de ananá a notas marinas",
      "Querés un cierre de vetiver y almizcle blanco",
      "Te gusta la combinación de frutal y marino"
    ]
  },
  "antonio-banderas-power-of-seduction": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Aromático",
      "Amaderado",
      "Especiado fresco",
      "Lavanda",
      "Cítrico",
      "Frutal",
      "Musgoso",
      "Herbal",
      "Terroso",
      "Ámbar"
    ],
    "topNotes": [
      "Manzana",
      "Bergamota"
    ],
    "middleNotes": [
      "Lavanda",
      "Artemisa",
      "Salvia sclarea"
    ],
    "baseNotes": [
      "Notas amaderadas",
      "Musgo",
      "Haba tonka",
      "Ámbar",
      "Pachulí"
    ],
    "mainNotes": [
      "Manzana",
      "Lavanda",
      "Notas amaderadas",
      "Musgo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La salida es de manzana y bergamota; el centro se arma con lavanda, artemisa y salvia sclarea; el fondo descansa en notas amaderadas, musgo y haba tonka. La composición combina un registro aromático y amaderado.",
    "likeIf": [
      "Te gustan las aperturas de manzana que pasan a lavanda",
      "Te llaman la atención los fondos de notas amaderadas y musgo",
      "Querés explorar lo cítrico junto a lo frutal"
    ]
  },
  "ariana-grande-cloud": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce"
    ],
    "accords": [
      "Dulce",
      "Lactónico",
      "Vainilla",
      "Coco",
      "Almizclado"
    ],
    "topNotes": [
      "Lavanda",
      "Pera",
      "Bergamota"
    ],
    "middleNotes": [
      "Crema batida",
      "Coco",
      "Praliné",
      "Orquídea de vainilla"
    ],
    "baseNotes": [
      "Almizcle",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Lavanda",
      "Crema batida",
      "Almizcle",
      "Notas amaderadas"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Abre con lavanda, pera y bergamota. El corazón suma crema batida, coco y praliné y el fondo se asienta en almizcle y notas amaderadas. Queda en un registro dulce.",
    "likeIf": [
      "Te gustan las aperturas de lavanda que pasan a crema batida",
      "Te llaman la atención los fondos de almizcle y notas amaderadas",
      "Preferís perfiles donde aparecen dulce y lactónico"
    ]
  },
  "ariana-grande-sweet-like-candy": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce"
    ],
    "accords": [
      "Dulce",
      "Frutal",
      "Vainilla",
      "Empolvado",
      "Lactónico"
    ],
    "topNotes": [
      "Mora",
      "Pera",
      "Bergamota"
    ],
    "middleNotes": [
      "Crema batida",
      "Malvavisco",
      "Grosella negra",
      "Jazmín",
      "Madreselva",
      "Frangipani"
    ],
    "baseNotes": [
      "Vainilla",
      "Madera de cachemira"
    ],
    "mainNotes": [
      "Mora",
      "Crema batida",
      "Vainilla",
      "Madera de cachemira"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Primero mora, pera y bergamota. Después crema batida, malvavisco y grosella negra. Al final, vainilla y madera de cachemira. El conjunto es dulce.",
    "likeIf": [
      "Te atrae el contraste entre mora y un corazón de crema batida",
      "Preferís que el final quede en vainilla y madera de cachemira",
      "Te llama la atención un corazón con malvavisco y grosella negra"
    ]
  },
  "armaf-club-de-nuit": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "cuero-ahumado",
      "amaderado"
    ],
    "accords": [
      "Cítrico",
      "Frutal",
      "Cuero",
      "Ahumado",
      "Amaderado",
      "Aromático",
      "Dulce"
    ],
    "topNotes": [
      "Limón",
      "Ananá",
      "Bergamota",
      "Grosella negra",
      "Manzana"
    ],
    "middleNotes": [
      "Abedul",
      "Jazmín",
      "Rosa"
    ],
    "baseNotes": [
      "Almizcle",
      "Ámbar gris",
      "Pachulí",
      "Vainilla"
    ],
    "mainNotes": [
      "Ananá",
      "Abedul",
      "Almizcle",
      "Ámbar gris"
    ],
    "occasions": [
      "versatil",
      "evento"
    ],
    "seasons": [
      "todo-el-ano"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Apertura frutal de ananá y limón que cae sobre un abedul ahumado. Es el árabe más pedido en este estilo.",
    "likeIf": [
      "Buscás el estilo frutal-ahumado",
      "Querés un frutal-ahumado de carácter marcado",
      "Te gusta lo versátil"
    ]
  },
  "armaf-mandarin-sky": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "gourmand-dulce",
      "ambarado-intenso"
    ],
    "accords": [
      "Cítrico",
      "Caramelo",
      "Dulce",
      "Ámbar",
      "Aromático",
      "Vainilla",
      "Amaderado"
    ],
    "topNotes": [
      "Mandarina",
      "Naranja",
      "Azafrán",
      "Salvia"
    ],
    "middleNotes": [
      "Caramelo",
      "Haba tonka",
      "Tagete"
    ],
    "baseNotes": [
      "Ambroxan",
      "Cedro",
      "Vetiver"
    ],
    "mainNotes": [
      "Mandarina",
      "Caramelo",
      "Ambroxan",
      "Cedro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Arranca con mandarina, naranja y azafrán, pasa por caramelo, haba tonka y tagete y termina sobre ambroxan, cedro y vetiver. Es una composición cítrica, dulce y ambarada.",
    "likeIf": [
      "Te llama la atención el paso de mandarina a caramelo",
      "Querés un cierre de ambroxan y cedro",
      "Te atraen los acordes de dulce y ámbar"
    ]
  },
  "armani-armani-code": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "floral",
      "gourmand-dulce"
    ],
    "accords": [
      "Cítrico",
      "Floral blanco",
      "Dulce",
      "Vainilla",
      "Miel",
      "Especiado fresco",
      "Fresco",
      "Empolvado",
      "Floral"
    ],
    "topNotes": [
      "Naranja de Italia",
      "Jazmín",
      "Naranja amarga"
    ],
    "middleNotes": [
      "Jazmín",
      "Azahar",
      "Jengibre"
    ],
    "baseNotes": [
      "Miel",
      "Vainilla",
      "Sándalo"
    ],
    "mainNotes": [
      "Naranja de Italia",
      "Jazmín",
      "Miel",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Primero naranja de Italia, jazmín y naranja amarga. Después jazmín, azahar y jengibre. Al final, miel, vainilla y sándalo. Se apoya en acordes de cítrico y floral blanco.",
    "likeIf": [
      "Disfrutás perfiles que van de naranja de Italia hacia jazmín",
      "Buscás una composición que termine en miel y vainilla",
      "Preferís perfiles donde aparecen floral blanco y dulce"
    ]
  },
  "armani-my-way": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Floral blanco",
      "Nardo",
      "Cítrico",
      "Vainilla"
    ],
    "topNotes": [
      "Azahar",
      "Bergamota"
    ],
    "middleNotes": [
      "Nardo",
      "Jazmín de India"
    ],
    "baseNotes": [
      "Vainilla de Madagascar",
      "Almizcle blanco",
      "Cedro de Virginia"
    ],
    "mainNotes": [
      "Azahar",
      "Nardo",
      "Jazmín",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [
      "calor"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Un floral blanco luminoso: azahar y nardo con un fondo de vainilla y almizcle que lo suaviza.",
    "likeIf": [
      "Te gustan los florales blancos",
      "Buscás algo luminoso",
      "Preferís lo femenino clásico"
    ]
  },
  "armani-my-way-intense": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "gourmand-dulce"
    ],
    "accords": [
      "Floral blanco",
      "Nardo",
      "Cítrico",
      "Vainilla",
      "Animálico",
      "Amaderado",
      "Empolvado",
      "Dulce"
    ],
    "topNotes": [
      "Azahar",
      "Naranja amarga"
    ],
    "middleNotes": [
      "Nardo de India",
      "Nardo"
    ],
    "baseNotes": [
      "Vainilla de Madagascar",
      "Sándalo"
    ],
    "mainNotes": [
      "Azahar",
      "Nardo de India",
      "Vainilla de Madagascar",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Empieza con azahar y naranja amarga. En el corazón hay nardo de India y nardo, y el fondo reúne vainilla de Madagascar y sándalo. Es una composición floral, cítrica y dulce.",
    "likeIf": [
      "Te llama la atención el paso de azahar a nardo de India",
      "Querés un cierre de vainilla de Madagascar y sándalo",
      "Te gusta la combinación de floral blanco y nardo"
    ]
  },
  "armani-si": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce"
    ],
    "accords": [
      "Floral",
      "Frutal",
      "Almizclado"
    ],
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "mainNotes": [
      "Néctar de grosella negra",
      "Rosa de Mayo",
      "Almizcle blanco",
      "Fresia"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Néctar de grosella negra, rosa de Mayo, almizcle blanco y fresia. Un floral frutal de pocas notas, con la grosella puesta adelante.",
    "likeIf": [
      "Te gusta la grosella negra en clave floral",
      "Buscás una rosa moderna y no clásica",
      "Preferís un almizcle blanco al final"
    ]
  },
  "azzaro-azzaro": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Aromático",
      "Amaderado",
      "Especiado fresco",
      "Terroso",
      "Lavanda",
      "Musgoso",
      "Cuero",
      "Cítrico",
      "Empolvado",
      "Especiado cálido"
    ],
    "topNotes": [
      "Lavanda",
      "Limón",
      "Alcaravea",
      "Albahaca",
      "Bergamota",
      "Salvia sclarea",
      "Iris",
      "Anís estrellado"
    ],
    "middleNotes": [
      "Vetiver",
      "Pachulí",
      "Cedro",
      "Sándalo",
      "Bayas de enebro",
      "Cardamomo"
    ],
    "baseNotes": [
      "Musgo de roble",
      "Cuero",
      "Ámbar",
      "Almizcle",
      "Haba tonka"
    ],
    "mainNotes": [
      "Lavanda",
      "Vetiver",
      "Musgo de roble",
      "Cuero"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "La apertura combina lavanda, limón y alcaravea. Después llega el turno de vetiver, pachulí y cedro, y el final queda en musgo de roble, cuero y ámbar. Se apoya en acordes de aromático y amaderado.",
    "likeIf": [
      "Disfrutás perfiles que van de lavanda hacia vetiver",
      "Buscás una composición que termine en musgo de roble y cuero",
      "Te atraen los acordes de especiado fresco y terroso"
    ]
  },
  "azzaro-the-most-wanted": {
    "family": "especiado",
    "families": [
      "especiado",
      "gourmand-dulce",
      "ambarado-intenso"
    ],
    "accords": [
      "Especiado cálido",
      "Dulce",
      "Ámbar",
      "Amaderado",
      "Caramelo",
      "Aromático"
    ],
    "topNotes": [
      "Cardamomo"
    ],
    "middleNotes": [
      "Toffee"
    ],
    "baseNotes": [
      "Amberwood"
    ],
    "mainNotes": [
      "Cardamomo",
      "Toffee",
      "Amberwood"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Cardamomo en la salida, toffee en el corazón y amberwood en el fondo. Se apoya en acordes de especiado cálido y dulce.",
    "likeIf": [
      "Disfrutás perfiles que van de cardamomo hacia toffee",
      "Preferís que el final quede en amberwood",
      "Te atraen los acordes de especiado cálido y dulce"
    ]
  },
  "azzaro-wanted": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "especiado",
      "citrico-fresco"
    ],
    "accords": [
      "Aromático",
      "Especiado fresco",
      "Fresco",
      "Cítrico",
      "Ámbar",
      "Amaderado",
      "Especiado cálido",
      "Frutal",
      "Verde",
      "Vainilla"
    ],
    "topNotes": [
      "Limón",
      "Jengibre",
      "Lavanda",
      "Menta"
    ],
    "middleNotes": [
      "Manzana",
      "Cardamomo de Guatemala",
      "Enebro",
      "Geranio"
    ],
    "baseNotes": [
      "Haba tonka",
      "Amberwood",
      "Vetiver de Haití"
    ],
    "mainNotes": [
      "Limón",
      "Manzana",
      "Haba tonka",
      "Amberwood"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "La apertura combina limón, jengibre y lavanda. Después llega el turno de manzana, cardamomo de Guatemala y enebro, y el final queda en haba tonka, amberwood y vetiver de Haití. El perfil cruza lo aromático con lo especiado.",
    "likeIf": [
      "Te atrae el contraste entre limón y un corazón de manzana",
      "Preferís que el final quede en haba tonka y amberwood",
      "Querés explorar lo aromático junto a lo especiado fresco"
    ]
  },
  "azzaro-wanted-by-night": {
    "family": "especiado",
    "families": [
      "especiado",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Especiado cálido",
      "Canela",
      "Frutal",
      "Amaderado",
      "Dulce",
      "Cítrico",
      "Ámbar",
      "Tabaco",
      "Vainilla"
    ],
    "topNotes": [
      "Canela",
      "Mandarina",
      "Lavanda",
      "Limón"
    ],
    "middleNotes": [
      "Notas frutales",
      "Incienso",
      "Comino",
      "Cedro rojo"
    ],
    "baseNotes": [
      "Tabaco",
      "Vainilla",
      "Cedro",
      "Cuero",
      "Benjuí",
      "Iso E Super",
      "Ciprés",
      "Pachulí"
    ],
    "mainNotes": [
      "Canela",
      "Notas frutales",
      "Tabaco",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Al principio canela, mandarina y lavanda. Más adelante entran notas frutales, incienso y comino, y el fondo termina en tabaco, vainilla y cedro. Es una composición especiada, dulce y amaderada.",
    "likeIf": [
      "Te llama la atención el paso de canela a notas frutales",
      "Querés un cierre de tabaco y vainilla",
      "Te atraen los acordes de frutal y amaderado"
    ]
  },
  "bharara-bharara-king": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "gourmand-dulce",
      "ambarado-intenso"
    ],
    "accords": [
      "Cítrico",
      "Frutal",
      "Dulce",
      "Vainilla",
      "Empolvado",
      "Almizclado",
      "Ámbar",
      "Especiado fresco"
    ],
    "topNotes": [
      "Naranja",
      "Bergamota",
      "Limón"
    ],
    "middleNotes": [
      "Notas frutales"
    ],
    "baseNotes": [
      "Vainilla",
      "Almizcle blanco",
      "Ámbar"
    ],
    "mainNotes": [
      "Naranja",
      "Notas frutales",
      "Vainilla",
      "Almizcle blanco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Desde naranja, bergamota y limón avanza hacia notas frutales y cierra apoyado en vainilla, almizcle blanco y ámbar. El perfil cruza lo cítrico con lo dulce.",
    "likeIf": [
      "Te atrae el contraste entre naranja y un corazón de notas frutales",
      "Preferís que el final quede en vainilla y almizcle blanco",
      "Te atraen los acordes de empolvado y almizclado"
    ]
  },
  "britney-spears-fantasy": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "citrico-fresco"
    ],
    "accords": [
      "Dulce",
      "Frutal",
      "Tropical",
      "Fresco",
      "Chocolate"
    ],
    "topNotes": [
      "Kiwi",
      "Lichi rojo",
      "Membrillo"
    ],
    "middleNotes": [
      "Chocolate blanco",
      "Cupcake",
      "Orquídea",
      "Jazmín"
    ],
    "baseNotes": [
      "Almizcle",
      "Raíz de lirio",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Kiwi",
      "Chocolate blanco",
      "Almizcle",
      "Raíz de lirio"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Desde kiwi, lichi rojo y membrillo avanza hacia chocolate blanco, cupcake y orquídea y cierra apoyado en almizcle, raíz de lirio y notas amaderadas. El resultado es un perfil dulce.",
    "likeIf": [
      "Disfrutás perfiles que van de kiwi hacia chocolate blanco",
      "Buscás una composición que termine en almizcle y raíz de lirio",
      "Te atraen los acordes de dulce y frutal"
    ]
  },
  "bulgari-man-in-black": {
    "family": "especiado",
    "families": [
      "especiado",
      "amaderado",
      "cuero-ahumado"
    ],
    "accords": [
      "Especiado cálido",
      "Amaderado",
      "Cuero",
      "Ron",
      "Ámbar",
      "Tabaco",
      "Dulce",
      "Vainilla",
      "Animálico",
      "Iris"
    ],
    "topNotes": [
      "Especias",
      "Ron",
      "Tabaco"
    ],
    "middleNotes": [
      "Cuero",
      "Iris",
      "Nardo"
    ],
    "baseNotes": [
      "Haba tonka",
      "Madera de guayaco",
      "Benjuí"
    ],
    "mainNotes": [
      "Especias",
      "Cuero",
      "Haba tonka",
      "Madera de guayaco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Desde especias, ron y tabaco avanza hacia cuero, iris y nardo y cierra apoyado en haba tonka, madera de guayaco y benjuí. Se apoya en acordes de especiado cálido y amaderado.",
    "likeIf": [
      "Disfrutás perfiles que van de especias hacia cuero",
      "Buscás una composición que termine en haba tonka y madera de guayaco",
      "Te atraen los acordes de especiado cálido y amaderado"
    ]
  },
  "cacharel-amor-amor": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "gourmand-dulce",
      "especiado"
    ],
    "accords": [
      "Cítrico",
      "Frutal",
      "Vainilla",
      "Especiado suave",
      "Aromático",
      "Dulce",
      "Floral blanco",
      "Empolvado",
      "Rosa",
      "Amaderado"
    ],
    "topNotes": [
      "Grosella negra",
      "Naranja",
      "Mandarina",
      "Pomelo",
      "Casia",
      "Bergamota"
    ],
    "middleNotes": [
      "Rosa",
      "Damasco",
      "Jazmín",
      "Lirio",
      "Muguet"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Almizcle",
      "Ámbar",
      "Cedro de Virginia"
    ],
    "mainNotes": [
      "Grosella negra",
      "Rosa",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La apertura combina grosella negra, naranja y mandarina. Después llega el turno de rosa, damasco y jazmín, y el final queda en vainilla, haba tonka y almizcle. El conjunto es cítrico, dulce y especiado.",
    "likeIf": [
      "Te atrae el contraste entre grosella negra y un corazón de rosa",
      "Te gusta la combinación de vainilla y especiado suave",
      "Te gusta la combinación de especiado suave y aromático"
    ]
  },
  "cacharel-anais-anais": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "amaderado"
    ],
    "accords": [
      "Floral blanco",
      "Floral",
      "Verde",
      "Amaderado",
      "Terroso",
      "Especiado fresco",
      "Aromático",
      "Animálico"
    ],
    "topNotes": [
      "Lirio blanco",
      "Jacinto",
      "Madreselva",
      "Gálbano",
      "Azahar",
      "Lavanda",
      "Bergamota",
      "Limón",
      "Grosella negra"
    ],
    "middleNotes": [
      "Lirio",
      "Muguet",
      "Jazmín de Marruecos",
      "Clavel",
      "Nardo",
      "Ylang ylang",
      "Iris",
      "Rosa",
      "Raíz de lirio"
    ],
    "baseNotes": [
      "Musgo de roble",
      "Incienso",
      "Almizcle",
      "Cuero",
      "Sándalo",
      "Vetiver",
      "Cedro",
      "Pachulí",
      "Ámbar"
    ],
    "mainNotes": [
      "Lirio blanco",
      "Lirio",
      "Musgo de roble",
      "Incienso"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Desde lirio blanco, jacinto y madreselva avanza hacia lirio, muguet y jazmín de Marruecos y cierra apoyado en musgo de roble, incienso y almizcle. Se apoya en acordes de floral blanco y floral.",
    "likeIf": [
      "Disfrutás perfiles que van de lirio blanco hacia lirio",
      "Buscás una composición que termine en musgo de roble y incienso",
      "Te atraen los acordes de floral blanco y floral"
    ]
  },
  "calvin-klein-ck-one": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "amaderado",
      "floral"
    ],
    "accords": [
      "Cítrico",
      "Verde",
      "Empolvado",
      "Amaderado",
      "Floral blanco",
      "Fresco",
      "Aromático",
      "Especiado fresco",
      "Floral",
      "Almizclado"
    ],
    "topNotes": [
      "Limón",
      "Notas verdes",
      "Bergamota",
      "Mandarina",
      "Ananá",
      "Cardamomo",
      "Papaya"
    ],
    "middleNotes": [
      "Muguet",
      "Jazmín",
      "Violeta",
      "Rosa",
      "Nuez moscada",
      "Fresia",
      "Raíz de lirio"
    ],
    "baseNotes": [
      "Acorde verde",
      "Almizcle",
      "Cedro",
      "Té verde",
      "Sándalo",
      "Musgo de roble",
      "Ámbar"
    ],
    "mainNotes": [
      "Limón",
      "Muguet",
      "Acorde verde",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "La apertura combina limón, notas verdes y bergamota. Después llega el turno de muguet, jazmín y violeta, y el final queda en acorde verde, almizcle y cedro. Se apoya en acordes de cítrico y verde.",
    "likeIf": [
      "Disfrutás perfiles que van de limón hacia muguet",
      "Buscás una composición que termine en acorde verde y almizcle",
      "Te atraen los acordes de cítrico y verde"
    ]
  },
  "calvin-klein-eternity": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "aromatico-limpio"
    ],
    "accords": [
      "Floral",
      "Floral blanco",
      "Verde",
      "Aromático",
      "Especiado cálido",
      "Empolvado",
      "Fresco",
      "Herbal",
      "Cítrico",
      "Especiado suave"
    ],
    "topNotes": [
      "Notas verdes",
      "Fresia",
      "Salvia",
      "Cítricos",
      "Mandarina"
    ],
    "middleNotes": [
      "Clavel",
      "Lirio",
      "Muguet",
      "Narciso",
      "Tagete",
      "Violeta",
      "Rosa",
      "Jazmín"
    ],
    "baseNotes": [
      "Almizcle",
      "Heliotropo",
      "Sándalo",
      "Ámbar",
      "Pachulí"
    ],
    "mainNotes": [
      "Notas verdes",
      "Clavel",
      "Almizcle",
      "Heliotropo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Empieza con notas verdes, fresia y salvia. En el corazón hay clavel, lirio y muguet, y el fondo reúne almizcle, heliotropo y sándalo. Es una composición floral, cítrica y aromática.",
    "likeIf": [
      "Te llama la atención el paso de notas verdes a clavel",
      "Querés un cierre de almizcle y heliotropo",
      "Te gusta la combinación de floral y floral blanco"
    ]
  },
  "calvin-klein-one-shock": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "especiado"
    ],
    "accords": [
      "Dulce",
      "Frutal",
      "Vainilla",
      "Floral",
      "Chocolate",
      "Especiado cálido",
      "Empolvado",
      "Cacao",
      "Almizclado"
    ],
    "topNotes": [
      "Flor de la pasión",
      "Amapola roja",
      "Peonía"
    ],
    "middleNotes": [
      "Mora",
      "Chocolate mexicano",
      "Narciso",
      "Jazmín"
    ],
    "baseNotes": [
      "Vainilla",
      "Almizcle",
      "Ámbar",
      "Pachulí"
    ],
    "mainNotes": [
      "Flor de la pasión",
      "Mora",
      "Vainilla",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La apertura combina flor de la pasión, amapola roja y peonía. Después llega el turno de mora, chocolate mexicano y narciso, y el final queda en vainilla, almizcle y ámbar. El perfil cruza lo dulce con lo floral.",
    "likeIf": [
      "Te atrae el contraste entre flor de la pasión y un corazón de mora",
      "Te gusta la combinación de vainilla y floral",
      "Te gusta la combinación de floral y chocolate"
    ]
  },
  "calvin-klein-shock": {
    "family": "cuero-ahumado",
    "families": [
      "cuero-ahumado",
      "especiado",
      "ambarado-intenso"
    ],
    "accords": [
      "Tabaco",
      "Especiado cálido",
      "Ámbar",
      "Dulce",
      "Especiado fresco",
      "Aromático",
      "Amaderado",
      "Lavanda",
      "Pachulí",
      "Cítrico"
    ],
    "topNotes": [
      "Lavanda",
      "Clementina",
      "Pepino"
    ],
    "middleNotes": [
      "Cardamomo",
      "Pimienta",
      "Albahaca",
      "Osmanto"
    ],
    "baseNotes": [
      "Tabaco",
      "Ámbar",
      "Pachulí",
      "Notas amaderadas",
      "Almizcle"
    ],
    "mainNotes": [
      "Lavanda",
      "Cardamomo",
      "Tabaco",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Arranca con lavanda, clementina y pepino, pasa por cardamomo, pimienta y albahaca y termina sobre tabaco, ámbar y pachulí. La composición combina un registro especiado y ambarado.",
    "likeIf": [
      "Te gustan las aperturas de lavanda que pasan a cardamomo",
      "Te llaman la atención los fondos de tabaco y ámbar",
      "Querés explorar lo especiado con carácter ambarado"
    ]
  },
  "carolina-herrera-212-heroes-femenino": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Frutal",
      "Floral blanco",
      "Dulce",
      "Cítrico",
      "Amaderado"
    ],
    "topNotes": [
      "Frambuesa",
      "Mandarina"
    ],
    "middleNotes": [
      "Azahar",
      "Jazmín"
    ],
    "baseNotes": [
      "Cedro",
      "Sándalo"
    ],
    "mainNotes": [
      "Frambuesa",
      "Azahar",
      "Cedro",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Frambuesa y mandarina para abrir, azahar y jazmín en el centro, cedro y sándalo abajo. Un floral blanco con la fruta puesta adelante.",
    "likeIf": [
      "Te gusta la frambuesa como apertura",
      "Buscás un floral blanco que no pese",
      "Preferís que el cierre sea de maderas suaves"
    ]
  },
  "carolina-herrera-212-heroes-masculino": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "especiado",
      "gourmand-dulce"
    ],
    "accords": [
      "Aromático",
      "Especiado fresco",
      "Frutal",
      "Herbal",
      "Cannabis",
      "Fresco",
      "Dulce",
      "Almizclado",
      "Acuático",
      "Verde"
    ],
    "topNotes": [
      "Pera",
      "Cannabis",
      "Jengibre"
    ],
    "middleNotes": [
      "Geranio",
      "Salvia"
    ],
    "baseNotes": [
      "Almizcle",
      "Cuero"
    ],
    "mainNotes": [
      "Pera",
      "Geranio",
      "Almizcle",
      "Cuero"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Empieza con pera, cannabis y jengibre. En el corazón hay geranio y salvia, y el fondo reúne almizcle y cuero. Entre sus acordes principales figuran aromático y especiado fresco.",
    "likeIf": [
      "Te llama la atención el paso de pera a geranio",
      "Querés un cierre de almizcle y cuero",
      "Te gusta la combinación de especiado fresco y frutal"
    ]
  },
  "carolina-herrera-212-new-york-femenino": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Floral blanco",
      "Floral",
      "Cítrico",
      "Empolvado",
      "Almizclado",
      "Verde"
    ],
    "topNotes": [
      "Azahar",
      "Flor de cactus",
      "Bergamota",
      "Mandarina"
    ],
    "middleNotes": [
      "Lirio",
      "Fresia",
      "Gardenia",
      "Jazmín",
      "Camelia blanca",
      "Muguet",
      "Rosa",
      "Peonía"
    ],
    "baseNotes": [
      "Almizcle",
      "Sándalo"
    ],
    "mainNotes": [
      "Azahar",
      "Lirio",
      "Almizcle",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Azahar y flor de cactus arriba, un corazón floral muy poblado —lirio, fresia, gardenia, jazmín— y un fondo de almizcle y sándalo. Un floral blanco limpio, casi jabonoso.",
    "likeIf": [
      "Te gustan los florales blancos limpios",
      "Buscás algo que se lea recién bañado",
      "Preferís un almizcle suave al final"
    ]
  },
  "carolina-herrera-212-new-york-masculino": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "especiado",
      "aromatico-limpio"
    ],
    "accords": [
      "Cítrico",
      "Verde",
      "Especiado fresco",
      "Aromático",
      "Amaderado",
      "Empolvado",
      "Especiado cálido",
      "Almizclado",
      "Lavanda",
      "Herbal"
    ],
    "topNotes": [
      "Notas verdes",
      "Pomelo",
      "Especias",
      "Bergamota",
      "Lavanda",
      "Petitgrain"
    ],
    "middleNotes": [
      "Jengibre",
      "Violeta",
      "Gardenia",
      "Salvia",
      "Pimienta verde"
    ],
    "baseNotes": [
      "Almizcle",
      "Sándalo",
      "Incienso",
      "Vetiver",
      "Madera de guayaco",
      "Labdanum"
    ],
    "mainNotes": [
      "Notas verdes",
      "Jengibre",
      "Almizcle",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Notas verdes, pomelo y bergamota para abrir; jengibre y violeta en el centro; almizcle, incienso y vetiver abajo. Cítrico y verde arriba, amaderado y con incienso abajo.",
    "likeIf": [
      "Te gusta el incienso en un fondo amaderado",
      "Buscás un cítrico verde de los noventa",
      "Te atrae la violeta en clave masculina"
    ]
  },
  "carolina-herrera-212-sexy-femenino": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "floral"
    ],
    "accords": [
      "Dulce",
      "Empolvado",
      "Almizclado",
      "Caramelo",
      "Especiado suave",
      "Vainilla",
      "Floral",
      "Cítrico",
      "Floral blanco",
      "Amaderado"
    ],
    "topNotes": [
      "Pimienta rosa",
      "Mandarina",
      "Bergamota"
    ],
    "middleNotes": [
      "Algodón de azúcar",
      "Gardenia",
      "Flores",
      "Pelargonio",
      "Rosa"
    ],
    "baseNotes": [
      "Vainilla",
      "Almizcle",
      "Sándalo",
      "Caramelo",
      "Violeta",
      "Pachulí"
    ],
    "mainNotes": [
      "Pimienta rosa",
      "Algodón de azúcar",
      "Vainilla",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La apertura combina pimienta rosa, mandarina y bergamota. Después llega el turno de algodón de azúcar, gardenia y flores, y el final queda en vainilla, almizcle y sándalo. El conjunto es dulce, especiado y floral.",
    "likeIf": [
      "Te atrae el contraste entre pimienta rosa y un corazón de algodón de azúcar",
      "Te gusta la combinación de almizclado y caramelo",
      "Querés explorar lo dulce junto a lo empolvado"
    ]
  },
  "carolina-herrera-212-sexy-masculino": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Vainilla",
      "Amaderado",
      "Empolvado",
      "Especiado cálido",
      "Especiado fresco",
      "Cítrico",
      "Floral",
      "Aromático",
      "Almizclado",
      "Ámbar"
    ],
    "topNotes": [
      "Mandarina",
      "Bergamota",
      "Notas verdes"
    ],
    "middleNotes": [
      "Pimienta",
      "Cardamomo",
      "Flores"
    ],
    "baseNotes": [
      "Vainilla",
      "Madera de guayaco",
      "Sándalo",
      "Ámbar",
      "Almizcle"
    ],
    "mainNotes": [
      "Mandarina",
      "Pimienta",
      "Vainilla",
      "Madera de guayaco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Mandarina y bergamota para abrir, pimienta y cardamomo en el centro, y un fondo de vainilla y madera de guayaco. Especiado arriba y goloso abajo, sin que ninguno de los dos gane del todo.",
    "likeIf": [
      "Te gusta la vainilla cuando llega acompañada de especias",
      "Buscás una apertura de mandarina con pimienta detrás",
      "Te atrae la madera de guayaco en el cierre"
    ]
  },
  "carolina-herrera-212-vip": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "amaderado"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Ron",
      "Tropical",
      "Frutal",
      "Floral blanco",
      "Empolvado",
      "Almizclado",
      "Amaderado",
      "Fresco"
    ],
    "topNotes": [
      "Ron",
      "Maracuyá"
    ],
    "middleNotes": [
      "Gardenia",
      "Almizcle"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka"
    ],
    "mainNotes": [
      "Ron",
      "Gardenia",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Primero ron y maracuyá. Después gardenia y almizcle. Al final, vainilla y haba tonka. El conjunto es dulce, floral y amaderado.",
    "likeIf": [
      "Te atrae el contraste entre ron y un corazón de gardenia",
      "Preferís que el final quede en vainilla y haba tonka",
      "Querés explorar lo dulce con carácter floral"
    ]
  },
  "carolina-herrera-212-vip-black": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "gourmand-dulce"
    ],
    "accords": [
      "Aromático",
      "Vainilla",
      "Especiado suave",
      "Lavanda",
      "Anís",
      "Almizclado",
      "Empolvado"
    ],
    "topNotes": [
      "Absenta",
      "Anís",
      "Hinojo"
    ],
    "middleNotes": [
      "Lavanda"
    ],
    "baseNotes": [
      "Vaina de vainilla negra",
      "Almizcle"
    ],
    "mainNotes": [
      "Absenta",
      "Anís",
      "Lavanda",
      "Vainilla"
    ],
    "occasions": [
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Anís y absenta sobre vainilla negra. Es oscuro, un poco licoroso, y está claramente pensado para la noche.",
    "likeIf": [
      "Salís de noche",
      "Te gusta el anís y lo licoroso",
      "Buscás algo distinto a lo cítrico"
    ]
  },
  "carolina-herrera-212-vip-men": {
    "family": "especiado",
    "families": [
      "especiado",
      "aromatico-limpio",
      "amaderado"
    ],
    "accords": [
      "Especiado fresco",
      "Aromático",
      "Vodka",
      "Amaderado",
      "Verde",
      "Tropical",
      "Cítrico",
      "Frutal",
      "Especiado cálido",
      "Fresco"
    ],
    "topNotes": [
      "Maracuyá",
      "Lima",
      "Pimienta",
      "Jengibre",
      "Lima caviar"
    ],
    "middleNotes": [
      "Vodka",
      "Gin",
      "Menta",
      "Especias"
    ],
    "baseNotes": [
      "Ámbar",
      "Cuero",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Maracuyá",
      "Vodka",
      "Ámbar",
      "Cuero"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Abre con maracuyá, lima y pimienta. El corazón suma vodka, gin y menta y el fondo se asienta en ámbar, cuero y notas amaderadas. Entre sus acordes principales figuran especiado fresco y aromático.",
    "likeIf": [
      "Te llama la atención el paso de maracuyá a vodka",
      "Querés un cierre de ámbar y cuero",
      "Te gusta la combinación de especiado fresco y aromático"
    ]
  },
  "carolina-herrera-212-vip-rose": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Floral",
      "Almizclado",
      "Frutal",
      "Amaderado",
      "Empolvado",
      "Rosa"
    ],
    "topNotes": [
      "Champagne rosado",
      "Pimienta rosa"
    ],
    "middleNotes": [
      "Flor de durazno",
      "Rosa"
    ],
    "baseNotes": [
      "Almizcle blanco",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Champagne rosado",
      "Flor de durazno",
      "Almizcle blanco",
      "Notas amaderadas"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La apertura combina champagne rosado y pimienta rosa. Después llega el turno de flor de durazno y rosa, y el final queda en almizcle blanco y notas amaderadas. El resultado es un perfil floral y amaderado.",
    "likeIf": [
      "Disfrutás perfiles que van de champagne rosado hacia flor de durazno",
      "Buscás una composición que termine en almizcle blanco y notas amaderadas",
      "Te atraen los acordes de floral y almizclado"
    ]
  },
  "carolina-herrera-bad-boy": {
    "family": "especiado",
    "families": [
      "especiado",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Especiado cálido",
      "Especiado fresco",
      "Cacao",
      "Aromático",
      "Vainilla",
      "Dulce"
    ],
    "topNotes": [
      "Pimienta blanca",
      "Bergamota",
      "Pimienta rosa"
    ],
    "middleNotes": [
      "Cedro",
      "Salvia sclarea"
    ],
    "baseNotes": [
      "Haba tonka",
      "Cacao"
    ],
    "mainNotes": [
      "Pimienta blanca",
      "Cedro",
      "Haba tonka",
      "Cacao"
    ],
    "occasions": [
      "cita",
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "envolvente",
    "feel": "Pimienta seca arriba, cacao y haba tonka abajo. El contraste entre lo especiado y lo goloso es todo el perfume.",
    "likeIf": [
      "Te gusta el cacao en perfumería",
      "Buscás algo para una cita",
      "Querés especias sin ir a lo pesado"
    ]
  },
  "carolina-herrera-bad-boy-cobalt": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "especiado",
      "gourmand-dulce"
    ],
    "accords": [
      "Terroso",
      "Especiado fresco",
      "Vainilla",
      "Amaderado",
      "Ámbar",
      "Aromático",
      "Especiado cálido",
      "Animálico",
      "Herbal",
      "Especiado suave"
    ],
    "topNotes": [
      "Pimienta negra",
      "Salvia"
    ],
    "middleNotes": [
      "Trufa",
      "Notas amaderadas"
    ],
    "baseNotes": [
      "Vainilla",
      "Olíbano"
    ],
    "mainNotes": [
      "Pimienta negra",
      "Trufa",
      "Vainilla",
      "Olíbano"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Pimienta negra y salvia arriba, trufa y maderas en el centro, vainilla e incienso abajo. La trufa es lo raro acá: pone algo terroso en un perfume por lo demás cálido.",
    "likeIf": [
      "Te llama la atención la trufa en perfumería",
      "Buscás vainilla con incienso y no vainilla sola",
      "Te gusta lo terroso en un fondo amaderado"
    ]
  },
  "carolina-herrera-bad-boy-dazzling-garden": {
    "family": "especiado",
    "families": [
      "especiado",
      "gourmand-dulce",
      "aromatico-limpio"
    ],
    "accords": [
      "Especiado cálido",
      "Cacao",
      "Aromático",
      "Especiado fresco",
      "Vainilla",
      "Dulce",
      "Cítrico",
      "Ámbar",
      "Especiado suave"
    ],
    "topNotes": [
      "Pimienta blanca",
      "Pomelo"
    ],
    "middleNotes": [
      "Salvia sclarea",
      "Vetiver"
    ],
    "baseNotes": [
      "Cacao",
      "Haba tonka"
    ],
    "mainNotes": [
      "Pimienta blanca",
      "Salvia sclarea",
      "Cacao",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Al principio pimienta blanca y pomelo. Más adelante entran salvia sclarea y vetiver, y el fondo termina en cacao y haba tonka. La composición combina un registro especiado y dulce.",
    "likeIf": [
      "Te gustan las aperturas de pimienta blanca que pasan a salvia sclarea",
      "Te llaman la atención los fondos de cacao y haba tonka",
      "Te gusta la combinación de especiado fresco y vainilla"
    ]
  },
  "carolina-herrera-bad-boy-extreme": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "especiado",
      "gourmand-dulce"
    ],
    "accords": [
      "Ámbar",
      "Especiado cálido",
      "Cacao",
      "Aromático",
      "Amaderado",
      "Dulce",
      "Balsámico",
      "Pachulí",
      "Terroso",
      "Ahumado"
    ],
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "mainNotes": [
      "Cacao",
      "Haba tonka",
      "Hoja de pachulí de Indonesia",
      "Incienso",
      "Vetiver",
      "Ciruela",
      "Salvia sclarea",
      "Olíbano",
      "Jengibre de India",
      "Opopónaco",
      "Labdanum",
      "Davana",
      "Bergamota"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La composición reúne cacao, haba tonka, hoja de pachulí de Indonesia y incienso, y también vetiver, ciruela, salvia sclarea y olíbano. El conjunto es ambarado, especiado y dulce.",
    "likeIf": [
      "Buscás perfiles donde convivan cacao y haba tonka",
      "Te gusta encontrar incienso y vetiver en la misma composición",
      "Buscás perfiles donde convivan ciruela y salvia sclarea"
    ]
  },
  "carolina-herrera-ch-femenino": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "citrico-fresco",
      "gourmand-dulce"
    ],
    "accords": [
      "Amaderado",
      "Cítrico",
      "Dulce",
      "Almizclado",
      "Especiado cálido",
      "Empolvado",
      "Tropical",
      "Pachulí",
      "Cuero",
      "Ámbar"
    ],
    "topNotes": [
      "Frutas tropicales",
      "Bergamota",
      "Pomelo",
      "Limón de Amalfi",
      "Notas acuáticas"
    ],
    "middleNotes": [
      "Praliné",
      "Canela",
      "Flor de naranjo africana",
      "Jazmín",
      "Rosa"
    ],
    "baseNotes": [
      "Gamuza",
      "Pachulí",
      "Madera de cachemira",
      "Sándalo",
      "Almizcle",
      "Cedro de Virginia",
      "Ámbar"
    ],
    "mainNotes": [
      "Frutas tropicales",
      "Praliné",
      "Gamuza",
      "Pachulí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Frutas tropicales, bergamota y pomelo en la salida, praliné, canela y flor de naranjo africana en el corazón y gamuza, pachulí y madera de cachemira en el fondo. El conjunto es amaderado, cítrico y dulce.",
    "likeIf": [
      "Te atrae el contraste entre frutas tropicales y un corazón de praliné",
      "Preferís que el final quede en gamuza y pachulí",
      "Querés explorar lo dulce junto a lo almizclado"
    ]
  },
  "carolina-herrera-ch-masculino": {
    "family": "cuero-ahumado",
    "families": [
      "cuero-ahumado",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Cuero",
      "Vainilla",
      "Dulce",
      "Amaderado",
      "Empolvado",
      "Verde",
      "Animálico",
      "Especiado fresco",
      "Cítrico",
      "Fresco"
    ],
    "topNotes": [
      "Hierba",
      "Bergamota",
      "Pomelo"
    ],
    "middleNotes": [
      "Notas amaderadas",
      "Nuez moscada",
      "Violeta",
      "Azafrán",
      "Jazmín"
    ],
    "baseNotes": [
      "Azúcar",
      "Cuero",
      "Vainilla",
      "Gamuza",
      "Ámbar",
      "Madera de cachemira",
      "Sándalo",
      "Musgo de roble",
      "Vetiver"
    ],
    "mainNotes": [
      "Hierba",
      "Notas amaderadas",
      "Azúcar",
      "Cuero"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Hierba, bergamota y pomelo en la salida; nuez moscada y violeta en el centro; y un fondo largo de cuero, gamuza y vainilla. El cuero es lo que manda, con el azúcar redondeándole los bordes.",
    "likeIf": [
      "Buscás cuero sin que resulte áspero",
      "Te gusta que la gamuza aparezca junto a la vainilla",
      "Preferís una apertura verde antes de un fondo de cuero"
    ]
  },
  "carolina-herrera-good-girl": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "especiado"
    ],
    "accords": [
      "Dulce",
      "Floral blanco",
      "Especiado cálido",
      "Vainilla",
      "Ámbar",
      "Cacao",
      "Amaderado"
    ],
    "topNotes": [
      "Almendra",
      "Café",
      "Bergamota",
      "Limón"
    ],
    "middleNotes": [
      "Nardo",
      "Jazmín sambac",
      "Azahar",
      "Rosa búlgara",
      "Lirio"
    ],
    "baseNotes": [
      "Haba tonka",
      "Cacao",
      "Vainilla",
      "Praliné",
      "Sándalo",
      "Almizcle",
      "Ámbar",
      "Pachulí"
    ],
    "mainNotes": [
      "Café",
      "Almendra",
      "Nardo",
      "Cacao",
      "Haba tonka"
    ],
    "occasions": [
      "noche",
      "cita"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "El contraste está en el centro: nardo y jazmín arriba, café y cacao abajo. Floral y goloso al mismo tiempo.",
    "likeIf": [
      "Te gustan los florales con fondo dulce",
      "Buscás algo para la noche",
      "Querés un perfil de carácter marcado"
    ]
  },
  "carolina-herrera-good-girl-blush": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "citrico-fresco"
    ],
    "accords": [
      "Floral",
      "Vainilla",
      "Fresco",
      "Cítrico",
      "Dulce",
      "Floral amarillo",
      "Rosa",
      "Almendra",
      "Amaderado",
      "Aromático"
    ],
    "topNotes": [
      "Bergamota",
      "Almendra amarga"
    ],
    "middleNotes": [
      "Peonía",
      "Ylang ylang"
    ],
    "baseNotes": [
      "Vainilla",
      "Cumarina"
    ],
    "mainNotes": [
      "Bergamota",
      "Peonía",
      "Vainilla",
      "Cumarina"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Bergamota y almendra amarga en la salida, peonía y ylang ylang en el corazón y vainilla y cumarina en el fondo. El perfil cruza lo floral con lo dulce.",
    "likeIf": [
      "Te atrae el contraste entre bergamota y un corazón de peonía",
      "Preferís que el final quede en vainilla y cumarina",
      "Te gusta la combinación de fresco y cítrico"
    ]
  },
  "carolina-herrera-good-girl-glorious-gold": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "floral"
    ],
    "accords": [
      "Dulce",
      "Especiado cálido",
      "Floral blanco",
      "Amaderado",
      "Vainilla",
      "Ámbar",
      "Nardo",
      "Almendra",
      "Empolvado",
      "Cítrico"
    ],
    "topNotes": [
      "Almendra",
      "Café",
      "Bergamota",
      "Limón"
    ],
    "middleNotes": [
      "Nardo",
      "Rosa búlgara",
      "Azahar",
      "Lirio",
      "Jazmín"
    ],
    "baseNotes": [
      "Haba tonka",
      "Cacao",
      "Praliné",
      "Vainilla",
      "Madera de cachemira",
      "Pachulí",
      "Sándalo",
      "Canela",
      "Ámbar",
      "Almizcle",
      "Cedro"
    ],
    "mainNotes": [
      "Almendra",
      "Nardo",
      "Haba tonka",
      "Cacao"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Empieza con almendra, café y bergamota. En el corazón hay nardo, rosa búlgara y azahar, y el fondo reúne haba tonka, cacao y praliné. Es una composición dulce, especiada y floral.",
    "likeIf": [
      "Te llama la atención el paso de almendra a nardo",
      "Querés un cierre de haba tonka y cacao",
      "Te gusta la combinación de dulce y especiado cálido"
    ]
  },
  "carolina-herrera-good-girl-supreme": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Floral blanco",
      "Vainilla",
      "Frutal",
      "Amaderado",
      "Aromático",
      "Ámbar",
      "Nardo",
      "Dulce",
      "Especiado cálido",
      "Terroso"
    ],
    "topNotes": [
      "Frutos del bosque",
      "Jazmín de Egipto"
    ],
    "middleNotes": [
      "Haba tonka",
      "Nardo"
    ],
    "baseNotes": [
      "Vetiver"
    ],
    "mainNotes": [
      "Frutos del bosque",
      "Haba tonka",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Abre con frutos del bosque y jazmín de Egipto. El corazón suma haba tonka y nardo y el fondo se asienta en vetiver. Es una composición floral, dulce y amaderada.",
    "likeIf": [
      "Te llama la atención el paso de frutos del bosque a haba tonka",
      "Buscás una composición que termine en vetiver",
      "Te gusta la combinación de floral blanco y vainilla"
    ]
  },
  "carolina-herrera-good-girl-very": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Frutal",
      "Rosa",
      "Fresco",
      "Vainilla",
      "Tropical",
      "Especiado suave",
      "Dulce",
      "Ácido"
    ],
    "topNotes": [
      "Lichi",
      "Grosella roja"
    ],
    "middleNotes": [
      "Rosa"
    ],
    "baseNotes": [
      "Vainilla",
      "Vetiver"
    ],
    "mainNotes": [
      "Lichi",
      "Rosa",
      "Vainilla",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Primero lichi y grosella roja. Después rosa. Al final, vainilla y vetiver. Se apoya en acordes de frutal y rosa.",
    "likeIf": [
      "Te atrae el contraste entre lichi y un corazón de rosa",
      "Preferís que el final quede en vainilla y vetiver",
      "Te gusta la combinación de tropical y especiado suave"
    ]
  },
  "carolina-herrera-la-bomba": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "citrico-fresco"
    ],
    "accords": [
      "Floral",
      "Tropical",
      "Frutal",
      "Vainilla",
      "Fresco",
      "Pachulí"
    ],
    "topNotes": [
      "Pitahaya",
      "Ananá",
      "Mandarina amarilla"
    ],
    "middleNotes": [
      "Frangipani",
      "Peonía roja",
      "Rosyfolia",
      "Azahar",
      "Jazmín sambac",
      "Pomarose"
    ],
    "baseNotes": [
      "Vainilla",
      "Pachulí",
      "Ambrofix",
      "Haba tonka"
    ],
    "mainNotes": [
      "Pitahaya",
      "Frangipani",
      "Vainilla",
      "Pachulí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Sale con pitahaya, ananá y mandarina amarilla, se acomoda en frangipani, peonía roja y rosyfolia y se queda en vainilla, pachulí y ambrofix. Se apoya en acordes de floral y tropical.",
    "likeIf": [
      "Te atrae el contraste entre pitahaya y un corazón de frangipani",
      "Preferís que el final quede en vainilla y pachulí",
      "Querés explorar lo floral junto a lo tropical"
    ]
  },
  "chanel-allure-sport": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "aromatico-limpio",
      "gourmand-dulce"
    ],
    "accords": [
      "Cítrico",
      "Aromático",
      "Vainilla",
      "Aldehídico",
      "Marino",
      "Dulce",
      "Especiado fresco",
      "Fresco",
      "Ámbar",
      "Empolvado"
    ],
    "topNotes": [
      "Naranja",
      "Notas marinas",
      "Aldehídos",
      "Mandarina sanguina"
    ],
    "middleNotes": [
      "Pimienta",
      "Neroli",
      "Cedro"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Almizcle blanco",
      "Ámbar",
      "Vetiver",
      "Elemí"
    ],
    "mainNotes": [
      "Naranja",
      "Pimienta",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Empieza con naranja, notas marinas y aldehídos. En el corazón hay pimienta, neroli y cedro, y el fondo reúne vainilla, haba tonka y almizcle blanco. Queda en un registro cítrico, aromático y dulce.",
    "likeIf": [
      "Te gustan las aperturas de naranja que pasan a pimienta",
      "Te gusta la combinación de cítrico y aromático",
      "Querés explorar lo marino junto a lo dulce"
    ]
  },
  "chanel-bleu-de-chanel": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "amaderado",
      "ambarado-intenso"
    ],
    "accords": [
      "Cítrico",
      "Ámbar",
      "Amaderado",
      "Especiado fresco",
      "Aromático",
      "Ahumado"
    ],
    "topNotes": [
      "Pomelo",
      "Limón",
      "Menta",
      "Bergamota",
      "Pimienta rosa",
      "Aldehídos",
      "Cilantro"
    ],
    "middleNotes": [
      "Jengibre",
      "Jazmín",
      "Nuez moscada",
      "Melón"
    ],
    "baseNotes": [
      "Incienso",
      "Ámbar",
      "Cedro",
      "Sándalo",
      "Amberwood",
      "Pachulí",
      "Labdanum"
    ],
    "mainNotes": [
      "Pomelo",
      "Menta",
      "Jengibre",
      "Incienso",
      "Cedro"
    ],
    "occasions": [
      "diario",
      "trabajo",
      "versatil",
      "noche"
    ],
    "seasons": [
      "todo-el-ano"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Abre cítrico y limpio, y va cerrando sobre madera e incienso. Es el ejemplo de fragancia que sirve tanto para la oficina como para salir.",
    "likeIf": [
      "Querés una sola fragancia para todo",
      "Te gustan los cítricos con fondo amaderado",
      "Buscás algo que no falle en el trabajo"
    ]
  },
  "chanel-chanel-n-5": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "citrico-fresco",
      "floral"
    ],
    "accords": [
      "Amaderado",
      "Empolvado",
      "Aldehídico",
      "Fresco",
      "Iris",
      "Terroso",
      "Floral blanco",
      "Almizclado",
      "Cítrico",
      "Floral amarillo"
    ],
    "topNotes": [
      "Aldehídos",
      "Ylang ylang",
      "Neroli",
      "Limón de Amalfi",
      "Bergamota"
    ],
    "middleNotes": [
      "Iris",
      "Jazmín",
      "Rosa",
      "Raíz de lirio",
      "Muguet"
    ],
    "baseNotes": [
      "Civeta",
      "Almizcle",
      "Sándalo",
      "Musgo de roble",
      "Vetiver",
      "Ámbar",
      "Vainilla",
      "Pachulí"
    ],
    "mainNotes": [
      "Aldehídos",
      "Iris",
      "Civeta",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Aldehídos, ylang ylang y neroli arriba; iris, jazmín y rosa en el centro; un fondo de almizcle, sándalo y musgo de roble. Es el N°5 en su lectura más ligera.",
    "likeIf": [
      "Querés N°5 en su versión más ligera",
      "Te gustan los aldehídos",
      "Buscás un floral empolvado clásico"
    ]
  },
  "christian-dior-dior-homme": {
    "family": "floral",
    "families": [
      "floral",
      "aromatico-limpio",
      "amaderado"
    ],
    "accords": [
      "Iris",
      "Aromático",
      "Terroso",
      "Especiado cálido",
      "Amaderado",
      "Empolvado",
      "Violeta"
    ],
    "topNotes": [
      "Iris de Toscana"
    ],
    "middleNotes": [
      "Cardamomo de Guatemala"
    ],
    "baseNotes": [
      "Vetiver"
    ],
    "mainNotes": [
      "Iris de Toscana",
      "Cardamomo de Guatemala",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Iris de Toscana arriba, cardamomo de Guatemala en el centro y vetiver abajo. Empolvado y terroso al mismo tiempo: elegante sin buscar llamar la atención.",
    "likeIf": [
      "Buscás un iris seco y empolvado",
      "Te interesa el cardamomo cuando aparece contenido",
      "Preferís un fondo de vetiver, terroso y sin adornos"
    ]
  },
  "christian-dior-dior-homme-intense": {
    "family": "floral",
    "families": [
      "floral",
      "amaderado"
    ],
    "accords": [
      "Iris",
      "Amaderado",
      "Empolvado",
      "Terroso",
      "Aromático",
      "Violeta"
    ],
    "topNotes": [
      "Lavanda"
    ],
    "middleNotes": [
      "Iris",
      "Ambreta",
      "Pera"
    ],
    "baseNotes": [
      "Cedro de Virginia",
      "Vetiver"
    ],
    "mainNotes": [
      "Iris",
      "Lavanda",
      "Cedro",
      "Vetiver"
    ],
    "occasions": [
      "evento",
      "cita",
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Iris empolvado sobre madera seca. Es el registro más formal y vestido de la lista: elegante, contenido, nada estridente.",
    "likeIf": [
      "Buscás algo formal",
      "Te gusta el iris y lo empolvado",
      "Querés elegancia por encima de impacto"
    ]
  },
  "christian-dior-fahrenheit": {
    "family": "cuero-ahumado",
    "families": [
      "cuero-ahumado",
      "amaderado",
      "acuatico"
    ],
    "accords": [
      "Cuero",
      "Amaderado",
      "Ozónico",
      "Especiado fresco",
      "Aromático",
      "Animálico",
      "Acuático",
      "Floral",
      "Cítrico",
      "Verde"
    ],
    "topNotes": [
      "Nigella (ajenuz)",
      "Lavanda",
      "Cedro",
      "Mandarina",
      "Manzanilla",
      "Bergamota",
      "Espino albar",
      "Limón"
    ],
    "middleNotes": [
      "Hoja de violeta",
      "Nuez moscada",
      "Cedro",
      "Sándalo",
      "Clavel",
      "Madreselva",
      "Jazmín",
      "Muguet"
    ],
    "baseNotes": [
      "Cuero",
      "Vetiver",
      "Almizcle",
      "Ámbar",
      "Pachulí",
      "Haba tonka"
    ],
    "mainNotes": [
      "Nigella (ajenuz)",
      "Hoja de violeta",
      "Cuero",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Sale con nigella (ajenuz), lavanda y cedro, se acomoda en hoja de violeta, nuez moscada y cedro y se queda en cuero, vetiver y almizcle. El perfil cruza lo amaderado con lo acuático.",
    "likeIf": [
      "Te atrae el contraste entre nigella (ajenuz) y un corazón de hoja de violeta",
      "Preferís que el final quede en cuero y vetiver",
      "Te gusta la combinación de ozónico y especiado fresco"
    ]
  },
  "christian-dior-hypnotic-poison": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "floral"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Almendra",
      "Frutal",
      "Avellanado",
      "Empolvado",
      "Amaderado",
      "Coco",
      "Floral blanco",
      "Balsámico"
    ],
    "topNotes": [
      "Coco",
      "Ciruela",
      "Damasco"
    ],
    "middleNotes": [
      "Palo de rosa de Brasil",
      "Jazmín",
      "Nardo",
      "Alcaravea",
      "Rosa",
      "Muguet"
    ],
    "baseNotes": [
      "Vainilla",
      "Almendra",
      "Sándalo",
      "Almizcle"
    ],
    "mainNotes": [
      "Coco",
      "Palo de rosa de Brasil",
      "Vainilla",
      "Almendra"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Empieza con coco, ciruela y damasco. En el corazón hay palo de rosa de Brasil, jazmín y nardo, y el fondo reúne vainilla, almendra y sándalo. La composición combina un registro dulce y amaderado.",
    "likeIf": [
      "Te gustan las aperturas de coco que pasan a palo de rosa de Brasil",
      "Te llaman la atención los fondos de vainilla y almendra",
      "Buscás algo dulce donde lo amaderado tenga peso"
    ]
  },
  "christian-dior-jadore": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Floral",
      "Cítrico"
    ],
    "topNotes": [
      "Naranja sanguina"
    ],
    "middleNotes": [
      "Neroli"
    ],
    "baseNotes": [
      "Rosa de Damasco"
    ],
    "mainNotes": [
      "Naranja sanguina",
      "Neroli",
      "Rosa de Damasco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Naranja sanguina arriba, neroli en el corazón y esencia de rosa de Damasco en el fondo. Floral y cítrico a la vez, con la rosa puesta al final en lugar de al centro.",
    "likeIf": [
      "Buscás un floral que arranque por lo cítrico",
      "Te gusta la naranja sanguina como apertura",
      "Preferís que la rosa llegue al final y no domine"
    ]
  },
  "christian-dior-miss-dior": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "floral",
      "amaderado"
    ],
    "accords": [
      "Cítrico",
      "Rosa",
      "Amaderado",
      "Pachulí",
      "Dulce",
      "Especiado cálido",
      "Especiado suave",
      "Balsámico",
      "Floral"
    ],
    "topNotes": [
      "Pimienta rosa",
      "Naranja sanguina",
      "Naranja dulce",
      "Mandarina",
      "Bergamota de Calabria",
      "Limón"
    ],
    "middleNotes": [
      "Rosa de Grasse",
      "Rosa de Damasco",
      "Hoja de jazmín"
    ],
    "baseNotes": [
      "Pachulí",
      "Palisandro"
    ],
    "mainNotes": [
      "Pimienta rosa",
      "Rosa de Grasse",
      "Pachulí",
      "Palisandro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Pimienta rosa y naranja sanguina arriba, un corazón de dos rosas —Grasse y Damasco— y un fondo de pachulí. La rosa es el centro y el pachulí la lleva a un registro amaderado.",
    "likeIf": [
      "Te gusta la rosa cuando tiene pachulí debajo",
      "Buscás un cítrico que abra paso a un floral",
      "Preferís el pachulí a un fondo de vainilla"
    ]
  },
  "christian-dior-poison": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "ambarado-intenso",
      "floral"
    ],
    "accords": [
      "Frutal",
      "Dulce",
      "Ámbar",
      "Floral blanco",
      "Amaderado",
      "Especiado cálido",
      "Balsámico"
    ],
    "topNotes": [
      "Ciruela",
      "Bayas silvestres",
      "Cilantro",
      "Anís",
      "Palo de rosa de Brasil"
    ],
    "middleNotes": [
      "Nardo",
      "Incienso",
      "Miel blanca",
      "Canela",
      "Opopónaco",
      "Clavel",
      "Jazmín",
      "Flor de naranjo africana",
      "Rosa"
    ],
    "baseNotes": [
      "Vainilla",
      "Ámbar",
      "Sándalo",
      "Heliotropo",
      "Almizcle",
      "Vetiver",
      "Cedro de Virginia"
    ],
    "mainNotes": [
      "Ciruela",
      "Nardo",
      "Vainilla",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Sale con ciruela, bayas silvestres y cilantro, se acomoda en nardo, incienso y miel blanca y se queda en vainilla, ámbar y sándalo. El resultado es un perfil dulce, ambarado y floral.",
    "likeIf": [
      "Disfrutás perfiles que van de ciruela hacia nardo",
      "Buscás una composición que termine en vainilla y ámbar",
      "Te atraen los acordes de frutal y dulce"
    ]
  },
  "christian-dior-poison-girl": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "citrico-fresco",
      "ambarado-intenso"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Almendra",
      "Empolvado",
      "Cítrico",
      "Ámbar",
      "Avellanado",
      "Amaderado",
      "Frutal",
      "Especiado cálido"
    ],
    "topNotes": [
      "Naranja amarga",
      "Limón"
    ],
    "middleNotes": [
      "Rosa de Damasco",
      "Rosa de Grasse",
      "Azahar"
    ],
    "baseNotes": [
      "Vainilla",
      "Almendra",
      "Haba tonka",
      "Bálsamo de Tolú",
      "Sándalo",
      "Heliotropo",
      "Cashmeran"
    ],
    "mainNotes": [
      "Naranja amarga",
      "Rosa de Damasco",
      "Vainilla",
      "Almendra"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Arranca con naranja amarga y limón, pasa por rosa de Damasco, rosa de Grasse y azahar y termina sobre vainilla, almendra y haba tonka. Es una composición dulce, cítrica y ambarada.",
    "likeIf": [
      "Te llama la atención el paso de naranja amarga a rosa de Damasco",
      "Querés un cierre de vainilla y almendra",
      "Preferís un perfil dulce con un matiz cítrico"
    ]
  },
  "christian-dior-sauvage": {
    "family": "especiado",
    "families": [
      "especiado",
      "citrico-fresco",
      "ambarado-intenso"
    ],
    "accords": [
      "Especiado fresco",
      "Cítrico",
      "Ámbar",
      "Lavanda",
      "Almizclado",
      "Aromático"
    ],
    "topNotes": [
      "Bergamota"
    ],
    "middleNotes": [
      "Pimienta de Sichuan",
      "Lavanda",
      "Anís estrellado",
      "Nuez moscada"
    ],
    "baseNotes": [
      "Ambroxan",
      "Vainilla"
    ],
    "mainNotes": [
      "Bergamota",
      "Pimienta de Sichuan",
      "Ambroxan",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [
      "todo-el-ano"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "La pimienta de Sichuan y la lavanda aparecen en el corazón, y el ambroxan en el fondo. El perfil combina acordes cítricos, especiados y ambarados.",
    "likeIf": [
      "Buscás algo cítrico pero con carácter especiado",
      "Te llama la atención un corazón con anís estrellado y nuez moscada",
      "Buscás una composición que termine en ambroxan y vainilla"
    ]
  },
  "christian-dior-sauvage-elixir": {
    "family": "especiado",
    "families": [
      "especiado",
      "amaderado",
      "aromatico-limpio"
    ],
    "accords": [
      "Especiado cálido",
      "Especiado fresco",
      "Amaderado",
      "Aromático",
      "Lavanda"
    ],
    "topNotes": [
      "Nuez moscada",
      "Canela",
      "Cardamomo",
      "Pomelo"
    ],
    "middleNotes": [
      "Lavanda"
    ],
    "baseNotes": [
      "Regaliz",
      "Sándalo",
      "Ámbar",
      "Pachulí",
      "Vetiver de Haití"
    ],
    "mainNotes": [
      "Canela",
      "Cardamomo",
      "Lavanda",
      "Regaliz",
      "Sándalo"
    ],
    "occasions": [
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "intensa",
    "feel": "Una apertura de especias muy marcada que baja hacia un fondo amaderado y resinoso, con el regaliz cruzando la lavanda. Denso y oscuro.",
    "likeIf": [
      "Te gustan los perfumes de carácter marcado",
      "Buscás especias y madera",
      "Preferís algo para el frío"
    ]
  },
  "creed-aventus": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "amaderado",
      "cuero-ahumado"
    ],
    "accords": [
      "Frutal",
      "Dulce",
      "Amaderado",
      "Cuero",
      "Cítrico",
      "Ahumado",
      "Almizclado"
    ],
    "topNotes": [
      "Bergamota",
      "Grosella negra",
      "Manzana",
      "Limón",
      "Pimienta rosa"
    ],
    "middleNotes": [
      "Ananá",
      "Pachulí",
      "Jazmín de Marruecos"
    ],
    "baseNotes": [
      "Abedul",
      "Almizcle",
      "Musgo de roble",
      "Cedro",
      "Ambroxan"
    ],
    "mainNotes": [
      "Ananá",
      "Grosella negra",
      "Abedul",
      "Musgo de roble"
    ],
    "occasions": [
      "versatil",
      "evento"
    ],
    "seasons": [
      "todo-el-ano"
    ],
    "aromaticIntensity": "marcada",
    "feel": "La apertura frutal de ananá es inconfundible, y debajo aparece un abedul ahumado que le da el contraste. Es la referencia de este estilo.",
    "likeIf": [
      "Buscás la referencia del género",
      "Te gusta lo frutal con fondo ahumado",
      "Querés algo que funcione en cualquier contexto"
    ]
  },
  "creed-aventus-absolu": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Cítrico",
      "Frutal",
      "Amaderado",
      "Ahumado",
      "Especiado fresco"
    ],
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "mainNotes": [
      "Pomelo",
      "Ananá",
      "Vetiver de Haití",
      "Pachulí",
      "Bergamota",
      "Limón",
      "Jengibre",
      "Canela",
      "Cardamomo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Pomelo y ananá con vetiver de Haití y pachulí, y un tramo de jengibre, canela y cardamomo. Es la lectura más cítrica y especiada del Aventus.",
    "likeIf": [
      "Te gusta el ananá del Aventus",
      "Buscás esa fruta con más especias encima",
      "Te atrae el vetiver de Haití en el fondo"
    ]
  },
  "creed-aventus-millesime-1849": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "floral",
      "gourmand-dulce"
    ],
    "accords": [
      "Amaderado",
      "Floral amarillo",
      "Empolvado",
      "Floral blanco",
      "Dulce",
      "Especiado cálido",
      "Pachulí",
      "Oud",
      "Vainilla",
      "Cítrico"
    ],
    "topNotes": [
      "Bergamota de Calabria"
    ],
    "middleNotes": [
      "Ylang ylang",
      "Jazmín",
      "Pachulí",
      "Cedro"
    ],
    "baseNotes": [
      "Sándalo",
      "Oud",
      "Vainilla bourbon",
      "Almizcle"
    ],
    "mainNotes": [
      "Bergamota de Calabria",
      "Ylang ylang",
      "Sándalo",
      "Oud"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Bergamota de Calabria sola arriba, un corazón de ylang ylang y jazmín, y un fondo de sándalo, oud y vainilla bourbon. Amaderado y floral a la vez, con el oud puesto atrás.",
    "likeIf": [
      "Te gusta el oud acompañado de flores",
      "Buscás un amaderado con ylang ylang",
      "Te atrae la vainilla bourbon sobre el sándalo"
    ]
  },
  "davidoff-cool-water-femenino": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "floral",
      "gourmand-dulce"
    ],
    "accords": [
      "Fresco",
      "Floral",
      "Frutal",
      "Acuático",
      "Ozónico",
      "Dulce",
      "Floral blanco",
      "Cítrico",
      "Empolvado",
      "Aromático"
    ],
    "topNotes": [
      "Melón",
      "Loto",
      "Limón",
      "Ananá",
      "Calone",
      "Membrillo",
      "Lirio",
      "Grosella negra"
    ],
    "middleNotes": [
      "Loto",
      "Nenúfar",
      "Muguet",
      "Jazmín",
      "Miel",
      "Espino albar",
      "Rosa"
    ],
    "baseNotes": [
      "Almizcle",
      "Vetiver",
      "Raíz de violeta",
      "Sándalo",
      "Durazno",
      "Frambuesa",
      "Mora",
      "Vainilla"
    ],
    "mainNotes": [
      "Melón",
      "Loto",
      "Almizcle",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Primero melón, loto y limón. Después loto, nenúfar y muguet. Al final, almizcle, vetiver y raíz de violeta. El conjunto es cítrico, floral y dulce.",
    "likeIf": [
      "Te atrae el contraste entre melón y un corazón de loto",
      "Preferís que el final quede en almizcle y vetiver",
      "Querés explorar lo fresco junto a lo floral"
    ]
  },
  "davidoff-cool-water-masculino": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "citrico-fresco",
      "acuatico"
    ],
    "accords": [
      "Aromático",
      "Verde",
      "Marino",
      "Especiado fresco",
      "Lavanda",
      "Amaderado",
      "Salado"
    ],
    "topNotes": [
      "Agua de mar",
      "Lavanda",
      "Menta",
      "Notas verdes",
      "Romero",
      "Calone",
      "Cilantro"
    ],
    "middleNotes": [
      "Sándalo",
      "Neroli",
      "Geranio",
      "Jazmín"
    ],
    "baseNotes": [
      "Almizcle",
      "Musgo de roble",
      "Cedro",
      "Tabaco",
      "Ámbar gris"
    ],
    "mainNotes": [
      "Agua de mar",
      "Sándalo",
      "Almizcle",
      "Musgo de roble"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Desde agua de mar, lavanda y menta avanza hacia sándalo, neroli y geranio y cierra apoyado en almizcle, musgo de roble y cedro. El perfil cruza lo aromático con lo acuático.",
    "likeIf": [
      "Te atrae el contraste entre agua de mar y un corazón de sándalo",
      "Preferís que el final quede en almizcle y musgo de roble",
      "Querés explorar lo aromático junto a lo verde"
    ]
  },
  "dkny-be-delicious": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "gourmand-dulce",
      "acuatico"
    ],
    "accords": [
      "Verde",
      "Frutal",
      "Acuático",
      "Ozónico",
      "Fresco",
      "Cítrico",
      "Floral blanco",
      "Floral",
      "Especiado fresco",
      "Amaderado"
    ],
    "topNotes": [
      "Pepino",
      "Pomelo",
      "Magnolia"
    ],
    "middleNotes": [
      "Manzana verde",
      "Muguet",
      "Nardo",
      "Violeta",
      "Rosa"
    ],
    "baseNotes": [
      "Notas amaderadas",
      "Sándalo",
      "Ámbar"
    ],
    "mainNotes": [
      "Pepino",
      "Manzana verde",
      "Notas amaderadas",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Al principio pepino, pomelo y magnolia. Más adelante entran manzana verde, muguet y nardo, y el fondo termina en notas amaderadas, sándalo y ámbar. Queda en un registro cítrico y acuático.",
    "likeIf": [
      "Te gustan las aperturas de pepino que pasan a manzana verde",
      "Te llaman la atención los fondos de notas amaderadas y sándalo",
      "Preferís perfiles donde aparecen verde y frutal"
    ]
  },
  "dolce-gabbana-light-blue-femenino": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "amaderado",
      "gourmand-dulce"
    ],
    "accords": [
      "Cítrico",
      "Amaderado",
      "Fresco",
      "Frutal",
      "Aromático",
      "Almizclado",
      "Empolvado",
      "Verde"
    ],
    "topNotes": [
      "Limón de Sicilia",
      "Manzana",
      "Cedro",
      "Campanilla"
    ],
    "middleNotes": [
      "Bambú",
      "Jazmín",
      "Rosa blanca"
    ],
    "baseNotes": [
      "Cedro",
      "Almizcle",
      "Ámbar"
    ],
    "mainNotes": [
      "Limón de Sicilia",
      "Bambú",
      "Cedro",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Al principio limón de Sicilia, manzana y cedro. Más adelante entran bambú, jazmín y rosa blanca, y el fondo termina en cedro, almizcle y ámbar. Queda en un registro cítrico y amaderado.",
    "likeIf": [
      "Te gustan las aperturas de limón de Sicilia que pasan a bambú",
      "Te llaman la atención los fondos de cedro y almizcle",
      "Preferís perfiles donde aparecen fresco y frutal"
    ]
  },
  "dolce-gabbana-light-blue-masculino": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "especiado",
      "aromatico-limpio"
    ],
    "accords": [
      "Cítrico",
      "Especiado fresco",
      "Aromático",
      "Amaderado",
      "Almizclado"
    ],
    "topNotes": [
      "Pomelo",
      "Bergamota",
      "Mandarina de Sicilia",
      "Enebro"
    ],
    "middleNotes": [
      "Pimienta",
      "Romero",
      "Palo de rosa de Brasil"
    ],
    "baseNotes": [
      "Almizcle",
      "Incienso",
      "Musgo de roble"
    ],
    "mainNotes": [
      "Pomelo",
      "Pimienta",
      "Almizcle",
      "Incienso"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Pomelo, bergamota y mandarina de Sicilia arriba; pimienta, romero y palo de rosa de Brasil en el centro; almizcle, incienso y musgo de roble abajo. Empieza muy fresco y el incienso le da algo de fondo.",
    "likeIf": [
      "Te gustan los cítricos con romero y enebro",
      "Querés que algo fresco termine en incienso y musgo de roble",
      "Buscás un aromático para usar seguido"
    ]
  },
  "dolce-gabbana-the-one-femenino": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "ambarado-intenso"
    ],
    "accords": [
      "Frutal",
      "Floral blanco",
      "Vainilla",
      "Empolvado",
      "Dulce",
      "Ámbar",
      "Cítrico",
      "Fresco",
      "Almizclado",
      "Especiado suave"
    ],
    "topNotes": [
      "Durazno",
      "Lichi",
      "Mandarina",
      "Bergamota"
    ],
    "middleNotes": [
      "Lirio",
      "Ciruela",
      "Jazmín",
      "Muguet"
    ],
    "baseNotes": [
      "Vainilla",
      "Ámbar",
      "Almizcle",
      "Vetiver"
    ],
    "mainNotes": [
      "Durazno",
      "Lirio",
      "Vainilla",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La apertura combina durazno, lichi y mandarina. Después llega el turno de lirio, ciruela y jazmín, y el final queda en vainilla, ámbar y almizcle. El conjunto es dulce, floral y ambarado.",
    "likeIf": [
      "Te atrae el contraste entre durazno y un corazón de lirio",
      "Te atraen los acordes de vainilla y empolvado",
      "Querés explorar lo frutal junto a lo floral blanco"
    ]
  },
  "dolce-gabbana-the-one-masculino": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "especiado",
      "cuero-ahumado"
    ],
    "accords": [
      "Ámbar",
      "Especiado fresco",
      "Tabaco",
      "Aromático",
      "Cítrico",
      "Dulce",
      "Especiado cálido",
      "Amaderado",
      "Floral blanco",
      "Fresco"
    ],
    "topNotes": [
      "Pomelo",
      "Cilantro",
      "Albahaca"
    ],
    "middleNotes": [
      "Jengibre",
      "Cardamomo",
      "Azahar"
    ],
    "baseNotes": [
      "Ámbar",
      "Tabaco",
      "Cedro"
    ],
    "mainNotes": [
      "Pomelo",
      "Jengibre",
      "Ámbar",
      "Tabaco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Abre cítrico con pomelo y albahaca y baja hacia jengibre, cardamomo y un fondo de ámbar y tabaco. El cruce entre la salida fresca y el tabaco del final es lo que le da carácter.",
    "likeIf": [
      "Te gusta el tabaco en perfumería",
      "Buscás un cítrico que no se quede sólo en fresco",
      "Te atraen el jengibre y el cardamomo juntos"
    ]
  },
  "dolce-gabbana-the-only-one": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Caramelo",
      "Dulce",
      "Empolvado",
      "Violeta",
      "Vainilla",
      "Café",
      "Cítrico",
      "Especiado cálido",
      "Iris",
      "Amaderado"
    ],
    "topNotes": [
      "Violeta",
      "Naranja",
      "Bergamota"
    ],
    "middleNotes": [
      "Café",
      "Pera",
      "Iris",
      "Azahar",
      "Rosa"
    ],
    "baseNotes": [
      "Caramelo",
      "Vainilla",
      "Pachulí"
    ],
    "mainNotes": [
      "Violeta",
      "Café",
      "Caramelo",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Empieza con violeta, naranja y bergamota. En el corazón hay café, pera y iris, y el fondo reúne caramelo, vainilla y pachulí. La composición combina un registro dulce y cítrico.",
    "likeIf": [
      "Te gustan las aperturas de violeta que pasan a café",
      "Te llaman la atención los fondos de caramelo y vainilla",
      "Querés explorar lo dulce con carácter cítrico"
    ]
  },
  "giorgio-armani-acqua-di-gio-femenino": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "gourmand-dulce"
    ],
    "accords": [
      "Floral",
      "Fresco",
      "Floral blanco",
      "Verde",
      "Rosa",
      "Frutal",
      "Dulce",
      "Vodka",
      "Amaderado",
      "Empolvado"
    ],
    "topNotes": [
      "Peonía",
      "Musk Vodka",
      "Ananá",
      "Limón",
      "Durazno",
      "Hoja de banano",
      "Violeta"
    ],
    "middleNotes": [
      "Muguet",
      "Jacinto",
      "Lirio",
      "Jazmín",
      "Fresia",
      "Calone",
      "Ylang ylang",
      "Rosa"
    ],
    "baseNotes": [
      "Almizcle",
      "Cedro",
      "Sándalo",
      "Ámbar",
      "Estoraque"
    ],
    "mainNotes": [
      "Peonía",
      "Muguet",
      "Almizcle",
      "Cedro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Peonía y ananá arriba, muguet y jacinto en el centro, y un fondo de almizcle y cedro. Un floral fresco y suave, con la fruta puesta en la apertura y no en el corazón.",
    "likeIf": [
      "Te gustan los florales frescos más que los dulces",
      "Buscás peonía y muguet antes que un floral blanco marcado",
      "Te atrae que lo frutal aparezca sólo al principio"
    ]
  },
  "giorgio-armani-acqua-di-gio-masculino": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "aromatico-limpio",
      "acuatico"
    ],
    "accords": [
      "Cítrico",
      "Aromático",
      "Marino",
      "Especiado fresco",
      "Floral",
      "Amaderado",
      "Fresco"
    ],
    "topNotes": [
      "Lima",
      "Limón",
      "Bergamota",
      "Jazmín",
      "Naranja",
      "Mandarina",
      "Neroli"
    ],
    "middleNotes": [
      "Notas marinas",
      "Calone",
      "Romero",
      "Durazno",
      "Fresia",
      "Jacinto",
      "Ciclamen",
      "Violeta",
      "Cilantro",
      "Rosa",
      "Nuez moscada",
      "Reseda"
    ],
    "baseNotes": [
      "Almizcle blanco",
      "Cedro",
      "Musgo de roble",
      "Pachulí",
      "Ámbar"
    ],
    "mainNotes": [
      "Lima",
      "Notas marinas",
      "Almizcle blanco",
      "Cedro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Desde lima, limón y bergamota avanza hacia notas marinas, calone y romero y cierra apoyado en almizcle blanco, cedro y musgo de roble. El resultado es un perfil cítrico, aromático y acuático.",
    "likeIf": [
      "Disfrutás perfiles que van de lima hacia notas marinas",
      "Buscás una composición que termine en almizcle blanco y cedro",
      "Te atraen los acordes de marino y especiado fresco"
    ]
  },
  "giorgio-armani-acqua-di-gio-profondo": {
    "family": "acuatico",
    "families": [
      "acuatico",
      "aromatico-limpio",
      "citrico-fresco"
    ],
    "accords": [
      "Marino",
      "Aromático",
      "Cítrico",
      "Especiado fresco",
      "Fresco",
      "Amaderado",
      "Mineral",
      "Salado",
      "Lavanda"
    ],
    "topNotes": [
      "Notas marinas",
      "Aquozone",
      "Bergamota",
      "Mandarina verde"
    ],
    "middleNotes": [
      "Romero",
      "Lavanda",
      "Ciprés",
      "Almáciga"
    ],
    "baseNotes": [
      "Notas minerales",
      "Almizcle",
      "Pachulí",
      "Ámbar"
    ],
    "mainNotes": [
      "Notas marinas",
      "Romero",
      "Notas minerales",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Desde notas marinas, aquozone y bergamota avanza hacia romero, lavanda y ciprés y cierra apoyado en notas minerales, almizcle y pachulí. El resultado es un perfil acuático, aromático y cítrico.",
    "likeIf": [
      "Disfrutás perfiles que van de notas marinas hacia romero",
      "Buscás una composición que termine en notas minerales y almizcle",
      "Te atraen los acordes de marino y aromático"
    ]
  },
  "giorgio-armani-acqua-di-gio-profumo": {
    "family": "acuatico",
    "families": [
      "acuatico",
      "aromatico-limpio",
      "cuero-ahumado"
    ],
    "accords": [
      "Aromático",
      "Marino",
      "Especiado fresco",
      "Ámbar",
      "Amaderado",
      "Ahumado"
    ],
    "topNotes": [
      "Notas marinas",
      "Bergamota"
    ],
    "middleNotes": [
      "Romero",
      "Salvia",
      "Geranio"
    ],
    "baseNotes": [
      "Incienso",
      "Pachulí"
    ],
    "mainNotes": [
      "Notas marinas",
      "Romero",
      "Incienso",
      "Pachulí"
    ],
    "occasions": [
      "trabajo",
      "versatil",
      "noche"
    ],
    "seasons": [
      "todo-el-ano"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Un acuático con sombra: la base de incienso y pachulí le saca el costado deportivo y lo vuelve más serio.",
    "likeIf": [
      "Te gustan los acuáticos pero querés algo más adulto",
      "Buscás algo elegante para el día",
      "Te atrae el incienso"
    ]
  },
  "giorgio-armani-acqua-di-gioia": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "aromatico-limpio",
      "floral"
    ],
    "accords": [
      "Cítrico",
      "Aromático",
      "Verde",
      "Floral blanco",
      "Especiado fresco",
      "Amaderado",
      "Fresco"
    ],
    "topNotes": [
      "Limón de Amalfi",
      "Menta"
    ],
    "middleNotes": [
      "Jazmín acuático"
    ],
    "baseNotes": [
      "Cedro de Virginia",
      "Azúcar moreno",
      "Labdanum de Francia"
    ],
    "mainNotes": [
      "Limón de Amalfi",
      "Jazmín acuático",
      "Cedro de Virginia",
      "Azúcar moreno"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Limón de Amalfi y menta en la salida, jazmín acuático en el corazón y cedro de Virginia, azúcar moreno y labdanum de Francia en el fondo. El perfil cruza lo cítrico con lo aromático.",
    "likeIf": [
      "Te atrae el contraste entre limón de Amalfi y un corazón de jazmín acuático",
      "Preferís que el final quede en cedro de Virginia y azúcar moreno",
      "Querés explorar lo verde junto a lo floral blanco"
    ]
  },
  "giorgio-armani-armani-code": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "cuero-ahumado",
      "especiado"
    ],
    "accords": [
      "Cítrico",
      "Cuero",
      "Anís",
      "Especiado suave",
      "Floral",
      "Tabaco",
      "Dulce",
      "Aromático",
      "Vainilla",
      "Animálico"
    ],
    "topNotes": [
      "Limón",
      "Bergamota"
    ],
    "middleNotes": [
      "Anís estrellado",
      "Flor de olivo",
      "Madera de guayaco"
    ],
    "baseNotes": [
      "Cuero",
      "Haba tonka",
      "Tabaco"
    ],
    "mainNotes": [
      "Limón",
      "Anís estrellado",
      "Cuero",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Empieza con limón y bergamota. En el corazón hay anís estrellado, flor de olivo y madera de guayaco, y el fondo reúne cuero, haba tonka y tabaco. Queda en un registro cítrico y especiado.",
    "likeIf": [
      "Te gustan las aperturas de limón que pasan a anís estrellado",
      "Te llaman la atención los fondos de cuero y haba tonka",
      "Te gusta la combinación de especiado suave y floral"
    ]
  },
  "giorgio-armani-armani-code-absolut": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "citrico-fresco"
    ],
    "accords": [
      "Vainilla",
      "Empolvado",
      "Dulce",
      "Especiado fresco",
      "Cítrico",
      "Cuero",
      "Ámbar",
      "Almizclado",
      "Amaderado"
    ],
    "topNotes": [
      "Mandarina verde",
      "Manzana"
    ],
    "middleNotes": [
      "Nuez moscada",
      "Azahar",
      "Semillas de zanahoria"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Gamuza",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Mandarina verde",
      "Nuez moscada",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Sale con mandarina verde y manzana, se acomoda en nuez moscada, azahar y semillas de zanahoria y se queda en vainilla, haba tonka y gamuza. El conjunto es dulce, especiado y cítrico.",
    "likeIf": [
      "Te atrae el contraste entre mandarina verde y un corazón de nuez moscada",
      "Te llaman la atención los fondos de vainilla y gamuza",
      "Te gusta la combinación de dulce y especiado fresco"
    ]
  },
  "giorgio-armani-armani-code-profumo": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "gourmand-dulce",
      "especiado"
    ],
    "accords": [
      "Ámbar",
      "Vainilla",
      "Especiado cálido",
      "Aromático",
      "Cuero",
      "Especiado fresco",
      "Dulce",
      "Animálico",
      "Cítrico",
      "Lavanda"
    ],
    "topNotes": [
      "Cardamomo",
      "Manzana verde",
      "Mandarina verde"
    ],
    "middleNotes": [
      "Nuez moscada",
      "Lavanda",
      "Azahar"
    ],
    "baseNotes": [
      "Haba tonka",
      "Ámbar",
      "Cuero"
    ],
    "mainNotes": [
      "Cardamomo",
      "Nuez moscada",
      "Haba tonka",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Cardamomo, manzana verde y mandarina verde en la salida, nuez moscada, lavanda y azahar en el corazón y haba tonka, ámbar y cuero en el fondo. El conjunto es ambarado, dulce y especiado.",
    "likeIf": [
      "Te atrae el contraste entre cardamomo y un corazón de nuez moscada",
      "Preferís que el final quede en haba tonka y ámbar",
      "Te gusta la combinación de especiado cálido y aromático"
    ]
  },
  "giorgio-armani-because-its-you": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Frutal",
      "Dulce",
      "Rosa",
      "Vainilla",
      "Cítrico",
      "Empolvado",
      "Almizclado",
      "Ámbar",
      "Amaderado",
      "Floral"
    ],
    "topNotes": [
      "Frambuesa",
      "Limón",
      "Neroli"
    ],
    "middleNotes": [
      "Rosa"
    ],
    "baseNotes": [
      "Vainilla",
      "Almizcle",
      "Amberwood"
    ],
    "mainNotes": [
      "Frambuesa",
      "Rosa",
      "Vainilla",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Desde frambuesa, limón y neroli avanza hacia rosa y cierra apoyado en vainilla, almizcle y amberwood. El conjunto es dulce, floral y cítrico.",
    "likeIf": [
      "Te atrae el contraste entre frambuesa y un corazón de rosa",
      "Te gusta la combinación de vainilla y cítrico",
      "Querés explorar lo frutal junto a lo dulce"
    ]
  },
  "giorgio-armani-stronger-with-you": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "aromatico-limpio"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Balsámico",
      "Avellanado",
      "Aromático",
      "Lavanda",
      "Empolvado"
    ],
    "topNotes": [
      "Castaña",
      "Azúcar"
    ],
    "middleNotes": [
      "Salvia",
      "Lavanda"
    ],
    "baseNotes": [
      "Vainilla",
      "Humo"
    ],
    "mainNotes": [
      "Castaña",
      "Azúcar",
      "Salvia",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "envolvente",
    "feel": "Dulce de castaña y vainilla con salvia y lavanda que lo mantienen del lado aromático. Cálido y envolvente.",
    "likeIf": [
      "Te gustan los dulces cremosos",
      "Buscás algo cálido",
      "Querés un perfume abrazable"
    ]
  },
  "giorgio-armani-stronger-with-you-intensely": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "ambarado-intenso",
      "especiado"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Ámbar",
      "Canela",
      "Especiado cálido",
      "Empolvado",
      "Aromático",
      "Especiado suave",
      "Caramelo"
    ],
    "topNotes": [
      "Pimienta rosa",
      "Enebro",
      "Violeta"
    ],
    "middleNotes": [
      "Toffee",
      "Canela",
      "Lavanda",
      "Salvia"
    ],
    "baseNotes": [
      "Vainilla",
      "Ámbar",
      "Haba tonka",
      "Gamuza"
    ],
    "mainNotes": [
      "Pimienta rosa",
      "Toffee",
      "Vainilla",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Pimienta rosa, enebro y violeta en la salida, toffee, canela y lavanda en el corazón y vainilla, ámbar y haba tonka en el fondo. El conjunto es dulce, ambarado y especiado.",
    "likeIf": [
      "Te atrae el contraste entre pimienta rosa y un corazón de toffee",
      "Preferís que el final quede en vainilla y ámbar",
      "Querés explorar lo dulce con carácter ambarado"
    ]
  },
  "givenchy-amarige": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Floral blanco",
      "Dulce",
      "Floral amarillo",
      "Amaderado",
      "Empolvado",
      "Floral",
      "Frutal",
      "Nardo",
      "Animálico"
    ],
    "topNotes": [
      "Azahar",
      "Durazno",
      "Ciruela",
      "Neroli",
      "Palo de rosa de Brasil",
      "Violeta",
      "Mandarina"
    ],
    "middleNotes": [
      "Nardo",
      "Mimosa",
      "Gardenia",
      "Ylang ylang",
      "Jazmín",
      "Acacia blanca",
      "Clavel",
      "Grosella negra",
      "Frutos rojos",
      "Rosa",
      "Casia",
      "Orquídea"
    ],
    "baseNotes": [
      "Sándalo",
      "Notas amaderadas",
      "Ámbar",
      "Vainilla",
      "Almizcle",
      "Haba tonka",
      "Cedro"
    ],
    "mainNotes": [
      "Azahar",
      "Nardo",
      "Sándalo",
      "Notas amaderadas"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Empieza con azahar, durazno y ciruela. En el corazón hay nardo, mimosa y gardenia, y el fondo reúne sándalo, notas amaderadas y ámbar. Entre sus acordes principales figuran floral blanco y dulce.",
    "likeIf": [
      "Te llama la atención el paso de azahar a nardo",
      "Querés un cierre de sándalo y notas amaderadas",
      "Te gusta la combinación de floral blanco y dulce"
    ]
  },
  "givenchy-ange-ou-demon": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "floral"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Especiado cálido",
      "Floral blanco",
      "Aromático",
      "Amaderado",
      "Floral amarillo",
      "Metálico",
      "Especiado suave",
      "Balsámico"
    ],
    "topNotes": [
      "Azafrán",
      "Tomillo",
      "Mandarina"
    ],
    "middleNotes": [
      "Lirio",
      "Ylang ylang",
      "Orquídea"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Palo de rosa de Brasil",
      "Musgo de roble"
    ],
    "mainNotes": [
      "Azafrán",
      "Lirio",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "La salida es de azafrán, tomillo y mandarina; el centro se arma con lirio, ylang ylang y orquídea; el fondo descansa en vainilla, haba tonka y palo de rosa de Brasil. Es una composición dulce, especiada y floral.",
    "likeIf": [
      "Te llama la atención el paso de azafrán a lirio",
      "Querés un cierre de vainilla y haba tonka",
      "Preferís perfiles donde aparecen dulce y especiado cálido"
    ]
  },
  "givenchy-gentleman-only": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "citrico-fresco",
      "cuero-ahumado"
    ],
    "accords": [
      "Amaderado",
      "Cítrico",
      "Ahumado",
      "Aromático",
      "Almizclado",
      "Especiado fresco",
      "Terroso",
      "Ámbar",
      "Cuero",
      "Balsámico"
    ],
    "topNotes": [
      "Pimienta rosa",
      "Mandarina verde",
      "Hoja de abedul",
      "Nuez moscada",
      "Bergamota"
    ],
    "middleNotes": [
      "Vetiver",
      "Cedro",
      "Pachulí",
      "Hoja de violeta",
      "Elemí"
    ],
    "baseNotes": [
      "Incienso",
      "Almizcle"
    ],
    "mainNotes": [
      "Pimienta rosa",
      "Vetiver",
      "Incienso",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La salida es de pimienta rosa, mandarina verde y hoja de abedul; el centro se arma con vetiver, cedro y pachulí; el fondo descansa en incienso y almizcle. Queda en un registro amaderado, cítrico y ahumado.",
    "likeIf": [
      "Te gustan las aperturas de pimienta rosa que pasan a vetiver",
      "Te llaman la atención los fondos de incienso y almizcle",
      "Preferís perfiles donde aparecen ahumado y aromático"
    ]
  },
  "givenchy-gentleman-reserve-privee": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "floral",
      "ambarado-intenso"
    ],
    "accords": [
      "Amaderado",
      "Iris",
      "Whisky",
      "Empolvado",
      "Ámbar",
      "Violeta",
      "Especiado cálido",
      "Terroso",
      "Avellanado"
    ],
    "topNotes": [
      "Bergamota"
    ],
    "middleNotes": [
      "Iris",
      "Castaña"
    ],
    "baseNotes": [
      "Whisky",
      "Notas amaderadas",
      "Ámbar"
    ],
    "mainNotes": [
      "Bergamota",
      "Iris",
      "Whisky",
      "Notas amaderadas"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La salida es de bergamota; el centro se arma con iris y castaña; el fondo descansa en whisky, notas amaderadas y ámbar. La composición combina un registro amaderado y ambarado.",
    "likeIf": [
      "Te gustan las aperturas de bergamota que pasan a iris",
      "Te llaman la atención los fondos de whisky y notas amaderadas",
      "Preferís un perfil amaderado con un matiz ambarado"
    ]
  },
  "givenchy-gentleman-society": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "amaderado",
      "gourmand-dulce"
    ],
    "accords": [
      "Aromático",
      "Amaderado",
      "Vainilla",
      "Especiado cálido",
      "Floral amarillo",
      "Herbal",
      "Verde",
      "Especiado suave",
      "Empolvado",
      "Terroso"
    ],
    "topNotes": [
      "Cardamomo",
      "Salvia"
    ],
    "middleNotes": [
      "Narciso de Francia",
      "Vetiver de Haití",
      "Vetiver de Madagascar"
    ],
    "baseNotes": [
      "Vainilla",
      "Palo santo",
      "Cedro"
    ],
    "mainNotes": [
      "Cardamomo",
      "Narciso de Francia",
      "Vainilla",
      "Palo santo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Arranca con cardamomo y salvia, pasa por narciso de Francia, vetiver de Haití y vetiver de Madagascar y termina sobre vainilla, palo santo y cedro. Queda en un registro aromático y amaderado.",
    "likeIf": [
      "Te gustan las aperturas de cardamomo que pasan a narciso de Francia",
      "Te llaman la atención los fondos de vainilla y palo santo",
      "Querés explorar lo floral amarillo junto a lo herbal"
    ]
  },
  "givenchy-irresistible": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "acuatico"
    ],
    "accords": [
      "Almizclado",
      "Rosa",
      "Frutal",
      "Empolvado",
      "Floral",
      "Dulce",
      "Iris",
      "Acuático",
      "Amaderado",
      "Fresco"
    ],
    "topNotes": [
      "Pera",
      "Ambreta"
    ],
    "middleNotes": [
      "Rosa",
      "Iris"
    ],
    "baseNotes": [
      "Almizcle",
      "Cedro de Virginia"
    ],
    "mainNotes": [
      "Pera",
      "Rosa",
      "Almizcle",
      "Cedro de Virginia"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Pera y ambreta en la salida, rosa y iris en el corazón y almizcle y cedro de Virginia en el fondo. El conjunto es floral, dulce y acuático.",
    "likeIf": [
      "Te gusta la combinación de almizclado y rosa",
      "Preferís que el final quede en almizcle y cedro de Virginia",
      "Te gusta la combinación de frutal y empolvado"
    ]
  },
  "givenchy-linterdit": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "citrico-fresco"
    ],
    "accords": [
      "Floral blanco",
      "Nardo",
      "Dulce",
      "Cítrico",
      "Amaderado",
      "Pachulí",
      "Vainilla",
      "Frutal",
      "Animálico"
    ],
    "topNotes": [
      "Pera",
      "Bergamota"
    ],
    "middleNotes": [
      "Nardo",
      "Azahar",
      "Jazmín sambac"
    ],
    "baseNotes": [
      "Pachulí",
      "Vainilla",
      "Ambroxan",
      "Vetiver"
    ],
    "mainNotes": [
      "Pera",
      "Nardo",
      "Pachulí",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Pera y bergamota para abrir, un corazón de nardo y azahar, y un fondo de pachulí y vainilla. Floral blanco arriba y oscuro abajo: el contraste es toda la idea.",
    "likeIf": [
      "Te gusta el nardo",
      "Buscás un floral blanco con fondo de pachulí",
      "Preferís que un floral tenga algo turbio debajo"
    ]
  },
  "givenchy-linterdit-rouge": {
    "family": "floral",
    "families": [
      "floral",
      "amaderado",
      "citrico-fresco"
    ],
    "accords": [
      "Floral blanco",
      "Amaderado",
      "Nardo",
      "Cítrico",
      "Especiado cálido",
      "Especiado fresco",
      "Pachulí",
      "Fresco",
      "Terroso",
      "Empolvado"
    ],
    "topNotes": [
      "Jengibre",
      "Naranja sanguina"
    ],
    "middleNotes": [
      "Nardo",
      "Jazmín",
      "Hoja de pimienta de Jamaica"
    ],
    "baseNotes": [
      "Sándalo",
      "Pachulí",
      "Vetiver"
    ],
    "mainNotes": [
      "Jengibre",
      "Nardo",
      "Sándalo",
      "Pachulí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Empieza con jengibre y naranja sanguina. En el corazón hay nardo, jazmín y hoja de pimienta de Jamaica, y el fondo reúne sándalo, pachulí y vetiver. Queda en un registro floral, amaderado y cítrico.",
    "likeIf": [
      "Te gustan las aperturas de jengibre que pasan a nardo",
      "Te llaman la atención los fondos de sándalo y pachulí",
      "Preferís perfiles donde aparecen floral blanco y amaderado"
    ]
  },
  "givenchy-very-irresistible": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "aromatico-limpio"
    ],
    "accords": [
      "Rosa",
      "Floral",
      "Fresco",
      "Cítrico",
      "Aromático"
    ],
    "topNotes": [
      "Casia",
      "Verbena de limón",
      "Anís estrellado"
    ],
    "middleNotes": [
      "Rosa",
      "Peonía",
      "Magnolia"
    ],
    "baseNotes": [
      "Rosa de Taif",
      "Almizcle",
      "Vainilla",
      "Pachulí"
    ],
    "mainNotes": [
      "Casia",
      "Rosa",
      "Rosa de Taif",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Empieza con casia, verbena de limón y anís estrellado. En el corazón hay rosa, peonía y magnolia, y el fondo reúne rosa de Taif, almizcle y vainilla. La composición combina un registro floral y cítrico.",
    "likeIf": [
      "Te gustan las aperturas de casia que pasan a rosa",
      "Te llaman la atención los fondos de rosa de Taif y almizcle",
      "Querés explorar lo fresco junto a lo cítrico"
    ]
  },
  "gucci-guilty-black": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "aromatico-limpio",
      "floral"
    ],
    "accords": [
      "Verde",
      "Aromático",
      "Floral blanco",
      "Lavanda",
      "Amaderado",
      "Cítrico",
      "Pachulí",
      "Especiado fresco",
      "Herbal",
      "Especiado suave"
    ],
    "topNotes": [
      "Lavanda",
      "Cilantro verde"
    ],
    "middleNotes": [
      "Notas verdes",
      "Azahar",
      "Neroli"
    ],
    "baseNotes": [
      "Cedro",
      "Pachulí"
    ],
    "mainNotes": [
      "Lavanda",
      "Notas verdes",
      "Cedro",
      "Pachulí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Empieza con lavanda y cilantro verde. En el corazón hay notas verdes, azahar y neroli, y el fondo reúne cedro y pachulí. Queda en un registro cítrico, aromático y floral.",
    "likeIf": [
      "Te gustan las aperturas de lavanda que pasan a notas verdes",
      "Te llaman la atención los fondos de cedro y pachulí",
      "Preferís perfiles donde aparecen verde y aromático"
    ]
  },
  "guerlain-acqua-alegoria": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "especiado",
      "aromatico-limpio"
    ],
    "accords": [
      "Cítrico",
      "Especiado fresco",
      "Verde",
      "Aromático",
      "Fresco",
      "Dulce"
    ],
    "topNotes": [
      "Clementina",
      "Naranja amarga",
      "Azahar",
      "Té verde",
      "Hiedra"
    ],
    "middleNotes": [
      "Mandarina",
      "Albahaca",
      "Manzanilla",
      "Peonía"
    ],
    "baseNotes": [
      "Sándalo",
      "Ámbar"
    ],
    "mainNotes": [
      "Clementina",
      "Mandarina",
      "Sándalo",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Clementina y naranja amarga arriba, mandarina y albahaca en el centro, sándalo y ámbar abajo. La albahaca sobre el cítrico es toda la idea: verde, fresco, de cocina.",
    "likeIf": [
      "Te gusta la albahaca con mandarina",
      "Buscás un cítrico verde y aromático",
      "Preferís algo fresco y sin peso"
    ]
  },
  "hugo-boss-boss-bottled": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "gourmand-dulce",
      "especiado"
    ],
    "accords": [
      "Amaderado",
      "Frutal",
      "Vainilla",
      "Especiado cálido",
      "Canela",
      "Aromático",
      "Cítrico",
      "Empolvado",
      "Fresco",
      "Verde"
    ],
    "topNotes": [
      "Manzana",
      "Ciruela",
      "Bergamota",
      "Limón",
      "Musgo de roble",
      "Geranio"
    ],
    "middleNotes": [
      "Canela",
      "Caoba",
      "Clavel"
    ],
    "baseNotes": [
      "Vainilla",
      "Sándalo",
      "Cedro",
      "Vetiver",
      "Olivo"
    ],
    "mainNotes": [
      "Manzana",
      "Canela",
      "Vainilla",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Al principio manzana, ciruela y bergamota. Más adelante entran canela, caoba y clavel, y el fondo termina en vainilla, sándalo y cedro. La composición combina un registro amaderado y especiado.",
    "likeIf": [
      "Te gustan las aperturas de manzana que pasan a canela",
      "Te llaman la atención los fondos de vainilla y sándalo",
      "Preferís perfiles donde aparecen amaderado y frutal"
    ]
  },
  "hugo-boss-boss-the-scent-elixir": {
    "family": "especiado",
    "families": [
      "especiado",
      "aromatico-limpio",
      "amaderado"
    ],
    "accords": [
      "Especiado cálido",
      "Lavanda",
      "Amaderado",
      "Aromático",
      "Empolvado",
      "Fresco",
      "Especiado fresco"
    ],
    "topNotes": [
      "Pimiento rojo"
    ],
    "middleNotes": [
      "Lavanda"
    ],
    "baseNotes": [
      "Sándalo"
    ],
    "mainNotes": [
      "Pimiento rojo",
      "Lavanda",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Pimiento rojo en la salida, lavanda en el corazón y sándalo en el fondo. Se apoya en acordes de especiado cálido y lavanda.",
    "likeIf": [
      "Disfrutás perfiles que van de pimiento rojo hacia lavanda",
      "Buscás una composición que termine en sándalo",
      "Preferís perfiles donde aparecen empolvado y fresco"
    ]
  },
  "hugo-boss-bottled-elixir": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "ambarado-intenso",
      "especiado"
    ],
    "accords": [
      "Amaderado",
      "Ámbar",
      "Especiado cálido",
      "Aromático",
      "Pachulí",
      "Terroso",
      "Balsámico",
      "Especiado fresco"
    ],
    "topNotes": [
      "Olíbano",
      "Cardamomo"
    ],
    "middleNotes": [
      "Pachulí",
      "Vetiver"
    ],
    "baseNotes": [
      "Labdanum",
      "Cedro"
    ],
    "mainNotes": [
      "Olíbano",
      "Pachulí",
      "Labdanum",
      "Cedro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Empieza con olíbano y cardamomo. En el corazón hay pachulí y vetiver, y el fondo reúne labdanum y cedro. La composición combina un registro amaderado y ambarado.",
    "likeIf": [
      "Te gustan las aperturas de olíbano que pasan a pachulí",
      "Te llaman la atención los fondos de labdanum y cedro",
      "Preferís perfiles donde aparecen amaderado y ámbar"
    ]
  },
  "hugo-boss-bottled-night": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "floral",
      "aromatico-limpio"
    ],
    "accords": [
      "Amaderado",
      "Violeta",
      "Empolvado",
      "Lavanda",
      "Cuero",
      "Almizclado",
      "Ahumado",
      "Floral",
      "Aromático",
      "Especiado fresco"
    ],
    "topNotes": [
      "Lavanda",
      "Abedul"
    ],
    "middleNotes": [
      "Violeta"
    ],
    "baseNotes": [
      "Notas amaderadas",
      "Almizcle"
    ],
    "mainNotes": [
      "Lavanda",
      "Violeta",
      "Notas amaderadas",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Desde lavanda y abedul avanza hacia violeta y cierra apoyado en notas amaderadas y almizcle. El resultado es un perfil amaderado, floral y aromático.",
    "likeIf": [
      "Disfrutás perfiles que van de lavanda hacia violeta",
      "Buscás una composición que termine en notas amaderadas y almizcle",
      "Buscás algo amaderado donde lo floral tenga peso"
    ]
  },
  "hugo-boss-hugo-boss": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "especiado",
      "citrico-fresco"
    ],
    "accords": [
      "Aromático",
      "Especiado fresco",
      "Verde",
      "Amaderado",
      "Fresco",
      "Frutal",
      "Lavanda",
      "Herbal",
      "Cítrico"
    ],
    "topNotes": [
      "Manzana verde",
      "Lavanda",
      "Menta",
      "Pomelo",
      "Albahaca"
    ],
    "middleNotes": [
      "Salvia",
      "Geranio",
      "Clavel",
      "Jazmín"
    ],
    "baseNotes": [
      "Abeto",
      "Cedro",
      "Pachulí"
    ],
    "mainNotes": [
      "Manzana verde",
      "Salvia",
      "Abeto",
      "Cedro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Manzana verde, lavanda y menta arriba; salvia y geranio en el centro; abeto, cedro y pachulí abajo. Verde y aromático de punta a punta, con la fruta apenas insinuada.",
    "likeIf": [
      "Te gusta la manzana verde en un perfume masculino",
      "Buscás algo herbal antes que amaderado",
      "Preferís un fondo de abeto y cedro"
    ]
  },
  "issey-miyake-leau-dissey-femenino": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "acuatico"
    ],
    "accords": [
      "Floral",
      "Fresco",
      "Floral blanco",
      "Ozónico",
      "Acuático",
      "Rosa"
    ],
    "topNotes": [
      "Loto",
      "Melón",
      "Fresia",
      "Agua de rosas",
      "Rosa",
      "Calone",
      "Ciclamen"
    ],
    "middleNotes": [
      "Muguet",
      "Lirio",
      "Peonía acuática",
      "Clavel"
    ],
    "baseNotes": [
      "Almizcle",
      "Nardo",
      "Maderas exóticas",
      "Osmanto",
      "Cedro",
      "Sándalo",
      "Ámbar"
    ],
    "mainNotes": [
      "Loto",
      "Muguet",
      "Almizcle",
      "Nardo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "La salida es de loto, melón y fresia; el centro se arma con muguet, lirio y peonía acuática; el fondo descansa en almizcle, nardo y maderas exóticas. La composición combina un registro floral y acuático.",
    "likeIf": [
      "Te gustan las aperturas de loto que pasan a muguet",
      "Te llaman la atención los fondos de almizcle y nardo",
      "Preferís perfiles donde aparecen floral y fresco"
    ]
  },
  "issey-miyake-leau-dissey-masculino": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "aromatico-limpio",
      "especiado"
    ],
    "accords": [
      "Cítrico",
      "Aromático",
      "Especiado fresco",
      "Amaderado",
      "Floral",
      "Verde"
    ],
    "topNotes": [
      "Yuzu",
      "Limón",
      "Bergamota",
      "Verbena de limón",
      "Mandarina",
      "Ciprés",
      "Calone",
      "Cilantro",
      "Salvia",
      "Estragón"
    ],
    "middleNotes": [
      "Loto azul",
      "Muguet",
      "Nuez moscada",
      "Geranio Bourbon",
      "Azafrán",
      "Canela de Ceilán",
      "Reseda"
    ],
    "baseNotes": [
      "Vetiver de Tahití",
      "Almizcle",
      "Cedro",
      "Sándalo",
      "Ámbar",
      "Tabaco"
    ],
    "mainNotes": [
      "Yuzu",
      "Loto azul",
      "Vetiver de Tahití",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Yuzu, limón y bergamota para abrir; loto azul y nuez moscada en el centro; vetiver de Tahití y almizcle en el fondo. Cítrico y aromático, con un centro especiado que lo saca de lo puramente fresco.",
    "likeIf": [
      "Buscás un cítrico con un centro especiado",
      "Te llama la atención el loto azul en un perfume masculino",
      "Querés un fondo de vetiver y almizcle, sin peso"
    ]
  },
  "j-del-pozo-halloween": {
    "family": "floral",
    "families": [
      "floral",
      "acuatico",
      "citrico-fresco"
    ],
    "accords": [
      "Violeta",
      "Empolvado",
      "Marino",
      "Floral",
      "Verde",
      "Aromático",
      "Fresco",
      "Floral blanco",
      "Amaderado",
      "Ámbar"
    ],
    "topNotes": [
      "Violeta",
      "Notas marinas",
      "Hoja de banano",
      "Petitgrain"
    ],
    "middleNotes": [
      "Violeta",
      "Magnolia",
      "Muguet",
      "Nardo",
      "Pimienta"
    ],
    "baseNotes": [
      "Incienso",
      "Sándalo",
      "Vainilla de Madagascar",
      "Mirra"
    ],
    "mainNotes": [
      "Violeta",
      "Incienso",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Primero violeta, notas marinas y hoja de banano. Después violeta, magnolia y muguet. Al final, incienso, sándalo y vainilla de Madagascar. El resultado es un perfil floral y acuático.",
    "likeIf": [
      "Te gusta la combinación de violeta y empolvado",
      "Buscás una composición que termine en incienso y sándalo",
      "Preferís perfiles donde aparecen marino y floral"
    ]
  },
  "jean-paul-gaultier-divine": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "acuatico"
    ],
    "accords": [
      "Floral blanco",
      "Dulce",
      "Acuático",
      "Marino",
      "Aromático",
      "Empolvado",
      "Floral amarillo",
      "Salado",
      "Almizclado",
      "Amaderado"
    ],
    "topNotes": [
      "Calypsone",
      "Bergamota",
      "Frutos rojos"
    ],
    "middleNotes": [
      "Lirio",
      "Ylang ylang",
      "Jazmín"
    ],
    "baseNotes": [
      "Merengue",
      "Almizcle",
      "Pachulí"
    ],
    "mainNotes": [
      "Calypsone",
      "Lirio",
      "Merengue",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Calypsone, bergamota y frutos rojos en la salida, lirio, ylang ylang y jazmín en el corazón y merengue, almizcle y pachulí en el fondo. El resultado es un perfil floral, dulce y acuático.",
    "likeIf": [
      "Disfrutás perfiles que van de calypsone hacia lirio",
      "Buscás una composición que termine en merengue y almizcle",
      "Te atrae un perfil acuático con un matiz salado"
    ]
  },
  "jean-paul-gaultier-le-beau": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "citrico-fresco",
      "aromatico-limpio"
    ],
    "accords": [
      "Coco",
      "Vainilla",
      "Dulce",
      "Cítrico",
      "Lactónico",
      "Aromático",
      "Ámbar",
      "Tropical",
      "Especiado fresco"
    ],
    "topNotes": [
      "Bergamota"
    ],
    "middleNotes": [
      "Coco"
    ],
    "baseNotes": [
      "Haba tonka"
    ],
    "mainNotes": [
      "Bergamota",
      "Coco",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La apertura es de bergamota. Después llega el turno de coco, y el final queda en haba tonka. El resultado es un perfil dulce, cítrico y aromático.",
    "likeIf": [
      "Disfrutás perfiles que van de bergamota hacia coco",
      "Buscás una composición que termine en haba tonka",
      "Preferís perfiles donde aparecen lactónico y aromático"
    ]
  },
  "jean-paul-gaultier-le-male": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "gourmand-dulce",
      "especiado"
    ],
    "accords": [
      "Aromático",
      "Vainilla",
      "Fresco",
      "Especiado",
      "Lavanda",
      "Empolvado",
      "Ámbar"
    ],
    "topNotes": [
      "Lavanda",
      "Menta",
      "Cardamomo",
      "Bergamota",
      "Artemisa"
    ],
    "middleNotes": [
      "Canela",
      "Azahar",
      "Alcaravea"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Ámbar",
      "Sándalo",
      "Cedro"
    ],
    "mainNotes": [
      "Lavanda",
      "Menta",
      "Canela",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [
      "versatil"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Menta y lavanda en la salida, canela en el corazón y vainilla en el fondo. El conjunto es aromático y especiado.",
    "likeIf": [
      "Te gustan las aperturas de lavanda y menta",
      "Te atraen los acordes de aromático y especiado",
      "Buscás una composición que termine en vainilla y haba tonka"
    ]
  },
  "jean-paul-gaultier-le-male-elixir": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "ambarado-intenso",
      "cuero-ahumado"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Miel",
      "Aromático",
      "Ámbar",
      "Lavanda",
      "Tabaco"
    ],
    "topNotes": [
      "Lavanda",
      "Menta"
    ],
    "middleNotes": [
      "Vainilla",
      "Benjuí"
    ],
    "baseNotes": [
      "Miel",
      "Haba tonka",
      "Tabaco"
    ],
    "mainNotes": [
      "Miel",
      "Vainilla",
      "Haba tonka",
      "Tabaco"
    ],
    "occasions": [
      "noche",
      "cita"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "La versión más golosa y densa de la familia Le Male: miel, vainilla y tabaco sobre el esqueleto de lavanda y menta.",
    "likeIf": [
      "Te gustan los perfumes dulces e intensos",
      "Buscás algo para la noche",
      "Querés algo cálido y envolvente"
    ]
  },
  "jean-paul-gaultier-le-male-parfum": {
    "family": "especiado",
    "families": [
      "especiado",
      "gourmand-dulce",
      "aromatico-limpio"
    ],
    "accords": [
      "Especiado cálido",
      "Vainilla",
      "Lavanda",
      "Aromático",
      "Empolvado",
      "Iris",
      "Amaderado",
      "Ámbar",
      "Violeta"
    ],
    "topNotes": [
      "Cardamomo"
    ],
    "middleNotes": [
      "Lavanda",
      "Iris"
    ],
    "baseNotes": [
      "Vainilla",
      "Notas orientales",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Cardamomo",
      "Lavanda",
      "Vainilla",
      "Notas orientales"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Sale con cardamomo, se acomoda en lavanda y iris y se queda en vainilla, notas orientales y notas amaderadas. El conjunto es especiado y aromático.",
    "likeIf": [
      "Te atrae el contraste entre cardamomo y un corazón de lavanda",
      "Preferís que el final quede en vainilla y notas orientales",
      "Te atraen los acordes de especiado cálido y aromático"
    ]
  },
  "jean-paul-gaultier-paradise-garden": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Verde",
      "Coco",
      "Dulce",
      "Vainilla",
      "Amaderado",
      "Acuático",
      "Aromático",
      "Frutal",
      "Especiado fresco",
      "Fresco"
    ],
    "topNotes": [
      "Notas verdes",
      "Notas acuáticas",
      "Menta",
      "Jengibre"
    ],
    "middleNotes": [
      "Coco",
      "Higo",
      "Sal"
    ],
    "baseNotes": [
      "Haba tonka",
      "Sándalo"
    ],
    "mainNotes": [
      "Notas verdes",
      "Coco",
      "Haba tonka",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Primero notas verdes, notas acuáticas y menta. Después coco, higo y sal. Al final, haba tonka y sándalo. El resultado es un perfil dulce y amaderado.",
    "likeIf": [
      "Disfrutás perfiles que van de notas verdes hacia coco",
      "Buscás una composición que termine en haba tonka y sándalo",
      "Te gusta la combinación de vainilla y amaderado"
    ]
  },
  "jean-paul-gaultier-scandal-femenino": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Miel",
      "Dulce",
      "Floral blanco",
      "Cítrico",
      "Caramelo"
    ],
    "topNotes": [
      "Naranja sanguina",
      "Mandarina"
    ],
    "middleNotes": [
      "Miel",
      "Gardenia",
      "Azahar",
      "Jazmín",
      "Durazno"
    ],
    "baseNotes": [
      "Cera de abejas",
      "Caramelo",
      "Pachulí",
      "Regaliz"
    ],
    "mainNotes": [
      "Miel",
      "Gardenia",
      "Caramelo",
      "Pachulí"
    ],
    "occasions": [
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "envolvente",
    "feel": "Miel y caramelo con gardenia. Es denso, dulce y de carácter muy marcado.",
    "likeIf": [
      "Te gusta la miel en perfumería",
      "Buscás un dulce de carácter marcado",
      "Preferís los dulces densos"
    ]
  },
  "jean-paul-gaultier-scandal-gold": {
    "family": "especiado",
    "families": [
      "especiado",
      "amaderado",
      "cuero-ahumado"
    ],
    "accords": [
      "Especiado cálido",
      "Amaderado",
      "Cuero",
      "Terroso",
      "Miel",
      "Pachulí",
      "Animálico",
      "Floral",
      "Floral blanco",
      "Dulce"
    ],
    "topNotes": [
      "Miel",
      "Azafrán",
      "Cardamomo"
    ],
    "middleNotes": [
      "Cypriol (nagarmotha)",
      "Jazmín sambac",
      "Rosa"
    ],
    "baseNotes": [
      "Cuero",
      "Pachulí",
      "Sándalo"
    ],
    "mainNotes": [
      "Miel",
      "Cypriol (nagarmotha)",
      "Cuero",
      "Pachulí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Desde miel, azafrán y cardamomo avanza hacia cypriol (nagarmotha), jazmín sambac y rosa y cierra apoyado en cuero, pachulí y sándalo. Se apoya en acordes de especiado cálido y amaderado.",
    "likeIf": [
      "Disfrutás perfiles que van de miel hacia cypriol (nagarmotha)",
      "Buscás una composición que termine en cuero y pachulí",
      "Te gusta la combinación de animálico y floral"
    ]
  },
  "jean-paul-gaultier-scandal-le-parfum": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "acuatico"
    ],
    "accords": [
      "Caramelo",
      "Vainilla",
      "Floral blanco",
      "Dulce",
      "Salado",
      "Empolvado",
      "Balsámico"
    ],
    "topNotes": [
      "Jazmín"
    ],
    "middleNotes": [
      "Caramelo",
      "Sal"
    ],
    "baseNotes": [
      "Vainilla"
    ],
    "mainNotes": [
      "Jazmín",
      "Caramelo",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Abre con jazmín. El corazón suma caramelo y sal y el fondo se asienta en vainilla. Entre sus acordes principales figuran caramelo y vainilla.",
    "likeIf": [
      "Te llama la atención el paso de jazmín a caramelo",
      "Buscás una composición que termine en vainilla",
      "Te atraen los acordes de floral blanco y dulce"
    ]
  },
  "jean-paul-gaultier-scandal-masculino": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "aromatico-limpio",
      "citrico-fresco"
    ],
    "accords": [
      "Caramelo",
      "Aromático",
      "Dulce",
      "Cítrico",
      "Vainilla",
      "Ámbar",
      "Especiado suave",
      "Amaderado"
    ],
    "topNotes": [
      "Mandarina",
      "Salvia sclarea"
    ],
    "middleNotes": [
      "Caramelo",
      "Haba tonka"
    ],
    "baseNotes": [
      "Vetiver"
    ],
    "mainNotes": [
      "Mandarina",
      "Caramelo",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Mandarina y salvia sclarea para abrir, caramelo y haba tonka en el centro, vetiver abajo. Es dulce de verdad, y el vetiver está puesto ahí justamente para que no empalague.",
    "likeIf": [
      "Te gusta el caramelo en un perfume masculino",
      "Buscás algo dulce que cierre en vetiver",
      "Te atrae el haba tonka junto a la mandarina"
    ]
  },
  "jean-paul-gaultier-scandal-pour-homme-absolu": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "gourmand-dulce",
      "especiado"
    ],
    "accords": [
      "Amaderado",
      "Frutal",
      "Especiado cálido",
      "Avellanado",
      "Balsámico",
      "Dulce",
      "Empolvado",
      "Fresco",
      "Ámbar"
    ],
    "topNotes": [
      "Ciruela mirabel"
    ],
    "middleNotes": [
      "Castaña"
    ],
    "baseNotes": [
      "Sándalo"
    ],
    "mainNotes": [
      "Ciruela mirabel",
      "Castaña",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Sale con ciruela mirabel, se acomoda en castaña y se queda en sándalo. El resultado es un perfil amaderado, dulce y especiado.",
    "likeIf": [
      "Disfrutás perfiles que van de ciruela mirabel hacia castaña",
      "Te gusta la combinación de especiado cálido y avellanado",
      "Te atraen los acordes de amaderado y frutal"
    ]
  },
  "jean-paul-gaultier-ultra-male": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "aromatico-limpio"
    ],
    "accords": [
      "Vainilla",
      "Frutal",
      "Aromático",
      "Dulce",
      "Canela",
      "Especiado cálido",
      "Lavanda"
    ],
    "topNotes": [
      "Pera",
      "Lavanda",
      "Menta",
      "Bergamota",
      "Limón"
    ],
    "middleNotes": [
      "Canela",
      "Salvia sclarea",
      "Alcaravea"
    ],
    "baseNotes": [
      "Vaina de vainilla negra",
      "Ámbar",
      "Pachulí",
      "Cedro"
    ],
    "mainNotes": [
      "Pera",
      "Canela",
      "Vainilla",
      "Pachulí"
    ],
    "occasions": [
      "noche",
      "cita"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "envolvente",
    "feel": "Pera y vainilla al frente, especias detrás. Es la lectura más juvenil y frontal de la casa, pensada para la noche.",
    "likeIf": [
      "Te gustan los perfumes frutales y dulces",
      "Salís de noche",
      "Querés algo frontal y juvenil"
    ]
  },
  "kajal-dahab": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "citrico-fresco",
      "amaderado"
    ],
    "accords": [
      "Frutal",
      "Fresco",
      "Almizclado",
      "Tropical",
      "Dulce",
      "Empolvado",
      "Amaderado",
      "Ámbar",
      "Cítrico",
      "Verde"
    ],
    "topNotes": [
      "Manzana Granny Smith",
      "Bergamota"
    ],
    "middleNotes": [
      "Maracuyá",
      "Cedro",
      "Cilantro"
    ],
    "baseNotes": [
      "Almizcle",
      "Ámbar",
      "Pachulí"
    ],
    "mainNotes": [
      "Manzana Granny Smith",
      "Maracuyá",
      "Almizcle",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La salida es de manzana Granny Smith y bergamota; el centro se arma con maracuyá, cedro y cilantro; el fondo descansa en almizcle, ámbar y pachulí. La composición combina un registro dulce y cítrico.",
    "likeIf": [
      "Te gustan las aperturas de manzana Granny Smith que pasan a maracuyá",
      "Te llaman la atención los fondos de almizcle y ámbar",
      "Preferís perfiles donde aparecen frutal y fresco"
    ]
  },
  "kayali-yum-marshmallow": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce"
    ],
    "accords": [
      "Dulce",
      "Vainilla",
      "Frutal",
      "Empolvado",
      "Lactónico"
    ],
    "topNotes": [
      "Fresia",
      "Limón de Italia",
      "Flor de nectarina",
      "Manzana"
    ],
    "middleNotes": [
      "Malvavisco",
      "Frutilla",
      "Coco",
      "Azahar"
    ],
    "baseNotes": [
      "Crema batida",
      "Azúcar",
      "Vainilla",
      "Almizcle",
      "Frambuesa",
      "Ambroxan"
    ],
    "mainNotes": [
      "Fresia",
      "Malvavisco",
      "Crema batida",
      "Azúcar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Fresia, limón de Italia y flor de nectarina en la salida, malvavisco, frutilla y coco en el corazón y crema batida, azúcar y vainilla en el fondo. El resultado es un perfil dulce.",
    "likeIf": [
      "Disfrutás perfiles que van de fresia hacia malvavisco",
      "Buscás una composición que termine en crema batida y azúcar",
      "Te atraen los acordes de dulce y vainilla"
    ]
  },
  "kayali-yum-pistachio": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Dulce",
      "Amaderado",
      "Vainilla",
      "Avellanado",
      "Empolvado",
      "Especiado cálido"
    ],
    "topNotes": [
      "Pistacho",
      "Helado",
      "Bergamota",
      "Avellana",
      "Ron",
      "Cardamomo"
    ],
    "middleNotes": [
      "Muguet",
      "Pera",
      "Jazmín",
      "Peonía",
      "Geranio",
      "Durazno blanco",
      "Frambuesa"
    ],
    "baseNotes": [
      "Crema batida",
      "Malvavisco",
      "Algodón de azúcar",
      "Haba tonka",
      "Delicia turca",
      "Sándalo",
      "Cedro",
      "Cacao"
    ],
    "mainNotes": [
      "Pistacho",
      "Muguet",
      "Crema batida",
      "Malvavisco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "La salida es de pistacho, helado y bergamota; el centro se arma con muguet, pera y jazmín; el fondo descansa en crema batida, malvavisco y algodón de azúcar. Entre sus acordes principales figuran dulce y amaderado.",
    "likeIf": [
      "Te llama la atención el paso de pistacho a muguet",
      "Querés un cierre de crema batida y malvavisco",
      "Te gusta la combinación de vainilla y avellanado"
    ]
  },
  "kenzo-amour": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "ambarado-intenso"
    ],
    "accords": [
      "Vainilla",
      "Floral",
      "Empolvado",
      "Lactónico",
      "Dulce",
      "Sabroso",
      "Tropical",
      "Almizclado",
      "Balsámico",
      "Ámbar"
    ],
    "topNotes": [
      "Arroz",
      "Té blanco"
    ],
    "middleNotes": [
      "Frangipani",
      "Flor de cerezo",
      "Heliotropo"
    ],
    "baseNotes": [
      "Vainilla",
      "Almizcle",
      "Incienso",
      "Madera de thanaka"
    ],
    "mainNotes": [
      "Arroz",
      "Frangipani",
      "Vainilla",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Arranca con arroz y té blanco, pasa por frangipani, flor de cerezo y heliotropo y termina sobre vainilla, almizcle y incienso. Entre sus acordes principales figuran vainilla y floral.",
    "likeIf": [
      "Te llama la atención el paso de arroz a frangipani",
      "Querés un cierre de vainilla y almizcle",
      "Te atraen los acordes de empolvado y lactónico"
    ]
  },
  "kenzo-flower": {
    "family": "floral",
    "families": [
      "floral",
      "ambarado-intenso",
      "gourmand-dulce"
    ],
    "accords": [
      "Empolvado",
      "Floral",
      "Violeta",
      "Rosa",
      "Ámbar",
      "Almizclado",
      "Vainilla",
      "Dulce",
      "Balsámico",
      "Ahumado"
    ],
    "topNotes": [
      "Rosa búlgara",
      "Espino albar",
      "Grosella negra",
      "Mandarina"
    ],
    "middleNotes": [
      "Violeta de Parma",
      "Rosa",
      "Opopónaco",
      "Jazmín"
    ],
    "baseNotes": [
      "Almizcle blanco",
      "Vainilla",
      "Incienso"
    ],
    "mainNotes": [
      "Rosa búlgara",
      "Violeta de Parma",
      "Almizcle blanco",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La apertura combina rosa búlgara, espino albar y grosella negra. Después llega el turno de violeta de Parma, rosa y opopónaco, y el final queda en almizcle blanco, vainilla y incienso. El perfil cruza lo floral con lo ambarado.",
    "likeIf": [
      "Te atrae el contraste entre rosa búlgara y un corazón de violeta de Parma",
      "Preferís que el final quede en almizcle blanco y vainilla",
      "Querés explorar lo empolvado junto a lo floral"
    ]
  },
  "kenzo-kenzo-homme": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "aromatico-limpio",
      "acuatico"
    ],
    "accords": [
      "Amaderado",
      "Aromático",
      "Acuático",
      "Marino",
      "Conífero"
    ],
    "topNotes": [
      "Notas marinas",
      "Calypsone",
      "Nuez moscada"
    ],
    "middleNotes": [
      "Pino",
      "Pachulí"
    ],
    "baseNotes": [
      "Sándalo",
      "Cedro"
    ],
    "mainNotes": [
      "Notas marinas",
      "Pino",
      "Sándalo",
      "Cedro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Notas marinas y nuez moscada arriba, pino y pachulí en el centro, sándalo y cedro abajo. Acuático y amaderado a la vez: el pino es lo que lo saca del marino puro.",
    "likeIf": [
      "Te gustan los acuáticos con maderas debajo",
      "Buscás el pino y la conífera en un perfume",
      "Preferís lo marino en un registro sobrio"
    ]
  },
  "kenzo-kenzo-homme-night": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "gourmand-dulce",
      "especiado"
    ],
    "accords": [
      "Aromático",
      "Tropical",
      "Dulce",
      "Especiado fresco",
      "Especiado cálido",
      "Amaderado",
      "Frutal",
      "Vainilla",
      "Herbal",
      "Cítrico"
    ],
    "topNotes": [
      "Cardamomo",
      "Pomelo",
      "Cilantro"
    ],
    "middleNotes": [
      "Mango",
      "Artemisa",
      "Artemisa",
      "Geranio"
    ],
    "baseNotes": [
      "Haba tonka",
      "Vetiver",
      "Madera de guayaco"
    ],
    "mainNotes": [
      "Cardamomo",
      "Mango",
      "Haba tonka",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Sale con cardamomo, pomelo y cilantro, se acomoda en mango, artemisa y artemisa y se queda en haba tonka, vetiver y madera de guayaco. El resultado es un perfil aromático, dulce y especiado.",
    "likeIf": [
      "Disfrutás perfiles que van de cardamomo hacia mango",
      "Buscás una composición que termine en haba tonka y vetiver",
      "Te atraen los acordes de aromático y tropical"
    ]
  },
  "kilian-angels-share": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "amaderado"
    ],
    "accords": [
      "Especiado cálido",
      "Amaderado",
      "Dulce",
      "Vainilla",
      "Canela",
      "Ámbar",
      "Empolvado"
    ],
    "topNotes": [
      "Coñac"
    ],
    "middleNotes": [
      "Canela",
      "Haba tonka",
      "Roble",
      "Hedione"
    ],
    "baseNotes": [
      "Vainilla",
      "Praliné",
      "Sándalo",
      "Almendra confitada"
    ],
    "mainNotes": [
      "Coñac",
      "Canela",
      "Praliné",
      "Almendra confitada"
    ],
    "occasions": [
      "evento",
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Coñac, canela y almendra confitada sobre madera de roble. Es de los gourmands más elegantes que existen.",
    "likeIf": [
      "Te gustan los gourmands adultos",
      "Buscás algo para el invierno",
      "Querés un perfume de ocasión"
    ]
  },
  "lancome-idole": {
    "family": "floral",
    "families": [
      "floral",
      "aromatico-limpio",
      "citrico-fresco"
    ],
    "accords": [
      "Rosa",
      "Almizclado",
      "Frutal",
      "Dulce",
      "Floral blanco",
      "Empolvado"
    ],
    "topNotes": [
      "Pera",
      "Bergamota",
      "Pimienta rosa"
    ],
    "middleNotes": [
      "Rosa",
      "Jazmín"
    ],
    "baseNotes": [
      "Almizcle blanco",
      "Vainilla",
      "Pachulí",
      "Cedro"
    ],
    "mainNotes": [
      "Rosa",
      "Pera",
      "Jazmín",
      "Almizcle blanco"
    ],
    "occasions": [
      "diario",
      "trabajo"
    ],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Pera en la salida y rosa en el corazón. El conjunto es floral, dulce y almizclado.",
    "likeIf": [
      "Te atrae el contraste entre pera y un corazón de rosa",
      "Buscás una combinación floral y almizclada",
      "Buscás una composición que termine en vainilla y cedro"
    ]
  },
  "lancome-la-vida-es-bella": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral"
    ],
    "accords": [
      "Dulce",
      "Vainilla",
      "Frutal",
      "Pachulí",
      "Amaderado"
    ],
    "topNotes": [
      "Grosella negra",
      "Pera"
    ],
    "middleNotes": [
      "Iris",
      "Jazmín",
      "Azahar"
    ],
    "baseNotes": [
      "Praliné",
      "Vainilla",
      "Pachulí",
      "Haba tonka"
    ],
    "mainNotes": [
      "Pera",
      "Iris",
      "Praliné",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Praliné y vainilla sobre un corazón de iris. Es dulce de verdad, cremoso y envolvente.",
    "likeIf": [
      "Te gustan los perfumes dulces",
      "Buscás algo reconocible",
      "Buscás un dulce cremoso y envolvente"
    ]
  },
  "lancome-la-vida-es-bella-intense": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "floral"
    ],
    "accords": [
      "Dulce",
      "Avellanado",
      "Amaderado",
      "Vainilla",
      "Floral blanco",
      "Iris",
      "Frutal",
      "Lactónico",
      "Especiado suave",
      "Cítrico"
    ],
    "topNotes": [
      "Pera",
      "Pimienta rosa",
      "Brotes de grosella",
      "Naranja",
      "Bergamota"
    ],
    "middleNotes": [
      "Iris",
      "Nardo",
      "Ylang ylang",
      "Azahar",
      "Jazmín sambac"
    ],
    "baseNotes": [
      "Crema batida",
      "Avellana"
    ],
    "mainNotes": [
      "Pera",
      "Iris",
      "Crema batida",
      "Avellana"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Pera y pimienta rosa para abrir, un corazón de iris y nardo, y un fondo de crema batida y avellana. Es la lectura más densa y cremosa de La Vie Est Belle.",
    "likeIf": [
      "Buscás la versión más cremosa de La Vie Est Belle",
      "Te gusta la avellana en perfumería",
      "Preferís que el iris llegue envuelto en algo dulce"
    ]
  },
  "lancome-tresor-le-nuit": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "ambarado-intenso"
    ],
    "accords": [
      "Dulce",
      "Frutal",
      "Vainilla",
      "Caramelo",
      "Especiado cálido",
      "Balsámico",
      "Amaderado",
      "Tropical",
      "Pachulí",
      "Ámbar"
    ],
    "topNotes": [
      "Pera",
      "Mandarina",
      "Bergamota"
    ],
    "middleNotes": [
      "Frutilla",
      "Rosa negra",
      "Orquídea de vainilla",
      "Maracuyá"
    ],
    "baseNotes": [
      "Praliné",
      "Caramelo",
      "Vainilla",
      "Lichi",
      "Pachulí",
      "Incienso",
      "Café",
      "Regaliz",
      "Cumarina",
      "Papiro"
    ],
    "mainNotes": [
      "Pera",
      "Frutilla",
      "Praliné",
      "Caramelo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Al principio pera, mandarina y bergamota. Más adelante entran frutilla, rosa negra y orquídea de vainilla, y el fondo termina en praliné, caramelo y vainilla. Es una composición dulce, especiada y ambarada.",
    "likeIf": [
      "Te llama la atención el paso de pera a frutilla",
      "Querés un cierre de praliné y caramelo",
      "Te gusta la combinación de dulce y frutal"
    ]
  },
  "lattafa-amethyst": {
    "family": "floral",
    "families": [
      "floral",
      "ambarado-intenso",
      "especiado"
    ],
    "accords": [
      "Rosa",
      "Oud",
      "Ámbar",
      "Especiado suave",
      "Floral",
      "Vainilla",
      "Cítrico",
      "Especiado fresco",
      "Floral blanco"
    ],
    "topNotes": [
      "Pimienta rosa",
      "Bergamota"
    ],
    "middleNotes": [
      "Rosa de Turquía",
      "Rosa búlgara",
      "Jazmín"
    ],
    "baseNotes": [
      "Oud",
      "Ámbar",
      "Vainilla"
    ],
    "mainNotes": [
      "Pimienta rosa",
      "Rosa de Turquía",
      "Oud",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Desde pimienta rosa y bergamota avanza hacia rosa de Turquía, rosa búlgara y jazmín y cierra apoyado en oud, ámbar y vainilla. El conjunto es floral, ambarado y especiado.",
    "likeIf": [
      "Te atrae el contraste entre pimienta rosa y un corazón de rosa de Turquía",
      "Preferís que el final quede en oud y ámbar",
      "Preferís un perfil floral con un matiz ambarado"
    ]
  },
  "lattafa-asad": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "especiado",
      "amaderado"
    ],
    "accords": [
      "Ámbar",
      "Especiado fresco",
      "Amaderado",
      "Especiado cálido",
      "Vainilla",
      "Tabaco"
    ],
    "topNotes": [
      "Pimienta negra",
      "Tabaco",
      "Ananá"
    ],
    "middleNotes": [
      "Pachulí",
      "Café",
      "Iris"
    ],
    "baseNotes": [
      "Vainilla",
      "Ámbar",
      "Madera seca",
      "Benjuí",
      "Labdanum"
    ],
    "mainNotes": [
      "Ananá",
      "Tabaco",
      "Café",
      "Ámbar"
    ],
    "occasions": [
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Ananá y pimienta arriba, café y tabaco en el centro, ámbar abajo. Ambarado y masculino sin vueltas.",
    "likeIf": [
      "Te gustan los ambarados",
      "Buscás algo para la noche",
      "Te atrae el estilo árabe"
    ]
  },
  "lattafa-asad-bourbon": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "aromatico-limpio",
      "especiado"
    ],
    "accords": [
      "Vainilla",
      "Cacao",
      "Dulce",
      "Lavanda",
      "Especiado fresco",
      "Especiado cálido",
      "Ámbar",
      "Aromático",
      "Empolvado",
      "Especiado suave"
    ],
    "topNotes": [
      "Lavanda",
      "Ciruela mirabel",
      "Pimienta rosa"
    ],
    "middleNotes": [
      "Cacao",
      "Nuez moscada",
      "Davana"
    ],
    "baseNotes": [
      "Vainilla bourbon",
      "Ámbar",
      "Vetiver"
    ],
    "mainNotes": [
      "Lavanda",
      "Cacao",
      "Vainilla bourbon",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La apertura combina lavanda, ciruela mirabel y pimienta rosa. Después llega el turno de cacao, nuez moscada y davana, y el final queda en vainilla bourbon, ámbar y vetiver. Se apoya en acordes de vainilla y cacao.",
    "likeIf": [
      "Disfrutás perfiles que van de lavanda hacia cacao",
      "Buscás una composición que termine en vainilla bourbon y ámbar",
      "Querés explorar lo dulce con carácter aromático"
    ]
  },
  "lattafa-asad-elixir": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "amaderado",
      "cuero-ahumado"
    ],
    "accords": [
      "Ámbar",
      "Amaderado",
      "Tabaco",
      "Vainilla",
      "Dulce",
      "Especiado cálido",
      "Empolvado",
      "Especiado suave",
      "Pachulí",
      "Especiado fresco"
    ],
    "topNotes": [
      "Pimienta rosa",
      "Azafrán",
      "Pomelo"
    ],
    "middleNotes": [
      "Tabaco",
      "Vainilla",
      "Cedro"
    ],
    "baseNotes": [
      "Ámbar claro",
      "Olíbano",
      "Pachulí",
      "Cashmeran"
    ],
    "mainNotes": [
      "Pimienta rosa",
      "Tabaco",
      "Ámbar claro",
      "Olíbano"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Primero pimienta rosa, azafrán y pomelo. Después tabaco, vainilla y cedro. Al final, ámbar claro, olíbano y pachulí. El resultado es un perfil ambarado y amaderado.",
    "likeIf": [
      "Disfrutás perfiles que van de pimienta rosa hacia tabaco",
      "Buscás una composición que termine en ámbar claro y olíbano",
      "Te atraen los acordes de ámbar y amaderado"
    ]
  },
  "lattafa-eclaire": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "ambarado-intenso"
    ],
    "accords": [
      "Dulce",
      "Vainilla",
      "Caramelo",
      "Lactónico",
      "Miel",
      "Empolvado",
      "Almizclado",
      "Balsámico"
    ],
    "topNotes": [
      "Caramelo",
      "Leche",
      "Azúcar"
    ],
    "middleNotes": [
      "Miel",
      "Flores blancas"
    ],
    "baseNotes": [
      "Vainilla",
      "Praliné",
      "Almizcle"
    ],
    "mainNotes": [
      "Caramelo",
      "Miel",
      "Vainilla",
      "Praliné"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Caramelo, leche y azúcar en la salida, miel y flores blancas en el corazón y vainilla, praliné y almizcle en el fondo. El conjunto es dulce.",
    "likeIf": [
      "Te atrae el contraste entre caramelo y un corazón de miel",
      "Preferís que el final quede en vainilla y praliné",
      "Te atrae un perfil lactónico y empolvado"
    ]
  },
  "lattafa-honor-y-gloria": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "amaderado"
    ],
    "accords": [
      "Dulce",
      "Especiado cálido",
      "Frutal",
      "Vainilla",
      "Amaderado",
      "Empolvado",
      "Canela",
      "Tropical"
    ],
    "topNotes": [
      "Ananá",
      "Crème brûlée"
    ],
    "middleNotes": [
      "Canela",
      "Cúrcuma",
      "Pimienta negra",
      "Benjuí"
    ],
    "baseNotes": [
      "Vainilla",
      "Sándalo",
      "Cashmeran",
      "Musgo"
    ],
    "mainNotes": [
      "Ananá",
      "Canela",
      "Vainilla",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Desde ananá y crème brûlée avanza hacia canela, cúrcuma y pimienta negra y cierra apoyado en vainilla, sándalo y cashmeran. Se apoya en acordes de dulce y especiado cálido.",
    "likeIf": [
      "Disfrutás perfiles que van de ananá hacia canela",
      "Buscás una composición que termine en vainilla y sándalo",
      "Te llama la atención un corazón de cúrcuma y pimienta negra"
    ]
  },
  "lattafa-khamrah": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "ambarado-intenso"
    ],
    "accords": [
      "Dulce",
      "Especiado cálido",
      "Vainilla",
      "Ámbar",
      "Canela",
      "Amaderado"
    ],
    "topNotes": [
      "Canela",
      "Nuez moscada",
      "Bergamota"
    ],
    "middleNotes": [
      "Dátiles",
      "Praliné",
      "Nardo",
      "Mahonial"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Amberwood",
      "Mirra",
      "Benjuí",
      "Akigalawood"
    ],
    "mainNotes": [
      "Dátiles",
      "Canela",
      "Praliné",
      "Vainilla"
    ],
    "occasions": [
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Dátiles y canela sobre praliné y vainilla. Es la puerta de entrada al estilo árabe moderno: dulce, especiado, cálido y envolvente.",
    "likeIf": [
      "Querés entrar al mundo de los árabes",
      "Te gustan las especias dulces",
      "Buscás algo cálido y envolvente"
    ]
  },
  "lattafa-khamrah-qahwa": {
    "family": "especiado",
    "families": [
      "especiado",
      "gourmand-dulce",
      "ambarado-intenso"
    ],
    "accords": [
      "Especiado cálido",
      "Dulce",
      "Vainilla",
      "Canela",
      "Café",
      "Ámbar",
      "Empolvado"
    ],
    "topNotes": [
      "Canela",
      "Cardamomo",
      "Jengibre"
    ],
    "middleNotes": [
      "Praliné",
      "Frutas confitadas",
      "Flores blancas"
    ],
    "baseNotes": [
      "Vainilla",
      "Café",
      "Haba tonka",
      "Benjuí",
      "Almizcle"
    ],
    "mainNotes": [
      "Canela",
      "Praliné",
      "Vainilla",
      "Café"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Primero canela, cardamomo y jengibre. Después praliné, frutas confitadas y flores blancas. Al final, vainilla, café y haba tonka. El perfil cruza lo especiado con lo dulce.",
    "likeIf": [
      "Te atrae el contraste entre canela y un corazón de praliné",
      "Preferís que el final quede en vainilla y café",
      "Querés explorar lo especiado cálido junto a lo dulce"
    ]
  },
  "lattafa-mayar-cherry-intense": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "ambarado-intenso"
    ],
    "accords": [
      "Cacao",
      "Dulce",
      "Especiado cálido",
      "Frutal",
      "Vainilla",
      "Ámbar",
      "Pachulí",
      "Empolvado"
    ],
    "topNotes": [
      "Frutilla",
      "Bergamota"
    ],
    "middleNotes": [
      "Mermelada de cereza",
      "Cacao"
    ],
    "baseNotes": [
      "Vainilla",
      "Ámbar",
      "Pachulí"
    ],
    "mainNotes": [
      "Frutilla",
      "Mermelada de cereza",
      "Vainilla",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Desde frutilla y bergamota avanza hacia mermelada de cereza y cacao y cierra apoyado en vainilla, ámbar y pachulí. El conjunto es dulce, especiado y ambarado.",
    "likeIf": [
      "Te atrae el contraste entre frutilla y un corazón de mermelada de cereza",
      "Te gusta la combinación de especiado cálido y frutal",
      "Te atraen los acordes de dulce y especiado cálido"
    ]
  },
  "lattafa-nebras": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "ambarado-intenso"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Cacao",
      "Especiado cálido",
      "Ámbar",
      "Frutal",
      "Empolvado"
    ],
    "topNotes": [
      "Frutos rojos",
      "Mandarina"
    ],
    "middleNotes": [
      "Vainilla",
      "Cacao",
      "Rosa"
    ],
    "baseNotes": [
      "Azúcar",
      "Haba tonka",
      "Ámbar",
      "Almizcle"
    ],
    "mainNotes": [
      "Frutos rojos",
      "Vainilla",
      "Azúcar",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Frutos rojos y mandarina en la salida, vainilla, cacao y rosa en el corazón y azúcar, haba tonka y ámbar en el fondo. El perfil cruza lo dulce con lo especiado.",
    "likeIf": [
      "Te atrae el contraste entre frutos rojos y un corazón de vainilla",
      "Preferís que el final quede en azúcar y haba tonka",
      "Te gusta la combinación de cacao y especiado cálido"
    ]
  },
  "lattafa-opulent-musk": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Almizclado",
      "Ámbar",
      "Amaderado",
      "Empolvado",
      "Especiado cálido",
      "Floral blanco",
      "Metálico",
      "Aromático",
      "Animálico",
      "Cuero"
    ],
    "topNotes": [
      "Almizcle blanco",
      "Azafrán",
      "Limón"
    ],
    "middleNotes": [
      "Flores blancas",
      "Jazmín"
    ],
    "baseNotes": [
      "Almizcle blanco",
      "Cedro",
      "Ámbar",
      "Resina",
      "Resina de abeto"
    ],
    "mainNotes": [
      "Almizcle blanco",
      "Flores blancas",
      "Cedro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La salida es de almizcle blanco, azafrán y limón; el centro se arma con flores blancas y jazmín; el fondo descansa en almizcle blanco, cedro y ámbar. Es una composición ambarada, amaderada y especiada.",
    "likeIf": [
      "Te llama la atención el paso de almizcle blanco a flores blancas",
      "Te gusta la combinación de almizclado y ámbar",
      "Te atraen los acordes de amaderado y empolvado"
    ]
  },
  "lattafa-oud-for-glory": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "especiado",
      "amaderado"
    ],
    "accords": [
      "Oud",
      "Especiado cálido",
      "Especiado fresco",
      "Pachulí",
      "Metálico",
      "Almizclado",
      "Amaderado",
      "Lavanda",
      "Terroso",
      "Cuero"
    ],
    "topNotes": [
      "Azafrán",
      "Nuez moscada",
      "Lavanda"
    ],
    "middleNotes": [
      "Oud",
      "Pachulí"
    ],
    "baseNotes": [
      "Oud",
      "Pachulí",
      "Almizcle"
    ],
    "mainNotes": [
      "Azafrán",
      "Oud",
      "Pachulí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Azafrán y nuez moscada para abrir, y de ahí en adelante oud y pachulí, primero en el corazón y después en el fondo con almizcle. Especiado arriba y terroso abajo, con muy pocos ingredientes.",
    "likeIf": [
      "Buscás un oud directo, sin florales de por medio",
      "Te gusta el azafrán como apertura especiada",
      "Preferís que el pachulí lleve el fondo"
    ]
  },
  "lattafa-oud-mood": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Ámbar",
      "Oud",
      "Amaderado",
      "Especiado cálido",
      "Caramelo",
      "Balsámico",
      "Rosa",
      "Ahumado",
      "Floral"
    ],
    "topNotes": [
      "Rosa",
      "Azafrán",
      "Pimienta de Jamaica"
    ],
    "middleNotes": [
      "Oud",
      "Caramelo",
      "Notas florales",
      "Pachulí"
    ],
    "baseNotes": [
      "Notas amaderadas",
      "Ámbar",
      "Resinas",
      "Incienso",
      "Almizcle"
    ],
    "mainNotes": [
      "Rosa",
      "Oud",
      "Notas amaderadas",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Empieza con rosa, azafrán y pimienta de Jamaica. En el corazón hay oud, caramelo y notas florales, y el fondo reúne notas amaderadas, ámbar y resinas. Entre sus acordes principales figuran ámbar y oud.",
    "likeIf": [
      "Te llama la atención el paso de rosa a oud",
      "Querés un cierre de notas amaderadas y ámbar",
      "Te atraen los acordes de amaderado y especiado cálido"
    ]
  },
  "lattafa-sakeena": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral"
    ],
    "accords": [
      "Dulce",
      "Frutal",
      "Rosa",
      "Tropical",
      "Vainilla"
    ],
    "topNotes": [
      "Maracuyá",
      "Notas ozónicas",
      "Mandarina"
    ],
    "middleNotes": [
      "Frambuesa",
      "Rosa",
      "Azahar",
      "Sal marina"
    ],
    "baseNotes": [
      "Toffee",
      "Praliné",
      "Vainilla",
      "Almizcle"
    ],
    "mainNotes": [
      "Maracuyá",
      "Frambuesa",
      "Toffee",
      "Praliné"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "La salida es de maracuyá, notas ozónicas y mandarina; el centro se arma con frambuesa, rosa y azahar; el fondo descansa en toffee, praliné y vainilla. Entre sus acordes principales figuran dulce y frutal.",
    "likeIf": [
      "Te gustan las aperturas de maracuyá que pasan a frambuesa",
      "Te llaman la atención los fondos de toffee y praliné",
      "Preferís perfiles donde aparecen dulce y frutal"
    ]
  },
  "lattafa-sublime": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "citrico-fresco",
      "floral"
    ],
    "accords": [
      "Frutal",
      "Fresco",
      "Tropical",
      "Rosa",
      "Verde",
      "Terroso",
      "Musgoso"
    ],
    "topNotes": [
      "Manzana",
      "Lichi",
      "Rosa"
    ],
    "middleNotes": [
      "Ciruela",
      "Jazmín"
    ],
    "baseNotes": [
      "Musgo",
      "Vainilla",
      "Pachulí"
    ],
    "mainNotes": [
      "Manzana",
      "Ciruela",
      "Musgo",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La apertura combina manzana, lichi y rosa. Después llega el turno de ciruela y jazmín, y el final queda en musgo, vainilla y pachulí. Se apoya en acordes de frutal y fresco.",
    "likeIf": [
      "Te atrae el contraste entre manzana y un corazón de ciruela",
      "Preferís que el final quede en musgo y vainilla",
      "Querés explorar lo frutal junto a lo fresco"
    ]
  },
  "lattafa-teriaq": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "cuero-ahumado",
      "ambarado-intenso"
    ],
    "accords": [
      "Dulce",
      "Caramelo",
      "Frutal",
      "Miel",
      "Cuero",
      "Vainilla",
      "Almendra",
      "Animálico",
      "Almizclado",
      "Empolvado"
    ],
    "topNotes": [
      "Caramelo",
      "Almendra amarga",
      "Damasco",
      "Pimienta rosa"
    ],
    "middleNotes": [
      "Miel",
      "Ruibarbo",
      "Flores blancas",
      "Rosa"
    ],
    "baseNotes": [
      "Cuero",
      "Vainilla",
      "Almizcle",
      "Labdanum",
      "Vetiver"
    ],
    "mainNotes": [
      "Caramelo",
      "Miel",
      "Cuero",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Arranca con caramelo, almendra amarga y damasco, pasa por miel, ruibarbo y flores blancas y termina sobre cuero, vainilla y almizcle. Es una composición dulce.",
    "likeIf": [
      "Te gustan las aperturas de caramelo que pasan a miel",
      "Te llaman la atención los fondos de cuero y vainilla",
      "Preferís las composiciones dulces"
    ]
  },
  "lattafa-yara": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral"
    ],
    "accords": [
      "Dulce",
      "Vainilla",
      "Empolvado",
      "Tropical",
      "Almizclado",
      "Frutal",
      "Floral"
    ],
    "topNotes": [
      "Orquídea",
      "Heliotropo",
      "Mandarina"
    ],
    "middleNotes": [
      "Acorde gourmand",
      "Frutas tropicales"
    ],
    "baseNotes": [
      "Vainilla",
      "Almizcle",
      "Sándalo"
    ],
    "mainNotes": [
      "Orquídea",
      "Frutas tropicales",
      "Vainilla",
      "Sándalo"
    ],
    "occasions": [
      "diario"
    ],
    "seasons": [
      "calor",
      "todo-el-ano"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Cremoso y empolvado, con frutas tropicales y vainilla. Es dulce pero suave: sirve de día sin cansar.",
    "likeIf": [
      "Buscás un dulce liviano",
      "Te gusta lo cremoso y empolvado",
      "Lo querés para todos los días"
    ]
  },
  "lattafa-yara-candy": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "citrico-fresco",
      "floral"
    ],
    "accords": [
      "Vainilla",
      "Frutal",
      "Empolvado",
      "Cítrico",
      "Floral blanco",
      "Aromático",
      "Amaderado",
      "Especiado suave",
      "Almizclado",
      "Animálico"
    ],
    "topNotes": [
      "Grosella negra",
      "Mandarina verde"
    ],
    "middleNotes": [
      "Caramelo de frutilla",
      "Gardenia"
    ],
    "baseNotes": [
      "Vainilla",
      "Almizcle",
      "Ámbar",
      "Sándalo"
    ],
    "mainNotes": [
      "Grosella negra",
      "Caramelo de frutilla",
      "Vainilla",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Sale con grosella negra y mandarina verde, se acomoda en caramelo de frutilla y gardenia y se queda en vainilla, almizcle y ámbar. Se apoya en acordes de vainilla y frutal.",
    "likeIf": [
      "Disfrutás perfiles que van de grosella negra hacia caramelo de frutilla",
      "Buscás una composición que termine en vainilla y almizcle",
      "Preferís perfiles donde aparecen empolvado y cítrico"
    ]
  },
  "lattafa-yara-elixir": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "ambarado-intenso"
    ],
    "accords": [
      "Vainilla",
      "Caramelo",
      "Dulce",
      "Floral blanco",
      "Empolvado",
      "Frutal",
      "Ámbar",
      "Almizclado",
      "Especiado suave",
      "Animálico"
    ],
    "topNotes": [
      "S'mores de frutilla",
      "Grosella negra"
    ],
    "middleNotes": [
      "Jazmín",
      "Azahar"
    ],
    "baseNotes": [
      "Vainilla",
      "Caramelo",
      "Ámbar",
      "Almizcle"
    ],
    "mainNotes": [
      "S'mores de frutilla",
      "Jazmín",
      "Vainilla",
      "Caramelo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Primero s'mores de frutilla y grosella negra. Después jazmín y azahar. Al final, vainilla, caramelo y ámbar. El perfil cruza lo dulce con lo floral.",
    "likeIf": [
      "Te atrae el contraste entre s'mores de frutilla y un corazón de jazmín",
      "Preferís que el final quede en vainilla y caramelo",
      "Te gusta la combinación de dulce y floral blanco"
    ]
  },
  "lattafa-yara-tous": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "amaderado"
    ],
    "accords": [
      "Tropical",
      "Dulce",
      "Floral blanco",
      "Vainilla",
      "Frutal",
      "Empolvado",
      "Coco",
      "Almizclado",
      "Amaderado"
    ],
    "topNotes": [
      "Mango",
      "Coco",
      "Maracuyá"
    ],
    "middleNotes": [
      "Jazmín",
      "Azahar",
      "Heliotropo"
    ],
    "baseNotes": [
      "Vainilla",
      "Almizcle",
      "Cashmeran"
    ],
    "mainNotes": [
      "Mango",
      "Jazmín",
      "Vainilla",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "La apertura combina mango, coco y maracuyá. Después llega el turno de jazmín, azahar y heliotropo, y el final queda en vainilla, almizcle y cashmeran. El resultado es un perfil dulce, floral y amaderado.",
    "likeIf": [
      "Disfrutás perfiles que van de mango hacia jazmín",
      "Te gustan las aperturas con coco y maracuyá",
      "Te atraen los acordes de tropical y dulce"
    ]
  },
  "louis-vuitton-afternoon-sweet": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "especiado",
      "gourmand-dulce"
    ],
    "accords": [
      "Cítrico",
      "Especiado fresco",
      "Dulce",
      "Aromático",
      "Frutal"
    ],
    "topNotes": [
      "Mandarina",
      "Naranja de Sicilia",
      "Bergamota"
    ],
    "middleNotes": [
      "Jengibre"
    ],
    "baseNotes": [
      "Ámbar gris"
    ],
    "mainNotes": [
      "Mandarina",
      "Jengibre",
      "Ámbar gris"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Mandarina, naranja de Sicilia y bergamota arriba, jengibre en el centro, ámbar gris abajo. Un cítrico casi fotográfico: naranja de verdad, sin adornos.",
    "likeIf": [
      "Buscás un cítrico realista y directo",
      "Te gusta el jengibre detrás de la naranja",
      "Preferís pocas notas bien puestas"
    ]
  },
  "louis-vuitton-imagination": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "especiado",
      "aromatico-limpio"
    ],
    "accords": [
      "Cítrico",
      "Especiado fresco",
      "Verde",
      "Fresco",
      "Aromático"
    ],
    "topNotes": [
      "Cidra",
      "Bergamota de Calabria",
      "Naranja de Sicilia"
    ],
    "middleNotes": [
      "Neroli de Túnez",
      "Jengibre de Nigeria",
      "Canela de Ceilán"
    ],
    "baseNotes": [
      "Té negro chino",
      "Ambroxan",
      "Madera de guayaco",
      "Olíbano"
    ],
    "mainNotes": [
      "Cidra",
      "Neroli de Túnez",
      "Té negro chino",
      "Ambroxan"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Desde cidra, bergamota de Calabria y naranja de Sicilia avanza hacia neroli de Túnez, jengibre de Nigeria y canela de Ceilán y cierra apoyado en té negro chino, ambroxan y madera de guayaco. El resultado es un perfil cítrico, especiado y aromático.",
    "likeIf": [
      "Disfrutás perfiles que van de cidra hacia neroli de Túnez",
      "Buscás una composición que termine en té negro chino y ambroxan",
      "Te atraen los acordes de cítrico y especiado fresco"
    ]
  },
  "louis-vuitton-nuit-de-feu": {
    "family": "cuero-ahumado",
    "families": [
      "cuero-ahumado",
      "ambarado-intenso",
      "especiado"
    ],
    "accords": [
      "Ahumado",
      "Oud",
      "Ámbar",
      "Cuero",
      "Balsámico",
      "Especiado cálido",
      "Animálico",
      "Especiado fresco"
    ],
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "mainNotes": [
      "Incienso",
      "Oud",
      "Cuero",
      "Olíbano",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La composición reúne incienso, oud, cuero y olíbano, y también almizcle. El resultado es ahumado, ambarado y especiado.",
    "likeIf": [
      "Te interesan las composiciones con incienso y oud",
      "Te interesa que aparezcan olíbano y almizcle",
      "Te atraen los acordes de ámbar y cuero"
    ]
  },
  "louis-vuitton-ombre-nomade": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "especiado",
      "cuero-ahumado"
    ],
    "accords": [
      "Ámbar",
      "Especiado cálido",
      "Ahumado",
      "Oud",
      "Rosa",
      "Cuero",
      "Amaderado",
      "Frutal",
      "Balsámico",
      "Dulce"
    ],
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "mainNotes": [
      "Oud",
      "Rosa",
      "Incienso",
      "Frambuesa",
      "Azafrán",
      "Amberwood",
      "Benjuí",
      "Abedul",
      "Geranio"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Oud, rosa, incienso y frambuesa marcan el perfil, acompañados por azafrán, amberwood, benjuí y abedul. El resultado es un perfil ambarado, especiado y ahumado.",
    "likeIf": [
      "Buscás perfiles donde convivan oud y rosa",
      "Te interesa que aparezcan frambuesa y azafrán",
      "Te atrae un perfil ahumado con cuero"
    ]
  },
  "maison-francis-kurkdjian-baccarat-rouge-540": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "amaderado",
      "gourmand-dulce"
    ],
    "accords": [
      "Amaderado",
      "Ámbar",
      "Especiado cálido",
      "Metálico",
      "Especiado fresco",
      "Floral blanco"
    ],
    "topNotes": [
      "Azafrán",
      "Jazmín"
    ],
    "middleNotes": [
      "Amberwood",
      "Ámbar gris",
      "Hedione"
    ],
    "baseNotes": [
      "Resina de abeto",
      "Cedro",
      "Azúcar",
      "Ambroxan",
      "Musgo de roble"
    ],
    "mainNotes": [
      "Azafrán",
      "Amberwood",
      "Azúcar",
      "Cedro"
    ],
    "occasions": [
      "evento",
      "noche",
      "versatil"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Azafrán y jazmín en la salida, amberwood y ámbar gris en el corazón, y cedro, azúcar y musgo de roble en el fondo. El conjunto es amaderado y ambarado.",
    "likeIf": [
      "Te gustan las aperturas de azafrán y jazmín",
      "Buscás un perfil ambarado",
      "Te atraen los acordes de amaderado y metálico"
    ]
  },
  "memo-paris-iris-leather": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "especiado",
      "cuero-ahumado"
    ],
    "accords": [
      "Aromático",
      "Especiado fresco",
      "Cuero",
      "Amaderado",
      "Animálico",
      "Ahumado",
      "Verde",
      "Fresco"
    ],
    "topNotes": [
      "Bayas de enebro",
      "Pimienta",
      "Mandarina"
    ],
    "middleNotes": [
      "Mate",
      "Salvia sclarea",
      "Iris"
    ],
    "baseNotes": [
      "Cuero",
      "Cedro",
      "Vetiver"
    ],
    "mainNotes": [
      "Bayas de enebro",
      "Mate",
      "Cuero",
      "Cedro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Bayas de enebro y pimienta arriba; mate, salvia sclarea e iris en el centro; cuero, cedro y vetiver abajo. Se llama cuero, pero lo primero que aparece es el verde del mate.",
    "likeIf": [
      "Te gusta el mate como nota",
      "Buscás un cuero en clave verde",
      "Te atraen las bayas de enebro"
    ]
  },
  "montale-arabians-tonka": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "ambarado-intenso",
      "especiado"
    ],
    "accords": [
      "Dulce",
      "Vainilla",
      "Ámbar",
      "Oud",
      "Especiado cálido",
      "Rosa",
      "Almizclado",
      "Metálico",
      "Aromático",
      "Empolvado"
    ],
    "topNotes": [
      "Azafrán",
      "Bergamota"
    ],
    "middleNotes": [
      "Oud",
      "Rosa búlgara"
    ],
    "baseNotes": [
      "Haba tonka",
      "Caña de azúcar",
      "Ámbar",
      "Almizcle blanco",
      "Musgo de roble"
    ],
    "mainNotes": [
      "Azafrán",
      "Oud",
      "Haba tonka",
      "Caña de azúcar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La salida es de azafrán y bergamota; el centro se arma con oud y rosa búlgara; el fondo descansa en haba tonka, caña de azúcar y ámbar. La composición combina un registro dulce y ambarado.",
    "likeIf": [
      "Te gustan las aperturas de azafrán que pasan a oud",
      "Te llaman la atención los fondos de haba tonka y caña de azúcar",
      "Preferís perfiles donde aparecen dulce y vainilla"
    ]
  },
  "moschino-toy-2": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Frutal",
      "Floral",
      "Fresco",
      "Cítrico",
      "Almizclado",
      "Dulce",
      "Empolvado",
      "Verde",
      "Floral blanco",
      "Amaderado"
    ],
    "topNotes": [
      "Manzana",
      "Mandarina",
      "Magnolia"
    ],
    "middleNotes": [
      "Grosella blanca",
      "Peonía",
      "Jazmín"
    ],
    "baseNotes": [
      "Almizcle",
      "Sándalo",
      "Amberwood"
    ],
    "mainNotes": [
      "Manzana",
      "Grosella blanca",
      "Almizcle",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Empieza con manzana, mandarina y magnolia. En el corazón hay grosella blanca, peonía y jazmín, y el fondo reúne almizcle, sándalo y amberwood. Queda en un registro dulce, floral y cítrico.",
    "likeIf": [
      "Te gustan las aperturas de manzana que pasan a grosella blanca",
      "Te llaman la atención los fondos de almizcle y sándalo",
      "Preferís perfiles donde aparecen frutal y floral"
    ]
  },
  "moschino-toy-2-bubble-gum": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral"
    ],
    "accords": [
      "Frutal",
      "Dulce",
      "Rosa",
      "Tropical",
      "Floral"
    ],
    "topNotes": [
      "Frutas confitadas",
      "Naranja amarga",
      "Limón"
    ],
    "middleNotes": [
      "Chicle",
      "Rosa búlgara",
      "Durazno",
      "Arándano",
      "Flor de durazno",
      "Canela",
      "Jengibre"
    ],
    "baseNotes": [
      "Almizcle",
      "Ambroxan",
      "Cedro"
    ],
    "mainNotes": [
      "Frutas confitadas",
      "Chicle",
      "Almizcle",
      "Ambroxan"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La apertura combina frutas confitadas, naranja amarga y limón. Después llega el turno de chicle, rosa búlgara y durazno, y el final queda en almizcle, ambroxan y cedro. El resultado es un perfil dulce y floral.",
    "likeIf": [
      "Disfrutás perfiles que van de frutas confitadas hacia chicle",
      "Buscás una composición que termine en almizcle y ambroxan",
      "Te gusta la combinación de dulce y rosa"
    ]
  },
  "moschino-toy-boy": {
    "family": "floral",
    "families": [
      "floral",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Rosa",
      "Floral",
      "Amaderado",
      "Almizclado",
      "Especiado suave",
      "Especiado fresco",
      "Ámbar",
      "Aromático",
      "Especiado cálido",
      "Dulce"
    ],
    "topNotes": [
      "Pimienta rosa",
      "Pera",
      "Nuez moscada de Indonesia",
      "Elemí",
      "Bergamota"
    ],
    "middleNotes": [
      "Rosa",
      "Clavo de olor",
      "Magnolia",
      "Lino"
    ],
    "baseNotes": [
      "Vetiver de Haití",
      "Cashmeran",
      "Sándalo",
      "Ámbar",
      "Sylkolide"
    ],
    "mainNotes": [
      "Pimienta rosa",
      "Rosa",
      "Vetiver de Haití",
      "Cashmeran"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Empieza con pimienta rosa, pera y nuez moscada de Indonesia. En el corazón hay rosa, clavo de olor y magnolia, y el fondo reúne vetiver de Haití, cashmeran y sándalo. Entre sus acordes principales figuran rosa y floral.",
    "likeIf": [
      "Te llama la atención el paso de pimienta rosa a rosa",
      "Querés un cierre de vetiver de Haití y cashmeran",
      "Te atraen los acordes de amaderado y almizclado"
    ]
  },
  "nina-ricci-nina": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Cítrico",
      "Dulce",
      "Fresco",
      "Frutal",
      "Amaderado",
      "Verde",
      "Floral",
      "Lactónico",
      "Almizclado",
      "Avellanado"
    ],
    "topNotes": [
      "Limón de Amalfi",
      "Lima"
    ],
    "middleNotes": [
      "Manzana Granny Smith",
      "Praliné",
      "Peonía",
      "Datura"
    ],
    "baseNotes": [
      "Manzano",
      "Almizcle",
      "Cedro de Virginia"
    ],
    "mainNotes": [
      "Limón de Amalfi",
      "Manzana Granny Smith",
      "Manzano",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La salida es de limón de Amalfi y lima; el centro se arma con manzana Granny Smith, praliné y peonía; el fondo descansa en manzano, almizcle y cedro de Virginia. Es una composición cítrica, dulce y amaderada.",
    "likeIf": [
      "Te llama la atención el paso de limón de Amalfi a manzana Granny Smith",
      "Querés un cierre de manzano y almizcle",
      "Te gusta la combinación de fresco y frutal"
    ]
  },
  "nina-ricci-ricci-ricci": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "amaderado"
    ],
    "accords": [
      "Floral blanco",
      "Verde",
      "Amaderado",
      "Frutal",
      "Aromático",
      "Pachulí",
      "Nardo",
      "Rosa",
      "Especiado cálido",
      "Cítrico"
    ],
    "topNotes": [
      "Ruibarbo",
      "Bergamota"
    ],
    "middleNotes": [
      "Datura",
      "Nardo",
      "Rosa"
    ],
    "baseNotes": [
      "Pachulí",
      "Sándalo"
    ],
    "mainNotes": [
      "Ruibarbo",
      "Datura",
      "Pachulí",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Ruibarbo y bergamota en la salida, datura, nardo y rosa en el corazón y pachulí y sándalo en el fondo. Se apoya en acordes de floral blanco y verde.",
    "likeIf": [
      "Disfrutás perfiles que van de ruibarbo hacia datura",
      "Buscás una composición que termine en pachulí y sándalo",
      "Te atraen los acordes de floral blanco y verde"
    ]
  },
  "paco-rabanne-black-xs": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "amaderado"
    ],
    "accords": [
      "Frutal",
      "Cacao",
      "Especiado cálido",
      "Empolvado",
      "Amaderado",
      "Vainilla",
      "Dulce",
      "Rosa",
      "Especiado suave",
      "Violeta"
    ],
    "topNotes": [
      "Arándano rojo",
      "Pimienta rosa",
      "Tamarindo"
    ],
    "middleNotes": [
      "Cacao",
      "Rosa",
      "Violeta negra"
    ],
    "baseNotes": [
      "Vaina de vainilla negra",
      "Sándalo",
      "Madera de massoia"
    ],
    "mainNotes": [
      "Arándano rojo",
      "Cacao",
      "Vaina de vainilla negra",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Arándano rojo y tamarindo arriba, cacao y rosa en el centro, vainilla negra y sándalo abajo. El cacao junto a la rosa es lo que le da carácter.",
    "likeIf": [
      "Te gusta el cacao en un perfume femenino",
      "Buscás una rosa que no sea limpia ni clásica",
      "Te atrae el tamarindo como apertura frutal"
    ]
  },
  "paco-rabanne-fame": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "floral"
    ],
    "accords": [
      "Tropical",
      "Frutal",
      "Vainilla",
      "Dulce",
      "Amaderado",
      "Floral blanco",
      "Empolvado",
      "Terpénico",
      "Ámbar",
      "Especiado fresco"
    ],
    "topNotes": [
      "Mango",
      "Bergamota"
    ],
    "middleNotes": [
      "Jazmín",
      "Olíbano"
    ],
    "baseNotes": [
      "Vainilla",
      "Sándalo"
    ],
    "mainNotes": [
      "Mango",
      "Jazmín",
      "Vainilla",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Primero mango y bergamota. Después jazmín y olíbano. Al final, vainilla y sándalo. El resultado es un perfil dulce, amaderado y floral.",
    "likeIf": [
      "Te gusta la combinación de dulce y amaderado",
      "Te gusta la combinación de vainilla y dulce",
      "Te atraen los acordes de tropical y frutal"
    ]
  },
  "paco-rabanne-fame-parfum": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "ambarado-intenso"
    ],
    "accords": [
      "Tropical",
      "Amaderado",
      "Ámbar",
      "Frutal",
      "Especiado cálido",
      "Dulce",
      "Floral blanco",
      "Empolvado",
      "Almizclado",
      "Balsámico"
    ],
    "topNotes": [
      "Mango",
      "Bergamota",
      "Pimienta rosa"
    ],
    "middleNotes": [
      "Jazmín",
      "Olíbano",
      "Pachulí"
    ],
    "baseNotes": [
      "Benjuí",
      "Sándalo",
      "Almizcle",
      "Helvetolide"
    ],
    "mainNotes": [
      "Mango",
      "Jazmín",
      "Benjuí",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "La apertura combina mango, bergamota y pimienta rosa. Después llega el turno de jazmín, olíbano y pachulí, y el final queda en benjuí, sándalo y almizcle. El resultado es un perfil dulce, amaderado y ambarado.",
    "likeIf": [
      "Te gusta la combinación de ámbar y frutal",
      "Buscás una composición que termine en benjuí y sándalo",
      "Te atraen los acordes de tropical y amaderado"
    ]
  },
  "paco-rabanne-invictus": {
    "family": "acuatico",
    "families": [
      "acuatico",
      "citrico-fresco",
      "amaderado"
    ],
    "accords": [
      "Cítrico",
      "Marino",
      "Aromático",
      "Especiado fresco",
      "Amaderado",
      "Salado"
    ],
    "topNotes": [
      "Notas marinas",
      "Pomelo",
      "Mandarina"
    ],
    "middleNotes": [
      "Laurel",
      "Jazmín"
    ],
    "baseNotes": [
      "Ámbar gris",
      "Madera de guayaco",
      "Musgo de roble",
      "Pachulí"
    ],
    "mainNotes": [
      "Pomelo",
      "Notas marinas",
      "Ámbar gris",
      "Musgo de roble"
    ],
    "occasions": [
      "diario"
    ],
    "seasons": [
      "calor"
    ],
    "aromaticIntensity": "suave",
    "feel": "Cítrico y marino, con un fondo salado y limpio. Es de los más claros y deportivos del catálogo.",
    "likeIf": [
      "Preferís lo cítrico y marino",
      "Te llama la atención un corazón con laurel y jazmín",
      "Buscás una composición que termine en madera de guayaco y musgo de roble"
    ]
  },
  "paco-rabanne-invictus-acqua": {
    "family": "acuatico",
    "families": [
      "acuatico",
      "citrico-fresco",
      "aromatico-limpio"
    ],
    "accords": [
      "Marino",
      "Cítrico",
      "Aromático",
      "Ámbar",
      "Salado",
      "Amaderado",
      "Acuático",
      "Especiado fresco"
    ],
    "topNotes": [
      "Pomelo"
    ],
    "middleNotes": [
      "Notas marinas"
    ],
    "baseNotes": [
      "Amberwood"
    ],
    "mainNotes": [
      "Pomelo",
      "Notas marinas",
      "Amberwood"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Pomelo, notas marinas y amberwood. Tres notas y nada más: un acuático salado, directo y sin vueltas.",
    "likeIf": [
      "Buscás un acuático simple y salado",
      "Te gusta el pomelo sobre una base marina",
      "Preferís pocas notas a una pirámide larga"
    ]
  },
  "paco-rabanne-invictus-legend": {
    "family": "acuatico",
    "families": [
      "acuatico",
      "aromatico-limpio",
      "especiado"
    ],
    "accords": [
      "Marino",
      "Aromático",
      "Especiado fresco",
      "Salado",
      "Ámbar",
      "Cítrico",
      "Amaderado",
      "Especiado cálido",
      "Alcanforado",
      "Acuático"
    ],
    "topNotes": [
      "Notas marinas",
      "Sal marina",
      "Pomelo"
    ],
    "middleNotes": [
      "Laurel",
      "Geranio",
      "Especias"
    ],
    "baseNotes": [
      "Ámbar rojo",
      "Madera de guayaco"
    ],
    "mainNotes": [
      "Notas marinas",
      "Laurel",
      "Ámbar rojo",
      "Madera de guayaco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Sale con notas marinas, sal marina y pomelo, se acomoda en laurel, geranio y especias y se queda en ámbar rojo y madera de guayaco. Se apoya en acordes de marino y aromático.",
    "likeIf": [
      "Disfrutás perfiles que van de notas marinas hacia laurel",
      "Buscás una composición que termine en ámbar rojo y madera de guayaco",
      "Te atrae un perfil salado con un matiz alcanforado"
    ]
  },
  "paco-rabanne-invictus-platinum": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "especiado",
      "citrico-fresco"
    ],
    "accords": [
      "Aromático",
      "Especiado fresco",
      "Verde",
      "Amaderado",
      "Cítrico",
      "Lavanda",
      "Amargo",
      "Pachulí"
    ],
    "topNotes": [
      "Absenta",
      "Pomelo"
    ],
    "middleNotes": [
      "Menta",
      "Lavanda"
    ],
    "baseNotes": [
      "Ciprés",
      "Pachulí"
    ],
    "mainNotes": [
      "Absenta",
      "Menta",
      "Ciprés",
      "Pachulí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Abre con absenta y pomelo. El corazón suma menta y lavanda y el fondo se asienta en ciprés y pachulí. Entre sus acordes principales figuran aromático y especiado fresco.",
    "likeIf": [
      "Te llama la atención el paso de absenta a menta",
      "Querés un cierre de ciprés y pachulí",
      "Te gusta la combinación de aromático y especiado fresco"
    ]
  },
  "paco-rabanne-invictus-victory": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "ambarado-intenso",
      "aromatico-limpio"
    ],
    "accords": [
      "Vainilla",
      "Ámbar",
      "Dulce",
      "Aromático",
      "Especiado suave",
      "Lavanda",
      "Empolvado",
      "Especiado fresco",
      "Cítrico",
      "Balsámico"
    ],
    "topNotes": [
      "Pimienta rosa",
      "Limón"
    ],
    "middleNotes": [
      "Olíbano",
      "Lavanda"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Ámbar"
    ],
    "mainNotes": [
      "Pimienta rosa",
      "Olíbano",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Abre con pimienta rosa y limón. El corazón suma olíbano y lavanda y el fondo se asienta en vainilla, haba tonka y ámbar. Queda en un registro dulce, ambarado y aromático.",
    "likeIf": [
      "Te gustan las aperturas de pimienta rosa que pasan a olíbano",
      "Te llaman la atención los fondos de vainilla y haba tonka",
      "Te atrae un perfil especiado suave con lavanda"
    ]
  },
  "paco-rabanne-invictus-victory-elixir": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "ambarado-intenso"
    ],
    "accords": [
      "Vainilla",
      "Especiado cálido",
      "Ámbar",
      "Aromático",
      "Dulce",
      "Balsámico",
      "Lavanda",
      "Especiado fresco",
      "Ahumado",
      "Empolvado"
    ],
    "topNotes": [
      "Lavanda",
      "Cardamomo",
      "Pimienta negra"
    ],
    "middleNotes": [
      "Incienso",
      "Pachulí"
    ],
    "baseNotes": [
      "Vaina de vainilla",
      "Haba tonka"
    ],
    "mainNotes": [
      "Lavanda",
      "Incienso",
      "Vaina de vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Al principio lavanda, cardamomo y pimienta negra. Más adelante entran incienso y pachulí, y el fondo termina en vaina de vainilla y haba tonka. Queda en un registro dulce, especiado y ambarado.",
    "likeIf": [
      "Te gustan las aperturas de lavanda que pasan a incienso",
      "Te llaman la atención los fondos de vaina de vainilla y haba tonka",
      "Preferís perfiles donde aparecen vainilla y especiado cálido"
    ]
  },
  "paco-rabanne-lady-million": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "citrico-fresco"
    ],
    "accords": [
      "Floral blanco",
      "Dulce",
      "Miel",
      "Cítrico",
      "Frutal",
      "Floral",
      "Pachulí",
      "Animálico",
      "Ámbar"
    ],
    "topNotes": [
      "Frambuesa",
      "Neroli",
      "Limón de Amalfi"
    ],
    "middleNotes": [
      "Jazmín",
      "Flor de naranjo africana",
      "Gardenia"
    ],
    "baseNotes": [
      "Miel blanca",
      "Pachulí",
      "Ámbar"
    ],
    "mainNotes": [
      "Frambuesa",
      "Jazmín",
      "Miel blanca",
      "Pachulí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Frambuesa, neroli y limón de Amalfi en la salida, jazmín, flor de naranjo africana y gardenia en el corazón y miel blanca, pachulí y ámbar en el fondo. El perfil cruza lo floral con lo dulce.",
    "likeIf": [
      "Te atrae el contraste entre frambuesa y un corazón de jazmín",
      "Preferís que el final quede en miel blanca y pachulí",
      "Querés explorar lo floral blanco junto a lo dulce"
    ]
  },
  "paco-rabanne-olympea": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "amaderado"
    ],
    "accords": [
      "Vainilla",
      "Salado",
      "Floral blanco",
      "Amaderado",
      "Ámbar",
      "Empolvado"
    ],
    "topNotes": [
      "Jazmín acuático",
      "Mandarina verde",
      "Flor de jengibre"
    ],
    "middleNotes": [
      "Vainilla",
      "Sal"
    ],
    "baseNotes": [
      "Madera de cachemira",
      "Ámbar gris",
      "Sándalo"
    ],
    "mainNotes": [
      "Vainilla salada",
      "Jazmín acuático",
      "Madera de cachemira"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Combina acordes de vainilla y salado sobre notas de madera de cachemira y sándalo.",
    "likeIf": [
      "Te gustan las aperturas de mandarina verde y flor de jengibre",
      "Te intriga la vainilla salada",
      "Buscás una composición que termine en madera de cachemira y sándalo"
    ]
  },
  "paco-rabanne-one-million": {
    "family": "especiado",
    "families": [
      "especiado",
      "cuero-ahumado",
      "ambarado-intenso"
    ],
    "accords": [
      "Especiado cálido",
      "Canela",
      "Cítrico",
      "Ámbar",
      "Amaderado",
      "Cuero",
      "Rosa"
    ],
    "topNotes": [
      "Mandarina sanguina",
      "Pomelo",
      "Menta"
    ],
    "middleNotes": [
      "Canela",
      "Notas especiadas",
      "Rosa"
    ],
    "baseNotes": [
      "Ámbar",
      "Cuero",
      "Notas amaderadas",
      "Pachulí de India"
    ],
    "mainNotes": [
      "Mandarina",
      "Canela",
      "Cuero",
      "Ámbar"
    ],
    "occasions": [
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Cítrico brillante que cae rápido sobre canela y cuero. Un perfume de salida, no de escritorio.",
    "likeIf": [
      "Buscás algo para salir",
      "Te gustan las especias cálidas",
      "Querés un arranque especiado y cálido"
    ]
  },
  "paco-rabanne-one-million-elixir": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "amaderado"
    ],
    "accords": [
      "Vainilla",
      "Frutal",
      "Rosa",
      "Dulce",
      "Amaderado",
      "Verde",
      "Empolvado",
      "Balsámico",
      "Aromático",
      "Floral"
    ],
    "topNotes": [
      "Manzana",
      "Davana"
    ],
    "middleNotes": [
      "Rosa de Damasco",
      "Cedro",
      "Osmanto"
    ],
    "baseNotes": [
      "Absoluto de vainilla",
      "Haba tonka",
      "Pachulí"
    ],
    "mainNotes": [
      "Manzana",
      "Rosa de Damasco",
      "Absoluto de vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Desde manzana y davana avanza hacia rosa de Damasco, cedro y osmanto y cierra apoyado en absoluto de vainilla, haba tonka y pachulí. Se apoya en acordes de vainilla y frutal.",
    "likeIf": [
      "Disfrutás perfiles que van de manzana hacia rosa de Damasco",
      "Buscás una composición que termine en absoluto de vainilla y haba tonka",
      "Te atraen los acordes de vainilla y frutal"
    ]
  },
  "paco-rabanne-one-million-lucky": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "gourmand-dulce",
      "citrico-fresco"
    ],
    "accords": [
      "Amaderado",
      "Dulce",
      "Avellanado",
      "Miel",
      "Frutal",
      "Cítrico",
      "Ámbar",
      "Ozónico",
      "Floral blanco",
      "Floral"
    ],
    "topNotes": [
      "Ciruela",
      "Notas ozónicas",
      "Pomelo",
      "Bergamota"
    ],
    "middleNotes": [
      "Avellana",
      "Miel",
      "Cedro",
      "Madera de cachemira",
      "Azahar",
      "Jazmín"
    ],
    "baseNotes": [
      "Amberwood",
      "Pachulí",
      "Vetiver",
      "Musgo de roble"
    ],
    "mainNotes": [
      "Ciruela",
      "Avellana",
      "Amberwood",
      "Pachulí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "La salida es de ciruela, notas ozónicas y pomelo; el centro se arma con avellana, miel y cedro; el fondo descansa en amberwood, pachulí y vetiver. Queda en un registro amaderado, dulce y cítrico.",
    "likeIf": [
      "Te gustan las aperturas de ciruela que pasan a avellana",
      "Te llaman la atención los fondos de amberwood y pachulí",
      "Preferís perfiles donde aparecen avellanado y miel"
    ]
  },
  "paco-rabanne-phantom": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "citrico-fresco",
      "gourmand-dulce"
    ],
    "accords": [
      "Cítrico",
      "Vainilla",
      "Lavanda",
      "Terroso",
      "Aromático",
      "Amaderado",
      "Ahumado"
    ],
    "topNotes": [
      "Lavanda",
      "Ralladura de limón",
      "Limón de Amalfi"
    ],
    "middleNotes": [
      "Lavanda",
      "Notas terrosas",
      "Manzana",
      "Humo",
      "Pachulí"
    ],
    "baseNotes": [
      "Vainilla",
      "Lavanda",
      "Vetiver"
    ],
    "mainNotes": [
      "Limón",
      "Lavanda",
      "Vainilla",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Limón muy vivo sobre una lavanda cremosa que termina en vainilla. Limpio y goloso a la vez.",
    "likeIf": [
      "Te gusta la lavanda",
      "Buscás el cruce de lo cítrico con lo ahumado",
      "Buscás una composición que termine en vainilla y vetiver"
    ]
  },
  "paco-rabanne-phantom-parfum": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "gourmand-dulce",
      "especiado"
    ],
    "accords": [
      "Aromático",
      "Vainilla",
      "Especiado cálido",
      "Cítrico",
      "Lavanda",
      "Amaderado",
      "Especiado fresco",
      "Empolvado",
      "Dulce",
      "Verde"
    ],
    "topNotes": [
      "Cardamomo",
      "Bergamota",
      "Ruibarbo",
      "Limón"
    ],
    "middleNotes": [
      "Lavanda",
      "Cedro",
      "Pachulí",
      "Geranio"
    ],
    "baseNotes": [
      "Vainilla",
      "Bálsamo de Tolú",
      "Vetiver de Haití"
    ],
    "mainNotes": [
      "Cardamomo",
      "Lavanda",
      "Vainilla",
      "Bálsamo de Tolú"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La apertura combina cardamomo, bergamota y ruibarbo. Después llega el turno de lavanda, cedro y pachulí, y el final queda en vainilla, bálsamo de Tolú y vetiver de Haití. El conjunto es aromático, dulce y especiado.",
    "likeIf": [
      "Te gustan las aperturas con cardamomo que pasan a lavanda",
      "Preferís que el final quede en vainilla y bálsamo de Tolú",
      "Te gusta la combinación de especiado cálido y cítrico"
    ]
  },
  "paco-rabanne-pure-xs": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "floral"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Amaderado",
      "Empolvado",
      "Floral amarillo",
      "Coco",
      "Lactónico",
      "Almizclado",
      "Floral blanco",
      "Frutal"
    ],
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "mainNotes": [
      "Pochoclo",
      "Vainilla",
      "Ylang ylang",
      "Coco",
      "Durazno",
      "Azahar",
      "Almizcle blanco",
      "Sándalo",
      "Amberwood",
      "Ambreta"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Pochoclo, vainilla, ylang ylang y coco marcan el perfil, acompañados por durazno, azahar, almizcle blanco y sándalo. Queda en un registro dulce, amaderado y floral.",
    "likeIf": [
      "Buscás perfiles donde convivan pochoclo y vainilla",
      "Te atrae la presencia de coco y durazno",
      "Buscás perfiles donde convivan azahar y almizcle blanco"
    ]
  },
  "paco-rabanne-xs-aphrodisiaque": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "cuero-ahumado"
    ],
    "accords": [
      "Dulce",
      "Miel",
      "Especiado cálido",
      "Cuero",
      "Canela",
      "Avellanado",
      "Animálico",
      "Almendra",
      "Floral blanco",
      "Amaderado"
    ],
    "topNotes": [
      "Canela",
      "Azafrán"
    ],
    "middleNotes": [
      "Miel",
      "Azahar",
      "Ciprés"
    ],
    "baseNotes": [
      "Praliné",
      "Cuero",
      "Almendra"
    ],
    "mainNotes": [
      "Canela",
      "Miel",
      "Praliné",
      "Cuero"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Desde canela y azafrán avanza hacia miel, azahar y ciprés y cierra apoyado en praliné, cuero y almendra. Se apoya en acordes de dulce y miel.",
    "likeIf": [
      "Disfrutás perfiles que van de canela hacia miel",
      "Buscás una composición que termine en praliné y cuero",
      "Querés explorar lo dulce con carácter especiado"
    ]
  },
  "paco-rabanne-xs-black": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "citrico-fresco"
    ],
    "accords": [
      "Dulce",
      "Especiado cálido",
      "Cítrico",
      "Ámbar",
      "Aromático",
      "Amaderado",
      "Balsámico",
      "Canela",
      "Pachulí",
      "Lactónico"
    ],
    "topNotes": [
      "Limón",
      "Salvia"
    ],
    "middleNotes": [
      "Praliné",
      "Canela",
      "Bálsamo de Tolú",
      "Cardamomo negro"
    ],
    "baseNotes": [
      "Pachulí",
      "Palo de rosa de Brasil",
      "Ámbar negro"
    ],
    "mainNotes": [
      "Limón",
      "Praliné",
      "Pachulí",
      "Palo de rosa de Brasil"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Limón y salvia arriba, praliné y canela en el centro, pachulí y ámbar negro abajo. Dulce y especiado, con el pachulí impidiendo que se empalague.",
    "likeIf": [
      "Te gusta el praliné con canela",
      "Buscás algo dulce con pachulí debajo",
      "Te atrae el bálsamo de Tolú"
    ]
  },
  "parfums-de-marly-delina": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco"
    ],
    "accords": [
      "Rosa",
      "Floral",
      "Frutal",
      "Fresco",
      "Almizclado",
      "Aromático",
      "Empolvado"
    ],
    "topNotes": [
      "Lichi",
      "Ruibarbo",
      "Bergamota",
      "Nuez moscada",
      "Grosella negra"
    ],
    "middleNotes": [
      "Rosa de Turquía",
      "Peonía",
      "Almizcle",
      "Petalia",
      "Vainilla"
    ],
    "baseNotes": [
      "Cashmeran",
      "Incienso",
      "Cedro",
      "Vetiver de Haití",
      "Caramelo"
    ],
    "mainNotes": [
      "Lichi",
      "Rosa de Turquía",
      "Peonía",
      "Cashmeran"
    ],
    "occasions": [
      "diario",
      "evento"
    ],
    "seasons": [
      "calor",
      "todo-el-ano"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Rosa y lichi con una frescura frutal arriba. Es floral, expresivo y con un carácter muy marcado.",
    "likeIf": [
      "Te gusta la rosa",
      "Buscás un floral expresivo y marcado",
      "Querés algo elegante para el día"
    ]
  },
  "parfums-de-marly-haltane": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "aromatico-limpio",
      "gourmand-dulce"
    ],
    "accords": [
      "Oud",
      "Aromático",
      "Dulce",
      "Especiado cálido",
      "Amaderado",
      "Lavanda",
      "Especiado fresco",
      "Metálico",
      "Cuero",
      "Especiado suave"
    ],
    "topNotes": [
      "Lavanda",
      "Salvia sclarea",
      "Bergamota"
    ],
    "middleNotes": [
      "Azafrán",
      "Praliné"
    ],
    "baseNotes": [
      "Oud",
      "Cedro"
    ],
    "mainNotes": [
      "Lavanda",
      "Azafrán",
      "Oud",
      "Cedro"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Arranca con lavanda, salvia sclarea y bergamota, pasa por azafrán y praliné y termina sobre oud y cedro. Es una composición aromática y dulce.",
    "likeIf": [
      "Te llama la atención el paso de lavanda a azafrán",
      "Querés un cierre de oud y cedro",
      "Te atraen los matices aromáticos y de cuero"
    ]
  },
  "parfums-de-marly-layton-exclusif": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "ambarado-intenso",
      "citrico-fresco"
    ],
    "accords": [
      "Amaderado",
      "Oud",
      "Empolvado",
      "Cítrico",
      "Vainilla",
      "Animálico",
      "Especiado cálido",
      "Almendra",
      "Frutal",
      "Ámbar"
    ],
    "topNotes": [
      "Almendra",
      "Manzana",
      "Mandarina",
      "Bergamota",
      "Pomelo",
      "Notas acuáticas"
    ],
    "middleNotes": [
      "Civeta",
      "Lavanda",
      "Canela",
      "Geranio",
      "Rosa",
      "Gardenia",
      "Nenúfar"
    ],
    "baseNotes": [
      "Oud de Laos",
      "Madera de guayaco",
      "Vainilla",
      "Sándalo",
      "Ámbar",
      "Musgo de roble",
      "Café",
      "Cypriol",
      "Cuero",
      "Hoja de pachulí de Indonesia",
      "Pimienta rosa"
    ],
    "mainNotes": [
      "Almendra",
      "Civeta",
      "Oud de Laos",
      "Madera de guayaco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Almendra, manzana y mandarina arriba; civeta, lavanda y canela en el centro; un fondo largo de oud de Laos, madera de guayaco y vainilla. Empieza casi goloso y termina oscuro y animálico: ese giro es el perfume.",
    "likeIf": [
      "Te gusta la almendra como apertura de un amaderado",
      "Buscás un oud con vainilla y café debajo",
      "Te atrae lo animálico de la civeta"
    ]
  },
  "ralph-lauren-polo": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "aromatico-limpio",
      "especiado"
    ],
    "accords": [
      "Amaderado",
      "Aromático",
      "Especiado fresco",
      "Terroso",
      "Tabaco",
      "Cuero",
      "Herbal",
      "Musgoso",
      "Verde",
      "Dulce"
    ],
    "topNotes": [
      "Bayas de enebro",
      "Albahaca",
      "Artemisa",
      "Alcaravea",
      "Cilantro",
      "Bergamota"
    ],
    "middleNotes": [
      "Agujas de pino",
      "Cuero",
      "Manzanilla",
      "Pimienta",
      "Clavel",
      "Geranio",
      "Jazmín",
      "Rosa"
    ],
    "baseNotes": [
      "Tabaco",
      "Musgo de roble",
      "Pachulí",
      "Cedro",
      "Vetiver",
      "Almizcle",
      "Ámbar"
    ],
    "mainNotes": [
      "Bayas de enebro",
      "Agujas de pino",
      "Tabaco",
      "Musgo de roble"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Arranca con bayas de enebro, albahaca y artemisa, pasa por agujas de pino, cuero y manzanilla y termina sobre tabaco, musgo de roble y pachulí. Entre sus acordes principales figuran amaderado y aromático.",
    "likeIf": [
      "Te llama la atención el paso de bayas de enebro a agujas de pino",
      "Querés un cierre de tabaco y musgo de roble",
      "Te gusta la combinación de especiado fresco y terroso"
    ]
  },
  "ralph-lauren-polo-black": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "citrico-fresco"
    ],
    "accords": [
      "Tropical",
      "Frutal",
      "Amaderado",
      "Dulce",
      "Cítrico",
      "Aromático",
      "Especiado cálido",
      "Pachulí",
      "Terpénico",
      "Empolvado"
    ],
    "topNotes": [
      "Mango",
      "Mandarina",
      "Limón"
    ],
    "middleNotes": [
      "Sándalo",
      "Salvia",
      "Artemisa"
    ],
    "baseNotes": [
      "Pachulí",
      "Haba tonka"
    ],
    "mainNotes": [
      "Mango",
      "Sándalo",
      "Pachulí",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Al principio mango, mandarina y limón. Más adelante entran sándalo, salvia y artemisa, y el fondo termina en pachulí y haba tonka. La composición combina un registro dulce y amaderado.",
    "likeIf": [
      "Te gustan las aperturas de mango que pasan a sándalo",
      "Te llaman la atención los fondos de pachulí y haba tonka",
      "Preferís perfiles donde aparecen tropical y frutal"
    ]
  },
  "ralph-lauren-polo-blue": {
    "family": "acuatico",
    "families": [
      "acuatico",
      "aromatico-limpio"
    ],
    "accords": [
      "Ozónico",
      "Acuático",
      "Aromático",
      "Especiado fresco",
      "Verde",
      "Almizclado"
    ],
    "topNotes": [
      "Pepino",
      "Melón",
      "Mandarina"
    ],
    "middleNotes": [
      "Albahaca",
      "Salvia",
      "Geranio"
    ],
    "baseNotes": [
      "Gamuza",
      "Notas amaderadas",
      "Almizcle"
    ],
    "mainNotes": [
      "Pepino",
      "Melón",
      "Albahaca",
      "Gamuza"
    ],
    "occasions": [
      "diario"
    ],
    "seasons": [
      "calor"
    ],
    "aromaticIntensity": "suave",
    "feel": "Pepino y melón con hierbas verdes: transparente, aireado y muy fácil de llevar de día.",
    "likeIf": [
      "Te llama la atención un corazón con albahaca y salvia",
      "Te gustan las aperturas de pepino y melón",
      "Preferís lo acuático y verde"
    ]
  },
  "ralph-lauren-polo-red": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "gourmand-dulce",
      "ambarado-intenso"
    ],
    "accords": [
      "Cítrico",
      "Frutal",
      "Ámbar",
      "Especiado cálido",
      "Café",
      "Amaderado",
      "Aromático",
      "Especiado fresco",
      "Especiado suave"
    ],
    "topNotes": [
      "Arándano rojo",
      "Pomelo",
      "Limón de Italia"
    ],
    "middleNotes": [
      "Azafrán",
      "Salvia"
    ],
    "baseNotes": [
      "Ámbar",
      "Café",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Arándano rojo",
      "Azafrán",
      "Ámbar",
      "Café"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "Arranca con arándano rojo, pomelo y limón de Italia, pasa por azafrán y salvia y termina sobre ámbar, café y notas amaderadas. Es una composición cítrica y ambarada.",
    "likeIf": [
      "Te llama la atención el paso de arándano rojo a azafrán",
      "Querés un cierre de ámbar y café",
      "Te gusta la combinación de cítrico y frutal"
    ]
  },
  "ralph-lauren-polo-sport": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "especiado",
      "citrico-fresco"
    ],
    "accords": [
      "Aromático",
      "Especiado fresco",
      "Cítrico",
      "Verde",
      "Fresco",
      "Aldehídico",
      "Amaderado",
      "Lavanda",
      "Marino",
      "Herbal"
    ],
    "topNotes": [
      "Menta",
      "Aldehídos",
      "Lavanda",
      "Bergamota",
      "Limón",
      "Mandarina",
      "Artemisa",
      "Neroli"
    ],
    "middleNotes": [
      "Hierba marina",
      "Jengibre",
      "Jazmín",
      "Geranio",
      "Ciclamen",
      "Rosa",
      "Palo de rosa de Brasil"
    ],
    "baseNotes": [
      "Almizcle",
      "Sándalo",
      "Cedro",
      "Madera de guayaco",
      "Ámbar"
    ],
    "mainNotes": [
      "Menta",
      "Hierba marina",
      "Almizcle",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Desde menta, aldehídos y lavanda avanza hacia hierba marina, jengibre y jazmín y cierra apoyado en almizcle, sándalo y cedro. El conjunto es aromático, especiado y cítrico.",
    "likeIf": [
      "Te atrae el contraste entre menta y un corazón de hierba marina",
      "Preferís que el final quede en almizcle y sándalo",
      "Te gusta la combinación de especiado fresco y cítrico"
    ]
  },
  "ralph-lauren-polo-ultra-blue": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "acuatico",
      "amaderado"
    ],
    "accords": [
      "Cítrico",
      "Mineral",
      "Salado",
      "Amaderado",
      "Aromático",
      "Ámbar",
      "Especiado fresco",
      "Almizclado",
      "Fresco"
    ],
    "topNotes": [
      "Cidra",
      "Limón",
      "Verbena de limón",
      "Albahaca"
    ],
    "middleNotes": [
      "Notas minerales",
      "Ambertonic"
    ],
    "baseNotes": [
      "Sal",
      "Almizcle",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Cidra",
      "Notas minerales",
      "Sal",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Abre con cidra, limón y verbena de limón. El corazón suma notas minerales y ambertonic y el fondo se asienta en sal, almizcle y notas amaderadas. Entre sus acordes principales figuran cítrico y mineral.",
    "likeIf": [
      "Te llama la atención el paso de cidra a notas minerales",
      "Querés un cierre de sal y almizcle",
      "Te gusta la combinación de cítrico y mineral"
    ]
  },
  "ralph-lauren-ralph": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "citrico-fresco"
    ],
    "accords": [
      "Floral",
      "Frutal",
      "Cítrico",
      "Fresco",
      "Verde"
    ],
    "topNotes": [
      "Hoja de manzano",
      "Mandarina de Italia",
      "Osmanto de Japón"
    ],
    "middleNotes": [
      "Fresia amarilla",
      "Magnolia",
      "Boronia"
    ],
    "baseNotes": [
      "Almizcle",
      "Iris blanco"
    ],
    "mainNotes": [
      "Hoja de manzano",
      "Fresia amarilla",
      "Almizcle",
      "Iris blanco"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Desde hoja de manzano, mandarina de Italia y osmanto de Japón avanza hacia fresia amarilla, magnolia y boronia y cierra apoyado en almizcle y iris blanco. El conjunto es floral y cítrico.",
    "likeIf": [
      "Te atrae el contraste entre hoja de manzano y un corazón de fresia amarilla",
      "Preferís que el final quede en almizcle y iris blanco",
      "Querés explorar lo floral junto a lo frutal"
    ]
  },
  "ralph-lauren-ralph-blue": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "amaderado"
    ],
    "accords": [
      "Floral blanco",
      "Floral",
      "Fresco",
      "Cítrico",
      "Verde",
      "Amaderado"
    ],
    "topNotes": [
      "Jazmín",
      "Gardenia",
      "Loto",
      "Muguet",
      "Peonía rosa",
      "Pomelo",
      "Melón"
    ],
    "middleNotes": [
      "Nardo",
      "Azahar",
      "Albahaca",
      "Verbena",
      "Rosa"
    ],
    "baseNotes": [
      "Almizcle",
      "Vetiver",
      "Musgo de roble",
      "Gamuza",
      "Sándalo",
      "Ámbar"
    ],
    "mainNotes": [
      "Jazmín",
      "Nardo",
      "Almizcle",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "La salida es de jazmín, gardenia y loto; el centro se arma con nardo, azahar y albahaca; el fondo descansa en almizcle, vetiver y musgo de roble. Entre sus acordes principales figuran floral blanco y floral.",
    "likeIf": [
      "Te llama la atención el paso de jazmín a nardo",
      "Querés un cierre de almizcle y vetiver",
      "Te gusta la combinación de floral blanco y floral"
    ]
  },
  "rasasi-hawas-for-him": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "acuatico",
      "especiado"
    ],
    "accords": [
      "Frutal",
      "Cítrico",
      "Acuático",
      "Fresco",
      "Especiado cálido",
      "Dulce",
      "Ámbar"
    ],
    "topNotes": [
      "Manzana",
      "Bergamota",
      "Limón",
      "Canela"
    ],
    "middleNotes": [
      "Notas acuáticas",
      "Ciruela",
      "Azahar",
      "Cardamomo"
    ],
    "baseNotes": [
      "Ámbar gris",
      "Almizcle",
      "Pachulí",
      "Madera de deriva"
    ],
    "mainNotes": [
      "Manzana",
      "Ciruela",
      "Notas acuáticas",
      "Ámbar gris"
    ],
    "occasions": [
      "diario",
      "versatil"
    ],
    "seasons": [
      "calor",
      "todo-el-ano"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Fresco y frutal con un fondo acuático y ambarado. La apertura es liviana y el fondo le da cuerpo.",
    "likeIf": [
      "Buscás un fresco con fondo cálido",
      "Te gusta lo frutal",
      "Lo querés para el día"
    ]
  },
  "shakira-shakira-elixir": {
    "family": "ambarado-intenso",
    "families": [
      "ambarado-intenso",
      "especiado",
      "floral"
    ],
    "accords": [
      "Ámbar",
      "Especiado fresco",
      "Empolvado",
      "Almizclado",
      "Floral",
      "Floral blanco",
      "Frutal",
      "Amaderado",
      "Animálico",
      "Dulce"
    ],
    "topNotes": [
      "Pimienta negra",
      "Azahar"
    ],
    "middleNotes": [
      "Durazno",
      "Fresia",
      "Peonía"
    ],
    "baseNotes": [
      "Ámbar",
      "Estoraque",
      "Almizcle",
      "Cedro blanco"
    ],
    "mainNotes": [
      "Pimienta negra",
      "Durazno",
      "Ámbar",
      "Estoraque"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "intensa",
    "feel": "La apertura combina pimienta negra y azahar. Después llega el turno de durazno, fresia y peonía, y el final queda en ámbar, estoraque y almizcle. El perfil cruza lo ambarado con lo especiado.",
    "likeIf": [
      "Te atrae el contraste entre pimienta negra y un corazón de durazno",
      "Preferís que el final quede en ámbar y estoraque",
      "Te gusta la combinación de empolvado y almizclado"
    ]
  },
  "shakira-shakira-rock": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "floral",
      "gourmand-dulce"
    ],
    "accords": [
      "Cítrico",
      "Floral blanco",
      "Dulce",
      "Frutal",
      "Tropical",
      "Fresco",
      "Amaderado"
    ],
    "topNotes": [
      "Maracuyá",
      "Mandarina verde",
      "Bergamota",
      "Limón"
    ],
    "middleNotes": [
      "Jazmín",
      "Azahar",
      "Flor de tiaré"
    ],
    "baseNotes": [
      "Almizcle",
      "Ámbar",
      "Cedro",
      "Pachulí"
    ],
    "mainNotes": [
      "Maracuyá",
      "Jazmín",
      "Almizcle",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Sale con maracuyá, mandarina verde y bergamota, se acomoda en jazmín, azahar y flor de tiaré y se queda en almizcle, ámbar y cedro. Se apoya en acordes de cítrico y floral blanco.",
    "likeIf": [
      "Disfrutás perfiles que van de maracuyá hacia jazmín",
      "Buscás una composición que termine en almizcle y ámbar",
      "Buscás perfiles donde convivan floral blanco y dulce"
    ]
  },
  "thierry-mugler-a-men": {
    "family": "especiado",
    "families": [
      "especiado",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Especiado cálido",
      "Dulce",
      "Caramelo",
      "Vainilla",
      "Café",
      "Amaderado",
      "Pachulí",
      "Ámbar",
      "Aromático",
      "Miel"
    ],
    "topNotes": [
      "Lavanda",
      "Menta",
      "Cilantro",
      "Notas verdes",
      "Bergamota"
    ],
    "middleNotes": [
      "Caramelo",
      "Pachulí",
      "Miel",
      "Leche",
      "Cedro",
      "Jazmín",
      "Muguet"
    ],
    "baseNotes": [
      "Café",
      "Vainilla",
      "Haba tonka",
      "Benjuí",
      "Ámbar",
      "Sándalo",
      "Almizcle"
    ],
    "mainNotes": [
      "Lavanda",
      "Caramelo",
      "Café",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Sale con lavanda, menta y cilantro, se acomoda en caramelo, pachulí y miel y se queda en café, vainilla y haba tonka. El conjunto es especiado, dulce y amaderado.",
    "likeIf": [
      "Te atrae el contraste entre lavanda y un corazón de caramelo",
      "Preferís que el final quede en café y vainilla",
      "Te gusta la combinación de amaderado y pachulí"
    ]
  },
  "thierry-mugler-alien": {
    "family": "floral",
    "families": [
      "floral",
      "ambarado-intenso"
    ],
    "accords": [
      "Floral blanco",
      "Ámbar",
      "Floral",
      "Animálico",
      "Empolvado"
    ],
    "topNotes": [
      "Jazmín sambac"
    ],
    "middleNotes": [
      "Cashmeran"
    ],
    "baseNotes": [
      "Ámbar"
    ],
    "mainNotes": [
      "Jazmín sambac",
      "Cashmeran",
      "Ámbar"
    ],
    "occasions": [
      "evento",
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Jazmín solar sobre ámbar, con muy pocos ingredientes y un carácter muy marcado. Es un perfume de firma, no de fondo.",
    "likeIf": [
      "Buscás un perfume de carácter muy marcado",
      "Te gustan los florales intensos",
      "Querés un perfume que te identifique"
    ]
  },
  "thierry-mugler-alien-goddess": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "amaderado"
    ],
    "accords": [
      "Vainilla",
      "Empolvado",
      "Floral blanco",
      "Amaderado",
      "Cítrico",
      "Almizclado",
      "Floral"
    ],
    "topNotes": [
      "Agua de coco",
      "Bergamota"
    ],
    "middleNotes": [
      "Jazmín",
      "Heliotropo"
    ],
    "baseNotes": [
      "Vainilla bourbon",
      "Cashmeran"
    ],
    "mainNotes": [
      "Agua de coco",
      "Jazmín",
      "Vainilla bourbon",
      "Cashmeran"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Al principio agua de coco y bergamota. Más adelante entran jazmín y heliotropo, y el fondo termina en vainilla bourbon y cashmeran. Es una composición floral y amaderada.",
    "likeIf": [
      "Te llama la atención el paso de agua de coco a jazmín",
      "Querés un cierre de vainilla bourbon y cashmeran",
      "Te gusta la combinación de vainilla y empolvado"
    ]
  },
  "thierry-mugler-angel": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Dulce",
      "Pachulí",
      "Frutal",
      "Especiado cálido",
      "Caramelo",
      "Vainilla",
      "Amaderado",
      "Miel",
      "Empolvado",
      "Chocolate"
    ],
    "topNotes": [
      "Algodón de azúcar",
      "Coco",
      "Grosella negra",
      "Melón",
      "Jazmín",
      "Bergamota",
      "Ananá",
      "Mandarina"
    ],
    "middleNotes": [
      "Miel",
      "Frutos rojos",
      "Mora",
      "Ciruela",
      "Damasco",
      "Durazno",
      "Nuez moscada",
      "Alcaravea",
      "Orquídea",
      "Rosa",
      "Muguet"
    ],
    "baseNotes": [
      "Pachulí",
      "Chocolate",
      "Caramelo",
      "Vainilla",
      "Haba tonka",
      "Ámbar",
      "Almizcle",
      "Sándalo"
    ],
    "mainNotes": [
      "Algodón de azúcar",
      "Miel",
      "Pachulí",
      "Chocolate"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "La salida es de algodón de azúcar, coco y grosella negra; el centro se arma con miel, frutos rojos y mora; el fondo descansa en pachulí, chocolate y caramelo. Queda en un registro dulce, amaderado y especiado.",
    "likeIf": [
      "Te gustan las aperturas de algodón de azúcar que pasan a miel",
      "Te llaman la atención los fondos de pachulí y chocolate",
      "Querés explorar lo frutal junto a lo especiado cálido"
    ]
  },
  "thierry-mugler-angel-nova": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "ambarado-intenso"
    ],
    "accords": [
      "Frutal",
      "Rosa",
      "Dulce",
      "Oud",
      "Tropical",
      "Amaderado",
      "Especiado cálido",
      "Fresco",
      "Ámbar"
    ],
    "topNotes": [
      "Frambuesa",
      "Lichi"
    ],
    "middleNotes": [
      "Rosa de Damasco"
    ],
    "baseNotes": [
      "Akigalawood",
      "Benjuí"
    ],
    "mainNotes": [
      "Frambuesa",
      "Rosa de Damasco",
      "Akigalawood",
      "Benjuí"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Desde frambuesa y lichi avanza hacia rosa de Damasco y cierra apoyado en akigalawood y benjuí. El perfil cruza lo dulce con lo ambarado.",
    "likeIf": [
      "Te atrae el contraste entre frambuesa y un corazón de rosa de Damasco",
      "Preferís que el final quede en akigalawood y benjuí",
      "Te atrae la combinación de un perfil frutal con rosa"
    ]
  },
  "tom-ford-costa-azzurra": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "amaderado",
      "acuatico"
    ],
    "accords": [
      "Aromático",
      "Amaderado",
      "Marino",
      "Especiado fresco",
      "Cítrico",
      "Herbal",
      "Ámbar",
      "Acuático"
    ],
    "topNotes": [
      "Madera de deriva",
      "Algas",
      "Oud",
      "Semillas de apio",
      "Ambreta",
      "Cardamomo"
    ],
    "middleNotes": [
      "Limón",
      "Lavanda",
      "Enebro",
      "Mandarina amarilla",
      "Artemisa",
      "Mirto"
    ],
    "baseNotes": [
      "Vetiver",
      "Roble",
      "Olíbano",
      "Almáciga",
      "Incienso",
      "Vainilla"
    ],
    "mainNotes": [
      "Madera de deriva",
      "Limón",
      "Vetiver",
      "Roble"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Madera de deriva, algas y cardamomo arriba; limón, lavanda y enebro en el centro; vetiver, roble e incienso abajo. Mediterráneo y seco, más de costa rocosa que de playa.",
    "likeIf": [
      "Te gusta lo marino en clave seca",
      "Buscás algas y madera antes que un acuático limpio",
      "Te atrae el incienso sobre el vetiver"
    ]
  },
  "tom-ford-fucking-fabulous": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "cuero-ahumado",
      "gourmand-dulce"
    ],
    "accords": [
      "Aromático",
      "Cuero",
      "Vainilla",
      "Almendra",
      "Amaderado",
      "Ámbar",
      "Lavanda",
      "Dulce",
      "Empolvado",
      "Animálico"
    ],
    "topNotes": [
      "Lavanda",
      "Salvia sclarea"
    ],
    "middleNotes": [
      "Cuero",
      "Almendra amarga",
      "Vainilla",
      "Lirio"
    ],
    "baseNotes": [
      "Cuero",
      "Haba tonka",
      "Cashmeran",
      "Maderas blancas",
      "Ámbar"
    ],
    "mainNotes": [
      "Lavanda",
      "Cuero",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Lavanda y salvia sclarea arriba; cuero, almendra amarga y vainilla en el centro; más cuero, haba tonka y cashmeran abajo. El cuero cruza el perfume entero y la almendra lo suaviza.",
    "likeIf": [
      "Te gusta el cuero acompañado de almendra",
      "Buscás lavanda en un registro ambarado",
      "Preferís un cuero envolvente y no áspero"
    ]
  },
  "tom-ford-lost-cherry": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "especiado",
      "ambarado-intenso"
    ],
    "accords": [
      "Cereza",
      "Dulce",
      "Almendra",
      "Avellanado",
      "Frutal",
      "Vainilla",
      "Especiado cálido",
      "Ámbar",
      "Amaderado",
      "Balsámico"
    ],
    "topNotes": [
      "Almendra amarga",
      "Cereza negra",
      "Licor de cereza"
    ],
    "middleNotes": [
      "Guinda",
      "Ciruela",
      "Rosa de Turquía",
      "Jazmín sambac"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Canela",
      "Bálsamo de Perú",
      "Sándalo",
      "Benjuí",
      "Clavo de olor",
      "Cedro",
      "Pachulí",
      "Vetiver"
    ],
    "mainNotes": [
      "Almendra amarga",
      "Guinda",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "La apertura combina almendra amarga, cereza negra y licor de cereza. Después llega el turno de guinda, ciruela y rosa de Turquía, y el final queda en vainilla, haba tonka y canela. El conjunto es dulce, especiado y ambarado.",
    "likeIf": [
      "Te atrae el contraste entre almendra amarga y un corazón de guinda",
      "Preferís un fondo de bálsamo de Perú y sándalo",
      "Te atrae la combinación de cereza con un perfil dulce"
    ]
  },
  "tom-ford-neroli-portofino": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "floral",
      "aromatico-limpio"
    ],
    "accords": [
      "Cítrico",
      "Floral blanco",
      "Aromático",
      "Especiado fresco",
      "Floral"
    ],
    "topNotes": [
      "Bergamota",
      "Mandarina",
      "Limón",
      "Naranja amarga",
      "Lavanda",
      "Romero",
      "Mirto"
    ],
    "middleNotes": [
      "Flor de naranjo africana",
      "Neroli",
      "Jazmín",
      "Pitosporo"
    ],
    "baseNotes": [
      "Ámbar",
      "Ambreta",
      "Angélica"
    ],
    "mainNotes": [
      "Bergamota",
      "Flor de naranjo africana",
      "Ámbar",
      "Ambreta"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Sale con bergamota, mandarina y limón, se acomoda en flor de naranjo africana, neroli y jazmín y se queda en ámbar, ambreta y angélica. Se apoya en acordes de cítrico y floral blanco.",
    "likeIf": [
      "Disfrutás perfiles que van de bergamota hacia flor de naranjo africana",
      "Buscás una composición que termine en ámbar y ambreta",
      "Te atraen los acordes de cítrico y floral blanco"
    ]
  },
  "tom-ford-noir-extreme": {
    "family": "especiado",
    "families": [
      "especiado",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Especiado cálido",
      "Dulce",
      "Vainilla",
      "Amaderado",
      "Empolvado",
      "Ámbar",
      "Especiado fresco",
      "Aromático",
      "Floral blanco",
      "Balsámico"
    ],
    "topNotes": [
      "Cardamomo",
      "Nuez moscada",
      "Azafrán",
      "Mandarina",
      "Neroli"
    ],
    "middleNotes": [
      "Kulfi",
      "Rosa",
      "Almáciga",
      "Azahar",
      "Jazmín"
    ],
    "baseNotes": [
      "Vainilla",
      "Ámbar",
      "Notas amaderadas",
      "Sándalo"
    ],
    "mainNotes": [
      "Cardamomo",
      "Kulfi",
      "Vainilla",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Abre con cardamomo, nuez moscada y azafrán. El corazón suma kulfi, rosa y almáciga y el fondo se asienta en vainilla, ámbar y notas amaderadas. Es una composición especiada, dulce y amaderada.",
    "likeIf": [
      "Te llama la atención el paso de cardamomo a kulfi",
      "Querés un cierre de vainilla y ámbar",
      "Te gusta la combinación de especiado cálido y dulce"
    ]
  },
  "tom-ford-ombre-leather": {
    "family": "cuero-ahumado",
    "families": [
      "cuero-ahumado",
      "ambarado-intenso",
      "especiado"
    ],
    "accords": [
      "Cuero",
      "Animálico",
      "Especiado cálido",
      "Floral blanco",
      "Ámbar",
      "Ahumado",
      "Terroso",
      "Musgoso",
      "Pachulí",
      "Amaderado"
    ],
    "topNotes": [
      "Cardamomo"
    ],
    "middleNotes": [
      "Cuero",
      "Jazmín sambac"
    ],
    "baseNotes": [
      "Ámbar",
      "Musgo",
      "Pachulí"
    ],
    "mainNotes": [
      "Cardamomo",
      "Cuero",
      "Ámbar",
      "Musgo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Empieza con cardamomo. En el corazón hay cuero y jazmín sambac, y el fondo reúne ámbar, musgo y pachulí. Entre sus acordes principales figuran cuero y animálico.",
    "likeIf": [
      "Te llama la atención el paso de cardamomo a cuero",
      "Querés un cierre de ámbar y musgo",
      "Te atraen los acordes de especiado cálido y floral blanco"
    ]
  },
  "tom-ford-oud-wood": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "especiado",
      "ambarado-intenso"
    ],
    "accords": [
      "Amaderado",
      "Especiado cálido",
      "Oud",
      "Aromático",
      "Vainilla",
      "Balsámico",
      "Especiado fresco",
      "Ámbar",
      "Empolvado",
      "Dulce"
    ],
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "mainNotes": [
      "Oud",
      "Palo de rosa de Brasil",
      "Cardamomo",
      "Sándalo",
      "Pimienta de Sichuan",
      "Vainilla",
      "Vetiver",
      "Haba tonka",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Oud, palo de rosa de Brasil, cardamomo y sándalo llevan la composición; pimienta de Sichuan, vainilla, vetiver y haba tonka la completan. El conjunto es amaderado, especiado y ambarado.",
    "likeIf": [
      "Te interesan las composiciones con oud y palo de rosa de Brasil",
      "Te gusta encontrar sándalo y pimienta de Sichuan en la misma composición",
      "Te interesan las composiciones con vainilla y vetiver"
    ]
  },
  "tom-ford-soleil-blanc": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce",
      "ambarado-intenso"
    ],
    "accords": [
      "Floral blanco",
      "Coco",
      "Dulce",
      "Nardo",
      "Ámbar",
      "Floral amarillo",
      "Vainilla",
      "Amaderado",
      "Especiado cálido",
      "Cítrico"
    ],
    "topNotes": [
      "Pistacho",
      "Bergamota",
      "Cardamomo",
      "Pimienta rosa"
    ],
    "middleNotes": [
      "Nardo",
      "Ylang ylang",
      "Jazmín"
    ],
    "baseNotes": [
      "Coco",
      "Ámbar",
      "Haba tonka",
      "Benjuí"
    ],
    "mainNotes": [
      "Pistacho",
      "Nardo",
      "Coco",
      "Ámbar"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Al principio pistacho, bergamota y cardamomo. Más adelante entran nardo, ylang ylang y jazmín, y el fondo termina en coco, ámbar y haba tonka. La composición combina un registro floral y dulce.",
    "likeIf": [
      "Te gustan las aperturas de pistacho que pasan a nardo",
      "Te llaman la atención los fondos de coco y ámbar",
      "Buscás algo floral donde lo dulce tenga peso"
    ]
  },
  "tom-ford-tobacco-vanilla": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "cuero-ahumado",
      "especiado"
    ],
    "accords": [
      "Vainilla",
      "Dulce",
      "Tabaco",
      "Especiado cálido",
      "Frutal",
      "Amaderado",
      "Cacao"
    ],
    "topNotes": [
      "Hoja de tabaco",
      "Notas especiadas"
    ],
    "middleNotes": [
      "Vainilla",
      "Cacao",
      "Haba tonka",
      "Flor de tabaco"
    ],
    "baseNotes": [
      "Frutos secos",
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Tabaco",
      "Vainilla",
      "Cacao",
      "Haba tonka"
    ],
    "occasions": [
      "evento",
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Tabaco dulce con vainilla y cacao. Cálido, denso y de otra época: es el perfume de sillón de cuero y chimenea.",
    "likeIf": [
      "Te gustan los perfumes cálidos y golosos",
      "Buscás algo para el invierno",
      "Querés algo con carácter"
    ]
  },
  "tommy-hilfiger-tommy-girl": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "floral",
      "gourmand-dulce"
    ],
    "accords": [
      "Cítrico",
      "Floral blanco",
      "Floral",
      "Frutal",
      "Aromático",
      "Rosa",
      "Verde",
      "Amaderado",
      "Empolvado"
    ],
    "topNotes": [
      "Flor de manzano",
      "Mandarina",
      "Camelia",
      "Grosella negra"
    ],
    "middleNotes": [
      "Limón",
      "Madreselva",
      "Pomelo",
      "Rosa",
      "Lirio",
      "Menta",
      "Violeta"
    ],
    "baseNotes": [
      "Magnolia",
      "Jazmín",
      "Cedro",
      "Sándalo",
      "Cuero"
    ],
    "mainNotes": [
      "Flor de manzano",
      "Limón",
      "Magnolia",
      "Jazmín"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Sale con flor de manzano, mandarina y camelia, se acomoda en limón, madreselva y pomelo y se queda en magnolia, jazmín y cedro. El conjunto es cítrico y floral.",
    "likeIf": [
      "Te atrae el contraste entre flor de manzano y un corazón de limón",
      "Preferís que el final quede en magnolia y jazmín",
      "Querés explorar lo cítrico junto a lo floral blanco"
    ]
  },
  "tommy-hilfiger-tommy-hilfiger": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "especiado",
      "aromatico-limpio"
    ],
    "accords": [
      "Verde",
      "Especiado fresco",
      "Cítrico",
      "Aromático",
      "Frutal",
      "Lavanda",
      "Fresco",
      "Empolvado",
      "Floral"
    ],
    "topNotes": [
      "Menta",
      "Bergamota",
      "Pomelo",
      "Lavanda"
    ],
    "middleNotes": [
      "Manzana Granny Smith",
      "Arándano rojo",
      "Rosa"
    ],
    "baseNotes": [
      "Flor de algodón",
      "Cactus",
      "Ámbar"
    ],
    "mainNotes": [
      "Menta",
      "Manzana Granny Smith",
      "Flor de algodón",
      "Cactus"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Menta, bergamota y pomelo arriba; manzana Granny Smith y arándano en el centro; flor de algodón y cactus abajo. Fresco y frutal, con un cierre que se queda en algo limpio.",
    "likeIf": [
      "Te gusta la manzana verde con menta",
      "Buscás un cítrico frutal para todos los días",
      "Preferís un cierre limpio y empolvado"
    ]
  },
  "valentino-born-in-roma": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "aromatico-limpio",
      "acuatico"
    ],
    "accords": [
      "Mineral",
      "Amaderado",
      "Ozónico",
      "Aromático",
      "Acuático",
      "Salado",
      "Herbal"
    ],
    "topNotes": [
      "Notas minerales",
      "Hoja de violeta",
      "Sal"
    ],
    "middleNotes": [
      "Salvia",
      "Jengibre"
    ],
    "baseNotes": [
      "Notas amaderadas",
      "Vetiver"
    ],
    "mainNotes": [
      "Sal mineral",
      "Hoja de violeta",
      "Salvia",
      "Vetiver"
    ],
    "occasions": [
      "diario",
      "versatil"
    ],
    "seasons": [
      "todo-el-ano"
    ],
    "aromaticIntensity": "suave",
    "feel": "Un amaderado con un twist mineral y salado. La hoja de violeta le da una frescura poco común en un masculino.",
    "likeIf": [
      "Buscás algo diferente sin ser raro",
      "Te gusta lo mineral y salado",
      "Querés un amaderado moderno"
    ]
  },
  "valentino-born-in-roma-donna": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "gourmand-dulce",
      "floral"
    ],
    "accords": [
      "Amaderado",
      "Vainilla",
      "Frutal",
      "Floral blanco",
      "Especiado suave"
    ],
    "topNotes": [
      "Grosella negra",
      "Pimienta rosa",
      "Bergamota"
    ],
    "middleNotes": [
      "Jazmín",
      "Jazmín sambac",
      "Té de jazmín"
    ],
    "baseNotes": [
      "Vainilla bourbon",
      "Cashmeran",
      "Madera de guayaco"
    ],
    "mainNotes": [
      "Jazmín",
      "Vainilla bourbon",
      "Cashmeran",
      "Grosella negra"
    ],
    "occasions": [
      "diario",
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Jazmín sobre vainilla y madera. Tiene un fondo más seco de lo que promete la apertura, y eso lo hace versátil.",
    "likeIf": [
      "Buscás un floral amaderado",
      "Te gusta el jazmín",
      "Querés algo de día y de noche"
    ]
  },
  "valentino-born-in-roma-extradose": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Lavanda",
      "Amaderado",
      "Especiado cálido",
      "Aromático",
      "Especiado fresco"
    ],
    "topNotes": [
      "Notas especiadas"
    ],
    "middleNotes": [
      "Lavanda silvestre"
    ],
    "baseNotes": [
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Notas especiadas",
      "Lavanda silvestre",
      "Notas amaderadas"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Abre con notas especiadas. El corazón suma lavanda silvestre y el fondo se asienta en notas amaderadas. Queda en un registro aromático, amaderado y especiado.",
    "likeIf": [
      "Te gustan las aperturas de notas especiadas que pasan a lavanda silvestre",
      "Te llama la atención un cierre de notas amaderadas",
      "Preferís perfiles donde aparecen lavanda y amaderado"
    ]
  },
  "valentino-born-in-roma-extradose-donna": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "amaderado",
      "especiado"
    ],
    "accords": [
      "Vainilla",
      "Frutal",
      "Ron",
      "Amaderado",
      "Especiado suave",
      "Empolvado",
      "Dulce"
    ],
    "topNotes": [
      "Grosella negra"
    ],
    "middleNotes": [
      "Ron"
    ],
    "baseNotes": [
      "Vainilla"
    ],
    "mainNotes": [
      "Grosella negra",
      "Ron",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Grosella negra en la salida, ron en el corazón y vainilla en el fondo. El conjunto es dulce, amaderado y especiado.",
    "likeIf": [
      "Te atrae el contraste entre grosella negra y un corazón de ron",
      "Te gusta la combinación de vainilla y frutal",
      "Querés explorar lo dulce con carácter amaderado"
    ]
  },
  "valentino-born-in-roma-intense": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "gourmand-dulce",
      "amaderado"
    ],
    "accords": [
      "Lavanda",
      "Vainilla",
      "Aromático",
      "Amaderado",
      "Especiado fresco",
      "Terroso",
      "Empolvado",
      "Dulce",
      "Herbal"
    ],
    "topNotes": [
      "Vainilla"
    ],
    "middleNotes": [
      "Lavanda"
    ],
    "baseNotes": [
      "Vetiver"
    ],
    "mainNotes": [
      "Vainilla",
      "Lavanda",
      "Vetiver"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Vainilla en la salida, lavanda en el corazón y vetiver en el fondo. El perfil cruza lo aromático con lo dulce.",
    "likeIf": [
      "Te atrae el contraste entre vainilla y un corazón de lavanda",
      "Preferís que el final quede en vetiver",
      "Te gusta la combinación de aromático y amaderado"
    ]
  },
  "valentino-purple-melancholia": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "especiado"
    ],
    "accords": [
      "Frutal",
      "Floral",
      "Vainilla",
      "Dulce",
      "Especiado suave"
    ],
    "topNotes": [
      "Ciruela"
    ],
    "middleNotes": [
      "Osmanto"
    ],
    "baseNotes": [
      "Vainilla"
    ],
    "mainNotes": [
      "Ciruela",
      "Osmanto",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Sale con ciruela, se acomoda en osmanto y se queda en vainilla. El perfil cruza lo dulce con lo floral.",
    "likeIf": [
      "Te atrae el contraste entre ciruela y un corazón de osmanto",
      "Te llama la atención un cierre de vainilla",
      "Querés explorar lo frutal junto a lo floral"
    ]
  },
  "versace-dylan-blue": {
    "family": "acuatico",
    "families": [
      "acuatico",
      "citrico-fresco",
      "ambarado-intenso"
    ],
    "accords": [
      "Ámbar",
      "Cítrico",
      "Especiado fresco",
      "Almizclado",
      "Acuático",
      "Amaderado",
      "Ahumado"
    ],
    "topNotes": [
      "Bergamota de Calabria",
      "Notas acuáticas",
      "Pomelo",
      "Hoja de higuera"
    ],
    "middleNotes": [
      "Ambroxan",
      "Pimienta negra",
      "Pachulí",
      "Hoja de violeta",
      "Papiro"
    ],
    "baseNotes": [
      "Incienso",
      "Almizcle",
      "Haba tonka",
      "Azafrán"
    ],
    "mainNotes": [
      "Pomelo",
      "Hoja de higuera",
      "Ambroxan",
      "Incienso"
    ],
    "occasions": [
      "diario",
      "versatil"
    ],
    "seasons": [
      "calor",
      "todo-el-ano"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Bergamota de Calabria y pomelo aparecen en la salida. El conjunto es cítrico y ambarado.",
    "likeIf": [
      "Te llama la atención un corazón con pimienta negra y hoja de violeta",
      "Te atrae el cruce entre lo cítrico y lo ambarado",
      "Buscás una composición que termine en incienso y haba tonka"
    ]
  },
  "versace-eros": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "floral",
      "amaderado"
    ],
    "accords": [
      "Cítrico",
      "Floral blanco",
      "Amaderado",
      "Almizclado",
      "Floral",
      "Fresco",
      "Especiado fresco",
      "Empolvado",
      "Aromático",
      "Ámbar"
    ],
    "topNotes": [
      "Limón de Sicilia",
      "Granada",
      "Bergamota de Calabria"
    ],
    "middleNotes": [
      "Flor de limonero",
      "Jazmín sambac",
      "Jazmín",
      "Peonía"
    ],
    "baseNotes": [
      "Almizcle",
      "Ambroxan",
      "Notas amaderadas",
      "Sándalo"
    ],
    "mainNotes": [
      "Limón de Sicilia",
      "Flor de limonero",
      "Almizcle",
      "Ambroxan"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Limón de Sicilia y granada en la salida, un corazón de jazmín sambac y flor de limonero, y un fondo de almizcle y ambroxan. Cítrico arriba, floral blanco en el medio y un cierre casi transparente.",
    "likeIf": [
      "Te gustan los florales blancos que abren en cítrico",
      "Buscás la granada como contrapunto del limón",
      "Preferís un cierre de almizcle y ambroxan, sin peso"
    ]
  },
  "versace-eros-flame": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "especiado",
      "gourmand-dulce"
    ],
    "accords": [
      "Cítrico",
      "Especiado fresco",
      "Vainilla",
      "Aromático",
      "Amaderado",
      "Especiado cálido",
      "Dulce",
      "Empolvado"
    ],
    "topNotes": [
      "Mandarina",
      "Pimienta de Madagascar",
      "Limón",
      "Chinotto",
      "Romero"
    ],
    "middleNotes": [
      "Geranio",
      "Rosa",
      "Pepperwood"
    ],
    "baseNotes": [
      "Vainilla",
      "Haba tonka",
      "Sándalo",
      "Cedro de Texas",
      "Pachulí",
      "Musgo de roble"
    ],
    "mainNotes": [
      "Mandarina",
      "Geranio",
      "Vainilla",
      "Haba tonka"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Mandarina, pimienta de Madagascar y limón en la salida, geranio, rosa y pepperwood en el corazón y vainilla, haba tonka y sándalo en el fondo. El resultado es un perfil cítrico, especiado y dulce.",
    "likeIf": [
      "Disfrutás perfiles que van de mandarina hacia geranio",
      "Buscás una composición que termine en vainilla y haba tonka",
      "Te interesan las aperturas donde aparecen chinotto y romero"
    ]
  },
  "victorias-secret-bombshell-night": {
    "family": "amaderado",
    "families": [
      "amaderado",
      "gourmand-dulce",
      "floral"
    ],
    "accords": [
      "Amaderado",
      "Frutal",
      "Floral",
      "Especiado suave",
      "Aromático",
      "Especiado fresco",
      "Verde",
      "Animálico"
    ],
    "topNotes": [
      "Grosella negra"
    ],
    "middleNotes": [
      "Dalia"
    ],
    "baseNotes": [
      "Notas amaderadas"
    ],
    "mainNotes": [
      "Grosella negra",
      "Dalia",
      "Notas amaderadas"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "La apertura combina grosella negra. Después llega el turno de dalia, y el final queda en notas amaderadas. Se apoya en acordes de amaderado y frutal.",
    "likeIf": [
      "Disfrutás perfiles que van de grosella negra hacia dalia",
      "Preferís que el final quede en notas amaderadas",
      "Te gusta la combinación de frutal y floral"
    ]
  },
  "victorias-secret-summer-daze": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "gourmand-dulce"
    ],
    "accords": [
      "Floral blanco",
      "Cítrico",
      "Frutal",
      "Especiado fresco",
      "Dulce",
      "Aromático"
    ],
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "mainNotes": [
      "Pomelo",
      "Flor de tiaré"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Pomelo sobre flor de tiaré. Floral blanco y cítrico, en una composición de muy pocas notas.",
    "likeIf": [
      "Te gusta la flor de tiaré",
      "Buscás un floral blanco con el cítrico adelante",
      "Preferís composiciones de pocas notas"
    ]
  },
  "victorias-secret-very-sexy": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "citrico-fresco",
      "floral"
    ],
    "accords": [
      "Frutal",
      "Dulce",
      "Cítrico",
      "Floral",
      "Empolvado"
    ],
    "topNotes": [],
    "middleNotes": [],
    "baseNotes": [],
    "mainNotes": [
      "Mora",
      "Clementina",
      "Orquídea de vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Mora, clementina y orquídea de vainilla. Frutal y dulce, con la vainilla redondeando el cítrico.",
    "likeIf": [
      "Te gusta la mora con vainilla",
      "Buscás algo frutal y dulce",
      "Preferís la clementina a un cítrico ácido"
    ]
  },
  "viktor-rolf-bonbon": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "citrico-fresco",
      "floral"
    ],
    "accords": [
      "Caramelo",
      "Cítrico",
      "Dulce",
      "Floral blanco",
      "Frutal",
      "Amaderado",
      "Ámbar",
      "Empolvado"
    ],
    "topNotes": [
      "Durazno",
      "Mandarina",
      "Naranja"
    ],
    "middleNotes": [
      "Caramelo",
      "Azahar",
      "Jazmín"
    ],
    "baseNotes": [
      "Ámbar",
      "Sándalo",
      "Madera de guayaco",
      "Cedro"
    ],
    "mainNotes": [
      "Durazno",
      "Caramelo",
      "Ámbar",
      "Sándalo"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Arranca con durazno, mandarina y naranja, pasa por caramelo, azahar y jazmín y termina sobre ámbar, sándalo y madera de guayaco. Es una composición dulce, cítrica y floral.",
    "likeIf": [
      "Te llama la atención el paso de durazno a caramelo",
      "Querés un cierre de ámbar y sándalo",
      "Te atraen los acordes de dulce y floral blanco"
    ]
  },
  "viktor-rolf-flowerbomb": {
    "family": "floral",
    "families": [
      "floral",
      "gourmand-dulce"
    ],
    "accords": [
      "Floral",
      "Pachulí",
      "Floral blanco",
      "Amaderado",
      "Empolvado",
      "Cítrico",
      "Dulce"
    ],
    "topNotes": [
      "Té",
      "Bergamota",
      "Osmanto"
    ],
    "middleNotes": [
      "Orquídea",
      "Jazmín",
      "Rosa",
      "Fresia",
      "Flor de naranjo africana"
    ],
    "baseNotes": [
      "Pachulí",
      "Almizcle",
      "Vainilla"
    ],
    "mainNotes": [
      "Jazmín",
      "Rosa",
      "Pachulí",
      "Vainilla"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "envolvente",
    "feel": "Un ramo floral entero, redondeado por pachulí y vainilla. Dulce, envolvente y muy femenino.",
    "likeIf": [
      "Te gustan los florales grandes",
      "Buscás algo dulce y clásico",
      "Querés un perfume de ocasión"
    ]
  },
  "viktor-rolf-spice-bomb": {
    "family": "especiado",
    "families": [
      "especiado",
      "cuero-ahumado",
      "gourmand-dulce"
    ],
    "accords": [
      "Especiado cálido",
      "Canela",
      "Tabaco",
      "Dulce",
      "Especiado suave",
      "Cuero",
      "Aromático",
      "Cítrico"
    ],
    "topNotes": [
      "Pimienta rosa",
      "Elemí",
      "Bergamota",
      "Pomelo"
    ],
    "middleNotes": [
      "Canela",
      "Pimentón",
      "Azafrán"
    ],
    "baseNotes": [
      "Tabaco",
      "Cuero",
      "Vetiver"
    ],
    "mainNotes": [
      "Pimienta rosa",
      "Canela",
      "Tabaco",
      "Cuero"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "marcada",
    "feel": "Sale con pimienta rosa, elemí y bergamota, se acomoda en canela, pimentón y azafrán y se queda en tabaco, cuero y vetiver. El resultado es un perfil especiado y dulce.",
    "likeIf": [
      "Disfrutás perfiles que van de pimienta rosa hacia canela",
      "Buscás una composición que termine en tabaco y cuero",
      "Buscás algo especiado donde lo dulce tenga peso"
    ]
  },
  "xerjoff-accento-overdose": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "gourmand-dulce"
    ],
    "accords": [
      "Floral blanco",
      "Verde",
      "Frutal",
      "Fresco",
      "Amaderado",
      "Aldehídico",
      "Dulce",
      "Rosa",
      "Aromático",
      "Floral"
    ],
    "topNotes": [
      "Notas frutales",
      "Acorde verde",
      "Aldehídos"
    ],
    "middleNotes": [
      "Jazmín de Egipto",
      "Muguet",
      "Rosa búlgara"
    ],
    "baseNotes": [
      "Eucalipto",
      "Pino"
    ],
    "mainNotes": [
      "Notas frutales",
      "Jazmín de Egipto",
      "Eucalipto",
      "Pino"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "suave",
    "feel": "Abre con notas frutales, acorde verde y aldehídos. El corazón suma jazmín de Egipto, muguet y rosa búlgara y el fondo se asienta en eucalipto y pino. Entre sus acordes principales figuran floral blanco y verde.",
    "likeIf": [
      "Te llama la atención el paso de notas frutales a jazmín de Egipto",
      "Querés un cierre de eucalipto y pino",
      "Te gusta la combinación de floral blanco y verde"
    ]
  },
  "xerjoff-amber-gold": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "gourmand-dulce"
    ],
    "accords": [
      "Floral blanco",
      "Cítrico",
      "Dulce",
      "Floral",
      "Pachulí",
      "Almizclado",
      "Aromático"
    ],
    "topNotes": [
      "Mandarina",
      "Cilantro"
    ],
    "middleNotes": [
      "Azahar",
      "Flor de almendro",
      "Flor de tabaco"
    ],
    "baseNotes": [
      "Pachulí",
      "Almizcle"
    ],
    "mainNotes": [
      "Mandarina",
      "Azahar",
      "Pachulí",
      "Almizcle"
    ],
    "occasions": [],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Desde mandarina y cilantro avanza hacia azahar, flor de almendro y flor de tabaco y cierra apoyado en pachulí y almizcle. Se apoya en acordes de floral blanco y cítrico.",
    "likeIf": [
      "Disfrutás perfiles que van de mandarina hacia azahar",
      "Buscás una composición que termine en pachulí y almizcle",
      "Te atraen los acordes de floral blanco y cítrico"
    ]
  },
  "xerjoff-erba-pura": {
    "family": "citrico-fresco",
    "families": [
      "citrico-fresco",
      "gourmand-dulce"
    ],
    "accords": [
      "Cítrico",
      "Frutal",
      "Dulce",
      "Almizclado",
      "Empolvado",
      "Vainilla",
      "Ámbar"
    ],
    "topNotes": [
      "Naranja de Sicilia",
      "Bergamota de Calabria",
      "Limón de Sicilia"
    ],
    "middleNotes": [
      "Frutas"
    ],
    "baseNotes": [
      "Almizcle blanco",
      "Vainilla de Madagascar",
      "Ámbar"
    ],
    "mainNotes": [
      "Naranja",
      "Frutas",
      "Almizcle blanco",
      "Vainilla"
    ],
    "occasions": [
      "diario",
      "versatil"
    ],
    "seasons": [
      "calor"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Un estallido de frutas mediterráneas sobre almizcle y vainilla. Luminoso, adictivo y de carácter muy definido.",
    "likeIf": [
      "Te gustan los frutales",
      "Buscás algo alegre y luminoso",
      "Querés un frutal de carácter definido"
    ]
  },
  "yves-saint-laurent-black-opium": {
    "family": "gourmand-dulce",
    "families": [
      "gourmand-dulce",
      "floral",
      "ambarado-intenso"
    ],
    "accords": [
      "Vainilla",
      "Café",
      "Dulce",
      "Floral blanco",
      "Especiado cálido",
      "Amaderado"
    ],
    "topNotes": [
      "Pera",
      "Pimienta rosa",
      "Azahar"
    ],
    "middleNotes": [
      "Café",
      "Jazmín",
      "Almendra amarga",
      "Regaliz"
    ],
    "baseNotes": [
      "Vainilla",
      "Pachulí",
      "Madera de cachemira",
      "Cedro"
    ],
    "mainNotes": [
      "Café",
      "Vainilla",
      "Pera",
      "Jazmín"
    ],
    "occasions": [
      "noche"
    ],
    "seasons": [
      "frio"
    ],
    "aromaticIntensity": "marcada",
    "feel": "Café y vainilla como eje, con un toque de pera arriba que lo abre. Directo, adictivo y muy de noche.",
    "likeIf": [
      "Te gusta el café en perfumería",
      "Salís de noche",
      "Buscás algo dulce e intenso"
    ]
  },
  "yves-saint-laurent-libre": {
    "family": "floral",
    "families": [
      "floral",
      "aromatico-limpio",
      "gourmand-dulce"
    ],
    "accords": [
      "Floral blanco",
      "Cítrico",
      "Lavanda",
      "Vainilla",
      "Aromático",
      "Dulce",
      "Empolvado"
    ],
    "topNotes": [
      "Lavanda",
      "Mandarina",
      "Grosella negra",
      "Petitgrain"
    ],
    "middleNotes": [
      "Lavanda",
      "Azahar",
      "Jazmín"
    ],
    "baseNotes": [
      "Vainilla de Madagascar",
      "Almizcle",
      "Cedro",
      "Ámbar gris"
    ],
    "mainNotes": [
      "Lavanda",
      "Azahar",
      "Vainilla",
      "Almizcle"
    ],
    "occasions": [
      "trabajo",
      "versatil"
    ],
    "seasons": [],
    "aromaticIntensity": "equilibrada",
    "feel": "Lavanda y azahar sobre vainilla. Tiene una prolijidad casi masculina que lo vuelve elegante y poco obvio.",
    "likeIf": [
      "Te gusta la lavanda",
      "Buscás algo elegante y no empalagoso",
      "Querés un floral con estructura"
    ]
  },
  "yves-saint-laurent-myslf": {
    "family": "floral",
    "families": [
      "floral",
      "citrico-fresco",
      "amaderado"
    ],
    "accords": [
      "Cítrico",
      "Floral blanco",
      "Pachulí",
      "Especiado fresco",
      "Amaderado",
      "Dulce"
    ],
    "topNotes": [
      "Bergamota de Calabria"
    ],
    "middleNotes": [
      "Azahar de Túnez"
    ],
    "baseNotes": [
      "Ambrofix",
      "Pachulí"
    ],
    "mainNotes": [
      "Bergamota",
      "Azahar",
      "Pachulí"
    ],
    "occasions": [
      "diario",
      "trabajo"
    ],
    "seasons": [
      "calor",
      "todo-el-ano"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Azahar limpio sobre bergamota y pachulí. Da una sensación de recién bañado, ordenada y moderna.",
    "likeIf": [
      "Te gusta lo limpio y prolijo",
      "Buscás algo discreto",
      "Querés un perfume de oficina"
    ]
  },
  "yves-saint-laurent-y-eau-de-parfum": {
    "family": "aromatico-limpio",
    "families": [
      "aromatico-limpio",
      "amaderado",
      "citrico-fresco"
    ],
    "accords": [
      "Aromático",
      "Especiado fresco",
      "Amaderado",
      "Frutal",
      "Ámbar",
      "Cítrico"
    ],
    "topNotes": [
      "Manzana",
      "Jengibre",
      "Bergamota"
    ],
    "middleNotes": [
      "Salvia",
      "Bayas de enebro",
      "Geranio"
    ],
    "baseNotes": [
      "Amberwood",
      "Haba tonka",
      "Cedro",
      "Vetiver",
      "Olíbano"
    ],
    "mainNotes": [
      "Manzana",
      "Jengibre",
      "Salvia",
      "Amberwood"
    ],
    "occasions": [
      "diario",
      "trabajo",
      "versatil"
    ],
    "seasons": [
      "calor",
      "todo-el-ano"
    ],
    "aromaticIntensity": "equilibrada",
    "feel": "Manzana y jengibre sobre un fondo de madera y haba tonka. Limpio, prolijo y fácil de usar todos los días.",
    "likeIf": [
      "Querés algo prolijo para el día a día",
      "Te gustan los aromáticos",
      "Buscás una opción segura para el trabajo"
    ]
  }
};

/** Cantidad de perfiles cargados. */
export const PROFILE_COUNT = Object.keys(OLFACTORY_PROFILES).length;
