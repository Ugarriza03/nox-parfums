-- NOX Admin V2 - fase 2b: alta de fragancias como borrador.
-- Desarrollo solamente; no aplicar en Supabase de produccion.
begin;

create function public.nox_catalog_crear_borrador(
  p_slug text,
  p_house text,
  p_fragrance_name text,
  p_gender text,
  p_universe text,
  p_origin text,
  p_olfactory jsonb default null,
  p_image_path text default null
)
returns public.catalog_products
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_nuevo public.catalog_products;
begin
  if v_uid is null or not public.is_admin()
     or coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'No autorizado: se requiere administrador con MFA.'
      using errcode = 'NX401';
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
     or p_origin is null or p_origin not in ('internacional','arabe') then
    raise exception 'Datos de fragancia invalidos.' using errcode = 'NX422';
  end if;
  if p_olfactory is not null and jsonb_typeof(p_olfactory) <> 'object' then
    raise exception 'Perfil olfativo invalido.' using errcode = 'NX422';
  end if;

  -- Las restricciones de la tabla validan tambien la ruta de imagen.
  insert into public.catalog_products
    (slug, house, fragrance_name, gender, universe, origin, olfactory,
     image_path, status, created_by, updated_by)
  values
    (p_slug, btrim(p_house), btrim(p_fragrance_name), p_gender, p_universe,
     p_origin, p_olfactory, p_image_path, 'draft', v_uid, v_uid)
  on conflict (slug) do nothing
  returning * into v_nuevo;

  if not found then
    raise exception 'Ya existe una fragancia con ese slug.'
      using errcode = 'NX409';
  end if;

  insert into public.catalog_change_log
    (product_slug, actor_id, action, before_data, after_data)
  values
    (v_nuevo.slug, v_uid, 'create', null, to_jsonb(v_nuevo));

  return v_nuevo;
end;
$$;

revoke all on function public.nox_catalog_crear_borrador(
  text,text,text,text,text,text,jsonb,text
) from public, anon;
grant execute on function public.nox_catalog_crear_borrador(
  text,text,text,text,text,text,jsonb,text
) to authenticated;
commit;
