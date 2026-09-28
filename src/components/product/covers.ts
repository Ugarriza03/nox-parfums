/**
 * PORTADAS REALES DE PRODUCTO — única fuente de verdad
 *
 * Mapea productSlug -> ruta pública de la portada fotográfica. Un producto que
 * figura acá muestra esa imagen en la card y en la ficha; uno que no figura cae
 * en la composición generada por FragranceVisual, que sigue siendo el respaldo
 * de los productos que todavía no tienen foto.
 *
 * Reglas:
 *   · Las claves son slugs QUE YA EXISTEN en el catálogo. Este módulo nunca
 *     crea productos ni renombra registros: si un slug no existe, la portada
 *     simplemente no se muestra.
 *   · Los archivos viven en public/products/covers/<productSlug>.webp, así que
 *     el nombre del asset se deduce del slug y no hay dos listas que sincronizar.
 *   · Formato WebP calidad 92 a resolución original (1122 × 1402, 4:5). Mismos
 *     píxeles y mismo encuadre que los PNG entregados — sin recorte ni cambio
 *     de proporción —, ~8× más livianos: 38 MB -> 4,7 MB en total. Los PNG
 *     originales siguen siendo el master fuera del repositorio.
 *
 * Lote 01 — 10 portadas.
 * Lote 02 — 10 portadas (Al Haramain, Antonio Banderas, Armaf, Azzaro).
 * Lote 03 — 10 portadas. "Armani Code" va al masculino de Giorgio Armani; el
 *   femenino homónimo de la casa "Armani" sigue sin portada.
 * Lote 05 — 2 portadas: los dos Calvin Klein Shock, que en el lote 04 habían
 *   quedado pendientes por el cruce de nombres.
 * Lote 04 — 173 portadas. El lote traía 182 archivos; los nombres de archivo NO
 *   resultaron confiables (varios apuntaban a una fragancia y la imagen mostraba
 *   otra), así que cada imagen se identificó por el panel "INSPIRADO EN" que
 *   lleva impreso. 179 quedaron asociadas: 173 como portada principal y 6 como
 *   segunda versión del mismo producto (ver PORTADAS_ALTERNATIVAS). Tres quedaron
 *   pendientes de decisión y no se conectaron.
 * Lote 07 — 26 portadas: las 22 que nunca habían tenido imagen, más las cuatro
 *   cuya identidad se cerró en el lote 06 (Acqua di Gio femenino, Acqua di Gioia,
 *   The One for Men y L'Eau d'Issey Pour Homme). Los nombres de archivo venían ya
 *   mapeados, pero igual se verificó el panel "INSPIRADO EN" de las 26 una por una
 *   antes de conectarlas: las 26 coincidían. Con este lote el catálogo queda en
 *   231 de 233; sólo Dior Homme y J'adore siguen en FragranceVisual, esperando que
 *   se defina su variante.
 * Lote 08 — las 2 últimas: Dior Homme y J'adore. NOX definió la variante de cada
 *   una y la dejó impresa en la portada: "DIOR HOMME ORIGINAL" y "J'ADORE EAU DE
 *   TOILETTE". Con esto el catálogo queda en 233 de 233 y FragranceVisual deja de
 *   usarse en producción, aunque sigue siendo el respaldo del sistema. Ojo: estos
 *   dos productos tienen portada pero todavía NO tienen perfil olfativo cargado;
 *   la variante impresa acá es la evidencia para cargarlo cuando se haga.
 */

import type { Product } from "@/data/types";

/**
 * Tabla explícita slug -> archivo. Las rutas van literales a propósito: el
 * build del preview standalone (scripts/build-preview.mjs) las reemplaza por
 * data URIs para que el HTML de doble clic siga mostrando las fotos sin
 * servidor. Si se armaran por concatenación, no habría nada que reemplazar.
 */
