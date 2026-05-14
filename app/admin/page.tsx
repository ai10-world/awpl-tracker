// app/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/signout-button";
import { ArrowLeft, Shield, Users, Crown } from "lucide-react";
import { AdminUserRow } from "@/components/admin/admin-user-row";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminPage() {
  const supabase = createClient();
  const adminSupabase = getAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Only platform admin can access
  if (!profile || profile.role !== "platform_admin") redirect("/dashboard");

  // Fetch all users
  const { data: allUsers } = await adminSupabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all teams
  const { data: allTeams } = await adminSupabase
    .from("teams")
    .select(`*, admin:profiles!teams_admin_id_fkey(full_name, awpl_id)`)
    .order("created_at", { ascending: false });

  const roleCounts = {
    platform_admin: allUsers?.filter((u) => u.role === "platform_admin").length || 0,
    team_admin: allUsers?.filter((u) => u.role === "team_admin").length || 0,
    team_leader: allUsers?.filter((u) => u.role === "team_leader").length || 0,
    member: allUsers?.filter((u) => u.role === "member").length || 0,
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#080808]/90 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/logo.png" alt="Asclepius" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2.5 py-1 rounded-full border text-blue-400 bg-blue-500/10 border-blue-500/20">
              Platform Admin
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl">Admin Panel</h1>
            <p className="text-white/35 text-sm">Full platform visibility</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Platform Admins", count: roleCounts.platform_admin, color: "blue" },
            { label: "Team Admins", count: roleCounts.team_admin, color: "brand" },
            { label: "Team Leaders", count: roleCounts.team_leader, color: "yellow" },
            { label: "Members", count: roleCounts.member, color: "white" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-white/3 border border-white/8">
              <div className="font-display font-bold text-2xl mb-1">{s.count}</div>
              <div className="text-xs text-white/35">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* All Users */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-white/40" />
              <h2 className="font-display font-semibold">All Users ({allUsers?.length || 0})</h2>
            </div>
            <div className="space-y-2">
              {allUsers?.map((u) => (
                <AdminUserRow key={u.id} user={u} currentUserId={user.id} />
              ))}
            </div>
          </div>

          {/* All Teams */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-white/40" />
              <h2 className="font-display font-semibold">All Teams ({allTeams?.length || 0})</h2>
            </div>
            <div className="space-y-2">
              {allTeams?.map((t) => (
                <Link
                  key={t.id}
                  href={`/team/${t.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8 hover:border-brand-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-display font-bold text-brand-400 text-xs">
                      {t.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-white/30">
                        Admin: {t.admin?.full_name} · {t.admin?.awpl_id}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-white/20 group-hover:text-brand-400 transition-colors">→</span>
                </Link>
              ))}
              {(!allTeams || allTeams.length === 0) && (
                <div className="text-center py-8 text-white/25 text-sm border border-white/5 rounded-xl">
                  No teams created yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
