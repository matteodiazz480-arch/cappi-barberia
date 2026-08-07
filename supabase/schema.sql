-- ============================================================================
-- Cappi Barbería — esquema de base de datos para Supabase (Postgres)
-- Ejecutar en el SQL Editor de Supabase, en orden, una sola vez.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- admin_users: perfiles de administrador, vinculados 1:1 a auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- clients: clientes de la barbería
-- ----------------------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists clients_phone_idx on public.clients (phone);
create index if not exists clients_name_idx on public.clients (lower(first_name || ' ' || last_name));

-- ----------------------------------------------------------------------------
-- services: catálogo de servicios
-- ----------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- business_hours: horario semanal (una fila por día 0=domingo..6=sábado)
-- ----------------------------------------------------------------------------
create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  weekday integer not null unique check (weekday between 0 and 6),
  is_open boolean not null default true,
  open_time time,
  close_time time,
  slot_interval_minutes integer not null default 30
);

-- ----------------------------------------------------------------------------
-- blocked_slots: bloqueos puntuales (vacaciones, días cerrados, horarios especiales)
-- ----------------------------------------------------------------------------
create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  is_full_day boolean not null default false,
  created_at timestamptz not null default now(),
  constraint blocked_slots_range check (ends_at > starts_at)
);

create index if not exists blocked_slots_range_idx on public.blocked_slots (starts_at, ends_at);

-- ----------------------------------------------------------------------------
-- appointments: turnos reservados
-- ----------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmado', 'cancelado', 'completado', 'no_asistio')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_range check (ends_at > starts_at)
);

create index if not exists appointments_starts_at_idx on public.appointments (starts_at);
create index if not exists appointments_client_idx on public.appointments (client_id);
create index if not exists appointments_status_idx on public.appointments (status);

-- Evita doble reserva del mismo horario exacto de inicio mientras el turno está activo.
create unique index if not exists appointments_active_slot_uidx
  on public.appointments (starts_at)
  where status not in ('cancelado', 'no_asistio');

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- business_settings: configuración general (fila única)
-- ----------------------------------------------------------------------------
create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Cappi Barbería',
  description text,
  logo_url text,
  whatsapp text,
  phone text,
  email text,
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  address text,
  updated_at timestamptz not null default now()
);

-- Agrega las columnas si la tabla ya existía de una corrida anterior del script.
alter table public.business_settings add column if not exists phone text;
alter table public.business_settings add column if not exists email text;

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Datos iniciales
-- ============================================================================

insert into public.business_settings (business_name, description, whatsapp, phone, email, instagram_url, tiktok_url, youtube_url, address)
select 'Cappi Barbería',
       'Cortes clásicos, modernos y personalizados en un ambiente relajado.',
       '5493804152182',
       '+54 9 380 415-2182',
       'cappilr5@gmail.com',
       'https://www.instagram.com/cappi_______/',
       'https://www.tiktok.com/@cappi_______/',
       'https://www.youtube.com/@CappiYutu',
       'Dirección a confirmar'
where not exists (select 1 from public.business_settings);

-- Si la fila ya existía de una corrida anterior (sin estos campos), la completa.
update public.business_settings
set whatsapp = coalesce(whatsapp, '5493804152182'),
    phone = coalesce(phone, '+54 9 380 415-2182'),
    email = coalesce(email, 'cappilr5@gmail.com')
where whatsapp is null or phone is null or email is null;

insert into public.business_hours (weekday, is_open, open_time, close_time, slot_interval_minutes)
select w.weekday, w.is_open, '09:00'::time, '19:00'::time, 30
from (values (0, false), (1, true), (2, true), (3, true), (4, true), (5, true), (6, true)) as w(weekday, is_open)
where not exists (select 1 from public.business_hours where business_hours.weekday = w.weekday);

