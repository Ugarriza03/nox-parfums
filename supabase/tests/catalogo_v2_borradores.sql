-- NOX Admin V2: alta de borradores con MFA, validacion y auditoria.
begin;
do $test$
declare
  v_slug text := 'nox-v2-test-nuevo';
  v_actor uuid := '00000000-0000-0000-0000-00000000000a';
  v_row public.catalog_products;
  v_count integer;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal2')::text, true);

  select * into v_row from public.nox_catalog_crear_borrador(
    v_slug,'NOX QA','Fragancia nueva','unisex','nicho','internacional',
    '{"topNotes":["citrico"]}'::jsonb,null);
  if v_row.status <> 'draft' or v_row.created_by <> v_actor then
    raise exception 'El alta no creo un borrador atribuible al admin';
  end if;

  select count(*) into v_count from public.catalog_change_log
  where product_slug=v_slug and action='create'
    and before_data is null and after_data->>'status'='draft';
  if v_count <> 1 then raise exception 'Auditoria de alta incorrecta'; end if;

  begin
    perform public.nox_catalog_crear_borrador(
      v_slug,'NOX QA','Duplicada','unisex','nicho','internacional');
    raise exception 'Acepto slug duplicado';
  exception when sqlstate 'NX409' then null;
  end;

  begin
    perform public.nox_catalog_crear_borrador(
      'nox-v2-test-invalido','NOX QA','Invalida','otro','nicho','internacional');
    raise exception 'Acepto genero invalido';
  exception when sqlstate 'NX422' then null;
  end;

  perform set_config('request.jwt.claims',
    json_build_object('sub',v_actor,'role','authenticated','aal','aal1')::text, true);
  begin
    perform public.nox_catalog_crear_borrador(
      'nox-v2-test-sin-mfa','NOX QA','Sin MFA','unisex','nicho','internacional');
    raise exception 'Acepto alta sin MFA';
  exception when sqlstate 'NX401' then null;
  end;

  select count(*) into v_count from public.catalog_products
  where slug like 'nox-v2-test-%';
  if v_count <> 1 then raise exception 'Se guardaron altas rechazadas'; end if;

  raise notice 'OK: borrador, MFA, slug unico, validacion y auditoria';
end
$test$;
rollback;
