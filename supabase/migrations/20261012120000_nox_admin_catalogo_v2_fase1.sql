-- NOX Admin V2 - fase 1: esquema del catalogo editable.
-- NO EJECUTAR EN PRODUCCION hasta validar la semilla 233/233 y el plan de reversión.
-- Independiente de la migracion de inventario V1; no altera sus tablas ni funciones.
begin;

create table public.catalog_products (
  slug text primary key
    check (char_length(slug) between 1 and 120
       and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  house text not null check (char_length(btrim(house)) between 1 and 160),
  fragrance_name text not null check (char_length(btrim(fragrance_name)) between 1 and 180),
  gender text not null check (gender in ('masculino','femenino','unisex')),
  universe text not null check (universe in ('disenador','nicho','arabe','pendiente')),
  origin text not null,
  olfactory jsonb,
  image_path text,
  status text not null default 'draft'
    check (status in ('draft','published','hidden','archived')),
  created_at timestamptz not null default now(),
  created_by uuid references public.admin_users(user_id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users(user_id) on delete restrict,
  constraint catalog_image_path_safe check (
    image_path is null or (
      char_length(image_path) between 1 and 500
      and image_path !~ '(^/|\\.\\.|[[:cntrl:]])'
    )
  )
);

create index catalog_products_status_idx on public.catalog_products(status);
create index catalog_products_house_idx on public.catalog_products(house);

-- Auditoria inmutable, separada del historial de inventario.
create table public.catalog_change_log (
  id bigint generated always as identity primary key,
  product_slug text not null references public.catalog_products(slug) on delete restrict,
  actor_id uuid not null references public.admin_users(user_id) on delete restrict,
  action text not null check (action in ('create','update','publish','hide','archive','restore')),
  before_data jsonb,
  after_data jsonb not null,
  created_at timestamptz not null default now()
);

create function public.nox_catalog_log_immutable()
returns trigger language plpgsql set search_path = ''
as $$
begin
  raise exception 'El historial del catalogo no se puede modificar ni eliminar.'
    using errcode = 'NX403';
end;
$$;
create trigger catalog_log_no_update
  before update or delete on public.catalog_change_log
  for each row execute function public.nox_catalog_log_immutable();
create trigger catalog_log_no_truncate
  before truncate on public.catalog_change_log
  for each statement execute function public.nox_catalog_log_immutable();

-- Fase 1: solo lectura administrativa. Escritura por RPC auditada en fase 2.
revoke all on public.catalog_products, public.catalog_change_log
  from public, anon, authenticated;
revoke all on sequence public.catalog_change_log_id_seq
  from public, anon, authenticated;
grant select on public.catalog_products, public.catalog_change_log to authenticated;

alter table public.catalog_products enable row level security;
alter table public.catalog_change_log enable row level security;

create policy "admins read catalog" on public.catalog_products
  for select to authenticated using (public.is_admin());
create policy "admins read catalog audit" on public.catalog_change_log
  for select to authenticated using (public.is_admin());

revoke execute on function public.nox_catalog_log_immutable()
  from public, anon, authenticated;

-- La tienda publica sigue leyendo archivos TypeScript hasta la migracion validada.
-- No se crea politica anon ni se insertan los 233 productos en esta fase.
commit;
