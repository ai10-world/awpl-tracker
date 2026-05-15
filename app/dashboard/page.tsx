// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import {
  Users, TrendingUp, ClipboardList, Star,
  Shield, Plus, ChevronRight, ExternalLink, Calculator, ArrowRight,
} from "lucide-react";

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

  const { data: profile } = await adminSupabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/auth/login");

  const { data: myTeams } = await adminSupabase
    .from("team_members")
    .select(`role, rank, team:teams(id, name, description, admin_id)`)
    .eq("profile_id", user.id);

  let allTeamsCount = 0;
  let allUsersCount = 0;
  if (profile.role === "platform_admin") {
    const { count: tc } = await adminSupabase.from("teams").select("*", { count: "exact", head: true });
    const { count: uc } = await adminSupabase.from("profiles").select("*", { count: "exact", head: true });
    allTeamsCount = tc || 0;
    allUsersCount = uc || 0;
  }

  let myMemberCount = 0;
  if (myTeams && myTeams.length > 0) {
    const teamIds = myTeams.map((t: any) => t.team?.id).filter(Boolean);
    if (teamIds.length > 0) {
      const { count } = await adminSupabase
        .from("team_members").select("*", { count: "exact", head: true }).in("team_id", teamIds);
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
      <nav className="border-b border-white/5 px-4 sm:px-6 py-3 sticky top-0 bg-[#080808]/90 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/logo.png" alt="Asclepius" className="h-8 w-auto rounded-lg" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className={`text-xs px-2 py-0.5 rounded-full border hidden sm:inline-flex ${roleColors[profile.role]}`}>
              {roleLabels[profile.role]}
            </span>
            <span className="text-xs text-white/40 hidden md:block">{profile.full_name}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Welcome + role badge on mobile */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl">
              Hi, {firstName}!
            </h1>
            <p className="text-white/35 text-xs mt-0.5 font-mono">{profile.awpl_id}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border sm:hidden mt-1 ${roleColors[profile.role]}`}>
            {roleLabels[profile.role]}
          </span>
        </div>

        {/* ── TWO COLUMN LAYOUT on lg+ ── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — Main content */}
          <div className="flex-1 min-w-0">

            {/* Stat Cards — smaller, compact */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
              {profile.role === "platform_admin" && <>
                <MiniStat icon={Users} label="Teams" value={allTeamsCount} color="blue" />
                <MiniStat icon={Shield} label="Users" value={allUsersCount} color="brand" />
              </>}
              {profile.role !== "platform_admin" && (
                <MiniStat icon={Users} label="Members" value={myMemberCount} color="brand" />
              )}
              <MiniStat icon={Star} label="My Teams" value={myTeams?.length || 0} color="yellow" />
              <MiniStat icon={ClipboardList} label="Reports" value={0} color="green" soon />
              <MiniStat icon={TrendingUp} label="Tasks" value={0} color="purple" soon />
            </div>

            {/* Quick Actions */}
            <div className="mb-5">
              <p className="text-xs text-white/30 mb-2 font-medium uppercase tracking-wider">Quick Access</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <QuickLink href="/team" icon={Users} label="Team Management" desc="Manage members & roles" hoverColor="brand" />
                {profile.role === "platform_admin" && (
                  <QuickLink href="/admin" icon={Shield} label="Admin Panel" desc="All users & teams" hoverColor="blue" />
                )}
                <a
                  href="https://awpl-tracker-theta.vercel.app/AWPL%20(all%20good).html"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/8 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <Calculator size={13} className="text-brand-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">Price Calculator</div>
                      <div className="text-xs text-white/25 hidden sm:block">AWPL product pricing</div>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-white/20 group-hover:text-brand-400 transition-colors flex-shrink-0" />
                </a>

                <QuickLink href="/reports" icon={ClipboardList} label="Reports" desc="View and manage reports" hoverColor="brand" />

                {/* Coming soon */}
                {[
                  { label: "Daily Reports", desc: "Phase 3" },
                  { label: "Sales Tracker", desc: "Phase 3" },
                ].map((item) => (
                  <div key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 opacity-40 cursor-not-allowed">
                    <div className="text-xs font-medium text-white/50">{item.label}</div>
                    <span className="text-xs text-white/20 border border-white/8 px-1.5 py-0.5 rounded-full">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — My Teams slide panel */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/30 font-medium uppercase tracking-wider">My Teams</p>
                <Link href="/team/create"
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 border border-brand-500/25 px-2 py-1 rounded-full transition-colors">
                  <Plus size={10} /> New
                </Link>
              </div>

              {/* Horizontal scroll on mobile, vertical on desktop */}
              {!myTeams || myTeams.length === 0 ? (
                <div className="text-center py-8 border border-white/5 rounded-2xl">
                  <Users size={24} className="text-white/10 mx-auto mb-2" />
                  <p className="text-white/25 text-xs mb-3">No teams yet</p>
                  <Link href="/team/create"
                    className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-400 text-white text-xs px-4 py-2 rounded-full transition-colors">
                    <Plus size={11} /> Create Team
                  </Link>
                </div>
              ) : (
                <>
                  {/* Mobile: horizontal scroll */}
                  <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-none"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {myTeams.map((membership: any) => (
                      <TeamCard key={membership.team?.id} membership={membership} roleColors={roleColors} roleLabels={roleLabels} compact />
                    ))}
                  </div>

                  {/* Desktop: vertical list */}
                  <div className="hidden lg:flex flex-col gap-2">
                    {myTeams.map((membership: any) => (
                      <TeamCard key={membership.team?.id} membership={membership} roleColors={roleColors} roleLabels={roleLabels} />
                    ))}
                    <Link href="/team"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/8 hover:border-brand-500/25 text-white/30 hover:text-brand-400 text-xs transition-all">
                      View all teams <ArrowRight size={11} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ── Mini Stat Card ─────────────────────────────────────────────
function MiniStat({ icon: Icon, label, value, color, soon }: {
  icon: any; label: string; value: number; color: string; soon?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/15",
    brand: "text-brand-400 bg-brand-500/10 border-brand-500/15",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/15",
    green: "text-green-400 bg-green-500/10 border-green-500/15",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/15",
  };
  return (
    <div className="p-3 rounded-xl bg-white/3 border border-white/8 flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <div className="font-display font-bold text-lg leading-none">
          {soon ? "—" : value}
        </div>
        <div className="text-xs text-white/30 truncate">{label}</div>
      </div>
    </div>
  );
}

// ── Quick Link ─────────────────────────────────────────────────
function QuickLink({ href, icon: Icon, label, desc, hoverColor }: {
  href: string; icon: any; label: string; desc: string; hoverColor: string;
}) {
  const hover = hoverColor === "blue"
    ? "hover:border-blue-500/30 hover:bg-blue-500/5"
    : "hover:border-brand-500/30 hover:bg-brand-500/5";
  const iconStyle = hoverColor === "blue"
    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
    : "bg-brand-500/10 border-brand-500/20 text-brand-400";
  const chevronHover = hoverColor === "blue" ? "group-hover:text-blue-400" : "group-hover:text-brand-400";

  return (
    <Link href={href}
      className={`flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/8 ${hover} transition-all group`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconStyle}`}>
          <Icon size={13} />
        </div>
        <div>
          <div className="text-xs font-medium">{label}</div>
          <div className="text-xs text-white/25 hidden sm:block">{desc}</div>
        </div>
      </div>
      <ChevronRight size={13} className={`text-white/15 ${chevronHover} transition-colors flex-shrink-0`} />
    </Link>
  );
}

// ── Team Card ──────────────────────────────────────────────────
function TeamCard({ membership, roleColors, roleLabels, compact }: {
  membership: any; roleColors: Record<string, string>; roleLabels: Record<string, string>; compact?: boolean;
}) {
  return (
    <Link href={`/team/${membership.team?.id}`}
      className={`flex-shrink-0 block p-3 rounded-xl bg-white/3 border border-white/8 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group ${
        compact ? "w-44" : "w-full"
      }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-display font-bold text-brand-400 text-xs flex-shrink-0">
          {membership.team?.name?.[0]?.toUpperCase()}
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded-full border truncate ${roleColors[membership.role]}`}>
          {roleLabels[membership.role]}
        </span>
      </div>
      <div className="font-medium text-xs truncate">{membership.team?.name}</div>
      {membership.team?.description && !compact && (
        <div className="text-xs text-white/25 mt-0.5 truncate">{membership.team.description}</div>
      )}
    </Link>
  );
}
