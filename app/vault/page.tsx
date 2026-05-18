import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { VaultClient } from "@/components/vault/vault-client";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function VaultPage() {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("id, full_name, awpl_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  let availableTeams: any[] = [];

  if (profile.role === "platform_admin") {
    const { data: allTeams } = await adminSupabase
      .from("teams")
      .select("id, name")
      .order("name", { ascending: true });

    availableTeams = (allTeams || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      myRole: "platform_admin",
      canViewReports: true,
    }));
  } else {
    const { data: memberships } = await adminSupabase
      .from("team_members")
      .select("role, can_view_reports, team:teams(id, name)")
      .eq("profile_id", user.id)
      .order("joined_at", { ascending: true });

    availableTeams = (memberships || [])
      .filter((m: any) => m.team?.id)
      .map((m: any) => ({
        id: m.team.id,
        name: m.team.name,
        myRole: m.role,
        canViewReports: !!m.can_view_reports,
      }));
  }

  return (
    <DashboardLayout profile={profile}>
      <VaultClient profile={profile} availableTeams={availableTeams} />
    </DashboardLayout>
  );
}
