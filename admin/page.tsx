// app/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Users, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
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
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile || profile.role !== "platform_admin") redirect("/dashboard");

  const { data: allUsers } = await adminSupabase
    .from("profiles").select("*").order("created_at", { ascending: false });

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
    <DashboardLayout profile={profile}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1"
            style={{ color: "var(--text-1)" }}>
            Admin Panel
          </h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Full platform visibility
          </p>
        </div>

        {/* Role stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Platform Admins", count: roleCounts.platform_admin, badge: "badge-blue" },
            { label: "Team Admins", count: roleCounts.team_admin, badge: "badge-brand" },
            { label: "Leaders", count: roleCounts.team_leader, badge: "badge-yellow" },
            { label: "Members", count: roleCounts.member, badge: "badge-gray" },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <div className="font-display font-bold text-2xl mb-1"
                style={{ color: "var(--text-1)" }}>
                {s.count}
              </div>
              <div className="text-xs" style={{ color: "var(--text-3)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Two columns — stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* All Users */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} style={{ color: "var(--text-3)" }} />
              <h2 className="font-display font-semibold" style={{ color: "var(--text-1)" }}>
                All Users ({allUsers?.length || 0})
              </h2>
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
              <Shield size={16} style={{ color: "var(--text-3)" }} />
              <h2 className="font-display font-semibold" style={{ color: "var(--text-1)" }}>
                All Teams ({allTeams?.length || 0})
              </h2>
            </div>
            <div className="space-y-2">
              {allTeams?.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>No teams yet.</p>
                </div>
              ) : (
                allTeams?.map((t) => (
                  <Link key={t.id} href={`/team/${t.id}`}
                    className="card card-interactive flex items-center justify-between p-3.5 group transition-all"
                    style={{ textDecoration: "none" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                        style={{
                          background: "rgba(255,115,10,0.1)",
                          border: "1px solid rgba(255,115,10,0.2)",
                          color: "var(--brand-400)",
                        }}>
                        {t.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                          {t.name}
                        </div>
                        <div className="text-xs truncate" style={{ color: "var(--text-3)" }}>
                          {t.admin?.full_name} · {t.admin?.awpl_id}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={14}
                      className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{ color: "var(--text-4)" }} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
