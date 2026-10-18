-- NOX V2: consulta segura de referencias antes de eliminar imágenes privadas.
-- No permite borrar archivos desde SQL; la eliminación se hace con Storage API
-- sólo después de comprobar referencias y antigüedad.
begin;
create function public.nox_catalog_imagen_en_uso(p_path text)
returns boolean language plpgsql stable security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin()
     or coalesce(auth.jwt()->>'aal','') <> 'aal2' then
    raise exception 'Se requiere administrador con MFA.' using errcode = 'NX401';
  end if;
  if p_path is null or p_path !~ '^covers/[a-z0-9]+(-[a-z0-9]+)*/[a-z0-9-]+[.](webp|png|jpg|jpeg)$' then
    raise exception 'Ruta inválida.' using errcode = 'NX422';
  end if;
  return exists(select 1 from public.catalog_products where image_path=p_path)
    or exists(select 1 from public.catalog_revisions
      where proposed_data->>'image_path'=p_path);
end;
$$;
revoke all on function public.nox_catalog_imagen_en_uso(text) from public, anon;
grant execute on function public.nox_catalog_imagen_en_uso(text) to authenticated;
commit;
