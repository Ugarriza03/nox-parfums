-- Preserve complementary edits when the main editor replaces a pending revision.
-- Replaces the original RPC on the unmerged V2 development branch only.
begin;
create or replace function public.nox_catalog_guardar_revision(
  p_slug text,p_house text,p_fragrance_name text,p_gender text,
  p_universe text,p_origin text,p_olfactory jsonb,p_image_path text
) returns public.catalog_revisions
language plpgsql volatile security definer set search_path=''
as $$
declare
 v_uid uuid:=auth.uid();
 v_actual public.catalog_products;
 v_revision public.catalog_revisions;
 v_data jsonb;
 v_previous jsonb;
begin
 if v_uid is null or not public.is_admin()
    or coalesce(auth.jwt()->>'aal','') <> 'aal2' then
  raise exception 'Se requiere administrador con MFA.' using errcode='NX401';
 end if;
 if p_slug is null or length(p_slug)>120 or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  or p_house is null or length(btrim(p_house)) not between 1 and 160
  or p_fragrance_name is null or length(btrim(p_fragrance_name)) not between 1 and 180
  or p_gender is null or p_gender not in ('femenino','masculino','unisex')
  or p_universe is null or p_universe not in ('disenador','nicho','arabe','pendiente')
  or p_origin is null or p_origin not in ('internacional','arabe')
  or (p_olfactory is not null and jsonb_typeof(p_olfactory)<>'object')
  or (p_image_path is not null and
   (length(p_image_path) not between 1 and 500 or
    p_image_path ~ '(^/|\.\.|[[:cntrl:]])')) then
  raise exception 'Datos inválidos.' using errcode='NX422';
 end if;
 select * into v_actual from public.catalog_products where slug=p_slug for update;
 if not found then raise exception 'Fragancia inexistente.' using errcode='NX404'; end if;
 if v_actual.status<>'published' then
  raise exception 'Solo fichas publicadas admiten revisiones.' using errcode='NX409';
 end if;
 select * into v_revision from public.catalog_revisions where product_slug=p_slug for update;
 if found and v_revision.base_updated_at<>v_actual.updated_at then
  raise exception 'Revisión desactualizada.' using errcode='NX409';
 end if;
 v_previous:=coalesce(v_revision.proposed_data,'{}'::jsonb);
 v_data:=jsonb_build_object('house',btrim(p_house),
  'fragrance_name',btrim(p_fragrance_name),'gender',p_gender,
  'universe',p_universe,'origin',p_origin,
  'olfactory',p_olfactory,'image_path',p_image_path);
 -- Only preserve complementary keys already proposed. Never copy stale
 -- base fields from an earlier revision or invent empty editorial values.
 v_data:=v_data || (v_previous - 'house' - 'fragrance_name' - 'gender'
  - 'universe' - 'origin' - 'olfactory' - 'image_path');
 insert into public.catalog_revisions(product_slug,proposed_data,proposed_by,base_updated_at)
 values(p_slug,v_data,v_uid,v_actual.updated_at)
 on conflict(product_slug) do update
  set proposed_data=excluded.proposed_data,proposed_by=excluded.proposed_by,
      proposed_at=now(),base_updated_at=excluded.base_updated_at
 returning * into v_revision;
 return v_revision;
end;
$$;
commit;
