// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-white animate-pulse">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="h-7 w-28 bg-white/8 rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 bg-white/5 rounded-full" />
            <div className="h-6 w-16 bg-white/5 rounded-full" />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <div className="h-8 w-56 bg-white/8 rounded-xl mb-2" />
          <div className="h-4 w-36 bg-white/5 rounded-lg" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/8 mb-3" />
              <div className="h-7 w-10 bg-white/8 rounded mb-1" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/5 h-16" />
          ))}
        </div>

        {/* Teams */}
        <div className="h-5 w-24 bg-white/8 rounded mb-4" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/3 border border-white/5 h-28" />
          ))}
        </div>
      </main>
    </div>
  );
}
