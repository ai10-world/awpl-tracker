"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ─── Submit or Update Today's Report ──────────────────────────
export async function submitReport(formData: FormData) {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const teamId = formData.get("team_id") as string;
  const plan = (formData.get("plan") as string)?.trim();
  const followUp = (formData.get("follow_up") as string)?.trim();
  const signUp = (formData.get("sign_up") as string)?.trim();
  const sp = parseInt(formData.get("sp") as string) || 0;
  const mood = formData.get("mood") as string || "neutral";

  if (!plan && !followUp && !signUp) {
    return { error: "Please fill at least one field in your report." };
  }
  if (!teamId) return { error: "Team is required." };

  // Check membership
  const { data: membership } = await adminSupabase
    .from("team_members").select("id").eq("team_id", teamId).eq("profile_id", user.id).single();
  if (!membership) return { error: "You are not a member of this team." };

  const today = todayISO();

  // Check existing report
  const { data: existing } = await adminSupabase
    .from("reports").select("id").eq("profile_id", user.id)
    .eq("team_id", teamId).eq("report_date", today).single();

  let isNew = false;

  if (existing) {
    // Update existing
    const { error } = await adminSupabase
      .from("reports")
      .update({ plan: plan || null, follow_up: followUp || null, sign_up: signUp || null, sp, mood, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    // Insert new
    const { error } = await adminSupabase
      .from("reports")
      .insert({ profile_id: user.id, team_id: teamId, report_date: today, plan: plan || null, follow_up: followUp || null, sign_up: signUp || null, sp, mood });
    if (error) return { error: error.message };
    isNew = true;
  }

  // Update streak (only on new submission, not edits)
  let streakResult: any = null;
  if (isNew) {
    const { data } = await adminSupabase.rpc("update_streak_on_report", {
      p_profile_id: user.id,
      p_report_date: today,
      p_team_id: teamId,
    });
    streakResult = data;

    // Log to activity feed
    const { data: profile } = await adminSupabase
      .from("profiles").select("full_name, awpl_id").eq("id", user.id).single();

    await adminSupabase.from("activity_feed").insert({
      team_id: teamId,
      profile_id: user.id,
      event_type: "report_submitted",
      event_data: {
        full_name: profile?.full_name,
        awpl_id: profile?.awpl_id,
        mood,
        sp,
        streak: streakResult?.streak || 0,
        date: today,
      },
    });

    // Log SP milestone if reached (100, 200, 500, 1000)
    if (sp > 0) {
      const { data: totalSPData } = await adminSupabase
        .from("reports").select("sp").eq("profile_id", user.id);
      const totalSP = totalSPData?.reduce((sum, r) => sum + (r.sp || 0), 0) || 0;
      const milestones = [100, 200, 500, 1000, 2000, 5000];
      const prevTotal = totalSP - sp;
      const hitMilestone = milestones.find((m) => prevTotal < m && totalSP >= m);
      if (hitMilestone) {
        await adminSupabase.from("activity_feed").insert({
          team_id: teamId,
          profile_id: user.id,
          event_type: "sp_milestone",
          event_data: {
            full_name: profile?.full_name,
            total_sp: totalSP,
            milestone: hitMilestone,
          },
        });
      }
    }
  }

  revalidatePath("/reports");
  revalidatePath("/activity");
  revalidatePath("/dashboard");

  // Return streak info for toast notification
  if (isNew && streakResult) {
    return {
      success: "Report submitted!",
      streak: streakResult.streak,
      milestone: streakResult.milestone,
      milestone_days: streakResult.milestone_days,
    };
  }

  return { success: "Report updated successfully!" };
}

// ─── Mark Report as Reviewed ───────────────────────────────────
export async function markReviewed(formData: FormData) {
  const adminSupabase = getAdminClient();
  const reportId = formData.get("report_id") as string;
  const status = (formData.get("status") as string) || "reviewed";

  const { error } = await adminSupabase
    .from("reports").update({ status }).eq("id", reportId);
  if (error) return { error: error.message };

  revalidatePath("/reports/team");
  return { success: true };
}

// ─── Log Member Joined Activity ────────────────────────────────
export async function logMemberJoined(profileId: string, teamId: string, fullName: string, awplId: string) {
  const adminSupabase = getAdminClient();
  await adminSupabase.from("activity_feed").insert({
    team_id: teamId,
    profile_id: profileId,
    event_type: "member_joined",
    event_data: { full_name: fullName, awpl_id: awplId },
  });
}
