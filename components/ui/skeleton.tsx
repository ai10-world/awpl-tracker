// components/ui/skeleton.tsx
export function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`shimmer rounded-xl ${className}`}
      style={{ minHeight: 16, ...style }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="w-24 h-3 mb-2 rounded-full" />
        <Skeleton className="w-56 h-9 mb-3 rounded-2xl" />
        <Skeleton className="w-32 h-5 rounded-full" />
      </div>
      {/* Banner */}
      <Skeleton className="w-full h-16 rounded-2xl mb-6" />
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border-1)" }}>
            <Skeleton className="w-8 h-8 rounded-xl mb-3" />
            <Skeleton className="w-12 h-7 rounded-lg mb-1" />
            <Skeleton className="w-20 h-3 rounded-full" />
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-full h-14 rounded-2xl" />
          ))}
        </div>
        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-full h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TeamSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="w-40 h-8 rounded-2xl mb-2" />
          <Skeleton className="w-28 h-4 rounded-full" />
        </div>
        <Skeleton className="w-28 h-9 rounded-full" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="w-32 h-8 rounded-2xl mb-2" />
          <Skeleton className="w-48 h-4 rounded-full" />
        </div>
        <Skeleton className="w-28 h-9 rounded-full" />
      </div>
      <Skeleton className="w-full h-16 rounded-2xl mb-6" />
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    </div>
  );
}
