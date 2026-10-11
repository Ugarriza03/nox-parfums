# NOX Admin V1 — panel de inventario

Panel privado para Gabriel y Francisco: inventario físico propio, movimientos
de stock e historial. **No está habilitado en producción**: hasta completar las
verificaciones con Supabase real y exigir MFA, `/admin` responde 404 en el
entorno de producción de Vercel.

## 1. Qué hace

| Sección | Contenido |
| --- | --- |
| Resumen | Fragancias del catálogo, cuántas tienen inventario inicial registrado, unidades propias, sin stock propio, stock bajo, movimientos recientes |
| Inventario | Las 233 fragancias con stock propio, estado y última modificación; búsqueda y filtros por estado, género y categoría |
| Detalle | Stock de una fragancia, registro de movimientos e historial propio |
| Actividad | Historial completo, filtros por fragancia, tipo y fechas, paginado |
| Configuración | Datos del administrador, estado de MFA, cierre de sesión |

**Inventario ≠ disponibilidad comercial.** El panel muestra el *stock propio*.
Una fragancia sin stock propio puede seguir publicada y pedirse (depósito
externo). El stock nunca se muestra en la tienda.

### Estados de stock propio

| Estado | Significado |
| --- | --- |
| Sin inventario inicial | Nunca se registró la carga inicial: **no hay dato** |
| Sin stock propio | Carga hecha y stock **confirmado en 0** |
| Stock bajo | Hasta el umbral global (1 unidad; se cambia en `inventory_settings`) |
| Con stock propio | Más que el umbral |

### Movimientos

| Tipo | Cantidad | Motivo |
| --- | --- | --- |
| Carga inicial | Stock realmente contado (puede ser 0). Una sola vez por fragancia | Obligatorio (de dónde sale el dato) |
| Ingreso | Unidades que entran (> 0) | Opcional |
| Egreso | Unidades que salen (> 0); nunca deja el stock bajo cero | Opcional |
| Ajuste por recuento | **Stock real contado**; el sistema registra la diferencia | Obligatorio |

No se carga stock inicial automáticamente. Las ~94 unidades mencionadas no
están verificadas: cada fragancia se carga a mano con su conteo.

## 2. Arquitectura y seguridad

```
navegador ──► Next.js (servidor) ──► Supabase (Auth + Postgres con RLS)
               │  proxy.ts: renueva la sesión sólo en /admin
               │  requerirAdmin(): en CADA página y acción
               └─ nunca expone tokens al navegador (cookies httpOnly, path=/admin)
```

- **Autenticación:** email + contraseña de Supabase Auth, sólo desde el
  servidor. Se valida con `getClaims()`, nunca con `getSession()`.
- **Autorización en tres capas:** layout del panel → cada página y cada
  acción (`requerirAdmin`) → la base (`is_admin()` + RLS).
- **Sin claves privilegiadas:** la app usa sólo la clave *publishable*; si se
  configura una secreta o `service_role`, la rechaza.
- **Base de datos** (`supabase/migrations/20261011120000_nox_admin_inventario.sql`):
  - `admin_users`: sólo se carga desde el SQL Editor; nadie se autoasigna.
  - RLS en todas las tablas, **sólo políticas de lectura** para admins activos.
  - Privilegios por defecto de Supabase revocados a `anon` y `authenticated`.
  - Escritura únicamente con `registrar_movimiento()`: `SECURITY DEFINER`,
    `search_path` vacío, verifica `is_admin()` en cada llamada, bloquea la
    fila del producto (`FOR UPDATE`), rechaza stock negativo e idempotente
    por `request_id`.
  - Historial inmutable: un trigger bloquea UPDATE, DELETE y TRUNCATE incluso
    para el dueño de la base.
  - `mfa_required` (por defecto `true`): `is_admin()` exige sesión `aal2`;
    vale también para llamadas directas a la API.
- **Producción cerrada:** con `VERCEL_ENV=production`, `/admin` responde la
  misma 404 que cualquier URL inexistente de la tienda (el proxy la reescribe)
  salvo `NOX_ADMIN_HABILITADO=true`. El layout de `/admin` también responde 404.
- **Supabase inaccesible:** si Auth no responde (red, proyecto pausado, 5xx),
  el panel muestra "No se pudo conectar con el servicio de autenticación" y no
  da acceso. Una sesión inexistente, inválida o vencida se trata como "sin
  sesión". Ninguno de los dos casos expone detalles técnicos.

## 3. Configuración gratuita (Supabase Free)

> Plan Free vigente (consultado el 11/10/2026 en supabase.com/pricing): base de
> 500 MB, 50.000 usuarios activos/mes, 2 proyectos activos. **El proyecto se
> pausa tras 1 semana sin uso** (el panel deja de funcionar hasta reanudarlo;
> la tienda no se ve afectada) y **no incluye backups automáticos**. Nada de
> esto requiere un plan pago.

1. **Crear el proyecto** en supabase.com con el plan Free (lo crean ustedes).
2. **Desactivar el registro público:** Authentication → Sign In / Providers →
   *Allow new users to sign up* = desactivado.
3. **Habilitar MFA TOTP:** Authentication → Multi-Factor → TOTP habilitado.
4. **Aplicar la migración:** SQL Editor → pegar
   `supabase/migrations/20261011120000_nox_admin_inventario.sql` → Run.
