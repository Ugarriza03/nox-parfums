-- =============================================================================
-- PRUEBAS DE SEGURIDAD E INTEGRIDAD DEL INVENTARIO (NOX Admin V1)
-- =============================================================================
-- Se ejecuta con psql -v ON_ERROR_STOP=1 sobre una base con el stub de
-- Supabase y la migración aplicados (ver supabase/tests/run.sh).
-- Cada caso es un bloque que lanza una excepción si el resultado no es el
-- esperado; el primer fallo corta la ejecución con código distinto de 0.
-- =============================================================================

\set ON_ERROR_STOP 1
\set QUIET 1

-- --------------------------------------------------------------- fixtures

create schema tests;

create function tests.claims(p_uid uuid, p_aal text default 'aal1') returns void
language sql as $$
  select set_config(
    'request.jwt.claims',
    json_build_object('sub', p_uid, 'role', 'authenticated', 'aal', p_aal)::text,
    true
  );
$$;
grant usage on schema tests to anon, authenticated;
grant execute on function tests.claims(uuid, text) to anon, authenticated;

create function tests.ok(p_nombre text) returns void language plpgsql as $$
begin raise notice '✓ %', p_nombre; end $$;
grant execute on function tests.ok(text) to anon, authenticated;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin-a@prueba.invalid'),
  ('00000000-0000-0000-0000-00000000000b', 'admin-b@prueba.invalid'),
  ('00000000-0000-0000-0000-00000000000c', 'usuario-c@prueba.invalid'),
  ('00000000-0000-0000-0000-00000000000d', 'inactivo-d@prueba.invalid'),
  ('00000000-0000-0000-0000-00000000000e', 'mfa-e@prueba.invalid');

-- La carga de administradores se hace como postgres (SQL Editor). Para las
-- pruebas, A, B y D no exigen MFA; E sí (valor por defecto).
insert into public.admin_users (user_id, display_name, active, mfa_required) values
  ('00000000-0000-0000-0000-00000000000a', 'Admin A', true,  false),
  ('00000000-0000-0000-0000-00000000000b', 'Admin B', true,  false),
  ('00000000-0000-0000-0000-00000000000d', 'Inactivo D', false, false);
insert into public.admin_users (user_id, display_name) values
  ('00000000-0000-0000-0000-00000000000e', 'Admin E con MFA');

-- ======================================================= 1. estructura

do $$
declare r record;
begin
  for r in
    select p.proname, p.prosecdef, p.proconfig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('is_admin', 'admin_status', 'registrar_movimiento', 'nox_historial_inmutable')
  loop
    if r.proconfig is null or not ('search_path=""' = any (r.proconfig)) then
      raise exception 'FALLA: % no fija search_path vacío (%).', r.proname, r.proconfig;
    end if;
  end loop;
  if (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.prosecdef
        and p.proname in ('is_admin', 'admin_status', 'registrar_movimiento')) <> 3 then
    raise exception 'FALLA: las tres funciones de acceso deben ser SECURITY DEFINER.';
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public'
             and tablename in ('admin_users', 'inventory_settings', 'inventory_items', 'inventory_movements')
             and not rowsecurity) then
    raise exception 'FALLA: hay una tabla sin RLS.';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and cmd <> 'SELECT') then
    raise exception 'FALLA: existe una política distinta de SELECT.';
  end if;
  perform tests.ok('funciones con search_path vacío; RLS en las 4 tablas; sólo políticas de lectura');
end $$;

