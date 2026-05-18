// app/team/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import { ArrowLeft } from "lucide-react";
import { AddMemberForm } from "@/components/team/add-member-form";
import { MemberList } from "@/components/team/member-list";
import { TeamHeader } from "@/components/team/team-header";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  // Fetch team
  const { data: team } = await adminSupabase
    .from("teams")
    .select(`*, admin:profiles!teams_admin_id_fkey(id, full_name, awpl_id)`)
    .eq("id", params.id)
    .single();

  if (!team) redirect("/team");

  // Check access
  const isAdmin = profile.role === "platform_admin" || team.admin_id === user.id;
  const { data: myMembership } = await adminSupabase
    .from("team_members")
    .select("role, can_assign_tasks, can_view_reports, can_view_vault")
    .eq("team_id", params.id)
    .eq("profile_id", user.id)
    .single();

  if (!isAdmin && !myMembership) redirect("/team");

  // Fetch members
  const { data: members } = await adminSupabase
    .from("team_members")
    .select(`*, profile:profiles(id, full_name, awpl_id, role, email)`)
    .eq("team_id", params.id)
    .order("rank", { ascending: true });

  const canManage = isAdmin || myMembership?.role === "team_admin";

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#080808]/90 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/logo.png" alt="Asclepius" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 hidden sm:block">{profile.full_name}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back */}
        <Link href="/team" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm mb-6">
          <ArrowLeft size={16} /> All Teams
        </Link>

        {/* Team Header */}
        <TeamHeader team={team} canManage={canManage} memberCount={members?.length || 0} />

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* Member List */}
          <div className="lg:col-span-2">
            <MemberList
              members={members || []}
              teamId={params.id}
              currentUserId={user.id}
              canManage={canManage}
              isAdmin={isAdmin}
            />
          </div>

          {/* Add Member */}
          {canManage && (
            <div>
              <AddMemberForm teamId={params.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
