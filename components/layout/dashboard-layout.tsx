// components/layout/dashboard-layout.tsx
import { Sidebar } from "./sidebar";

export function DashboardLayout({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: any;
}) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar profile={profile} />

      {/* Content area */}
      <div className="lg:ml-60 pt-14 lg:pt-0 pb-20 lg:pb-0 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
