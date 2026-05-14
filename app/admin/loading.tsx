// app/admin/loading.tsx
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-white animate-pulse">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="h-7 w-28 bg-white/8 rounded-lg" />
          <div className="h-6 w-24 bg-white/5 rounded-full" />
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="h-8 w-36 bg-white/8 rounded-xl mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/5 h-20" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/5 h-14" />
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/5 h-14" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
