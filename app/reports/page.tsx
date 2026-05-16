// app/reports/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import { ArrowLeft, Plus, ClipboardList, Star } from "lucide-react";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const moodEmoji: Record<string, string> = {
  great: "🚀", good: "😊", neutral: "😐", difficult: "😓", bad: "😞",
};
const moodColor: Record<string, string> = {
  great: "text-green-400 bg-green-500/10 border-green-500/20",
  good: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  neutral: "text-white/40 bg-white/5 border-white/10",
  difficult: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  bad: "text-red-400 bg-red-500/10 border-red-500/20",
};
const statusColor: Record<string, string> = {
  submitted: "text-white/30 bg-white/5 border-white/10",
  reviewed: "text-green-400 bg-green-500/10 border-green-500/20",
  flagged: "text-red-400 bg-red-500/10 border-red-500/20",
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
  const totalReports = reports?.length || 0;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <nav className="border-b border-white/5 px-4 sm:px-6 py-3 sticky top-0 bg-[#080808]/90 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/logo.png" alt="Asclepius" className="h-8 w-auto rounded-lg" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 hidden sm:block">{profile.full_name}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-6 transition-colors">
          <ArrowLeft size={15} /> Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl mb-0.5">My Reports</h1>
            <p className="text-white/35 text-sm">Your daily activity history</p>
          </div>
          <Link href="/reports/submit"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm px-4 py-2 rounded-full transition-colors">
            <Plus size={14} />
            {todayReport ? "Edit Today" : "Submit Today"}
          </Link>
        </div>

        {/* Today status */}
        {!todayReport ? (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-500/8 border border-brand-500/20 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <ClipboardList size={15} className="text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-300">आज की रिपोर्ट अभी बाकी है</p>
                <p className="text-xs text-white/30">Today&apos;s report not submitted yet</p>
              </div>
            </div>
            <Link href="/reports/submit"
              className="text-xs bg-brand-500 hover:bg-brand-400 text-white px-3 py-1.5 rounded-full transition-colors">
              Submit Now
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-green-500/8 border border-green-500/20 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{moodEmoji[todayReport.mood] || "📋"}</span>
              <div>
                <p className="text-sm font-medium text-green-300">आज की रिपोर्ट सबमिट हो गई ✓</p>
                <p className="text-xs text-white/30">{todayReport.team?.name} · SP: {todayReport.sp}</p>
              </div>
            </div>
            <Link href="/reports/submit"
              className="text-xs text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-full transition-colors">
              Edit
            </Link>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-white/3 border border-white/8 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/15 flex items-center justify-center flex-shrink-0">
              <Star size={13} className="text-yellow-400" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none">{totalSP}</div>
              <div className="text-xs text-white/30">Total SP</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/8 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center flex-shrink-0">
              <ClipboardList size={13} className="text-brand-400" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none">{totalReports}</div>
              <div className="text-xs text-white/30">Total Reports</div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {!reports || reports.length === 0 ? (
          <div className="text-center py-16 border border-white/5 rounded-2xl">
            <ClipboardList size={36} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm mb-4">No reports yet. Submit your first one!</p>
            <Link href="/reports/submit"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm px-6 py-2.5 rounded-full transition-colors">
              <Plus size={14} /> Submit Report
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-white/3 border border-white/8 hover:border-white/12 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{moodEmoji[r.mood] || "📋"}</span>
                    <div>
                      <div className="text-xs font-medium text-white/60">
                        {new Date(r.report_date).toLocaleDateString("en-IN", {
                          weekday: "long", day: "numeric", month: "short",
                        })}
                      </div>
                      <div className="text-xs text-white/25">{r.team?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {r.sp > 0 && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                        ⭐ {r.sp} SP
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                </div>

                {/* Report content in AWPL format */}
                <div className="space-y-2.5 text-sm">
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

                {/* Edit today */}
                {r.report_date === today && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <Link href="/reports/submit" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      Edit today&apos;s report →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
