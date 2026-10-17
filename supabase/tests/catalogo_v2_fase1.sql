-- Ejecutar SOLO en PostgreSQL/Supabase de pruebas DESPUES de aplicar migraciones V1 y V2.
-- psql -v ON_ERROR_STOP=1 -f supabase/tests/catalogo_v2_fase1.sql
-- No escribe datos persistentes: verifica metadatos dentro de transaccion.
begin;
do $test$
declare
  v_count integer;
begin
  select count(*) into v_count
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname in ('catalog_products','catalog_change_log')
    and c.relkind='r' and c.relrowsecurity;
  if v_count <> 2 then
    raise exception 'Fallo: faltan tablas con RLS habilitado (encontradas %)',v_count;
  end if;

  select count(*) into v_count from pg_policies
  where schemaname='public' and tablename in ('catalog_products','catalog_change_log')
    and cmd='SELECT' and roles::text like '%authenticated%'
    and qual like '%is_admin%';
  if v_count <> 2 then
    raise exception 'Fallo: faltan politicas de lectura para administradores';
  end if;

  if has_table_privilege('anon','public.catalog_products','SELECT')
     or has_table_privilege('anon','public.catalog_change_log','SELECT')
     or has_table_privilege('authenticated','public.catalog_products','INSERT')
     or has_table_privilege('authenticated','public.catalog_products','UPDATE')
     or has_table_privilege('authenticated','public.catalog_products','DELETE')
     or has_table_privilege('authenticated','public.catalog_change_log','INSERT')
     or has_table_privilege('authenticated','public.catalog_change_log','UPDATE')
     or has_table_privilege('authenticated','public.catalog_change_log','DELETE') then
    raise exception 'Fallo: privilegios directos inseguros';
  end if;

  select count(*) into v_count from pg_trigger t
  join pg_class c on c.oid=t.tgrelid
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='catalog_change_log'
    and t.tgname in ('catalog_log_no_update','catalog_log_no_truncate')
    and not t.tgisinternal;
  if v_count <> 2 then
    raise exception 'Fallo: auditoria sin triggers de inmutabilidad';
  end if;

  if to_regclass('public.inventory_items') is null
     or to_regclass('public.inventory_movements') is null
     or to_regprocedure('public.registrar_movimiento(uuid,text,public.tipo_movimiento,integer,text)') is null then
    raise exception 'Fallo: faltan objetos de inventario V1';
  end if;
  raise notice 'OK: esquema V2, RLS, privilegios, auditoria e inventario V1';
end
$test$;
rollback;
