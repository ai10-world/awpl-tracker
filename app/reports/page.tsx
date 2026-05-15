// app/reports/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import { ArrowLeft, Plus, ClipboardList, TrendingUp, Phone, Users, UserPlus } from "lucide-react";

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

  // Fetch my reports with team name
  const { data: reports } = await adminSupabase
    .from("reports")
    .select(`*, team:teams(name)`)
    .eq("profile_id", user.id)
    .order("report_date", { ascending: false })
    .limit(30);

  const today = new Date().toISOString().split("T")[0];
  const todayReport = reports?.find((r) => r.report_date === today);

  // Total stats
  const totalSales = reports?.reduce((s, r) => s + (r.sales_count || 0), 0) || 0;
  const totalCalls = reports?.reduce((s, r) => s + (r.calls_made || 0), 0) || 0;
  const totalRecruits = reports?.reduce((s, r) => s + (r.new_recruits || 0), 0) || 0;

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

        {/* Today's status banner */}
        {!todayReport ? (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-500/8 border border-brand-500/20 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <ClipboardList size={15} className="text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-300">Report not submitted yet</p>
                <p className="text-xs text-white/30">Submit your daily report for today</p>
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
                <p className="text-sm font-medium text-green-300">Today&apos;s report submitted ✓</p>
                <p className="text-xs text-white/30">{todayReport.title || "Daily Report"} · {todayReport.team?.name}</p>
              </div>
            </div>
            <Link href="/reports/submit"
              className="text-xs text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-full transition-colors">
              Edit
            </Link>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: TrendingUp, label: "Total Sales", value: totalSales, color: "brand" },
            { icon: Phone, label: "Total Calls", value: totalCalls, color: "blue" },
            { icon: UserPlus, label: "Recruits", value: totalRecruits, color: "green" },
          ].map((s) => {
            const Icon = s.icon;
            const colors: Record<string, string> = {
              brand: "text-brand-400 bg-brand-500/10 border-brand-500/15",
              blue: "text-blue-400 bg-blue-500/10 border-blue-500/15",
              green: "text-green-400 bg-green-500/10 border-green-500/15",
            };
            return (
              <div key={s.label} className="p-3 rounded-xl bg-white/3 border border-white/8 flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${colors[s.color]}`}>
                  <Icon size={13} />
                </div>
                <div>
                  <div className="font-display font-bold text-lg leading-none">{s.value}</div>
                  <div className="text-xs text-white/30 truncate">{s.label}</div>
                </div>
              </div>
            );
          })}
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
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{moodEmoji[r.mood] || "📋"}</span>
                    <div>
                      <div className="font-medium text-sm">{r.title || "Daily Report"}</div>
                      <div className="text-xs text-white/30">
                        {new Date(r.report_date).toLocaleDateString("en-IN", {
                          weekday: "short", day: "numeric", month: "short",
                        })} · {r.team?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${moodColor[r.mood]}`}>
                      {r.mood}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-white/55 leading-relaxed line-clamp-3 mb-3">{r.content}</p>

                {/* Metrics */}
                {(r.sales_count > 0 || r.calls_made > 0 || r.meetings_done > 0 || r.new_recruits > 0) && (
                  <div className="flex items-center gap-4 text-xs text-white/30 pt-3 border-t border-white/5">
                    {r.sales_count > 0 && <span className="flex items-center gap-1"><TrendingUp size={11} /> {r.sales_count} sales</span>}
                    {r.calls_made > 0 && <span className="flex items-center gap-1"><Phone size={11} /> {r.calls_made} calls</span>}
                    {r.meetings_done > 0 && <span className="flex items-center gap-1"><Users size={11} /> {r.meetings_done} meetings</span>}
                    {r.new_recruits > 0 && <span className="flex items-center gap-1"><UserPlus size={11} /> {r.new_recruits} recruits</span>}
                  </div>
                )}

                {/* Edit button for today */}
                {r.report_date === today && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <Link href="/reports/submit"
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      Edit today's report →
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
