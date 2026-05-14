// app/team/loading.tsx
export default function TeamLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-white animate-pulse">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="h-7 w-28 bg-white/8 rounded-lg" />
          <div className="h-6 w-20 bg-white/5 rounded-full" />
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-44 bg-white/8 rounded-xl mb-2" />
            <div className="h-4 w-28 bg-white/5 rounded" />
          </div>
          <div className="h-9 w-28 bg-white/8 rounded-full" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/3 border border-white/5 h-36" />
          ))}
        </div>
      </main>
    </div>
  );
}
