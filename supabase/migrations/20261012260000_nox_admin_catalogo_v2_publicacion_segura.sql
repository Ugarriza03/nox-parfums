-- V2: impedir republicar una ficha oculta con una revisión pendiente.
-- Ocultar o archivar siguen permitidos por seguridad operativa.
-- Una revisión solo puede aprobarse sobre una ficha publicada y sin cambios de base.
begin;
create or replace function public.nox_catalog_verificar_publicacion()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 if new.status = 'published' and old.status <> 'published' then
  if exists(select 1 from public.catalog_revisions where product_slug=new.slug) then
   raise exception 'Existe una revisión pendiente: resolverla antes de republicar.'
    using errcode='NX409';
  end if;
 end if;
 return new;
end;
$$;
revoke all on function public.nox_catalog_verificar_publicacion() from public,anon,authenticated;
create trigger nox_catalog_verificar_publicacion
 before update of status on public.catalog_products
 for each row execute function public.nox_catalog_verificar_publicacion();
commit;
