// app/reports/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ClipboardList, Star, TrendingUp, Phone, Users, UserPlus, CheckCircle } from "lucide-react";
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
const statusBadge: Record<string, string> = {
  submitted: "badge-gray",
  reviewed: "badge-green",
  flagged: "badge-red",
};

export default async function MyReportsPage() {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await adminSupabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/auth/login");

  const { data: reports } = await adminSupabase
    .from("reports")
    .select(`*, team:teams(name)`)
    .eq("profile_id", user.id)
    .order("report_date", { ascending: false })
    .limit(30);

  const today = new Date().toISOString().split("T")[0];
  const todayReport = reports?.find((r) => r.report_date === today);
  const totalSP = reports?.reduce((s, r) => s + (r.sp || 0), 0) || 0;

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1"
              style={{ color: "var(--text-1)" }}>
              My Reports
            </h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              Your daily activity history
            </p>
          </div>
          <Link href="/reports/submit"
            className="btn btn-primary text-sm px-4 py-2">
            <Plus size={14} />
            {todayReport ? "Edit Today" : "Submit Today"}
          </Link>
        </div>

        {/* Today banner */}
        {!todayReport ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl mb-6"
            style={{ background: "rgba(255,115,10,0.08)", border: "1px solid rgba(255,115,10,0.2)" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,115,10,0.15)" }}>
                <ClipboardList size={15} style={{ color: "var(--brand-400)" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--brand-300)" }}>
                  आज की रिपोर्ट अभी बाकी है
                </p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  Today&apos;s report not submitted yet
                </p>
              </div>
            </div>
            <Link href="/reports/submit" className="btn btn-primary text-xs px-4 py-2 self-start sm:self-auto">
              Submit Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl mb-6"
            style={{ background: "var(--success-dim)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{moodEmoji[todayReport.mood] || "📋"}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: "#4ade80" }}>
                  आज की रिपोर्ट सबमिट हो गई ✓
                </p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {todayReport.team?.name} · SP: {todayReport.sp}
                </p>
              </div>
            </div>
            <Link href="/reports/submit"
              className="btn btn-secondary text-xs px-4 py-2 self-start sm:self-auto">
              Edit
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--warning-dim)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Star size={14} style={{ color: "#fbbf24" }} />
            </div>
            <div>
              <div className="font-display font-bold text-xl" style={{ color: "var(--text-1)" }}>
                {totalSP}
              </div>
              <div className="text-xs" style={{ color: "var(--text-3)" }}>Total SP</div>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,115,10,0.1)", border: "1px solid rgba(255,115,10,0.2)" }}>
              <ClipboardList size={14} style={{ color: "var(--brand-400)" }} />
            </div>
            <div>
              <div className="font-display font-bold text-xl" style={{ color: "var(--text-1)" }}>
                {reports?.length || 0}
              </div>
              <div className="text-xs" style={{ color: "var(--text-3)" }}>Total Reports</div>
            </div>
          </div>
        </div>

        {/* Reports list */}
        {!reports || reports.length === 0 ? (
          <div className="card p-12 text-center">
            <ClipboardList size={36} className="mx-auto mb-3" style={{ color: "var(--text-4)" }} />
            <h3 className="font-display font-semibold mb-2" style={{ color: "var(--text-1)" }}>
              No reports yet
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-3)" }}>
              Submit your first daily report!
            </p>
            <Link href="/reports/submit" className="btn btn-primary text-sm">
              <Plus size={14} /> Submit Report
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="card p-4 sm:p-5 animate-fade-up">

                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl flex-shrink-0">{moodEmoji[r.mood] || "📋"}</span>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
                        {new Date(r.report_date).toLocaleDateString("en-IN", {
                          weekday: "long", day: "numeric", month: "short",
                        })}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-3)" }}>
                        {r.team?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    {r.sp > 0 && (
                      <span className="badge badge-yellow">⭐ {r.sp} SP</span>
                    )}
                    <span className={`badge ${statusBadge[r.status] || "badge-gray"}`}>
                      {r.status}
                    </span>
                  </div>
                </div>

                {/* AWPL format content */}
                <div className="space-y-2.5 text-sm">
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

                {/* Edit today */}
                {r.report_date === today && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-1)" }}>
                    <Link href="/reports/submit"
                      className="text-xs transition-colors"
                      style={{ color: "var(--brand-400)" }}>
                      Edit today&apos;s report →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