const PORTADAS: Record<string, string> = {
  "afnan-9pm": "/products/covers/afnan-9pm.webp",
  "afnan-9pm-night-out": "/products/covers/afnan-9pm-night-out.webp",
  "ariana-grande-cloud": "/products/covers/ariana-grande-cloud.webp",
  "armani-my-way": "/products/covers/armani-my-way.webp",
  "azzaro-azzaro": "/products/covers/azzaro-azzaro.webp",
  "azzaro-wanted": "/products/covers/azzaro-wanted.webp",
  "jean-paul-gaultier-le-male-elixir": "/products/covers/jean-paul-gaultier-le-male-elixir.webp",
  "louis-vuitton-imagination": "/products/covers/louis-vuitton-imagination.webp",
  // El catálogo publica "Tobacco Vanilla"; la referencia original es "Tobacco
  // Vanille" (el alias ya existe en el matcher). El archivo llegó con el nombre
  // de la referencia y se asocia al slug del catálogo, sin tocarlo.
  "tom-ford-tobacco-vanilla": "/products/covers/tom-ford-tobacco-vanilla.webp",
  // El archivo llegó como "...-intense-masculino": el sufijo describe el género
  // y no forma parte del slug. La línea masculina de Born in Roma no tiene par
  // femenino homónimo (el femenino es "-donna"), así que la referencia es única.
  "valentino-born-in-roma-intense": "/products/covers/valentino-born-in-roma-intense.webp",

  /* ------------------------------------------------------------- lote 02 */
  "al-haramain-amber-oud-dubai-night": "/products/covers/al-haramain-amber-oud-dubai-night.webp",
  "al-haramain-amber-oud-gold": "/products/covers/al-haramain-amber-oud-gold.webp",
  "antonio-banderas-blue-seduction": "/products/covers/antonio-banderas-blue-seduction.webp",
  // El archivo llegó como "The Icon"; el catálogo publica "Icon" y no se renombra.
  "antonio-banderas-icon": "/products/covers/antonio-banderas-icon.webp",
  "antonio-banderas-king-of-seduction": "/products/covers/antonio-banderas-king-of-seduction.webp",
  "antonio-banderas-power-of-seduction": "/products/covers/antonio-banderas-power-of-seduction.webp",
  "armaf-club-de-nuit": "/products/covers/armaf-club-de-nuit.webp",
  // El archivo llegó como "Odyssey Mandarin Sky (corregida)": "Odyssey" es el
  // alias interno de la referencia, que el catálogo no publica. Esta es la
  // única portada activa de Mandarin Sky; no había una anterior.
  "armaf-mandarin-sky": "/products/covers/armaf-mandarin-sky.webp",
  "azzaro-the-most-wanted": "/products/covers/azzaro-the-most-wanted.webp",
  "azzaro-wanted-by-night": "/products/covers/azzaro-wanted-by-night.webp",

  /* ------------------------------------------------------------- lote 03 */
  // El catálogo no tiene un "Guidance" base: Guidance 46 es la única referencia.
  "amouage-guidance-46": "/products/covers/amouage-guidance-46.webp",
  "ariana-grande-sweet-like-candy": "/products/covers/ariana-grande-sweet-like-candy.webp",
  // My Way Intense es un producto aparte de My Way, que ya tiene portada (lote 01).
  "armani-my-way-intense": "/products/covers/armani-my-way-intense.webp",
  // El archivo llegó como "Bharara King"; el catálogo lo publica como
  // "Bharara Bharara King" (casa + nombre). No se crea un producto "King".
  "bharara-bharara-king": "/products/covers/bharara-bharara-king.webp",
  "britney-spears-fantasy": "/products/covers/britney-spears-fantasy.webp",
  // El archivo llegó como "Bvlgari"; el catálogo escribe la casa "Bulgari".
  // Es el mismo producto: no se crea una segunda marca por la grafía.
  "bulgari-man-in-black": "/products/covers/bulgari-man-in-black.webp",
  "cacharel-amor-amor": "/products/covers/cacharel-amor-amor.webp",
  "cacharel-anais-anais": "/products/covers/cacharel-anais-anais.webp",
  "calvin-klein-ck-one": "/products/covers/calvin-klein-ck-one.webp",
  /* Lote 05 — los dos CK Shock. El catálogo publica "Shock" para el masculino y
     "One Shock" para el femenino, al revés de lo que dice el título impreso en
     cada portada. Se asignaron por el frasco ("for him" / "for her") y por la
     fuente verificada de cada producto, que son CK One Shock For Him y For Her. */
  "calvin-klein-shock": "/products/covers/calvin-klein-shock.webp",
  "calvin-klein-one-shock": "/products/covers/calvin-klein-one-shock.webp",
  // 03_Armani_Code.png es el Armani Code MASCULINO de Giorgio Armani (confirmado):
  // las notas de la portada coinciden 5/5 con este perfil y 0/5 con
  // "armani-armani-code", que es el femenino y no tiene portada.
  "giorgio-armani-armani-code": "/products/covers/giorgio-armani-armani-code.webp",

  /* ------------------------------------------------------------- lote 04 */
  "armani-si": "/products/covers/armani-si.webp",
  "calvin-klein-eternity": "/products/covers/calvin-klein-eternity.webp",
  "carolina-herrera-212-heroes-femenino": "/products/covers/carolina-herrera-212-heroes-femenino.webp",
  "carolina-herrera-212-heroes-masculino": "/products/covers/carolina-herrera-212-heroes-masculino.webp",
  "carolina-herrera-212-new-york-femenino": "/products/covers/carolina-herrera-212-new-york-femenino.webp",
  "carolina-herrera-212-new-york-masculino": "/products/covers/carolina-herrera-212-new-york-masculino.webp",
  "carolina-herrera-212-sexy-femenino": "/products/covers/carolina-herrera-212-sexy-femenino.webp",
  "carolina-herrera-212-sexy-masculino": "/products/covers/carolina-herrera-212-sexy-masculino.webp",
  "carolina-herrera-212-vip": "/products/covers/carolina-herrera-212-vip.webp",
  "carolina-herrera-212-vip-black": "/products/covers/carolina-herrera-212-vip-black.webp",
  "carolina-herrera-212-vip-men": "/products/covers/carolina-herrera-212-vip-men.webp",
  "carolina-herrera-212-vip-rose": "/products/covers/carolina-herrera-212-vip-rose.webp",
  "carolina-herrera-bad-boy": "/products/covers/carolina-herrera-bad-boy.webp",
  "carolina-herrera-bad-boy-cobalt": "/products/covers/carolina-herrera-bad-boy-cobalt.webp",
  "carolina-herrera-bad-boy-dazzling-garden": "/products/covers/carolina-herrera-bad-boy-dazzling-garden.webp",
  "carolina-herrera-bad-boy-extreme": "/products/covers/carolina-herrera-bad-boy-extreme.webp",
  "carolina-herrera-ch-femenino": "/products/covers/carolina-herrera-ch-femenino.webp",
  "carolina-herrera-ch-masculino": "/products/covers/carolina-herrera-ch-masculino.webp",
  "carolina-herrera-good-girl": "/products/covers/carolina-herrera-good-girl.webp",
  "carolina-herrera-good-girl-blush": "/products/covers/carolina-herrera-good-girl-blush.webp",
  "carolina-herrera-good-girl-glorious-gold": "/products/covers/carolina-herrera-good-girl-glorious-gold.webp",
  "carolina-herrera-good-girl-supreme": "/products/covers/carolina-herrera-good-girl-supreme.webp",
  "carolina-herrera-good-girl-very": "/products/covers/carolina-herrera-good-girl-very.webp",
  "carolina-herrera-la-bomba": "/products/covers/carolina-herrera-la-bomba.webp",
  "chanel-allure-sport": "/products/covers/chanel-allure-sport.webp",
  "chanel-bleu-de-chanel": "/products/covers/chanel-bleu-de-chanel.webp",
  "chanel-chanel-n-5": "/products/covers/chanel-chanel-n-5.webp",
  "christian-dior-dior-homme-intense": "/products/covers/christian-dior-dior-homme-intense.webp",
  "christian-dior-hypnotic-poison": "/products/covers/christian-dior-hypnotic-poison.webp",
  "christian-dior-miss-dior": "/products/covers/christian-dior-miss-dior.webp",
  "christian-dior-poison": "/products/covers/christian-dior-poison.webp",
  "christian-dior-poison-girl": "/products/covers/christian-dior-poison-girl.webp",
  "christian-dior-sauvage": "/products/covers/christian-dior-sauvage.webp",
  "christian-dior-sauvage-elixir": "/products/covers/christian-dior-sauvage-elixir.webp",
  "creed-aventus": "/products/covers/creed-aventus.webp",
  "creed-aventus-absolu": "/products/covers/creed-aventus-absolu.webp",
  "creed-aventus-millesime-1849": "/products/covers/creed-aventus-millesime-1849.webp",
  "davidoff-cool-water-femenino": "/products/covers/davidoff-cool-water-femenino.webp",
  "davidoff-cool-water-masculino": "/products/covers/davidoff-cool-water-masculino.webp",
  "dkny-be-delicious": "/products/covers/dkny-be-delicious.webp",
  "dolce-gabbana-light-blue-femenino": "/products/covers/dolce-gabbana-light-blue-femenino.webp",
  "dolce-gabbana-light-blue-masculino": "/products/covers/dolce-gabbana-light-blue-masculino.webp",
  "dolce-gabbana-the-one-femenino": "/products/covers/dolce-gabbana-the-one-femenino.webp",
  "dolce-gabbana-the-only-one": "/products/covers/dolce-gabbana-the-only-one.webp",
  "giorgio-armani-acqua-di-gio-masculino": "/products/covers/giorgio-armani-acqua-di-gio-masculino.webp",
  "giorgio-armani-acqua-di-gio-profondo": "/products/covers/giorgio-armani-acqua-di-gio-profondo.webp",
  "giorgio-armani-acqua-di-gio-profumo": "/products/covers/giorgio-armani-acqua-di-gio-profumo.webp",
  "giorgio-armani-because-its-you": "/products/covers/giorgio-armani-because-its-you.webp",
  "giorgio-armani-stronger-with-you": "/products/covers/giorgio-armani-stronger-with-you.webp",
  "giorgio-armani-stronger-with-you-intensely": "/products/covers/giorgio-armani-stronger-with-you-intensely.webp",
  "givenchy-ange-ou-demon": "/products/covers/givenchy-ange-ou-demon.webp",
  "givenchy-gentleman-only": "/products/covers/givenchy-gentleman-only.webp",
  "givenchy-gentleman-reserve-privee": "/products/covers/givenchy-gentleman-reserve-privee.webp",
  "givenchy-gentleman-society": "/products/covers/givenchy-gentleman-society.webp",
  "givenchy-irresistible": "/products/covers/givenchy-irresistible.webp",
  "givenchy-linterdit": "/products/covers/givenchy-linterdit.webp",
  "givenchy-linterdit-rouge": "/products/covers/givenchy-linterdit-rouge.webp",
  "givenchy-very-irresistible": "/products/covers/givenchy-very-irresistible.webp",
  "gucci-guilty-black": "/products/covers/gucci-guilty-black.webp",
  "guerlain-acqua-alegoria": "/products/covers/guerlain-acqua-alegoria.webp",
  "hugo-boss-boss-bottled": "/products/covers/hugo-boss-boss-bottled.webp",
  "hugo-boss-bottled-elixir": "/products/covers/hugo-boss-bottled-elixir.webp",
  "hugo-boss-bottled-night": "/products/covers/hugo-boss-bottled-night.webp",
  "hugo-boss-hugo-boss": "/products/covers/hugo-boss-hugo-boss.webp",
  "issey-miyake-leau-dissey-femenino": "/products/covers/issey-miyake-leau-dissey-femenino.webp",
  "jean-paul-gaultier-divine": "/products/covers/jean-paul-gaultier-divine.webp",
  "jean-paul-gaultier-le-beau": "/products/covers/jean-paul-gaultier-le-beau.webp",
  "jean-paul-gaultier-le-male": "/products/covers/jean-paul-gaultier-le-male.webp",
  "jean-paul-gaultier-le-male-parfum": "/products/covers/jean-paul-gaultier-le-male-parfum.webp",
  "jean-paul-gaultier-paradise-garden": "/products/covers/jean-paul-gaultier-paradise-garden.webp",
  "jean-paul-gaultier-scandal-femenino": "/products/covers/jean-paul-gaultier-scandal-femenino.webp",
  "jean-paul-gaultier-scandal-gold": "/products/covers/jean-paul-gaultier-scandal-gold.webp",
  "jean-paul-gaultier-scandal-le-parfum": "/products/covers/jean-paul-gaultier-scandal-le-parfum.webp",
  "jean-paul-gaultier-scandal-masculino": "/products/covers/jean-paul-gaultier-scandal-masculino.webp",
  "jean-paul-gaultier-scandal-pour-homme-absolu": "/products/covers/jean-paul-gaultier-scandal-pour-homme-absolu.webp",
  "jean-paul-gaultier-ultra-male": "/products/covers/jean-paul-gaultier-ultra-male.webp",
  "kajal-dahab": "/products/covers/kajal-dahab.webp",
  "kayali-yum-marshmallow": "/products/covers/kayali-yum-marshmallow.webp",
  "kayali-yum-pistachio": "/products/covers/kayali-yum-pistachio.webp",
  "kenzo-amour": "/products/covers/kenzo-amour.webp",
  "kenzo-flower": "/products/covers/kenzo-flower.webp",
  "kenzo-kenzo-homme": "/products/covers/kenzo-kenzo-homme.webp",
  "kenzo-kenzo-homme-night": "/products/covers/kenzo-kenzo-homme-night.webp",
  "kilian-angels-share": "/products/covers/kilian-angels-share.webp",
  "lancome-idole": "/products/covers/lancome-idole.webp",
  "lancome-la-vida-es-bella": "/products/covers/lancome-la-vida-es-bella.webp",
  "lancome-la-vida-es-bella-intense": "/products/covers/lancome-la-vida-es-bella-intense.webp",
  "lattafa-amethyst": "/products/covers/lattafa-amethyst.webp",
  "lattafa-asad": "/products/covers/lattafa-asad.webp",
  "lattafa-asad-bourbon": "/products/covers/lattafa-asad-bourbon.webp",
  "lattafa-asad-elixir": "/products/covers/lattafa-asad-elixir.webp",
  "lattafa-eclaire": "/products/covers/lattafa-eclaire.webp",
  "lattafa-honor-y-gloria": "/products/covers/lattafa-honor-y-gloria.webp",
  "lattafa-khamrah": "/products/covers/lattafa-khamrah.webp",
  "lattafa-khamrah-qahwa": "/products/covers/lattafa-khamrah-qahwa.webp",
  "lattafa-mayar-cherry-intense": "/products/covers/lattafa-mayar-cherry-intense.webp",
  "lattafa-opulent-musk": "/products/covers/lattafa-opulent-musk.webp",
  "lattafa-oud-for-glory": "/products/covers/lattafa-oud-for-glory.webp",
  "lattafa-oud-mood": "/products/covers/lattafa-oud-mood.webp",
  "lattafa-teriaq": "/products/covers/lattafa-teriaq.webp",
  "lattafa-yara": "/products/covers/lattafa-yara.webp",
  "lattafa-yara-candy": "/products/covers/lattafa-yara-candy.webp",
  "lattafa-yara-elixir": "/products/covers/lattafa-yara-elixir.webp",
  "lattafa-yara-tous": "/products/covers/lattafa-yara-tous.webp",
  "louis-vuitton-afternoon-sweet": "/products/covers/louis-vuitton-afternoon-sweet.webp",
  "louis-vuitton-nuit-de-feu": "/products/covers/louis-vuitton-nuit-de-feu.webp",
  "maison-francis-kurkdjian-baccarat-rouge-540": "/products/covers/maison-francis-kurkdjian-baccarat-rouge-540.webp",
  "memo-paris-iris-leather": "/products/covers/memo-paris-iris-leather.webp",
  "montale-arabians-tonka": "/products/covers/montale-arabians-tonka.webp",
  "moschino-toy-2-bubble-gum": "/products/covers/moschino-toy-2-bubble-gum.webp",
  "moschino-toy-boy": "/products/covers/moschino-toy-boy.webp",
  "nina-ricci-ricci-ricci": "/products/covers/nina-ricci-ricci-ricci.webp",
  "paco-rabanne-black-xs": "/products/covers/paco-rabanne-black-xs.webp",
  "paco-rabanne-fame": "/products/covers/paco-rabanne-fame.webp",
  "paco-rabanne-invictus": "/products/covers/paco-rabanne-invictus.webp",
  "paco-rabanne-invictus-acqua": "/products/covers/paco-rabanne-invictus-acqua.webp",
  "paco-rabanne-invictus-legend": "/products/covers/paco-rabanne-invictus-legend.webp",
  "paco-rabanne-invictus-platinum": "/products/covers/paco-rabanne-invictus-platinum.webp",
  "paco-rabanne-invictus-victory": "/products/covers/paco-rabanne-invictus-victory.webp",
  "paco-rabanne-invictus-victory-elixir": "/products/covers/paco-rabanne-invictus-victory-elixir.webp",
  "paco-rabanne-one-million": "/products/covers/paco-rabanne-one-million.webp",
  "paco-rabanne-one-million-elixir": "/products/covers/paco-rabanne-one-million-elixir.webp",
  "paco-rabanne-one-million-lucky": "/products/covers/paco-rabanne-one-million-lucky.webp",
  "paco-rabanne-phantom": "/products/covers/paco-rabanne-phantom.webp",
  "paco-rabanne-phantom-parfum": "/products/covers/paco-rabanne-phantom-parfum.webp",
  "paco-rabanne-pure-xs": "/products/covers/paco-rabanne-pure-xs.webp",
  "paco-rabanne-xs-aphrodisiaque": "/products/covers/paco-rabanne-xs-aphrodisiaque.webp",
  "paco-rabanne-xs-black": "/products/covers/paco-rabanne-xs-black.webp",
  "parfums-de-marly-delina": "/products/covers/parfums-de-marly-delina.webp",
  "parfums-de-marly-haltane": "/products/covers/parfums-de-marly-haltane.webp",
  "parfums-de-marly-layton-exclusif": "/products/covers/parfums-de-marly-layton-exclusif.webp",
  "ralph-lauren-polo": "/products/covers/ralph-lauren-polo.webp",
  "ralph-lauren-polo-black": "/products/covers/ralph-lauren-polo-black.webp",
  "ralph-lauren-polo-blue": "/products/covers/ralph-lauren-polo-blue.webp",
  "ralph-lauren-polo-red": "/products/covers/ralph-lauren-polo-red.webp",
  "ralph-lauren-polo-sport": "/products/covers/ralph-lauren-polo-sport.webp",
  "ralph-lauren-polo-ultra-blue": "/products/covers/ralph-lauren-polo-ultra-blue.webp",
  "ralph-lauren-ralph": "/products/covers/ralph-lauren-ralph.webp",
  "ralph-lauren-ralph-blue": "/products/covers/ralph-lauren-ralph-blue.webp",
  "rasasi-hawas-for-him": "/products/covers/rasasi-hawas-for-him.webp",
  "shakira-shakira-elixir": "/products/covers/shakira-shakira-elixir.webp",
  "shakira-shakira-rock": "/products/covers/shakira-shakira-rock.webp",
  "thierry-mugler-alien": "/products/covers/thierry-mugler-alien.webp",
  "thierry-mugler-angel": "/products/covers/thierry-mugler-angel.webp",
  "thierry-mugler-angel-nova": "/products/covers/thierry-mugler-angel-nova.webp",
  "tom-ford-costa-azzurra": "/products/covers/tom-ford-costa-azzurra.webp",
  "tom-ford-fucking-fabulous": "/products/covers/tom-ford-fucking-fabulous.webp",
  "tom-ford-lost-cherry": "/products/covers/tom-ford-lost-cherry.webp",
  "tom-ford-noir-extreme": "/products/covers/tom-ford-noir-extreme.webp",
  "tom-ford-ombre-leather": "/products/covers/tom-ford-ombre-leather.webp",
  "tom-ford-oud-wood": "/products/covers/tom-ford-oud-wood.webp",
  "tom-ford-soleil-blanc": "/products/covers/tom-ford-soleil-blanc.webp",
  "tommy-hilfiger-tommy-girl": "/products/covers/tommy-hilfiger-tommy-girl.webp",
  "tommy-hilfiger-tommy-hilfiger": "/products/covers/tommy-hilfiger-tommy-hilfiger.webp",
  "valentino-born-in-roma": "/products/covers/valentino-born-in-roma.webp",
  "valentino-born-in-roma-donna": "/products/covers/valentino-born-in-roma-donna.webp",
  "valentino-born-in-roma-extradose": "/products/covers/valentino-born-in-roma-extradose.webp",
  "valentino-born-in-roma-extradose-donna": "/products/covers/valentino-born-in-roma-extradose-donna.webp",
  "valentino-purple-melancholia": "/products/covers/valentino-purple-melancholia.webp",
  "versace-dylan-blue": "/products/covers/versace-dylan-blue.webp",
  "versace-eros": "/products/covers/versace-eros.webp",
  "versace-eros-flame": "/products/covers/versace-eros-flame.webp",
  "victorias-secret-bombshell-night": "/products/covers/victorias-secret-bombshell-night.webp",
  "victorias-secret-summer-daze": "/products/covers/victorias-secret-summer-daze.webp",
  "victorias-secret-very-sexy": "/products/covers/victorias-secret-very-sexy.webp",
  "viktor-rolf-bonbon": "/products/covers/viktor-rolf-bonbon.webp",
  "viktor-rolf-flowerbomb": "/products/covers/viktor-rolf-flowerbomb.webp",
  "viktor-rolf-spice-bomb": "/products/covers/viktor-rolf-spice-bomb.webp",
  "xerjoff-accento-overdose": "/products/covers/xerjoff-accento-overdose.webp",
  "xerjoff-amber-gold": "/products/covers/xerjoff-amber-gold.webp",
  "xerjoff-erba-pura": "/products/covers/xerjoff-erba-pura.webp",
  "yves-saint-laurent-libre": "/products/covers/yves-saint-laurent-libre.webp",
  "yves-saint-laurent-myslf": "/products/covers/yves-saint-laurent-myslf.webp",

  /* Lote 07 — las 26 que faltaban. A diferencia del lote 04, los nombres de
     archivo venían ya mapeados a su slug; aun así se verificó el panel
     "INSPIRADO EN" de cada una antes de conectarla, y las 26 coincidían.
     Cuatro de ellas son las identidades que el lote 06 destrabó: Acqua di Gio
     femenino y Acqua di Gioia (que son fragancias distintas y acá quedan con
     frascos distintos), The One for Men y L'Eau d'Issey Pour Homme. */
  "armani-armani-code": "/products/covers/armani-armani-code.webp",
  "christian-dior-fahrenheit": "/products/covers/christian-dior-fahrenheit.webp",
  "dolce-gabbana-the-one-masculino": "/products/covers/dolce-gabbana-the-one-masculino.webp",
  "giorgio-armani-acqua-di-gio-femenino": "/products/covers/giorgio-armani-acqua-di-gio-femenino.webp",
  "giorgio-armani-acqua-di-gioia": "/products/covers/giorgio-armani-acqua-di-gioia.webp",
  "giorgio-armani-armani-code-absolut": "/products/covers/giorgio-armani-armani-code-absolut.webp",
  "giorgio-armani-armani-code-profumo": "/products/covers/giorgio-armani-armani-code-profumo.webp",
  "givenchy-amarige": "/products/covers/givenchy-amarige.webp",
  "hugo-boss-boss-the-scent-elixir": "/products/covers/hugo-boss-boss-the-scent-elixir.webp",
  "issey-miyake-leau-dissey-masculino": "/products/covers/issey-miyake-leau-dissey-masculino.webp",
  "j-del-pozo-halloween": "/products/covers/j-del-pozo-halloween.webp",
  "lancome-tresor-le-nuit": "/products/covers/lancome-tresor-le-nuit.webp",
  "lattafa-nebras": "/products/covers/lattafa-nebras.webp",
  "lattafa-sakeena": "/products/covers/lattafa-sakeena.webp",
  "lattafa-sublime": "/products/covers/lattafa-sublime.webp",
  "louis-vuitton-ombre-nomade": "/products/covers/louis-vuitton-ombre-nomade.webp",
  "moschino-toy-2": "/products/covers/moschino-toy-2.webp",
  "nina-ricci-nina": "/products/covers/nina-ricci-nina.webp",
  "paco-rabanne-fame-parfum": "/products/covers/paco-rabanne-fame-parfum.webp",
  "paco-rabanne-lady-million": "/products/covers/paco-rabanne-lady-million.webp",
  "paco-rabanne-olympea": "/products/covers/paco-rabanne-olympea.webp",
  "thierry-mugler-a-men": "/products/covers/thierry-mugler-a-men.webp",
  "thierry-mugler-alien-goddess": "/products/covers/thierry-mugler-alien-goddess.webp",
  "tom-ford-neroli-portofino": "/products/covers/tom-ford-neroli-portofino.webp",
  "yves-saint-laurent-black-opium": "/products/covers/yves-saint-laurent-black-opium.webp",
  "yves-saint-laurent-y-eau-de-parfum": "/products/covers/yves-saint-laurent-y-eau-de-parfum.webp",

  /* Lote 08 — las dos últimas. Identidad verificada en el panel "INSPIRADO EN"
     de cada imagen, que es además donde NOX dejó definida la variante que hasta
     ahora estaba abierta: Dior Homme Original (no la 2005, la 2011 ni la 2020) y
     J'adore Eau de Toilette (no el Eau de Parfum). La portada del Original no se
     confunde con la de christian-dior-dior-homme-intense: frasco transparente con
     cuello plateado contra frasco ahumado. */
  "christian-dior-dior-homme": "/products/covers/christian-dior-dior-homme.webp",
  "christian-dior-jadore": "/products/covers/christian-dior-jadore.webp"
};

