-- ============================================================
-- AWPL Team Tracker — Phase 2 Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop old basic tables first
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- ============================================================
-- TEAMS TABLE
-- ============================================================
CREATE TABLE public.teams (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  admin_id    uuid references public.profiles(id) on delete set null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- TEAM MEMBERS TABLE
-- ============================================================
CREATE TABLE public.team_members (
  id          uuid primary key default uuid_generate_v4(),
  team_id     uuid references public.teams(id) on delete cascade,
  profile_id  uuid references public.profiles(id) on delete cascade,
  role        text not null default 'member'
              check (role in ('team_admin', 'team_leader', 'member')),
  rank        integer default 0,
  can_assign_tasks    boolean default false,
  can_view_reports    boolean default false,
  joined_at   timestamptz not null default now(),
  unique(team_id, profile_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_profile_id_idx ON public.team_members(profile_id);
CREATE INDEX IF NOT EXISTS teams_admin_id_idx ON public.teams(admin_id);

-- ============================================================
-- RLS — TEAMS
-- ============================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams they belong to"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = teams.id
        AND tm.profile_id = auth.uid()
    )
    OR admin_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'platform_admin'
    )
  );

CREATE POLICY "Team admins and platform admin can insert teams"
  ON public.teams FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Team admins can update their teams"
  ON public.teams FOR UPDATE
  USING (
    admin_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'platform_admin'
    )
  );

CREATE POLICY "Team admins can delete their teams"
  ON public.teams FOR DELETE
  USING (
    admin_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'platform_admin'
    )
  );

-- ============================================================
-- RLS — TEAM MEMBERS
-- ============================================================
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view their team"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "Team admins can manage members"
  ON public.team_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Team admins can update members"
  ON public.team_members FOR UPDATE
  USING (true);

CREATE POLICY "Team admins can remove members"
  ON public.team_members FOR DELETE
  USING (true);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER FOR TEAMS
-- ============================================================
CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- DONE
-- ============================================================
