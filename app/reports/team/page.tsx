// app/reports/team/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import { ArrowLeft, ClipboardList, TrendingUp, Phone, Users, UserPlus, CheckCircle } from "lucide-react";
import { ReportReviewButton } from "@/components/reports/review-button";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const moodEmoji: Record<string, string> = {
  great: "🚀", good: "😊", neutral: "😐", difficult: "😓", bad: "😞",
};
const statusColor: Record<string, string> = {
  submitted: "text-white/30 bg-white/5 border-white/10",
  reviewed: "text-green-400 bg-green-500/10 border-green-500/20",
  flagged: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default async function TeamReportsPage({
  searchParams,
}: {
  searchParams: { date?: string; team?: string };
}) {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await adminSupabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/auth/login");

  // Only team admin, team leader, platform admin can see team reports
  const allowed = ["platform_admin", "team_admin", "team_leader"];
  if (!allowed.includes(profile.role)) redirect("/reports");

  // Get teams user manages
  let managedTeams: any[] = [];
  if (profile.role === "platform_admin") {
    const { data } = await adminSupabase.from("teams").select("id, name").order("name");
    managedTeams = data || [];
  } else {
    const { data } = await adminSupabase
      .from("team_members")
      .select(`team:teams(id, name)`)
      .eq("profile_id", user.id)
      .in("role", ["team_admin", "team_leader"]);
    managedTeams = data?.map((d: any) => d.team).filter(Boolean) || [];
  }

  const selectedTeamId = searchParams.team || managedTeams[0]?.id;
  const selectedDate = searchParams.date || new Date().toISOString().split("T")[0];
  const selectedTeam = managedTeams.find((t) => t.id === selectedTeamId);

  // Fetch reports for selected team and date
  let reports: any[] = [];
  if (selectedTeamId) {
    const { data } = await adminSupabase
      .from("reports")
      .select(`*, profile:profiles(full_name, awpl_id)`)
      .eq("team_id", selectedTeamId)
      .eq("report_date", selectedDate)
      .order("submitted_at", { ascending: false });
    reports = data || [];
  }

  // Fetch all members of selected team to show who hasn't submitted
  let allMembers: any[] = [];
  if (selectedTeamId) {
    const { data } = await adminSupabase
      .from("team_members")
      .select(`profile:profiles(id, full_name, awpl_id)`)
      .eq("team_id", selectedTeamId);
    allMembers = data?.map((d: any) => d.profile).filter(Boolean) || [];
  }

  const submittedIds = new Set(reports.map((r) => r.profile_id));
  const notSubmitted = allMembers.filter((m) => !submittedIds.has(m.id));

  // Team stats for selected date
  const totalSales = reports.reduce((s, r) => s + (r.sales_count || 0), 0);
  const totalCalls = reports.reduce((s, r) => s + (r.calls_made || 0), 0);
  const totalRecruits = reports.reduce((s, r) => s + (r.new_recruits || 0), 0);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <nav className="border-b border-white/5 px-4 sm:px-6 py-3 sticky top-0 bg-[#080808]/90 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/logo.png" alt="Asclepius" className="h-8 w-auto rounded-lg" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/reports" className="text-xs text-white/40 hover:text-white/70 transition-colors">My Reports</Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-6 transition-colors">
          <ArrowLeft size={15} /> Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl mb-0.5">Team Reports</h1>
            <p className="text-white/35 text-sm">Review your team&apos;s daily submissions</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Team selector */}
            {managedTeams.length > 1 && (
              <form method="GET">
                <input type="hidden" name="date" value={selectedDate} />
                <select name="team" defaultValue={selectedTeamId}
                  onChange={(e) => { const f = e.target.closest("form") as HTMLFormElement; f?.submit(); }}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                  {managedTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </form>
            )}

            {/* Date selector */}
            <form method="GET">
              <input type="hidden" name="team" value={selectedTeamId} />
              <input
                type="date"
                name="date"
                defaultValue={selectedDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => { const f = e.target.closest("form") as HTMLFormElement; f?.submit(); }}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </form>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-white/3 border border-white/8">
            <div className="font-display font-bold text-xl">{reports.length}/{allMembers.length}</div>
            <div className="text-xs text-white/30">Submitted</div>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/8">
            <div className="font-display font-bold text-xl text-brand-400">{totalSales}</div>
            <div className="text-xs text-white/30">Total Sales</div>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/8">
            <div className="font-display font-bold text-xl text-blue-400">{totalCalls}</div>
            <div className="text-xs text-white/30">Total Calls</div>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/8">
            <div className="font-display font-bold text-xl text-green-400">{totalRecruits}</div>
            <div className="text-xs text-white/30">Recruits</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Reports */}
          <div className="lg:col-span-2 space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-12 border border-white/5 rounded-2xl">
                <ClipboardList size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No reports submitted for this date yet.</p>
              </div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-white/3 border border-white/8">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center font-display font-semibold text-xs text-white/60 flex-shrink-0">
                        {r.profile?.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{r.profile?.full_name}</div>
                        <div className="text-xs text-white/30 font-mono">{r.profile?.awpl_id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-lg">{moodEmoji[r.mood]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[r.status]}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>

                  {r.title && (
                    <p className="text-xs text-white/40 font-medium mb-1">{r.title}</p>
                  )}
                  <p className="text-sm text-white/60 leading-relaxed mb-3">{r.content}</p>

                  {(r.sales_count > 0 || r.calls_made > 0 || r.meetings_done > 0 || r.new_recruits > 0) && (
                    <div className="flex items-center gap-4 text-xs text-white/30 mb-3 pb-3 border-b border-white/5">
                      {r.sales_count > 0 && <span className="flex items-center gap-1"><TrendingUp size={11} /> {r.sales_count}</span>}
                      {r.calls_made > 0 && <span className="flex items-center gap-1"><Phone size={11} /> {r.calls_made}</span>}
                      {r.meetings_done > 0 && <span className="flex items-center gap-1"><Users size={11} /> {r.meetings_done}</span>}
                      {r.new_recruits > 0 && <span className="flex items-center gap-1"><UserPlus size={11} /> {r.new_recruits}</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/20">
                      {new Date(r.submitted_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {r.status === "submitted" && (
                      <ReportReviewButton reportId={r.id} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Not submitted sidebar */}
          <div>
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 sticky top-20">
              <h3 className="font-display font-semibold text-sm mb-3 text-white/60">
                Not Submitted ({notSubmitted.length})
              </h3>
              {notSubmitted.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle size={13} /> Everyone submitted today! 🎉
                </div>
              ) : (
                <div className="space-y-2">
                  {notSubmitted.map((m) => (
                    <div key={m.id} className="flex items-center gap-2.5 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xs text-red-400/60 flex-shrink-0">
                        {m.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{m.full_name}</div>
                        <div className="text-xs text-white/25 font-mono">{m.awpl_id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
