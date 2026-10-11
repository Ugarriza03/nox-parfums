-- =============================================================================
-- ALTA DE UN ADMINISTRADOR DE NOX ADMIN — plantilla para el SQL Editor
-- =============================================================================
-- Requisitos previos (ver docs/NOX-ADMIN-PANEL.md):
--   1. El usuario ya existe en Supabase → Authentication → Users, creado por
--      ustedes mismos ("Add user" o "Send invitation"). La contraseña la
--      define la propia persona: NUNCA se escribe en este archivo ni en el repo.
--   2. "Allow new users to sign up" está DESACTIVADO.
--
-- Uso: reemplazar el email y el nombre visible, y ejecutar en el SQL Editor
-- (rol postgres). Es la única forma de dar acceso: la app no puede hacerlo.
--
-- mfa_required = true (por defecto): el panel exige contraseña + código TOTP.
-- Sólo durante la configuración inicial, y nunca en producción, puede
-- ponerse en false para la primera prueba; volver a true antes de habilitar
-- el panel en producción.
-- =============================================================================

insert into public.admin_users (user_id, display_name, mfa_required)
select u.id, 'NOMBRE VISIBLE', true
from auth.users u
where u.email = 'EMAIL-DEL-ADMINISTRADOR@ejemplo.com'
returning user_id, display_name, active, mfa_required;

-- Si devuelve 0 filas, el email no existe en auth.users: revisarlo antes de seguir.

-- Quitar acceso sin perder el historial (no borrar la fila):
--   update public.admin_users set active = false
--   where user_id = (select id from auth.users where email = 'EMAIL@ejemplo.com');

-- Exigir MFA a todos antes de habilitar producción:
--   update public.admin_users set mfa_required = true;
