-- ============================================================
-- AWPL Team Tracker - Base Supabase Schema
-- Run this before the feature schemas.
-- Important: profiles.id intentionally matches auth.users.id.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  awpl_id text not null unique,
  pin_hash text not null,
  role text not null default 'member'
    check (role in ('platform_admin', 'team_admin', 'team_leader', 'member')),
  language text not null default 'en' check (language in ('en', 'hi')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_awpl_id_idx on public.profiles(awpl_id);
create index if not exists profiles_email_idx on public.profiles(email);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "profiles_platform_admin_select" on public.profiles;
create policy "profiles_platform_admin_select"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
  );

drop policy if exists "profiles_insert_service" on public.profiles;
create policy "profiles_insert_service"
  on public.profiles for insert
  with check (true);

-- ============================================================
-- SHARED UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- TEAMS
-- ============================================================

create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  admin_id uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'member'
    check (role in ('team_admin', 'team_leader', 'member')),
  rank integer default 0,
  can_assign_tasks boolean default false,
  can_view_reports boolean default false,
  can_view_vault boolean default false,
  joined_at timestamptz not null default now(),
  unique(team_id, profile_id)
);

create index if not exists team_members_team_id_idx on public.team_members(team_id);
create index if not exists team_members_profile_id_idx on public.team_members(profile_id);
create index if not exists teams_admin_id_idx on public.teams(admin_id);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "teams_select_access" on public.teams;
create policy "teams_select_access"
  on public.teams for select
  to authenticated
  using (
    admin_id = (select auth.uid())
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = teams.id
        and tm.profile_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
  );

drop policy if exists "teams_insert_access" on public.teams;
create policy "teams_insert_access"
  on public.teams for insert
  to authenticated
  with check (admin_id = (select auth.uid()));

drop policy if exists "teams_update_access" on public.teams;
create policy "teams_update_access"
  on public.teams for update
  to authenticated
  using (
    admin_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
  );

drop policy if exists "teams_delete_access" on public.teams;
create policy "teams_delete_access"
  on public.teams for delete
  to authenticated
  using (
    admin_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
  );

drop policy if exists "team_members_select_access" on public.team_members;
create policy "team_members_select_access"
  on public.team_members for select
  to authenticated
  using (true);

drop policy if exists "team_members_insert_access" on public.team_members;
create policy "team_members_insert_access"
  on public.team_members for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.teams t
      where t.id = team_members.team_id
        and t.admin_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
  );

drop policy if exists "team_members_update_access" on public.team_members;
create policy "team_members_update_access"
  on public.team_members for update
  to authenticated
  using (
    exists (
      select 1
      from public.teams t
      where t.id = team_members.team_id
        and t.admin_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
  );

drop policy if exists "team_members_delete_access" on public.team_members;
create policy "team_members_delete_access"
  on public.team_members for delete
  to authenticated
  using (
    exists (
      select 1
      from public.teams t
      where t.id = team_members.team_id
        and t.admin_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
  );

drop trigger if exists teams_updated_at on public.teams;
create trigger teams_updated_at
  before update on public.teams
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- PLATFORM ADMIN SETUP
-- ============================================================
-- After signup, promote your own profile:
-- update public.profiles set role = 'platform_admin' where awpl_id = 'YOUR_AWPL_ID';
