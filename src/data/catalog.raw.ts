/**
 * CATÁLOGO MAESTRO NOX — fuente única de verdad del listado de productos.
 *
 * Esta es la única lista de fragancias del sitio. Para agregar o quitar un producto,
 * editá solamente este archivo. El resto de la app deriva todo desde acá.
 *
 * Estructura: grupo (género + origen) -> marca inspiradora -> nombres.
 * El nombre es el de la fragancia ORIGINAL en la que se inspira el extracto NOX.
 */

export type Gender = "femenino" | "masculino" | "unisex";
export type Origin = "internacional" | "arabe";

export interface RawGroup {
  gender: Gender;
  origin: Origin;
  brands: Record<string, string[]>;
}

export const RAW_CATALOG: RawGroup[] = [
  {
    gender: "femenino",
    origin: "internacional",
    brands: {
      "Ariana Grande": ["Cloud", "Sweet Like Candy"],
      "Armani": ["Armani Code", "My Way", "My Way Intense", "Si"],
      "Britney Spears": ["Fantasy"],
      "Cacharel": ["Amor Amor", "Anais Anais"],
      "Calvin Klein": ["Eternity", "One Shock"],
      "Carolina Herrera": [
        "212 Heroes",
        "212 New York",
        "212 Sexy",
        "212 VIP",
        "212 VIP Rosé",
        "CH",
        "Good Girl Glorious Gold",
        "Good Girl",
        "Good Girl Blush",
        "Good Girl Supreme",
        "Good Girl Very",
        "La Bomba"
      ],
      "Chanel": ["Chanel N°5"],
      "Christian Dior": [
        "Hypnotic Poison",
        "J'adore",
        "Miss Dior",
        "Poison",
        "Poison Girl"
      ],
      "Davidoff": ["Cool Water"],
      "DKNY": ["Be Delicious"],
      "Dolce & Gabbana": ["Light Blue", "The One", "The Only One"],
      "Giorgio Armani": ["Because It's You", "Acqua di Gio", "Acqua di Gioia"],
      "Givenchy": [
        "Amarige",
        "Ange ou Demon",
        "Irresistible",
        "L'Interdit",
        "L'Interdit Rouge",
        "Very Irresistible"
      ],
      "Guerlain": ["Acqua Alegoría"],
      "J. Del Pozo": ["Halloween"],
      "Jean Paul Gaultier": ["Divine", "Scandal", "Scandal Gold", "Scandal Le Parfum"],
      "Kenzo": ["Amour", "Flower"],
      "Lancôme": [
        "Idole",
        "La Vida es Bella",
        "La Vida es Bella Intense",
        "Tresor Le Nuit"
      ],
      "Issey Miyake": ["L'Eau d'Issey"],
      "Moschino": ["Toy 2", "Toy 2 Bubble Gum"],
      "Nina Ricci": ["Nina", "Ricci Ricci"],
      "Paco Rabanne": [
        "Black XS",
        "Fame",
        "Fame Parfum",
        "Lady Million",
        "Olympea",
        "Pure XS"
      ],
      "Parfums de Marly": ["Delina"],
      "Ralph Lauren": ["Ralph", "Ralph Blue"],
      "Shakira": ["Shakira Elixir", "Shakira Rock"],
      "Thierry Mugler": ["Alien", "Alien Goddess", "Angel", "Angel Nova"],
      "Tommy Hilfiger": ["Tommy Girl"],
      "Valentino": [
        "Born in Roma Donna",
        "Born in Roma Extradose Donna",
        "Purple Melancholia"
      ],
      "Victoria's Secret": ["Bombshell Night", "Summer Daze", "Very Sexy"],
      "Versace": ["Eros"],
      "Viktor & Rolf": ["Bonbon", "Flowerbomb"],
      "Yves Saint Laurent": ["Black Opium", "Libre"]
    }
  },
  {
    gender: "masculino",
    origin: "internacional",
    brands: {
      "Antonio Banderas": [
        "Blue Seduction",
        "Icon",
        "King of Seduction",
        "Power of Seduction"
      ],
      "Azzaro": ["Azzaro", "The Most Wanted", "Wanted", "Wanted by Night"],
      "Bulgari": ["Man in Black"],
      "Calvin Klein": ["Shock"],
      "Carolina Herrera": [
        "212 Heroes",
        "212 New York",
        "212 Sexy",
        "212 VIP Men",
        "212 VIP Black",
        "Bad Boy",
        "Bad Boy Cobalt",
        "Bad Boy Dazzling Garden",
        "Bad Boy Extreme",
        "CH"
      ],
      "Chanel": ["Allure Sport", "Bleu de Chanel"],
      "Christian Dior": [
        "Dior Homme",
        "Dior Homme Intense",
        "Fahrenheit",
        "Sauvage",
        "Sauvage Elixir"
      ],
      "Creed": ["Aventus", "Aventus Millesime 1849", "Aventus Absolu"],
      "Davidoff": ["Cool Water"],
      "Dolce & Gabbana": ["Light Blue", "The One"],
      "Giorgio Armani": [
        "Acqua di Gio",
        "Acqua di Gio Profondo",
        "Acqua di Gio Profumo",
        "Armani Code",
        "Armani Code Absolut",
        "Armani Code Profumo",
        "Stronger With You",
        "Stronger With You Intensely"
      ],
      "Givenchy": ["Gentleman Society", "Gentleman Only", "Gentleman Reserve Privée"],
      "Gucci": ["Guilty Black"],
      "Hugo Boss": [
        "Boss Bottled",
        "Boss The Scent Elixir",
        "Hugo Boss",
        "Bottled Elixir",
        "Bottled Night"
      ],
      "Jean Paul Gaultier": [
        "Le Beau",
        "Le Male",
        "Le Male Elixir",
        "Le Male Parfum",
        "Paradise Garden",
        "Scandal",
        "Scandal Pour Homme Absolu",
        "Ultra Male"
      ],
      "Kenzo": ["Kenzo Homme", "Kenzo Homme Night"],
      "Louis Vuitton": ["Afternoon Sweet", "Imagination", "Nuit de Feu", "Ombre Nomade"],
      "Issey Miyake": ["L'Eau d'Issey"],
      "Moschino": ["Toy Boy"],
      "Parfums de Marly": ["Haltane", "Layton Exclusif"],
      "Paco Rabanne": [
        "Invictus",
        "Invictus Acqua",
        "Invictus Legend",
        "Invictus Platinum",
        "Invictus Victory",
        "Invictus Victory Elixir",
        "One Million",
        "One Million Elixir",
        "One Million Lucky",
        "Phantom",
        "Phantom Parfum",
        "XS Aphrodisiaque",
        "XS Black"
      ],
      "Ralph Lauren": [
        "Polo",
        "Polo Black",
        "Polo Blue",
        "Polo Red",
        "Polo Sport",
        "Polo Ultra Blue"
      ],
      "Thierry Mugler": ["A Men"],
      "Tom Ford": [
        "Noir Extreme",
        "Lost Cherry",
        "Ombre Leather",
        "Oud Wood",
        "Soleil Blanc",
        "Tobacco Vanilla",
        "Costa Azzurra",
        "Neroli Portofino",
        "Fucking Fabulous"
      ],
      "Tommy Hilfiger": ["Tommy Hilfiger"],
      "Valentino": ["Born in Roma", "Born in Roma Extradose", "Born in Roma Intense"],
      "Versace": ["Dylan Blue", "Eros Flame"],
      "Viktor & Rolf": ["Spice Bomb"],
      "Yves Saint Laurent": ["MYSLF", "Y Eau de Parfum"]
    }
  },
  {
    gender: "unisex",
    origin: "internacional",
    brands: {
      "Amouage": ["Guidance 46"],
      "Calvin Klein": ["CK One"],
      "Kilian": ["Angel's Share"],
      "Maison Francis Kurkdjian": ["Baccarat Rouge 540"],
      "Memo Paris": ["Iris Leather"]
    }
  },
  {
    gender: "femenino",
    origin: "arabe",
    brands: {
      "Kajal": ["Dahab"],
      "Kayali": ["Yum Marshmallow"],
      "Lattafa": [
        "Eclaire",
        "Mayar Cherry Intense",
        "Opulent Musk",
        "Sakeena",
        "Yara",
        "Yara Candy",
        "Yara Elixir",
        "Yara Tous"
      ]
    }
  },
  {
    gender: "unisex",
    origin: "arabe",
    brands: {
      "Al Haramain": ["Amber Oud Gold"],
      "Kayali": ["Yum Pistachio"],
      "Lattafa": [
        "Amethyst",
        "Honor y Gloria",
        "Khamrah",
        "Khamrah Qahwa",
        "Nebras",
        "Oud for Glory",
        "Oud Mood",
        "Sublime",
        "Teriaq"
      ],
      "Montale": ["Arabians Tonka"],
      "Xerjoff": ["Accento Overdose", "Amber Gold", "Erba Pura"]
    }
  },
  {
    gender: "masculino",
    origin: "arabe",
    brands: {
      "Al Haramain": ["Amber Oud Dubai Night"],
      // 9PM y 9PM Night Out son de Afnan; Club de Nuit y Mandarin Sky
      // (Odyssey Mandarin Sky) son de Armaf. Confirmado con el cliente.
      "Afnan": ["9PM", "9PM Night Out"],
      "Armaf": ["Club de Nuit", "Mandarin Sky"],
      "Bharara": ["Bharara King"],
      "Lattafa": ["Asad", "Asad Bourbon", "Asad Elixir"],
      "Rasasi": ["Hawas for Him"]
    }
  }
];
