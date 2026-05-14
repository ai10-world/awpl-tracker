"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── Create Team ──────────────────────────────────────────────
export async function createTeam(formData: FormData) {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name?.trim()) return { error: "Team name is required" };

  // Create team
  const { data: team, error: teamError } = await adminSupabase
    .from("teams")
    .insert({ name: name.trim(), description: description?.trim(), admin_id: user.id })
    .select()
    .single();

  if (teamError) return { error: teamError.message };

  // Auto-add creator as team_admin member
  const { error: memberError } = await adminSupabase
    .from("team_members")
    .insert({ team_id: team.id, profile_id: user.id, role: "team_admin", rank: 0 });

  if (memberError) return { error: memberError.message };

  // Update profile role to team_admin if currently member
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "member") {
    await adminSupabase
      .from("profiles")
      .update({ role: "team_admin" })
      .eq("id", user.id);
  }

  revalidatePath("/team");
  redirect("/team");
}

// ─── Add Member by AWPL ID ────────────────────────────────────
export async function addMember(formData: FormData) {
  const adminSupabase = getAdminClient();
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const teamId = formData.get("team_id") as string;
  const awplId = (formData.get("awpl_id") as string)?.trim().toUpperCase();
  const role = (formData.get("role") as string) || "member";
  const rank = parseInt(formData.get("rank") as string) || 0;

  if (!awplId) return { error: "AWPL ID is required" };

  // Find the member profile
  const { data: memberProfile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("id, full_name, awpl_id, role")
    .eq("awpl_id", awplId)
    .single();

  if (profileError || !memberProfile) {
    return { error: `No account found with AWPL ID: ${awplId}. They need to sign up first.` };
  }

  // Check not already in team
  const { data: existing } = await adminSupabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("profile_id", memberProfile.id)
    .single();

  if (existing) return { error: `${memberProfile.full_name} is already in this team.` };

  // Add to team
  const { error: addError } = await adminSupabase
    .from("team_members")
    .insert({
      team_id: teamId,
      profile_id: memberProfile.id,
      role,
      rank,
      can_assign_tasks: role === "team_leader",
      can_view_reports: role === "team_leader",
    });

  if (addError) return { error: addError.message };

  // Update profile role if being promoted
  if (role === "team_leader" && memberProfile.role === "member") {
    await adminSupabase
      .from("profiles")
      .update({ role: "team_leader" })
      .eq("id", memberProfile.id);
  }

  revalidatePath("/team");
  return { success: `${memberProfile.full_name} added successfully!` };
}

// ─── Update Member Role ────────────────────────────────────────
export async function updateMemberRole(formData: FormData) {
  const adminSupabase = getAdminClient();

  const memberId = formData.get("member_id") as string;
  const role = formData.get("role") as string;
  const rank = parseInt(formData.get("rank") as string) || 0;
  const canAssignTasks = formData.get("can_assign_tasks") === "true";
  const canViewReports = formData.get("can_view_reports") === "true";

  const { error } = await adminSupabase
    .from("team_members")
    .update({ role, rank, can_assign_tasks: canAssignTasks, can_view_reports: canViewReports })
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/team");
  return { success: "Member updated successfully!" };
}

// ─── Remove Member ─────────────────────────────────────────────
export async function removeMember(formData: FormData) {
  const adminSupabase = getAdminClient();

  const memberId = formData.get("member_id") as string;
  const profileId = formData.get("profile_id") as string;
  const teamId = formData.get("team_id") as string;

  const { error } = await adminSupabase
    .from("team_members")
    .delete()
    .eq("id", memberId);

  if (error) return { error: error.message };

  // Check if member is in any other teams with leadership role
  const { data: otherMemberships } = await adminSupabase
    .from("team_members")
    .select("role")
    .eq("profile_id", profileId)
    .neq("team_id", teamId);

  const hasLeaderRole = otherMemberships?.some(
    (m) => m.role === "team_admin" || m.role === "team_leader"
  );

  if (!hasLeaderRole) {
    await adminSupabase
      .from("profiles")
      .update({ role: "member" })
      .eq("id", profileId);
  }

  revalidatePath("/team");
  return { success: "Member removed." };
}

// ─── Update Team ───────────────────────────────────────────────
export async function updateTeam(formData: FormData) {
  const adminSupabase = getAdminClient();

  const teamId = formData.get("team_id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { error } = await adminSupabase
    .from("teams")
    .update({ name: name.trim(), description: description?.trim() })
    .eq("id", teamId);

  if (error) return { error: error.message };

  revalidatePath("/team");
  return { success: "Team updated!" };
}

// ─── Delete Team ───────────────────────────────────────────────
export async function deleteTeam(formData: FormData) {
  const adminSupabase = getAdminClient();
  const teamId = formData.get("team_id") as string;

  const { error } = await adminSupabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
