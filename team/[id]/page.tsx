// app/team/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AddMemberForm } from "@/components/team/add-member-form";
import { MemberList } from "@/components/team/member-list";
import { TeamHeader } from "@/components/team/team-header";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await adminSupabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/auth/login");

  const { data: team } = await adminSupabase
    .from("teams")
    .select(`*, admin:profiles!teams_admin_id_fkey(id, full_name, awpl_id)`)
    .eq("id", params.id)
    .single();
  if (!team) redirect("/team");

  const isAdmin = profile.role === "platform_admin" || team.admin_id === user.id;

  const { data: myMembership } = await adminSupabase
    .from("team_members")
    .select("role, can_assign_tasks, can_view_reports")
    .eq("team_id", params.id)
    .eq("profile_id", user.id)
    .single();

  if (!isAdmin && !myMembership) redirect("/team");

  const { data: members } = await adminSupabase
    .from("team_members")
    .select(`*, profile:profiles(id, full_name, awpl_id, role, email)`)
    .eq("team_id", params.id)
    .order("rank", { ascending: true });

  const canManage = isAdmin || myMembership?.role === "team_admin";

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">

        {/* Back link */}
        <Link href="/team"
          className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={15} /> All Teams
        </Link>

        {/* Team Header */}
        <TeamHeader
          team={team}
          canManage={canManage}
          memberCount={members?.length || 0}
        />

        {/* Content — stacked on mobile, side by side on desktop */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* Add Member — top on mobile, right on desktop */}
          {canManage && (
            <div className="order-first lg:order-last lg:w-72 xl:w-80 flex-shrink-0">
              <AddMemberForm teamId={params.id} />
            </div>
          )}

          {/* Member List */}
          <div className="flex-1 min-w-0">
            <MemberList
              members={members || []}
              teamId={params.id}
              currentUserId={user.id}
              canManage={canManage}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
