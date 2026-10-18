-- NOX Admin V2: pruebas transaccionales de estados (PostgreSQL aislado).
-- Ejecutar despues de todas las migraciones y del stub de Supabase.
begin;
do $test$
declare
  v_slug text := 'nox-v2-test-estados';
  v_actor uuid := '00000000-0000-0000-0000-00000000000a';
  v_row public.catalog_products;
  v_count integer;
begin
  -- Los administradores A/B del fixture de inventario V1 ya existen.
  insert into public.catalog_products
    (slug, house, fragrance_name, gender, universe, origin, status)
  values
    (v_slug, 'NOX QA', 'Fragancia de prueba', 'unisex', 'pendiente', 'internacional', 'draft');

  -- El mismo mecanismo de claims usado por la suite V1.
  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal2')::text, true);

  select * into v_row from public.nox_catalog_cambiar_estado(v_slug,'published');
  if v_row.status <> 'published' then raise exception 'No publico'; end if;

  select * into v_row from public.nox_catalog_cambiar_estado(v_slug,'hidden');
  if v_row.status <> 'hidden' then raise exception 'No oculto'; end if;

  select * into v_row from public.nox_catalog_cambiar_estado(v_slug,'archived');
  if v_row.status <> 'archived' then raise exception 'No archivo'; end if;

  begin
    perform public.nox_catalog_cambiar_estado(v_slug,'published');
    raise exception 'Permite publicar archivado';
  exception when sqlstate 'NX422' then null;
  end;

  select * into v_row from public.nox_catalog_cambiar_estado(v_slug,'draft');
  if v_row.status <> 'draft' then raise exception 'No restauro a borrador'; end if;

  select count(*) into v_count from public.catalog_change_log where product_slug=v_slug;
  if v_count <> 4 then raise exception 'Auditoria incorrecta: %',v_count; end if;

  perform public.nox_catalog_cambiar_estado(v_slug,'draft');
  select count(*) into v_count from public.catalog_change_log where product_slug=v_slug;
  if v_count <> 4 then raise exception 'Reintento duplico auditoria'; end if;

  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal1')::text, true);
  begin
    perform public.nox_catalog_cambiar_estado(v_slug,'published');
    raise exception 'Permite escribir sin MFA';
  exception when sqlstate 'NX401' then null;
  end;

  raise notice 'OK: publicar, ocultar, archivar, restaurar, MFA, auditoria e idempotencia';
end
$test$;
rollback;