5. **Crear los dos usuarios:** Authentication → Users → *Add user* (cada uno
   define su propia contraseña; no se comparten ni se escriben en ningún
   archivo) o *Send invitation*.
6. **Autorizarlos como administradores:** SQL Editor →
   `supabase/admin/crear-administrador.sql`, completando email y nombre.
7. **Variables de entorno** (Project Settings → API):
   - Local: copiar `.env.example` a `.env.local` y completar
     `NOX_SUPABASE_URL` y `NOX_SUPABASE_PUBLISHABLE_KEY`.
   - Vercel: cargarlas **sólo en Preview** hasta aprobar producción. No
     definir `NOX_ADMIN_HABILITADO` todavía.
8. **Primer ingreso:** `/admin/login` → contraseña → vincular la app de
   autenticación (QR) → código de 6 dígitos.

## 4. Probar localmente

```bash
npm install            # instala @supabase/ssr y @supabase/supabase-js
npm run build
npm run start          # o npm run dev
# http://localhost:3000/admin
```

Sin `.env.local`, `/admin/login` muestra "no configurado" y la tienda funciona
igual.

## 5. Pruebas

| Comando | Qué verifica | Requiere |
| --- | --- | --- |
| `npm run qa:admin` | Lógica de acceso, validaciones, estados, filtros y revisión estática de seguridad (incluido en `npm run qa`) | Nada |
| `npm run test:admin:sesion` | `obtenerAcceso()` / `requerirAdmin()` reales con Supabase simulado: sin sesión, Auth caído, 5xx, excepción, token inválido, base caída, sin permisos, MFA, sin configuración, producción deshabilitada (incluido en `npm run qa`) | Nada |
| `npm run test:admin:formulario` | Regresión del formulario de movimientos: tras la carga inicial pasa solo al modo de movimientos (sin F5), conserva la confirmación, no permite otra carga y ingreso/egreso/ajuste siguen funcionando (incluido en `npm run qa`) | Chromium de Playwright |
| `npm run qa:admin:sql` | Migración sobre PostgreSQL desechable: RLS, permisos, MFA, stock negativo, idempotencia, 25 egresos concurrentes, historial inmutable | `psql`/`createdb` y un PostgreSQL local (en CI: contenedor) |
| `npm run test:admin:e2e` | `next start` sin Supabase, producción deshabilitada y Supabase caído: redirecciones, noindex, sin datos, 404 de la tienda, sin código del panel en la tienda ni de la tienda en el login (HTML visible, carga RSC y JS descargado), sesión no verificable sin acceso, sin errores de hidratación. Entorno aislado: no lee `.env*` ni variables heredadas | `npm run build` + Chromium de Playwright |
| `npm run diagnostico:admin [chunk.js …]` | Informativo: según el manifiesto del build, qué entradas de Next aportan JavaScript a cada ruta de `/admin` y si figura algún módulo de la tienda | `npm run build` |

**Pendiente con Supabase real** (no se considera aprobado hasta hacerlo):
login real de un admin, usuario autenticado sin permisos, MFA de punta a punta,
registro de movimientos desde la interfaz y cierre de sesión.

## 6. Riesgos y limitaciones

- Plan Free: pausa por inactividad y sin backups. Recomendado: exportar el
  historial periódicamente (próxima fase).
- Layouts separados: la tienda (`src/app/(tienda)/layout.tsx`) y el panel
  (`src/app/admin/layout.tsx`) tienen cada uno su **layout raíz**; no hay
  `src/app/layout.tsx` ni `src/app/not-found.tsx`. Los dos arman `<html>` con
  `src/components/documento/Documento.tsx`. Motivo: Next 16 responde los
  `notFound()` que no se resuelven dentro del árbol con la 404 del layout
  raíz de la ruta, y un layout/404 raíz común o mete el marco de la tienda
  en `/admin` o deja la 404 de la tienda sin su presentación. Ahora:
  · la 404 de la tienda (`(tienda)/not-found.tsx`, con Header, Footer y
    OrderBar) cubre URLs inexistentes (`(tienda)/[...noEncontrada]`), fichas
    inexistentes y `/admin` en producción sin habilitar;
  · `/admin` no descarga el pedido ni el catálogo (`npm run qa:admin`
    recorre todo el árbol que Next arma para `/admin`) y su 404 es neutral.
  · Ir de la tienda al panel (o al revés) recarga la página completa: es
    el comportamiento de Next entre layouts raíz distintos.
- 404 de la tienda en rutas dinámicas: cuando `notFound()` se dispara durante
  el render en el servidor (URLs inexistentes, fichas inexistentes, `/admin`
  cerrado en producción), Next 16 responde **status 404** con un documento de
  error vacío (`<html id="__next_error__">`) y la carga RSC del render normal;
  el navegador arma la 404 de la tienda con su encabezado y pie. Es el
  comportamiento del framework: los límites de error de React sólo actúan en
  el navegador. `test:admin:e2e` lo verifica de los dos lados (servidor: 404
  en GET y HEAD, la respuesta transporta la 404 de la tienda y nada del
  panel; navegador: DOM final, sin errores, sin JS del panel) e informa el
  modo de entrega. Limitación: sin JavaScript, esa 404 se ve vacía (sigue
  siendo 404 y no se indexa). Si hiciera falta HTML completo, la opción es la
  404 global prerenderizada de Next (`global-not-found`), que hoy es
  experimental: no se adoptó.
- Las clases de Tailwind del panel se suman a la hoja de estilos global.
