// components/layout/sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logOut } from "@/lib/actions/auth";
import {
  LayoutDashboard, Users, ClipboardList,
  Shield, Calculator, LogOut, ChevronLeft,
  ChevronRight, TrendingUp, Zap, Settings, Bell, Lock,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: any;
  label: string;
  roles?: string[];
  excludeRoles?: string[];
  soon?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/activity", icon: Zap, label: "Activity" },
  { href: "/reports/team", icon: TrendingUp, label: "Team Reports", roles: ["platform_admin", "team_admin", "team_leader"] },
  { href: "/reports", icon: ClipboardList, label: "My Reports", excludeRoles: ["platform_admin"] },
  { href: "/team", icon: Users, label: "Teams" },
  { href: "/vault", icon: Lock, label: "Vault" },
  { href: "/admin", icon: Shield, label: "Admin", roles: ["platform_admin"] },
];

export function Sidebar({ profile }: { profile: any }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredNav = navItems.filter((item) => {
    if (item.excludeRoles?.includes(profile?.role)) return false;
    if (!item.roles) return true;
    return item.roles.includes(profile?.role);
  });

  const roleColors: Record<string, string> = {
    platform_admin: "badge-blue",
    team_admin: "badge-brand",
    team_leader: "badge-yellow",
    member: "badge-gray",
  };
  const roleLabels: Record<string, string> = {
    platform_admin: "Platform Admin",
    team_admin: "Team Admin",
    team_leader: "Leader",
    member: "Member",
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-60"}`}
        style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border-1)" }}
      >
        {/* Logo */}
        <div className={`flex items-center h-14 px-4 flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}
          style={{ borderBottom: "1px solid var(--border-1)" }}>
          {!collapsed && (
            <Link href="/dashboard">
              <img src="/logo.png" alt="Asclepius" className="h-7 w-auto rounded-lg" />
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg transition-all" style={{ color: "var(--text-3)" }}>
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.soon ? "#" : item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group relative ${item.soon ? "opacity-40 cursor-not-allowed" : ""}`}
                style={{
                  background: active ? "rgba(255,115,10,0.12)" : "transparent",
                  color: active ? "var(--brand-400)" : "var(--text-3)",
                }}
                onClick={item.soon ? (e) => e.preventDefault() : undefined}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "var(--brand-500)" }} />
                )}
                <Icon size={16} className="flex-shrink-0"
                  style={{ color: active ? "var(--brand-400)" : "var(--text-3)" }} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.soon && <span className="badge badge-gray text-xs">Soon</span>}
                  </>
                )}
              </Link>
            );
          })}

          {!collapsed && (
            <div className="mx-3 my-2" style={{ borderTop: "1px solid var(--border-1)" }} />
          )}

          <a href="https://awpl-tracker-theta.vercel.app/AWPL%20(all%20good).html"
            target="_blank" rel="noopener noreferrer"
            title={collapsed ? "Price Calculator" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group"
            style={{ color: "var(--text-3)" }}>
            <Calculator size={16} className="flex-shrink-0" />
            {!collapsed && <span className="flex-1 truncate">Calculator</span>}
          </a>
        </nav>

        {/* Profile + Logout */}
        <div className="flex-shrink-0 p-3 space-y-1" style={{ borderTop: "1px solid var(--border-1)" }}>
          {!collapsed && (
            <div className="px-3 py-2.5 rounded-xl mb-1" style={{ background: "var(--surface-3)" }}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs flex-shrink-0"
                  style={{ background: "rgba(255,115,10,0.15)", color: "var(--brand-400)" }}>
                  {profile?.full_name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: "var(--text-1)" }}>
                    {profile?.full_name}
                  </div>
                  <div className="text-xs font-mono truncate" style={{ color: "var(--text-3)" }}>
                    {profile?.awpl_id}
                  </div>
                </div>
              </div>
              <span className={`badge ${roleColors[profile?.role]}`}>
                {roleLabels[profile?.role]}
              </span>
            </div>
          )}
          <button onClick={() => logOut()}
            title={collapsed ? "Sign out" : undefined}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm w-full transition-all group"
            style={{ color: "var(--text-3)" }}>
            <LogOut size={15} className="flex-shrink-0 group-hover:text-red-400 transition-colors" />
            {!collapsed && <span className="group-hover:text-red-400 transition-colors">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ─────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4"
        style={{ background: "var(--surface-1)", borderBottom: "1px solid var(--border-1)" }}>
        <Link href="/dashboard">
          <img src="/logo.png" alt="Asclepius" className="h-7 w-auto rounded-lg" />
        </Link>
        <span className={`badge ${roleColors[profile?.role]}`}>
          {roleLabels[profile?.role]}
        </span>
      </div>

      {/* ── Mobile Bottom Nav ──────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1"
        style={{
          background: "var(--surface-1)",
          borderTop: "1px solid var(--border-1)",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          paddingTop: 6,
        }}>
        {filteredNav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.soon ? "#" : item.href}
              onClick={item.soon ? (e) => e.preventDefault() : undefined}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 flex-1"
              style={{ color: active ? "var(--brand-400)" : "var(--text-3)" }}>
              <div className={`p-1.5 rounded-lg transition-all ${active ? "bg-brand-500/15" : ""}`}>
                <Icon size={18} />
              </div>
              <span className="text-xs truncate max-w-full text-center leading-tight" style={{ fontSize: 10 }}>
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
        <button onClick={() => logOut()}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1"
          style={{ color: "var(--text-3)" }}>
          <div className="p-1.5 rounded-lg">
            <LogOut size={18} />
          </div>
          <span style={{ fontSize: 10 }}>Out</span>
        </button>
      </nav>
    </>
  );
}
