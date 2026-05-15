// components/landing/welcome-back.tsx
"use client";

import Link from "next/link";
import { logOut } from "@/lib/actions/auth";
import { ArrowRight, LogOut, Users, Shield, Calculator } from "lucide-react";

const roleLabels: Record<string, string> = {
  platform_admin: "Platform Admin",
  team_admin: "Team Admin",
  team_leader: "Team Leader",
  member: "Member",
};

const roleColors: Record<string, string> = {
  platform_admin: "text-blue-400 border-blue-500/30 bg-blue-500/8",
  team_admin: "text-orange-400 border-orange-500/30 bg-orange-500/8",
  team_leader: "text-yellow-400 border-yellow-500/30 bg-yellow-500/8",
  member: "text-white/50 border-white/15 bg-white/5",
};

export default function WelcomeBackPage({ profile }: { profile: any }) {
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const role = profile?.role || "member";

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(255,115,10,0.6) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Logo — with corner radius */}
        <div className="flex justify-center mb-10">
          <img
            src="/logo.png"
            alt="Asclepius"
            className="h-12 w-auto rounded-2xl"
          />
        </div>

        {/* Greeting */}
        <div className="mb-8">
          <p className="text-white/30 text-sm mb-1">Welcome back</p>
          <h1 className="font-display font-bold text-3xl mb-3">{firstName}</h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full border ${roleColors[role]}`}>
              {roleLabels[role]}
            </span>
            <span className="text-xs text-white/25 font-mono">{profile?.awpl_id}</span>
          </div>
        </div>

        {/* Main CTA */}
        <Link href="/dashboard"
          className="group flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-400 text-white font-semibold py-3.5 rounded-2xl transition-all mb-3 text-sm">
          Go to Dashboard
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Link href="/team"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/8 hover:border-white/20 text-white/50 hover:text-white text-xs transition-all">
            <Users size={13} /> My Teams
          </Link>
          {role === "platform_admin" && (
            <Link href="/admin"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/8 hover:border-blue-500/30 text-white/50 hover:text-blue-400 text-xs transition-all">
              <Shield size={13} /> Admin Panel
            </Link>
          )}
          <a href="https://awpl-tracker-theta.vercel.app/AWPL%20(all%20good).html"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/8 hover:border-white/20 text-white/50 hover:text-white text-xs transition-all">
            <Calculator size={13} /> Calculator
          </a>
        </div>

        {/* Sign out */}
        <button onClick={() => logOut()}
          className="flex items-center justify-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors mx-auto">
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </div>
  );
}
