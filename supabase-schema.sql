-- ============================================================
-- AWPL Team Tracker — Supabase Database Schema (Phase 1)
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Stores user info, AWPL ID, role, and PIN
-- ============================================================

create table if not exists public.profiles (
  id              uuid primary key default uuid_generate_v4(),
  auth_user_id    uuid references auth.users(id) on delete cascade,
  full_name       text not null,
  email           text not null,
  awpl_id         text not null unique,
  pin_hash        text not null,           -- store PIN (hash with pgcrypto in production)
  role            text not null default 'member'
                  check (role in ('platform_admin', 'team_admin', 'team_leader', 'member')),
  language        text not null default 'en' check (language in ('en', 'hi')),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for fast AWPL ID lookups (used during login)
create index if not exists profiles_awpl_id_idx on public.profiles(awpl_id);
create index if not exists profiles_auth_user_id_idx on public.profiles(auth_user_id);

-- ============================================================
-- ROW LEVEL SECURITY — PROFILES
-- ============================================================

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = auth_user_id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = auth_user_id);

-- Platform admin can view all profiles
create policy "Platform admin can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.auth_user_id = auth.uid()
        and p.role = 'platform_admin'
    )
  );

-- Allow insert during signup (anon + authenticated)
create policy "Allow profile creation"
  on public.profiles for insert
  with check (true);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- HELPER: Get profile by AWPL ID (used during login)
-- Called from the server action to look up email for auth
-- ============================================================

create or replace function public.get_profile_by_awpl_id(p_awpl_id text)
returns table (
  id uuid,
  email text,
  pin_hash text,
  full_name text,
  role text,
  is_active boolean
)
language plpgsql security definer as $$
begin
  return query
  select
    pr.id,
    pr.email,
    pr.pin_hash,
    pr.full_name,
    pr.role,
    pr.is_active
  from public.profiles pr
  where pr.awpl_id = p_awpl_id
  limit 1;
end;
$$;

-- ============================================================
-- PLATFORM ADMIN SETUP
-- After running this schema, manually update your own profile's
-- role to 'platform_admin' using the Supabase table editor,
-- or run the SQL below (replace with your real AWPL ID):
--
--   update public.profiles
--   set role = 'platform_admin'
--   where awpl_id = 'YOUR_AWPL_ID_HERE';
--
-- ============================================================

-- ============================================================
-- PHASE 2 PREVIEW (teams — will be expanded later)
-- ============================================================

create table if not exists public.teams (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  admin_id    uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.team_members (
  id          uuid primary key default uuid_generate_v4(),
  team_id     uuid references public.teams(id) on delete cascade,
  profile_id  uuid references public.profiles(id) on delete cascade,
  role        text not null default 'member'
              check (role in ('team_admin', 'team_leader', 'member')),
  rank        integer default 0,
  joined_at   timestamptz not null default now(),
  unique(team_id, profile_id)
);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Team members can see their own team
create policy "Team members can view their teams"
  on public.teams for select
  using (
    exists (
      select 1 from public.team_members tm
      join public.profiles p on p.id = tm.profile_id
      where tm.team_id = teams.id
        and p.auth_user_id = auth.uid()
    )
  );

create policy "Team members can view their memberships"
  on public.team_members for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = team_members.profile_id
        and p.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- DONE — Schema ready for Phase 1
-- ============================================================
