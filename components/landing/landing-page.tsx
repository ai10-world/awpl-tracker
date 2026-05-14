// components/landing/landing-page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users, TrendingUp, ClipboardList, Bell,
  ChevronRight, Globe, Shield, Star, ArrowRight,
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
    lang_toggle: "हिंदी में देखें",
  },
  hi: {
    badge: "AWPL नेटवर्क प्लेटफ़ॉर्म",
    headline: ["आपकी टीम।", "आपके नंबर।", "आपकी तरक्की।"],
    sub: "रोज़ की परफॉर्मेंस ट्रैक करें, टीम मैनेज करें, भर्ती और सेल्स लॉग करें — AWPL नेटवर्क लीडर्स के लिए बना एक ही जगह पर।",
    cta_primary: "अकाउंट बनाएं",
    cta_secondary: "लॉग इन करें",
    features_title: "टीम के लिए सब कुछ",
    features: [
      { icon: Users, title: "टीम मैनेजमेंट", desc: "अपनी डाउनलाइन बनाएं और व्यवस्थित करें। लीडर असाइन करें, रैंक सेट करें।" },
      { icon: TrendingUp, title: "सेल्स ट्रैकिंग", desc: "रोज़ का टारगेट बनाम अचीवमेंट। हफ्ते और महीने की परफॉर्मेंस एक नज़र में।" },
      { icon: ClipboardList, title: "डेली रिपोर्ट", desc: "मेंबर्स रोज़ अपडेट सबमिट करें। आप सब कुछ रियल टाइम में देखें।" },
      { icon: Bell, title: "नोटिफिकेशन", desc: "टास्क, डेडलाइन और टीम गतिविधि के लिए तुरंत अलर्ट।" },
    ],
    roles_title: "हर भूमिका के लिए बना",
    roles: [
      { icon: Shield, label: "प्लेटफ़ॉर्म एडमिन", desc: "सभी टीमों और डेटा पर पूरी नज़र।", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      { icon: Users, label: "टीम एडमिन", desc: "अपनी टीम को शुरू से अंत तक मैनेज करें।", color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20" },
      { icon: Star, label: "टीम लीडर", desc: "अपने ग्रुप का नेतृत्व करें, मेंबर्स की प्रगति देखें।", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    ],
    footer: "AWPL नेटवर्क प्रोफेशनल्स के लिए बना।",
    lang_toggle: "View in English",
  },
};

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(255,115,10,0.4) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] left-[-15%] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(255,115,10,0.3) 0%, transparent 70%)" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <img src="/logo.png" alt="Asclepius" className="h-10 w-auto" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20"
          >
            <Globe size={12} />
            {t.lang_toggle}
          </button>
          <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-1.5">
            {t.cta_secondary}
          </Link>
          <Link href="/auth/signup" className="text-sm bg-brand-500 hover:bg-brand-400 text-white px-4 py-1.5 rounded-full transition-colors font-medium">
            {t.cta_primary}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-brand-400 border border-brand-500/30 bg-brand-500/5 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          {t.badge}
        </div>

        <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
          {t.headline.map((line, i) => (
            <span key={i} className={i === 2 ? "text-gradient" : ""}>
              {line}{i < 2 && <br />}
            </span>
          ))}
        </h1>

        <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed">{t.sub}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/auth/signup" className="group flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-medium px-8 py-3.5 rounded-full transition-all glow-brand text-sm">
            {t.cta_primary}
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/auth/login" className="flex items-center gap-2 text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-8 py-3.5 rounded-full transition-all text-sm">
            {t.cta_secondary}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-16">
          {[{ num: "4", label: "User Roles" }, { num: "13", label: "Pages" }, { num: "∞", label: "Team Members" }].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-2xl text-white/90">{s.num}</div>
              <div className="text-xs text-white/35 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display font-bold text-2xl text-center mb-12 text-white/80">{t.features_title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass rounded-2xl p-5 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roles */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display font-bold text-2xl text-center mb-10 text-white/80">{t.roles_title}</h2>
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {t.roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} className={`rounded-2xl p-5 border ${r.bg} ${r.border}`}>
                <Icon size={20} className={`${r.color} mb-3`} />
                <div className={`font-display font-semibold text-sm mb-1 ${r.color}`}>{r.label}</div>
                <p className="text-white/40 text-xs leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,115,10,0.15) 0%, rgba(255,115,10,0.05) 100%)", border: "1px solid rgba(255,115,10,0.25)" }}>
          <h2 className="font-display font-bold text-3xl mb-3">
            {lang === "en" ? "Ready to get started?" : "शुरू करने के लिए तैयार हैं?"}
          </h2>
          <p className="text-white/50 mb-8 text-sm">
            {lang === "en" ? "Create your account with your AWPL ID. Takes less than a minute." : "अपने AWPL ID से अकाउंट बनाएं। एक मिनट से कम लगता है।"}
          </p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-medium px-8 py-3.5 rounded-full transition-all text-sm">
            {t.cta_primary} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 text-center py-8 text-white/20 text-xs border-t border-white/5">
        {t.footer}
      </footer>
    </div>
  );
}
