# Entrada estructurada de información olfativa

Este directorio guarda los archivos JSON que alimentan el camino B del
pipeline: cuando la consulta automatizada a la fuente de referencia no está
disponible (por ejemplo, HTTP 403), los mismos datos estructurados se cargan
desde un archivo. **No se evade ninguna protección**: el 403 se registra como
`needsReview` y este es el camino alternativo.

## Un registro

```bash
npm run olfativo -- --only lattafa-yara --source-file data/import/lattafa-yara.json --dry-run
```

## Un lote

```bash
npm run olfativo -- --source-file data/import/mi-lote.json --dry-run
```

Con `--source-file`, el archivo manda: se procesan exactamente los productos
que figuran en él. `--only` sirve para acotar todavía más.

## Qué se importa y qué no

Se importan **datos estructurados**: notas de salida, corazón y fondo, notas
principales (opcional) y acordes, escritos como figuran en la fuente. El
pipeline los pasa por el diccionario de traducción existente y deriva la
familia y el carácter aromático con el mismo criterio que la ruta remota.

No se importan, y su sola presencia **rechaza el registro**:

- performance: `longevity`, `projection`, `sillage`, `performanceIntensity`,
  `testedAt`, duración, horas, estela. Eso se mide y vive en
  `src/data/nox-performance.ts`.
- texto ajeno: descripciones, reseñas, comentarios, votos, ratings. La
  redacción de la ficha es propia de NOX.

## Validaciones

Cada registro tiene que pasar, antes de que se escriba una sola nota:

- `productSlug` existe en el catálogo.
- `brand` coincide con la marca de referencia de ese producto.
- `referenceName` coincide con la variante del catálogo **por el mismo matcher
  que usa la ruta remota**: `Yara Candy` no pasa por `Yara`.
- `source.url` es la ficha puntual (no el índice de la casa) y pertenece a la
  marca declarada.
- Hay al menos una nota y al menos un acorde.
- No hay duplicados (se descartan con aviso) ni productos repetidos en el lote.

Cualquier fallo deja el producto en `needsReview` con el motivo escrito, y no
carga nada.

## Modo sólo-match

Para probar la identificación de un lote antes de tener los datos olfativos:

```bash
npm run olfativo -- --source-file data/import/lote-validacion-8.json --solo-match --force
```

Valida identidad, marca, variante y URL y corre el matcher, sin exigir perfil.
Nunca escribe nada. Es el modo con el que se estresa el matcher antes de
procesar las pendientes.

## Estados de la fuente

Una URL que nadie abrió no es procedencia. El schema las separa:

| Estado | Qué lleva | Sirve para |
| --- | --- | --- |
| `verified` | `name` + `url` + `checkedAt` | La única que cuenta como procedencia y la única que habilita cargar notas. |
| `candidate` | `name` + `candidateUrl`, sin `url` ni `checkedAt` | Identificar (`--solo-match`) y dejar anotado por dónde seguir. En una corrida completa queda `needsReview` y no carga nada. |

```json
"source": { "name": "Fragrantica", "status": "verified",  "url": "https://…", "checkedAt": "2026-09-13" }
"source": { "name": "Fragrantica", "status": "candidate", "url": null, "checkedAt": null, "candidateUrl": "https://…" }
```

Una `url` sin `checkedAt` se rechaza: o se comprueba y se fecha, o se declara
como `candidateUrl`. No hay término medio. Una `candidateUrl` nunca ocupa el
campo `url` del registro de procedencia, así que es imposible confundirlas
después.

## Cuando no se puede determinar la referencia

Un registro puede declararse explícitamente para revisión. Es un resultado
válido, no un fallo:

```json
{
  "productSlug": "versace-eros",
  "brand": "Versace",
  "referenceName": "Eros",
  "source": { "name": "Fragrantica", "url": "…" },
  "needsReview": true,
  "reviewReason": "La línea tiene versión masculina y femenina y no se puede determinar cuál corresponde."
}
```

`reviewReason` es obligatorio cuando se declara `needsReview`: si no se puede
explicar la duda, el registro se rechaza.

También existe `referenceGender` (`masculino` | `femenino` | `unisex`): si
contradice el género del producto NOX, el registro queda en revisión solo, sin
que nadie tenga que declararlo.

## Recarga

Recargar una fragancia ya cargada actualiza notas, acordes, familia y carácter,
pero **conserva** la redacción (`feel`, `likeIf`) y la ocasión/clima que se
revisaron a mano. Para regenerar también la redacción: `--rewrite-copy`.
