// app/activity/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ActivityFeed } from "@/components/feed/activity-feed";
import { Zap } from "lucide-react";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function ActivityPage() {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await adminSupabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/auth/login");

  // Get user's team IDs
  let teamIds: string[] = [];
  if (profile.role === "platform_admin") {
    const { data } = await adminSupabase.from("teams").select("id");
    teamIds = data?.map((t: any) => t.id) || [];
  } else {
    const { data } = await adminSupabase
      .from("team_members").select("team_id").eq("profile_id", user.id);
    teamIds = data?.map((d: any) => d.team_id) || [];
  }

  // Fetch activity feed
  let events: any[] = [];
  if (teamIds.length > 0) {
    const { data } = await adminSupabase
      .from("activity_feed")
      .select(`*, team:teams(name)`)
      .in("team_id", teamIds)
      .order("created_at", { ascending: false })
      .limit(100);
    events = data || [];
  }

  // Group by date
  const grouped: Record<string, any[]> = {};
  events.forEach((e) => {
    const date = new Date(e.created_at).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(e);
  });

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} style={{ color: "var(--brand-400)" }} />
            <h1 className="font-display font-bold text-2xl sm:text-3xl"
              style={{ color: "var(--text-1)" }}>
              Activity Feed
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Everything happening across your teams
          </p>
        </div>

        {/* Feed grouped by date */}
        {Object.keys(grouped).length === 0 ? (
          <ActivityFeed events={[]} />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, dateEvents]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-xs font-medium uppercase tracking-widest"
                    style={{ color: "var(--text-3)" }}>
                    {date}
                  </div>
                  <div className="flex-1 h-px" style={{ background: "var(--border-1)" }} />
                  <div className="text-xs" style={{ color: "var(--text-4)" }}>
                    {dateEvents.length} event{dateEvents.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Events for this date */}
                <div className="card overflow-hidden">
                  <ActivityFeed
                    events={dateEvents}
                    showTeamName={teamIds.length > 1}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
