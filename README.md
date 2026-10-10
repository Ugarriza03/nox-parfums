# NOX PARFUMS — tienda online

Primera versión real, navegable y funcional. Next.js 14 (App Router) + TypeScript + Tailwind CSS.

---

## Arrancar

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # producción
```

## Preview sin instalar nada

`dist-preview/index.html` es la tienda entera en un solo archivo HTML: se abre con doble clic
y permite recorrer todo el flujo (usa los mismos componentes que el proyecto Next).
Para regenerarlo: `npm run preview`.

---

## Dónde se toca cada cosa

Toda la información comercial tiene **una sola fuente de verdad**. No hay precios ni
teléfonos repartidos por los componentes.

| Qué querés cambiar | Archivo |
| --- | --- |
| WhatsApp, Instagram, dominio, textos de marca | `src/config/site.ts` |
| Precios minoristas y escala mayorista | `src/config/pricing.ts` |
| Modalidades de envío y medios de pago | `src/config/shipping.ts` |
| Preguntas frecuentes | `src/config/faq.ts` |
| Colores y tipografías | `src/config/theme.ts` |
| **Qué fragancias existen** | `src/data/catalog.raw.ts` |
| Identificador (slug) congelado de cada fragancia | `src/data/product-ids.ts` |
| Manifiesto de integridad del catálogo | `data/integridad/manifiesto-catalogo.json` |
| Notas, acordes, familia, carácter (perfil público) | `src/data/olfactory.ts` |
| **Duración, proyección y estela probadas por NOX** | `src/data/nox-performance.ts` |
| Procedencia del dato (capa interna) | `src/data/olfactory.sources.ts` |
| Diseñador / nicho por casa | `src/data/brands.ts` |
| Marcas, alias y traducción de notas | `scripts/lib/fragrantica.mjs` |
| Archivos de entrada estructurada | `data/import/` (ver su README) |
| Destacadas de la home | `src/data/products.ts` → `FEATURED_SLUGS` |

### Agregar una fragancia

1. Sumar el nombre en `src/data/catalog.raw.ts`, dentro de su casa y su grupo.
2. Congelar su identificador: `npm run ids:registrar` (agrega la entrada en
   `src/data/product-ids.ts`; revisar el diff).
3. Listo: ya aparece en el catálogo, en el buscador y en el armado de pedido.
4. Cargar su perfil olfativo: `npm run olfativo -- --only <slug>`.
5. Con el cambio aprobado, actualizar el manifiesto: `npm run integridad:generar`.

El slug de un producto nuevo se calcula una sola vez a partir de casa + nombre y queda
congelado en `src/data/product-ids.ts`. Los existentes nunca se recalculan: un homónimo
nuevo en otro género recibe sufijo propio sin renombrar a los anteriores, y renombrar
una fragancia sin actualizar el registro hace fallar el build. Detalle en
`docs/NOX-ADMIN.md`.

### Cambiar precios

`src/config/pricing.ts` es la única fuente de verdad de los dos esquemas.

**Minorista** — precios **totales de combo**, no precio unitario por cantidad:
`quoteRetail(units)` devuelve el total exacto y, si la cantidad no tiene precio confirmado
(5 a 9 unidades), devuelve estado `a-cotizar` en vez de inventar un número.

**Mayorista** — escala **por rangos**, en `WHOLESALE_PRICING`:

```ts
{ minUnits: 10,  maxUnits: 19,   unitPrice: 9990 }
{ minUnits: 20,  maxUnits: 29,   unitPrice: 9490 }
…
{ minUnits: 500, maxUnits: null, unitPrice: 6990 }   // último tramo, sin techo
```

El escalón se determina por la cantidad **total** del pedido y se aplica a **todas** las
unidades, no sólo a las que superan el umbral: 20 unidades son 20 × $9.490, nunca
19 × $9.990 + 1 × $9.490. `quoteWholesale(units)` devuelve además `unitsToNextTier`
(para el aviso de "sumando X accedés a…") y `canCheckout`, que habilita el envío del
pedido recién a partir del mínimo de 10.

Verificá cualquier cambio con `npm run qa:mayoristas`: cubre los bordes de cada tramo,
los totales y la continuidad de la escala.

---

## Estructura

```
src/
  app/                      Rutas (App Router)
    page.tsx                Home
    catalogo/               Catálogo con buscador y filtros
    fragancia/[slug]/       Ficha de producto (233 rutas estáticas)
    asesor/                 Encontrá tu fragancia
    mi-pedido/              Armado de pedido + WhatsApp
    mayoristas/             Escala mayorista + armado propio
    como-comprar/ envios/ preguntas-frecuentes/ contacto/
    sitemap.ts robots.ts not-found.tsx
  components/
    ui/                     Botones, chips, stepper, reveal, íconos
    layout/                 Header, nav mobile, footer
    product/                Visual de fragancia, card, ficha
    home/                   Hero y secciones de la home
    order/                  Barra flotante + control de pedido compartido
  config/                   Precios, WhatsApp, envíos, FAQ, tema
  data/                     Catálogo maestro, perfiles olfativos, fuentes, tipos
  lib/                      Motor del asesor, búsqueda, armado de WhatsApp
  store/                    Estado del pedido (contexto + localStorage)
