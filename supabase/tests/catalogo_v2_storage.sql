-- Aislamiento del bucket privado y verificación de políticas. Sin persistencia.
begin;
do $$
declare
  n integer;
begin
  if not exists (select 1 from storage.buckets where id='nox-catalog-covers'
     and public=false and file_size_limit=5242880) then
    raise exception 'Bucket NOX ausente o público';
  end if;
  select count(*) into n from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname like 'nox catalog covers admin %';
  if n <> 2 then raise exception 'Se esperaban 2 políticas de Storage (solo lectura e inserción); hay %', n; end if;
  if exists (select 1 from pg_policies where schemaname='storage' and tablename='objects'
    and policyname like 'nox catalog covers admin %' and cmd in ('UPDATE','DELETE','ALL')) then
    raise exception 'Las portadas permiten modificación o borrado directo';
  end if;
  if not (select relrowsecurity from pg_class where oid='storage.objects'::regclass) then
    raise exception 'Storage objects sin RLS';
  end if;
end $$;

-- La lectura anónima del bucket NOX debe devolver cero filas.
insert into storage.objects (bucket_id,name)
values ('nox-catalog-covers','covers/qa-fragancia/principal.webp');
set local role anon;
do $$
begin
  if exists(select 1 from storage.objects where bucket_id='nox-catalog-covers') then
    raise exception 'Se filtraron portadas privadas a anon';
  end if;
end $$;
reset role;
rollback;
