// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import {
  Users,
  TrendingUp,
  ClipboardList,
  Star,
  Shield,
  Plus,
  ChevronRight,
  ExternalLink,
  Calculator,
} from "lucide-react";
import Image from "next/image";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch profile
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  // Fetch teams this user belongs to
  const { data: myTeams } = await adminSupabase
    .from("team_members")
    .select(`role, rank, team:teams(id, name, description, admin_id)`)
    .eq("profile_id", user.id);

  // Platform admin: fetch all stats
  let allTeamsCount = 0;
  let allUsersCount = 0;
  if (profile.role === "platform_admin") {
    const { count: tc } = await adminSupabase
      .from("teams")
      .select("*", { count: "exact", head: true });
    const { count: uc } = await adminSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    allTeamsCount = tc || 0;
    allUsersCount = uc || 0;
  }

  // Team admin/leader: fetch member count
  let myMemberCount = 0;
  if (myTeams && myTeams.length > 0) {
    const teamIds = myTeams.map((t: any) => t.team?.id).filter(Boolean);
    if (teamIds.length > 0) {
      const { count } = await adminSupabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .in("team_id", teamIds);
      myMemberCount = count || 0;
    }
  }

  const roleColors: Record<string, string> = {
    platform_admin: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    team_admin: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    team_leader: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    member: "text-white/50 bg-white/5 border-white/10",
  };

  const roleLabels: Record<string, string> = {
    platform_admin: "Platform Admin",
    team_admin: "Team Admin",
    team_leader: "Team Leader",
    member: "Member",
  };

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#080808]/90 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/logo.png" alt="Asclepius" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className={`text-xs px-2.5 py-1 rounded-full border ${roleColors[profile.role]}`}>
              {roleLabels[profile.role]}
            </span>
            <span className="text-sm text-white/50 hidden sm:block">{profile.full_name}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl mb-1">
            Welcome back, {firstName}!
          </h1>
          <p className="text-white/40 text-sm">
            AWPL ID: <span className="font-mono text-white/60">{profile.awpl_id}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {profile.role === "platform_admin" && (
            <>
              <StatCard icon={Users} label="Total Teams" value={allTeamsCount} color="blue" />
              <StatCard icon={Shield} label="Total Users" value={allUsersCount} color="brand" />
            </>
          )}
          {profile.role !== "platform_admin" && (
            <StatCard icon={Users} label="My Team Members" value={myMemberCount} color="brand" />
          )}
          <StatCard icon={Star} label="My Teams" value={myTeams?.length || 0} color="yellow" />
          <StatCard icon={ClipboardList} label="Reports" value={0} color="green" soon />
          <StatCard icon={TrendingUp} label="Tasks" value={0} color="purple" soon />
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link
            href="/team"
            className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Users size={16} className="text-brand-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Team Management</div>
                <div className="text-xs text-white/30">Manage members & roles</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-brand-400 transition-colors" />
          </Link>

          {(profile.role === "platform_admin") && (
            <Link
              href="/admin"
              className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Shield size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Admin Panel</div>
                  <div className="text-xs text-white/30">All users & teams</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-blue-400 transition-colors" />
            </Link>
          )}

          <a
            href="https://awpl-tracker-theta.vercel.app/AWPL%20(all%20good).html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Calculator size={16} className="text-brand-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Price Calculator</div>
                <div className="text-xs text-white/30">AWPL product pricing</div>
              </div>
            </div>
            <ExternalLink size={14} className="text-white/20 group-hover:text-brand-400 transition-colors" />
          </a>

          {/* Coming soon items */}
          {[
            { label: "Daily Reports", desc: "Submit your progress", phase: "Phase 3" },
            { label: "Sales Tracker", desc: "Track targets & achievements", phase: "Phase 3" },
            { label: "Task Assignment", desc: "Assign & manage tasks", phase: "Phase 3" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 opacity-50 cursor-not-allowed"
            >
              <div>
                <div className="text-sm font-medium text-white/50">{item.label}</div>
                <div className="text-xs text-white/20">{item.desc}</div>
              </div>
              <span className="text-xs text-white/20 border border-white/10 px-2 py-0.5 rounded-full">
                {item.phase}
              </span>
            </div>
          ))}
        </div>

        {/* My Teams */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">My Teams</h2>
            <Link
              href="/team/create"
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 border border-brand-500/30 px-3 py-1.5 rounded-full transition-colors"
            >
              <Plus size={12} />
              Create Team
            </Link>
          </div>

          {!myTeams || myTeams.length === 0 ? (
            <div className="text-center py-12 border border-white/5 rounded-2xl">
              <Users size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm mb-4">You are not part of any team yet.</p>
              <Link
                href="/team/create"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm px-6 py-2.5 rounded-full transition-colors"
              >
                <Plus size={14} />
                Create your first team
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeams.map((membership: any) => (
                <Link
                  key={membership.team?.id}
                  href={`/team/${membership.team?.id}`}
                  className="p-4 rounded-xl bg-white/3 border border-white/8 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-display font-bold text-brand-400 text-sm">
                      {membership.team?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[membership.role]}`}>
                      {roleLabels[membership.role]}
                    </span>
                  </div>
                  <div className="font-medium text-sm mb-1">{membership.team?.name}</div>
                  {membership.team?.description && (
                    <div className="text-xs text-white/30 line-clamp-1">{membership.team.description}</div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  soon,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  soon?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    brand: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="p-4 rounded-xl bg-white/3 border border-white/8">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={15} />
      </div>
      <div className="font-display font-bold text-2xl mb-0.5">
        {soon ? "—" : value}
      </div>
      <div className="text-xs text-white/35">{label}</div>
      {soon && <div className="text-xs text-white/20 mt-0.5">Phase 3</div>}
    </div>
  );
}
