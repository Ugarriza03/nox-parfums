# NOX Admin V2 — habilitación de entorno de prueba aislado

**Estado:** procedimiento preparado; NO es una autorización para aplicar migraciones ni publicar cambios.

## Separación obligatoria
- Crear un proyecto **Supabase de prueba independiente** de `nox-admin` (producción), con usuarios de prueba y MFA TOTP.
- Crear un proyecto **Vercel de prueba independiente** de `nox-parfums` (producción). Apuntar exclusivamente a `feature/nox-admin-catalogo-v2`.
- Variables del proyecto de prueba: `NOX_SUPABASE_URL` y `NOX_SUPABASE_PUBLISHABLE_KEY` del proyecto de prueba, y `NOX_ADMIN_HABILITADO=true`. No copiar tokens ni claves de producción, ni usar `service_role` en el navegador.
- No conectar dominios de producción ni modificar variables del proyecto público.

## Puertas de validación
1. GitHub Actions de la rama: Build y QA, SQL y dependencias en verde.
2. En la base de prueba vacía, aplicar migraciones ordenadas y verificar RLS, funciones y bucket privado. **No ejecutar en Supabase de producción.**
3. Preparar semilla de 233 fragancias con `scripts/admin/preparar-semilla-catalogo-v2.ts` y verificarla con `scripts/admin/qa-semilla-catalogo-v2.ts`.
4. El generador `scripts/admin/preparar-importacion-catalogo-v2.ts` produce SQL con `ROLLBACK`, **no carga registros**. Si se decide probar la importación, usar una copia revisada explícitamente para la base desechable, nunca un reemplazo automático del ROLLBACK en producción.
5. Comprobar conteos exactos de 233 slugs únicos y 233 publicados en la base de prueba, comparando con la semilla. No crear stock ficticio.
6. Crear un administrador de prueba autorizado, activar MFA, verificar rechazo sin MFA y rechazo a usuarios no administradores.
7. Verificar flujos: nuevo borrador → edición → subida de portada → publicación → ocultamiento → archivado → restauración; revisión de publicado → aprobar y descartar; descartar una revisión oculta → republicar.
8. Comprobar auditoría inmutable, que la imagen de Storage no se pueda sobrescribir ni borrar y que no se pueda acceder a datos de borradores como anónimo.
9. Probar en móvil y escritorio, y verificar que el flujo público de pedido y WhatsApp permanece intacto. **Importante:** el storefront V2 aún usa el catálogo estático; publicar en el panel de prueba no hace visible automáticamente el producto en la tienda.
10. Si falla algo, apagar `NOX_ADMIN_HABILITADO` en el proyecto de prueba o retirar el despliegue de prueba. No tocar producción.

## Pendientes antes de compartir una URL de prueba
- Crear y configurar los dos proyectos aislados con acceso autorizado del propietario.
- Aplicar migraciones y semilla en el proyecto de prueba, verificar autenticación/MFA y los flujos con navegador.
- Resolver la vista de portadas privadas (URL firmada o mecanismo equivalente) y el enlace del catálogo V2 con el storefront **antes de prometer una prueba completa de publicación pública**.

## Estado del entorno aislado informado por Claude (2026-10-18)
- Supabase de prueba: `nox-admin-test`, separado de producción. Claude informó 233 fichas publicadas sin inventario ni portadas Storage.
- Vercel de prueba: `https://nox-parfums-admin-test.vercel.app`, proyecto separado conectado a la rama V2.
- Claude informó que `20261012270000_descartar_revision` seguía pendiente de aprobación manual. **No eludir confirmaciones de operaciones destructivas.**
- La lectura V2 de fichas se activa únicamente con `NOX_CATALOGO_V2_TIENDA=true`; desactivada por defecto, con respaldo estático completo.
- Esta integración no habilita productos nuevos, imágenes privadas ni el catálogo general; requieren otra fase y QA.
- Verificar el estado real de las migraciones y el despliegue antes de considerar la prueba completa.

## Regla de despliegue
Ninguna migración en producción, merge de PR #3, cambio de dominio ni modificación de variables productivas sin aprobación explícita del propietario.
