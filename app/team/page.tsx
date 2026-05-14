// app/team/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import { Users, Plus, ChevronRight, ArrowLeft, Shield, Star } from "lucide-react";

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
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  // Fetch teams based on role
  let teams: any[] = [];
  if (profile.role === "platform_admin") {
    // See all teams
    const { data } = await adminSupabase
      .from("teams")
      .select(`*, admin:profiles!teams_admin_id_fkey(full_name, awpl_id)`)
      .order("created_at", { ascending: false });
    teams = data || [];
  } else {
    // See only teams I'm in
    const { data } = await adminSupabase
      .from("team_members")
      .select(`role, team:teams(*, admin:profiles!teams_admin_id_fkey(full_name, awpl_id))`)
      .eq("profile_id", user.id);
    teams = data?.map((d: any) => ({ ...d.team, my_role: d.role })) || [];
  }

  // Get member counts
  const teamIds = teams.map((t) => t.id);
  const memberCounts: Record<string, number> = {};
  if (teamIds.length > 0) {
    const { data: counts } = await adminSupabase
      .from("team_members")
      .select("team_id")
      .in("team_id", teamIds);
    counts?.forEach((c: any) => {
      memberCounts[c.team_id] = (memberCounts[c.team_id] || 0) + 1;
    });
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#080808]/90 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/logo.png" alt="Asclepius" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 hidden sm:block">{profile.full_name}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-2xl">Team Management</h1>
              <p className="text-white/35 text-sm">
                {profile.role === "platform_admin"
                  ? `${teams.length} total teams on platform`
                  : `${teams.length} team${teams.length !== 1 ? "s" : ""} you belong to`}
              </p>
            </div>
          </div>
          <Link
            href="/team/create"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm px-4 py-2 rounded-full transition-colors"
          >
            <Plus size={14} />
            Create Team
          </Link>
        </div>

        {/* Teams List */}
        {teams.length === 0 ? (
          <div className="text-center py-16 border border-white/5 rounded-2xl">
            <Users size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm mb-6">No teams yet. Create your first team!</p>
            <Link
              href="/team/create"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm px-6 py-2.5 rounded-full transition-colors"
            >
              <Plus size={14} />
              Create Team
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team: any) => (
              <Link
                key={team.id}
                href={`/team/${team.id}`}
                className="p-5 rounded-2xl bg-white/3 border border-white/8 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-display font-bold text-brand-400">
                    {team.name?.[0]?.toUpperCase()}
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-brand-400 transition-colors mt-1" />
                </div>

                <h3 className="font-display font-semibold mb-1">{team.name}</h3>
                {team.description && (
                  <p className="text-xs text-white/30 mb-3 line-clamp-2">{team.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-white/30 mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    {memberCounts[team.id] || 0} members
                  </div>
                  {team.admin && (
                    <div className="text-white/20">
                      Admin: {team.admin.awpl_id}
                    </div>
                  )}
                </div>

                {team.my_role && (
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      team.my_role === "team_admin"
                        ? "text-brand-400 bg-brand-500/10 border-brand-500/20"
                        : team.my_role === "team_leader"
                        ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                        : "text-white/40 bg-white/5 border-white/10"
                    }`}>
                      {team.my_role === "team_admin" ? "Team Admin" : team.my_role === "team_leader" ? "Leader" : "Member"}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