do $$
declare t text;
begin
  foreach t in array array['admin_users', 'inventory_settings', 'inventory_items', 'inventory_movements'] loop
    if has_table_privilege('anon', 'public.' || t, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') then
      raise exception 'FALLA: anon conserva privilegios sobre %.', t;
    end if;
    if has_table_privilege('authenticated', 'public.' || t, 'INSERT,UPDATE,DELETE,TRUNCATE') then
      raise exception 'FALLA: authenticated puede escribir directo en %.', t;
    end if;
  end loop;
  if has_function_privilege('anon', 'public.registrar_movimiento(uuid, text, public.tipo_movimiento, integer, text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.is_admin()', 'EXECUTE') then
    raise exception 'FALLA: anon puede ejecutar funciones del panel.';
  end if;
  perform tests.ok('privilegios por defecto de Supabase revocados: anon sin acceso, authenticated sin escritura directa');
end $$;

-- ======================================================= 2. visitante (anon)

begin;
set local role anon;
do $$
begin
  begin
    perform 1 from public.inventory_items;
    raise exception 'FALLA: anon leyó inventory_items';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.inventory_movements;
    raise exception 'FALLA: anon leyó inventory_movements';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'ingreso', 1, null);
    raise exception 'FALLA: anon ejecutó registrar_movimiento';
  exception when insufficient_privilege then null;
  end;
  perform tests.ok('visitante: no lee inventario ni historial y no puede registrar movimientos');
end $$;
rollback;

-- ================================================ 3. autenticado sin permisos

begin;
select tests.claims('00000000-0000-0000-0000-00000000000c', 'aal2');
set local role authenticated;
do $$
begin
  if public.is_admin() then raise exception 'FALLA: usuario común es admin'; end if;
  if exists (select 1 from public.admin_status()) then raise exception 'FALLA: admin_status devolvió filas'; end if;
  if exists (select 1 from public.inventory_settings) then raise exception 'FALLA: usuario común lee configuración'; end if;
  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'carga_inicial', 3, 'intento');
    raise exception 'FALLA: usuario común registró un movimiento';
  exception when sqlstate 'NX401' then null;
  end;
  begin
    insert into public.admin_users (user_id, display_name) values ('00000000-0000-0000-0000-00000000000c', 'yo');
    raise exception 'FALLA: usuario común se agregó como admin';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.inventory_items (product_slug, stock, initialized_by, updated_by)
    values ('lattafa-khamrah', 9, '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a');
    raise exception 'FALLA: usuario común insertó stock directo';
  exception when insufficient_privilege then null;
  end;
  perform tests.ok('usuario autenticado sin permisos: no es admin, no ve datos, no escribe ni se autoasigna rol');
end $$;
rollback;

-- ===================================================== 4. admin inactivo

begin;
select tests.claims('00000000-0000-0000-0000-00000000000d', 'aal2');
set local role authenticated;
do $$
begin
  if public.is_admin() then raise exception 'FALLA: admin inactivo es admin'; end if;
  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'carga_inicial', 3, 'intento');
    raise exception 'FALLA: admin inactivo registró';
  exception when sqlstate 'NX401' then null;
  end;
  perform tests.ok('administrador desactivado: sin acceso');
end $$;
rollback;

-- ====================================================== 5. MFA exigido

begin;
select tests.claims('00000000-0000-0000-0000-00000000000e', 'aal1');
set local role authenticated;
do $$
declare s record;
begin
  if public.is_admin() then raise exception 'FALLA: admin con MFA exigido pasó con aal1'; end if;
  select * into s from public.admin_status();
  if not found or s.aal <> 'aal1' or not s.mfa_required then
    raise exception 'FALLA: admin_status no informa aal1 + MFA requerido';
  end if;
  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'carga_inicial', 3, 'intento');
    raise exception 'FALLA: registró sin segundo factor';
  exception when sqlstate 'NX401' then null;
  end;
  perform tests.ok('MFA exigido: con aal1 no hay acceso (tampoco por llamada directa a la base)');
end $$;
rollback;

begin;
select tests.claims('00000000-0000-0000-0000-00000000000e', 'aal2');
set local role authenticated;
do $$
begin
  if not public.is_admin() then raise exception 'FALLA: admin con aal2 rechazado'; end if;
  perform tests.ok('MFA exigido: con aal2 el administrador accede');
end $$;
rollback;

-- ================================== 6. carga inicial: sin registro vs. cero

