# NOX Admin — base técnica (iteración 01)

Documento de trabajo para el desarrollo de NOX Admin, el panel privado de
Gabriel y Francisco. Esta iteración **no** agrega panel, autenticación, base de
datos ni endpoints: deja preparado el terreno para hacerlo sin romper la tienda.

## 1. Arquitectura actual

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 3, desplegado en Vercel desde
  `main`. Sitio 100 % estático: las 233 fichas se generan con
  `generateStaticParams`.
- Sin backend: no hay base de datos, autenticación, API Routes, Server Actions,
  middleware ni variables de entorno.
- El catálogo vive en archivos TypeScript y se arma en compilación:

  | Archivo | Contenido |
  | --- | --- |
  | `src/data/catalog.raw.ts` | Lista maestra: grupo (género + origen) → casa → nombres |
  | `src/data/product-ids.ts` | **Nuevo.** Registro de slugs congelados (233) |
  | `src/data/product-identity.ts` | **Nuevo.** Asignación de slugs estables (lógica pura) |
  | `src/data/products.ts` | Arma `PRODUCTS` cruzando todo lo anterior |
  | `src/data/olfactory.ts` / `olfactory.sources.ts` | Perfil público / procedencia interna, por slug |
  | `src/data/brands.ts` | Universo comercial por casa |
  | `src/components/product/covers.ts` | Portada por slug → `public/products/covers/<slug>.webp` |
  | `src/config/pricing.ts` | Precios, promociones y regalos |

- El pedido existe sólo en el navegador (`localStorage["nox.pedido.v1"]`,
  lista de `{ slug, quantity }`) y se cierra por WhatsApp.

## 2. Arquitectura objetivo

- `/admin` dentro del mismo proyecto Next, protegido en el servidor.
- Supabase como candidato (Postgres + Auth + Storage + RLS). **Todavía no se
  creó ningún proyecto ni cuenta.**
- La tienda leerá una vista pública sin stock; las páginas siguen estáticas y
  se revalidan al guardar desde Admin.
- Migración en etapas: semilla desde los archivos actuales → prueba de
  paridad 233/233 contra el manifiesto de integridad → cambio de fuente con un
  interruptor reversible.

## 3. Protección de identificadores

El slug es a la vez el `id` del producto, la URL pública, la clave del perfil
olfativo, de la portada y de los pedidos guardados. Antes se recalculaba en
cada build y un homónimo nuevo en otro género renombraba al existente.

Ahora:

1. `src/data/product-ids.ts` congela los 233 slugs actuales. Se generó con el
   algoritmo anterior sobre el catálogo actual: los valores son idénticos.
2. `assignStableSlugs()` usa siempre el slug registrado. Un producto nuevo
   recibe un slug calculado una sola vez, que nunca reutiliza uno existente
   (si choca, lleva sufijo de género; si aun así choca, el build falla).
3. Renombrar o quitar una fragancia en `catalog.raw.ts` sin actualizar el
   registro **hace fallar el build** con un mensaje claro, en lugar de cambiar
   un slug en silencio.

Operaciones:

| Quiero… | Cómo |
| --- | --- |
| Agregar una fragancia | Sumarla en `catalog.raw.ts` → `npm run ids:registrar` → revisar el diff de `product-ids.ts` |
| Renombrar una fragancia | Cambiar casa/nombre en `catalog.raw.ts` **y** en su entrada de `product-ids.ts`, conservando el `slug` |
| Quitar una fragancia | Quitarla de `catalog.raw.ts` y de `product-ids.ts` (decisión explícita) |

Prueba de regresión: `npm run qa:ids` (agrega homónimos ficticios sobre copias
en memoria y verifica que los 233 slugs no cambian).

## 4. Manifiesto de integridad

`data/integridad/manifiesto-catalogo.json` es una referencia determinística
(sin fechas, sha256 de contenido) de los datos protegidos: slug, nombre, casa,
género, origen, universo, hash del perfil olfativo y de la procedencia, ruta,
hash y dimensiones de cada portada y de su derivado de preview, destacadas,
portadas alternativas y la lógica comercial evaluada (precios, promociones y
regalos). No copia imágenes ni es la futura base de datos.

