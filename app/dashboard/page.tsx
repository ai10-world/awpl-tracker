// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logOut } from "@/lib/actions/auth";
import { SignOutButton } from "@/components/ui/signout-button";
import { LogOut, User, LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, awpl_id, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white font-display font-bold text-xs">
              A
            </div>
            <span className="font-display font-semibold text-sm text-white/80">
              AWPL Tracker
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <User size={14} />
              <span>{profile?.full_name || user.email}</span>
              {profile?.role && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20">
                  {profile.role}
                </span>
              )}
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
          <LayoutDashboard size={28} className="text-brand-400" />
        </div>
        <h1 className="font-display font-bold text-3xl mb-3">
          Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-white/40 text-sm mb-2">
          AWPL ID:{" "}
          <span className="font-mono text-white/60">{profile?.awpl_id}</span>
        </p>
        <p className="text-white/30 text-sm">
          Dashboard is coming in Phase 2 — team management, reports & more.
        </p>

        <div className="mt-12 grid sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
          {[
            { label: "Team Management", phase: "Phase 2" },
            { label: "Daily Reports", phase: "Phase 3" },
            { label: "Sales Tracker", phase: "Phase 3" },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-white/3 border border-white/8"
            >
              <div className="text-xs text-white/25 mb-1">{item.phase}</div>
              <div className="text-sm text-white/60">{item.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
