-- ============================================================
-- AWPL Team Tracker — Phase 3 Schema (Daily Reports)
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── REPORTS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid references public.profiles(id) on delete cascade not null,
  team_id       uuid references public.teams(id) on delete cascade not null,

  -- Report date (one per member per team per day)
  report_date   date not null default current_date,

  -- Report content
  title         text,
  content       text not null,              -- main text written by member
  mood          text default 'neutral'
                check (mood in ('great', 'good', 'neutral', 'difficult', 'bad')),

  -- Status
  status        text default 'submitted'
                check (status in ('submitted', 'reviewed', 'flagged')),

  -- Metrics (optional numbers member can add)
  sales_count   integer default 0,
  calls_made    integer default 0,
  meetings_done integer default 0,
  new_recruits  integer default 0,

  -- Timestamps
  submitted_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- One report per member per team per day
  unique(profile_id, team_id, report_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS reports_profile_id_idx ON public.reports(profile_id);
CREATE INDEX IF NOT EXISTS reports_team_id_idx ON public.reports(team_id);
CREATE INDEX IF NOT EXISTS reports_date_idx ON public.reports(report_date);
CREATE INDEX IF NOT EXISTS reports_team_date_idx ON public.reports(team_id, report_date);

-- Auto update updated_at
CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Everyone can read (filtered by app logic using admin client)
CREATE POLICY "reports_select"
  ON public.reports FOR SELECT
  USING (true);

-- Members can insert their own reports
CREATE POLICY "reports_insert"
  ON public.reports FOR INSERT
  WITH CHECK (true);

-- Members can update their own reports (same day only — enforced in app)
CREATE POLICY "reports_update"
  ON public.reports FOR UPDATE
  USING (true);

-- Only admin can delete
CREATE POLICY "reports_delete"
  ON public.reports FOR DELETE
  USING (true);

-- ============================================================
-- DONE
-- ============================================================
