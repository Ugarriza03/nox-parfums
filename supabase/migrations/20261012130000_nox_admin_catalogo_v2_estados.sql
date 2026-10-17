-- NOX Admin V2 - fase 2a: cambios de visibilidad auditados.
-- SOLO desarrollo / PostgreSQL desechable. No aplicar en produccion.
-- Requiere 20261012120000_nox_admin_catalogo_v2_fase1.sql.
begin;

create function public.nox_catalog_cambiar_estado(
  p_slug text,
  p_estado text
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
  v_accion text;
begin
  -- MFA AAL2 obligatorio incluso si la configuracion del usuario cambia.
  if v_uid is null or not public.is_admin()
     or coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'No autorizado: se requiere administrador con MFA.'
      using errcode = 'NX401';
  end if;

  if p_slug is null or char_length(p_slug) > 120
     or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Slug invalido.' using errcode = 'NX422';
  end if;

  if p_estado is null or p_estado not in ('draft','published','hidden','archived') then
    raise exception 'Estado invalido.' using errcode = 'NX422';
  end if;

  select * into v_anterior
  from public.catalog_products
  where slug = p_slug
  for update;

  if not found then
    raise exception 'Fragancia inexistente.' using errcode = 'NX404';
  end if;

  if v_anterior.status = p_estado then
    return v_anterior; -- Reintento sin cambios: no duplica auditoria.
  end if;

  if p_estado = 'published' then
    if v_anterior.status = 'archived' then
      raise exception 'Primero restaure el producto archivado.'
        using errcode = 'NX422';
    end if;
    if nullif(btrim(v_anterior.house), '') is null
       or nullif(btrim(v_anterior.fragrance_name), '') is null then
      raise exception 'No se puede publicar una ficha incompleta.'
        using errcode = 'NX422';
    end if;
    v_accion := 'publish';
  elsif p_estado = 'archived' then
    v_accion := 'archive';
  elsif v_anterior.status = 'archived' then
    -- Nunca restaura directo a publicado.
    if p_estado <> 'draft' and p_estado <> 'hidden' then
      raise exception 'Restauracion invalida.' using errcode = 'NX422';
    end if;
    v_accion := 'restore';
  elsif p_estado = 'hidden' then
    v_accion := 'hide';
  else
    -- Volver a borrador desde publicado/oculto requiere accion explicita.
    v_accion := 'update';
  end if;

  update public.catalog_products
     set status = p_estado, updated_at = now(), updated_by = v_uid
   where slug = p_slug
   returning * into v_nuevo;

  insert into public.catalog_change_log
    (product_slug, actor_id, action, before_data, after_data)
  values
    (p_slug, v_uid, v_accion, to_jsonb(v_anterior), to_jsonb(v_nuevo));

  return v_nuevo;
end;
$$;

revoke all on function public.nox_catalog_cambiar_estado(text,text)
  from public, anon;
grant execute on function public.nox_catalog_cambiar_estado(text,text)
  to authenticated;
commit;