-- Servicios de ejemplo. Las imágenes están en frontend/public/images/services/
-- — para reemplazarlas alcanza con pisar esos archivos o cambiar la URL acá
-- o desde el panel admin, sin tocar código.
insert into public.services (name, description, price, duration_minutes, image_url, is_active, sort_order)
select v.name, v.description, v.price, v.duration_minutes, v.image_url, true, v.sort_order
from (values
  (
    'Corte clásico',
    'Corte prolijo y atemporal, adaptado a la forma de tu rostro. Incluye lavado y styling final.',
    8000::numeric,
    30,
    '/images/services/corte-clasico.jpg',
    1
  ),
  (
    'Fade / Degradado',
    'Degradado moderno con transición perfecta, a tu gusto: bajo, medio o alto. Terminación a navaja.',
    9500::numeric,
    45,
    '/images/services/fade-degradado.jpg',
    2
  ),
  (
    'Arreglo de barba',
    'Perfilado y arreglo de barba con navaja, toalla caliente y productos de cuidado premium.',
    6000::numeric,
    25,
    '/images/services/arreglo-barba.jpg',
    3
  )
) as v(name, description, price, duration_minutes, image_url, sort_order)
where not exists (select 1 from public.services);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.admin_users enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.business_settings enable row level security;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$ language sql stable security definer set search_path = public;

-- admin_users: solo el propio admin puede ver su fila; escritura solo vía service role.
create policy "admin_users_select_self" on public.admin_users
  for select using (auth.uid() = user_id);

-- services: lectura pública de servicios activos; gestión completa solo admin.
create policy "services_public_read_active" on public.services
  for select using (is_active = true or public.is_admin());

create policy "services_admin_write" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- business_hours: lectura pública, escritura solo admin.
create policy "business_hours_public_read" on public.business_hours
  for select using (true);

create policy "business_hours_admin_write" on public.business_hours
  for all using (public.is_admin()) with check (public.is_admin());

-- blocked_slots: lectura pública (para calcular disponibilidad), escritura solo admin.
create policy "blocked_slots_public_read" on public.blocked_slots
  for select using (true);

create policy "blocked_slots_admin_write" on public.blocked_slots
  for all using (public.is_admin()) with check (public.is_admin());

-- business_settings: lectura pública, escritura solo admin.
create policy "business_settings_public_read" on public.business_settings
  for select using (true);

create policy "business_settings_admin_write" on public.business_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- clients: tabla completamente privada. El público nunca lee ni escribe esta tabla
-- de forma directa — la creación de clientes ocurre dentro de la función
-- public.create_appointment() (security definer, ver más abajo).
create policy "clients_admin_read" on public.clients
  for select using (public.is_admin());

create policy "clients_admin_write" on public.clients
  for update using (public.is_admin()) with check (public.is_admin());

create policy "clients_admin_delete" on public.clients
  for delete using (public.is_admin());

-- appointments: tabla completamente privada por la misma razón. El público
-- reserva a través de public.create_appointment(), nunca con INSERT directo.
create policy "appointments_admin_read" on public.appointments
  for select using (public.is_admin());

create policy "appointments_admin_write" on public.appointments
  for update using (public.is_admin()) with check (public.is_admin());

create policy "appointments_admin_delete" on public.appointments
  for delete using (public.is_admin());

-- ============================================================================
-- Realtime: habilitar la tabla appointments para notificaciones en vivo del admin
-- ============================================================================
alter publication supabase_realtime add table public.appointments;

-- ============================================================================
-- RPCs públicas (security definer): único camino de escritura/lectura para
-- clientes anónimos. Exponen sólo lo estrictamente necesario para reservar.
-- ============================================================================

-- Devuelve los horarios de inicio (HH:mm) ya ocupados por turnos activos
-- en un día dado. No expone ningún dato de clientes.
create or replace function public.get_booked_slots(p_date date)
returns table (start_time text) as $$
  select to_char(a.starts_at, 'HH24:MI') as start_time
  from public.appointments a
  where a.starts_at::date = p_date
    and a.status not in ('cancelado', 'no_asistio');
$$ language sql stable security definer set search_path = public;

grant execute on function public.get_booked_slots(date) to anon, authenticated;

