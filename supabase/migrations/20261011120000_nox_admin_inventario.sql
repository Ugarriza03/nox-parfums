-- =============================================================================
-- NOX Admin V1 — inventario físico propio
-- =============================================================================
--
-- Qué crea:
--   · admin_users            administradores autorizados explícitamente
--   · inventory_settings     configuración global (umbral de stock bajo = 1)
--   · inventory_items        stock propio por producto (slug estable)
--   · inventory_movements    historial inmutable de movimientos
--   · is_admin(), admin_status(), registrar_movimiento()
--
-- Reglas de seguridad (privilegios mínimos):
--   · RLS activado en todas las tablas. Sólo hay políticas de LECTURA, y
--     sólo para administradores activos. No existe ninguna política de
--     INSERT/UPDATE/DELETE: un usuario autenticado no puede escribir directo.
--   · Se revocan explícitamente los privilegios por defecto que Supabase da a
--     `anon` y `authenticated` sobre tablas nuevas de `public`.
--   · La ÚNICA vía de escritura es registrar_movimiento(): SECURITY DEFINER,
--     search_path vacío, verifica is_admin() en cada llamada, bloquea la fila
--     del producto (FOR UPDATE) y es idempotente por request_id.
--   · Nadie puede convertirse en administrador desde la API: admin_users se
--     carga sólo desde el SQL Editor (rol postgres). Ver
--     supabase/admin/crear-administrador.sql.
--   · Con mfa_required = true (valor por defecto), is_admin() exige una
--     sesión aal2 (contraseña + TOTP). Esto también vale para llamadas
--     directas a la base, no sólo para la interfaz.
--
-- Semántica del inventario:
--   · Sin fila en inventory_items  = "sin inventario inicial registrado".
--   · Fila con stock = 0           = "stock confirmado en cero".
--   · La fila sólo se crea con un movimiento 'carga_inicial' explícito.
--   · ingreso / egreso: cantidad > 0 (delta).
--   · ajuste: cantidad = stock REAL CONTADO (valor absoluto), motivo obligatorio.
--   · El stock nunca puede quedar por debajo de cero.
--
-- El catálogo público NO se migra: el producto se identifica por su slug
-- estable (src/data/product-ids.ts), que el servidor de la app valida antes
-- de llamar a registrar_movimiento().
-- =============================================================================

begin;

-- ---------------------------------------------------------------- tipos

create type public.tipo_movimiento as enum ('carga_inicial', 'ingreso', 'egreso', 'ajuste');

-- --------------------------------------------------------- administradores

create table public.admin_users (
  user_id      uuid primary key references auth.users (id) on delete restrict,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  active       boolean not null default true,
  mfa_required boolean not null default true,
  created_at   timestamptz not null default now()
);

comment on table public.admin_users is
  'Administradores de NOX Admin. Se cargan sólo desde el SQL Editor. Para quitar acceso: active = false (el historial conserva al autor).';

-- ------------------------------------------------------------ configuración

create table public.inventory_settings (
  id                  boolean primary key default true check (id),
  low_stock_threshold integer not null default 1 check (low_stock_threshold >= 0),
  updated_at          timestamptz not null default now()
);

insert into public.inventory_settings (id, low_stock_threshold) values (true, 1);

-- --------------------------------------------------------------- inventario

