// app/activity/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="hidden lg:block fixed top-0 left-0 h-full w-60"
        style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border-1)" }} />
      <div className="lg:ml-60 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
          <Skeleton className="w-40 h-8 rounded-2xl mb-2" />
          <Skeleton className="w-56 h-4 rounded-full mb-8" />
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="w-32 h-3 rounded-full mb-3" />
                <div className="card p-4 space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="w-48 h-3 rounded mb-1" />
                        <Skeleton className="w-32 h-2.5 rounded" />
                      </div>
                      <Skeleton className="w-16 h-2.5 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
