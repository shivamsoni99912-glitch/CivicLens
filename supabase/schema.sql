-- ============================================================================
-- CivicLens AI — Supabase schema, Row Level Security and access policies
-- Run this once in the Supabase dashboard: SQL Editor → New query → Run.
-- It is idempotent, so re-running it is safe.
-- ============================================================================

-- ---------- tables ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  user_name text,
  user_email text,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  image text,
  priority text not null,
  status text not null default 'Pending',
  analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaints_user_created_idx
  on public.complaints (user_id, created_at desc);

-- ---------- keep a profile row in sync with each new Google account ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for accounts that signed up before this trigger existed.
insert into public.profiles (id, full_name, email, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.email,
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
on conflict (id) do nothing;

-- ---------- helpers ----------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- ---------- row level security ----------

alter table public.profiles enable row level security;
alter table public.complaints enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- A citizen sees only their own complaints; admins see every complaint.
drop policy if exists "complaints read own or admin" on public.complaints;
create policy "complaints read own or admin"
  on public.complaints for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- A complaint can only be created for the signed-in user, never for someone else.
drop policy if exists "complaints insert own" on public.complaints;
create policy "complaints insert own"
  on public.complaints for insert
  to authenticated
  with check (user_id = auth.uid() and user_email is not distinct from auth.jwt() ->> 'email');

-- Status changes are staff only.
drop policy if exists "complaints update admin" on public.complaints;
create policy "complaints update admin"
  on public.complaints for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "complaints delete admin" on public.complaints;
create policy "complaints delete admin"
  on public.complaints for delete
  to authenticated
  using (public.is_admin());

-- ---------- table privileges ----------
-- RLS still decides which rows are visible; these grants only allow the operations.

revoke all on public.complaints from anon;
revoke all on public.profiles from anon;

grant select, insert, update on public.complaints to authenticated;
grant select, update on public.profiles to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------- optional: promote your own account to admin ----------
-- Run this after signing in once, replacing the email address:
--
--   update public.profiles set is_admin = true where email = 'you@example.com';
