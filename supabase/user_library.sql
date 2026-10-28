-- Per-account library (playlists, favorites, downloads, licenses). One row per (user, key).
-- Run once in the Supabase SQL Editor.
create table if not exists public.user_library (
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_library enable row level security;

create policy "ver mi biblioteca" on public.user_library
  for select using (auth.uid() = user_id);
create policy "crear mi biblioteca" on public.user_library
  for insert with check (auth.uid() = user_id);
create policy "editar mi biblioteca" on public.user_library
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "borrar mi biblioteca" on public.user_library
  for delete using (auth.uid() = user_id);

-- Live sync between devices of the same account (a list created on the phone shows up on the computer)
do $$
begin
  alter publication supabase_realtime add table public.user_library;
exception when duplicate_object then null;
end $$;
