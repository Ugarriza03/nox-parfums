/**
 * QA del matcher de variantes.
 *
 * El riesgo real del autocompletado es cargarle a una fragancia las notas de
 * otra parecida. Estos casos cubren exactamente eso.
 *
 *   npm run qa:match
 */

import {
  matchVariant,
  normalize,
  parseDesignerIndex,
  parsePerfumePage,
  translateNote,
  familiesFromAccords
} from "./lib/fragrantica.mjs";

let fallas = 0;
function check(nombre, ok, detalle = "") {
  if (!ok) fallas++;
  console.log(`${ok ? "✓" : "✗"} ${nombre}${detalle ? ` — ${detalle}` : ""}`);
}

/* ============ 1. La familia Le Male: el caso que no puede fallar ========== */

const JPG = [
  "Le Male",
  "Le Male Elixir",
  "Le Male Le Parfum",
  "Le Male Essence de Parfum",
  "Le Male Terrible",
  "Le Male Elixir Absolu",
  "Ultra Male",
  "Le Beau",
  "Le Beau Le Parfum",
  "Scandal",
  "Scandal Pour Homme",
  "Scandal Pour Homme Absolu"
];

console.log("\n1. VARIANTES CON NOMBRE PARECIDO (Jean Paul Gaultier)\n" + "─".repeat(60));

for (const [target, esperado] of [
  ["Le Male", "Le Male"],
  ["Le Male Elixir", "Le Male Elixir"],
  // La referencia se llama "Le Male Le Parfum". El alias acotado a esta casa
  // (BRAND_NAME_ALIASES) lo resuelve; el naming público NOX no cambia.
  ["Le Male Parfum", "Le Male Le Parfum"],
  ["Ultra Male", "Ultra Male"],
  ["Le Beau", "Le Beau"],
  ["Scandal Pour Homme Absolu", "Scandal Pour Homme Absolu"]
]) {
  const r = matchVariant(target, "Jean Paul Gaultier", JPG);
  const got = r.candidate ?? null;
  const ok = got === esperado;
  check(
    `"${target}" → ${got ?? `sin match (${r.confidence})`}`,
    ok,
    ok ? r.confidence : `esperado ${esperado ?? "sin match"}`
  );
}

// El alias vale sólo dentro de su casa: con otra marca no resuelve nada.
const otraCasa = matchVariant("Le Male Parfum", "Otra Casa", JPG);
check(
  "el alias está acotado a la casa y no se aplica a otra marca",
  otraCasa.candidate === null,
  otraCasa.candidate ?? otraCasa.confidence
);

// Un nombre sin alias que encaja parcialmente en varios sigue sin autocompletarse.
const sinAlias = matchVariant("Le Beau Parfum", "Jean Paul Gaultier", JPG);
check(
  "un nombre ambiguo sin alias NO se autocompleta y deja candidatos",
  sinAlias.candidate === null && sinAlias.candidates.length > 0,
  sinAlias.candidates.join(" | ")
);

/* ================ 2. Prefijo de marca en el nombre real ================== */

console.log("\n2. PREFIJO DE MARCA\n" + "─".repeat(60));

const VALENTINO = [
  "Valentino Uomo Born in Roma",
  "Valentino Uomo Born In Roma Intense",
  "Valentino Donna Born In Roma",
  "Born in Roma Extradose Uomo",
  "Born in Roma Extradose Donna",
  "Valentino Uomo"
];
const bir = matchVariant("Born in Roma", "Valentino", VALENTINO);
check(
  '"Born in Roma" resuelve por alias al masculino',
  bir.candidate === "Valentino Uomo Born in Roma",
  `${bir.candidate} (${bir.confidence})`
);
const birDonna = matchVariant("Born in Roma Donna", "Valentino", VALENTINO);
check(
  '"Born in Roma Donna" resuelve al femenino, no al masculino',
  birDonna.candidate === "Valentino Donna Born In Roma",
  `${birDonna.candidate} (${birDonna.confidence})`
);

const ARMANI = ["Emporio Armani Stronger With You", "Emporio Armani Stronger With You Intensely"];
const swy = matchVariant("Stronger With You", "Giorgio Armani", ARMANI);
check(
  '"Stronger With You" no se confunde con "Intensely"',
  swy.candidate === "Emporio Armani Stronger With You",
  `${swy.candidate} (${swy.confidence})`
);

