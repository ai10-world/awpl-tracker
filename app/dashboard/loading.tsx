// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Mobile top bar skeleton */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40"
        style={{ background: "var(--surface-1)", borderBottom: "1px solid var(--border-1)" }} />

      {/* Sidebar skeleton - desktop only */}
      <div className="hidden lg:block fixed top-0 left-0 h-full w-60"
        style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border-1)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border-1)" }}>
          <div className="h-7 w-28 shimmer rounded-lg" />
        </div>
        <div className="p-3 space-y-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 shimmer rounded-xl" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="lg:ml-60 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="h-4 w-40 shimmer rounded mb-2" />
            <div className="h-9 w-72 shimmer rounded-xl mb-3" />
            <div className="h-5 w-24 shimmer rounded-full" />
          </div>

          {/* Banner */}
          <div className="h-16 shimmer rounded-2xl mb-6" />

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 shimmer rounded-2xl" style={{ animationDelay: `${i * 75}ms` }} />
            ))}
          </div>

          {/* Two column */}
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 shimmer rounded-2xl" style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
            <div className="lg:col-span-3 grid sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 shimmer rounded-2xl" style={{ animationDelay: `${i * 75}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
