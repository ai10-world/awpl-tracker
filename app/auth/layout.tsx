// app/auth/layout.tsx
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(255,115,10,0.5) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(255,115,10,0.4) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-display font-bold text-sm">
            A
          </div>
          <span className="font-display font-semibold text-sm tracking-wide text-white/80">
            AWPL Tracker
          </span>
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        {children}
      </div>
    </div>
  );
}