/* ========================= 3. Alias de catálogo ========================== */

console.log("\n3. ALIAS DE NOMBRE\n" + "─".repeat(60));

const RABANNE = ["1 Million", "1 Million Elixir", "1 Million Lucky", "1 Million Parfum", "Invictus"];
const million = matchVariant("One Million", "Paco Rabanne", RABANNE);
check('"One Million" → "1 Million"', million.candidate === "1 Million", million.confidence);

const millionElixir = matchVariant("One Million Elixir", "Paco Rabanne", RABANNE);
check(
  '"One Million Elixir" → "1 Million Elixir" (no al base)',
  millionElixir.candidate === "1 Million Elixir",
  millionElixir.confidence
);

const TF = ["Tobacco Vanille", "Tobacco Oud", "Vanille Fatale", "Vanilla"];
const tv = matchVariant("Tobacco Vanilla", "Tom Ford", TF);
check('"Tobacco Vanilla" → "Tobacco Vanille"', tv.candidate === "Tobacco Vanille", tv.confidence);

/* ============ 3bis. Distinción 212 VIP femenino / masculino ============= */

console.log("\n3bis. 212 VIP: femenino vs masculino\n" + "─".repeat(60));

const CH_212 = [
  "212 VIP",            // femenino
  "212 VIP Men",        // masculino
  "212 VIP Rose",
  "212 VIP Black",
  "212 VIP Men Wins",
  "212 Men"
];
const vipFem = matchVariant("212 VIP", "Carolina Herrera", CH_212);
check(
  '"212 VIP" (femenino) NO cae en el masculino',
  vipFem.candidate === "212 VIP" && vipFem.confidence === "exact",
  `${vipFem.candidate} (${vipFem.confidence})`
);
const vipMasc = matchVariant("212 VIP Men", "Carolina Herrera", CH_212);
check(
  '"212 VIP Men" (masculino) NO cae en el femenino',
  vipMasc.candidate === "212 VIP Men" && vipMasc.confidence === "exact",
  `${vipMasc.candidate} (${vipMasc.confidence})`
);
check(
  "los dos resuelven a referencias distintas",
  vipFem.candidate !== vipMasc.candidate
);

/* =============== 3ter. Afnan / Armaf tras la corrección ================= */

console.log("\n3ter. Afnan / Armaf\n" + "─".repeat(60));

const AFNAN = ["9pm", "9 PM Night Out", "9am", "9PM Elixir"];
const nuevePm = matchVariant("9PM", "Afnan", AFNAN);
check('"9PM" resuelve dentro de Afnan', nuevePm.candidate === "9pm", `${nuevePm.candidate} (${nuevePm.confidence})`);
const nocheFuera = matchVariant("9PM Night Out", "Afnan", AFNAN);
check(
  '"9PM Night Out" no se confunde con "9PM"',
  nocheFuera.candidate === "9 PM Night Out",
  `${nocheFuera.candidate} (${nocheFuera.confidence})`
);

const ARMAF = ["Club de Nuit Intense Man", "Club de Nuit Man", "Odyssey Mandarin Sky", "Odyssey Amber Rouge"];
const cdn = matchVariant("Club de Nuit", "Armaf", ARMAF);
check(
  '"Club de Nuit" → Intense Man por alias, no al "Man"',
  cdn.candidate === "Club de Nuit Intense Man",
  `${cdn.candidate} (${cdn.confidence})`
);
const mandarin = matchVariant("Mandarin Sky", "Armaf", ARMAF);
check(
  '"Mandarin Sky" → Odyssey Mandarin Sky, dentro de Armaf',
  mandarin.candidate === "Odyssey Mandarin Sky",
  `${mandarin.candidate} (${mandarin.confidence})`
);

/* ==================== 4. Ambiguo y no encontrado ======================== */

console.log("\n4. CASOS QUE DEBEN QUEDAR PARA REVISIÓN\n" + "─".repeat(60));

const amb = matchVariant("Fantasy", "Britney Spears", [
  "Fantasy",
  "Fantasy Intense",
  "Fantasy The Naughty Remix"
]);
check("un nombre exacto gana aunque haya flankers", amb.candidate === "Fantasy", amb.confidence);

const noHay = matchVariant("Perfume Inexistente", "Chanel", ["No 5", "Coco", "Allure"]);
check(
  "sin coincidencia → not-found y sin candidato",
  noHay.candidate === null && noHay.confidence === "not-found",
  noHay.confidence
);

