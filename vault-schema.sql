-- AWPL Vault database schema (Supabase/Postgres)
-- Role model implemented:
-- 1) Platform admin: can see all vaults
-- 2) Team admin: can see vaults of their teams
-- 3) Team leader: can see vaults when admin allows (via team_members.can_view_reports=true)
-- 4) Member: can see only own vaults (unless explicit grant)

create extension if not exists pgcrypto;

alter table if exists public.team_members
  add column if not exists can_view_reports boolean not null default false;

alter table if exists public.team_members
  add column if not exists can_assign_tasks boolean not null default false;

create table if not exists public.awpl_vaults (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If old schema exists with team_id as text, convert safely to uuid where possible.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'awpl_vaults'
      and column_name = 'team_id'
      and udt_name = 'text'
  ) then
    alter table public.awpl_vaults
      alter column team_id type uuid
      using (
        case
          when team_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
          then team_id::uuid
          else null
        end
      );
  end if;
exception when undefined_column then
  -- no-op
  null;
end $$;

create table if not exists public.awpl_vault_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  vault_id uuid not null references public.awpl_vaults(id) on delete cascade,
  name text not null,
  dist_id text not null,
  rank text,
  icon text,
  color_hex text,
  color_bg text,
  color_name text,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  added_on timestamptz not null default now()
);

-- Future-proof fine-grained access table
create table if not exists public.awpl_vault_permissions (
  id uuid primary key default gen_random_uuid(),
  vault_id uuid not null references public.awpl_vaults(id) on delete cascade,
  grantee_profile_id uuid not null references public.profiles(id) on delete cascade,
  can_view boolean not null default true,
  can_edit boolean not null default false,
  can_manage boolean not null default false,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(vault_id, grantee_profile_id)
);

create index if not exists awpl_vaults_owner_idx on public.awpl_vaults(owner_id, created_at desc);
create index if not exists awpl_vaults_team_idx on public.awpl_vaults(team_id, created_at desc);
create index if not exists awpl_vault_entries_owner_idx on public.awpl_vault_entries(owner_id, created_at desc);
create index if not exists awpl_vault_entries_vault_idx on public.awpl_vault_entries(vault_id, created_at desc);
create index if not exists awpl_vault_permissions_grantee_idx on public.awpl_vault_permissions(grantee_profile_id, vault_id);

alter table public.awpl_vaults enable row level security;
alter table public.awpl_vault_entries enable row level security;
alter table public.awpl_vault_permissions enable row level security;

-- Cleanup old policies

drop policy if exists "vaults_select_own" on public.awpl_vaults;
drop policy if exists "vaults_insert_own" on public.awpl_vaults;
drop policy if exists "vaults_update_own" on public.awpl_vaults;
drop policy if exists "vaults_delete_own" on public.awpl_vaults;
drop policy if exists "entries_select_own" on public.awpl_vault_entries;
drop policy if exists "entries_insert_own" on public.awpl_vault_entries;
drop policy if exists "entries_update_own" on public.awpl_vault_entries;
drop policy if exists "entries_delete_own" on public.awpl_vault_entries;
drop policy if exists "vaults_select_access" on public.awpl_vaults;
drop policy if exists "vaults_insert_access" on public.awpl_vaults;
drop policy if exists "vaults_update_access" on public.awpl_vaults;
drop policy if exists "vaults_delete_access" on public.awpl_vaults;
drop policy if exists "entries_select_access" on public.awpl_vault_entries;
drop policy if exists "entries_insert_access" on public.awpl_vault_entries;
drop policy if exists "entries_update_access" on public.awpl_vault_entries;
drop policy if exists "entries_delete_access" on public.awpl_vault_entries;
drop policy if exists "vault_permissions_select" on public.awpl_vault_permissions;
drop policy if exists "vault_permissions_insert" on public.awpl_vault_permissions;
drop policy if exists "vault_permissions_update" on public.awpl_vault_permissions;
drop policy if exists "vault_permissions_delete" on public.awpl_vault_permissions;

-- Vault SELECT: owner, platform admin, team admin of same team,
-- team leader with can_view_reports=true on same team, or explicit permission grant
create policy "vaults_select_access"
  on public.awpl_vaults
  for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = awpl_vaults.team_id
        and tm.profile_id = (select auth.uid())
        and tm.role = 'team_admin'
    )
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = awpl_vaults.team_id
        and tm.profile_id = (select auth.uid())
        and tm.role = 'team_leader'
        and coalesce(tm.can_view_reports, false) = true
    )
    or exists (
      select 1
      from public.awpl_vault_permissions vp
      where vp.vault_id = awpl_vaults.id
        and vp.grantee_profile_id = (select auth.uid())
        and vp.can_view = true
    )
  );

-- Vault INSERT: owner can create for own row,
-- but only inside teams where they are platform_admin OR a member.
create policy "vaults_insert_access"
  on public.awpl_vaults
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and p.role = 'platform_admin'
      )
      or exists (
        select 1
        from public.team_members tm
        where tm.team_id = awpl_vaults.team_id
          and tm.profile_id = (select auth.uid())
      )
    )
  );

