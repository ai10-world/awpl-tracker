// app/reports/loading.tsx
export default function ReportsLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-white animate-pulse">
      <nav className="border-b border-white/5 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="h-8 w-24 bg-white/8 rounded-lg" />
          <div className="h-6 w-20 bg-white/5 rounded-full" />
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="h-4 w-20 bg-white/5 rounded mb-6" />
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-36 bg-white/8 rounded-xl" />
          <div className="h-8 w-28 bg-white/8 rounded-full" />
        </div>
        <div className="h-16 w-full bg-brand-500/8 border border-brand-500/15 rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5 h-16" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/3 border border-white/5 h-32" />
          ))}
        </div>
      </main>
    </div>
  );
}
