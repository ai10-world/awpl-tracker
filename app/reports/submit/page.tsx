// app/reports/submit/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { submitReport } from "@/lib/actions/reports";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, Loader2, CheckCircle, AlertCircle,
  Smile, Meh, Frown, TrendingUp, Phone, Users, UserPlus,
  ClipboardList, Edit3,
} from "lucide-react";

const moods = [
  { value: "great", label: "Great", icon: "🚀", color: "border-green-500/40 bg-green-500/10 text-green-400" },
  { value: "good", label: "Good", icon: "😊", color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
  { value: "neutral", label: "Neutral", icon: "😐", color: "border-white/20 bg-white/5 text-white/50" },
  { value: "difficult", label: "Difficult", icon: "😓", color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
  { value: "bad", label: "Bad", icon: "😞", color: "border-red-500/40 bg-red-500/10 text-red-400" },
];

export default function SubmitReportPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [existingReport, setExistingReport] = useState<any>(null);
  const [mood, setMood] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const todayISO = new Date().toISOString().split("T")[0];

  // Fetch user's teams
  useEffect(() => {
    const fetchTeams = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch(`/api/reports/my-teams`);
      const data = await res.json();
      setTeams(data.teams || []);
      if (data.teams?.length > 0) setSelectedTeam(data.teams[0].team_id);
      setFetching(false);
    };
    fetchTeams();
  }, []);

  // Fetch existing report when team changes
  useEffect(() => {
    if (!selectedTeam) return;
    const fetchExisting = async () => {
      const res = await fetch(`/api/reports/today?team_id=${selectedTeam}`);
      const data = await res.json();
      if (data.report) {
        setExistingReport(data.report);
        setMood(data.report.mood || "neutral");
      } else {
        setExistingReport(null);
        setMood("neutral");
      }
    };
    fetchExisting();
  }, [selectedTeam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("team_id", selectedTeam);
    formData.set("mood", mood);
    const result = await submitReport(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
    if (result?.success) {
      setSuccess(result.success);
      // Refresh existing report
      const res = await fetch(`/api/reports/today?team_id=${selectedTeam}`);
      const data = await res.json();
      if (data.report) setExistingReport(data.report);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <nav className="border-b border-white/5 px-4 sm:px-6 py-3 sticky top-0 bg-[#080808]/90 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/logo.png" alt="Asclepius" className="h-8 w-auto rounded-lg" />
          </Link>
          <Link href="/reports" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            <ClipboardList size={13} /> My Reports
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-6 transition-colors">
          <ArrowLeft size={15} /> Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              {existingReport ? <Edit3 size={14} className="text-brand-400" /> : <ClipboardList size={14} className="text-brand-400" />}
            </div>
            <h1 className="font-display font-bold text-xl">
              {existingReport ? "Edit Today's Report" : "Submit Daily Report"}
            </h1>
          </div>
          <p className="text-white/35 text-sm ml-10">{today}</p>
        </div>

        {/* Team Selector */}
        {teams.length > 1 && (
          <div className="mb-5">
            <label className="block text-xs text-white/40 mb-1.5 font-medium">Submitting for team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/40"
            >
              {teams.map((t: any) => (
                <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
              ))}
            </select>
          </div>
        )}

        {existingReport && (
          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 mb-5">
            <CheckCircle size={13} />
            Report submitted today. You can edit it until midnight.
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-5">
            <CheckCircle size={15} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mood */}
          <div>
            <label className="block text-xs text-white/40 mb-2 font-medium">How was your day?</label>
            <div className="flex gap-2 flex-wrap">
              {moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    mood === m.value ? m.color : "border-white/8 bg-white/3 text-white/30 hover:border-white/20"
                  }`}
                >
                  <span>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">
              Report Title <span className="text-white/20 font-normal">(optional)</span>
            </label>
            <input
              name="title"
              type="text"
              defaultValue={existingReport?.title || ""}
              placeholder="e.g. Morning field visit, Product demo session…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/40 transition-all"
            />
          </div>

          {/* Main Content */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">
              Daily Report <span className="text-red-400">*</span>
            </label>
            <textarea
              name="content"
              required
              rows={6}
              defaultValue={existingReport?.content || ""}
              placeholder="Write what you did today — visits, calls, demos, follow-ups, challenges, plans for tomorrow…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/40 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Metrics */}
          <div>
            <label className="block text-xs text-white/40 mb-2 font-medium">
              Today&apos;s Numbers <span className="text-white/20 font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: "sales_count", label: "Sales", icon: TrendingUp, default: existingReport?.sales_count || 0 },
                { name: "calls_made", label: "Calls", icon: Phone, default: existingReport?.calls_made || 0 },
                { name: "meetings_done", label: "Meetings", icon: Users, default: existingReport?.meetings_done || 0 },
                { name: "new_recruits", label: "Recruits", icon: UserPlus, default: existingReport?.new_recruits || 0 },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.name} className="bg-white/3 border border-white/8 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon size={12} className="text-white/30" />
                      <label className="text-xs text-white/35">{metric.label}</label>
                    </div>
                    <input
                      name={metric.name}
                      type="number"
                      min="0"
                      defaultValue={metric.default}
                      className="w-full bg-transparent text-lg font-display font-bold text-white focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || fetching || !selectedTeam}
            className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> {existingReport ? "Updating…" : "Submitting…"}</>
              : existingReport ? "Update Report" : "Submit Report"
            }
          </button>
        </form>
      </main>
    </div>
  );
}
