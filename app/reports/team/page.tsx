// app/reports/team/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import { ArrowLeft, ClipboardList, CheckCircle, Star } from "lucide-react";
import { ReportReviewButton } from "@/components/reports/review-button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

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
  submitted: "badge-gray",
  reviewed: "badge-green",
  flagged: "badge-red",
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
    const { data } = await adminSupabase
      .from("teams").select("id, name").order("name");
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

  // All members of selected team
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
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1"
            style={{ color: "var(--text-1)" }}>
            Team Reports
          </h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            आज की रिपोर्टिंग — Daily submissions
          </p>
        </div>

        {/* Filters — plain form, no onChange, just submit button */}
        <form method="GET" className="flex flex-wrap items-center gap-2 mb-6">
          {managedTeams.length > 1 && (
            <select
              name="team"
              defaultValue={selectedTeamId}
              className="rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{
                background: "var(--surface-3)",
                border: "1px solid var(--border-2)",
                color: "var(--text-1)",
              }}
            >
              {managedTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <input
            type="date"
            name="date"
            defaultValue={selectedDate}
            max={new Date().toISOString().split("T")[0]}
            className="rounded-xl px-3 py-2 text-sm focus:outline-none"
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border-2)",
              color: "var(--text-1)",
            }}
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: "var(--brand-500)", color: "white" }}
          >
            Apply
          </button>
        </form>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="card p-4">
            <div className="font-display font-bold text-2xl mb-0.5" style={{ color: "var(--text-1)" }}>
              {reports.length}/{allMembers.length}
            </div>
            <div className="text-xs" style={{ color: "var(--text-3)" }}>Submitted Today</div>
          </div>
          <div className="card p-4">
            <div className="font-display font-bold text-2xl mb-0.5 flex items-center gap-1.5">
              <span style={{ color: "#fbbf24" }}>⭐</span>
              <span style={{ color: "var(--text-1)" }}>{totalSP}</span>
            </div>
            <div className="text-xs" style={{ color: "var(--text-3)" }}>Total SP Today</div>
          </div>
          <div className="card p-4">
            <div className="font-display font-bold text-2xl mb-0.5" style={{ color: notSubmitted.length > 0 ? "#f87171" : "#4ade80" }}>
              {notSubmitted.length}
            </div>
            <div className="text-xs" style={{ color: "var(--text-3)" }}>Not Submitted</div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Reports list */}
          <div className="lg:col-span-2 space-y-3">
            {reports.length === 0 ? (
              <div className="card p-12 text-center">
                <ClipboardList size={32} className="mx-auto mb-3" style={{ color: "var(--text-4)" }} />
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  No reports submitted for this date yet.
                </p>
              </div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="card p-4 animate-fade-up">
                  {/* Member info */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-xs flex-shrink-0"
                        style={{ background: "var(--surface-3)", color: "var(--text-2)" }}>
                        {r.profile?.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm" style={{ color: "var(--text-1)" }}>
                          {r.profile?.full_name}
                        </div>
                        <div className="text-xs font-mono" style={{ color: "var(--text-3)" }}>
                          {r.profile?.awpl_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-lg">{moodEmoji[r.mood] || "📋"}</span>
                      {r.sp > 0 && (
                        <span className="badge badge-yellow">⭐ {r.sp} SP</span>
                      )}
                      <span className={`badge ${statusColor[r.status] || "badge-gray"}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>

                  {/* Report content in AWPL format */}
                  <div className="space-y-2.5 text-sm mb-4">
                    {r.plan && (
                      <div className="flex gap-2">
                        <span className="font-semibold flex-shrink-0" style={{ color: "var(--brand-400)" }}>
                          📋 Plan —
                        </span>
                        <span className="leading-relaxed" style={{ color: "var(--text-2)" }}>{r.plan}</span>
                      </div>
                    )}
                    {r.follow_up && (
                      <div className="flex gap-2">
                        <span className="font-semibold flex-shrink-0" style={{ color: "#60a5fa" }}>
                          🔄 Follow Up —
                        </span>
                        <span className="leading-relaxed" style={{ color: "var(--text-2)" }}>{r.follow_up}</span>
                      </div>
                    )}
                    {r.sign_up && (
                      <div className="flex gap-2">
                        <span className="font-semibold flex-shrink-0" style={{ color: "#4ade80" }}>
                          ✅ Sign Up —
                        </span>
                        <span className="leading-relaxed" style={{ color: "var(--text-2)" }}>{r.sign_up}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid var(--border-1)" }}>
                    <span className="text-xs" style={{ color: "var(--text-4)" }}>
                      {new Date(r.submitted_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit",
                      })}
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
            <div className="card p-4 lg:sticky lg:top-6">
              <h3 className="font-display font-semibold text-sm mb-3"
                style={{ color: "var(--text-2)" }}>
                Not Submitted ({notSubmitted.length})
              </h3>
              {notSubmitted.length === 0 ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: "#4ade80" }}>
                  <CheckCircle size={13} />
                  सबने रिपोर्ट भेजी! 🎉
                </div>
              ) : (
                <div className="space-y-2">
                  {notSubmitted.map((m) => (
                    <div key={m.id} className="flex items-center gap-2.5 py-1.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                        {m.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: "var(--text-1)" }}>
                          {m.full_name}
                        </div>
                        <div className="text-xs font-mono" style={{ color: "var(--text-3)" }}>
                          {m.awpl_id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}