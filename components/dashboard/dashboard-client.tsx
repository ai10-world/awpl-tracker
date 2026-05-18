// components/dashboard/dashboard-client.tsx
"use client";

import Link from "next/link";
import { Users, ClipboardList, TrendingUp, Star, Shield, Calculator, ChevronRight, ArrowRight, Plus, Zap } from "lucide-react";
import { ActivityFeed } from "@/components/feed/activity-feed";
import { StreakCard } from "@/components/streaks/streak-card";

type IconKey = "users" | "clipboardList" | "trendingUp" | "star" | "shield";

const ICON_MAP: Record<IconKey, any> = {
  users: Users,
  clipboardList: ClipboardList,
  trendingUp: TrendingUp,
  star: Star,
  shield: Shield,
};

// ── Stat Card ──────────────────────────────────────────────────
export function StatCard({ icon, label, value, color, delay, soon }: {
  icon: IconKey; label: string; value: number; color: string; delay: number; soon?: boolean;
}) {
  const Icon = ICON_MAP[icon];
  const colorMap: Record<string, any> = {
    blue:   { bg: "var(--info-dim)", text: "#60a5fa", border: "rgba(59,130,246,0.2)" },
    brand:  { bg: "rgba(255,115,10,0.1)", text: "var(--brand-400)", border: "rgba(255,115,10,0.2)" },
    yellow: { bg: "var(--warning-dim)", text: "#fbbf24", border: "rgba(245,158,11,0.2)" },
    green:  { bg: "var(--success-dim)", text: "#4ade80", border: "rgba(34,197,94,0.2)" },
    purple: { bg: "rgba(168,85,247,0.1)", text: "#c084fc", border: "rgba(168,85,247,0.2)" },
  };
  const c = colorMap[color];
  return (
    <div className="card p-3 sm:p-4 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon size={13} style={{ color: c.text }} />
        </div>
        {soon && <span className="badge badge-gray text-xs">Soon</span>}
      </div>
      <div className="font-display font-bold text-xl sm:text-2xl mb-0.5" style={{ color: "var(--text-1)" }}>
        {soon ? "—" : value}
      </div>
      <div className="text-xs" style={{ color: "var(--text-3)" }}>{label}</div>
    </div>
  );
}

// ── Action Card ────────────────────────────────────────────────
export function ActionCard({ href, icon, label, desc, color }: {
  href: string; icon: IconKey; label: string; desc: string; color: string;
}) {
  const Icon = ICON_MAP[icon];
  const styles: Record<string, any> = {
    brand: { bg: "rgba(255,115,10,0.1)", text: "var(--brand-400)", border: "rgba(255,115,10,0.2)" },
    blue:  { bg: "var(--info-dim)", text: "#60a5fa", border: "rgba(59,130,246,0.2)" },
    green: { bg: "var(--success-dim)", text: "#4ade80", border: "rgba(34,197,94,0.2)" },
  };
  const s = styles[color] || styles.brand;
  return (
    <Link href={href}
      className="card card-interactive flex items-center justify-between p-3 group"
      style={{ textDecoration: "none" }}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: s.bg, border: `1px solid ${s.border}` }}>
          <Icon size={13} style={{ color: s.text }} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--text-1)" }}>{label}</p>
          <p className="text-xs hidden sm:block" style={{ color: "var(--text-3)" }}>{desc}</p>
        </div>
      </div>
      <ChevronRight size={13}
        className="transition-transform group-hover:translate-x-0.5"
        style={{ color: "var(--text-4)" }} />
    </Link>
  );
}

// ── Team Mini Card ─────────────────────────────────────────────
export function TeamMiniCard({ team }: { team: any }) {
  return (
    <Link href={`/team/${team.team?.id}`}
      className="card card-interactive flex items-center justify-between p-3 group"
      style={{ textDecoration: "none" }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs flex-shrink-0"
          style={{
            background: "rgba(255,115,10,0.12)",
            color: "var(--brand-400)",
            border: "1px solid rgba(255,115,10,0.2)",
          }}>
          {team.team?.name?.[0]?.toUpperCase()}
        </div>
        <span className="text-xs font-medium truncate" style={{ color: "var(--text-1)" }}>
          {team.team?.name}
        </span>
      </div>
      <ChevronRight size={13} style={{ color: "var(--text-4)" }} />
    </Link>
  );
}

// ── Empty Teams ────────────────────────────────────────────────
export function EmptyTeams() {
  return (
    <div className="card p-6 text-center">
      <Users size={24} className="mx-auto mb-2" style={{ color: "var(--text-4)" }} />
      <p className="text-xs mb-3" style={{ color: "var(--text-3)" }}>No teams yet</p>
      <Link href="/team/create" className="btn btn-primary text-xs px-4 py-2">
        <Plus size={13} /> Create Team
      </Link>
    </div>
  );
}

// ── Activity Feed Section ──────────────────────────────────────
export function ActivitySection({
  events,
  showTeamName,
}: {
  events: any[];
  showTeamName: boolean;
}) {
  return (
    <div className="card overflow-hidden">
      {events.length === 0 ? (
        <div className="p-8 text-center">
          <Zap size={24} className="mx-auto mb-2" style={{ color: "var(--text-4)" }} />
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            Activity will appear here as your team submits reports.
          </p>
        </div>
      ) : (
        <ActivityFeed events={events} showTeamName={showTeamName} maxItems={8} />
      )}
    </div>
  );
}

// ── Calculator Link ────────────────────────────────────────────
export function CalculatorLink() {
  return (
    <a
      href="https://awpl-tracker-theta.vercel.app/AWPL%20(all%20good).html"
      target="_blank"
      rel="noopener noreferrer"
      className="card card-interactive flex items-center justify-between p-3 group"
      style={{ textDecoration: "none" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,115,10,0.1)", border: "1px solid rgba(255,115,10,0.2)" }}>
          <Calculator size={13} style={{ color: "var(--brand-400)" }} />
        </div>
        <p className="text-xs font-medium" style={{ color: "var(--text-1)" }}>Price Calculator</p>
      </div>
      <ArrowRight size={13} style={{ color: "var(--text-4)" }} />
    </a>
  );
}