begin;
select tests.claims('00000000-0000-0000-0000-00000000000a');
set local role authenticated;
do $$
declare m public.inventory_movements;
begin
  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'ingreso', 2, null);
    raise exception 'FALLA: ingreso sin carga inicial';
  exception when sqlstate 'NX404' then null;
  end;
  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'carga_inicial', 5, '  ');
    raise exception 'FALLA: carga inicial sin motivo';
  exception when sqlstate 'NX422' then null;
  end;

  m := public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'carga_inicial', 5, 'Conteo físico');
  if m.stock_before <> 0 or m.stock_after <> 5 or m.created_by <> '00000000-0000-0000-0000-00000000000a' then
    raise exception 'FALLA: carga inicial con datos incorrectos (%)', row_to_json(m);
  end if;

  m := public.registrar_movimiento(gen_random_uuid(), 'afnan-9pm', 'carga_inicial', 0, 'Conteo físico: no hay unidades');
  if (select stock from public.inventory_items where product_slug = 'afnan-9pm') <> 0 then
    raise exception 'FALLA: stock confirmado en cero no quedó registrado';
  end if;

  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'carga_inicial', 8, 'Otra vez');
    raise exception 'FALLA: segunda carga inicial aceptada';
  exception when sqlstate 'NX409' then null;
  end;

  if exists (select 1 from public.inventory_items where product_slug = 'christian-dior-sauvage') then
    raise exception 'FALLA: apareció inventario para un producto sin carga inicial';
  end if;
  perform tests.ok('carga inicial explícita con motivo; "sin registro" (sin fila) distinto de "cero confirmado" (fila con 0); no se repite');
end $$;
commit;

-- ====================================== 7. ingresos, egresos y ajustes

begin;
select tests.claims('00000000-0000-0000-0000-00000000000a');
set local role authenticated;
do $$
declare m public.inventory_movements; s integer;
begin
  m := public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'ingreso', 3, 'Reposición');
  if m.stock_before <> 5 or m.stock_after <> 8 then raise exception 'FALLA ingreso (%)', row_to_json(m); end if;
  perform tests.ok('ingreso: 5 → 8');

  m := public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'egreso', 2, 'Venta por WhatsApp');
  if m.stock_before <> 8 or m.stock_after <> 6 then raise exception 'FALLA egreso (%)', row_to_json(m); end if;
  perform tests.ok('egreso: 8 → 6');

  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'egreso', 7, null);
    raise exception 'FALLA: egreso dejó stock negativo';
  exception when sqlstate 'NX423' then null;
  end;
  select stock into s from public.inventory_items where product_slug = 'lattafa-khamrah';
  if s <> 6 then raise exception 'FALLA: el egreso rechazado alteró el stock (%)', s; end if;
  perform tests.ok('egreso mayor al stock: rechazado y el stock queda en 6');

  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'ingreso', -1, null);
    raise exception 'FALLA: cantidad negativa aceptada';
  exception when sqlstate 'NX422' then null;
  end;
  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'egreso', 0, null);
    raise exception 'FALLA: egreso de 0 aceptado';
  exception when sqlstate 'NX422' then null;
  end;
  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'Lattafa Khamrah', 'ingreso', 1, null);
    raise exception 'FALLA: slug inválido aceptado';
  exception when sqlstate 'NX422' then null;
  end;
  perform tests.ok('cantidades negativas, egresos de 0 y slugs inválidos: rechazados');

  begin
    perform public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'ajuste', 4, '');
    raise exception 'FALLA: ajuste sin motivo';
  exception when sqlstate 'NX422' then null;
  end;
  m := public.registrar_movimiento(gen_random_uuid(), 'lattafa-khamrah', 'ajuste', 4, 'Recuento: faltaban 2');
  if m.stock_before <> 6 or m.stock_after <> 4 or m.quantity <> 4 then raise exception 'FALLA ajuste (%)', row_to_json(m); end if;
  perform tests.ok('ajuste = stock real contado (6 → 4) con motivo obligatorio');
