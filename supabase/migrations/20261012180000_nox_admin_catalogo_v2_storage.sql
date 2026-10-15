-- NOX Admin V2: bucket PRIVADO para futuras portadas administradas.
-- No migra ni elimina portadas locales. NO ejecutar en producción sin aprobación.
-- storage.* es provisto por Supabase; el runner CI crea un stub aislado.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('nox-catalog-covers', 'nox-catalog-covers', false, 5242880,
        array['image/webp','image/png','image/jpeg'])
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/webp','image/png','image/jpeg'];

-- Se usa la API de Storage con sesión del administrador (MFA aal2).
-- Ningún acceso anónimo; las escrituras quedan limitadas a un prefijo fijo.
create policy "nox catalog covers admin read"
on storage.objects for select to authenticated
using (bucket_id = 'nox-catalog-covers'
  and public.is_admin()
  and coalesce(auth.jwt()->>'aal','') = 'aal2');

create policy "nox catalog covers admin insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'nox-catalog-covers'
  and name ~ '^covers/[a-z0-9]+(-[a-z0-9]+)*/[a-z0-9-]+\\.(webp|png|jpg|jpeg)$'
  and public.is_admin()
  and coalesce(auth.jwt()->>'aal','') = 'aal2');

create policy "nox catalog covers admin update"
on storage.objects for update to authenticated
using (bucket_id = 'nox-catalog-covers'
  and public.is_admin()
  and coalesce(auth.jwt()->>'aal','') = 'aal2')
with check (bucket_id = 'nox-catalog-covers'
  and name ~ '^covers/[a-z0-9]+(-[a-z0-9]+)*/[a-z0-9-]+\\.(webp|png|jpg|jpeg)$'
  and public.is_admin()
  and coalesce(auth.jwt()->>'aal','') = 'aal2');

create policy "nox catalog covers admin delete"
on storage.objects for delete to authenticated
using (bucket_id = 'nox-catalog-covers'
  and public.is_admin()
  and coalesce(auth.jwt()->>'aal','') = 'aal2');

commit;
