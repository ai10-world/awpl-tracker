// app/dashboard/loading.tsx
import { DashboardSkeleton } from "@/components/ui/skeleton";
export default function DashboardLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="hidden lg:block fixed top-0 left-0 h-full w-60"
        style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border-1)" }} />
      <div className="lg:ml-60 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
