// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Users, TrendingUp, ClipboardList, Star,
  Shield, Plus, ChevronRight, ArrowRight,
  CheckCircle, AlertCircle, Calculator,
} from "lucide-react";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

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
  if (myTeams && myTeams.length > 0) {
    const teamIds = myTeams.map((t: any) => t.team?.id).filter(Boolean);
    if (teamIds.length > 0) {
      const { count } = await adminSupabase
        .from("team_members").select("*", { count: "exact", head: true }).in("team_id", teamIds);
      myMemberCount = count || 0;
    }
  }

  // Today's report status
  const today = new Date().toISOString().split("T")[0];
  const firstTeamId = (myTeams?.[0]?.team as any)?.id;
  let todayReport = null;
  if (firstTeamId) {
    const { data } = await adminSupabase
      .from("reports").select("id, sp, mood").eq("profile_id", user.id)
      .eq("report_date", today).single();
    todayReport = data;
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">

        {/* Welcome header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: "var(--text-3)" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">
                Welcome back, <span className="text-gradient">{firstName}</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className={`badge ${roleColors[profile.role]}`}>{profile.role.replace("_", " ")}</span>
                <span className="font-mono text-xs" style={{ color: "var(--text-3)" }}>{profile.awpl_id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's report banner */}
        {firstTeamId && (
          <div className="mb-6 animate-fade-up">
            {!todayReport ? (
              <div className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: "rgba(255,115,10,0.08)", border: "1px solid rgba(255,115,10,0.2)" }}>
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} style={{ color: "var(--brand-400)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--brand-300)" }}>
                      आज की रिपोर्ट अभी बाकी है
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>Submit your daily report</p>
                  </div>
                </div>
                <Link href="/reports/submit"
                  className="btn btn-primary text-xs px-4 py-2">
                  Submit Now
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: "var(--success-dim)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} style={{ color: "var(--success)" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#4ade80" }}>
                      आज की रिपोर्ट सबमिट हो गई ✓
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      SP: {todayReport.sp} · {todayReport.mood}
                    </p>
                  </div>
                </div>
                <Link href="/reports/submit"
                  className="btn btn-ghost text-xs px-3 py-1.5 border"
                  style={{ borderColor: "var(--border-2)" }}>
                  Edit
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {profile.role === "platform_admin" && <>
            <StatCard icon={Shield} label="Total Teams" value={allTeamsCount} color="blue" delay={0} />
            <StatCard icon={Users} label="Total Users" value={allUsersCount} color="brand" delay={75} />
          </>}
          {profile.role !== "platform_admin" && (
            <StatCard icon={Users} label="Team Members" value={myMemberCount} color="brand" delay={0} />
          )}
          <StatCard icon={Star} label="My Teams" value={myTeams?.length || 0} color="yellow" delay={150} />
          <StatCard icon={ClipboardList} label="Reports" value={0} color="green" delay={225} soon />
          <StatCard icon={TrendingUp} label="Tasks" value={0} color="purple" delay={300} soon />
        </div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Quick Actions — left */}
          <div className="lg:col-span-2 space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
              Quick Access
            </p>
            <ActionCard href="/reports/submit" icon={ClipboardList} label="Submit Report" desc="डियर फाइटर - Daily report" color="brand" />
            <ActionCard href="/team" icon={Users} label="My Teams" desc="Manage members & roles" color="brand" />
            {profile.role === "platform_admin" && (
              <ActionCard href="/admin" icon={Shield} label="Admin Panel" desc="All users & teams" color="blue" />
            )}
            {["platform_admin", "team_admin", "team_leader"].includes(profile.role) && (
              <ActionCard href="/reports/team" icon={TrendingUp} label="Team Reports" desc="See team submissions" color="green" />
            )}
            <a href="https://awpl-tracker-theta.vercel.app/AWPL%20(all%20good).html"
              target="_blank" rel="noopener noreferrer"
              className="card card-interactive flex items-center justify-between p-3.5 group transition-all"
              style={{ textDecoration: "none" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,115,10,0.1)", border: "1px solid rgba(255,115,10,0.2)" }}>
                  <Calculator size={15} style={{ color: "var(--brand-400)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>Price Calculator</p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>AWPL product pricing</p>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: "var(--text-4)" }} />
            </a>
          </div>

          {/* My Teams — right */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                My Teams
              </p>
              <Link href="/team/create"
                className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-100 opacity-70"
                style={{ color: "var(--brand-400)" }}>
                <Plus size={12} /> New Team
              </Link>
            </div>

            {!myTeams || myTeams.length === 0 ? (
              <EmptyTeams />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {myTeams.map((m: any, i: number) => (
                  <Link key={m.team?.id} href={`/team/${m.team?.id}`}
                    className="card card-interactive p-4 group transition-all animate-fade-up"
                    style={{ animationDelay: `${i * 75}ms`, textDecoration: "none" }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm"
                        style={{ background: "rgba(255,115,10,0.12)", color: "var(--brand-400)", border: "1px solid rgba(255,115,10,0.2)" }}>
                        {m.team?.name?.[0]?.toUpperCase()}
                      </div>
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5"
                        style={{ color: "var(--text-4)" }} />
                    </div>
                    <p className="font-display font-semibold text-sm mb-1 truncate" style={{ color: "var(--text-1)" }}>
                      {m.team?.name}
                    </p>
                    {m.team?.description && (
                      <p className="text-xs line-clamp-1 mb-2" style={{ color: "var(--text-3)" }}>
                        {m.team.description}
                      </p>
                    )}
                    <span className={`badge ${
                      m.role === "team_admin" ? "badge-brand" :
                      m.role === "team_leader" ? "badge-yellow" : "badge-gray"
                    }`}>
                      {m.role.replace("_", " ")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color, delay, soon }: any) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue:   { bg: "var(--info-dim)", text: "#60a5fa", border: "rgba(59,130,246,0.2)" },
    brand:  { bg: "rgba(255,115,10,0.1)", text: "var(--brand-400)", border: "rgba(255,115,10,0.2)" },
    yellow: { bg: "var(--warning-dim)", text: "#fbbf24", border: "rgba(245,158,11,0.2)" },
    green:  { bg: "var(--success-dim)", text: "#4ade80", border: "rgba(34,197,94,0.2)" },
    purple: { bg: "rgba(168,85,247,0.1)", text: "#c084fc", border: "rgba(168,85,247,0.2)" },
  };
  const c = colorMap[color];
  return (
    <div className="card p-4 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon size={15} style={{ color: c.text }} />
        </div>
        {soon && <span className="badge badge-gray">Soon</span>}
      </div>
      <div className="font-display font-bold text-2xl mb-0.5" style={{ color: "var(--text-1)" }}>
        {soon ? "—" : value}
      </div>
      <div className="text-xs" style={{ color: "var(--text-3)" }}>{label}</div>
    </div>
  );
}

function ActionCard({ href, icon: Icon, label, desc, color }: any) {
  const styles: Record<string, { iconBg: string; iconText: string; iconBorder: string }> = {
    brand: { iconBg: "rgba(255,115,10,0.1)", iconText: "var(--brand-400)", iconBorder: "rgba(255,115,10,0.2)" },
    blue:  { iconBg: "var(--info-dim)", iconText: "#60a5fa", iconBorder: "rgba(59,130,246,0.2)" },
    green: { iconBg: "var(--success-dim)", iconText: "#4ade80", iconBorder: "rgba(34,197,94,0.2)" },
  };
  const s = styles[color] || styles.brand;

  return (
    <Link href={href}
      className="card card-interactive flex items-center justify-between p-3.5 group transition-all"
      style={{ textDecoration: "none" }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: s.iconBg, border: `1px solid ${s.iconBorder}` }}>
          <Icon size={15} style={{ color: s.iconText }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{label}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{desc}</p>
        </div>
      </div>
      <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5"
        style={{ color: "var(--text-4)" }} />
    </Link>
  );
}

function EmptyTeams() {
  return (
    <div className="card p-8 text-center animate-fade-up">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "var(--surface-3)" }}>
        <Users size={24} style={{ color: "var(--text-4)" }} />
      </div>
      <h3 className="font-display font-semibold mb-1" style={{ color: "var(--text-1)" }}>No teams yet</h3>
      <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>
        Create your first team and start adding members.
      </p>
      <Link href="/team/create" className="btn btn-primary text-sm">
        <Plus size={14} /> Create Team
      </Link>
    </div>
  );
}
