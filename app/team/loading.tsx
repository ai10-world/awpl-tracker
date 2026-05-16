// app/team/loading.tsx
export default function TeamLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="hidden lg:block fixed top-0 left-0 h-full w-60 shimmer" />
      <div className="lg:ml-60 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 w-24 shimmer rounded-xl mb-2" />
              <div className="h-4 w-36 shimmer rounded" />
            </div>
            <div className="h-9 w-28 shimmer rounded-xl" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 shimmer rounded-2xl" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
