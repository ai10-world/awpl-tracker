// app/team/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Users, Plus, ChevronRight } from "lucide-react";

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

  const { data: profile } = await adminSupabase.from("profiles").select("*").eq("id", user.id).single();
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

  const teamIds = teams.map((t) => t.id);
  const memberCounts: Record<string, number> = {};
  if (teamIds.length > 0) {
    const { data: counts } = await adminSupabase
      .from("team_members").select("team_id").in("team_id", teamIds);
    counts?.forEach((c: any) => { memberCounts[c.team_id] = (memberCounts[c.team_id] || 0) + 1; });
  }

  const roleColors: Record<string, string> = {
    team_admin: "badge-brand",
    team_leader: "badge-yellow",
    member: "badge-gray",
  };

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--text-1)" }}>Teams</h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              {profile.role === "platform_admin"
                ? `${teams.length} teams on platform`
                : `${teams.length} team${teams.length !== 1 ? "s" : ""} you belong to`}
            </p>
          </div>
          <Link href="/team/create" className="btn btn-primary text-sm">
            <Plus size={14} /> Create Team
          </Link>
        </div>

        {/* Empty state */}
        {teams.length === 0 ? (
          <div className="card p-16 text-center animate-fade-up">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--surface-3)" }}>
              <Users size={28} style={{ color: "var(--text-4)" }} />
            </div>
            <h2 className="font-display font-semibold text-xl mb-2" style={{ color: "var(--text-1)" }}>
              No teams yet
            </h2>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: "var(--text-3)" }}>
              Create your first team and start building your network.
            </p>
            <Link href="/team/create" className="btn btn-primary text-sm mx-auto">
              <Plus size={14} /> Create Team
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team: any, i: number) => (
              <Link key={team.id} href={`/team/${team.id}`}
                className="card card-interactive p-5 group transition-all animate-fade-up"
                style={{ animationDelay: `${i * 60}ms`, textDecoration: "none" }}>

                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-lg"
                    style={{ background: "rgba(255,115,10,0.12)", color: "var(--brand-400)", border: "1px solid rgba(255,115,10,0.2)" }}>
                    {team.name?.[0]?.toUpperCase()}
                  </div>
                  <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5 mt-1"
                    style={{ color: "var(--text-4)" }} />
                </div>

                <h3 className="font-display font-semibold mb-1" style={{ color: "var(--text-1)" }}>
                  {team.name}
                </h3>
                {team.description && (
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: "var(--text-3)" }}>
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
                      {team.my_role.replace("_", " ")}
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
