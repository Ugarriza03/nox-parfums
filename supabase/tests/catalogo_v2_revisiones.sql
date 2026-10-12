-- NOX V2: revision pendiente no altera ficha publicada hasta aprobarla.
begin;
do $test$
declare
  v_slug text := 'nox-v2-test-revision';
  v_actor uuid := '00000000-0000-0000-0000-00000000000a';
  v_row public.catalog_products;
  v_count integer;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal2')::text,true);

  perform public.nox_catalog_crear_borrador(
    v_slug,'NOX QA','Original','unisex','nicho','internacional');
  perform public.nox_catalog_cambiar_estado(v_slug,'published');

  perform public.nox_catalog_guardar_revision(
    v_slug,'NOX QA','Corregido','femenino','disenador','internacional',
    '{"topNotes":["rosa"]}'::jsonb,null);

  select * into v_row from public.catalog_products where slug=v_slug;
  if v_row.fragrance_name <> 'Original' then
    raise exception 'Guardar revision modifico la ficha publicada';
  end if;

  perform public.nox_catalog_publicar_revision(v_slug);
  select * into v_row from public.catalog_products where slug=v_slug;
  if v_row.fragrance_name <> 'Corregido' or v_row.gender <> 'femenino'
     or v_row.status <> 'published' then
    raise exception 'Publicar revision no aplico datos correctamente';
  end if;

  select count(*) into v_count from public.catalog_revisions
    where product_slug=v_slug;
  if v_count <> 0 then raise exception 'Revision no consumida'; end if;

  select count(*) into v_count from public.catalog_change_log
    where product_slug=v_slug and action='update';
  if v_count <> 1 then raise exception 'Auditoria de revision incorrecta'; end if;

  begin
    perform public.nox_catalog_publicar_revision(v_slug);
    raise exception 'Permite publicar revision consumida';
  exception when sqlstate 'NX404' then null;
  end;

  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal1')::text,true);
  begin
    perform public.nox_catalog_guardar_revision(
      v_slug,'NOX QA','Sin MFA','unisex','nicho','internacional',null,null);
    raise exception 'Permite guardar revision sin MFA';
  exception when sqlstate 'NX401' then null;
  end;

  raise notice 'OK: revision aislada, publicacion explicita, MFA y auditoria';
end
$test$;
rollback;
