begin;
do $$
declare
 v_slug text := 'qa-descartar-revision';
 v_actor uuid := '00000000-0000-0000-0000-00000000000a';
 v_before jsonb;
 v_after jsonb;
 v_count integer;
begin
 perform set_config('request.jwt.claims',json_build_object(
  'sub',v_actor,'role','authenticated','aal','aal2')::text,true);
 perform public.nox_catalog_crear_borrador(v_slug,'QA','Original',
  'unisex','nicho','internacional');
 perform public.nox_catalog_cambiar_estado(v_slug,'published');
 perform public.nox_catalog_guardar_revision(v_slug,'QA','Propuesta',
  'unisex','nicho','internacional',null,null);
 perform public.nox_catalog_cambiar_estado(v_slug,'hidden');
 select to_jsonb(p) into v_before from public.catalog_products p where slug=v_slug;
 perform public.nox_catalog_descartar_revision(v_slug);
 select to_jsonb(p) into v_after from public.catalog_products p where slug=v_slug;
 if v_before is distinct from v_after then
  raise exception 'Descartar modificó la ficha original';
 end if;
 if exists(select 1 from public.catalog_revisions where product_slug=v_slug) then
  raise exception 'La revisión no se descartó';
 end if;
 select count(*) into v_count from public.catalog_change_log
  where product_slug=v_slug and action='discard_revision';
 if v_count<>1 then raise exception 'Falta auditoría del descarte'; end if;
 perform public.nox_catalog_cambiar_estado(v_slug,'published');
 if (select status from public.catalog_products where slug=v_slug)<>'published' then
  raise exception 'No se pudo republicar tras descartar';
 end if;
 begin
  perform public.nox_catalog_descartar_revision(v_slug);
  raise exception 'Permitió descartar una revisión inexistente';
 exception when sqlstate 'NX404' then null;
 end;
 perform public.nox_catalog_guardar_revision(v_slug,'QA','Otra propuesta',
  'unisex','nicho','internacional',null,null);
 perform set_config('request.jwt.claims',json_build_object(
  'sub',v_actor,'role','authenticated','aal','aal1')::text,true);
 begin
  perform public.nox_catalog_descartar_revision(v_slug);
  raise exception 'Permitió descartar sin MFA';
 exception when sqlstate 'NX401' then null;
 end;
 raise notice 'OK: descarte auditado, ficha intacta, republicación y MFA';
end $$;
rollback;
