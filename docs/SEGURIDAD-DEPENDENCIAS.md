# Actualización de seguridad de dependencias (Prompt 04)

Rama: `feature/nox-admin-seguridad`, derivada de `feature/nox-admin-foundation`
en `ad84ceb`. Punto de partida: `npm audit` del CI sobre `ad84ceb`
(11 vulnerabilidades: 1 crítica, 6 altas, 4 moderadas).

> **Estado:** cambios de código y de `package.json` hechos y probados con la
> suite de QA. **El `package-lock.json` NO está regenerado** (el entorno donde
> se preparó no tiene acceso al registro de npm), por lo que `npm ci`, el build
> de Next 16 y la nueva auditoría quedan pendientes. Ver §5.

## 1. Next.js: por qué 16.4.0 y no 15.x

| Opción | Avisos del informe | Soporte | Decisión |
| --- | --- | --- | --- |
| 14.2.35 (actual) | Afectada por los 22 avisos de `next` (rango `9.5.0 - 15.5.23`) | Sin soporte | Descartada |
| 15.5.24 – 15.5.27 | Fuera del rango del informe; 15.5.27 además corrige los avisos de septiembre de 2026 | Maintenance LTS **hasta ~21/10/2026** (2 años desde el 21/10/2024) | Descartada: quedaría sin soporte en días |
| **16.4.0** | Es la corrección que propone el propio `npm audit` (`fixAvailable`) | Active LTS (rama `latest`) | **Elegida** |

Fuentes: [política de soporte](https://nextjs.org/support-policy),
[avisos de agosto](https://nextjs.org/blog/august-2026-security-release) y
[septiembre de 2026](https://nextjs.org/blog/september-2026-security-release),
[guía de actualización a 16](https://nextjs.org/docs/app/guides/upgrading/version-16).
Metadatos de 16.4.0 consultados en el registro de npm: `engines.node >=20.9.0`,
`peerDependencies.react ^18.2.0 || ^19.0.0`, `postcss 8.5.23` (nuestro
override `^8.5.12` la sube a 8.5.x vigente).

## 2. Cambios de API y configuración aplicados

| Cambio de Next 16 | Qué hicimos | Archivo |
| --- | --- | --- |
| `params` es una Promise; el acceso síncrono se eliminó | `generateMetadata` y la página pasan a `async` y hacen `await params`. Mismas 233 rutas estáticas, misma metadata | `src/app/fragancia/[slug]/page.tsx` |
| Next ya no anula `scroll-behavior: smooth` al navegar | `data-scroll-behavior="smooth"` en `<html>` para conservar el salto instantáneo actual | `src/app/layout.tsx` |
| `next lint` eliminado | Se quita el script `lint` (no había configuración de ESLint ni se usaba en CI) | `package.json` |
| React 19.2 en el App Router | `react` / `react-dom` 19.2.8 y tipos `@types/react` 19.2.17 / `@types/react-dom` 19.2.3 (versiones para TypeScript 5.5) | `package.json` |
| Turbopack por defecto en `next build` | Sin cambios: no hay configuración `webpack` propia. Si el CSS generado difiriera, la alternativa es `next build --webpack` | — |

No aplican (verificado en el código): `next/image`, middleware/proxy,
`generateSitemaps`, rutas paralelas, `revalidateTag`, AMP, runtime config,
`cookies()`/`headers()`, `searchParams`.

## 3. Otras dependencias

| Paquete | Antes → después | Motivo |
| --- | --- | --- |
| esbuild (directo, sólo `npm run preview`) | 0.23.1 → **0.28.2** | GHSA-67mh-4wv8-2f99 (moderada, servidor de desarrollo). Versión propuesta por `npm audit` |
| tsx (directo, scripts de QA) | 4.19.1 → **4.23.15** | Arrastraba esbuild ≤0.24. Versión propuesta por `npm audit`; usa esbuild ~0.28 |
| source-map-js (transitivo) | 1.2.1 → **1.2.2** | GHSA-68fv-2mgg-jv7q (alta). Sólo lockfile: el rango de postcss ya lo admite |

## 4. Pendientes que requieren migración (no aplicados)

| Paquete | Gravedad | Por qué no se corrige ahora |
| --- | --- | --- |
| braces 3.0.3 | Alta | GHSA-vfj7-8cjw-p6xm sin versión corregida publicada (latest = 3.0.3) |
| micromatch, chokidar, fast-glob | Alta (heredada de braces) | Dependen de braces; fast-glob 3.3.3 ya es la última |
| tailwindcss 3.4.10 | Alta (heredada) | La única corrección es Tailwind 4 (cambio mayor). Requiere aprobación |
| postcss-selector-parser 6.1.4 / postcss-nested 6.2.0 | Moderada | Corrección sólo en postcss-selector-parser 7.1.6 / postcss-nested ≥7, que Tailwind 3 no admite |

Exposición: todas son dependencias de desarrollo que corren durante el build de
CSS sobre patrones y archivos propios; no forman parte del servidor ni del
bundle público. Que la exposición sea baja no las da por resueltas.

## 5. Cómo completar y validar (en una PC con acceso a npm)

```bash
git checkout feature/nox-admin-seguridad
npm install                 # regenera package-lock.json según package.json
npm update source-map-js    # 1.2.1 → 1.2.2 dentro del rango existente
git diff --stat package-lock.json
npm audit                   # comparar con §4
npm run build               # Next 16 (Turbopack)
npx playwright install chromium
npm run qa                  # incluye integridad de los 233 productos y E2E
npm run test:layout
git add package-lock.json   # y tsconfig.json / next-env si Next los ajustó: revisar antes
git commit -m "Lockfile para Next 16.4.0, React 19.2.8, tsx 4.23.15 y esbuild 0.28.2"
git push -u origin feature/nox-admin-seguridad
```

Criterios de aceptación: build sin errores con las 233 rutas `/fragancia/[slug]`
estáticas; `npm run qa` y `test:layout` en verde; `qa:integridad` con el
manifiesto idéntico; `npm audit` sin vulnerabilidades críticas ni en
dependencias de producción (`npm audit --omit=dev`).

## 6. Reversión

`git revert` de los commits de esta rama, o no mergearla. El manifiesto de
integridad no cambia en esta actualización, así que revertir no afecta
productos, slugs, portadas, perfiles ni precios.
