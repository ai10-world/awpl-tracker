// components/feed/activity-feed.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { ClipboardList, UserPlus, Flame, Star, Zap, Users } from "lucide-react";

const moodEmoji: Record<string, string> = {
  great: "🚀", good: "😊", neutral: "😐", difficult: "😓", bad: "😞",
};

const milestoneEmoji: Record<number, string> = {
  7: "🌟", 14: "⚡", 21: "💪", 30: "🔥", 50: "💎", 100: "👑",
};

function getEventConfig(event: any) {
  const { event_type, event_data } = event;
  const name = event_data?.full_name || "Someone";

  switch (event_type) {
    case "report_submitted":
      return {
        icon: ClipboardList,
        iconBg: "rgba(255,115,10,0.12)",
        iconColor: "var(--brand-400)",
        title: `${name} submitted today's report`,
        subtitle: event_data?.sp > 0
          ? `${moodEmoji[event_data?.mood] || "📋"} ${event_data?.mood} · SP: ${event_data?.sp}`
          : `${moodEmoji[event_data?.mood] || "📋"} ${event_data?.mood}`,
        streak: event_data?.streak,
      };
    case "report_updated":
      return {
        icon: ClipboardList,
        iconBg: "var(--surface-3)",
        iconColor: "var(--text-3)",
        title: `${name} updated today's report`,
        subtitle: null,
        streak: null,
      };
    case "streak_milestone":
      const days = event_data?.days;
      return {
        icon: Flame,
        iconBg: "rgba(249,115,22,0.15)",
        iconColor: "#f97316",
        title: `${name} hit a ${days}-day streak! ${milestoneEmoji[days] || "🔥"}`,
        subtitle: `${days} consecutive days of reporting`,
        streak: null,
      };
    case "member_joined":
      return {
        icon: UserPlus,
        iconBg: "rgba(34,197,94,0.12)",
        iconColor: "#4ade80",
        title: `${name} joined the team`,
        subtitle: `AWPL ID: ${event_data?.awpl_id}`,
        streak: null,
      };
    case "member_left":
      return {
        icon: Users,
        iconBg: "var(--surface-3)",
        iconColor: "var(--text-3)",
        title: `${name} left the team`,
        subtitle: null,
        streak: null,
      };
    case "team_created":
      return {
        icon: Users,
        iconBg: "rgba(59,130,246,0.12)",
        iconColor: "#60a5fa",
        title: `Team was created`,
        subtitle: null,
        streak: null,
      };
    case "sp_milestone":
      return {
        icon: Star,
        iconBg: "rgba(251,191,36,0.12)",
        iconColor: "#fbbf24",
        title: `${name} hit ${event_data?.milestone} total SP! ⭐`,
        subtitle: `Total: ${event_data?.total_sp} SP`,
        streak: null,
      };
    default:
      return {
        icon: Zap,
        iconBg: "var(--surface-3)",
        iconColor: "var(--text-3)",
        title: "Activity",
        subtitle: null,
        streak: null,
      };
  }
}

// ── Single feed item — client component with hover ─────────────
function FeedItem({ event, showTeamName }: { event: any; showTeamName?: boolean }) {
  const config = getEventConfig(event);
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(event.created_at), { addSuffix: true });

  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-2xl transition-colors cursor-default"
      style={{ background: "transparent" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: config.iconBg }}
      >
        <Icon size={14} style={{ color: config.iconColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: "var(--text-1)" }}>
          {config.title}
          {config.streak && config.streak > 1 && (
            <span
              className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}
            >
              🔥 {config.streak}
            </span>
          )}
        </p>
        {config.subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            {config.subtitle}
          </p>
        )}
        {showTeamName && event.team?.name && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>
            {event.team.name}
          </p>
        )}
      </div>

      {/* Time */}
      <div className="text-xs flex-shrink-0 mt-0.5" style={{ color: "var(--text-4)" }}>
        {timeAgo}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────
function EmptyFeed() {
  return (
    <div className="p-8 text-center">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
        style={{ background: "var(--surface-3)" }}
      >
        <Zap size={20} style={{ color: "var(--text-4)" }} />
      </div>
      <p className="font-display font-semibold mb-1" style={{ color: "var(--text-1)" }}>
        No activity yet
      </p>
      <p className="text-sm" style={{ color: "var(--text-3)" }}>
        Activity will appear here as your team submits reports and hits milestones.
      </p>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────
export function ActivityFeed({
  events,
  showTeamName = false,
  maxItems,
}: {
  events: any[];
  showTeamName?: boolean;
  maxItems?: number;
}) {
  const displayed = maxItems ? events.slice(0, maxItems) : events;

  if (displayed.length === 0) return <EmptyFeed />;

  return (
    <div className="divide-y" style={{ borderColor: "var(--border-1)" }}>
      {displayed.map((event) => (
        <FeedItem key={event.id} event={event} showTeamName={showTeamName} />
      ))}
    </div>
  );
}
