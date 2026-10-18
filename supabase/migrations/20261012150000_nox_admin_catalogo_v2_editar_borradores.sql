-- NOX Admin V2 - fase 2c: editar solamente borradores.
-- Las fichas publicadas requieren versionado/revision posterior; nunca edicion directa.
begin;
create function public.nox_catalog_editar_borrador(
  p_slug text,
  p_house text,
  p_fragrance_name text,
  p_gender text,
  p_universe text,
  p_origin text,
  p_olfactory jsonb,
  p_image_path text
)
returns public.catalog_products
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_anterior public.catalog_products;
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
     or p_origin is null or p_origin not in ('internacional','arabe')
     or (p_olfactory is not null and jsonb_typeof(p_olfactory) <> 'object') then
    raise exception 'Datos de fragancia invalidos.' using errcode = 'NX422';
  end if;

  select * into v_anterior
  from public.catalog_products
  where slug = p_slug
  for update;
  if not found then
    raise exception 'Fragancia inexistente.' using errcode = 'NX404';
  end if;
  if v_anterior.status <> 'draft' then
    raise exception 'Solo se editan borradores. Para publicados, usar revision.'
      using errcode = 'NX409';
  end if;

  -- Comparacion de campos de negocio: sin cambio, no generar auditoria duplicada.
  if (v_anterior.house, v_anterior.fragrance_name, v_anterior.gender,
      v_anterior.universe, v_anterior.origin, v_anterior.olfactory,
      v_anterior.image_path)
     is not distinct from
     (btrim(p_house), btrim(p_fragrance_name), p_gender,
      p_universe, p_origin, p_olfactory, p_image_path) then
    return v_anterior;
  end if;

  update public.catalog_products
  set house = btrim(p_house),
      fragrance_name = btrim(p_fragrance_name),
      gender = p_gender,
      universe = p_universe,
      origin = p_origin,
      olfactory = p_olfactory,
      image_path = p_image_path,
      updated_at = now(),
      updated_by = v_uid
  where slug = p_slug
  returning * into v_nuevo;

  insert into public.catalog_change_log
    (product_slug, actor_id, action, before_data, after_data)
  values
    (p_slug, v_uid, 'update', to_jsonb(v_anterior), to_jsonb(v_nuevo));

  return v_nuevo;
end;
$$;
revoke all on function public.nox_catalog_editar_borrador(
  text,text,text,text,text,text,jsonb,text
) from public, anon;
grant execute on function public.nox_catalog_editar_borrador(
  text,text,text,text,text,text,jsonb,text
) to authenticated;
commit;
