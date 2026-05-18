// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StreakCard } from "@/components/streaks/streak-card";
import {
  StatCard,
  ActionCard,
  TeamMiniCard,
  EmptyTeams,
  ActivitySection,
  CalculatorLink,
} from "@/components/dashboard/dashboard-client";
import { CheckCircle, AlertCircle } from "lucide-react";

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

  let allTeamsCount = 0, allUsersCount = 0;
  if (profile.role === "platform_admin") {
    const { count: tc } = await adminSupabase.from("teams").select("*", { count: "exact", head: true });
    const { count: uc } = await adminSupabase.from("profiles").select("*", { count: "exact", head: true });
    allTeamsCount = tc || 0;
    allUsersCount = uc || 0;
  }

  let myMemberCount = 0;
  const teamIds = myTeams?.map((t: any) => t.team?.id).filter(Boolean) || [];
  if (teamIds.length > 0) {
    const { count } = await adminSupabase
      .from("team_members").select("*", { count: "exact", head: true }).in("team_id", teamIds);
    myMemberCount = count || 0;
  }

  // Today's report
  const today = new Date().toISOString().split("T")[0];
  const firstTeamId = (myTeams?.[0]?.team as any)?.id;
  let todayReport = null;
  const shouldShowReport = profile.role !== "platform_admin";
  if (firstTeamId && shouldShowReport) {
    const { data } = await adminSupabase
      .from("reports").select("id, sp, mood")
      .eq("profile_id", user.id).eq("report_date", today).single();
    todayReport = data;
  }

  // Streak
  let streak = null;
  if (shouldShowReport) {
    const { data } = await adminSupabase
      .from("streaks").select("*").eq("profile_id", user.id).single();
    streak = data;
  }

  // Activity feed
  let feedEvents: any[] = [];
  if (teamIds.length > 0) {
    const { data } = await adminSupabase
      .from("activity_feed")
      .select(`*, team:teams(name)`)
      .in("team_id", teamIds)
      .order("created_at", { ascending: false })
      .limit(8);
    feedEvents = data || [];
  }

  const firstName = profile.full_name?.split(" ")[0] || "there";
  const roleColors: Record<string, string> = {
    platform_admin: "badge-blue",
    team_admin: "badge-brand",
    team_leader: "badge-yellow",
    member: "badge-gray",
  };

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">

        {/* ── Welcome header ──────────────────────── */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm mb-1" style={{ color: "var(--text-3)" }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric", month: "long",
            })}
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl mb-2">
            Welcome back,{" "}
            <span className="text-gradient">{firstName}</span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${roleColors[profile.role]}`}>
              {profile.role.replace(/_/g, " ")}
            </span>
            <span className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
              {profile.awpl_id}
            </span>
          </div>
        </div>

        {/* ── Today's report banner ────────────────── */}
        {firstTeamId && shouldShowReport && (
          <div className="mb-5 animate-fade-up">
            {!todayReport ? (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl"
                style={{
                  background: "rgba(255,115,10,0.08)",
                  border: "1px solid rgba(255,115,10,0.2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} style={{ color: "var(--brand-400)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--brand-300)" }}>
                      आज की रिपोर्ट अभी बाकी है
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      Submit now to keep your streak alive!
                    </p>
                  </div>
                </div>
                <Link
                  href="/reports/submit"
                  className="btn btn-primary text-xs px-4 py-2 self-start sm:self-auto"
                >
                  Submit Now
                </Link>
              </div>
            ) : (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl"
                style={{
                  background: "var(--success-dim)",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} style={{ color: "var(--success)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#4ade80" }}>
                      आज की रिपोर्ट सबमिट हो गई ✓
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      SP: {todayReport.sp} · Keep the streak going!
                    </p>
                  </div>
                </div>
                <Link
                  href="/reports/submit"
                  className="btn btn-secondary text-xs px-4 py-2 self-start sm:self-auto"
                >
                  Edit
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Stats ───────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
          {profile.role === "platform_admin" && (
            <>
              <StatCard icon="shield" label="Total Teams" value={allTeamsCount} color="blue" delay={0} />
              <StatCard icon="users" label="Total Users" value={allUsersCount} color="brand" delay={75} />
            </>
          )}
          {profile.role !== "platform_admin" && (
            <StatCard icon="users" label="Members" value={myMemberCount} color="brand" delay={0} />
          )}
          <StatCard icon="star" label="My Teams" value={myTeams?.length || 0} color="yellow" delay={75} />
          <StatCard icon="clipboardList" label="Reports" value={0} color="green" delay={150} soon />
          <StatCard icon="trendingUp" label="Tasks" value={0} color="purple" delay={225} soon />
        </div>

        {/* ── Main 3-column grid ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

          {/* Left — Quick actions + Teams */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: "var(--text-3)" }}>
                Quick Access
              </p>
              <div className="space-y-2">
                {shouldShowReport && (
                  <ActionCard
                    href="/reports/submit"
                    icon="clipboardList"
                    label="Submit Report"
                    desc="डियर फाइटर daily report"
                    color="brand"
                  />
                )}
                <ActionCard href="/team" icon="users" label="My Teams" desc="Manage members & roles" color="brand" />
                {profile.role === "platform_admin" && (
                  <ActionCard href="/admin" icon="shield" label="Admin Panel" desc="All users & teams" color="blue" />
                )}
                {["platform_admin", "team_admin", "team_leader"].includes(profile.role) && (
                  <ActionCard href="/reports/team" icon="trendingUp" label="Team Reports" desc="See submissions" color="green" />
                )}
                <CalculatorLink />
              </div>
            </div>

            {/* My Teams */}
            {myTeams && myTeams.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium uppercase tracking-widest"
                    style={{ color: "var(--text-3)" }}>
                    My Teams
                  </p>
                  <Link href="/team/create" className="text-xs" style={{ color: "var(--brand-400)" }}>
                    + New
                  </Link>
                </div>
                <div className="space-y-2">
                  {myTeams.slice(0, 3).map((m: any) => (
                    <TeamMiniCard key={m.team?.id} team={m} />
                  ))}
                  {myTeams.length > 3 && (
                    <Link
                      href="/team"
                      className="text-xs text-center block py-2 transition-colors"
                      style={{ color: "var(--text-3)" }}
                    >
                      +{myTeams.length - 3} more teams →
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <EmptyTeams />
            )}
          </div>

          {/* Middle — Streak */}
          {shouldShowReport && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: "var(--text-3)" }}>
                My Streak
              </p>
              <StreakCard streak={streak} />
            </div>
          )}

          {/* Right — Activity Feed */}
          <div className={shouldShowReport ? "" : "lg:col-span-2"}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}>
                Team Activity
              </p>
              <Link href="/activity" className="text-xs" style={{ color: "var(--brand-400)" }}>
                View all →
              </Link>
            </div>
            <ActivitySection
              events={feedEvents}
              showTeamName={teamIds.length > 1}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