end $$;
commit;

-- ============================================================ 8. idempotencia

begin;
select tests.claims('00000000-0000-0000-0000-00000000000a');
set local role authenticated;
do $$
declare
  rid uuid := gen_random_uuid();
  m1 public.inventory_movements; m2 public.inventory_movements;
begin
  m1 := public.registrar_movimiento(rid, 'lattafa-khamrah', 'ingreso', 2, 'Doble clic');
  m2 := public.registrar_movimiento(rid, 'lattafa-khamrah', 'ingreso', 2, 'Doble clic');
  if m1.id <> m2.id then raise exception 'FALLA: el reenvío creó otro movimiento'; end if;
  if (select stock from public.inventory_items where product_slug = 'lattafa-khamrah') <> 6 then
    raise exception 'FALLA: el reenvío aplicó el ingreso dos veces';
  end if;
  begin
    perform public.registrar_movimiento(rid, 'lattafa-khamrah', 'egreso', 1, null);
    raise exception 'FALLA: request_id reutilizado con otros datos';
  exception when sqlstate 'NX409' then null;
  end;
  perform tests.ok('idempotencia: el mismo request_id no duplica; con otros datos se rechaza');
end $$;
commit;

-- ===================================== 9. historial inmutable y sin DML directo

begin;
select tests.claims('00000000-0000-0000-0000-00000000000a');
set local role authenticated;
do $$
begin
  begin
    update public.inventory_movements set quantity = 99;
    raise exception 'FALLA: admin editó el historial';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.inventory_movements;
    raise exception 'FALLA: admin borró el historial';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.inventory_items set stock = 500;
    raise exception 'FALLA: admin modificó stock sin movimiento';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.admin_users set active = true;
    raise exception 'FALLA: admin modificó administradores';
  exception when insufficient_privilege then null;
  end;
  perform tests.ok('administrador por la API: no puede editar/borrar historial, tocar stock directo ni administradores');
end $$;
rollback;

-- Incluso el dueño de la base (postgres / service_role) choca con el trigger.
do $$
begin
  begin
    update public.inventory_movements set reason = 'manipulado';
    raise exception 'FALLA: el historial se editó como postgres';
  exception when sqlstate 'NX403' then null;
  end;
  begin
    delete from public.inventory_movements;
    raise exception 'FALLA: el historial se borró como postgres';
  exception when sqlstate 'NX403' then null;
  end;
  begin
    truncate public.inventory_movements cascade;
    raise exception 'FALLA: el historial se truncó como postgres';
  exception when sqlstate 'NX403' then null;
  end;
  perform tests.ok('el trigger bloquea UPDATE, DELETE y TRUNCATE del historial incluso al dueño de la base');
end $$;

-- ================================================ 10. lectura y trazabilidad

begin;
select tests.claims('00000000-0000-0000-0000-00000000000b');
set local role authenticated;
do $$
declare n integer;
begin
  select count(*) into n from public.inventory_movements where product_slug = 'lattafa-khamrah';
  if n <> 5 then raise exception 'FALLA: se esperaban 5 movimientos de lattafa-khamrah, hay %', n; end if;
  if exists (
    select 1 from public.inventory_movements m
    where m.stock_after <> case m.movement_type
      when 'ingreso' then m.stock_before + m.quantity
      when 'egreso' then m.stock_before - m.quantity
      else m.quantity end
  ) then raise exception 'FALLA: movimiento incoherente'; end if;
  if (select display_name from public.admin_users where user_id = '00000000-0000-0000-0000-00000000000a') <> 'Admin A' then
    raise exception 'FALLA: no se ve el nombre del responsable';
  end if;
  if (select low_stock_threshold from public.inventory_settings) <> 1 then
    raise exception 'FALLA: umbral global distinto de 1';
  end if;
  perform tests.ok('otro administrador ve el historial completo, coherente, con responsable; umbral global = 1');
end $$;
rollback;

\echo 'PRUEBAS SQL SECUENCIALES: OK'
