-- NOX V2: impide asociar a una fragancia imágenes ajenas o inexistentes.
-- Valida en la base incluso si se invoca un RPC directamente.
-- Las portadas locales del catálogo original permanecen fuera de Storage (image_path NULL).
begin;

create function public.nox_catalog_validar_imagen(p_slug text, p_path text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select p_path is null or (
    p_path ~ ('^covers/' || p_slug || '/[a-z0-9-]+[.](webp|png|jpg|jpeg)$')
    and exists (
      select 1 from storage.objects
      where bucket_id = 'nox-catalog-covers' and name = p_path
    )
  );
$$;
revoke all on function public.nox_catalog_validar_imagen(text,text) from public, anon, authenticated;

create function public.nox_catalog_check_imagen_producto()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if not public.nox_catalog_validar_imagen(new.slug, new.image_path) then
    raise exception 'Imagen inexistente o perteneciente a otra fragancia.'
      using errcode = 'NX422';
  end if;
  return new;
end;
$$;
revoke all on function public.nox_catalog_check_imagen_producto() from public, anon, authenticated;

create trigger nox_catalog_check_imagen_producto
before insert or update of image_path, slug on public.catalog_products
for each row execute function public.nox_catalog_check_imagen_producto();

create function public.nox_catalog_check_imagen_revision()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if not public.nox_catalog_validar_imagen(
    new.product_slug, new.proposed_data->>'image_path'
  ) then
    raise exception 'La revisión contiene una imagen inexistente o ajena.'
      using errcode = 'NX422';
  end if;
  return new;
end;
$$;
revoke all on function public.nox_catalog_check_imagen_revision() from public, anon, authenticated;

create trigger nox_catalog_check_imagen_revision
before insert or update of proposed_data, product_slug on public.catalog_revisions
for each row execute function public.nox_catalog_check_imagen_revision();

commit;
