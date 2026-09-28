"use client";

/**
 * SISTEMA DE PORTADAS NOX — v2
 *
 * La portada se arma como una fotografía de producto, no como un gráfico:
 *
 *      escena olfativa (cielo · luz · siluetas · piso)
 *                    FRASCO NOX
 *            packaging de referencia al costado
 *
 * Qué cambió respecto de la v1:
 *   · El frasco es el protagonista claro: ocupa ~65 % del ancho, apoyado sobre
 *     un plano con sombra de contacto y reflejo. Vidrio con espesor de pared,
 *     menisco, refracción y especulares; metal con bandas duras de cromo; base
 *     negra con volumen y filo iluminado.
 *   · El fondo dejó de ser "el halo pintado del color de la familia": ahora es
 *     una escena con horizonte, atmósfera y siluetas. Siete climas, y dentro de
 *     cada clima una semilla estable por producto mueve el horizonte, la luz y
 *     las siluetas, así que dos fragancias de la misma familia no se ven igual.
 *   · La referencia dejó de ser una tarjeta plana: es una caja en perspectiva,
 *     con canto, cara superior, sombra y desenfoque de profundidad.
 *   · La ficha de notas bajó de jerarquía: desaparece en catálogo y en la ficha
 *     queda chica, atrás y desenfocada. Las notas se leen en el texto.
 *
 * FOTOGRAFÍA REAL: `BOTTLE_PHOTO` en ./portadas.ts es el interruptor. Cuando
 * haya un recorte del envase con alfa, todas las portadas lo usan y el frasco
 * renderizado queda de respaldo. La especificación del recorte está ahí.
 *
 * La referencia al original es TIPOGRÁFICA. No se dibuja el frasco, el envase,
 * el logotipo ni la silueta de la marca original: esos diseños son de sus
 * titulares. NOX es la única marca representada visualmente.
 */

import type { Product } from "@/data/types";
import { BOTTLE_PHOTO, type Escena, escenaDe, semilla } from "./portadas";

export type VisualSize = "thumb" | "card" | "hero";

/* ------------------------------------------------------------------ APOYOS */

/** Nombre de la fragancia sin la casa delante. */
function nombreFragancia(product: Product): string {
  const { inspiredBy, house } = product;
  return inspiredBy.startsWith(house) ? inspiredBy.slice(house.length).trim() || inspiredBy : inspiredBy;
}

function recortar(texto: string, max: number): string {
  return texto.length <= max ? texto : `${texto.slice(0, max - 1)}…`;
}

/** SVG no reflowea: el corte en líneas es manual. */
function enLineas(nombre: string, max: number): string[] {
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of nombre.split(/\s+/)) {
    const tentativa = actual ? `${actual} ${palabra}` : palabra;
    if (tentativa.length <= max || !actual) actual = tentativa;
    else {
      lineas.push(actual);
      actual = palabra;
    }
  }
  if (actual) lineas.push(actual);
  return lineas.length <= 3 ? lineas : [...lineas.slice(0, 2), recortar(lineas[2], max)];
}

/* ----------------------------------------------------------------- ESCENA */

/**
 * Siluetas del paisaje. Son formas, no ilustraciones de notas: lo que tiene
 * que llegar es el clima, no un inventario de ingredientes.
 */
