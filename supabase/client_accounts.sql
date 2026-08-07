-- ============================================================================
-- Cappi Barbería — cuentas de cliente (teléfono + contraseña, sin email)
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de schema.sql, una sola vez.
-- Es aditivo e idempotente: no borra ni modifica datos existentes.
-- ============================================================================

-- Los clientes NO usan Supabase Auth (que es email/OTP-céntrico): se
-- implementa un login propio con teléfono + contraseña vía funciones RPC
-- `security definer`, con sesiones basadas en un token opaco guardado en
-- `client_sessions`. Cada función valida el token/contraseña internamente
-- antes de tocar cualquier dato — es el único camino de acceso, las tablas
-- `clients`/`appointments` siguen sin políticas RLS públicas.

alter table public.clients add column if not exists password_hash text;

-- Necesario para poder buscar/loguear de forma confiable por teléfono.
-- (Verificado sin duplicados antes de aplicar este script.)
create unique index if not exists clients_phone_unique_idx on public.clients (phone);

create table if not exists public.client_sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists client_sessions_token_idx on public.client_sessions (token);
create index if not exists client_sessions_client_idx on public.client_sessions (client_id);

alter table public.client_sessions enable row level security;
-- Sin políticas públicas a propósito: solo se accede vía las funciones de
-- abajo (security definer), nunca directo desde el cliente anónimo.

-- ----------------------------------------------------------------------------
-- Helpers internos
-- ----------------------------------------------------------------------------

create or replace function public._client_id_from_token(p_token text)
returns uuid as $$
  select client_id
  from public.client_sessions
  where token = p_token and expires_at > now();
$$ language sql stable security definer set search_path = public, extensions;

create or replace function public._new_session_token()
returns text as $$
  select encode(gen_random_bytes(32), 'hex');
$$ language sql volatile security definer set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- Registro
-- ----------------------------------------------------------------------------
create or replace function public.client_register(
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_password text
)
returns table (token text, client_id uuid, first_name text, last_name text, phone text)
as $$
declare
  v_phone text := trim(p_phone);
  v_client_id uuid;
  v_token text;
begin
  if length(trim(p_first_name)) = 0 or length(trim(p_last_name)) = 0 then
    raise exception 'Nombre y apellido son obligatorios.';
  end if;
  if length(v_phone) < 8 then
    raise exception 'Ingresá un teléfono válido.';
  end if;
  if length(p_password) < 6 then
    raise exception 'La contraseña debe tener al menos 6 caracteres.';
  end if;

  select c.id into v_client_id from public.clients c where c.phone = v_phone;

  if v_client_id is not null then
    if exists (select 1 from public.clients where id = v_client_id and password_hash is not null) then
      raise exception 'Ese teléfono ya tiene una cuenta registrada. Iniciá sesión.';
    end if;
    -- Cliente existente (creado por una reserva anónima previa): lo
    -- "upgradeamos" a cuenta registrada en vez de duplicarlo.
    update public.clients
    set first_name = trim(p_first_name),
        last_name = trim(p_last_name),
        password_hash = crypt(p_password, gen_salt('bf'))
    where id = v_client_id;
  else
    insert into public.clients (first_name, last_name, phone, password_hash)
    values (trim(p_first_name), trim(p_last_name), v_phone, crypt(p_password, gen_salt('bf')))
    returning id into v_client_id;
  end if;

  v_token := public._new_session_token();
  insert into public.client_sessions (client_id, token, expires_at)
  values (v_client_id, v_token, now() + interval '30 days');

  return query
    select v_token, c.id, c.first_name, c.last_name, c.phone
    from public.clients c
    where c.id = v_client_id;
end;
$$ language plpgsql security definer set search_path = public, extensions;

