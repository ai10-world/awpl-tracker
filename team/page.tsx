// app/team/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Users, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function TeamPage() {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await adminSupabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/auth/login");

  let teams: any[] = [];
  if (profile.role === "platform_admin") {
    const { data } = await adminSupabase
      .from("teams")
      .select(`*, admin:profiles!teams_admin_id_fkey(full_name, awpl_id)`)
      .order("created_at", { ascending: false });
    teams = data || [];
  } else {
    const { data } = await adminSupabase
      .from("team_members")
      .select(`role, team:teams(*, admin:profiles!teams_admin_id_fkey(full_name, awpl_id))`)
      .eq("profile_id", user.id);
    teams = data?.map((d: any) => ({ ...d.team, my_role: d.role })) || [];
  }

  // Member counts
  const teamIds = teams.map((t) => t.id);
  const memberCounts: Record<string, number> = {};
  if (teamIds.length > 0) {
    const { data: counts } = await adminSupabase
      .from("team_members").select("team_id").in("team_id", teamIds);
    counts?.forEach((c: any) => {
      memberCounts[c.team_id] = (memberCounts[c.team_id] || 0) + 1;
    });
  }

  const roleColors: Record<string, string> = {
    team_admin: "badge-brand",
    team_leader: "badge-yellow",
    member: "badge-gray",
  };
  const roleLabels: Record<string, string> = {
    team_admin: "Admin",
    team_leader: "Leader",
    member: "Member",
  };

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1"
              style={{ color: "var(--text-1)" }}>
              {profile.role === "platform_admin" ? "All Teams" : "My Teams"}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              {teams.length} team{teams.length !== 1 ? "s" : ""}
              {profile.role === "platform_admin" ? " on platform" : " you belong to"}
            </p>
          </div>
          <Link href="/team/create"
            className="btn btn-primary text-sm px-4 py-2">
            <Plus size={15} /> Create Team
          </Link>
        </div>

        {/* Empty state */}
        {teams.length === 0 ? (
          <div className="card p-12 sm:p-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--surface-3)" }}>
              <Users size={24} style={{ color: "var(--text-4)" }} />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2"
              style={{ color: "var(--text-1)" }}>No teams yet</h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
              Create your first team and start adding members.
            </p>
            <Link href="/team/create" className="btn btn-primary">
              <Plus size={15} /> Create Team
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {teams.map((team: any, i: number) => (
              <Link key={team.id} href={`/team/${team.id}`}
                className="card card-interactive p-4 sm:p-5 group transition-all animate-fade-up"
                style={{ animationDelay: `${i * 50}ms`, textDecoration: "none" }}>

                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold"
                    style={{
                      background: "rgba(255,115,10,0.12)",
                      border: "1px solid rgba(255,115,10,0.2)",
                      color: "var(--brand-400)",
                      fontSize: 18,
                    }}>
                    {team.name?.[0]?.toUpperCase()}
                  </div>
                  <ChevronRight size={16}
                    className="transition-transform group-hover:translate-x-0.5 mt-1"
                    style={{ color: "var(--text-4)" }} />
                </div>

                {/* Name + desc */}
                <h3 className="font-display font-semibold mb-1 truncate"
                  style={{ color: "var(--text-1)" }}>
                  {team.name}
                </h3>
                {team.description && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--text-3)" }}>
                    {team.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3"
                  style={{ borderTop: "1px solid var(--border-1)" }}>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
                    <Users size={12} />
                    {memberCounts[team.id] || 0} members
                  </div>
                  {team.my_role && (
                    <span className={`badge ${roleColors[team.my_role] || "badge-gray"}`}>
                      {roleLabels[team.my_role] || team.my_role}
                    </span>
                  )}
                  {!team.my_role && team.admin && (
                    <span className="text-xs" style={{ color: "var(--text-4)" }}>
                      {team.admin.awpl_id}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
