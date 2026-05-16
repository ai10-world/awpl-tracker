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

  // Check member belongs to team
  const { data: membership } = await adminSupabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("profile_id", user.id)
    .single();

  if (!membership) return { error: "You are not a member of this team." };

  const today = todayISO();

  // Check if report already exists for today
  const { data: existing } = await adminSupabase
    .from("reports")
    .select("id")
    .eq("profile_id", user.id)
    .eq("team_id", teamId)
    .eq("report_date", today)
    .single();

  if (existing) {
    const { error } = await adminSupabase
      .from("reports")
      .update({
        plan: plan || null,
        follow_up: followUp || null,
        sign_up: signUp || null,
        sp,
        mood,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
    revalidatePath("/reports");
    return { success: "Report updated successfully!" };
  } else {
    const { error } = await adminSupabase
      .from("reports")
      .insert({
        profile_id: user.id,
        team_id: teamId,
        report_date: today,
        plan: plan || null,
        follow_up: followUp || null,
        sign_up: signUp || null,
        sp,
        mood,
      });

    if (error) return { error: error.message };
    revalidatePath("/reports");
    return { success: "Report submitted successfully!" };
  }
}

// ─── Mark Report as Reviewed ───────────────────────────────────
export async function markReviewed(formData: FormData) {
  const adminSupabase = getAdminClient();
  const reportId = formData.get("report_id") as string;
  const status = formData.get("status") as string || "reviewed";

  const { error } = await adminSupabase
    .from("reports")
    .update({ status })
    .eq("id", reportId);

  if (error) return { error: error.message };
  revalidatePath("/reports/team");
  return { success: true };
}