- `npm run qa:integridad` lo compara con el catálogo actual y falla ante
  slugs cambiados, productos eliminados, nuevos o duplicados, portadas
  faltantes o reemplazadas, perfiles desenganchados o modificados y cambios de
  precios. También prueba que el verificador detecta cada caso.
- `npm run integridad:generar` lo regenera. **Sólo** para cambios
  intencionales y aprobados; el diff del manifiesto en el PR es la constancia.

## 5. Inventario y catálogo: datos separados

| Concepto | Qué es | Dónde vivirá |
| --- | --- | --- |
| Inventario físico | Unidades que Gabriel y Francisco tienen efectivamente | Movimientos privados (ingreso, venta, ajuste, corrección), sólo admins |
| Disponibilidad comercial | Lo que se puede pedir; incluye el depósito externo | Independiente del stock propio |
| Visibilidad | Si el producto se muestra | Control manual por producto en Admin |

Reglas que el código futuro debe respetar:

- Una fragancia con **cero unidades propias puede seguir publicada** y
  agregarse al pedido.
- El stock se descuenta **a mano** al confirmar la venta por WhatsApp. Sin
  reservas, sin checkout, sin pagos con tarjeta.
- **Nunca** se muestra stock al público ni cantidades ficticias; el stock no
  viaja al navegador del cliente.
- La visibilidad no se deriva del stock.

## 6. Cómo ejecutar las pruebas

```bash
npm ci
npm run qa:integridad   # manifiesto de los 233 productos (segundos)
npm run qa:ids          # identificadores estables (segundos)
npm run build
npx playwright install chromium   # una vez, para las pruebas de navegador
npm run qa              # suite completa: incluye las dos anteriores, preview y E2E
npm run test:layout     # opcional: sin scroll horizontal a 390 px
```

CI (`.github/workflows/ci.yml`) corre lo mismo en cada pull request y en las
ramas `feature/**` y `develop`, más `npm audit` en un job aparte. No despliega,
no usa secretos y el token sólo tiene permiso de lectura.

Pendiente conocido: `npm run qa:sync` (fuera de `npm run qa`) ya falla en
`main` (c98bea1) en el chequeo "Rasasi sigue en Árabes". En CI corre a la
vista sin bloquear hasta que se decida su corrección.

## 7. Cómo revertir esta iteración

Todo está en la rama `feature/nox-admin-foundation`; `main` no se tocó.

- Descartar todo: no mergear la rama (o borrarla).
- Si ya se mergeó: `git revert <commits de la iteración>`. Los slugs
  resultantes son idénticos, así que revertir no cambia URLs, portadas,
  perfiles ni pedidos guardados.
- Quitar sólo el CI: borrar `.github/workflows/ci.yml`.

## 8. Estado (NOX Admin V1)

- Hecho: actualización a Next 16 (PR #1); Supabase Free aprobado; umbral de
  stock bajo global = 1; carga inicial explícita por fragancia; ajuste = stock
  real contado.
- Implementado en `feature/nox-admin-panel-v1`: panel de inventario,
  autenticación, migración con RLS, layouts de tienda y panel separados
  (grupo `(tienda)`) y pruebas. Ver `docs/NOX-ADMIN-PANEL.md`.
- Pendiente antes de producción: pruebas con un proyecto Supabase real, MFA
  exigido a ambos administradores, confirmar el plan de Vercel (Hobby no admite uso comercial) y decidir
  la falla preexistente de `qa:sync`.

### Costos futuros posibles (nada contratado)

| Componente | Gratis hoy | Puede costar |
| --- | --- | --- |
| GitHub Actions | Minutos incluidos (repos públicos sin costo) | Si el repo vuelve a ser privado y se exceden los minutos incluidos |
| Vercel | Plan actual | Plan Pro: requerido para uso comercial según sus términos |
| Supabase | Plan Free (pausa a la semana sin uso, sin backups) | Plan Pro para producción con backups |
| Asistencia con IA para altas | — | Por uso de la API elegida, si se aprueba |