function Siluetas({
  e,
  r,
  horizonte,
  uid
}: {
  e: Escena;
  r: (i: number) => number;
  horizonte: number;
  uid: string;
}) {
  const s = e.silueta;

  if (e.kind === "mineral") {
    // Cordón rocoso en dos planos: el de atrás más alto y más lavado.
    const crestas = (base: number, amp: number, off: number) => {
      const pts: string[] = [`M-20,${horizonte + 10}`];
      for (let i = 0; i <= 6; i++) {
        const x = -20 + (i * 440) / 6;
        const y = base - amp * (0.3 + r(off + i) * 0.7);
        pts.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
      }
      pts.push(`L420,${horizonte + 10} Z`);
      return pts.join(" ");
    };
    return (
      <g>
        <path d={crestas(horizonte - 28, 168, 10)} fill={s} opacity="0.5" filter={`url(#${uid}-dof)`} />
        <path d={crestas(horizonte - 8, 118, 30)} fill={s} opacity="0.8" />
        <path d={crestas(horizonte + 4, 62, 50)} fill={s} opacity="0.96" />
      </g>
    );
  }

  if (e.kind === "agua") {
    return (
      <g>
        <rect x="-20" y={horizonte} width="440" height={520 - horizonte} fill={s} opacity="0.5" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse
            key={i}
            cx={200 + (r(40 + i) - 0.5) * 60}
            cy={horizonte + 12 + i * i * 5.5}
            rx={90 + i * 46}
            ry={1.4 + i * 0.8}
            fill="none"
            stroke={e.luz}
            strokeOpacity={0.3 - i * 0.04}
            strokeWidth="1"
          />
        ))}
      </g>
    );
  }

  if (e.kind === "citrico") {
    // Aire abierto: haces de luz y partículas, horizonte muy limpio.
    return (
      <g>
        {[0, 1, 2].map((i) => {
          const x = 40 + r(50 + i) * 300;
          return (
            <path
              key={i}
              d={`M${x},-20 L${x + 44},-20 L${x + 108},${horizonte + 6} L${x - 18},${horizonte + 6} Z`}
              fill={e.luz}
              opacity={0.05 + r(60 + i) * 0.045}
              filter={`url(#${uid}-dof)`}
            />
          );
        })}
        {Array.from({ length: 9 }, (_, i) => (
          <circle
            key={i}
            cx={30 + r(70 + i) * 340}
            cy={60 + r(90 + i) * (horizonte - 40)}
            r={0.9 + r(110 + i) * 1.8}
            fill={e.luz}
            opacity={0.18 + r(130 + i) * 0.22}
          />
        ))}
      </g>
    );
  }

  if (e.kind === "tropical") {
    // Hojas anchas entrando desde los bordes. Siluetas, nunca botánica.
    const hoja = (x: number, y: number, largo: number, giro: number, key: number) => (
      <path
        key={key}
        d={`M${x},${y} C${x + largo * 0.3},${y - largo * 0.4 + giro} ${x + largo * 0.78},${y - largo * 0.28 + giro} ${
          x + largo
        },${y + giro * 0.4} C${x + largo * 0.72},${y + largo * 0.2 + giro} ${x + largo * 0.3},${y + largo * 0.22} ${x},${y} Z`}
        fill={s}
        opacity="0.9"
      />
    );
    return (
      <g>
        <g opacity="0.5" filter={`url(#${uid}-dof)`}>
          {hoja(-60, 110 + r(21) * 60, 210, 28, 1)}
          {hoja(300, 70 + r(22) * 50, 190, -20, 2)}
        </g>
        {hoja(-70, horizonte - 130 + r(23) * 50, 235, 40, 3)}
        {hoja(285, horizonte - 175 + r(24) * 60, 215, -34, 4)}
        <rect x="-20" y={horizonte} width="440" height={520 - horizonte} fill={s} opacity="0.55" />
      </g>
    );
  }

  if (e.kind === "bosque") {
    // Troncos verticales y niebla baja.
    return (
      <g>
        {Array.from({ length: 7 }, (_, i) => {
          const lejos = i % 2 === 0;
          return (
            <rect
              key={i}
              x={-10 + i * 62 + r(140 + i) * 30}
              y={-20}
              width={9 + r(160 + i) * 17}
              height={horizonte + 34}
              fill={s}
              opacity={lejos ? 0.45 : 0.9}
              filter={lejos ? `url(#${uid}-dof)` : undefined}
            />
          );
        })}
        <rect
          x="-20"
          y={horizonte - 70}
          width="440"
          height="120"
          fill={e.luz}
          opacity="0.06"
          filter={`url(#${uid}-dof)`}
        />
      </g>
    );
  }

  if (e.kind === "petalos") {
    return (
      <g>
        {Array.from({ length: 7 }, (_, i) => {
          const cx = 30 + r(180 + i) * 340;
          const cy = 40 + r(200 + i) * (horizonte - 30);
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={14 + r(220 + i) * 30}
              ry={7 + r(240 + i) * 13}
              fill={e.luz}
              opacity={0.07 + r(260 + i) * 0.09}
              transform={`rotate(${((r(280 + i) - 0.5) * 70).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`}
              filter={i % 2 ? `url(#${uid}-dof)` : undefined}
            />
          );
        })}
      </g>
    );
  }

  /* brasa */
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => (
        <circle
          key={i}
          cx={20 + r(300 + i) * 360}
          cy={40 + r(320 + i) * (horizonte - 10)}
          r={0.8 + r(340 + i) * 2.1}
          fill={e.luz}
          opacity={0.2 + r(360 + i) * 0.4}
        />
      ))}
      <path
        d={`M-20,${horizonte + 6} L120,${horizonte - 54} L300,${horizonte - 30} L420,${horizonte + 6} Z`}
        fill={s}
        opacity="0.8"
      />
    </g>
  );
}

