// app/admin/loading.tsx
export default function AdminLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="hidden lg:block fixed top-0 left-0 h-full w-60 shimmer" />
      <div className="lg:ml-60 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-36 shimmer rounded-xl mb-2" />
          <div className="h-4 w-48 shimmer rounded mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 shimmer rounded-2xl" style={{ animationDelay: `${i * 75}ms` }} />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 shimmer rounded-2xl" style={{ animationDelay: `${i * 30}ms` }} />
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 shimmer rounded-2xl" style={{ animationDelay: `${i * 30}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
