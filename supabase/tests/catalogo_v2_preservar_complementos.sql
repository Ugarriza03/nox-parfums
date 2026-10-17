-- End-to-end regression: editorial-only, mixed order, explicit approval and MFA.
begin;
do $$
declare
 v_slug text:='qa-preservar-complementos';
 v_actor uuid:='00000000-0000-0000-0000-00000000000a';
 v_product public.catalog_products;
 v_revision public.catalog_revisions;
begin
 perform set_config('request.jwt.claims',json_build_object(
  'sub',v_actor,'role','authenticated','aal','aal2')::text,true);
 perform public.nox_catalog_crear_borrador(v_slug,'Casa QA','Original',
  'unisex','nicho','internacional');
 perform public.nox_catalog_guardar_complementos(v_slug,'Descripción original',
  'Inspiración original','pendiente',null);
 perform public.nox_catalog_cambiar_estado(v_slug,'published');
 perform public.nox_catalog_guardar_complementos(v_slug,'Descripción revisada',
  'Inspiración revisada','verificado','{"verified":false}'::jsonb);
 select * into v_product from public.catalog_products where slug=v_slug;
 if v_product.description <> 'Descripción original' then
  raise exception 'La edición editorial alteró la ficha publicada';
 end if;
 perform public.nox_catalog_guardar_revision(v_slug,'Casa QA','Nuevo nombre',
  'femenino','disenador','internacional',null,null);
 select * into v_revision from public.catalog_revisions where product_slug=v_slug;
 if v_revision.proposed_data->>'description'<>'Descripción revisada'
  or v_revision.proposed_data->>'inspired_label'<>'Inspiración revisada'
  or v_revision.proposed_data->>'fragrance_name'<>'Nuevo nombre' then
  raise exception 'Se perdió información editorial pendiente';
 end if;
 perform public.nox_catalog_publicar_revision(v_slug);
 select * into v_product from public.catalog_products where slug=v_slug;
 if v_product.description<>'Descripción revisada'
  or v_product.inspired_label<>'Inspiración revisada'
  or v_product.data_status<>'verificado'
  or v_product.performance->>'verified'<>'false'
  or v_product.fragrance_name<>'Nuevo nombre' then
  raise exception 'La aprobación no aplicó todos los campos';
 end if;
 -- Reverse order: base revision followed by editorial changes.
 perform public.nox_catalog_guardar_revision(v_slug,'Casa QA','Otro nombre',
  'unisex','nicho','internacional',null,null);
 perform public.nox_catalog_guardar_complementos(v_slug,'Descripción final',
  'Inspiración final','pendiente',null);
 select * into v_revision from public.catalog_revisions where product_slug=v_slug;
 if v_revision.proposed_data->>'fragrance_name'<>'Otro nombre'
  or v_revision.proposed_data->>'description'<>'Descripción final' then
  raise exception 'Los complementos sobrescribieron cambios base';
 end if;
 perform public.nox_catalog_publicar_revision(v_slug);
 select * into v_product from public.catalog_products where slug=v_slug;
 if v_product.fragrance_name<>'Otro nombre'
  or v_product.description<>'Descripción final' then
  raise exception 'La aprobación inversa falló';
 end if;
 perform set_config('request.jwt.claims',json_build_object(
  'sub',v_actor,'role','authenticated','aal','aal1')::text,true);
 begin
  perform public.nox_catalog_guardar_complementos(v_slug,'Sin MFA',null,null,null);
  raise exception 'Se permitió editar sin MFA';
 exception when sqlstate 'NX401' then null;
 end;
 raise notice 'OK: complementos preservados, ambos órdenes, aprobación y MFA';
end $$;
rollback;
