// app/reports/submit/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { submitReport } from "@/lib/actions/reports";
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Globe, ClipboardList, Edit3, Flame } from "lucide-react";

const moods = [
  { value: "great", icon: "🚀", label: { en: "Great", hi: "शानदार" }, color: "border-green-500/40 bg-green-500/10 text-green-400" },
  { value: "good", icon: "😊", label: { en: "Good", hi: "अच्छा" }, color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
  { value: "neutral", icon: "😐", label: { en: "Neutral", hi: "ठीक है" }, color: "border-white/20 bg-white/5 text-white/50" },
  { value: "difficult", icon: "😓", label: { en: "Difficult", hi: "मुश्किल" }, color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
  { value: "bad", icon: "😞", label: { en: "Bad", hi: "खराब" }, color: "border-red-500/40 bg-red-500/10 text-red-400" },
];

const milestoneEmoji: Record<number, string> = {
  7: "🌟", 14: "⚡", 21: "💪", 30: "🔥", 50: "💎", 100: "👑",
};

const text = {
  en: {
    greeting: "Dear Fighter", subtitle: "Send Today's Reporting",
    plan: "Plan", followUp: "Follow Up", signUp: "Sign Up",
    sp: "SP (Sales Points)", spHint: "Today's sales points",
    mood: "How was your day?",
    submit: "Submit Report", update: "Update Report",
    submitting: "Submitting…", updating: "Updating…",
    teamLabel: "Select Team",
    editedToday: "Report submitted. You can edit until midnight.",
    toggle: "हिंदी में",
    planPlaceholder: "What did you plan today?",
    followUpPlaceholder: "Who did you follow up with?",
    signUpPlaceholder: "Who signed up today?",
  },
  hi: {
    greeting: "डियर फाइटर", subtitle: "आज की रिपोर्टिंग भेजें",
    plan: "Plan", followUp: "Follow Up", signUp: "Sign Up",
    sp: "SP (सेल्स पॉइंट्स)", spHint: "आज के सेल्स पॉइंट्स",
    mood: "आज का दिन कैसा रहा?",
    submit: "रिपोर्ट भेजें", update: "रिपोर्ट अपडेट करें",
    submitting: "भेजा जा रहा है…", updating: "अपडेट हो रहा है…",
    teamLabel: "टीम चुनें",
    editedToday: "रिपोर्ट सबमिट हो गई। रात 12 बजे तक बदल सकते हैं।",
    toggle: "In English",
    planPlaceholder: "आज क्या प्लान किया?",
    followUpPlaceholder: "किससे फॉलो अप किया?",
    signUpPlaceholder: "आज किसने साइन अप किया?",
  },
};

export default function SubmitReportPage() {
  const [lang, setLang] = useState<"en" | "hi">("hi");
  const t = text[lang];
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [existingReport, setExistingReport] = useState<any>(null);
  const [mood, setMood] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streakInfo, setStreakInfo] = useState<{ streak: number; milestone: boolean; milestone_days: number } | null>(null);

  useEffect(() => {
    fetch("/api/reports/my-teams")
      .then((r) => r.json())
      .then((data) => {
        setTeams(data.teams || []);
        if (data.teams?.length > 0) setSelectedTeam(data.teams[0].team_id);
        setFetching(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;
    fetch(`/api/reports/today?team_id=${selectedTeam}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.report) { setExistingReport(data.report); setMood(data.report.mood || "neutral"); }
        else { setExistingReport(null); setMood("neutral"); }
      });
  }, [selectedTeam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStreakInfo(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("team_id", selectedTeam);
    fd.set("mood", mood);
    const result = await submitReport(fd);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      // Show streak info
      if (result?.streak) {
        setStreakInfo({
          streak: result.streak,
          milestone: result.milestone || false,
          milestone_days: result.milestone_days || 0,
        });
      }
      // Refresh existing report
      fetch(`/api/reports/today?team_id=${selectedTeam}`)
        .then((r) => r.json())
        .then((data) => { if (data.report) setExistingReport(data.report); });
    }
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8" style={{ background: "var(--bg)" }}>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b sticky top-0 z-10"
        style={{ borderColor: "var(--border-1)", background: "var(--surface-1)" }}>
        <Link href="/reports" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={16} /> Reports
        </Link>
        <button onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
          style={{ borderColor: "var(--border-2)", color: "var(--text-3)" }}>
          <Globe size={12} /> {t.toggle}
        </button>
      </div>

      <div className="lg:ml-60">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-8">

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <Link href="/reports" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-3)" }}>
              <ArrowLeft size={15} /> My Reports
            </Link>
            <button onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
              style={{ borderColor: "var(--border-2)", color: "var(--text-3)" }}>
              <Globe size={12} /> {t.toggle}
            </button>
          </div>

          {/* AWPL Header Card */}
          <div className="relative overflow-hidden rounded-3xl p-6 mb-5 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(255,115,10,0.15) 0%, rgba(255,115,10,0.05) 100%)",
              border: "1px solid rgba(255,115,10,0.25)",
            }}>
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top, rgba(255,115,10,0.4) 0%, transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-1">
                {existingReport
                  ? <Edit3 size={15} style={{ color: "var(--brand-400)" }} />
                  : <ClipboardList size={15} style={{ color: "var(--brand-400)" }} />}
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl mb-0.5" style={{ color: "var(--text-1)" }}>
                *{t.greeting}*
              </h1>
              <p className="font-medium text-sm sm:text-base" style={{ color: "rgba(255,163,74,0.8)" }}>
                *{t.subtitle}*
              </p>
              <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>
                {new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </p>
            </div>
          </div>

          {/* Team selector */}
          {teams.length > 1 && (
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>
                {t.teamLabel}
              </label>
              <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="input-base">
                {teams.map((t: any) => (
                  <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Streak celebration */}
          {streakInfo && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 animate-scale-in"
              style={{
                background: streakInfo.milestone ? "rgba(251,191,36,0.12)" : "rgba(249,115,22,0.1)",
                border: `1px solid ${streakInfo.milestone ? "rgba(251,191,36,0.3)" : "rgba(249,115,22,0.25)"}`,
              }}>
              <Flame size={18} style={{ color: streakInfo.milestone ? "#fbbf24" : "#f97316" }} />
              <div className="flex-1">
                {streakInfo.milestone ? (
                  <>
                    <p className="text-sm font-semibold" style={{ color: "#fbbf24" }}>
                      {milestoneEmoji[streakInfo.milestone_days]} {streakInfo.milestone_days}-Day Milestone!
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      Amazing! You&apos;ve hit a {streakInfo.milestone_days}-day streak!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold" style={{ color: "#f97316" }}>
                      🔥 {streakInfo.streak}-Day Streak!
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      Report submitted! Keep it going tomorrow.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {existingReport && !streakInfo && (
            <div className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl mb-4"
              style={{ background: "var(--success-dim)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
              <CheckCircle size={13} /> {t.editedToday}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm px-4 py-3 rounded-xl mb-4"
              style={{ background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mood */}
            <div className="card p-4">
              <label className="block text-xs font-medium mb-3" style={{ color: "var(--text-3)" }}>
                {t.mood}
              </label>
              <div className="flex gap-2 flex-wrap">
                {moods.map((m) => (
                  <button key={m.value} type="button" onClick={() => setMood(m.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      mood === m.value ? m.color : ""
                    }`}
                    style={mood !== m.value ? { borderColor: "var(--border-1)", background: "transparent", color: "var(--text-3)" } : {}}>
                    <span>{m.icon}</span> {m.label[lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* Report fields */}
            <div className="card overflow-hidden" style={{ borderColor: "var(--border-1)" }}>
              {[
                { name: "plan", emoji: "📋", label: t.plan, placeholder: t.planPlaceholder, color: "var(--brand-400)", defaultValue: existingReport?.plan },
                { name: "follow_up", emoji: "🔄", label: t.followUp, placeholder: t.followUpPlaceholder, color: "#60a5fa", defaultValue: existingReport?.follow_up },
                { name: "sign_up", emoji: "✅", label: t.signUp, placeholder: t.signUpPlaceholder, color: "#4ade80", defaultValue: existingReport?.sign_up },
              ].map((field, i) => (
                <div key={field.name} className="p-4" style={{ borderTop: i > 0 ? `1px solid var(--border-1)` : "none" }}>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: field.color }}>
                    <span>{field.emoji}</span> {field.label} —
                  </label>
                  <textarea name={field.name} rows={2}
                    key={`${field.name}-${existingReport?.id}`}
                    defaultValue={field.defaultValue || ""}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent text-sm focus:outline-none resize-none leading-relaxed"
                    style={{ color: "var(--text-1)" }} />
                </div>
              ))}

              {/* SP */}
              <div className="p-4" style={{ borderTop: `1px solid var(--border-1)` }}>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "#fbbf24" }}>
                  ⭐ {t.sp} —
                </label>
                <div className="flex items-center gap-3">
                  <input name="sp" type="number" min="0"
                    key={`sp-${existingReport?.id}`}
                    defaultValue={existingReport?.sp || 0}
                    className="w-24 text-center text-2xl font-display font-bold rounded-xl px-3 py-2 focus:outline-none transition-all"
                    style={{ background: "var(--surface-3)", border: "1px solid var(--border-2)", color: "#fbbf24" }} />
                  <span className="text-xs" style={{ color: "var(--text-4)" }}>{t.spHint}</span>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading || fetching || !selectedTeam}
              className="btn btn-primary w-full py-3.5 text-sm font-semibold">
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> {existingReport ? t.updating : t.submitting}</>
                : existingReport ? t.update : t.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
