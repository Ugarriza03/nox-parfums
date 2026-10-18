-- Regresión: una ficha oculta con revisión pendiente no puede republicarse
-- silenciosamente, y el inventario permanece inalterado.
begin;
do $$
declare
 v_slug text := 'qa-publicacion-pendiente';
 v_actor uuid := '00000000-0000-0000-0000-00000000000a';
 v_n integer;
 v_stock_before integer;
 v_stock_after integer;
begin
 perform set_config('request.jwt.claims',json_build_object(
  'sub',v_actor,'role','authenticated','aal','aal2')::text,true);
 select count(*) into v_stock_before from public.inventory_movements;
 perform public.nox_catalog_crear_borrador(v_slug,'QA','Original',
  'unisex','nicho','internacional');
 perform public.nox_catalog_cambiar_estado(v_slug,'published');
 perform public.nox_catalog_guardar_revision(v_slug,'QA','Revisión pendiente',
  'unisex','nicho','internacional',null,null);
 perform public.nox_catalog_cambiar_estado(v_slug,'hidden');
 begin
  perform public.nox_catalog_cambiar_estado(v_slug,'published');
  raise exception 'Se permitió republicar una revisión pendiente';
 exception when sqlstate 'NX409' then null;
 end;
 if (select status from public.catalog_products where slug=v_slug)<>'hidden' then
  raise exception 'Cambió el estado pese al rechazo';
 end if;
 select count(*) into v_n from public.catalog_change_log
  where product_slug=v_slug and action='publish';
 if v_n<>1 then raise exception 'Se registró publicación duplicada'; end if;
 select count(*) into v_stock_after from public.inventory_movements;
 if v_stock_before<>v_stock_after then
  raise exception 'La publicación alteró movimientos de inventario';
 end if;
 perform public.nox_catalog_cambiar_estado(v_slug,'archived');
 if (select status from public.catalog_products where slug=v_slug)<>'archived' then
  raise exception 'No se pudo archivar una ficha oculta';
 end if;
 raise notice 'OK: publicación bloqueada con revisión pendiente, auditoría y stock intactos';
end $$;
rollback;