create table public.inventory_items (
  product_slug   text primary key
                 check (char_length(product_slug) <= 120
                        and product_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  stock          integer not null check (stock >= 0),
  initialized_at timestamptz not null default now(),
  initialized_by uuid not null references public.admin_users (user_id) on delete restrict,
  updated_at     timestamptz not null default now(),
  updated_by     uuid not null references public.admin_users (user_id) on delete restrict
);

create table public.inventory_movements (
  id            bigint generated always as identity primary key,
  request_id    uuid not null unique,
  product_slug  text not null references public.inventory_items (product_slug) on delete restrict,
  movement_type public.tipo_movimiento not null,
  quantity      integer not null check (quantity >= 0 and quantity <= 100000),
  stock_before  integer not null check (stock_before >= 0),
  stock_after   integer not null check (stock_after >= 0),
  reason        text check (reason is null or char_length(reason) <= 500),
  created_at    timestamptz not null default now(),
  created_by    uuid not null references public.admin_users (user_id) on delete restrict,
  constraint movimiento_coherente check (
       (movement_type = 'carga_inicial' and stock_before = 0 and stock_after = quantity
          and reason is not null and char_length(btrim(reason)) >= 3)
    or (movement_type = 'ingreso' and quantity > 0 and stock_after = stock_before + quantity)
    or (movement_type = 'egreso'  and quantity > 0 and stock_after = stock_before - quantity)
    or (movement_type = 'ajuste'  and stock_after = quantity
          and reason is not null and char_length(btrim(reason)) >= 3)
  )
);

create index inventory_movements_producto_fecha on public.inventory_movements (product_slug, created_at desc);
create index inventory_movements_fecha on public.inventory_movements (created_at desc);
create index inventory_movements_tipo_fecha on public.inventory_movements (movement_type, created_at desc);

-- --------------------------------------------------- historial inmutable

create function public.nox_historial_inmutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'El historial de inventario no se puede modificar ni eliminar.'
    using errcode = 'NX403';
end;
$$;

create trigger inventory_movements_sin_update
  before update or delete on public.inventory_movements
  for each row execute function public.nox_historial_inmutable();

create trigger inventory_movements_sin_truncate
  before truncate on public.inventory_movements
  for each statement execute function public.nox_historial_inmutable();

-- ------------------------------------------------------------- funciones

-- ¿El usuario de la sesión es administrador activo con la seguridad exigida?
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
      and a.active
      and (not a.mfa_required or coalesce(auth.jwt() ->> 'aal', '') = 'aal2')
  );
$$;

-- Estado del usuario actual (sólo su propia fila). La usa la app para saber
-- si tiene que pedir el segundo factor antes de mostrar el panel.
create function public.admin_status()
returns table (is_admin_user boolean, active boolean, mfa_required boolean, display_name text, aal text)
language sql
stable
security definer
set search_path = ''
as $$
  select true, a.active, a.mfa_required, a.display_name, coalesce(auth.jwt() ->> 'aal', 'aal1')
  from public.admin_users a
  where a.user_id = auth.uid();
$$;

-- Única vía de escritura del inventario. Atómica e idempotente.
create function public.registrar_movimiento(
  p_request_id   uuid,
  p_product_slug text,
  p_tipo         public.tipo_movimiento,
  p_cantidad     integer,
  p_motivo       text default null
)
returns public.inventory_movements
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
  v_antes   integer;
  v_despues integer;
  v_mov    public.inventory_movements;
