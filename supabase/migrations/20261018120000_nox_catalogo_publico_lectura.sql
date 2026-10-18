-- NOX Admin V2: lectura pública de fichas publicadas, sin modificar RLS.
-- NO aplicar en producción sin autorización expresa.
begin;
create function public.nox_catalogo_publico()
returns table (
  slug text, house text, fragrance_name text, gender text,
  universe text, origin text, status text, olfactory jsonb,
  image_path text, inspired_label text, data_status text, performance jsonb
)
language sql stable security definer set search_path = ''
as $$
  select p.slug, p.house, p.fragrance_name, p.gender, p.universe, p.origin,
         p.status, p.olfactory, p.image_path, p.inspired_label, p.data_status,
         p.performance
  from public.catalog_products p
  where p.status = 'published'
  order by p.slug
  limit 2000;
$$;
comment on function public.nox_catalogo_publico() is
  'Lectura pública de fichas publicadas; no incluye borradores ni datos internos.';
revoke all on function public.nox_catalogo_publico() from public;
grant execute on function public.nox_catalogo_publico() to anon, authenticated;
commit;
