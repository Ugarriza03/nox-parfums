/**
 * Migración única de la estructura olfativa V1 → V2.
 *
 * V1: un solo objeto con perfil + fuente mezclados.
 * V2: perfil público (src/data/olfactory.ts) separado de la capa interna de
 *     procedencia (src/data/olfactory.sources.ts), que ningún componente
 *     importa y por lo tanto nunca llega a la ficha pública.
 *
 * Se corre una sola vez. Queda en el repo como registro de la transformación.
 */

import { writeFileSync } from "node:fs";
import { OLFACTORY } from "../src/data/olfactory";

type Any = Record<string, any>;

const profiles: Any = {};
const sources: Any = {};

for (const [slug, raw] of Object.entries(OLFACTORY as unknown as Record<string, Any>)) {
  profiles[slug] = {
    family: raw.families?.[0] ?? null,
    families: raw.families ?? [],
    accords: raw.accords ?? [],
    topNotes: raw.pyramid?.salida ?? [],
    middleNotes: raw.pyramid?.corazon ?? [],
    baseNotes: raw.pyramid?.fondo ?? [],
    mainNotes: raw.keyNotes ?? [],
    occasions: raw.occasions ?? [],
    seasons: raw.seasons ?? [],
    intensity: raw.intensity ?? null,
    feel: raw.feel ?? "",
    likeIf: raw.likeIf ?? []
  };

  // "Fragrantica — Sauvage Eau de Parfum" → marca y nombre desde la URL
  const url: string = raw.source?.url ?? "";
  const m = url.match(/\/perfume\/([^/]+)\/(.+)\.html$/);
  const matchedBrand = m ? decodeURIComponent(m[1]).replace(/-/g, " ") : "";
  const matchedName = (raw.source?.name ?? "").replace(/^Fragrantica\s*—\s*/, "");

  sources[slug] = {
    name: "Fragrantica",
    url,
    checkedAt: raw.verifiedAt ?? null,
    status: "secondary",
    matchedBrand,
    matchedName,
    matchConfidence: "exact",
    needsReview: false
  };
}

const header = (title: string, body: string) => `${title}\n\n${body}\n`;

/* ------------------------------------------------------------- perfiles --- */

const profilesFile = header(
  `/**
 * PERFILES OLFATIVOS — capa pública
 *
 * Describen la FRAGANCIA DE REFERENCIA que inspira cada interpretación NOX.
 * La ficha lo aclara una vez, de forma discreta.
 *
 * Esta capa NO contiene procedencia: la URL consultada, la fecha y el estado
 * del match viven en olfactory.sources.ts, que ningún componente importa.
 *
 * Qué se carga y qué no:
 *   · SÍ: notas de salida / corazón / fondo, notas principales, acordes, familia.
 *   · NO: duración, proyección, estela ni horas exactas — varían por piel y por
 *     formulación, y además corresponderían al perfume original, no al
 *     extrait NOX.
 *   · La redacción (feel, likeIf) es propia de NOX, no copiada de terceros.
 *
 * Para cargar nuevas fragancias: npm run olfativo -- --limit 20
 */

import type { OlfactoryProfile } from "./types";`,
  `export const OLFACTORY_PROFILES: Record<string, OlfactoryProfile> = ${JSON.stringify(
    profiles,
    null,
    2
  )};

/** Cantidad de perfiles cargados. */
export const PROFILE_COUNT = Object.keys(OLFACTORY_PROFILES).length;`
);

/* -------------------------------------------------------------- fuentes --- */

const sourcesFile = header(
  `/**
 * PROCEDENCIA DE LOS DATOS OLFATIVOS — capa interna
 *
 * Registro de dónde salió cada perfil, para poder auditarlo y volver a
 * verificarlo. NINGÚN componente de la web importa este archivo: se usa desde
 * los scripts (reporte de datos y autocompletado). Por eso la ficha pública
 * nunca muestra la fuente, la URL ni la fecha de consulta.
 *
 *   status "secondary" = dato del perfume de referencia, no una medición
 *   hecha sobre el extrait NOX.
 */

import type { SourceRecord } from "./types";`,
  `export const OLFACTORY_SOURCES: Record<string, SourceRecord> = ${JSON.stringify(
    sources,
    null,
    2
  )};`
);

writeFileSync("src/data/olfactory.ts", profilesFile);
writeFileSync("src/data/olfactory.sources.ts", sourcesFile);

console.log(`✓ ${Object.keys(profiles).length} perfiles migrados`);
console.log("  src/data/olfactory.ts          (público)");
console.log("  src/data/olfactory.sources.ts  (interno)");
