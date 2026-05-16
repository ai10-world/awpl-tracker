// app/reports/submit/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { submitReport } from "@/lib/actions/reports";
import {
  ArrowLeft, Loader2, CheckCircle, AlertCircle,
  ClipboardList, Edit3, Globe,
} from "lucide-react";

const moods = [
  { value: "great", icon: "🚀", label: { en: "Great", hi: "शानदार" }, color: "border-green-500/40 bg-green-500/10 text-green-400" },
  { value: "good", icon: "😊", label: { en: "Good", hi: "अच्छा" }, color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
  { value: "neutral", icon: "😐", label: { en: "Neutral", hi: "ठीक है" }, color: "border-white/20 bg-white/5 text-white/50" },
  { value: "difficult", icon: "😓", label: { en: "Difficult", hi: "मुश्किल" }, color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
  { value: "bad", icon: "😞", label: { en: "Bad", hi: "खराब" }, color: "border-red-500/40 bg-red-500/10 text-red-400" },
];

const text = {
  en: {
    greeting: "Dear Fighter",
    subtitle: "Send Today's Reporting",
    plan: "Plan",
    followUp: "Follow Up",
    signUp: "Sign Up",
    sp: "SP (Sales Points)",
    spHint: "Enter your sales points for today",
    mood: "How was your day?",
    submit: "Submit Report",
    update: "Update Report",
    submitting: "Submitting…",
    updating: "Updating…",
    teamLabel: "Submitting for team",
    editedToday: "Report submitted today. You can edit it until midnight.",
    atLeastOne: "Please fill at least one field.",
    toggle: "हिंदी में",
    planPlaceholder: "What did you plan today?",
    followUpPlaceholder: "Who did you follow up with?",
    signUpPlaceholder: "Who signed up today?",
  },
  hi: {
    greeting: "डियर फाइटर",
    subtitle: "आज की रिपोर्टिंग भेजें",
    plan: "Plan",
    followUp: "Follow Up",
    signUp: "Sign Up",
    sp: "SP (सेल्स पॉइंट्स)",
    spHint: "आज के सेल्स पॉइंट्स लिखें",
    mood: "आज का दिन कैसा रहा?",
    submit: "रिपोर्ट भेजें",
    update: "रिपोर्ट अपडेट करें",
    submitting: "भेजा जा रहा है…",
    updating: "अपडेट हो रहा है…",
    teamLabel: "टीम चुनें",
    editedToday: "आज की रिपोर्ट सबमिट हो गई है। आप इसे रात 12 बजे तक बदल सकते हैं।",
    atLeastOne: "कम से कम एक फील्ड भरें।",
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
  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    const fetchTeams = async () => {
      const res = await fetch("/api/reports/my-teams");
      const data = await res.json();
      setTeams(data.teams || []);
      if (data.teams?.length > 0) setSelectedTeam(data.teams[0].team_id);
      setFetching(false);
    };
    fetchTeams();
  }, []);

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
      const res = await fetch(`/api/reports/today?team_id=${selectedTeam}`);
      const data = await res.json();
      if (data.report) setExistingReport(data.report);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-4 sm:px-6 py-3 sticky top-0 bg-[#080808]/90 backdrop-blur-md z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/logo.png" alt="Asclepius" className="h-8 w-auto rounded-lg" />
          </Link>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-full transition-all"
            >
              <Globe size={12} />
              {t.toggle}
            </button>
            <Link href="/reports" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
              <ClipboardList size={13} />
              <span className="hidden sm:inline">My Reports</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-6 transition-colors">
          <ArrowLeft size={15} /> Dashboard
        </Link>

        {/* AWPL Header Card */}
        <div className="relative overflow-hidden rounded-3xl p-6 mb-6 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(255,115,10,0.18) 0%, rgba(255,115,10,0.06) 100%)",
            border: "1px solid rgba(255,115,10,0.3)",
          }}>
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(ellipse at top, rgba(255,115,10,0.4) 0%, transparent 70%)" }} />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              {existingReport
                ? <Edit3 size={16} className="text-brand-400" />
                : <ClipboardList size={16} className="text-brand-400" />}
            </div>
            <h1 className={`font-display font-bold text-2xl text-white mb-0.5 ${lang === "hi" ? "text-3xl" : ""}`}>
              *{t.greeting}*
            </h1>
            <p className={`text-brand-300/80 font-medium ${lang === "hi" ? "text-base" : "text-sm"}`}>
              *{t.subtitle}*
            </p>
            <p className="text-white/30 text-xs mt-2">{today}</p>
          </div>
        </div>

        {/* Team Selector */}
        {teams.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs text-white/40 mb-1.5 font-medium">{t.teamLabel}</label>
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/40">
              {teams.map((t: any) => (
                <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Already submitted banner */}
        {existingReport && (
          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5 mb-4">
            <CheckCircle size={13} />
            {t.editedToday}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4">
            <CheckCircle size={15} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Mood */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/8">
            <label className="block text-xs text-white/40 mb-3 font-medium">{t.mood}</label>
            <div className="flex gap-2 flex-wrap">
              {moods.map((m) => (
                <button key={m.value} type="button" onClick={() => setMood(m.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    mood === m.value ? m.color : "border-white/8 bg-white/3 text-white/30 hover:border-white/20"
                  }`}>
                  <span>{m.icon}</span>
                  {m.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Report Fields */}
          <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden divide-y divide-white/5">

            {/* Plan */}
            <div className="p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-2">
                <span className="text-brand-400">📋</span>
                {t.plan} —
              </label>
              <textarea
                name="plan"
                rows={2}
                defaultValue={existingReport?.plan || ""}
                placeholder={t.planPlaceholder}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Follow Up */}
            <div className="p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-2">
                <span className="text-blue-400">🔄</span>
                {t.followUp} —
              </label>
              <textarea
                name="follow_up"
                rows={2}
                defaultValue={existingReport?.follow_up || ""}
                placeholder={t.followUpPlaceholder}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Sign Up */}
            <div className="p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-2">
                <span className="text-green-400">✅</span>
                {t.signUp} —
              </label>
              <textarea
                name="sign_up"
                rows={2}
                defaultValue={existingReport?.sign_up || ""}
                placeholder={t.signUpPlaceholder}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* SP */}
            <div className="p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-2">
                <span className="text-yellow-400">⭐</span>
                {t.sp} —
              </label>
              <div className="flex items-center gap-3">
                <input
                  name="sp"
                  type="number"
                  min="0"
                  defaultValue={existingReport?.sp || 0}
                  className="w-28 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-lg font-display font-bold text-brand-400 focus:outline-none focus:border-brand-500/40 text-center"
                />
                <span className="text-xs text-white/25">{t.spHint}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || fetching || !selectedTeam}
            className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> {existingReport ? t.updating : t.submitting}</>
              : existingReport ? t.update : t.submit
            }
          </button>
        </form>
      </main>
    </div>
  );
}