preview/                    Shims y entry del preview estático
scripts/
  lib/fragrantica.mjs       Marcas, alias, matcher de variantes, parsers, traducción
  autocompletar-olfativo.ts Carga de perfiles desde la referencia
  qa-*.{ts,mjs}             Suite de QA
```

---

## Scripts

```bash
npm run dev            # desarrollo
npm run build          # build de producción
npm run preview        # regenera dist-preview/index.html

npm run qa             # toda la suite de QA de una
npm run qa:integridad  # 233 slugs, perfiles, portadas y precios contra el manifiesto
npm run qa:ids         # identificadores estables ante homónimos y renombres
npm run qa:catalogo    # atribución de marcas, variantes homónimas y copy
npm run qa:performance # separación perfil olfativo / performance NOX
npm run qa:mayoristas  # escala por rangos: bordes, totales, mínimo
npm run qa:match       # matcher de variantes (Le Male vs Le Male Elixir…)
npm run qa:olfativo    # pipeline de autocompletado end-to-end, sin red
npm run qa:import      # entrada estructurada: schema, matcher, rechazos, lote
npm run qa:lote        # los 8 casos de validación y las confusiones bloqueadas
npm run qa:pedido      # edición rápida y sincronización catálogo/ficha/asesor/pedido
npm run qa:asesor      # flujo de 3 preguntas + pantalla de decisión + refinamiento
npm run test:e2e       # recorrido completo en Chromium (mobile + desktop)
npm run test:layout    # sin scroll horizontal en 390px

