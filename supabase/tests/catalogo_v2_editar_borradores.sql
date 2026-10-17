-- NOX Admin V2: editar borrador sin afectar productos publicados.
begin;
do $test$
declare
  v_actor uuid := '00000000-0000-0000-0000-00000000000a';
  v_slug text := 'nox-v2-test-editar';
  v_row public.catalog_products;
  v_count integer;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal2')::text, true);

  perform public.nox_catalog_crear_borrador(
    v_slug,'NOX QA','Original','unisex','nicho','internacional');

  select * into v_row from public.nox_catalog_editar_borrador(
    v_slug,'NOX QA','Nombre corregido','femenino','disenador','internacional',
    '{"topNotes":["rosa"]}'::jsonb,null);
  if v_row.fragrance_name <> 'Nombre corregido'
     or v_row.gender <> 'femenino' or v_row.status <> 'draft' then
    raise exception 'Edicion de borrador incorrecta';
  end if;

  perform public.nox_catalog_editar_borrador(
    v_slug,'NOX QA','Nombre corregido','femenino','disenador','internacional',
    '{"topNotes":["rosa"]}'::jsonb,null);

  select count(*) into v_count from public.catalog_change_log
  where product_slug=v_slug and action='update';
  if v_count <> 1 then raise exception 'Edicion identica duplico auditoria'; end if;

  perform public.nox_catalog_cambiar_estado(v_slug,'published');
  begin
    perform public.nox_catalog_editar_borrador(
      v_slug,'NOX QA','Cambio no aprobado','unisex','nicho','internacional',null,null);
    raise exception 'Se permitio editar publicado';
  exception when sqlstate 'NX409' then null;
  end;

  select fragrance_name into v_row.fragrance_name
  from public.catalog_products where slug=v_slug;
  if v_row.fragrance_name <> 'Nombre corregido' then
    raise exception 'Se altero producto publicado';
  end if;

  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal1')::text, true);
  begin
    perform public.nox_catalog_editar_borrador(
      v_slug,'NOX QA','Sin MFA','unisex','nicho','internacional',null,null);
    raise exception 'Se permitio editar sin MFA';
  exception when sqlstate 'NX401' then null;
  end;
  raise notice 'OK: editar borrador, proteger publicado, MFA y auditoria';
end
$test$;
rollback;
