# NOX Admin V2 — contrato de estados (fase 2)

> Documento de diseño. No activa escrituras, políticas públicas ni despliegues.

## Estados

| Estado | Visible en tienda | Editable por administrador | Acción |
| --- | --- | --- | --- |
| draft | No | Sí | Guardar sin publicar |
| published | Sí | Sí | Publicar manualmente |
| hidden | No | Sí | Ocultar temporalmente |
| archived | No | Sí | Archivar sin borrar |

- Las 233 fragancias actuales se preparan como `published` para preservar el catálogo en el futuro corte a DB. Ningún producto nuevo se publica automáticamente.
- Crear fragancia: `draft`; validar marca, nombre, género, universo y slug único.
- Editar: guarda los cambios de un borrador o de un producto existente, pero NO cambia el estado implícitamente. Para evitar publicar ediciones incompletas de un producto publicado, V2 debe implementar revisión/borrador de cambios antes de conectar el editor a producción.
- Publicar: acción explícita, requiere datos mínimos completos y confirmación; registra actor, fecha y valores antes/después.
- Ocultar: `published` -> `hidden`, reversible.
- Archivar: `draft|published|hidden` -> `archived`, reversible; nunca DELETE físico.
- Restaurar: `archived` -> `draft` o `hidden` según decisión explícita del administrador; **nunca publicar automáticamente**.

## Seguridad y separación de responsabilidades

- Solo administradores autenticados con MFA AAL2 pueden crear/editar/cambiar estados, mediante funciones RPC auditadas y transacciones; no otorgar INSERT/UPDATE/DELETE directos a clientes.
- `catalog_change_log` es inmutable. Cada escritura debe registrar `before_data` y `after_data` en la misma transacción.
- El catálogo público únicamente podrá leer productos `published` mediante una política RLS SELECT limitada a columnas seguras (preferentemente una vista o RPC pública con campos explícitos). No exponer el historial, actores ni datos internos.
- El stock físico y sus movimientos siguen exclusivamente en inventario V1. Publicación y stock son independientes.
- Los slugs existentes son inmutables; no se regeneran por cambios de marca o nombre. Los nuevos slugs se asignan una sola vez y se comprueba que no colisionen.
- Las imágenes locales se mantienen hasta migrar y verificar bytes, rutas y permisos de Storage. `image_path = null` en la semilla NO significa que se elimine la portada actual.

## Antes del corte público

1. Construir RPC segura para CRUD lógico y auditoría, con pruebas de MFA, permisos, transiciones e idempotencia.
2. Resolver borradores de cambios de productos ya publicados sin exponer datos sin aprobar.
3. Sembrar 233 registros en entorno aislado y verificar paridad 233/233, imágenes y URLs.
4. Implementar lectura pública segura, fallback y reversión; probar catálogo, ficha, asesor, pedido y SEO.
5. Solicitar aprobación expresa antes de cualquier migración de producción o merge.
