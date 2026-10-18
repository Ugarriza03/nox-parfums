-- NOX Admin V2: impedir accesos directos y revisiones obsoletas.
-- Se ejecuta solo en PostgreSQL descartable.
begin;
do $test$
declare
  v_actor uuid := '00000000-0000-0000-0000-00000000000a';
  v_slug text := 'nox-v2-test-seguridad';
  v_row public.catalog_products;
  v_count integer;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal2')::text,true);

  perform public.nox_catalog_crear_borrador(
    v_slug,'NOX QA','Visible original','unisex','nicho','internacional');
  perform public.nox_catalog_cambiar_estado(v_slug,'published');
  perform public.nox_catalog_guardar_revision(
    v_slug,'NOX QA','Revision pendiente','unisex','nicho','internacional',null,null);

  -- Cambiar el estado invalida la posibilidad de publicar una revision.
  perform public.nox_catalog_cambiar_estado(v_slug,'hidden');
  begin
    perform public.nox_catalog_publicar_revision(v_slug);
    raise exception 'Se publico revision de producto oculto';
  exception when sqlstate 'NX409' then null;
  end;

  select * into v_row from public.catalog_products where slug=v_slug;
  if v_row.fragrance_name <> 'Visible original' or v_row.status <> 'hidden' then
    raise exception 'Revision obsoleta modifico ficha oculta';
  end if;

  -- El usuario sin MFA no puede aprobar revisiones.
  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal1')::text,true);
  begin
    perform public.nox_catalog_publicar_revision(v_slug);
    raise exception 'Se aprobo revision sin MFA';
  exception when sqlstate 'NX401' then null;
  end;

  -- No hay privilegios de escritura directa ni acceso anonimo.
  if has_table_privilege('authenticated','public.catalog_products','INSERT')
     or has_table_privilege('authenticated','public.catalog_products','UPDATE')
     or has_table_privilege('authenticated','public.catalog_products','DELETE')
     or has_table_privilege('authenticated','public.catalog_revisions','INSERT')
     or has_table_privilege('authenticated','public.catalog_revisions','UPDATE')
     or has_table_privilege('authenticated','public.catalog_revisions','DELETE')
     or has_table_privilege('anon','public.catalog_products','SELECT')
     or has_table_privilege('anon','public.catalog_revisions','SELECT') then
    raise exception 'Permisos de tablas demasiado amplios';
  end if;

  if has_function_privilege('anon',
       'public.nox_catalog_crear_borrador(text,text,text,text,text,text,jsonb,text)','EXECUTE')
     or has_function_privilege('anon',
       'public.nox_catalog_editar_borrador(text,text,text,text,text,text,jsonb,text)','EXECUTE')
     or has_function_privilege('anon',
       'public.nox_catalog_guardar_revision(text,text,text,text,text,text,jsonb,text)','EXECUTE')
     or has_function_privilege('anon',
       'public.nox_catalog_publicar_revision(text)','EXECUTE')
     or has_function_privilege('anon',
       'public.nox_catalog_cambiar_estado(text,text)','EXECUTE') then
    raise exception 'Funciones administrativas accesibles a anon';
  end if;

  select count(*) into v_count from public.catalog_change_log
    where product_slug=v_slug and action='update';
  if v_count <> 0 then raise exception 'Se audito una edicion nunca aprobada'; end if;

  raise notice 'OK: revision obsoleta, MFA, permisos y anon';
end
$test$;
rollback;