-- Devuelve los rangos bloqueados (vacaciones, cierres, horarios especiales)
-- que se solapan con un día dado. Público porque es información operativa,
-- no de clientes.
create or replace function public.get_blocked_ranges(p_date date)
returns table (starts_at timestamptz, ends_at timestamptz, is_full_day boolean) as $$
  select b.starts_at, b.ends_at, b.is_full_day
  from public.blocked_slots b
  where b.starts_at::date <= p_date and b.ends_at::date >= p_date;
$$ language sql stable security definer set search_path = public;

grant execute on function public.get_blocked_ranges(date) to anon, authenticated;

-- Crea (o reutiliza) un cliente por teléfono y reserva un turno de forma
-- atómica. Es la ÚNICA forma en que un usuario anónimo puede generar
-- filas en clients/appointments. Revalida disponibilidad server-side para
-- evitar condiciones de carrera con la unique index de appointments.
create or replace function public.create_appointment(
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_notes text default null
)
returns table (appointment_id uuid, starts_at timestamptz, ends_at timestamptz, service_name text)
as $$
declare
  v_client_id uuid;
  v_duration integer;
  v_ends_at timestamptz;
  v_service_name text;
  v_appointment_id uuid;
begin
  select duration_minutes, name into v_duration, v_service_name
  from public.services
  where id = p_service_id and is_active = true;

  if v_duration is null then
    raise exception 'El servicio seleccionado no existe o no está disponible.';
  end if;

  if p_starts_at < now() then
    raise exception 'No se puede reservar un turno en el pasado.';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_duration);

  if exists (
    select 1 from public.blocked_slots b
    where b.starts_at < v_ends_at and b.ends_at > p_starts_at
  ) then
    raise exception 'El horario seleccionado ya no está disponible.';
  end if;

  select id into v_client_id
  from public.clients
  where phone = p_phone
  order by created_at desc
  limit 1;

  if v_client_id is null then
    insert into public.clients (first_name, last_name, phone)
    values (p_first_name, p_last_name, p_phone)
    returning id into v_client_id;
  else
    update public.clients
    set first_name = p_first_name, last_name = p_last_name
    where id = v_client_id;
  end if;

  insert into public.appointments (client_id, service_id, starts_at, ends_at, status, notes)
  values (v_client_id, p_service_id, p_starts_at, v_ends_at, 'pendiente', p_notes)
  returning id into v_appointment_id;

  return query select v_appointment_id, p_starts_at, v_ends_at, v_service_name;
exception
  when unique_violation then
    raise exception 'Ese horario acaba de ser reservado por otra persona. Elegí otro, por favor.';
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.create_appointment(text, text, text, uuid, timestamptz, text) to anon, authenticated;

-- ============================================================================
-- Usuario administrador por defecto
-- ============================================================================
-- Credenciales de acceso al panel (/admin/login):
--   Email:    admin@cappibarberia.com
--   Password: Cappi2026!
--
-- IMPORTANTE: cambiá esta contraseña después del primer ingreso
-- (Supabase Dashboard → Authentication → Users → el usuario → "Reset password",
-- o agregando una pantalla de cambio de contraseña más adelante).
--
-- Este bloque inserta directamente en el esquema `auth` de Supabase, que es
-- una API interna no garantizada entre versiones. Si falla (por ejemplo por
-- un cambio de esquema de Supabase), no rompe el resto del script — creá el
-- usuario a mano desde Authentication → Add User con el mismo email/password
-- y después corré únicamente el `insert into public.admin_users` de abajo.
do $$
declare
  v_user_id uuid;
  v_email text := 'admin@cappibarberia.com';
  v_password text := 'Cappi2026!';
begin
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated', v_email,
      crypt(v_password, gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}',
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user_id, v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email', now(), now(), now()
    );
  end if;

  insert into public.admin_users (user_id, full_name, role)
  values (v_user_id, 'Santiago Castro', 'admin')
  on conflict (user_id) do nothing;
exception
  when others then
    raise notice 'No se pudo crear el usuario automáticamente (%). Creálo a mano desde Authentication → Add User con email % y después corré el insert en public.admin_users.', sqlerrm, v_email;
end $$;
