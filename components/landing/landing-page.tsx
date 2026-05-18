// components/landing/landing-page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users, TrendingUp, ClipboardList, Bell,
  ChevronRight, Globe, Shield, Star, ArrowRight, Menu, X,
} from "lucide-react";

const content = {
  en: {
    badge: "AWPL Network Platform",
    headline: ["Your Team.", "Your Numbers.", "Your Growth."],
    sub: "Track daily performance, manage your team hierarchy, log recruitment and sales — all in one place built for AWPL network leaders.",
    cta_primary: "Create Account",
    cta_secondary: "Sign In",
    features_title: "Everything your team needs",
    features: [
      { icon: Users, title: "Team Management", desc: "Build and organise your downline. Assign leaders, set ranks, control access." },
      { icon: TrendingUp, title: "Sales Tracking", desc: "Daily target vs achievement. Weekly and monthly performance at a glance." },
      { icon: ClipboardList, title: "Daily Reports", desc: "Members submit updates every day. You see everything in real time." },
      { icon: Bell, title: "Notifications", desc: "Instant alerts for tasks, deadlines, and team activity." },
    ],
    roles_title: "Built for every role",
    roles: [
      { icon: Shield, label: "Platform Admin", desc: "Full visibility across all teams and data.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      { icon: Users, label: "Team Admin", desc: "Create and manage your team end-to-end.", color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20" },
      { icon: Star, label: "Team Leader", desc: "Lead your group, see your members' progress.", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    ],
    footer: "Built for AWPL network professionals.",
    lang_toggle: "हिंदी में",
  },
  hi: {
    badge: "AWPL नेटवर्क प्लेटफ़ॉर्म",
    headline: ["आपकी टीम।", "आपके नंबर।", "आपकी तरक्की।"],
    sub: "रोज़ की परफॉर्मेंस ट्रैक करें, टीम मैनेज करें, भर्ती और सेल्स लॉग करें — AWPL नेटवर्क लीडर्स के लिए बना एक ही जगह पर।",
    cta_primary: "अकाउंट बनाएं",
    cta_secondary: "लॉग इन",
    features_title: "टीम के लिए सब कुछ",
    features: [
      { icon: Users, title: "टीम मैनेजमेंट", desc: "अपनी डाउनलाइन बनाएं और व्यवस्थित करें।" },
      { icon: TrendingUp, title: "सेल्स ट्रैकिंग", desc: "रोज़ का टारगेट बनाम अचीवमेंट।" },
      { icon: ClipboardList, title: "डेली रिपोर्ट", desc: "मेंबर्स रोज़ अपडेट सबमिट करें।" },
      { icon: Bell, title: "नोटिफिकेशन", desc: "टास्क और डेडलाइन के लिए तुरंत अलर्ट।" },
    ],
    roles_title: "हर भूमिका के लिए बना",
    roles: [
      { icon: Shield, label: "प्लेटफ़ॉर्म एडमिन", desc: "सभी टीमों पर पूरी नज़र।", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      { icon: Users, label: "टीम एडमिन", desc: "अपनी टीम को मैनेज करें।", color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20" },
      { icon: Star, label: "टीम लीडर", desc: "अपने ग्रुप का नेतृत्व करें।", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    ],
    footer: "AWPL नेटवर्क प्रोफेशनल्स के लिए बना।",
    lang_toggle: "English",
  },
};

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = content[lang];

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "var(--bg)" }}>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(255,115,10,0.4) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] left-[-15%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(255,115,10,0.3) 0%, transparent 70%)" }} />
      </div>

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6">

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center justify-between h-16">
          <img src="/logo.png" alt="Asclepius" className="h-9 w-auto rounded-xl" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{ borderColor: "var(--border-2)", color: "var(--text-3)" }}>
              <Globe size={12} /> {t.lang_toggle}
            </button>
            <Link href="/auth/login"
              className="text-sm px-4 py-2 rounded-full transition-all"
              style={{ color: "var(--text-2)" }}>
              {t.cta_secondary}
            </Link>
            <Link href="/auth/signup"
              className="text-sm font-medium px-5 py-2 rounded-full transition-all"
              style={{ background: "var(--brand-500)", color: "white" }}>
              {t.cta_primary}
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex items-center justify-between h-14">
          <img src="/logo.png" alt="Asclepius" className="h-8 w-auto rounded-lg" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl transition-all"
            style={{ color: "var(--text-2)", background: "var(--surface-2)" }}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-14 left-4 right-4 rounded-2xl p-4 z-30 animate-fade-down"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }}>
            <div className="space-y-2">
              {/* Language toggle */}
              <button
                onClick={() => { setLang(lang === "en" ? "hi" : "en"); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                style={{ color: "var(--text-2)", background: "var(--surface-3)" }}>
                <Globe size={15} />
                {t.lang_toggle}
              </button>

              {/* Sign In */}
              <Link href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm transition-all"
                style={{ color: "var(--text-2)", background: "var(--surface-3)" }}>
                {t.cta_secondary}
              </Link>

              {/* Create Account */}
              <Link href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "var(--brand-500)", color: "white" }}>
                {t.cta_primary}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-28 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-mono px-4 py-1.5 rounded-full mb-6 sm:mb-8"
          style={{ background: "rgba(255,115,10,0.08)", border: "1px solid rgba(255,115,10,0.2)", color: "var(--brand-400)" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-brand"
            style={{ background: "var(--brand-400)" }} />
          {t.badge}
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold leading-[1.05] mb-4 sm:mb-6"
          style={{ fontSize: "clamp(2.2rem, 8vw, 4.5rem)" }}>
          {t.headline.map((line, i) => (
            <span key={i} className={i === 2 ? "text-gradient" : ""}>
              {line}{i < 2 && <br />}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed"
          style={{
            fontSize: "clamp(0.875rem, 3vw, 1.1rem)",
            color: "var(--text-3)",
          }}>
          {t.sub}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/auth/signup"
            className="flex items-center justify-center gap-2 w-full sm:w-auto font-semibold px-8 py-3.5 rounded-full transition-all text-sm"
            style={{ background: "var(--brand-500)", color: "white" }}>
            {t.cta_primary}
            <ArrowRight size={16} />
          </Link>
          <Link href="/auth/login"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full transition-all text-sm"
            style={{ border: "1px solid var(--border-2)", color: "var(--text-2)" }}>
            {t.cta_secondary}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mt-12 sm:mt-16">
          {[
            { num: "4", label: "User Roles" },
            { num: "13+", label: "Pages" },
            { num: "∞", label: "Members" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-xl sm:text-2xl" style={{ color: "var(--text-1)" }}>
                {s.num}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-center mb-8 sm:mb-12"
          style={{ color: "var(--text-2)" }}>
          {t.features_title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {t.features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i}
                className="p-4 sm:p-5 rounded-2xl transition-all"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-1)",
                }}>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
                  style={{ background: "rgba(255,115,10,0.1)", border: "1px solid rgba(255,115,10,0.2)" }}>
                  <Icon size={16} style={{ color: "var(--brand-400)" }} />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1.5" style={{ color: "var(--text-1)" }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Roles ───────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-center mb-8 sm:mb-10"
          style={{ color: "var(--text-2)" }}>
          {t.roles_title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {t.roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} className={`rounded-2xl p-4 sm:p-5 border ${r.bg} ${r.border}`}>
                <Icon size={18} className={`${r.color} mb-3`} />
                <div className={`font-display font-semibold text-sm mb-1 ${r.color}`}>{r.label}</div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{r.desc}</p>
              </div>
            );
          })}
        </div>
        {/* Member pill */}
        <div className="flex justify-center mt-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-1)", color: "var(--text-3)" }}>
            <Users size={12} />
            <span style={{ color: "var(--text-2)" }} className="font-medium">Member</span>
            <span style={{ color: "var(--text-4)" }}>—</span>
            <span>{lang === "en" ? "Submits daily reports & views own progress" : "डेली रिपोर्ट सबमिट करें"}</span>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,115,10,0.15) 0%, rgba(255,115,10,0.05) 100%)",
            border: "1px solid rgba(255,115,10,0.25)",
          }}>
          <div className="absolute inset-0 pointer-events-none opacity-30"
            style={{ background: "radial-gradient(ellipse at center top, rgba(255,115,10,0.3) 0%, transparent 70%)" }} />
          <div className="relative">
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2 sm:mb-3" style={{ color: "var(--text-1)" }}>
              {lang === "en" ? "Ready to get started?" : "शुरू करने के लिए तैयार हैं?"}
            </h2>
            <p className="mb-6 sm:mb-8 text-sm" style={{ color: "var(--text-3)" }}>
              {lang === "en"
                ? "Create your account with your AWPL ID. Takes less than a minute."
                : "अपने AWPL ID से अकाउंट बनाएं। एक मिनट से कम लगता है।"}
            </p>
            <Link href="/auth/signup"
              className="inline-flex items-center gap-2 font-medium px-8 py-3.5 rounded-full transition-all text-sm"
              style={{ background: "var(--brand-500)", color: "white" }}>
              {t.cta_primary} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs"
        style={{ color: "var(--text-4)", borderTop: "1px solid var(--border-1)" }}>
        {t.footer}
      </footer>
    </div>
  );
}
