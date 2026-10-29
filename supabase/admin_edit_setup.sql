-- ==============================================================================
-- BITSZONE: Configuración de Administrador para Edición Global y Realtime
-- Ejecuta este script UNA SOLA VEZ en el SQL Editor de tu Dashboard de Supabase.
-- ==============================================================================

-- 1. Crear el bucket de almacenamiento público 'covers' para portadas de canciones y álbumes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'covers',
  'covers',
  true,
  10485760, -- 10MB límite por imagen
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. Políticas de seguridad (RLS) para el bucket 'covers'
-- Cualquier usuario (incluso no autenticado) puede ver las portadas públicas
drop policy if exists "Portadas públicas visibles para todos" on storage.objects;
create policy "Portadas públicas visibles para todos"
on storage.objects for select
using (bucket_id = 'covers');

-- Permitir a usuarios autenticados (Admin) subir portadas al bucket 'covers'
drop policy if exists "Subir portadas en covers" on storage.objects;
create policy "Subir portadas en covers"
on storage.objects for insert
with check (bucket_id = 'covers' and auth.role() = 'authenticated');

-- Permitir a usuarios autenticados (Admin) actualizar portadas existentes
drop policy if exists "Actualizar portadas en covers" on storage.objects;
create policy "Actualizar portadas en covers"
on storage.objects for update
using (bucket_id = 'covers' and auth.role() = 'authenticated');

-- 3. Permitir a usuarios autenticados (Admin) actualizar títulos, artistas y portadas en 'tracks'
drop policy if exists "Permitir actualizar tracks a usuarios autenticados" on public.tracks;
create policy "Permitir actualizar tracks a usuarios autenticados"
on public.tracks for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- 4. Crear tabla 'app_config' para textos de botones y personalizaciones globales
create table if not exists public.app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

-- Visible para todos los usuarios (normales y anónimos)
drop policy if exists "Configuracion visible para todos" on public.app_config;
create policy "Configuracion visible para todos" on public.app_config
  for select using (true);

-- Editable por usuarios autenticados (Admin)
drop policy if exists "Configuracion editable por autenticados" on public.app_config;
create policy "Configuracion editable por autenticados" on public.app_config
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 5. Habilitar Supabase Realtime para que los cambios se transmitan instantáneamente
do $$
begin
  alter publication supabase_realtime add table public.tracks;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.app_config;
exception when duplicate_object then null;
end $$;
