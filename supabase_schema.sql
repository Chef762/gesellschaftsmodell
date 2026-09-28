-- Gesellschaftsmodell · Live-Kritik
-- Für ein Supabase-Projekt ausführen. Das Frontend darf nur mit Publishable/Anon-Key arbeiten.

create extension if not exists pgcrypto;

create table if not exists public.criticism (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(trim(body)) between 3 and 4000),
  author_name text not null default 'Gast' check (char_length(trim(author_name)) between 1 and 80),
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.criticism enable row level security;
alter table public.admins enable row level security;

-- Öffentliche Kritik darf gelesen werden.
drop policy if exists "criticism_public_read" on public.criticism;
create policy "criticism_public_read"
on public.criticism for select
to anon, authenticated
using (true);

-- Nur eingeloggte Nutzer dürfen neue Kritik einstellen.
drop policy if exists "criticism_authenticated_insert" on public.criticism;
create policy "criticism_authenticated_insert"
on public.criticism for insert
to authenticated
with check (author_id = auth.uid());

-- Admin-Prüfung läuft serverseitig in Postgres und kann nicht durch das Frontend umgangen werden.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Nur Admins dürfen Kritik löschen.
drop policy if exists "criticism_admin_delete" on public.criticism;
create policy "criticism_admin_delete"
on public.criticism for delete
to authenticated
using (public.is_admin());

-- Admin-Tabelle selbst bleibt für normale Clients unsichtbar.
revoke all on public.admins from anon, authenticated;

-- Für Live-Aktualisierung im Browser.
do $$
begin
  alter publication supabase_realtime add table public.criticism;
exception when duplicate_object then
  null;
end $$;

create index if not exists criticism_created_at_idx on public.criticism(created_at desc);
