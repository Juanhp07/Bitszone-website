-- ==============================================================================
-- BITSZONE: Sincronización de Usuarios, Perfiles y Telemetría en Vivo
-- Ejecuta este script UNA SOLA VEZ en el SQL Editor de tu Dashboard de Supabase:
-- https://supabase.com/dashboard/project/oxloqoggjldbjjratwoh/sql
-- ==============================================================================

-- 1. Asegurar que la tabla 'profiles' tenga las columnas necesarias
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  role text default 'user',
  created_at timestamptz default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists created_at timestamptz default now();

-- 2. Configurar Políticas de Seguridad (RLS) en 'profiles'
alter table public.profiles enable row level security;

-- Permitir a todos los usuarios autenticados (y anónimos) leer los perfiles públicos
drop policy if exists "Perfiles visibles para todos" on public.profiles;
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Permitir ver perfiles a todos" on public.profiles;
create policy "Perfiles visibles para todos"
on public.profiles for select
using (true);

-- Permitir a cada usuario insertar su propio perfil
drop policy if exists "Usuarios pueden insertar su propio perfil" on public.profiles;
create policy "Usuarios pueden insertar su propio perfil"
on public.profiles for insert
with check (auth.uid() = id);

-- Permitir a los usuarios actualizar su propio perfil
drop policy if exists "Usuarios pueden actualizar su propio perfil" on public.profiles;
create policy "Usuarios pueden actualizar su propio perfil"
on public.profiles for update
using (auth.uid() = id);

-- Permitir a usuarios autenticados (Admin / Superadmin) actualizar roles
drop policy if exists "Administradores pueden actualizar perfiles" on public.profiles;
create policy "Administradores pueden actualizar perfiles"
on public.profiles for update
using (auth.role() = 'authenticated');

-- 3. Trigger para auto-crear perfil cuando se registre un nuevo usuario en auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, avatar_url, role, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'usuario'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null),
    case 
      when lower(trim(coalesce(new.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin'
      else 'user'
    end,
    coalesce(new.created_at, now())
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, public.profiles.email),
    role = case 
      when lower(trim(coalesce(excluded.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin'
      else coalesce(public.profiles.role, excluded.role)
    end;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Sincronizar todos los usuarios existentes en auth.users hacia profiles
insert into public.profiles (id, email, username, avatar_url, role, created_at)
select 
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'user_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'usuario'),
  coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', null),
  case 
    when lower(trim(coalesce(u.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin'
    else coalesce(p.role, 'user')
  end,
  coalesce(u.created_at, now())
from auth.users u
left join public.profiles p on p.id = u.id
on conflict (id) do update set
  email = coalesce(excluded.email, public.profiles.email),
  role = case 
    when lower(trim(coalesce(excluded.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin'
    else coalesce(public.profiles.role, excluded.role)
  end;

-- 5. Función RPC get_dashboard_users para leer telemetría completa de usuarios
create or replace function public.get_dashboard_users()
returns table (
  id uuid,
  email text,
  username text,
  avatar_url text,
  role text,
  created_at timestamptz,
  last_sign_in_at timestamptz
) security definer
set search_path = public, auth
language plpgsql
as $$
begin
  return query
  select 
    u.id,
    u.email::text,
    coalesce(p.username, split_part(u.email, '@', 1), 'usuario'),
    p.avatar_url,
    coalesce(
      p.role, 
      case when lower(trim(coalesce(u.email, ''))) = 'bitszone.app@gmail.com' then 'superadmin' else 'user' end
    ),
    u.created_at,
    u.last_sign_in_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by coalesce(u.last_sign_in_at, u.created_at) desc;
end;
$$;

-- Otorgar permisos de ejecución para la función de telemetría
grant execute on function public.get_dashboard_users() to authenticated, anon;

-- 6. Habilitar Supabase Realtime para la tabla profiles
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;