const duplicado = matchVariant("Eros", "Versace", ["Eros", "Eros", "Eros Flame"]);
check(
  "dos entradas idénticas → ambiguo, no elige ninguna",
  duplicado.candidate === null && duplicado.confidence === "ambiguous",
  duplicado.candidates.join(" | ")
);

/* ========================= 5. Normalización ============================= */

console.log("\n5. NORMALIZACIÓN\n" + "─".repeat(60));

check("acentos", normalize("Olympéa") === "olympea", normalize("Olympéa"));
check("apóstrofes", normalize("Angel's Share") === "angels share", normalize("Angel's Share"));
check("ampersand", normalize("Viktor & Rolf") === "viktor and rolf", normalize("Viktor & Rolf"));
check("símbolos", normalize("Chanel N°5") === "chanel n 5", normalize("Chanel N°5"));
check(
  "dígito pegado a letra: 9PM = 9 PM = 9pm",
  normalize("9PM") === normalize("9 PM") && normalize("9pm") === normalize("9PM"),
  normalize("9PM")
);
check(
  "sigue distinguiendo 9PM de 9PM Night Out",
  normalize("9PM") !== normalize("9PM Night Out")
);

/* ===================== 6. Parsers sobre HTML de prueba ================== */

console.log("\n6. PARSERS\n" + "─".repeat(60));

const indexHtml = `
<div class="cell">
  <a href="/perfume/Rabanne/Invictus-18471.html"><span>Invictus</span></a>
  <a href="/perfume/Rabanne/Invictus-Victory-65177.html">Invictus Victory</a>
  <a href="/perfume/Rabanne/1-Million-3747.html">1 Million</a>
  <a href="/designers/Rabanne.html">Rabanne</a>
</div>`;
const idx = parseDesignerIndex(indexHtml);
check("índice de casa: 3 fragancias, ignora el link de la casa", idx.length === 3, idx.map((i) => i.name).join(" | "));
check(
  "índice de casa: URL absoluta",
  idx[0].url === "https://www.fragrantica.com/perfume/Rabanne/Invictus-18471.html",
  idx[0].url
);

const perfumeHtml = `
<h1>Invictus Rabanne for men</h1>
<div itemprop="brand" content="Rabanne"></div>
<p>Top notes are Sea Notes, Grapefruit and Mandarin Orange; middle notes are Bay Leaf and Jasmine;
base notes are Ambergris, Guaiac Wood, Oakmoss and Patchouli.</p>
<div class="accord-bar" style="width:100%">Citrus</div>
<div class="accord-bar" style="width:80%">Marine</div>
<div class="accord-bar" style="width:60%">Woody</div>`;
const parsed = parsePerfumePage(perfumeHtml);
check("ficha: notas de salida", parsed?.topNotes.join(", ") === "Sea Notes, Grapefruit, Mandarin Orange", parsed?.topNotes.join(", "));
check("ficha: notas de corazón", parsed?.middleNotes.join(", ") === "Bay Leaf, Jasmine", parsed?.middleNotes.join(", "));
check("ficha: notas de fondo (4)", parsed?.baseNotes.length === 4, parsed?.baseNotes.join(", "));
check("ficha: acordes", parsed?.accords.join(", ") === "Citrus, Marine, Woody", parsed?.accords.join(", "));

const vacio = parsePerfumePage("<h1>Algo</h1><p>Sin notas.</p>");
check("ficha sin notas → null (no inventa)", vacio === null);

/* ===================== 7. Traducción y familias ========================= */

console.log("\n7. TRADUCCIÓN Y FAMILIA\n" + "─".repeat(60));

check("traduce nota conocida", translateNote("Sea Notes") === "Notas marinas", String(translateNote("Sea Notes")));
check("traduce con acento", translateNote("Grapefruit") === "Pomelo", String(translateNote("Grapefruit")));
check(
  "nota desconocida → null (no traduce a ojo)",
  translateNote("Hypothetical Accord XYZ") === null
);

const fam = familiesFromAccords(["Citrus", "Marine", "Woody"]);
check(
  "familias desde acordes",
  fam[0] === "citrico-fresco" && fam.includes("acuatico") && fam.includes("amaderado"),
  fam.join(" · ")
);

console.log("\n" + "─".repeat(60));
console.log(fallas === 0 ? "Todo OK" : `${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