begin
  -- 1. Autorización, en cada llamada.
  if v_uid is null or not public.is_admin() then
    raise exception 'No autorizado.' using errcode = 'NX401';
  end if;

  -- 2. Validación de datos (la app también valida; esto es la última línea).
  if p_request_id is null then
    raise exception 'Falta request_id.' using errcode = 'NX422';
  end if;
  if p_product_slug is null
     or char_length(p_product_slug) > 120
     or p_product_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Identificador de producto inválido.' using errcode = 'NX422';
  end if;
  if p_tipo is null or p_cantidad is null then
    raise exception 'Faltan tipo o cantidad.' using errcode = 'NX422';
  end if;
  if p_cantidad < 0 or p_cantidad > 100000 then
    raise exception 'La cantidad debe estar entre 0 y 100000.' using errcode = 'NX422';
  end if;
  if p_tipo in ('ingreso', 'egreso') and p_cantidad = 0 then
    raise exception 'Ingresos y egresos requieren una cantidad mayor a cero.' using errcode = 'NX422';
  end if;
  if v_motivo is not null and char_length(v_motivo) > 500 then
    raise exception 'El motivo admite hasta 500 caracteres.' using errcode = 'NX422';
  end if;
  if p_tipo in ('ajuste', 'carga_inicial') and (v_motivo is null or char_length(v_motivo) < 3) then
    raise exception 'Este movimiento requiere un motivo.' using errcode = 'NX422';
  end if;

  -- 3. Idempotencia: el mismo request_id devuelve el mismo movimiento.
  select * into v_mov from public.inventory_movements m where m.request_id = p_request_id;
  if found then
    if v_mov.product_slug = p_product_slug and v_mov.movement_type = p_tipo
       and v_mov.quantity = p_cantidad and v_mov.created_by = v_uid then
      return v_mov;
    end if;
    raise exception 'request_id ya utilizado con otros datos.' using errcode = 'NX409';
  end if;

  -- 4. Movimiento.
  if p_tipo = 'carga_inicial' then
    insert into public.inventory_items (product_slug, stock, initialized_by, updated_by)
    values (p_product_slug, p_cantidad, v_uid, v_uid)
    on conflict (product_slug) do nothing;
    if not found then
      -- ¿Es un reenvío simultáneo de esta misma carga que ya se confirmó?
      select * into v_mov from public.inventory_movements m where m.request_id = p_request_id;
      if found and v_mov.product_slug = p_product_slug and v_mov.movement_type = p_tipo
         and v_mov.quantity = p_cantidad and v_mov.created_by = v_uid then
        return v_mov;
      end if;
      raise exception 'Este producto ya tiene inventario inicial registrado.' using errcode = 'NX409';
    end if;
    insert into public.inventory_movements
      (request_id, product_slug, movement_type, quantity, stock_before, stock_after, reason, created_by)
    values
      (p_request_id, p_product_slug, p_tipo, p_cantidad, 0, p_cantidad, v_motivo, v_uid)
    returning * into v_mov;
    return v_mov;
  end if;

  -- Bloqueo de la fila: las operaciones simultáneas sobre el mismo producto
  -- se serializan y cada una calcula sobre el stock real confirmado.
  select i.stock into v_antes
  from public.inventory_items i
  where i.product_slug = p_product_slug
  for update;
  if not found then
    raise exception 'El producto no tiene inventario inicial registrado.' using errcode = 'NX404';
  end if;

  v_despues := case p_tipo
    when 'ingreso' then v_antes + p_cantidad
    when 'egreso'  then v_antes - p_cantidad
    when 'ajuste'  then p_cantidad
  end;

  if v_despues < 0 then
    raise exception 'Stock insuficiente: hay % y se intentan descontar %.', v_antes, p_cantidad
      using errcode = 'NX423';
  end if;
  if v_despues > 1000000 then
    raise exception 'El stock resultante supera el máximo permitido.' using errcode = 'NX422';
  end if;

  begin
    update public.inventory_items
    set stock = v_despues, updated_at = now(), updated_by = v_uid
    where product_slug = p_product_slug;

    insert into public.inventory_movements
      (request_id, product_slug, movement_type, quantity, stock_before, stock_after, reason, created_by)
    values
      (p_request_id, p_product_slug, p_tipo, p_cantidad, v_antes, v_despues, v_motivo, v_uid)
    returning * into v_mov;
  exception when unique_violation then
    -- Otro envío con el mismo request_id ganó la carrera y ya se confirmó.
    -- El update de este bloque se deshizo; se devuelve el movimiento original
    -- si los datos coinciden.
    select * into v_mov from public.inventory_movements m where m.request_id = p_request_id;
    if found and v_mov.product_slug = p_product_slug and v_mov.movement_type = p_tipo
       and v_mov.quantity = p_cantidad and v_mov.created_by = v_uid then
      return v_mov;
    end if;
    raise exception 'request_id ya utilizado con otros datos.' using errcode = 'NX409';
  end;

  return v_mov;
end;
$$;

-- ---------------------------------------------------------- privilegios

-- Supabase otorga por defecto todo sobre tablas nuevas de `public` a anon y
-- authenticated. Se revoca y se concede sólo lectura a authenticated (que
-- además queda filtrada por RLS a administradores).
revoke all on table public.admin_users, public.inventory_settings,
                   public.inventory_items, public.inventory_movements
  from public, anon, authenticated;

grant select (user_id, display_name, active) on table public.admin_users to authenticated;
grant select on table public.inventory_settings, public.inventory_items,
                      public.inventory_movements to authenticated;

revoke all on sequence public.inventory_movements_id_seq from public, anon, authenticated;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.admin_status() from public, anon;
revoke execute on function public.registrar_movimiento(uuid, text, public.tipo_movimiento, integer, text) from public, anon;
revoke execute on function public.nox_historial_inmutable() from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_status() to authenticated;
grant execute on function public.registrar_movimiento(uuid, text, public.tipo_movimiento, integer, text) to authenticated;

-- ------------------------------------------------------------------ RLS

alter table public.admin_users         enable row level security;
alter table public.inventory_settings  enable row level security;
alter table public.inventory_items     enable row level security;
alter table public.inventory_movements enable row level security;

create policy "admins leen administradores" on public.admin_users
  for select to authenticated using (public.is_admin());

create policy "admins leen configuracion" on public.inventory_settings
  for select to authenticated using (public.is_admin());

create policy "admins leen inventario" on public.inventory_items
  for select to authenticated using (public.is_admin());

create policy "admins leen movimientos" on public.inventory_movements
  for select to authenticated using (public.is_admin());

-- Sin políticas de INSERT / UPDATE / DELETE: denegado para todos los roles de la API.

commit;
