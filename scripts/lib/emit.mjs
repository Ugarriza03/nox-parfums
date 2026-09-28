/**
 * Emisión de los dos archivos de datos olfativos, con formato estable.
 * Lo comparten la migración y el autocompletado para que el diff sea limpio.
 */

import { writeFileSync } from "node:fs";

const HEADER_PROFILES = `/**
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

import type { OlfactoryProfile } from "./types";`;

const HEADER_SOURCES = `/**
 * PROCEDENCIA DE LOS DATOS OLFATIVOS — capa interna
 *
 * Registro de dónde salió cada perfil, para poder auditarlo y volver a
 * verificarlo. NINGÚN componente de la web importa este archivo: se usa desde
 * los scripts (reporte de datos y autocompletado). Por eso la ficha pública
 * nunca muestra la fuente, la URL ni la fecha de consulta.
 *
 *   status "secondary" = dato del perfume de referencia, no una medición
 *   hecha sobre el extrait NOX.
 *
 *   intake "remoto"  = el script leyó la fuente directamente
 *   intake "archivo" = entrada estructurada validada (--source-file), el camino
 *                      que se usa cuando la consulta remota no está disponible.
 *                      Los dos pasan por el mismo matcher y el mismo schema.
 */

import type { SourceRecord } from "./types";`;

/** Ordena las claves para que el archivo no cambie de orden entre corridas. */
function sorted(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

export function writeOlfactoryFiles(profiles, sources) {
  writeFileSync(
    "src/data/olfactory.ts",
    `${HEADER_PROFILES}\n\nexport const OLFACTORY_PROFILES: Record<string, OlfactoryProfile> = ${JSON.stringify(
      sorted(profiles),
      null,
      2
    )};\n\n/** Cantidad de perfiles cargados. */\nexport const PROFILE_COUNT = Object.keys(OLFACTORY_PROFILES).length;\n`
  );

  writeFileSync(
    "src/data/olfactory.sources.ts",
    `${HEADER_SOURCES}\n\nexport const OLFACTORY_SOURCES: Record<string, SourceRecord> = ${JSON.stringify(
      sorted(sources),
      null,
      2
    )};\n`
  );
}
