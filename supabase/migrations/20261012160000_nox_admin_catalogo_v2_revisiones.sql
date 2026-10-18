-- NOX Admin V2 - fase 2d: revision de cambios sobre fichas publicadas.
-- No ejecutar en produccion. Requiere las migraciones previas.
begin;

create table public.catalog_revisions (
  product_slug text primary key references public.catalog_products(slug) on delete restrict,
  proposed_data jsonb not null check (jsonb_typeof(proposed_data) = 'object'),
  proposed_by uuid not null references public.admin_users(user_id) on delete restrict,
  proposed_at timestamptz not null default now(),
  base_updated_at timestamptz not null
);

revoke all on public.catalog_revisions from public, anon, authenticated;
grant select on public.catalog_revisions to authenticated;
alter table public.catalog_revisions enable row level security;
create policy "admins read catalog revisions" on public.catalog_revisions
  for select to authenticated using (public.is_admin());

create function public.nox_catalog_guardar_revision(
  p_slug text,
  p_house text,
  p_fragrance_name text,
  p_gender text,
  p_universe text,
  p_origin text,
  p_olfactory jsonb,
  p_image_path text
)
returns public.catalog_revisions
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_actual public.catalog_products;
  v_revision public.catalog_revisions;
  v_datos jsonb;
begin
  if v_uid is null or not public.is_admin()
     or coalesce(auth.jwt()->>'aal','') <> 'aal2' then
    raise exception 'No autorizado: se requiere MFA.' using errcode = 'NX401';
  end if;
  if p_slug is null or char_length(p_slug) > 120
     or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Slug invalido.' using errcode = 'NX422';
  end if;
  if p_house is null or char_length(btrim(p_house)) not between 1 and 160
     or p_fragrance_name is null
     or char_length(btrim(p_fragrance_name)) not between 1 and 180
     or p_gender is null or p_gender not in ('masculino','femenino','unisex')
     or p_universe is null or p_universe not in ('disenador','nicho','arabe','pendiente')
     or p_origin is null or p_origin not in ('internacional','arabe')
     or (p_olfactory is not null and jsonb_typeof(p_olfactory) <> 'object')
     or (p_image_path is not null and
         (char_length(p_image_path) not between 1 and 500
          or p_image_path ~ '(^/|\\.\\.|[[:cntrl:]])')) then
    raise exception 'Datos invalidos.' using errcode = 'NX422';
  end if;

  select * into v_actual from public.catalog_products
    where slug=p_slug for update;
  if not found then
    raise exception 'Fragancia inexistente.' using errcode = 'NX404';
  end if;
  if v_actual.status <> 'published' then
    raise exception 'Solo fichas publicadas admiten revisiones.'
      using errcode = 'NX409';
  end if;

  v_datos := jsonb_build_object(
    'house',btrim(p_house),'fragrance_name',btrim(p_fragrance_name),
    'gender',p_gender,'universe',p_universe,'origin',p_origin,
    'olfactory',p_olfactory,'image_path',p_image_path);

  insert into public.catalog_revisions
    (product_slug,proposed_data,proposed_by,base_updated_at)
  values (p_slug,v_datos,v_uid,v_actual.updated_at)
  on conflict (product_slug) do update
    set proposed_data=excluded.proposed_data,
        proposed_by=excluded.proposed_by,
        proposed_at=now(),
        base_updated_at=excluded.base_updated_at
  returning * into v_revision;

  return v_revision;
end;
$$;

create function public.nox_catalog_publicar_revision(p_slug text)
returns public.catalog_products
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_anterior public.catalog_products;
  v_nuevo public.catalog_products;
  v_revision public.catalog_revisions;
  v_data jsonb;
begin
  if v_uid is null or not public.is_admin()
     or coalesce(auth.jwt()->>'aal','') <> 'aal2' then
    raise exception 'No autorizado: se requiere MFA.' using errcode = 'NX401';
  end if;
  if p_slug is null or char_length(p_slug) > 120
     or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Slug invalido.' using errcode = 'NX422';
  end if;

  select * into v_anterior from public.catalog_products
    where slug=p_slug for update;
  if not found then
    raise exception 'Fragancia inexistente.' using errcode = 'NX404';
  end if;
  if v_anterior.status <> 'published' then
    raise exception 'La fragancia ya no esta publicada.'
      using errcode = 'NX409';
  end if;
  select * into v_revision from public.catalog_revisions
    where product_slug=p_slug for update;
  if not found then
    raise exception 'No existe revision pendiente.'
      using errcode = 'NX404';
  end if;
  if v_revision.base_updated_at <> v_anterior.updated_at then
    raise exception 'Revision desactualizada: volver a revisar los cambios.'
      using errcode = 'NX409';
  end if;
  v_data := v_revision.proposed_data;

  update public.catalog_products set
    house=v_data->>'house',
    fragrance_name=v_data->>'fragrance_name',
    gender=v_data->>'gender',
    universe=v_data->>'universe',
    origin=v_data->>'origin',
    olfactory=v_data->'olfactory',
    image_path=v_data->>'image_path',
    updated_at=now(),
    updated_by=v_uid
  where slug=p_slug
  returning * into v_nuevo;

  insert into public.catalog_change_log
    (product_slug,actor_id,action,before_data,after_data)
  values
    (p_slug,v_uid,'update',to_jsonb(v_anterior),to_jsonb(v_nuevo));

  delete from public.catalog_revisions where product_slug=p_slug;
  return v_nuevo;
end;
$$;

revoke all on function public.nox_catalog_guardar_revision(
  text,text,text,text,text,text,jsonb,text) from public,anon;
grant execute on function public.nox_catalog_guardar_revision(
  text,text,text,text,text,text,jsonb,text) to authenticated;
revoke all on function public.nox_catalog_publicar_revision(text) from public,anon;
grant execute on function public.nox_catalog_publicar_revision(text) to authenticated;
commit;