/* ----------------------------------------------------------------- FRASCO */

/**
 * Frasco NOX de 60 ml, 3/4 frontal, en un espacio local de 224 × 190.
 * Geometría y materiales tomados del envase real: base negra maciza, cuerpo
 * de vidrio ancho y bajo, atomizador cromado de dos cuerpos.
 */
function Frasco({ e, uid }: { e: Escena; uid: string }) {
  return (
    <g>
      {/* --------------------------------------------- cara superior de la base */}
      <path d="M14,142 L31,129 L223,129 L206,142 Z" fill="#20232A" />
      <path d="M14,142 L31,129 L223,129 L206,142 Z" fill={e.liquido} opacity="0.10" />

      {/* --------------------------------------------------------------- VIDRIO */}
      <path d="M196,59 L213,46 L213,139 L196,152 Z" fill={`url(#${uid}-vidrioLado)`} />
      <path d="M35,46 L52,33 L213,33 L196,46 Z" fill={`url(#${uid}-vidrioAlto)`} opacity="0.62" />

      <g clipPath={`url(#${uid}-clipVidrio)`}>
        <rect x="24" y="46" width="172" height="106" fill={`url(#${uid}-vidrio)`} />

        {/* Líquido */}
        <rect x="24" y="100" width="172" height="52" fill={`url(#${uid}-liquido)`} />
        {/* Menisco: la línea que más vende que hay líquido adentro */}
        <rect x="24" y="99" width="172" height="1.6" fill="#FFFFFF" opacity="0.5" />
        <rect x="24" y="100.8" width="172" height="2.4" fill="#000000" opacity="0.18" />
        {/* Refracción contra la pared */}
        <rect x="24" y="104" width="16" height="48" fill={e.liquido} opacity="0.42" />
        <rect x="180" y="104" width="16" height="48" fill={e.liquido} opacity="0.34" />

        {/* Espesor de pared */}
        <rect x="24" y="46" width="19" height="106" fill={`url(#${uid}-paredIzq)`} />
        <rect x="177" y="46" width="19" height="106" fill={`url(#${uid}-paredDer)`} />
        <rect x="29.5" y="52" width="3" height="94" rx="1.5" fill="#FFFFFF" opacity="0.5" />
        <rect x="188" y="56" width="2" height="88" rx="1" fill="#FFFFFF" opacity="0.34" />

        {/* Hombro */}
        <path d="M24,57 C58,47 162,47 196,57 L196,46 L24,46 Z" fill="#FFFFFF" opacity="0.2" />
        <path d="M30,62 C62,53 158,53 190,62" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1.1" fill="none" />

        {/* El horizonte de la escena reflejado en el vidrio */}
        <rect x="24" y="66" width="172" height="7" fill={e.luz} opacity="0.20" />
        <rect x="24" y="73" width="172" height="14" fill={e.luz} opacity="0.07" />

        {/* Reflejo de la fuente de luz y especular diagonal */}
        <ellipse cx="78" cy="74" rx="34" ry="15" fill="#FFFFFF" opacity="0.14" />
        <path d="M52,150 L104,48 L124,48 L66,150 Z" fill="#FFFFFF" opacity="0.06" />

        {/* Tubo interior */}
        <path d="M112,64 C110,92 100,116 94,150" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1.6" fill="none" />
      </g>

      {/* Etiqueta grabada: sólo la concentración */}
      <line x1="60" y1="74" x2="160" y2="74" stroke="#FFFFFF" strokeOpacity="0.26" strokeWidth="0.6" />
      <text
        x="110"
        y="85"
        textAnchor="middle"
        fill="#FFFFFF"
        fillOpacity="0.8"
        fontFamily="'Inter', system-ui, sans-serif"
        fontSize="7.4"
        letterSpacing="2.6"
      >
        EXTRAIT DE PARFUM
      </text>
      <line x1="60" y1="92" x2="160" y2="92" stroke="#FFFFFF" strokeOpacity="0.26" strokeWidth="0.6" />

      <rect
        x="24"
        y="46"
        width="172"
        height="106"
        rx="11"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.42"
        strokeWidth="1.1"
      />

      {/* ------------------------------------------------------- CUELLO Y BOMBA */}
      <path d="M99,33 L123,33 L123,49 L99,49 Z" fill="#FFFFFF" opacity="0.18" />
      <path d="M123,33 L132,26 L132,42 L123,49 Z" fill="#FFFFFF" opacity="0.1" />
      <path d="M99,33 L108,26 L132,26 L123,33 Z" fill="#FFFFFF" opacity="0.28" />
      <line x1="99" y1="33" x2="99" y2="49" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="0.8" />
      <line x1="123" y1="33" x2="123" y2="49" stroke="#FFFFFF" strokeOpacity="0.34" strokeWidth="0.8" />

      <path d="M92,18 L128,18 L128,34 L92,34 Z" fill={`url(#${uid}-cromo)`} />
      <path d="M128,18 L138,11 L138,27 L128,34 Z" fill="#5C636E" />
      <path d="M92,18 L102,11 L138,11 L128,18 Z" fill="#B6BDC8" />

      <path d="M97,0 L123,0 L123,19 L97,19 Z" fill={`url(#${uid}-cromo)`} />
      <path d="M123,0 L132,-6 L132,13 L123,19 Z" fill="#525963" />
      <ellipse cx="114" cy="-2" rx="17.5" ry="6" fill="#CFD5DE" />
      <ellipse cx="114" cy="-2.5" rx="11" ry="3.4" fill="#79818E" opacity="0.6" />
      <ellipse cx="106" cy="-3.4" rx="4" ry="1.5" fill="#FFFFFF" opacity="0.85" />

      {/* ----------------------------------------------------------- BASE NEGRA */}
      <path d="M206,142 L223,129 L223,175 L206,188 Z" fill="#06070A" />
      <rect x="14" y="142" width="192" height="46" rx="2.5" fill={`url(#${uid}-base)`} />
      <rect x="14" y="142" width="192" height="1.3" fill="#9AA2AF" opacity="0.62" />
      <rect x="14" y="149" width="192" height="13" fill="#FFFFFF" opacity="0.05" />
      <text
        x="110"
        y="172"
        textAnchor="middle"
        fill="#ECEAE5"
        fillOpacity="0.92"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="18"
        letterSpacing="7"
      >
        NOX
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- PORTADA */

export function FragranceVisual({
  product,
  size = "card",
  priority = false
}: {
  product: Product;
  size?: VisualSize;
  priority?: boolean;
}) {
  const e = escenaDe(product.slug, product.olfactory?.families[0]);
  const r = semilla(product.slug);
  const uid = `fv-${product.slug}-${size}`;
  const isHero = size === "hero";
  const isThumb = size === "thumb";

  /* Fotografía de producto cuando exista. */
  if (product.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.image}
        alt={`Extracto NOX ${product.inspiredLabel.toLowerCase()}`}
        className="h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  /* Variación estable por producto: dos portadas del mismo clima no coinciden. */
  const horizonte = 296 + Math.round(r(1) * 44);
  const luzX = 84 + Math.round(r(2) * 232);
  const luzY = Math.round(horizonte * (0.28 + r(3) * 0.34));

  /* El frasco es el protagonista: más grande y más cerca que en la v1. */
  const escala = isThumb ? 1.56 : isHero ? 1.3 : 1.36;
  const apoyo = 394;
  /* El envase manda, pero deja aire a la derecha para que la caja se lea. */
  const centro = isThumb ? 200 : 172;
  const bottleY = apoyo - 188 * escala;
  const bottleX = centro - 112 * escala;

  const acordes = product.olfactory?.accords ?? [];
  const fichaNotas = isHero && acordes.length > 0;
  const pisoDesde = isThumb ? apoyo : horizonte;

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label={`Extracto NOX — inspirado en ${product.inspiredBy}`}
    >
      <defs>
        <linearGradient id={`${uid}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={e.cielo[0]} />
          <stop offset="52%" stopColor={e.cielo[1]} />
          <stop offset="100%" stopColor={e.cielo[2]} />
        </linearGradient>
        <radialGradient id={`${uid}-luz`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={e.luz} stopOpacity="0.55" />
          <stop offset="45%" stopColor={e.luz} stopOpacity="0.16" />
          <stop offset="100%" stopColor={e.luz} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-horizonte`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={e.luz} stopOpacity="0" />
          <stop offset="76%" stopColor={e.luz} stopOpacity="0.38" />
          <stop offset="100%" stopColor={e.luz} stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id={`${uid}-caja`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#14171D" />
          <stop offset="46%" stopColor="#242933" />
          <stop offset="100%" stopColor="#0A0C11" />
        </linearGradient>
        <linearGradient id={`${uid}-piso`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={e.luz} stopOpacity="0.14" />
          <stop offset="34%" stopColor={e.piso} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#04050A" />
        </linearGradient>

        <linearGradient id={`${uid}-vidrio`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="46%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.26" />
        </linearGradient>
        <linearGradient id={`${uid}-vidrioLado`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.34" />
        </linearGradient>
        <linearGradient id={`${uid}-vidrioAlto`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={`${uid}-paredIzq`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.26" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-paredDer`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="55%" stopColor="#000000" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.24" />
        </linearGradient>
        <linearGradient id={`${uid}-liquido`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={e.liquido} stopOpacity="0.46" />
          <stop offset="100%" stopColor={e.liquido} stopOpacity="0.82" />
        </linearGradient>

        {/* Cromo: lo que lee como metal son las bandas duras, no el degradé suave */}
        <linearGradient id={`${uid}-cromo`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#474E58" />
          <stop offset="14%" stopColor="#E9EEF4" />
          <stop offset="30%" stopColor="#8E96A3" />
          <stop offset="48%" stopColor="#F3F6FA" />
          <stop offset="66%" stopColor="#6B727E" />
          <stop offset="84%" stopColor="#C9D0D9" />
          <stop offset="100%" stopColor="#363C45" />
        </linearGradient>
        <linearGradient id={`${uid}-base`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0B0D12" />
          <stop offset="42%" stopColor="#1B1F26" />
          <stop offset="100%" stopColor="#050609" />
        </linearGradient>

        <radialGradient id={`${uid}-sombra`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
          <stop offset="62%" stopColor="#000000" stopOpacity="0.36" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <mask id={`${uid}-maskReflejo`}>
          <rect x="0" y={apoyo} width="400" height="130" fill={`url(#${uid}-fade)`} />
        </mask>
        <radialGradient id={`${uid}-vineta`} cx="50%" cy="44%" r="66%">
          <stop offset="54%" stopColor="#04050A" stopOpacity="0" />
          <stop offset="100%" stopColor="#04050A" stopOpacity="0.9" />
        </radialGradient>
        <filter id={`${uid}-dof`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${uid}-dofSuave`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        {isHero && (
          <filter id={`${uid}-grano`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        )}
        <clipPath id={`${uid}-clipVidrio`}>
          <rect x="24" y="46" width="172" height="106" rx="11" />
        </clipPath>

        {/* El frasco se define una vez y se usa dos: real y reflejado. */}
        <g id={`${uid}-frasco`}>
          <Frasco e={e} uid={uid} />
        </g>
      </defs>

      {/* =============================================================== ESCENA */}
      <rect x="0" y="0" width="400" height="500" fill={`url(#${uid}-cielo)`} />

      {!isThumb && (
        <>
          <ellipse cx={luzX} cy={luzY} rx="170" ry="140" fill={`url(#${uid}-luz)`} />
          {/* Banda de horizonte: sin esta luz detrás, las siluetas no se leen */}
          <rect
            x="0"
            y={horizonte - 150}
            width="400"
            height="158"
            fill={`url(#${uid}-horizonte)`}
          />
          <Siluetas e={e} r={r} horizonte={horizonte} uid={uid} />
          <rect
            x="0"
            y={horizonte - 34}
            width="400"
            height="68"
            fill={e.luz}
            opacity="0.07"
            filter={`url(#${uid}-dof)`}
          />
        </>
      )}

      {/* Plano de apoyo */}
      <rect x="0" y={pisoDesde} width="400" height={500 - pisoDesde} fill={`url(#${uid}-piso)`} />

      {/* ====================================================== FICHA DE NOTAS */}
      {/* Chica, atrás y desenfocada: acompaña, no compite. */}
      {fichaNotas && (
        <g opacity="0.72" filter={`url(#${uid}-dofSuave)`} transform="rotate(-4 42 250)">
          <rect x="12" y="176" width="66" height="162" rx="1.5" fill="#000000" opacity="0.5" />
          <rect x="8" y="170" width="66" height="162" rx="1.5" fill="#DEDBD4" />
          <rect x="8" y="170" width="66" height="162" rx="1.5" fill={e.luz} opacity="0.14" />
          <text x="16" y="186" fill="#2A2D33" fontFamily="'Inter', system-ui, sans-serif" fontSize="4.8" letterSpacing="0.6">
            NOTAS OLFATIVAS
          </text>
          <line x1="16" y1="190" x2="64" y2="190" stroke="#2A2D33" strokeOpacity="0.3" strokeWidth="0.5" />
          {acordes.slice(0, 7).map((a, i) => (
            <text
              key={a}
              x="16"
              y={202 + i * 10}
              fill="#3A3D44"
              fontFamily="'Inter', system-ui, sans-serif"
              fontSize="5.2"
              letterSpacing="0.2"
            >
              {recortar(a.toUpperCase(), 13)}
            </text>
          ))}
        </g>
      )}

      {/* =============================================== PACKAGING DE REFERENCIA */}
      {!isThumb && (
        <g filter={`url(#${uid}-dofSuave)`}>
          <ellipse cx="342" cy="378" rx="58" ry="10" fill={`url(#${uid}-sombra)`} />
          {/* Canto y cara superior: la caja tiene cuerpo */}
          <path d="M384,216 L398,206 L398,362 L384,372 Z" fill="#070810" />
          <path d="M296,216 L310,206 L398,206 L384,216 Z" fill="#333844" />
          <path d="M296,216 L310,206 L398,206 L384,216 Z" fill={e.luz} opacity="0.2" />
          <rect x="296" y="216" width="88" height="156" fill={`url(#${uid}-caja)`} />
          <rect x="296" y="216" width="88" height="156" fill="none" stroke="#ECEAE5" strokeOpacity="0.44" strokeWidth="0.9" />
          <rect x="301" y="221" width="78" height="146" fill="none" stroke="#ECEAE5" strokeOpacity="0.18" strokeWidth="0.6" />
          {/* Barrido de luz sobre el cartón */}
          <path d="M296,280 L384,242 L384,266 L296,304 Z" fill="#FFFFFF" opacity="0.07" />

          <text
            x="340"
            y="242"
            textAnchor="middle"
            fill="#ECEAE5"
            fillOpacity="0.5"
            fontFamily="'Inter', system-ui, sans-serif"
            fontSize="5.6"
            letterSpacing="1.4"
          >
            INSPIRADO EN
          </text>
          <line x1="316" y1="250" x2="364" y2="250" stroke="#ECEAE5" strokeOpacity="0.26" strokeWidth="0.6" />
          <text
            x="340"
            y="265"
            textAnchor="middle"
            fill="#ECEAE5"
            fillOpacity="0.74"
            fontFamily="'Inter', system-ui, sans-serif"
            fontSize="6"
            letterSpacing="0.5"
          >
            {recortar(product.house.toUpperCase(), 18)}
          </text>
          {enLineas(nombreFragancia(product), 12).map((linea, i) => (
            <text
              key={linea + i}
              x="340"
              y={288 + i * 14}
              textAnchor="middle"
              fill="#ECEAE5"
              fontFamily="'Cormorant Garamond', Georgia, serif"
              fontSize="12.5"
            >
              {linea}
            </text>
          ))}
          <line x1="316" y1="346" x2="364" y2="346" stroke="#ECEAE5" strokeOpacity="0.2" strokeWidth="0.6" />
          <text
            x="340"
            y="359"
            textAnchor="middle"
            fill="#ECEAE5"
            fillOpacity="0.38"
            fontFamily="'Inter', system-ui, sans-serif"
            fontSize="4.8"
            letterSpacing="1.1"
          >
            REFERENCIA
          </text>
        </g>
      )}

      {/* =============================================================== FRASCO */}
      {/* Reflejo sobre el plano */}
      <g mask={`url(#${uid}-maskReflejo)`}>
        <g transform={`translate(0 ${2 * apoyo}) scale(1 -1)`}>
          <g transform={`translate(${bottleX} ${bottleY}) scale(${escala})`}>
            <use href={`#${uid}-frasco`} />
          </g>
        </g>
      </g>

      {/* Sombra de contacto */}
      <ellipse cx={centro} cy={apoyo + 4} rx={126 * escala * 0.8} ry="16" fill={`url(#${uid}-sombra)`} />

      {/* Envase */}
      <g transform={`translate(${bottleX} ${bottleY}) scale(${escala})`}>
        <use href={`#${uid}-frasco`} />
      </g>

      {/* Cáustica: el charco de luz que deja el vidrio */}
      <ellipse
        cx={centro}
        cy={apoyo + 1}
        rx={96 * escala * 0.62}
        ry="7"
        fill={e.liquido}
        opacity="0.11"
        filter={`url(#${uid}-dofSuave)`}
      />

      {/* ================================================================ REMATE */}
      <rect x="0" y="0" width="400" height="500" fill={`url(#${uid}-vineta)`} />
      {isHero && (
        <rect
          x="0"
          y="0"
          width="400"
          height="500"
          filter={`url(#${uid}-grano)`}
          opacity="0.1"
          style={{ mixBlendMode: "overlay" }}
        />
      )}
    </svg>
  );
}

/** Acento de escena, para reutilizar el color fuera de la portada. */
export function familyAccent(product: Product): string {
  return escenaDe(product.slug, product.olfactory?.families[0]).accent;
}

/** Re-exportado para que el resto del frontend no importe la config directo. */
export { BOTTLE_PHOTO };
