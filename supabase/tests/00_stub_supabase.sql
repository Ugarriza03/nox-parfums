-- =============================================================================
-- STUB MÍNIMO DE SUPABASE — SÓLO PARA PRUEBAS LOCALES Y DE CI
-- =============================================================================
-- NO es una migración y NUNCA se ejecuta en el proyecto real de Supabase.
-- Reproduce lo que la migración necesita del entorno de Supabase:
--   · roles anon / authenticated / service_role
--   · esquema auth con auth.users, auth.uid() y auth.jwt() (misma lógica que
--     Supabase: leen el claim de la request desde request.jwt.claims)
--   · los privilegios POR DEFECTO que Supabase concede sobre tablas nuevas de
--     public, para comprobar que la migración los revoca de verdad.
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end $$;

create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;

create table if not exists auth.users (
  id    uuid primary key,
  email text unique
);

create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')
  )::jsonb
$$;

create or replace function auth.uid() returns uuid
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

grant execute on function auth.jwt(), auth.uid() to anon, authenticated, service_role;

-- Privilegios por defecto equivalentes a los de un proyecto Supabase.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- Stub mínimo de Storage para ejecutar migraciones V2 en PostgreSQL descartable.
-- En Supabase real, storage.buckets y storage.objects ya existen.
create schema if not exists storage;
create table storage.buckets (
  id text primary key, name text not null, public boolean not null default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null references storage.buckets(id),
  name text not null
);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;
grant select on storage.buckets to anon, authenticated;
