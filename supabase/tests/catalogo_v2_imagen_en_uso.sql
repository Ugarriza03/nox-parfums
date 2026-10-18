-- Referencias: portada vigente y propuesta pendiente.
begin;
insert into storage.objects(bucket_id,name) values
 ('nox-catalog-covers','covers/qa-uso/actual.webp'),
 ('nox-catalog-covers','covers/qa-uso/pendiente.webp'),
 ('nox-catalog-covers','covers/qa-uso/sin-uso.webp');
insert into public.catalog_products
 (slug,house,fragrance_name,gender,universe,origin,status,image_path)
values ('qa-uso','QA','Uso','unisex','nicho','internacional','published',
 'covers/qa-uso/actual.webp');
insert into public.catalog_revisions
 (product_slug,proposed_data,proposed_by,base_updated_at)
values ('qa-uso','{"image_path":"covers/qa-uso/pendiente.webp"}'::jsonb,
 '00000000-0000-0000-0000-00000000000a',now());
select set_config('request.jwt.claims',
 '{"sub":"00000000-0000-0000-0000-00000000000a","aal":"aal2","role":"authenticated"}',true);
set local role authenticated;
do $$
begin
 if not public.nox_catalog_imagen_en_uso('covers/qa-uso/actual.webp')
    or not public.nox_catalog_imagen_en_uso('covers/qa-uso/pendiente.webp')
    or public.nox_catalog_imagen_en_uso('covers/qa-uso/sin-uso.webp') then
   raise exception 'Clasificación incorrecta de referencias';
 end if;
 begin
  perform public.nox_catalog_imagen_en_uso('covers/qa-uso/../otro.webp');
  raise exception 'Ruta peligrosa aceptada';
 exception when sqlstate 'NX422' then null;
 end;
end $$;
select set_config('request.jwt.claims',
 '{"sub":"00000000-0000-0000-0000-00000000000a","aal":"aal1","role":"authenticated"}',true);
do $$
begin
 begin
  perform public.nox_catalog_imagen_en_uso('covers/qa-uso/actual.webp');
  raise exception 'Consulta sin MFA aceptada';
 exception when sqlstate 'NX401' then null;
 end;
end $$;
rollback;