grant execute on function public.client_register(text, text, text, text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Login
-- ----------------------------------------------------------------------------
create or replace function public.client_login(p_phone text, p_password text)
returns table (token text, client_id uuid, first_name text, last_name text, phone text)
as $$
declare
  v_client record;
  v_token text;
begin
  select c.id, c.password_hash into v_client
  from public.clients c
  where c.phone = trim(p_phone) and c.password_hash is not null;

  if v_client.id is null or v_client.password_hash <> crypt(p_password, v_client.password_hash) then
    raise exception 'Teléfono o contraseña incorrectos.';
  end if;

  v_token := public._new_session_token();
  insert into public.client_sessions (client_id, token, expires_at)
  values (v_client.id, v_token, now() + interval '30 days');

  return query
    select v_token, c.id, c.first_name, c.last_name, c.phone
    from public.clients c
    where c.id = v_client.id;
end;
$$ language plpgsql security definer set search_path = public, extensions;

grant execute on function public.client_login(text, text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Logout
-- ----------------------------------------------------------------------------
create or replace function public.client_logout(p_token text)
returns void as $$
  delete from public.client_sessions where token = p_token;
$$ language sql security definer set search_path = public, extensions;

grant execute on function public.client_logout(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Perfil (restaurar sesión al cargar la app)
-- ----------------------------------------------------------------------------
create or replace function public.client_get_profile(p_token text)
returns table (client_id uuid, first_name text, last_name text, phone text)
as $$
  select c.id, c.first_name, c.last_name, c.phone
  from public.clients c
  where c.id = public._client_id_from_token(p_token);
$$ language sql stable security definer set search_path = public, extensions;

grant execute on function public.client_get_profile(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Mis turnos (vigentes + historial)
-- ----------------------------------------------------------------------------
create or replace function public.client_get_appointments(p_token text)
returns table (
  id uuid,
  service_name text,
  service_price numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  notes text
)
as $$
  select a.id, s.name, s.price, a.starts_at, a.ends_at, a.status, a.notes
  from public.appointments a
  join public.services s on s.id = a.service_id
  where a.client_id = public._client_id_from_token(p_token)
  order by a.starts_at desc;
$$ language sql stable security definer set search_path = public, extensions;

grant execute on function public.client_get_appointments(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Cancelar turno (solo propio, y con más de 24hs de anticipación)
-- ----------------------------------------------------------------------------
create or replace function public.client_cancel_appointment(p_token text, p_appointment_id uuid)
returns void as $$
declare
  v_client_id uuid := public._client_id_from_token(p_token);
  v_appointment record;
begin
  if v_client_id is null then
    raise exception 'Sesión inválida o vencida. Volvé a iniciar sesión.';
  end if;

  select id, client_id, starts_at, status into v_appointment
  from public.appointments
  where id = p_appointment_id;

  if v_appointment.id is null or v_appointment.client_id <> v_client_id then
    raise exception 'Ese turno no existe o no te pertenece.';
  end if;

  if v_appointment.status in ('cancelado', 'completado') then
    raise exception 'Ese turno ya no se puede cancelar.';
  end if;

  if v_appointment.starts_at < now() + interval '24 hours' then
    raise exception 'Solo se puede cancelar con más de 24hs de anticipación. Contactanos directamente.';
  end if;

  update public.appointments set status = 'cancelado' where id = p_appointment_id;
end;
$$ language plpgsql security definer set search_path = public, extensions;

grant execute on function public.client_cancel_appointment(text, uuid) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Editar perfil (nombre y apellido)
-- ----------------------------------------------------------------------------
create or replace function public.client_update_profile(p_token text, p_first_name text, p_last_name text)
returns table (client_id uuid, first_name text, last_name text, phone text)
as $$
declare
  v_client_id uuid := public._client_id_from_token(p_token);
begin
  if v_client_id is null then
    raise exception 'Sesión inválida o vencida. Volvé a iniciar sesión.';
  end if;
  if length(trim(p_first_name)) = 0 or length(trim(p_last_name)) = 0 then
    raise exception 'Nombre y apellido son obligatorios.';
  end if;

  update public.clients
  set first_name = trim(p_first_name), last_name = trim(p_last_name)
  where id = v_client_id;

  return query
    select c.id, c.first_name, c.last_name, c.phone
    from public.clients c
    where c.id = v_client_id;
end;
$$ language plpgsql security definer set search_path = public, extensions;

grant execute on function public.client_update_profile(text, text, text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Cambiar contraseña
-- ----------------------------------------------------------------------------
create or replace function public.client_change_password(
  p_token text,
  p_current_password text,
  p_new_password text
)
returns void as $$
declare
  v_client_id uuid := public._client_id_from_token(p_token);
  v_hash text;
begin
  if v_client_id is null then
    raise exception 'Sesión inválida o vencida. Volvé a iniciar sesión.';
  end if;

  select password_hash into v_hash from public.clients where id = v_client_id;

  if v_hash is null or v_hash <> crypt(p_current_password, v_hash) then
    raise exception 'La contraseña actual no es correcta.';
  end if;
  if length(p_new_password) < 6 then
    raise exception 'La nueva contraseña debe tener al menos 6 caracteres.';
  end if;

  update public.clients set password_hash = crypt(p_new_password, gen_salt('bf')) where id = v_client_id;
end;
$$ language plpgsql security definer set search_path = public, extensions;

grant execute on function public.client_change_password(text, text, text) to anon, authenticated;