/**
 * IMÁGENES DESCARTADAS — no usar, no integrar, no "corregir".
 *
 * Se anotan acá para que nadie las vuelva a proponer por error más adelante.
 * Ninguna está en el repositorio: no se copiaron a public/products/covers/.
 *
 *   "101 - Giorgio Armani Acqua di Gio (2).jpg"  (lote 04)
 *      El título impreso dice "Acqua di Gio" y el frasco que muestra es el de
 *      Acqua di Gioia: sus dos elementos visuales identifican fragancias
 *      distintas, y desde el lote 06 sabemos que ambas existen y son productos
 *      separados del catálogo. No sirve para ninguno de los dos, y retocarle el
 *      texto tampoco la arregla, porque entonces quedaría un título correcto
 *      sobre un frasco que sigue sin coincidir con el otro producto.
 *      giorgio-armani-acqua-di-gioia y giorgio-armani-acqua-di-gio-femenino
 *      necesitan cada uno una portada nueva, hecha desde cero.
 */

/**
 * Segunda versión fotográfica del mismo producto. No se muestra en la web: el
 * catálogo y la ficha usan siempre la principal. Queda registrada para no
 * perder material y para poder cambiar la principal sin volver a procesar nada.
 */
export const PORTADAS_ALTERNATIVAS: Record<string, string> = {
  "kayali-yum-marshmallow": "/products/covers/alt/kayali-yum-marshmallow-2.webp",
  "kayali-yum-pistachio": "/products/covers/alt/kayali-yum-pistachio-2.webp",
  "kenzo-amour": "/products/covers/alt/kenzo-amour-2.webp",
  "kenzo-flower": "/products/covers/alt/kenzo-flower-2.webp",
  "lattafa-mayar-cherry-intense": "/products/covers/alt/lattafa-mayar-cherry-intense-2.webp",
  "ralph-lauren-polo-blue": "/products/covers/alt/ralph-lauren-polo-blue-2.webp"
};

/**
 * Ruta de la portada real del producto, o null si todavía no tiene.
 * `product.image` tiene prioridad: si algún día el catálogo carga la imagen en
 * los datos, ese valor manda sobre esta tabla.
 */
export function coverFor(product: Product): string | null {
  if (product.image) return product.image;
  return PORTADAS[product.slug] ?? null;
}

/** Cuántas portadas reales hay cargadas. */
export const TOTAL_COVERS = Object.keys(PORTADAS).length;

/** Expuesto para verificación. */
export const COVER_SLUGS: readonly string[] = Object.keys(PORTADAS);
