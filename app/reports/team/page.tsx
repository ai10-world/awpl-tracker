// app/reports/team/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import { ArrowLeft, ClipboardList, CheckCircle, Star } from "lucide-react";
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

  const allowed = ["platform_admin", "team_admin", "team_leader"];
  if (!allowed.includes(profile.role)) redirect("/reports");

  // Get managed teams
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

  // Fetch reports
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

  // All members
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
  const totalSP = reports.reduce((s, r) => s + (r.sp || 0), 0);

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
            <p className="text-white/35 text-sm">आज की रिपोर्टिंग — Daily submissions</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
            <form method="GET">
              <input type="hidden" name="team" value={selectedTeamId} />
              <input type="date" name="date" defaultValue={selectedDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => { const f = e.target.closest("form") as HTMLFormElement; f?.submit(); }}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
            </form>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-white/3 border border-white/8">
            <div className="font-display font-bold text-xl">{reports.length}/{allMembers.length}</div>
            <div className="text-xs text-white/30">Submitted Today</div>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/8">
            <div className="font-display font-bold text-xl text-yellow-400 flex items-center gap-1">
              ⭐ {totalSP}
            </div>
            <div className="text-xs text-white/30">Total SP Today</div>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/8">
            <div className="font-display font-bold text-xl text-red-400">{notSubmitted.length}</div>
            <div className="text-xs text-white/30">Not Submitted</div>
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
                  {/* Member info */}
                  <div className="flex items-center justify-between gap-3 mb-4">
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
                      {r.sp > 0 && (
                        <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                          ⭐ {r.sp}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[r.status]}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>

                  {/* AWPL report format */}
                  <div className="space-y-2.5 text-sm mb-4">
                    {r.plan && (
                      <div className="flex gap-2">
                        <span className="text-brand-400 font-semibold flex-shrink-0">📋 Plan —</span>
                        <span className="text-white/60 leading-relaxed">{r.plan}</span>
                      </div>
                    )}
                    {r.follow_up && (
                      <div className="flex gap-2">
                        <span className="text-blue-400 font-semibold flex-shrink-0">🔄 Follow Up —</span>
                        <span className="text-white/60 leading-relaxed">{r.follow_up}</span>
                      </div>
                    )}
                    {r.sign_up && (
                      <div className="flex gap-2">
                        <span className="text-green-400 font-semibold flex-shrink-0">✅ Sign Up —</span>
                        <span className="text-white/60 leading-relaxed">{r.sign_up}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs text-white/20">
                      {new Date(r.submitted_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {r.status === "submitted" && <ReportReviewButton reportId={r.id} />}
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
                  <CheckCircle size={13} /> सबने रिपोर्ट भेजी! 🎉
                </div>
              ) : (
                <div className="space-y-2">
                  {notSubmitted.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 py-1.5">
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
