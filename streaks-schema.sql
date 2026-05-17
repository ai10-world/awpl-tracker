-- ============================================================
-- AWPL Team Tracker — Streaks + Activity Feed Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── STREAKS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.streaks (
  id                uuid primary key default uuid_generate_v4(),
  profile_id        uuid references public.profiles(id) on delete cascade not null unique,
  current_streak    integer not null default 0,
  longest_streak    integer not null default 0,
  last_report_date  date,
  streak_started_at date,
  updated_at        timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS streaks_profile_id_idx ON public.streaks(profile_id);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks_select" ON public.streaks FOR SELECT USING (true);
CREATE POLICY "streaks_insert" ON public.streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "streaks_update" ON public.streaks FOR UPDATE USING (true);

-- ─── ACTIVITY FEED TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id          uuid primary key default uuid_generate_v4(),
  team_id     uuid references public.teams(id) on delete cascade,
  profile_id  uuid references public.profiles(id) on delete cascade not null,

  -- Event type
  event_type  text not null check (event_type in (
    'report_submitted',
    'report_updated',
    'streak_milestone',
    'member_joined',
    'member_left',
    'team_created',
    'target_hit',
    'sp_milestone'
  )),

  -- Event data (flexible JSON)
  event_data  jsonb default '{}',

  -- Timestamp
  created_at  timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS activity_feed_team_id_idx ON public.activity_feed(team_id);
CREATE INDEX IF NOT EXISTS activity_feed_profile_id_idx ON public.activity_feed(profile_id);
CREATE INDEX IF NOT EXISTS activity_feed_created_at_idx ON public.activity_feed(created_at DESC);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_feed_select" ON public.activity_feed FOR SELECT USING (true);
CREATE POLICY "activity_feed_insert" ON public.activity_feed FOR INSERT WITH CHECK (true);

-- ─── FUNCTION: Update streak after report submission ───────────
CREATE OR REPLACE FUNCTION public.update_streak_on_report(
  p_profile_id uuid,
  p_report_date date,
  p_team_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_streak record;
  v_new_streak integer;
  v_milestone boolean := false;
  v_milestone_days integer := 0;
BEGIN
  -- Get existing streak
  SELECT * INTO v_streak
  FROM public.streaks
  WHERE profile_id = p_profile_id;

  IF NOT FOUND THEN
    -- First ever report
    INSERT INTO public.streaks (profile_id, current_streak, longest_streak, last_report_date, streak_started_at)
    VALUES (p_profile_id, 1, 1, p_report_date, p_report_date);
    v_new_streak := 1;
  ELSE
    -- Already reported today — no change
    IF v_streak.last_report_date = p_report_date THEN
      v_new_streak := v_streak.current_streak;
    -- Reported yesterday — continue streak
    ELSIF v_streak.last_report_date = p_report_date - INTERVAL '1 day' THEN
      v_new_streak := v_streak.current_streak + 1;
      UPDATE public.streaks SET
        current_streak = v_new_streak,
        longest_streak = GREATEST(v_streak.longest_streak, v_new_streak),
        last_report_date = p_report_date,
        updated_at = now()
      WHERE profile_id = p_profile_id;
    -- Streak broken — reset
    ELSE
      v_new_streak := 1;
      UPDATE public.streaks SET
        current_streak = 1,
        last_report_date = p_report_date,
        streak_started_at = p_report_date,
        updated_at = now()
      WHERE profile_id = p_profile_id;
    END IF;
  END IF;

  -- Check for milestone (7, 14, 21, 30, 50, 100)
  IF v_new_streak IN (7, 14, 21, 30, 50, 100) THEN
    v_milestone := true;
    v_milestone_days := v_new_streak;

    -- Log milestone to activity feed
    INSERT INTO public.activity_feed (team_id, profile_id, event_type, event_data)
    VALUES (p_team_id, p_profile_id, 'streak_milestone', jsonb_build_object(
      'days', v_new_streak,
      'date', p_report_date
    ));
  END IF;

  RETURN jsonb_build_object(
    'streak', v_new_streak,
    'milestone', v_milestone,
    'milestone_days', v_milestone_days
  );
END;
$$;

-- ============================================================
-- DONE — Run this file in Supabase SQL Editor
-- ============================================================
