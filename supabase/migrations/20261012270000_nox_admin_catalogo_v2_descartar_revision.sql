begin;
alter table public.catalog_change_log drop constraint catalog_change_log_action_check;
alter table public.catalog_change_log add constraint catalog_change_log_action_check
 check (action in ('create','update','publish','hide','archive','restore','discard_revision'));

create function public.nox_catalog_descartar_revision(p_slug text)
returns void language plpgsql volatile security definer set search_path = ''
as $$
declare
 v_uid uuid := auth.uid();
 v_product public.catalog_products;
 v_revision public.catalog_revisions;
begin
 if v_uid is null or not public.is_admin() or coalesce(auth.jwt()->>'aal','') <> 'aal2' then
  raise exception 'Se requiere administrador con MFA.' using errcode='NX401';
 end if;
 if p_slug is null or length(p_slug)>120 or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
  raise exception 'Identificador inválido.' using errcode='NX422';
 end if;
 select * into v_product from public.catalog_products where slug=p_slug for update;
 if not found then raise exception 'Fragancia inexistente.' using errcode='NX404'; end if;
 select * into v_revision from public.catalog_revisions where product_slug=p_slug for update;
 if not found then raise exception 'No existe revisión pendiente.' using errcode='NX404'; end if;
 insert into public.catalog_change_log(product_slug,actor_id,action,before_data,after_data)
 values(p_slug,v_uid,'discard_revision',to_jsonb(v_revision),
  jsonb_build_object('product',to_jsonb(v_product),'discarded_revision',to_jsonb(v_revision)));
 delete from public.catalog_revisions where product_slug=p_slug;
end;
$$;
revoke all on function public.nox_catalog_descartar_revision(text) from public,anon;
grant execute on function public.nox_catalog_descartar_revision(text) to authenticated;
commit;