npm run datos          # estado de la carga: cargadas, pendientes, needsReview
npm run olfativo       # autocompletado de información olfativa
npm run validar        # integridad del catálogo (slugs, enlaces de datos)
npm run revisar:olfativo  # revisión editorial de las fichas (acepta --dry-run)
npm run ids:registrar     # congela el slug de las fragancias nuevas
npm run integridad:generar  # regenera el manifiesto (sólo cambios aprobados)
```

---

## Autocompletado de información olfativa

El catálogo se completa progresivamente con `npm run olfativo`, que usa una base de
perfumería como **fuente interna** para los datos estructurados de la fragancia de
referencia.

```
producto NOX → marca de referencia → índice real de esa casa →
match de variante validado → ficha → datos estructurados → perfil NOX
```

```bash
npm run olfativo -- --only lattafa-yara --dry-run   # probar sin escribir
npm run olfativo -- --brand "Lattafa"               # una casa
npm run olfativo -- --limit 20                      # de a poco, revisando
```

En `--dry-run` no se escribe **nada** en disco: ni los archivos de datos, ni la cola de
revisión, ni la caché de páginas. La salida muestra, por fragancia: producto NOX, marca
detectada, perfume detectado, URL, confianza del match, las tres capas de notas ya
traducidas, los acordes, la familia derivada y si escribiría datos o no.

**Empezá siempre por una muestra chica y revisá antes de seguir.** Después de cada
corrida, `npm run datos` lista lo cargado y lo que quedó marcado, y
`data-review/revision.json` tiene el detalle.

### Cómo evita cargar datos equivocados

El riesgo real no es que falte información: es que a una fragancia le entren las notas de
otra parecida. Por eso:

- El match **nunca** se hace por búsqueda de texto libre. Se resuelve contra la lista real
  de fragancias de esa casa, validando marca + nombre + variante.
- Sólo se autocompleta con coincidencia `exact` o `normalized`. Cualquier otra cosa queda
  `needsReview: true` con los candidatos anotados, sin escribir ninguna nota.
- `Le Male`, `Le Male Elixir`, `Le Male Le Parfum` y `Ultra Male` son productos distintos y
  el matcher lo trata así. Hay un test dedicado: `npm run qa:match`.
- Los nombres que existirían en masculino y femenino a la vez se desambiguan en el catálogo,
  no con alias: `212 VIP` es el femenino y `212 VIP Men` el masculino, y cada uno coincide de
  forma exacta con su referencia. Nunca comparten información olfativa.
- Si la ficha no devuelve notas, no se inventa nada.
- Si una nota no está en el diccionario de traducción, se conserva en su idioma original y
  el producto queda marcado. No se traduce a ojo.

### Qué se toma y qué no

La referencia nos dice **cómo huele**. Eso se toma con confianza y es la base de la ficha:
notas de salida, corazón y fondo, notas principales, acordes, familias y carácter aromático
(`aromaticIntensity`), más el material para describir el perfil, la evolución, la ocasión y
el clima.

Lo que **no** se toma es cómo rinde: duración, horas, proyección, estela. Eso es performance
del extracto NOX, se mide, y tiene su propio archivo. El autocompletado tiene una guardia
dura: puede escribir `olfactoryProfile` y **nunca** `noxPerformance` — si un perfil llegara
con esos campos, la corrida se corta, y al terminar se verifica por hash que
`src/data/nox-performance.ts` no cambió.

Tampoco se copia texto editorial, reseñas ni comentarios: la redacción de la ficha es propia.

### Perfil olfativo vs. performance NOX

Son dos capas distintas y separadas a propósito:

| | Qué describe | De dónde sale | Se publica |
| --- | --- | --- | --- |
| `olfactoryProfile` | Cómo huele: notas, acordes, familias, evolución, carácter | Referencia + redacción NOX | Sí |
| `noxPerformance` | Cómo rinde: duración, proyección, estela | Prueba propia de NOX | Sólo con `verified: true` |

`aromaticIntensity` (suave / equilibrada / intensa / envolvente / marcada) es **carácter**,
no rendimiento: dice cómo se percibe la composición, no cuánto dura. Es lo que cruza la
pregunta de presencia del asesor. La performance entra al asesor como criterio extra y sólo
cuando está probada; no tenerla nunca resta puntos.

Cuando NOX pruebe una fragancia, se carga a mano en `src/data/nox-performance.ts`:

```ts
"lattafa-khamrah": {
  verified: true,
  longevity: "alta",
  projection: "media-alta",
  sillage: "marcada",
  performanceIntensity: "alta",
  testedAt: "2026-10",
  notes: "Prueba NOX sobre piel, jornada completa."
}
```

A partir de ahí la ficha muestra el bloque "Probado por NOX". Antes, no dice nada.

### Cuando la fuente remota no está disponible

La consulta automatizada puede devolver HTTP 403. Cuando pasa, el producto
queda `needsReview` y ahí termina el intento: **no se implementa ningún
bypass** — ni proxies, ni rotación de IP, ni spoofing, ni headless, ni cookies
de sesión ajenas, ni resolución de CAPTCHA. Hay un chequeo en
`npm run qa:import` que escanea el código y falla si alguno aparece.

El camino alternativo es cargar los mismos datos estructurados desde un archivo:

```bash
npm run olfativo -- --only lattafa-yara --source-file data/import/lattafa-yara.json --dry-run
```

Los dos caminos convergen inmediatamente: mismo matcher, misma validación de
marca y variante, misma traducción, misma derivación de familia y carácter,
mismo schema, mismo QA, misma guardia de performance. No hay dos sistemas de
datos. El registro de procedencia anota cuál se usó en `intake`
(`"remoto"` o `"archivo"`). El schema completo y las reglas de validación están
en `data/import/README.md` y en la cabecera de `scripts/lib/import-olfativo.mjs`.

### La fuente es interna, no pública

La procedencia (URL, fecha de consulta, estado del match, marca y nombre con los que se
validó) vive en `src/data/olfactory.sources.ts`. **Ningún componente importa ese archivo**,
así que no llega al bundle ni a la ficha. El cliente ve una ficha NOX limpia, con una única
aclaración discreta al pie del perfil.

---

## Reglas del proyecto

Estas decisiones están en el código a propósito. Conviene mantenerlas.

**No se inventa información olfativa.** Cada fragancia con datos tiene su registro de
procedencia en `src/data/olfactory.sources.ts`. Las que faltan muestran en la ficha que la
información está en verificación y ofrecen consultar por WhatsApp — no notas genéricas.
El asesor sólo recomienda fragancias con perfil cargado.

**La ficha habla de aroma, no de rendimiento.** Puede decir que algo es intenso, envolvente
o marcado: eso es carácter. No dice cuántas horas dura, cuánto proyecta ni qué estela deja
mientras NOX no lo haya probado (`noxPerformance.verified`). `npm run qa:performance`
escanea el copy visible y falla si vuelve una afirmación de ese tipo.

**Fidelidad sí, identidad no.** Se puede decir "inspiración de alta fidelidad aromática" o
"interpretación muy fiel al perfil olfativo de la fragancia de referencia". Nunca
"idéntico", "100% igual" ni "exactamente igual". Los datos internos de fidelidad y de
concentración de esencia no se publican en ningún lado: hay un chequeo que lo verifica.

**El asesor pregunta tres cosas, no cinco.** Aroma, notas y ocasión son las únicas
obligatorias. Después aparece una pantalla de decisión: ver recomendaciones, pasar a
WhatsApp con esas tres respuestas, o afinar con dos preguntas opcionales (intensidad y
perfil). Nunca se avanza solo al refinamiento.

**Una sola base de datos alimenta todo.** El perfil que se carga en
`src/data/olfactory.ts` es la fuente de verdad de la ficha, los filtros, el buscador, el
asesor y las recomendaciones. No hay una segunda base manual en paralelo.

**Un solo estado de pedido.** Catálogo, ficha, asesor y Mi pedido leen y escriben sobre
`useOrder`. El control de agregar/sumar/restar/quitar es un único componente
(`components/order/OrderControl.tsx`) usado en los tres lugares, así que no hay forma de
que se desincronicen.

**No se inventan políticas ni costos.** Los envíos no declaran tarifa ni plazo porque no
están definidos (`cost: null`, `eta: null` en `shipping.ts`). Cuando se confirmen, se
completan esos campos y la web los muestra sola.

**No hay reseñas falsas, stock falso, contadores ni urgencia.** Si más adelante hay
testimonios reales, se agregan como un bloque nuevo.

**No se inventan promociones.** Hay precio confirmado hasta 4 unidades. De 5 a 9, la web
invita a coordinar en vez de extrapolar un descuento.

**Medios de pago:** efectivo, transferencia bancaria y transferencia por billetera virtual.
No se menciona tarjeta ni cuotas en ningún lado.

**La clasificación comercial gana al origen del catálogo maestro.** `origin` en
`catalog.raw.ts` dice de qué bloque salió cada fragancia — es procedencia, dato
histórico. `HOUSE_UNIVERSE` en `brands.ts` es la decisión comercial de NOX sobre
cómo se navega la marca. Cuando la casa está clasificada explícitamente, esa
clasificación manda: Montale y Xerjoff son nicho aunque hayan entrado por el
bloque Árabes. El catálogo maestro no se reorganiza por esto, para no tener el
mismo dato en dos archivos que después divergen. Verificado por
`npm run qa:catalogo`.

**NOX es la marca protagonista.** Las fragancias originales se citan como referencia
(`Inspirado en …`), nunca con su diseño ni su logotipo. El pie de página incluye la
aclaración de marcas.

---

## Imágenes de producto

Ninguna fragancia tiene foto todavía (`image: null`). Mientras tanto,
`components/product/FragranceVisual.tsx` genera la composición: frasco NOX centrado,
referencia al original arriba a la derecha y fondo construido con la paleta de la familia
olfativa de esa fragancia (un cítrico no se ve igual que un ambarado).

Cuando tengas las fotos, cargá la ruta en `image` y el componente las usa automáticamente.
La composición generada queda como respaldo para las que falten.

En `public/referencia-producto.jpg` está la imagen de referencia que pasaste, y en
`public/nox-logo.jpg` el logo original. El logotipo que usa la web está dibujado en SVG
(`components/ui/index.tsx` → `NoxMark`) para que se vea nítido en cualquier tamaño.

---

## Notas técnicas

**Los QA corren subprocesos sin depender del PATH.** `scripts/lib/run-tsx.mjs`
resuelve el CLI de tsx dentro del proyecto y lo ejecuta con `process.execPath`,
el mismo Node que está corriendo. Nunca se invoca `npx` por nombre: en Windows
el ejecutable es `npx.cmd` y `spawnSync` sin shell no aplica PATHEXT, así que la
llamada fallaba con `ENOENT`. Tampoco se usa `shell: true`, para no tener que
escapar rutas con espacios. Cualquier QA nuevo que necesite correr un script
debería usar `runScript()` o `evalTs()` de ese módulo.

- **Mobile first.** Todos los recorridos están probados a 390 px y a 1440 px, sin scroll
  horizontal en ninguna pantalla.
- **Accesibilidad.** Navegación por teclado, foco visible, `aria-label` en controles de
  íconos, salto al contenido, y respeto de `prefers-reduced-motion`.
- **SEO.** Metadata por página, `generateStaticParams` para las 233 fichas, sitemap y
  robots. `/mi-pedido` está excluida de indexación.
- **Sin checkout.** El flujo termina en WhatsApp con el mensaje ya redactado
  (`src/lib/whatsapp.ts`).
- **El pedido persiste** en `localStorage` bajo la clave `nox.pedido.v1`.

### Sobre el número de WhatsApp

Configurado como `+54 9 11 2707-6746` → `wa.me/5491127076746` (`src/config/site.ts`).
Si el link no abriera bien desde algún dispositivo, probá quitando el `9`.