-- Vault UPDATE/DELETE: owner, platform admin, or team_admin of same team,
-- or explicit can_edit/can_manage grants.
create policy "vaults_update_access"
  on public.awpl_vaults
  for update
  to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = awpl_vaults.team_id
        and tm.profile_id = (select auth.uid())
        and tm.role = 'team_admin'
    )
    or exists (
      select 1
      from public.awpl_vault_permissions vp
      where vp.vault_id = awpl_vaults.id
        and vp.grantee_profile_id = (select auth.uid())
        and vp.can_edit = true
    )
  )
  with check (
    owner_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = awpl_vaults.team_id
        and tm.profile_id = (select auth.uid())
        and tm.role = 'team_admin'
    )
  );

create policy "vaults_delete_access"
  on public.awpl_vaults
  for delete
  to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'platform_admin'
    )
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = awpl_vaults.team_id
        and tm.profile_id = (select auth.uid())
        and tm.role = 'team_admin'
    )
    or exists (
      select 1
      from public.awpl_vault_permissions vp
      where vp.vault_id = awpl_vaults.id
        and vp.grantee_profile_id = (select auth.uid())
        and vp.can_manage = true
    )
  );

-- Entries inherit visibility/update ability from parent vault access.
create policy "entries_select_access"
  on public.awpl_vault_entries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.awpl_vaults v
      where v.id = awpl_vault_entries.vault_id
        and (
          v.owner_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'platform_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_leader'
              and coalesce(tm.can_view_reports, false) = true
          )
          or exists (
            select 1 from public.awpl_vault_permissions vp
            where vp.vault_id = v.id
              and vp.grantee_profile_id = (select auth.uid())
              and vp.can_view = true
          )
        )
    )
  );

create policy "entries_insert_access"
  on public.awpl_vault_entries
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.awpl_vaults v
      where v.id = awpl_vault_entries.vault_id
        and (
          v.owner_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'platform_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_admin'
          )
          or exists (
            select 1 from public.awpl_vault_permissions vp
            where vp.vault_id = v.id
              and vp.grantee_profile_id = (select auth.uid())
              and vp.can_edit = true
          )
        )
    )
  );

create policy "entries_update_access"
  on public.awpl_vault_entries
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.awpl_vaults v
      where v.id = awpl_vault_entries.vault_id
        and (
          v.owner_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'platform_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_admin'
          )
          or exists (
            select 1 from public.awpl_vault_permissions vp
            where vp.vault_id = v.id
              and vp.grantee_profile_id = (select auth.uid())
              and vp.can_edit = true
          )
        )
    )
  )
  with check (
    exists (
      select 1
      from public.awpl_vaults v
      where v.id = awpl_vault_entries.vault_id
        and (
          v.owner_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'platform_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_admin'
          )
          or exists (
            select 1 from public.awpl_vault_permissions vp
            where vp.vault_id = v.id
              and vp.grantee_profile_id = (select auth.uid())
              and vp.can_edit = true
          )
        )
    )
  );

create policy "entries_delete_access"
  on public.awpl_vault_entries
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.awpl_vaults v
      where v.id = awpl_vault_entries.vault_id
        and (
          v.owner_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'platform_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_admin'
          )
          or exists (
            select 1 from public.awpl_vault_permissions vp
            where vp.vault_id = v.id
              and vp.grantee_profile_id = (select auth.uid())
              and vp.can_manage = true
          )
        )
    )
  );

-- Permission table policies: admin/owner grant & maintain.
create policy "vault_permissions_select"
  on public.awpl_vault_permissions
  for select
  to authenticated
  using (
    grantee_profile_id = (select auth.uid())
    or exists (
      select 1
      from public.awpl_vaults v
      where v.id = awpl_vault_permissions.vault_id
        and (
          v.owner_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'platform_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_admin'
          )
        )
    )
  );

create policy "vault_permissions_insert"
  on public.awpl_vault_permissions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.awpl_vaults v
      where v.id = awpl_vault_permissions.vault_id
        and (
          v.owner_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'platform_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_admin'
          )
        )
    )
  );

create policy "vault_permissions_update"
  on public.awpl_vault_permissions
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.awpl_vaults v
      where v.id = awpl_vault_permissions.vault_id
        and (
          v.owner_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'platform_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_admin'
          )
        )
    )
  )
  with check (true);

create policy "vault_permissions_delete"
  on public.awpl_vault_permissions
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.awpl_vaults v
      where v.id = awpl_vault_permissions.vault_id
        and (
          v.owner_id = (select auth.uid())
          or exists (
            select 1 from public.profiles p
            where p.id = (select auth.uid()) and p.role = 'platform_admin'
          )
          or exists (
            select 1 from public.team_members tm
            where tm.team_id = v.team_id
              and tm.profile_id = (select auth.uid())
              and tm.role = 'team_admin'
          )
        )
    )
  );
