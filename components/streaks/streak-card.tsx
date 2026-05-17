// components/streaks/streak-card.tsx
import { Flame, Trophy, Zap, Crown, AlertTriangle } from "lucide-react";

interface StreakCardProps {
  streak: {
    current_streak: number;
    longest_streak: number;
    last_report_date: string | null;
  } | null;
  compact?: boolean;
}

function getMilestoneInfo(days: number) {
  if (days >= 100) return { icon: "👑", label: "Legend", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)" };
  if (days >= 50)  return { icon: "💎", label: "Diamond", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" };
  if (days >= 30)  return { icon: "🔥", label: "On Fire", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.25)" };
  if (days >= 14)  return { icon: "⚡", label: "Charged", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)" };
  if (days >= 7)   return { icon: "🌟", label: "Rising", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.25)" };
  if (days >= 3)   return { icon: "💪", label: "Building", color: "#ff9332", bg: "rgba(255,147,50,0.12)", border: "rgba(255,147,50,0.25)" };
  if (days >= 1)   return { icon: "🌱", label: "Starting", color: "#86efac", bg: "rgba(134,239,172,0.1)", border: "rgba(134,239,172,0.2)" };
  return { icon: "💤", label: "Inactive", color: "var(--text-4)", bg: "var(--surface-3)", border: "var(--border-1)" };
}

function isAtRisk(lastDate: string | null, current: number): boolean {
  if (!lastDate || current === 0) return false;
  const last = new Date(lastDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  // At risk if last report was yesterday and current streak > 0
  return diffDays === 1;
}

export function StreakCard({ streak, compact = false }: StreakCardProps) {
  const current = streak?.current_streak || 0;
  const longest = streak?.longest_streak || 0;
  const lastDate = streak?.last_report_date || null;
  const milestone = getMilestoneInfo(current);
  const atRisk = isAtRisk(lastDate, current);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: milestone.bg, border: `1px solid ${milestone.border}` }}>
        <span className="text-lg leading-none">{milestone.icon}</span>
        <div>
          <div className="font-display font-bold text-sm leading-none" style={{ color: milestone.color }}>
            {current} day{current !== 1 ? "s" : ""}
          </div>
          <div className="text-xs leading-none mt-0.5" style={{ color: "var(--text-3)" }}>streak</div>
        </div>
        {atRisk && current > 0 && (
          <AlertTriangle size={13} style={{ color: "#fbbf24" }} className="ml-1" />
        )}
      </div>
    );
  }

  return (
    <div className="card p-5 relative overflow-hidden">
      {/* Background glow for high streaks */}
      {current >= 7 && (
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${milestone.bg} 0%, transparent 70%)` }} />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={15} style={{ color: current > 0 ? "#f97316" : "var(--text-4)" }} />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
              Daily Streak
            </span>
          </div>
          {atRisk && current > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: "var(--warning-dim)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>
              <AlertTriangle size={11} />
              At risk!
            </div>
          )}
        </div>

        {/* Main streak number */}
        <div className="flex items-end gap-3 mb-4">
          <div>
            <div className="font-display font-bold leading-none mb-1"
              style={{ fontSize: 52, color: milestone.color }}>
              {current}
            </div>
            <div className="text-sm" style={{ color: "var(--text-3)" }}>
              day{current !== 1 ? "s" : ""} in a row
            </div>
          </div>
          <div className="text-5xl leading-none mb-1 animate-float">
            {milestone.icon}
          </div>
        </div>

        {/* Milestone badge */}
        {current > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: milestone.bg, border: `1px solid ${milestone.border}`, color: milestone.color }}>
            {milestone.label}
          </div>
        )}

        {/* Milestone progress */}
        <div className="space-y-2">
          <NextMilestone current={current} />
        </div>

        {/* Longest streak */}
        <div className="flex items-center justify-between mt-4 pt-3"
          style={{ borderTop: "1px solid var(--border-1)" }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
            <Trophy size={12} />
            Best streak
          </div>
          <div className="text-xs font-display font-bold" style={{ color: "var(--text-2)" }}>
            {longest} day{longest !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

function NextMilestone({ current }: { current: number }) {
  const milestones = [3, 7, 14, 21, 30, 50, 100];
  const next = milestones.find((m) => m > current);
  if (!next) return (
    <div className="text-xs" style={{ color: "var(--text-3)" }}>
      🏆 You&apos;ve hit the ultimate milestone!
    </div>
  );

  const progress = (current / next) * 100;
  const remaining = next - current;

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "var(--text-3)" }}>
        <span>Next milestone: {next} days</span>
        <span style={{ color: "var(--text-2)" }}>{remaining} more day{remaining !== 1 ? "s" : ""}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: "linear-gradient(90deg, var(--brand-500), var(--brand-400))",
          }} />
      </div>
    </div>
  );
}
